export type EvidenceStatus =
  | "documenté"
  | "mesuré"
  | "issu d’une base de données"
  | "estimé"
  | "hypothétique"
  | "non documenté"
  | "contradictoire"
  | "à vérifier";
export interface EvidenceRecord<T = number> {
  value: T | null;
  unit: string | null;
  temperature: number | null;
  composition: string | null;
  method: string | null;
  source: string[];
  evidenceLevel: "A" | "B" | "C" | "D" | null;
  verifiedAt: string | null;
  uncertainty: string | null;
  status: EvidenceStatus;
}
export type Properties = Record<string, EvidenceRecord<number | string>>;
export interface MolecularIdentity {
  preferredName: string;
  commonName: string;
  casNumber: string | null;
  molecularFormula: string | null;
  molarMass: EvidenceRecord;
  smiles: string | null;
  inchi: string | null;
  functionalGroups: string[];
}
export interface MolecularArchitecture {
  chainType: string | null;
  nIsoDescriptor: string | null;
  branchingIndex: EvidenceRecord;
  carbonChainLength: EvidenceRecord;
  rings: string[];
  aromaticity: string | null;
  functionalGroupPosition: string | null;
  molecularShape: string | null;
  rotatableBonds: EvidenceRecord;
  molecularVolume: EvidenceRecord;
  vanDerWaalsVolume: EvidenceRecord;
  kineticDiameter: EvidenceRecord;
  accessibleSurface: EvidenceRecord;
  polarSurfaceArea: EvidenceRecord;
}
export interface Stereochemistry {
  configurationRS: string | null;
  configurationEZ: string | null;
  chirality: string | null;
  stereogenicCenters: EvidenceRecord;
  enantiomericComposition: EvidenceRecord<string>;
  conformation: string | null;
  conformationalFlexibility: string | null;
}
export type PhysicochemicalProperties = Properties;
export type SolubilityProperties = Properties;
export type AcidBaseComplexation = Properties;
export interface DSCCoordinates {
  x: number | null;
  y: number | null;
  z: number | null;
  zComponents: Properties;
  coordinateStatus: EvidenceStatus;
  uncertainty: string | null;
  sourceIds: string[];
}
export interface PeripheralFactors {
  stericArchitectureS: Properties;
  retentionK: EvidenceRecord<string>;
  evaporationEv: EvidenceRecord;
  penetrationP: EvidenceRecord;
  viscosityEta: EvidenceRecord;
  contactTimeT: EvidenceRecord;
  temperatureTx: EvidenceRecord;
  relativeHumidity: EvidenceRecord;
  observationLevel: EvidenceRecord<string>;
  deontologyToxicology: EvidenceRecord<string>;
}
export const AXES = [
  "X — Dispersion et affinité organique apparente",
  "Y — Polarité et interactions par liaisons hydrogène",
  "Z — Altitude ionique, électrostatique et électronique apparente",
];
export const CAUTION =
  "Le modèle organise des données et des hypothèses. Il ne préjuge pas du comportement réel d’une œuvre, d’une couche vieillie ou d’un système d’application.";
