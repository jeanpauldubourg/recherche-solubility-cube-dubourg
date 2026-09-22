import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { BLANK_Z_RECORD, EVIDENCE_STATUSES, DATA_CLASSES } from "./zscience";
import type { Properties } from "./science";
import { BLANK_AXIS, type AxisClarification, type ZProfile } from "./zscience";

export const SCHEMA_VERSION = "5.3.1";
const STORAGE_KEY = "dsc-explorer-v5-3-1";

export type SystemKind = "substance pure" | "mélange" | "système stratifié";

export interface SystemRecord {
  id: string;
  name: string;
  kind: SystemKind;
  layer: string;
  note: string;
  layers?: { id: string; name: string; note: string }[];
}

export interface ZHypothesis {
  enabled: boolean;
  x: number | null;
  y: number | null;
  z: number | null;
  envelope: number;
  rationale: string;
}

export const BLANK_HYPOTHESIS: ZHypothesis = {
  enabled: false,
  x: null,
  y: null,
  z: null,
  envelope: 20,
  rationale: "",
};

export interface FicheData {
  objet: string;
  materiau: string;
  contexte: string;
  observation: string;
  hypothese: string;
  risques: string;
  contradictions: string;
  decision: string;
}

export const EMPTY_FICHE: FicheData = {
  objet: "",
  materiau: "",
  contexte: "",
  observation: "",
  hypothese: "",
  risques: "",
  contradictions: "",
  decision: "",
};

export interface DscStoreData {
  schemaVersion: string;
  systems: SystemRecord[];
  activeSystemId: string | null;
  zProfiles: Record<string, ZProfile>;
  axes: Record<string, AxisClarification>;
  hypotheses: Record<string, ZHypothesis>;
  evidence: Record<string, Properties>;
  comparison: Record<string, Record<string, string>>;
  peerNotes: Record<string, string>;
  fiche: FicheData;
}

export const EMPTY_STORE: DscStoreData = {
  schemaVersion: SCHEMA_VERSION,
  systems: [],
  activeSystemId: null,
  zProfiles: {},
  axes: {},
  hypotheses: {},
  evidence: {},
  comparison: {},
  peerNotes: {},
  fiche: EMPTY_FICHE,
};

const strings = z.record(z.string());
const coordinate = z.number().finite().min(0).max(100).nullable();
const zRecordSchema = z
  .object({
    ...Object.fromEntries(
      Object.keys(BLANK_Z_RECORD)
        .filter((k) => !["sources", "evidenceLevel", "status", "dataClass"].includes(k))
        .map((k) => [k, z.string().nullable()]),
    ),
    sources: z.array(z.string()),
    evidenceLevel: z.enum(["A", "B", "C", "D"]).nullable(),
    status: z.enum(
      EVIDENCE_STATUSES as [
        (typeof EVIDENCE_STATUSES)[number],
        ...(typeof EVIDENCE_STATUSES)[number][],
      ],
    ),
    dataClass: z.enum(
      DATA_CLASSES as [(typeof DATA_CLASSES)[number], ...(typeof DATA_CLASSES)[number][]],
    ),
  })
  .strict();
const evidenceSchema = z.object({
  value: z.union([z.string(), z.number().finite()]).nullable(),
  unit: z.string().nullable(),
  temperature: z.number().finite().nullable(),
  composition: z.string().nullable(),
  method: z.string().nullable(),
  source: z.array(z.string()),
  evidenceLevel: z.enum(["A", "B", "C", "D"]).nullable(),
  verifiedAt: z.string().nullable(),
  uncertainty: z.string().nullable(),
  status: z.enum(
    EVIDENCE_STATUSES as [
      (typeof EVIDENCE_STATUSES)[number],
      ...(typeof EVIDENCE_STATUSES)[number][],
    ],
  ),
});
const schema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    systems: z.array(
      z.object({
        id: z.string().min(1),
        name: z.string().trim().min(1),
        kind: z.enum(["substance pure", "mélange", "système stratifié"]),
        layer: z.string(),
        note: z.string(),
        layers: z
          .array(
            z.object({ id: z.string().min(1), name: z.string().trim().min(1), note: z.string() }),
          )
          .optional(),
      }),
    ),
    activeSystemId: z.string().nullable(),
    zProfiles: z.record(z.record(zRecordSchema)),
    axes: z.record(
      z.object(Object.fromEntries(Object.keys(BLANK_AXIS).map((k) => [k, z.string()]))),
    ),
    hypotheses: z.record(
      z.object({
        enabled: z.boolean(),
        x: coordinate,
        y: coordinate,
        z: coordinate,
        envelope: z.number().finite().positive().max(100),
        rationale: z.string(),
      }),
    ),
    evidence: z.record(z.record(evidenceSchema)),
    comparison: z.record(strings),
    peerNotes: strings,
    fiche: z.object(Object.fromEntries(Object.keys(EMPTY_FICHE).map((k) => [k, z.string()]))),
  })
  .strict();
