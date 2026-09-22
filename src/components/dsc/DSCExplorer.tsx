import { useMemo, useRef, useState, useEffect } from "react";
import { CubeV53 } from "./CubeV53";
import { ScientificPanels, PeerReview } from "./ScientificPanels";
import { SourcesV53 } from "./SourcesV53";
import { DscStoreProvider, useDscStore } from "./store";
import { DossierPanel } from "./DossierPanel";
import { scientificReport } from "./dossier";
import { CAUTION } from "./science";

type SectionId =
  | "metrologie"
  | "cube"
  | "theorie"
  | "fiche"
  | "degradation"
  | "diagnostic"
  | "cas"
  | "sources"
  | "validation"
  | "pairs";

const SECTIONS: { id: SectionId; label: string; num: number }[] = [
  { id: "metrologie", label: "Métrologie", num: 1 },
  { id: "cube", label: "Cube DSC", num: 2 },
  { id: "theorie", label: "Théorie DSC", num: 3 },
  { id: "fiche", label: "Fiche d'observation", num: 4 },
  { id: "degradation", label: "Dégradation", num: 5 },
  { id: "diagnostic", label: "Observation locale assistée", num: 6 },
  { id: "cas", label: "Cas pratiques", num: 7 },
  { id: "sources", label: "Sources", num: 8 },
  { id: "validation", label: "Validation", num: 9 },
  { id: "pairs", label: "Revue entre pairs", num: 10 },
];