export const GROUPS: Record<string, string[]> = {
  Identification: [
    "Nom IUPAC",
    "Nom usuel",
    "CAS",
    "Formule brute",
    "Masse molaire",
    "SMILES",
    "InChI",
    "Pureté",
    "Teneur en eau",
    "Stabilisants",
    "Produits de dégradation",
  ],
  "Architecture, topologie et accessibilité moléculaires": [
    "Préfixe n-/iso-/sec-/tert-/neo-",
    "Chaîne linéaire ou ramifiée",
    "Cycles / hétérocycles",
    "Aromaticité",
    "Position du groupe fonctionnel",
    "Nombre de ramifications",
    "Longueur de chaîne",
    "Degré de ramification",
    "Formule développée",
  ],
  "Stéréochimie et conformation moléculaires": [
    "Configuration R/S",
    "Configuration E/Z",
    "cis/trans",
    "Centres stéréogènes",
    "Chiralité / méso",
    "Énantiomère / diastéréoisomère / racémate",
    "Pureté énantiomérique",
    "Conformation",
    "Liaisons rotatables",
    "Rigidité / flexibilité / planéité",
    "Accessibilité donneur / accepteur",
    "Dépendance au milieu",
  ],
  "Propriétés d’état": [
    "État physique",
    "Densité ρ",
    "Point de fusion",
    "Point d’ébullition",
    "Pression de vapeur Pvap",
    "Vitesse relative d’évaporation Ev",
    "Enthalpie de vaporisation",
    "Hygroscopicité",
    "Résidu non volatil",
  ],
  "Interfaces et transport": [
    "Tension superficielle γLV",
    "Tension interfaciale γSL / γ12",
    "Angle de contact θ",
    "Mouillabilité",
    "Énergie de surface",
    "Contamination de surface",
    "Viscosité dynamique η",
    "Viscosité cinématique ν",
    "Coefficient de diffusion D",
    "Diffusivité apparente",
    "Capillarité",
    "Perméabilité",
    "Rayon apparent des pores",
    "Temps de pénétration",
    "log P / log Kow",
    "Volume molaire Vm",
  ],
  "Propriétés électriques": [
    "Permittivité relative εr",
    "Moment dipolaire μd",
    "Polarisabilité αpol",
    "Conductivité κ",
    "Force ionique I",
    "Mobilité ionique",
  ],
  "Hansen, Hildebrand et Teas": [
    "Hildebrand δ",
    "Hansen δD",
    "Hansen δP",
    "Hansen δH",
    "Rayon d’interaction",
    "Teas fd",
    "Teas fp",
    "Teas fh",
    "Miscibilité à l’eau",
    "Solubilité chiffrée",
    "Activité de l’eau aw",
    "Kamlet–Taft α",
    "Kamlet–Taft β",
    "Kamlet–Taft π*",
    "DN",
    "AN",
  ],
  "Acidité, basicité et complexation": [
    "pKa",
    "pH de la solution",
    "Spéciation",
    "Forme neutre / protonée / déprotonée",
    "Tampon et capacité tampon",
    "Hydrolyse",
    "Stabilité chimique",
    "Ligand potentiel",
    "Denticité",
    "Kf",
    "log K",
    "log β",
    "Constante conditionnelle",
    "Ion cible",
    "Ions concurrents",
    "Sélectivité",
    "Réversibilité",
    "Risque d’extraction d’ions constitutifs",
  ],
  Sécurité: [
    "Point éclair",
    "Auto-inflammation",
    "Limites d’explosivité",
    "VLEP",
    "Toxicité aiguë",
    "Toxicité chronique",
    "CMR",
    "Neurotoxicité",
    "Sensibilisation",
    "Peroxydes",
    "Incompatibilités",
    "Stockage",
    "Ventilation",
    "Équipements de protection",
    "Réglementation",
    "Déchets",
  ],
  "Composantes conceptuelles de l’axe Z": [
    "Zε — Réponse diélectrique",
    "Zi — Interactions ioniques et électrostatiques",
    "Zp — Polarisation électronique apparente",
    "ZL — Acidité et basicité de Lewis",
    "Zc — Coordination et complexation",
    "Zr — État du réseau vieilli",
  ],
  "Facteurs périphériques": [
    "Sbranch — Ramification",
    "Sshape — Forme moléculaire",
    "Saccess — Accessibilité fonctionnelle",
    "Sflex — Flexibilité conformationnelle",
    "Svol — Volume et dimensions moléculaires",
    "K — Rétention et structuration",
    "Ev — Évaporation",
    "P — Pénétration apparente",
    "η — Viscosité",
    "T — Temps de contact",
    "Tx — Température",
    "HR — Humidité relative",
    "Obs — Niveau d’observation",
    "Déonto/Tox — Déontologie, toxicologie et sécurité",
  ],
};
export function downloadText(name: string, text: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
