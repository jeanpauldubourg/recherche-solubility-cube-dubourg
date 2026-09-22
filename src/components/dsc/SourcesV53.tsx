import { useMemo, useState } from "react";
import { downloadText } from "./science";
const catalog = [
  [
    "IUPAC Gold Book",
    "IUPAC",
    "Terminologie, constitution, stéréochimie, Lewis",
    "https://goldbook.iupac.org/",
  ],
  [
    "NIST Chemistry WebBook",
    "NIST",
    "CAS, propriétés thermodynamiques, isomères",
    "https://webbook.nist.gov/chemistry/",
  ],
  [
    "Hansen Solubility Parameters",
    "Hansen",
    "δD, δP, δH, limites d’interprétation",
    "https://www.hansen-solubility.com/",
  ],
  ["Fractions de Teas", "À identifier", "fd, fp, fh ; publication originale à retrouver", ""],
  [
    "Getty Conservation Institute",
    "Getty",
    "Conservation, nettoyage, méthodologie",
    "https://www.getty.edu/conservation/",
  ],
  ["ICCROM", "ICCROM", "Méthodologie, formation", "https://www.iccrom.org/"],
  ["ICOM-CC", "ICOM-CC", "Éthique, conservation-restauration", "https://www.icom-cc.org/"],
  [
    "AIC / CoOL",
    "AIC",
    "Solubilité, documentation professionnelle",
    "https://cool.culturalheritage.org/",
  ],
  [
    "Charte de Venise / Charte de Cracovie",
    "ICOMOS",
    "Doctrine ; éditions exactes à identifier",
    "https://www.icomos.org/",
  ],
  [
    "ECHA et fiches de données de sécurité",
    "ECHA",
    "Dangers, VLEP, stockage, réglementation",
    "https://echa.europa.eu/",
  ],
].map((r, i) => ({
  id: `source-${i}`,
  title: r[0],
  author: r[1],
  keywords: r[2],
  url: r[3],
  year: "",
  verifiedAt: "",
  level: "D",
  type: "source non vérifiée",
  citation: "",
  substance: "",
  property: "",
  cas: "",
  material: "",
}));
const types = [
  "source scientifique primaire",
  "base physicochimique institutionnelle",
  "norme",
  "charte",
  "publication institutionnelle",
  "ouvrage académique",
  "guide technique",
  "étude de cas",
  "retour d’expérience d’atelier",
  "hypothèse DSC",
  "illustration",
  "source non vérifiée",
];
const normalize = (x: string) =>
  x
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function SourcesV53() {
  const [sources, setSources] = useState(catalog);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("title");
  const results = useMemo(
    () =>
      sources
        .filter(
          (s) =>
            (!filter || s.type === filter) &&
            (!level || s.level === level) &&
            normalize(Object.values(s).join(" ")).includes(normalize(query)),
        )
        .sort((a, b) => {
          const key = sort === "title-desc" ? "title" : (sort as keyof typeof a);
          return (
            a[key].localeCompare(b[key], "fr", { numeric: true }) * (sort === "title-desc" ? -1 : 1)
          );
        }),
    [sources, query, filter, level, sort],
  );
  return (
    <section className="science-panel">
      <h2>Sources & traçabilité</h2>
      <p>
        Répertoires de recherche, non références validées de valeurs. Une page d’accueil ne remplace
        pas une citation exacte.
      </p>
      <p>
        Le niveau de preuve qualifie la solidité documentaire de la référence. Il ne constitue pas
        une validation scientifique automatique du DSC.
      </p>
      <div className="source-filters">
        <label>
          Rechercher
          <input
            type="search"
            placeholder="Titre, auteur, CAS, substance, propriété…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          Type
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Tous les types</option>
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Niveau
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">Tous</option>
            {["A", "B", "C", "D"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Trier
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {[
              ["title", "Titre A–Z"],
              ["title-desc", "Titre Z–A"],
              ["author", "Auteur"],
              ["year", "Année"],
              ["verifiedAt", "Date de vérification"],
              ["level", "Preuve"],
              ["property", "Propriété"],
            ].map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p aria-live="polite">{results.length} résultat(s)</p>
      {!results.length && <p>Aucune référence ne correspond à votre recherche.</p>}
      {results.map((s) => (
        <details key={s.id}>
          <summary>
            {s.title} · {s.level} · {s.verifiedAt || "Non vérifié"}
          </summary>
          <p>{s.keywords}</p>
          {s.url && (
            <a href={s.url} target="_blank" rel="noreferrer">
              Ouvrir la ressource ↗
            </a>
          )}
          <div className="source-filters">
            {(
              [
                "title",
                "author",
                "citation",
                "substance",
                "property",
                "cas",
                "material",
                "year",
                "verifiedAt",
              ] as const
            ).map((k, i) => (
              <label key={k}>
                {
                  [
                    "Titre",
                    "Auteur / institution",
                    "Citation exacte / DOI / page",
                    "Substance",
                    "Propriété",
                    "CAS",
                    "Matériau",
                    "Année",
                    "Date de vérification",
                  ][i]
                }
                <input
                  type={k === "verifiedAt" ? "date" : "text"}
                  value={s[k]}
                  onChange={(e) =>
                    setSources(
                      sources.map((x) => (x.id === s.id ? { ...x, [k]: e.target.value } : x)),
                    )
                  }
                />
              </label>
            ))}
            <label>
              Type
              <select
                value={s.type}
                onChange={(e) =>
                  setSources(
                    sources.map((x) => (x.id === s.id ? { ...x, type: e.target.value } : x)),
                  )
                }
              >
                {types.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Niveau de preuve
              <select
                value={s.level}
                onChange={(e) =>
                  setSources(
                    sources.map((x) => (x.id === s.id ? { ...x, level: e.target.value } : x)),
                  )
                }
              >
                {["A", "B", "C", "D"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
        </details>
      ))}
      <div className="tool-row">
        <button
          onClick={() =>
            setSources([
              ...sources,
              {
                ...catalog[0],
                id: crypto.randomUUID(),
                title: "Nouvelle référence",
                author: "",
                keywords: "",
                url: "",
              },
            ])
          }
        >
          Ajouter une référence
        </button>
        <button
          onClick={() =>
            downloadText("sources-dsc.json", JSON.stringify(sources, null, 2), "application/json")
          }
        >
          Exporter JSON
        </button>
      </div>
      <p>
        A : donnée primaire, norme, base institutionnelle ou publication précisément référencée. B :
        synthèse académique ou guide reconnu. C : étude de cas documentée. D : hypothèse,
        illustration, estimation ou référence à vérifier.
      </p>
    </section>
  );
}