export function DSCExplorer() {
  return (
    <DscStoreProvider>
      <ExplorerContent />
    </DscStoreProvider>
  );
}
function ExplorerContent() {
  const [active, setActive] = useState<SectionId>("metrologie");
  const [capturedHypothesis, setCapturedHypothesis] = useState<string>("");
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    const saved = localStorage.getItem("dsc-theme");
    if (saved === "dark" || saved === "light") setTheme(saved);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="methodology">
        <p>Observation → Hypothèses → Contradictions → Vérification → Recommandation prudente.</p>
        <button
          onClick={() => {
            const next = theme === "light" ? "dark" : "light";
            setTheme(next);
            localStorage.setItem("dsc-theme", next);
          }}
        >
          {theme === "light" ? "☾ Sombre" : "☀ Clair"}
        </button>
        <button
          onClick={() => {
            const next = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            setTheme(next);
            localStorage.setItem("dsc-theme", next);
          }}
        >
          Thème système
        </button>
      </div>
      <Nav active={active} onChange={setActive} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {active === "metrologie" && <Metrologie />}
        <div hidden={active !== "cube"}>
          <DossierPanel />
          <CubeV53
            onCapture={(txt) => {
              setCapturedHypothesis(txt);
              setActive("fiche");
            }}
          />
        </div>
        <div hidden={active !== "theorie"}>
          <Theorie />
          <ScientificPanels />
        </div>
        <div hidden={active !== "fiche"}>
          <Fiche capturedHypothesis={capturedHypothesis} />
        </div>
        {active === "degradation" && <Degradation />}
        <div hidden={active !== "diagnostic"}>
          <Diagnostic />
        </div>
        {active === "cas" && <CasPratiques />}
        <div hidden={active !== "sources"}>
          <SourcesV53 />
        </div>
        <div hidden={active !== "validation"}>
          <Validation />
        </div>
        <div hidden={active !== "pairs"}>
          <PeerReview />
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ==================== Header / Nav ====================
function Header() {
  return (
    <header className="border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h1 className="truncate font-serif text-2xl font-semibold sm:text-3xl">
            DSC Explorer <span style={{ color: "var(--gold)" }}>V5.3.1</span>
          </h1>
          <p className="mt-1 text-xs text-primary-foreground/70 sm:text-sm">
            Cube tridimensionnel de raisonnement stratigraphique et physicochimique en
            conservation-restauration.
          </p>
        </div>
        <span
          className="shrink-0 rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest sm:text-xs"
          style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
        >
          Local · v5.3.1
        </span>
      </div>
    </header>
  );
}

function Nav({ active, onChange }: { active: SectionId; onChange: (s: SectionId) => void }) {
  return (
    <nav className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <ul className="flex flex-wrap gap-1 py-2">
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <button
                  onClick={() => onChange(s.id)}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <span className="mr-1.5 text-xs opacity-60">{s.num}.</span>
                  {s.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-border py-8">
      <div className="mx-auto max-w-5xl px-4 text-center text-xs text-muted-foreground sm:px-6">
        DSC Explorer V5.3.1 · Dossier sauvegardé localement ; conservez aussi un export JSON. Images
        traitées localement.
        <br />
        {CAUTION}
      </div>
    </footer>
  );
}

// ==================== Shared primitives ====================
function SectionTitle({ n, title, kicker }: { n: number; title: string; kicker?: string }) {
  return (
    <div className="mb-6 border-b border-border pb-4">
      <div className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--gold)" }}>
        Section {n.toString().padStart(2, "0")}
      </div>
      <h2 className="mt-1 font-serif text-3xl font-semibold text-primary sm:text-4xl">{title}</h2>
      {kicker && <p className="mt-2 text-sm text-muted-foreground">{kicker}</p>}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-card p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function Callout({
  children,
  tone = "gold",
}: {
  children: React.ReactNode;
  tone?: "gold" | "warn" | "muted";
}) {
  const styles: Record<string, string> = {
    gold: "border-l-4 bg-secondary/50",
    warn: "border-l-4 bg-destructive/5",
    muted: "border-l-4 bg-muted",
  };
  const borderColor =
    tone === "warn" ? "var(--warn)" : tone === "muted" ? "var(--muted-foreground)" : "var(--gold)";
  return (
    <div
      className={`rounded-md p-4 text-sm ${styles[tone]}`}
      style={{ borderLeftColor: borderColor }}
    >
      {children}
    </div>
  );
}

// ==================== 1. Métrologie ====================
function Metrologie() {
  const items = [
    {
      k: "Image",
      d: "Photographie sous lumière contrôlée, cadrage stable, absence d'ombres portées non documentées.",
    },
    {
      k: "Échelle",
      d: "Toujours inclure une échelle métrique et une charte colorimétrique dans le cadre.",
    },
    {
      k: "Lumière",
      d: "Température de couleur constante ; noter la source (jour, LED, UV, rasante).",
    },
    {
      k: "Température",
      d: "Ambiante et de surface si pertinent ; toute mesure destructive doit être justifiée.",
    },
    {
      k: "Humidité relative",
      d: "Consigner HR au moment de l'observation ; les matériaux hygroscopiques réagissent aux fluctuations.",
    },
    { k: "Localisation", d: "Situer chaque prise (zone, coordonnées sur schéma, orientation)." },
    {
      k: "Incertitude",
      d: "Toute mesure comporte une plage d'incertitude à documenter, non un chiffre isolé.",
    },
  ];
  return (
    <section>
      <SectionTitle n={1} title="Métrologie" kicker="Cadre d'observation avant toute hypothèse." />
      <Callout tone="gold">
        <strong>L'impression visuelle oriente ; elle ne valide pas.</strong>
      </Callout>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((i) => (
          <Card key={i.k}>
            <div className="font-serif text-lg font-semibold text-primary">{i.k}</div>
            <p className="mt-1 text-sm text-muted-foreground">{i.d}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

// ==================== 3. Théorie ====================
function Theorie() {
  return (
    <section>
      <SectionTitle n={3} title="Théorie DSC" kicker="Cadrage épistémologique du modèle." />
      <Card>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Le <strong className="text-foreground">Dubourg Solubility Cube</strong> est une hypothèse
          opératoire destinée à structurer le raisonnement sur les stratigraphies complexes. Il ne
          remplace ni les paramètres de solubilité existants, ni les tests contrôlés, ni
          l'observation sous grossissement, ni la validation scientifique.
        </p>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="font-serif text-xl font-semibold text-primary">Axes X / Y</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Affinité, dispersion, polarité et liaisons hydrogène comme repères de discussion —
            jamais comme catégories fermées.
          </p>
        </Card>
        <Card>
          <h3 className="font-serif text-xl font-semibold text-primary">Axe Z</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Interaction ionique, comportement de Lewis, réponse diélectrique apparente : à définir
            et documenter pour chaque cas.
          </p>
        </Card>
        <Card className="md:col-span-2">
          <h3 className="font-serif text-xl font-semibold text-primary">
            Paramètres K · Ev · P · T
          </h3>
          <ul className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
            <li>
              <strong className="text-foreground">K</strong> — rétention apparente
            </li>
            <li>
              <strong className="text-foreground">Ev</strong> — évaporation
            </li>
            <li>
              <strong className="text-foreground">P</strong> — pénétration
            </li>
            <li>
              <strong className="text-foreground">T</strong> — temps de contact
            </li>
          </ul>
        </Card>
      </div>
    </section>
  );
}

// ==================== 4. Fiche d'observation ====================
type FicheData = {
  objet: string;
  materiau: string;
  contexte: string;
  observation: string;
  hypothese: string;
  risques: string;
  contradictions: string;
  decision: string;
};

function Fiche({ capturedHypothesis }: { capturedHypothesis: string }) {
  const store = useDscStore();
  const data = store.data.fiche;
  const setData = (fiche: FicheData) => store.update({ fiche });
  const [showReport, setShowReport] = useState(false);
  const report = scientificReport(store.data);
  void capturedHypothesis;

  const update = (k: keyof FicheData) => (v: string) => setData({ ...data, [k]: v });

  const markdown = useMemo(() => buildMarkdown(data) + "\n\n" + report, [data, report]);

  const download = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `fiche-dsc-${Date.now()}.md`;
    a.click();
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
    } catch {
      /* noop */
    }
  };
  const printReport = () => window.print();

  return (
    <section>
      <SectionTitle
        n={4}
        title="Fiche d'observation"
        kicker="Note de travail — hypothèse opératoire, non validation."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Objet / œuvre" value={data.objet} onChange={update("objet")} />
        <Field label="Matériau principal" value={data.materiau} onChange={update("materiau")} />
        <Field
          label="Contexte matériel"
          value={data.contexte}
          onChange={update("contexte")}
          textarea
        />
        <Field
          label="Observation initiale"
          value={data.observation}
          onChange={update("observation")}
          textarea
        />
        <Field
          label="Hypothèse DSC"
          value={data.hypothese}
          onChange={update("hypothese")}
          textarea
        />
        <Field
          label="Risques identifiés"
          value={data.risques}
          onChange={update("risques")}
          textarea
        />
        <Field
          label="Contradictions à vérifier"
          value={data.contradictions}
          onChange={update("contradictions")}
          textarea
        />
        <Field label="Décision" value={data.decision} onChange={update("decision")} textarea />
      </div>

      <pre className="whitespace-pre-wrap break-words text-xs">{report}</pre>
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setShowReport(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Générer rapport
        </button>
        <button
          onClick={download}
          className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-secondary"
        >
          Télécharger .md
        </button>
        <button
          onClick={copy}
          className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-secondary"
        >
          Copier
        </button>
        <button
          onClick={printReport}
          className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-secondary"
        >
          PDF / Impression
        </button>
      </div>

      {showReport && (
        <Card className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold text-primary">Aperçu rapport</h3>
            <button
              onClick={() => setShowReport(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Fermer
            </button>
          </div>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-4 font-mono text-xs text-foreground">
            {markdown}
          </pre>
        </Card>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  const base =
    "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className={base}
        />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={base} />
      )}
    </label>
  );
}

function buildMarkdown(d: FicheData) {
  const date = new Date().toISOString().slice(0, 10);
  return `# Rapport d'analyse et de pré-intervention

**Date :** ${date}
**Objet / œuvre :** ${d.objet || "—"}
**Matériau principal :** ${d.materiau || "—"}
**Contexte :** ${d.contexte || "—"}

## 1. Observation

${d.observation || "_Décrire uniquement les faits visibles._"}

## 2. Hypothèse DSC

${d.hypothese || "_Coordonnées et interprétation prudente._"}

## 3. Évaluation des risques

${d.risques || "_Décapage, gonflement, blanchiment, migration, perte de cohésion._"}

## 4. Contradiction

${d.contradictions || "_Tests croisés, observation inverse, doute._"}

## 5. Validation & décision

${d.decision || "_Décision finale prudente._"}

---

*Ce rapport est une note de travail basée sur une hypothèse opératoire. Il ne constitue pas une validation scientifique finale. Toute intervention doit rester documentée, contrôlée, réversible si possible, et validée par un professionnel qualifié.*
`;
}

// ==================== 5. Dégradation ====================
function Degradation() {
  const risks = [
    "Décapage irréversible d'un glacis, d'une patine ou d'un voile peint.",
    "Confusion stratigraphique entre original et surpeint.",
    "Effets différés : gonflement, migration, blanchiment, perte de cohésion.",
    "Surconfiance IA ou automatisation non validée.",
  ];
  return (
    <section>
      <SectionTitle n={5} title="Dégradation" kicker="Risques opératoires à anticiper." />
      <div className="grid gap-3 sm:grid-cols-2">
        {risks.map((r) => (
          <Card key={r} className="border-l-4">
            <div className="flex gap-3">
              <span
                className="mt-1 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: "var(--warn)" }}
              />
              <p className="text-sm text-foreground">{r}</p>
            </div>
          </Card>
        ))}
      </div>
      <Callout tone="warn">
        <strong>Rappel :</strong> aucune décision d'intervention ne doit reposer sur une seule
        observation, ni sur une seule modalité d'analyse.
      </Callout>
    </section>
  );
}

// ==================== 6. Diagnostic local ====================
function Diagnostic() {
  const [img, setImg] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const items = [
    "Support",
    "Couche picturale",
    "Dépôts",
    "Fissures",
    "Soulèvements",
    "Lacunes",
    "Surpeints possibles",
    "Zones à observer sous grossissement",
  ];
  const onFile = (f: File | null) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImg(String(reader.result));
    reader.readAsDataURL(f);
  };

  return (
    <section>
      <SectionTitle
        n={6}
        title="Observation locale assistée"
        kicker="Observation humaine, sans diagnostic automatique ; image traitée dans ce navigateur."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-background p-8 text-center">
            <span className="text-sm text-muted-foreground">
              Cliquer pour choisir une image locale
            </span>
            <span className="text-xs text-muted-foreground/70">
              L'image reste dans votre navigateur.
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {img && (
            <div className="mt-4 overflow-hidden rounded-md border border-border bg-background">
              <img src={img} alt="Aperçu local" className="max-h-96 w-full object-contain" />
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-serif text-lg font-semibold text-primary">Grille d'observation</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Cocher ce qui a été effectivement observé.
          </p>
          <ul className="mt-3 space-y-2">
            {items.map((i) => (
              <li key={i}>
                <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2 hover:bg-secondary">
                  <input
                    type="checkbox"
                    checked={!!checks[i]}
                    onChange={(e) => setChecks({ ...checks, [i]: e.target.checked })}
                    className="h-4 w-4 accent-[var(--gold)]"
                  />
                  <span className="text-sm">{i}</span>
                </label>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}

// ==================== 7. Cas pratiques ====================
function CasPratiques() {
  const cas = [
    {
      titre: "Sainte Cécile",
      meta: "Le Mans, 1633 — Charles Hoyau",
      desc: "Stratigraphie complexe, dégagement prudent, quatre surpeints identifiés.",
    },
    {
      titre: "Saint Joseph",
      meta: "Terre cuite polychrome mancelle",
      desc: "Observation, mémoire matérielle, lecture stratigraphique.",
    },
    {
      titre: "Quatre Victoires",
      meta: "Versailles — sculpture pierre",
      desc: "Restauration, restitution et documentation d'un ensemble monumental.",
    },
    {
      titre: "Poupée malinoise",
      meta: "Polychromie conservée",
      desc: "Risque de décapage patrimonial — valeur historique de la couche vernissée.",
    },
  ];
  return (
    <section>
      <SectionTitle
        n={7}
        title="Cas pratiques"
        kicker="Références de discussion — non protocoles."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {cas.map((c) => (
          <Card key={c.titre}>
            <div className="text-xs uppercase tracking-widest" style={{ color: "var(--gold)" }}>
              {c.meta}
            </div>
            <h3 className="mt-1 font-serif text-xl font-semibold text-primary">{c.titre}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
            <p className="mt-2 text-xs text-destructive">
              Notice héritée V5.2 — attribution, datation et interprétation non vérifiées ; dossier
              documentaire non fourni.
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}

// ==================== 9. Validation ====================
function Validation() {
  const rows = [
    {
      el: "Observation visuelle",
      statut: "Requis",
      usage: "Point de départ",
      action: "Photographier + documenter",
    },
    {
      el: "Grossissement",
      statut: "Recommandé",
      usage: "Lecture stratigraphique",
      action: "Loupe / binoculaire",
    },
    {
      el: "Test localisé",
      statut: "Contrôlé",
      usage: "Confirmer/infirmer hypothèse",
      action: "Zone masquée, réversible",
    },
    {
      el: "Contradiction recherchée",
      statut: "Impératif",
      usage: "Éviter le biais de confirmation",
      action: "Tenter de réfuter",
    },
    {
      el: "Documentation photographique",
      statut: "Requis",
      usage: "Traçabilité",
      action: "Avant / pendant / après",
    },
    {
      el: "Validation humaine",
      statut: "Impératif",
      usage: "Décision finale",
      action: "Professionnel qualifié",
    },
  ];
  const [checkedContradiction, setCheckedContradiction] = useState(false);

  return (
    <section>
      <SectionTitle n={9} title="Validation" kicker="Matrice de contrôle avant décision." />

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Élément</th>
              <th className="px-3 py-2 text-left">Statut</th>
              <th className="px-3 py-2 text-left">Usage</th>
              <th className="px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.el} className="border-t border-border">
                <td className="px-3 py-2 font-medium text-foreground">{r.el}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.statut}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.usage}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card className="mt-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={checkedContradiction}
            onChange={(e) => setCheckedContradiction(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[var(--gold)]"
          />
          <span className="text-sm">
            <strong>J'ai cherché une contradiction</strong> à mon hypothèse (test croisé,
            observation inverse, doute argumenté).
          </span>
        </label>

        <div className="mt-4">
          {checkedContradiction ? (
            <Callout tone="gold">
              Étape de contradiction déclarée. La décision reste sous responsabilité humaine et
              documentée.
            </Callout>
          ) : (
            <Callout tone="warn">
              <strong>Validation incomplète :</strong> l'hypothèse n'a pas encore été contredite.
            </Callout>
          )}
        </div>
      </Card>
    </section>
  );
}
