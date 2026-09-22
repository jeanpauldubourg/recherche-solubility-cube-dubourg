import type { EvidenceStatus } from "./science";

export type DataClass = "documentaire" | "hypothèse DSC" | "observation expérimentale";

export const DATA_CLASSES: DataClass[] = [
  "documentaire",
  "hypothèse DSC",
  "observation expérimentale",
];

export const EVIDENCE_STATUSES: EvidenceStatus[] = [
  "documenté",
  "mesuré",
  "issu d’une base de données",
  "estimé",
  "hypothétique",
  "non documenté",
  "contradictoire",
  "à vérifier",
];

export type ZFieldKey =
  | "value"
  | "unit"
  | "temperature"
  | "composition"
  | "pH"
  | "ionicStrength"
  | "speciation"
  | "targetIon"
  | "competingIons"
  | "material"
  | "aging"
  | "method"
  | "uncertainty"
  | "verifiedAt";

export interface ZRecord {
  value: string | null;
  unit: string | null;
  temperature: string | null;
  composition: string | null;
  pH: string | null;
  ionicStrength: string | null;
  speciation: string | null;
  targetIon: string | null;
  competingIons: string | null;
  material: string | null;
  aging: string | null;
  method: string | null;
  uncertainty: string | null;
  verifiedAt: string | null;
  sources: string[];
  evidenceLevel: "A" | "B" | "C" | "D" | null;
  status: EvidenceStatus;
  dataClass: DataClass;
}

export const BLANK_Z_RECORD: ZRecord = {
  value: null,
  unit: null,
  temperature: null,
  composition: null,
  pH: null,
  ionicStrength: null,
  speciation: null,
  targetIon: null,
  competingIons: null,
  material: null,
  aging: null,
  method: null,
  uncertainty: null,
  verifiedAt: null,
  sources: [],
  evidenceLevel: null,
  status: "non documenté",
  dataClass: "documentaire",
};

export const Z_FIELD_LABELS: Record<ZFieldKey, string> = {
  value: "Valeur ou qualification",
  unit: "Unité (si pertinente)",
  temperature: "Température",
  composition: "Composition / concentration",
  pH: "pH",
  ionicStrength: "Force ionique",
  speciation: "Forme chimique / spéciation",
  targetIon: "Ion cible",
  competingIons: "Ions concurrents",
  material: "Matériau / couche",
  aging: "État de vieillissement",
  method: "Méthode",
  uncertainty: "Incertitude",
  verifiedAt: "Date de vérification",
};

export interface ZComponentDef {
  key: string;
  symbol: string;
  label: string;
  description: string;
  fields: ZFieldKey[];
}

export const Z_COMPONENTS: ZComponentDef[] = [
  {
    key: "Zeps",
    symbol: "Zε",
    label: "Réponse diélectrique",
    description:
      "Permittivité relative ou comportement diélectrique apparent, toujours rapporté à une température et à un milieu.",
    fields: [
      "value",
      "unit",
      "temperature",
      "composition",
      "material",
      "method",
      "uncertainty",
      "verifiedAt",
    ],
  },
  {
    key: "Zi",
    symbol: "Zi",
    label: "Interactions ioniques et électrostatiques",
    description:
      "Conductivité, force ionique, espèces chargées présentes. Dépend du pH, du milieu et de la spéciation.",
    fields: [
      "value",
      "unit",
      "temperature",
      "composition",
      "pH",
      "ionicStrength",
      "speciation",
      "targetIon",
      "competingIons",
      "material",
      "method",
      "uncertainty",
      "verifiedAt",
    ],
  },
  {
    key: "Zp",
    symbol: "Zp",
    label: "Polarisation électronique apparente",
    description:
      "Polarisabilité, moment dipolaire, réfraction molaire. Ne se confond pas avec la polarité au sens de l’axe Y.",
    fields: [
      "value",
      "unit",
      "temperature",
      "composition",
      "material",
      "method",
      "uncertainty",
      "verifiedAt",
    ],
  },
  {
    key: "ZL",
    symbol: "ZL",
    label: "Acidité et basicité de Lewis",
    description:
      "Caractère donneur ou accepteur de doublet (DN, AN, α/β si documentés). Qualification contextuelle, pas un rang universel.",
    fields: [
      "value",
      "unit",
      "temperature",
      "composition",
      "speciation",
      "material",
      "method",
      "uncertainty",
      "verifiedAt",
    ],
  },
  {
    key: "Zc",
    symbol: "Zc",
    label: "Coordination et complexation",
    description:
      "Denticité, constantes conditionnelles, ion cible et ions concurrents. Sans conditions, une constante n’est pas transposable.",
    fields: [
      "value",
      "unit",
      "temperature",
      "composition",
      "pH",
      "ionicStrength",
      "speciation",
      "targetIon",
      "competingIons",
      "material",
      "method",
      "uncertainty",
      "verifiedAt",
    ],
  },
  {
    key: "Zr",
    symbol: "Zr",
    label: "État du réseau vieilli",
    description:
      "Réticulation, oxydation, migration, altération du réseau. Observation de couche, non propriété de substance pure.",
    fields: ["value", "composition", "material", "aging", "method", "uncertainty", "verifiedAt"],
  },
];

