# Fraction Diagnostic

Application web de **diagnostic des représentations biaisées sur les fractions** pour les élèves de CE1 à CM2.

Développée pour le réseau [MiCetF](https://micetf.fr) par un Conseiller Pédagogique de Circonscription pour les usages du Numérique (CPC Numérique).

---

## Contexte pédagogique

Les exercices diagnostiques sont fondés sur :

- Les **programmes de mathématiques cycle 2 et cycle 3** (BO n° 41 du 31 octobre 2024 et BO n° 16 du 17 avril 2025)
- Les **points de vigilance du *Passeur*** de Monica Neagoy
- Le mémo **Les 4 piliers de l'apprentissage** — Stanislas Dehaene (Collège de France, 2018)
- Le diaporama **Charge cognitive et apprentissage** — André Tricot (Musial, Pradère & Tricot, 2012)
- Le document **Les gestes professionnels pour des pratiques efficaces et équitables**

L'application place l'élève dans des situations où les **biais didactiques apparaissent spontanément**, sans que l'élève ait conscience d'être évalué sur ces biais. Aucune correction n'est affichée pendant la passation.

---

## Fonctionnalités

### Mode enseignant (PIN requis)
- Gestion des classes et des élèves (CE1, CE2, CM1, CM2)
- Création de sessions diagnostiques avec sélection des exercices, durée estimée et tableau de lecture rapide des biais ciblés
- Tableau de bord d'analyse :
  - **Matrice résultats** — élèves × exercices avec états Réussi / Biais / À relire / Non fait
  - **Vue biais** — distribution des 14 codes biais, alerte si ≥ 30 % des élèves concernés
  - **Profil élève** — détail par exercice, durée, notes libres
  - **Items à relire** — attribution manuelle de biais sur les réponses ouvertes
- Export CSV (matrice de résultats) et JSON (sauvegarde complète)
- Import JSON (restauration après effacement ou changement de navigateur)
- Remise à zéro complète (début d'année scolaire)

### Mode élève (sans authentification)
- Sélection du prénom dans la liste de la classe
- Passation séquentielle unidirectionnelle (pas de retour en arrière)
- 6 types d'exercices interactifs : sélection de figures, saisie de fraction, droite graduée (drag & snap SVG), choix binaire, coloriage, texte libre
- Aucun score, aucune correction affichée pendant la passation
- Écran de fin neutre

### Détection automatique de 14 biais didactiques

| Code | Biais |
|------|-------|
| `EQUIPARTITION` | Parts inégales acceptées comme valides |
| `INVERSION_NUM_DENOM` | Numérateur et dénominateur inversés |
| `BIAIS_ENTIER_DENOMINATEUR` | Plus grand dénominateur = plus grande fraction |
| `ADDITION_DENOMINATEURS` | Addition des dénominateurs (1/5 + 2/5 = 3/10) |
| `ABSENCE_COMPLEMENT_A_1` | Incapacité à calculer le complément à 1 |
| `EQUIVALENCE_NON_GENERALISEE` | Équivalences limitées aux multiples évidents |
| `FRACTION_PAS_MESURE` | Fraction non perçue comme mesure sur la droite |
| `FRACTION_TOUJOURS_INF_1` | Fraction toujours considérée < 1 |
| `N_SUR_N_NON_ACQUIS` | n/n = 1 non reconnu |
| `REFUS_DEPASSER_UNITE` | Fraction > 1 placée entre 0 et 1 |
| `FRACTION_OPERATEUR_NON_CONSTRUITE` | Fraction traitée comme entier |
| `EQUIVALENCE_PARTIELLE` | Équivalences limitées aux multiples × 2, × 3 |
| `FRACTION_OP_NON_UNITAIRE` | Fraction non unitaire réduite à sa fraction unitaire |
| `SENS_RAPPORT_TAUX_ABSENT` | Fraction-rapport confondue avec nombre absolu |

---

## Architecture

**Mono-PC, mono-navigateur, zéro réseau.**

- Aucune connexion Internet requise après le chargement initial
- Aucun serveur distant, aucune base de données externe, aucune API tierce
- Toutes les données persistées dans le `localStorage` du navigateur
- PIN enseignant haché SHA-256 via Web Crypto API — jamais stocké en clair

---

## Stack technique

| Dépendance | Version | Rôle |
|-----------|---------|------|
| Node.js | 20.19.0 (LTS) | Environnement d'exécution |
| pnpm | 10.32.1 | Gestionnaire de paquets |
| React | 19.2.4 | Bibliothèque UI |
| Tailwind CSS | 4.2.2 | Utilitaires CSS (plugin Vite) |
| Vite | 8.0.1 | Bundler et serveur de développement |
| prop-types | 15.8.1 | Vérification des types en développement |

Pas de TypeScript, pas de React Router, pas de dépendances d'état externes.

---

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/micetf/fractions-diagnostic.git
cd fractions-diagnostic

# Installer les dépendances
pnpm install

# Lancer le serveur de développement
pnpm dev
```

Le navigateur s'ouvre automatiquement sur `http://localhost:5173/fractions-diagnostic/`.

---

## Scripts disponibles

```bash
pnpm dev        # Serveur de développement avec HMR
pnpm build      # Build de production dans dist/
pnpm preview    # Prévisualiser le build de production
pnpm lint       # Vérification ESLint
```

---

## Structure du projet

```
src/
├── components/
│   ├── analyse/              # Tableau de bord enseignant
│   │   ├── MatriceResultats.jsx
│   │   ├── VueBiais.jsx
│   │   ├── ProfilEleve.jsx
│   │   └── ItemsARevoir.jsx
│   ├── common/               # Composants partagés
│   │   ├── Layout.jsx        # Navbar MiCetF + contenu
│   │   └── PinGate.jsx       # Garde PIN SHA-256
│   └── exercices/            # Composants de passation
│       ├── BinaryChoice.jsx
│       ├── ColoringFigure.jsx
│       ├── ExerciceRenderer.jsx
│       ├── FigureSelector.jsx
│       ├── FractionInput.jsx
│       ├── NumberLine.jsx    # SVG drag & snap
│       ├── TextJustification.jsx
│       └── figures/          # SVG des figures source
├── context/
│   ├── AppContext.jsx         # useReducer + persistence localStorage
│   └── useAppContext.js       # Hook consommateur
├── data/
│   ├── biais.js               # Dictionnaire des 14 codes biais
│   ├── index.js               # Point d'entrée unifié
│   └── exercices/
│       ├── CE1.js             # 8 exercices CE1 avec biais
│       ├── CE2.js             # 8 exercices CE2 avec biais
│       ├── CM1.js             # 8 exercices CM1 avec biais
│       └── CM2.js             # 8 exercices CM2 avec biais
├── hooks/
│   ├── useBiaisDetector.js
│   └── useStorage.js          # Abstraction localStorage
├── pages/
│   ├── eleve/
│   │   ├── AccueilEleve.jsx
│   │   ├── ChoixEleve.jsx
│   │   ├── FinPassation.jsx
│   │   └── PassationRunner.jsx
│   └── enseignant/
│       ├── AccueilEnseignant.jsx
│       ├── AnalyseSession.jsx
│       ├── CreerSession.jsx
│       ├── ExportImport.jsx
│       ├── GestionClasses.jsx
│       └── ListeSessions.jsx
├── utils/
│   ├── analyseSession.js      # Calculs matrice, biais, seuils
│   ├── biaisDetector.js       # Moteur de détection automatique
│   ├── exportData.js          # CSV, JSON export/import
│   ├── initialValues.js       # Valeurs initiales des composants
│   ├── pinHash.js             # SHA-256 Web Crypto
│   └── sessionHelpers.js      # Durée estimée, biais par exercice
├── App.jsx                    # Routage par état (pas de react-router)
└── main.jsx                   # Point d'entrée React
```

---

## Modèle de données localStorage

Toutes les clés sont préfixées `fractions-diagnostic_`.

```
fractions-diagnostic_config      { pin_hash, annee_scolaire }
fractions-diagnostic_classes     Classe[]
fractions-diagnostic_sessions    Session[]
fractions-diagnostic_passations  PassationEleve[]
```

### Classe
```js
{
  id: string,           // crypto.randomUUID()
  nom: string,
  niveau: 'CE1'|'CE2'|'CM1'|'CM2',
  annee_scolaire: string,
  archive: boolean,
  eleves: Eleve[]       // [{ id, prenom, nom }]
}
```

### Session
```js
{
  id: string,
  classe_id: string,
  niveau: 'CE1'|'CE2'|'CM1'|'CM2',
  exercices_selectionnes: number[],  // [1..8]
  date_creation: string,             // ISO 8601
  statut: 'en_cours'|'terminee'
}
```

### PassationEleve
```js
{
  id: string,
  session_id: string,
  eleve_id: string,
  statut: 'en_cours'|'terminee',
  date_debut: string,
  date_fin: string|null,
  note_enseignant: string,
  reponses: ReponseExercice[]
}
```

### ReponseExercice
```js
{
  exercice_numero: number,
  type: 'selection'|'fraction_input'|'number_line'|'binary_choice'|'coloring'|'text',
  valeur_brute: any,       // structure dépend du type
  biais_auto: string[],    // codes détectés automatiquement
  biais_manuel: string[]|null,
  duree_ms: number,
  a_relire: boolean
}
```

---

## Sauvegarde et restauration

**Exporter la sauvegarde** (recommandé en fin d'année) :
> Tableau de bord → Export / Import → *Télécharger la sauvegarde* → fichier `fractions-diagnostic_sauvegarde_AAAA-MM-JJ.json`

**Restaurer sur un autre navigateur ou après effacement** :
> Export / Import → *Choisir un fichier…* → confirmer le remplacement

**Remettre à zéro en début d'année** :
> Export / Import → *Effacer toutes les données…* → confirmer en deux étapes → saisir `EFFACER`

---

## Navigateurs supportés

| Navigateur | Version minimale |
|-----------|-----------------|
| Chrome / Chromium | ≥ 108 |
| Firefox | ≥ 109 |
| Safari | ≥ 16 |
| Edge | ≥ 108 |

Résolution minimale recommandée (mode enseignant) : 1024 × 768 px.

---

## Sécurité et confidentialité

- Le PIN enseignant est haché SHA-256 côté client avant stockage — le code en clair ne transite et n'est jamais persisté
- Le mode élève n'expose aucune donnée relative aux autres élèves
- Aucune donnée n'est transmise à un serveur distant (pas d'analytics, pas de télémétrie)

---

## Hors périmètre (v1.0)

- Diagnostic d'autres domaines mathématiques
- Passation multi-appareils ou en réseau
- Suggestions automatisées de remédiation
- Comparaison inter-classes ou statistiques de circonscription
- Intégration ENT / Pronote

---

## Licence

© MiCetF — Usage libre pour l'Éducation nationale française.