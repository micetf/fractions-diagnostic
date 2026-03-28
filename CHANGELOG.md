# Changelog

## [2.0.0] — Mars 2026

### Ruptures majeures
- **Session → Diagnostic** : la notion de "session" est remplacée par "diagnostic". Pas de cycle de vie (pas de statut en_cours/terminée, pas de bouton lancer/clôturer).
- **Clés localStorage renommées** : `fractions-diagnostic_*` → `fractions-admin_*` et `fractions-passer_*`.
- **Deux applications distinctes** : l'interface admin et l'interface passation sont deux apps Vite indépendantes déployées sur deux URLs.
- **Suppression du long press** : l'accès au mode enseignant ne se fait plus par appui long mais par code PIN dédié.

### Nouvelles fonctionnalités
- **Code PIN** : protection de l'interface admin par PIN à 4 chiffres (SHA-256). Indice mémo, aide-mémoire imprimable, flux de récupération en cas d'oubli.
- **Flux 3 phases multi-appareils** :
  - Phase 1 : export d'un fichier config JSON depuis l'admin
  - Phase 2 : passation autonome sur chaque appareil élève
  - Phase 3 : export des résultats partiels + import/fusion sur l'admin
- **Rapport de fusion** : après chaque import de résultats, affichage du nombre de passations ajoutées, remplacées et ignorées.
- **Libellé libre** sur les diagnostics (ex. : "Octobre").
- **Mono-appareil transparent** : si admin et passation sont sur le même appareil, aucun export/import n'est requis.
- **Effacement RGPD** : après export des résultats, proposition d'effacer les données locales de l'appareil élève.
- **Page Paramètres** : changement du PIN depuis l'interface admin.

### Architecture
- Monorepo pnpm avec workspaces
- `packages/data/` : exercices CE1-CM2 partagés
- `packages/engine/` : moteur de détection des biais partagé
- `packages/shared/` : storage, pinHash, fusionResultats, types JSDoc

### Migration depuis la v1.0
Les sauvegardes JSON v1.0 (champ `sessions`) sont automatiquement migrées à l'import :
- `sessions` → `diagnostics`
- `pin_hash` retiré de la config (désormais géré séparément)

---

## [1.0.0] — Mars 2026

- Version initiale : application mono-page, accès enseignant par appui long.
- Gestion des classes, sessions diagnostiques, analyse des biais.
- Export CSV et JSON, import JSON.
- 32 exercices CE1-CM2 avec détection automatique des biais.
