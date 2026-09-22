# DSC Explorer V5.3

- Audit initial : une route `/`, neuf onglets dans DSCExplorer, dessin Canvas 2D isométrique sans bibliothèque 3D. FD/FP/FH, volumes, opacité et VRS montrés sur les captures ne figurent pas dans ce code livré.
- Corriger : axes Y/Z, scores arbitraires de vigilance/lisibilité, dates de vérification automatiques ; conserver fiche, capture, Markdown, impression, observation locale, cas et contradiction.
- Ajouter : deux scènes 3D, contrôles, données documentaires nullables, sources filtrables, revue entre pairs, thème et ergonomie mobile.
- Aucune valeur scientifique déduite des images ; aucune recette ni validation du DSC.
- Contrôler la prévisualisation et les exports ; ne pas publier. Compilation et contrôle TypeScript pris en charge par la plateforme, sans lancement manuel.
- Points scientifiques ouverts : échelles et correspondances DSC, définition VRS, bibliographie exacte et valeurs contextuelles à documenter avec le responsable scientifique.
## Bilan de réalisation
- V5.3 intégrée : Espace DSC et Stratigraphie distincts, rotation/zoom, masquage/isolation, grille/opacité, coupe/vue éclatée, capture et PNG ; suppression du cube historique et de ses scores arbitraires.
- Fiches de preuves contextualisées et nullables, exports JSON, sources filtrables avec dates manuelles, revue entre pairs et exports ; fiche Markdown/impression et observation locale conservées.
- Conservation en mémoire entre onglets ; aucune persistance des dossiers après rechargement, aucun import/unification des exports. À prévoir si demandé.
- Vérification navigateur : deux vues rendues, coupe/vue éclatée actionnées, capture vers fiche, recherche accessible et saisie conservée après navigation ; aucune erreur JavaScript sur ce parcours.
- Lint : aucune erreur, huit avertissements (dont six dans les composants UI préexistants). Build/typecheck laissés au contrôle automatique de la plateforme, non certifiés manuellement. Aucun déploiement.
- À finaliser scientifiquement : références exactes et données validées par le responsable, définition quantitative des axes/VRS, dossiers des cas hérités. Aucune validation scientifique revendiquée.
- Fichiers : src/components/dsc/{DSCExplorer.tsx,CubeV53.tsx,ScientificPanels.tsx,SourcesV53.tsx,science.ts}, src/styles.css, src/routes/__root.tsx, package.json, bun.lock, roadmap.md.

## Clôture de la relance
- Métadonnées propres à la page principale ajoutées ; dimensions nulles du cube masqué protégées ; assertions de coordonnées et avertissements spécifiques DSC corrigés.
- Contrôle automatique disponible : build OK (20 septembre 2026, 06:50 UTC). Aucun lancement manuel de build/typecheck ; pas de résultat TypeScript indépendant disponible.
- Lint final : zéro erreur, six avertissements dans les composants UI préexistants.
- Parcours navigateur retesté : deux vues, capture, navigation sources et conservation de saisie ; zéro erreur JavaScript.
- Fichiers supplémentaires de cette relance : src/routes/index.tsx ; corrections dans CubeV53.tsx et DSCExplorer.tsx. Aucun déploiement.

## Intégration V5.3.1
- [ ] Relier systèmes/couches, profils Z, hypothèses, fiche et cube.
- [ ] Validation JSON, persistance locale et erreurs récupérables.
- [ ] Vérifier exports, rechargement, lint et contrôles automatiques ; sans publication.
