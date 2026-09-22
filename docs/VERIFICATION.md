# Vérification V5.3.1

État vérifié dans Lovable au commit `56c20e0e7f3dc3dc48e99bfd24e78a3a3a118445`.

## Contrôles

- `bunx tsgo --noEmit` : aucune erreur TypeScript.
- `bun run lint` : 0 erreur, 11 avertissements Fast Refresh résiduels dans `store.tsx` et six composants UI préexistants.
- Compilation automatique de la plateforme : `build OK`.
- Parcours navigateur `/tmp/browser/dsc/full.py` : réussi, aucune erreur JavaScript.

## Parcours fonctionnel couvert

- création des trois natures de système : corps pur, mélange et stratifié ;
- ajout de deux couches, suppression d'une couche et sélection de la couche étudiée ;
- affichage séparé des six composantes, sans agrégation ;
- passage de Zε de « Non documenté » à « Données partielles » après saisie ;
- position indéterminée sans hypothèse et avec seulement X/Y ;
- point et enveloppe « Hypothèse DSC — enveloppe incertaine, non mesure » lorsque X/Y/Z et la justification sont complets ;
- rattachement d'une fiche documentaire au système actif ;
- export JSON 5.3.1, rechargement, persistance, refus d'un JSON invalide sans perte du dossier, puis réimport valide ;
- conservation des notes de revue ;
- synchronisation du contexte actif avec la fiche, le Markdown et la capture PNG.

## Limite du contrôle

La géométrie du rendu 3D n'a pas été comparée pixel par pixel. Le code et le statut visible ont été contrôlés, notamment le bornage des enveloppes au domaine.
