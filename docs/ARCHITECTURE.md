# Architecture — DSC Insight V5.3.1

## Vue d'ensemble

L'application est une interface TypeScript/React locale. La route principale monte `DSCExplorer`, qui coordonne les panneaux scientifiques, le dossier actif et le cube 3D.

## Modules principaux

- `src/components/dsc/store.tsx` : état partagé, persistance locale et import/export JSON versionné.
- `src/components/dsc/zscience.ts` : modèle des six composantes Z et règles de complétude documentaire, sans agrégation scientifique.
- `src/components/dsc/dossier.ts` : représentation du dossier et sérialisation des données synchronisées.
- `src/components/dsc/DossierPanel.tsx` : systèmes, natures, couches, profils et opérations de dossier.
- `src/components/dsc/ScientificPanels.tsx` : fiches documentaires, observations et revue entre pairs rattachées au contexte actif.
- `src/components/dsc/CubeV53.tsx` : visualisation 3D, hypothèse explicite et enveloppe d'incertitude bornée au domaine.
- `src/components/dsc/DSCExplorer.tsx` : orchestration de la navigation, capture, fiche et exports.
- `src/components/dsc/SourcesV53.tsx` et `science.ts` : sources et contenus scientifiques hérités de V5.3.

## Flux de données

Le système actif détermine la couche, le profil Z, les fiches, la revue et l'hypothèse affichés. Le même état alimente la visualisation, la capture PNG, la fiche et l'export Markdown. La persistance reste locale au navigateur ; l'échange externe passe par un JSON portant la version de schéma.

## Principes de structure

- Les systèmes « corps pur », « mélange » et « stratifié » restent distincts.
- Les couches et profils sont rattachés explicitement au système actif.
- Les six composantes Z sont enregistrées séparément.
- L'hypothèse DSC est séparée des données documentaires et des observations.
- L'état inconnu demeure inconnu : aucun remplissage scientifique implicite.
