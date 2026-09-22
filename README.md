# recherche-solubility-cube-dubourg

Code de travail de **DSC Insight / DSC Explorer V5.3.1**, outil local de structuration du raisonnement pour la conservation-restauration des biens culturels.

## État de cette branche

Cette branche reprend l'état validé du projet Lovable au commit `56c20e0e7f3dc3dc48e99bfd24e78a3a3a118445`. Elle n'est ni publiée ni déployée.

La V5.3.1 distingue six composantes Z indépendantes : Zε, Zi, Zp, ZL, Zc et Zr. Elles ne sont ni additionnées, ni moyennées, ni converties automatiquement en une coordonnée unique. Un point dans le cube n'est affiché que pour une hypothèse DSC explicitement activée et suffisamment renseignée ; sinon l'interface indique « Position Z indéterminée ».

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Limites scientifiques](docs/SCIENTIFIC_LIMITS.md)
- [Vérification](docs/VERIFICATION.md)

## Démarrage local

```bash
bun install
bun run dev
```

Consulter `package.json` pour les scripts disponibles. Les commandes de contrôle utilisées sont consignées dans [docs/VERIFICATION.md](docs/VERIFICATION.md).
