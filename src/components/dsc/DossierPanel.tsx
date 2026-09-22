import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDscStore, type SystemKind } from "./store";
import {
  BLANK_Z_RECORD,
  Z_COMPONENTS,
  Z_FIELD_LABELS,
  DATA_CLASSES,
  EVIDENCE_STATUSES,
  AXIS_FIELDS,
  evaluateCompleteness,
  NO_AGGREGATION_NOTE,
  MORE_DATA_NOTE,
} from "./zscience";
import { downloadText } from "./science";
import { positioned } from "./dossier";
export function DossierPanel() {
  const store = useDscStore();
  const {
    data,
    update,
    activeSystem: system,
    zProfile,
    setZProfile,
    hypothesis: h,
    setHypothesis,
    axis,
    setAxis,
  } = store;
  const [name, setName] = useState("");
  const [kind, setKind] = useState<SystemKind>("substance pure");
  const [layer, setLayer] = useState("");
  const [message, setMessage] = useState("");
  const editSystem = (patch: Partial<NonNullable<typeof system>>) => {
    if (system)
      update({ systems: data.systems.map((s) => (s.id === system.id ? { ...s, ...patch } : s)) });
  };
  return (
    <section className="science-panel">
      <h2>Dossier scientifique V5.3.1</h2>
      {store.storageError && <p role="alert">{store.storageError}</p>}
      <div className="tool-row">
        <Button
          onClick={() => downloadText("dsc-v5.3.1.json", store.exportJson(), "application/json")}
        >
          Exporter dossier JSON
        </Button>
        <label>
          Importer dossier JSON
          <input
            type="file"
            accept=".json,application/json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                if (file.size > 10_000_000) throw new Error();
                setMessage(store.importJson(await file.text()) ?? "Dossier importé.");
              } catch {
                setMessage("Lecture impossible ou fichier trop volumineux (10 Mo maximum).");
              }
              e.target.value = "";
            }}
          />
        </label>
        <Button
          variant="outline"
          onClick={() => {
            if (window.confirm("Effacer le dossier local ? Exportez-le auparavant.")) store.reset();
          }}
        >
          Réinitialiser le dossier
        </Button>
      </div>
      <p role="status">{message}</p>
      <label>
        Nouveau système
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Nature
        <select value={kind} onChange={(e) => setKind(e.target.value as SystemKind)}>
          {["substance pure", "mélange", "système stratifié"].map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </label>
      <Button
        disabled={!name.trim() || !store.ready}
        onClick={() => {
          store.addSystem(name.trim(), kind, "");
          setName("");
        }}
      >
        Créer le système
      </Button>
      <label>
        Système actif
        <select
          value={data.activeSystemId ?? ""}
          onChange={(e) => update({ activeSystemId: e.target.value || null })}
        >
          <option value="">Aucun</option>
          {data.systems.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      {system && (
        <>
          <label>
            Nom du système
            <input
              value={system.name}
              onChange={(e) => editSystem({ name: e.target.value })}
              onBlur={() => {
                if (!system.name.trim()) editSystem({ name: "Système sans nom" });
              }}
            />
          </label>
          <label>
            Nature du système
            <select
              value={system.kind}
              onChange={(e) => editSystem({ kind: e.target.value as SystemKind })}
            >
              {["substance pure", "mélange", "système stratifié"].map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
          <label>
            Contexte du système
            <textarea value={system.note} onChange={(e) => editSystem({ note: e.target.value })} />
          </label>
          <Button
            variant="outline"
            onClick={() => {
              if (window.confirm("Supprimer ce système et ses données ?"))
                store.removeSystem(system.id);
            }}
          >
            Supprimer le système
          </Button>
          <h3>Couches du système</h3>
          <label>
            Nouvelle couche
            <input value={layer} onChange={(e) => setLayer(e.target.value)} />
          </label>
          <Button
            disabled={!layer.trim()}
            onClick={() => {
              editSystem({
                layers: [
                  ...(system.layers ?? []),
                  { id: crypto.randomUUID(), name: layer.trim(), note: "" },
                ],
              });
              setLayer("");
            }}
          >
            Ajouter la couche
          </Button>
          {(system.layers ?? []).map((l) => (
            <div key={l.id} className="property-list">
              <label>
                Nom de couche
                <input
                  value={l.name}
                  onChange={(e) =>
                    editSystem({
                      layers: system.layers?.map((x) =>
                        x.id === l.id ? { ...x, name: e.target.value } : x,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Observation de couche
                <textarea
                  value={l.note}
                  onChange={(e) =>
                    editSystem({
                      layers: system.layers?.map((x) =>
                        x.id === l.id ? { ...x, note: e.target.value } : x,
                      ),
                    })
                  }
                />
              </label>
              <Button
                variant="outline"
                onClick={() =>
                  editSystem({
                    layers: system.layers?.filter((x) => x.id !== l.id),
                    layer: system.layer === l.id ? "" : system.layer,
                  })
                }
              >
                Supprimer la couche
              </Button>
            </div>
          ))}
          <label>
            Couche étudiée
            <select value={system.layer} onChange={(e) => editSystem({ layer: e.target.value })}>
              <option value="">Système entier / non renseignée</option>
              {system.layers?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <p>
            Le profil et l’hypothèse appartiennent au système actif ; la couche étudiée précise leur
            contexte, sans transfert automatique de propriétés.
          </p>
          <h3>Six composantes Z indépendantes</h3>
          <p>{NO_AGGREGATION_NOTE}</p>
          {Z_COMPONENTS.map((def) => {
            const r = zProfile[def.key] ?? { ...BLANK_Z_RECORD };
            const edit = (patch: Partial<typeof r>) =>
              setZProfile({ ...zProfile, [def.key]: { ...r, ...patch } });
            const completeness = evaluateCompleteness(def, r);
            return (
              <details key={def.key}>
                <summary>
                  {def.symbol} — {def.label} · {completeness.status}
                </summary>
                <p>{def.description}</p>
                <label>
                  Classe de donnée
                  <select
                    value={r.dataClass}
                    onChange={(e) => edit({ dataClass: e.target.value as typeof r.dataClass })}
                  >
                    {DATA_CLASSES.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                {def.fields.map((f) => (
                  <label key={f}>
                    {Z_FIELD_LABELS[f]}
                    <input
                      type={f === "verifiedAt" ? "date" : "text"}
                      value={r[f] ?? ""}
                      placeholder="Non renseigné"
                      onChange={(e) => edit({ [f]: e.target.value || null })}
                    />
                  </label>
                ))}
                <label>
                  Sources exactes (DOI, URL, page, tableau)
                  <textarea
                    value={r.sources.join("\n")}
                    onChange={(e) => edit({ sources: e.target.value.split("\n").filter(Boolean) })}
                  />
                </label>
                <label>
                  Statut documentaire
                  <select
                    value={r.status}
                    onChange={(e) => edit({ status: e.target.value as typeof r.status })}
                  >
                    {EVIDENCE_STATUSES.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Niveau de preuve
                  <select
                    value={r.evidenceLevel ?? ""}
                    onChange={(e) =>
                      edit({ evidenceLevel: (e.target.value || null) as typeof r.evidenceLevel })
                    }
                  >
                    <option value="">Non renseigné</option>
                    {["A", "B", "C", "D"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <p>{completeness.status} — complétude documentaire, non validation scientifique.</p>
                {completeness.reasons.map((v) => (
                  <p key={v}>{v}</p>
                ))}
              </details>
            );
          })}
          <p>{MORE_DATA_NOTE}</p>
          <details>
            <summary>Clarification des axes X et Y</summary>
            {AXIS_FIELDS.map((f) => (
              <label key={f.key}>
                {f.label}
                <input
                  value={axis[f.key]}
                  onChange={(e) => setAxis({ ...axis, [f.key]: e.target.value })}
                />
              </label>
            ))}
          </details>
          <details open>
            <summary>Hypothèse DSC explicite</summary>
            <label>
              <input
                type="checkbox"
                checked={h.enabled}
                onChange={(e) => setHypothesis({ ...h, enabled: e.target.checked })}
              />
              Sélectionner cette hypothèse DSC
            </label>
            <p>
              Repères graphiques sans unité physique, indépendants des six composantes Z et sans
              conversion depuis Hansen ou Teas.
            </p>
            {(["x", "y", "z"] as const).map((k) => (
              <label key={k}>
                Centre conceptuel {k.toUpperCase()}
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={h[k] ?? ""}
                  onChange={(e) =>
                    setHypothesis({
                      ...h,
                      [k]:
                        e.target.value === ""
                          ? null
                          : Math.max(0, Math.min(100, Number(e.target.value))),
                    })
                  }
                />
              </label>
            ))}
            <label>
              Demi-plage d’incertitude graphique (0–100)
              <input
                type="number"
                min="1"
                max="100"
                value={h.envelope}
                onChange={(e) =>
                  setHypothesis({
                    ...h,
                    envelope: Math.max(1, Math.min(100, Number(e.target.value))),
                  })
                }
              />
            </label>
            <label>
              Justification et limites de l’hypothèse
              <textarea
                value={h.rationale}
                onChange={(e) => setHypothesis({ ...h, rationale: e.target.value })}
              />
            </label>
            <p role="status">
              {positioned(h)
                ? "Hypothèse DSC — enveloppe incertaine, non mesure"
                : "Position Z indéterminée"}
            </p>
          </details>
        </>
      )}
    </section>
  );
}
