import { useState } from "react";
import { CAUTION, GROUPS, downloadText, type EvidenceRecord, type Properties } from "./science";
import { useDscStore } from "./store";

export function ScientificPanels() {
  const store = useDscStore();
  const system = store.activeSystem;
  const name = system?.name ?? "";
  const records: Properties = (system && store.data.evidence[system.id]) || {};
  const setRecords = (next: Properties) => {
    if (system) store.update({ evidence: { ...store.data.evidence, [system.id]: next } });
  };
  const [selected, setSelected] = useState("");
  const blank: EvidenceRecord<number | string> = {
    value: null,
    unit: null,
    temperature: null,
    composition: null,
    method: null,
    source: [],
    evidenceLevel: null,
    verifiedAt: null,
    uncertainty: null,
    status: "non documenté",
  };
  const record = records[selected] ?? blank;
  const update = (patch: Partial<typeof record>) =>
    setRecords({ ...records, [selected]: { ...record, ...patch } });
  return (
    <section className="science-panel">
      <h3>Fiche documentaire par substance ou système</h3>
      <label>
        Nom de la substance ou du système
        <input
          value={name}
          readOnly
          placeholder="Aucun système actif — créez-le dans le dossier scientifique"
        />
      </label>
      {!system && (
        <p role="status">
          Aucun système actif : la fiche documentaire est rattachée au système sélectionné dans le
          dossier scientifique.
        </p>
      )}
      <p>
        Non documenté — aucune interpolation automatique. Chaque isomère conserve sa propre fiche.
        Influence stéréochimique non documentée.
      </p>
      {Object.entries(GROUPS).map(([group, fields]) => (
        <details key={group}>
          <summary>{group}</summary>
          <div className="property-list">
            {fields.map((field) => (
              <button key={field} onClick={() => setSelected(field)}>
                <span>{field}</span>
                <small>{records[field]?.value ?? "Non documenté"}</small>
              </button>
            ))}
          </div>
        </details>
      ))}
      {selected && (
        <div className="evidence-editor">
          <h4>{selected}</h4>
          <label>
            Valeur (texte ou nombre)
            <input
              value={record.value ?? ""}
              onChange={(e) => update({ value: e.target.value || null })}
            />
          </label>
          {(["unit", "composition", "method", "uncertainty"] as const).map((key, i) => (
            <label key={key}>
              {["Unité", "État / composition / milieu", "Méthode", "Incertitude"][i]}
              <input
                value={record[key] ?? ""}
                onChange={(e) => update({ [key]: e.target.value || null })}
              />
            </label>
          ))}
          <label>
            Température (°C)
            <input
              type="number"
              value={record.temperature ?? ""}
              onChange={(e) =>
                update({ temperature: e.target.value === "" ? null : Number(e.target.value) })
              }
            />
          </label>
          <label>
            Source exacte : DOI, URL, page, tableau
            <textarea
              value={record.source.join("\n")}
              onChange={(e) => update({ source: e.target.value.split("\n").filter(Boolean) })}
            />
          </label>
          <label>
            Date de vérification
            <input
              type="date"
              value={record.verifiedAt ?? ""}
              onChange={(e) => update({ verifiedAt: e.target.value || null })}
            />
          </label>
          <label>
            Statut
            <select
              value={record.status}
              onChange={(e) => update({ status: e.target.value as typeof record.status })}
            >
              {[
                "documenté",
                "mesuré",
                "issu d’une base de données",
                "estimé",
                "hypothétique",
                "non documenté",
                "contradictoire",
                "à vérifier",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Niveau de preuve
            <select
              value={record.evidenceLevel ?? ""}
              onChange={(e) =>
                update({ evidenceLevel: (e.target.value || null) as typeof record.evidenceLevel })
              }
            >
              <option value="">Non documenté</option>
              {["A", "B", "C", "D"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          {record.value !== null && (!record.source.length || !record.unit) && (
            <p role="alert">
              Donnée incomplète : source exacte et unité à préciser ; aucune validation automatique.
            </p>
          )}
        </div>
      )}
      <button
        onClick={() =>
          downloadText(
            "fiche-substance-v5.3.json",
            JSON.stringify({ schemaVersion: "5.3", name, records, caution: CAUTION }, null, 2),
            "application/json",
          )
        }
      >
        Exporter la fiche JSON
      </button>
      <details>
        <summary>Familles acide faible / base conjuguée / ester</summary>
        {[
          "Acide formique / formate / formiate d’éthyle",
          "Acide acétique / acétate / acétate d’éthyle",
          "Acide propionique / propionate / propionate d’éthyle",
          "Acide lactique / lactate / lactate d’éthyle",
          "Acide citrique / citrate / citrate de triéthyle",
        ].map((x) => (
          <p key={x}>{x} — propriétés contextuelles : Non documenté.</p>
        ))}
        <p>
          L’estérification masque la fonction carboxylate. Un ester neutre n’est pas automatiquement
          l’équivalent complexant ou chélatant de l’acide ou de sa base conjuguée.
        </p>
        <p>
          Le citrate peut présenter un comportement multidentate, selon le milieu. Le citrate de
          triéthyle n’est pas son équivalent chélatant. Les coordinations des formates, acétates et
          propionates restent contextuelles, sans qualification automatique de chélateur fort.
        </p>
      </details>
      <p>
        La tension superficielle seule ne permet pas de prévoir la pénétration. S est un ensemble de
        descripteurs, pas une mesure universelle.
      </p>
    </section>
  );
}

const topics = [
  "Compréhension de X",
  "Compréhension de Y",
  "Compréhension de Z",
  "Constante diélectrique",
  "Tension superficielle",
  "Angle de contact",
  "Viscosité",
  "Distinction n-/iso-",
  "Stéréochimie",
  "Complexation",
  "Distinction acide/base conjuguée/ester",
  "Paramètres manquants",
  "Désaccords terminologiques",
  "Termes trop affirmatifs",
  "Contradictions possibles",
  "Données nécessaires",
  "Propositions d’expérimentation",
  "Limites scientifiques",
  "Notes libres",
];
export function PeerReview() {
  const store = useDscStore();
  const notes = store.data.peerNotes;
  const setNotes = (next: Record<string, string>) => store.update({ peerNotes: next });
  return (
    <section className="science-panel">
      <h2>Revue entre pairs</h2>
      <p>Discussion documentaire — ne constitue pas une validation scientifique du DSC.</p>
      <label>
        Collègue / contexte
        <input
          value={notes.reviewer ?? ""}
          onChange={(e) => setNotes({ ...notes, reviewer: e.target.value })}
        />
      </label>
      {topics.map((topic) => (
        <details key={topic}>
          <summary>
            {topic}
            {notes[topic] ? " · renseigné" : ""}
          </summary>
          <label>
            {topic}
            <textarea
              value={notes[topic] ?? ""}
              onChange={(e) => setNotes({ ...notes, [topic]: e.target.value })}
            />
          </label>
        </details>
      ))}
      <div className="tool-row">
        <button
          onClick={() =>
            downloadText(
              "revue-dsc.json",
              JSON.stringify({ schemaVersion: "5.3", notes, caution: CAUTION }, null, 2),
              "application/json",
            )
          }
        >
          Exporter JSON
        </button>
        <button
          onClick={() =>
            downloadText(
              "revue-dsc.md",
              "# Revue entre pairs DSC\n\n" +
                Object.entries(notes)
                  .map(([k, v]) => `## ${k}\n${v}`)
                  .join("\n\n") +
                "\n\n" +
                CAUTION,
            )
          }
        >
          Exporter Markdown
        </button>
      </div>
    </section>
  );
}
