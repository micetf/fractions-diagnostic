# fractions-diagnostic

Application web de **diagnostic des représentations biaisées sur les fractions** pour les élèves de CE1 à CM2.

Développée pour [MiCetF](https://micetf.fr) — usage libre pour l'Éducation nationale française.

---

## Deux interfaces, deux URLs

| Interface | URL | Utilisateur |
|-----------|-----|-------------|
| **Admin** | `https://micetf.fr/fractions-diagnostic/` | Enseignant·e — protégée par code PIN |
| **Passation** | `https://micetf.fr/fractions-diagnostic/passer/` | Élèves — sans authentification |

---

## Fonctionnement en 3 phases

### Phase 1 — Distribution de la configuration
L'enseignant·e crée un diagnostic dans l'interface admin et exporte un fichier `fractions-config-*.json`.
Ce fichier est distribué sur chaque appareil élève (AirDrop, Google Classroom, USB…).

### Phase 2 — Passation autonome
Chaque élève passe les exercices sur son appareil. Les réponses sont stockées localement.
Aucune connexion réseau requise pendant cette phase.

### Phase 3 — Consolidation des résultats
L'enseignant·e exporte un fichier `fractions-resultats-*.json` depuis chaque appareil élève,
puis l'importe dans l'interface admin. La fusion est automatique.

> **Mono-appareil** : si l'enseignant·e et les élèves utilisent le même appareil (à tour de rôle),
> les phases 1 et 3 sont transparentes — aucun export/import requis.

---

## Installation
```bash
git clone https://github.com/micetf/fractions-diagnostic.git
cd fractions-diagnostic
pnpm install
```

---

## Développement
```bash
pnpm dev:admin    # Interface admin  → http://localhost:5173/fractions-diagnostic/
pnpm dev:passer   # Interface élèves → http://localhost:5174/fractions-diagnostic/passer/
```

---

## Build de production
```bash
pnpm build:all      # Build des deux apps
pnpm build:admin    # Admin uniquement → apps/admin/dist/
pnpm build:passer   # Passation uniquement → apps/passer/dist/
```

Déploiement :
- `apps/admin/dist/`  → `micetf.fr/fractions-diagnostic/`
- `apps/passer/dist/` → `micetf.fr/fractions-diagnostic/passer/`

---

## Architecture
```
fractions-diagnostic/
├── apps/
│   ├── admin/          # Interface enseignant (React + Vite + Tailwind)
│   └── passer/         # Interface élèves (React + Vite + Tailwind)
├── packages/
│   ├── data/           # 32 exercices CE1-CM2 + dictionnaire des 14 biais
│   ├── engine/         # Moteur de détection automatique des biais
│   └── shared/         # localStorage, PIN SHA-256, fusion, types JSDoc
├── pnpm-workspace.yaml
└── package.json
```

---

## Stack technique

| Dépendance | Version | Rôle |
|-----------|---------|------|
| Node.js | 20.19.0 (LTS) | Environnement d'exécution |
| pnpm | 10.32.1 | Gestionnaire de paquets (workspace) |
| React | 19.2.4 | Bibliothèque UI |
| Tailwind CSS | 4.2.2 | Utilitaires CSS (plugin Vite) |
| Vite | 8.0.1 | Bundler et serveur de développement |
| prop-types | 15.8.1 | Vérification des types (pas de TypeScript) |

---

## Fonctionnalités

### Interface admin
- Création et gestion des classes et des élèves
- Création de diagnostics avec sélection des exercices et libellé libre
- Export de la configuration pour les appareils élèves (Phase 1)
- Import et fusion des résultats partiels avec rapport (Phase 3)
- Analyse : matrice résultats, vue biais, profil élève, items à relire
- Export CSV de la matrice de résultats
- Sauvegarde et restauration complète en JSON
- Remise à zéro annuelle
- Code PIN à 4 chiffres avec indice mémo et aide-mémoire imprimable

### Interface passation
- Import de la configuration depuis un fichier JSON
- Grille de sélection des prénoms (élèves terminés grisés)
- Passation séquentielle sans retour de correction
- Barre de progression visuelle (points ●●●○○)
- Export des résultats partiels + effacement RGPD

---

## Bases pédagogiques

Les exercices diagnostiques sont fondés sur :

- Les **programmes cycle 2 et cycle 3** (BO n° 41 du 31/10/2024 et BO n° 16 du 17/04/2025)
- Les **points de vigilance du *Passeur*** de Monica Neagoy
- **Les 4 piliers de l'apprentissage** — Stanislas Dehaene (Collège de France, 2018)
- **Charge cognitive et apprentissage** — André Tricot (Musial, Pradère & Tricot, 2012)
- **Les gestes professionnels pour des pratiques efficaces et équitables**

---

## Licence

© MiCetF — Usage libre pour l'Éducation nationale française.