export function validateDossier(text: string): DscStoreData {
  const value = schema.parse(JSON.parse(text)) as unknown as DscStoreData;
  const ids = value.systems.map((s) => s.id);
  if (
    new Set(ids).size !== ids.length ||
    (value.activeSystemId !== null && !ids.includes(value.activeSystemId))
  )
    throw new Error("Référence de système invalide");
  for (const map of [
    value.zProfiles,
    value.axes,
    value.hypotheses,
    value.evidence,
    value.comparison,
  ])
    if (Object.keys(map).some((id) => !ids.includes(id))) throw new Error("Profil sans système");
  for (const system of value.systems) {
    const layers = system.layers ?? [];
    if (
      new Set(layers.map((l) => l.id)).size !== layers.length ||
      (system.layer && !layers.some((l) => l.id === system.layer))
    )
      throw new Error("Référence de couche invalide");
  }
  return value;
}

interface StoreApi {
  data: DscStoreData;
  ready: boolean;
  storageError: string;
  update: (patch: Partial<DscStoreData>) => void;
  activeSystem: SystemRecord | null;
  zProfile: ZProfile;
  axis: AxisClarification;
  hypothesis: ZHypothesis;
  setZProfile: (p: ZProfile) => void;
  setAxis: (a: AxisClarification) => void;
  setHypothesis: (h: ZHypothesis) => void;
  addSystem: (name: string, kind: SystemKind, layer: string) => void;
  removeSystem: (id: string) => void;
  reset: () => void;
  importJson: (text: string) => string | null;
  exportJson: () => string;
}

const StoreContext = createContext<StoreApi | null>(null);

export function DscStoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DscStoreData>(EMPTY_STORE);
  const [ready, setReady] = useState(false);

  const [storageError, setStorageError] = useState("");
  const [canSave, setCanSave] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(validateDossier(raw));
      setCanSave(true);
    } catch {
      setStorageError(
        "Sauvegarde locale illisible ou inaccessible : conservée sans écrasement. Importez un dossier valide ou réinitialisez.",
      );
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !canSave) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      setStorageError("Sauvegarde locale impossible : exportez le JSON avant de fermer.");
    }
  }, [data, ready, canSave]);

  const update = useCallback((patch: Partial<DscStoreData>) => {
    setData((d) => ({ ...d, ...patch }));
  }, []);

  const api = useMemo<StoreApi>(() => {
    const id = data.activeSystemId;
    const activeSystem = data.systems.find((s) => s.id === id) ?? null;
    const zProfile = (id && data.zProfiles[id]) || {};
    const axis = (id && data.axes[id]) || BLANK_AXIS;
    const hypothesis = (id && data.hypotheses[id]) || BLANK_HYPOTHESIS;
    return {
      data,
      ready,
      storageError,
      update,
      activeSystem,
      zProfile,
      axis,
      hypothesis,
      setZProfile: (p) => id && update({ zProfiles: { ...data.zProfiles, [id]: p } }),
      setAxis: (a) => id && update({ axes: { ...data.axes, [id]: a } }),
      setHypothesis: (h) => id && update({ hypotheses: { ...data.hypotheses, [id]: h } }),
      addSystem: (name, kind, layer) => {
        const newId = `sys-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        update({
          systems: [...data.systems, { id: newId, name, kind, layer, note: "" }],
          activeSystemId: newId,
        });
      },
      removeSystem: (rid) => {
        const systems = data.systems.filter((s) => s.id !== rid);
        const drop = <T,>(rec: Record<string, T>) =>
          Object.fromEntries(Object.entries(rec).filter(([k]) => k !== rid));
        update({
          systems,
          activeSystemId:
            data.activeSystemId === rid ? (systems[0]?.id ?? null) : data.activeSystemId,
          zProfiles: drop(data.zProfiles),
          axes: drop(data.axes),
          hypotheses: drop(data.hypotheses),
          evidence: drop(data.evidence),
          comparison: drop(data.comparison),
        });
      },
      reset: () => {
        setData({ ...EMPTY_STORE });
        setCanSave(true);
        setStorageError("");
      },
      exportJson: () => JSON.stringify({ ...data, schemaVersion: SCHEMA_VERSION }, null, 2),
      importJson: (text: string) => {
        try {
          const parsed = validateDossier(text);
          setData(parsed);
          setCanSave(true);
          setStorageError("");
          return null;
        } catch {
          return "Import refusé : JSON invalide, version incompatible, champ ou référence incorrect. Le dossier actuel est conservé.";
        }
      },
    };
  }, [data, ready, update, storageError]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useDscStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useDscStore doit être utilisé dans DscStoreProvider");
  return ctx;
}