export type ZProfile = Record<string, ZRecord>;

export type CompletenessStatus =
  | "Non documenté"
  | "Données partielles"
  | "Hypothèse qualitative"
  | "Documenté, conditions incomplètes"
  | "Documenté et contextualisé"
  | "Contradictoire / à vérifier";

export interface Completeness {
  status: CompletenessStatus;
  reasons: string[];
}

export function evaluateCompleteness(def: ZComponentDef, record: ZRecord): Completeness {
  const missing: string[] = [];
  def.fields.forEach((f) => {
    if (f === "value") return;
    if (!record[f]) missing.push(Z_FIELD_LABELS[f]);
  });
  if (!record.sources.length) missing.push("Source exacte");
  if (!record.evidenceLevel) missing.push("Niveau de preuve");

  const reasons = missing.length ? [`Champs non documentés : ${missing.join(", ")}.`] : [];

  if (record.status === "contradictoire" || record.status === "à vérifier") {
    return {
      status: "Contradictoire / à vérifier",
      reasons: ["Statut déclaré par l’utilisateur : " + record.status + ".", ...reasons],
    };
  }
  if (!record.value) {
    return {
      status: "Non documenté",
      reasons: ["Aucune valeur ni qualification saisie.", ...reasons],
    };
  }
  if (
    record.dataClass === "hypothèse DSC" ||
    record.status === "hypothétique" ||
    record.status === "estimé"
  ) {
    return {
      status: "Hypothèse qualitative",
      reasons: ["Valeur déclarée " + record.status + ", non mesurée.", ...reasons],
    };
  }
  if (!record.sources.length || record.status === "non documenté") {
    return { status: "Données partielles", reasons };
  }
  if (missing.length) {
    return { status: "Documenté, conditions incomplètes", reasons };
  }
  return { status: "Documenté et contextualisé", reasons: [] };
}

export const NO_AGGREGATION_NOTE =
  "Les six composantes Z sont hétérogènes (unités, méthodes et conditions différentes). Elles ne sont ni additionnées, ni moyennées, ni converties en un score Z unique.";

export const MORE_DATA_NOTE =
  "Davantage de données ne signifie pas davantage de certitude : un tableau rempli sans conditions expérimentales, sans source exacte et sans incertitude reste une hypothèse.";

export interface AxisClarification {
  xDispersion: string;
  xDeltaD: string;
  xPolarisability: string;
  xOrganicAffinity: string;
  yPolarity: string;
  yHBondDonor: string;
  yHBondAcceptor: string;
  yDeltaP: string;
  yDeltaH: string;
  yKamletTaft: string;
}

export const BLANK_AXIS: AxisClarification = {
  xDispersion: "",
  xDeltaD: "",
  xPolarisability: "",
  xOrganicAffinity: "",
  yPolarity: "",
  yHBondDonor: "",
  yHBondAcceptor: "",
  yDeltaP: "",
  yDeltaH: "",
  yKamletTaft: "",
};

export const AXIS_FIELDS: { key: keyof AxisClarification; axis: "X" | "Y"; label: string }[] = [
  { key: "xDispersion", axis: "X", label: "Dispersion (forces de London)" },
  { key: "xDeltaD", axis: "X", label: "Hansen δD — donnée de comparaison" },
  { key: "xPolarisability", axis: "X", label: "Polarisabilité" },
  { key: "xOrganicAffinity", axis: "X", label: "Affinité organique apparente (observation)" },
  { key: "yPolarity", axis: "Y", label: "Polarité (moment dipolaire, εr)" },
  { key: "yHBondDonor", axis: "Y", label: "Caractère donneur de liaison hydrogène" },
  { key: "yHBondAcceptor", axis: "Y", label: "Caractère accepteur de liaison hydrogène" },
  { key: "yDeltaP", axis: "Y", label: "Hansen δP — donnée de comparaison" },
  { key: "yDeltaH", axis: "Y", label: "Hansen δH — donnée de comparaison" },
  { key: "yKamletTaft", axis: "Y", label: "Kamlet–Taft α / β / π* si documentés" },
];
