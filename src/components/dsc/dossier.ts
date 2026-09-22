import type { DscStoreData, ZHypothesis } from "./store";
import { BLANK_HYPOTHESIS } from "./store";
import {
  BLANK_Z_RECORD,
  Z_COMPONENTS,
  Z_FIELD_LABELS,
  evaluateCompleteness,
  NO_AGGREGATION_NOTE,
  type ZFieldKey,
} from "./zscience";
import { CAUTION } from "./science";
export function positioned(h: ZHypothesis) {
  return (
    h.enabled &&
    h.rationale.trim().length > 0 &&
    [h.x, h.y, h.z].every((v) => v !== null && Number.isFinite(v) && v >= 0 && v <= 100) &&
    h.envelope > 0
  );
}
export function scientificReport(data: DscStoreData) {
  const system = data.systems.find((s) => s.id === data.activeSystemId);
  if (!system)
    return "Position Z indéterminée — aucun système sélectionné.\n" + NO_AGGREGATION_NOTE;
  const h = data.hypotheses[system.id] ?? BLANK_HYPOTHESIS;
  return [
    `## État scientifique V5.3.1`,
    `Système : ${system.name} — ${system.kind}`,
    `Couche étudiée : ${system.layers?.find((l) => l.id === system.layer)?.name ?? "Non renseignée"}`,
    ...(system.layers ?? []).map((l) => `Couche : ${l.name} — ${l.note || "Non documenté"}`),
    positioned(h)
      ? `Hypothèse DSC explicite — enveloppe conceptuelle, non mesure. Centre graphique X=${h.x}, Y=${h.y}, Z=${h.z} ; demi-plage ±${h.envelope} (bornée à 0–100, sans unité physique).`
      : "Position Z indéterminée",
    `Justification : ${h.rationale || "Non renseignée"}`,
    NO_AGGREGATION_NOTE,
    ...Z_COMPONENTS.map((def) => {
      const r = data.zProfiles[system.id]?.[def.key] ?? BLANK_Z_RECORD;
      const c = evaluateCompleteness(def, r);
      return [
        `### ${def.symbol} — ${def.label}`,
        `${r.dataClass} | ${r.status} | ${c.status}`,
        ...def.fields.map((f) => `${Z_FIELD_LABELS[f as ZFieldKey]} : ${r[f] || "Non renseigné"}`),
        `Sources exactes : ${r.sources.join(" ; ") || "Non documenté"}`,
        `Niveau de preuve : ${r.evidenceLevel ?? "Non renseigné"}`,
        ...c.reasons,
      ].join("\n");
    }),
    `Axes X/Y : ${JSON.stringify(data.axes[system.id] ?? {})}`,
    `Comparaison Teas/VRS (sans conversion) : ${JSON.stringify(data.comparison[system.id] ?? {})}`,
    CAUTION,
  ].join("\n\n");
}
