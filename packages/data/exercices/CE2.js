/**
 * @fileoverview Exercices diagnostiques — Fractions CE2.
 *
 * Source : « Exercices diagnostiques — Fractions CE2 »
 * Cadre de référence : programme de mathématiques cycle 2,
 * BO n° 41 du 31 octobre 2024, et Passeur de Monica Neagoy.
 * Destinés aux élèves de CE2 en cours ou en fin d'année (période 3+).
 * Les fractions travaillées ont un dénominateur ≤ 12 et sont toutes ≤ 1.
 */

export const metadonnees = {
    niveau: "CE2",
    cadreReference:
        "Programme de mathématiques cycle 2, BO n° 41 du 31 octobre 2024",
    passation: {
        format: "Passation individuelle écrite, sans manipulation autorisée. Pour les exercices 3 et 4, fournir la règle graduée pré-imprimée.",
        dureeMinutes: { min: 30, max: 35 },
        periode: "En cours ou en fin d'année (à partir de la période 3)",
        recommandationSelection:
            "Sélectionner 4 à 5 exercices selon l'avancement dans l'année.",
    },
    conseilsAnalyse: [
        "Erreurs sur les exercices 1, 2, 7 → biais procédural sur l'équivalence et le calcul ; retour à la manipulation et à la verbalisation avant tout.",
        "Erreurs sur les exercices 3, 4, 8 → la fraction n'est pas encore vécue comme une mesure ; les situations de mesurage de longueurs sont insuffisamment installées.",
        "Erreurs sur les exercices 5, 6 → le biais des entiers est toujours actif sur la comparaison ; prévoir des appuis sur la règle graduée et des bandes-unité.",
        "Lien avec le CE1 : si les erreurs sur les exercices 1 et 2 sont massives, reprendre d'abord les bases du CE1 (équipartition, sens du tout) avant d'aborder les égalités de fractions.",
    ],
};

export const exercices = [
    // ── Exercice 1 ────────────────────────────────────────────────────────────
    {
        numero: 1,
        titre: "Sont-elles pareilles ?",
        competence:
            "Établir des égalités entre fractions ; expliquer sans la règle algorithmique",
        type: "binary_choice",
        consigne:
            "Tom dit que 6/8 et 3/4, c'est la même quantité. A-t-il raison ? Explique avec des mots pourquoi tu penses ça. (Tu n'as pas le droit d'utiliser les symboles × ou ÷.)",
        options: ["OUI", "NON"],
        attendu: "OUI",
        avecJustification: true,
        // Le biais s'observe dans la justification (procédure sans sens), pas dans le OUI/NON
        biaisDetectables: [],
        aRelire: true,
    },

    // ── Exercice 2 ────────────────────────────────────────────────────────────
    {
        numero: 2,
        titre: "Trouve les fractions égales à 1/2",
        competence:
            "Identifier des fractions équivalentes parmi plusieurs propositions",
        type: "selection",
        consigne:
            "Parmi les fractions suivantes, entoure toutes celles qui sont égales à 1/2. Pour chacune que tu as entourée, écris une phrase pour expliquer pourquoi.",
        figures: [
            { id: "1/3", label: "1/3", correct: false },
            { id: "2/4", label: "2/4", correct: true },
            { id: "3/4", label: "3/4", correct: false },
            { id: "3/6", label: "3/6", correct: true },
            { id: "2/6", label: "2/6", correct: false },
            { id: "5/10", label: "5/10", correct: true },
            { id: "4/8", label: "4/8", correct: true },
        ],
        reponsesAttendues: ["2/4", "3/6", "5/10", "4/8"],
        biaisDetectables: [
            {
                code: "EQUIVALENCE_NON_GENERALISEE",
                // N'entourer que 2/4 (la plus évidente) → répertoire limité
                declencheur: { type: "selection_exact", valeurs: ["2/4"] },
                ceQueRevele:
                    "N'entourer que 2/4 (la plus évidente) → répertoire d'équivalences limité, procédure non généralisée.",
            },
        ],
        aRelire: true,
    },

    // ── Exercice 3 ────────────────────────────────────────────────────────────
    {
        numero: 3,
        titre: "Mesure avec ta règle graduée",
        competence:
            "Mesurer des longueurs non entières à l'aide d'une règle graduée en fractions d'unité",
        type: "fraction_input",
        consigne:
            "Voici une règle graduée en quarts d'unité (l'unité est marquée entre 0 et 1). Mesure les longueurs des trois segments dessinés ci-dessous et écris ta réponse.",
        items: [
            {
                id: "A",
                description: "Segment A",
                attendu: { numerateur: 3, denominateur: 4 },
            },
            {
                id: "B",
                description: "Segment B",
                // 2/4 = 1/2 : les deux réponses sont correctes → relecture enseignant
                attendu: null,
                aRelire: true,
            },
            {
                id: "C",
                description: "Segment C",
                // Biais documenté source : refus de mesurer car dépasse l'unité
                attendu: { numerateur: 5, denominateur: 4 },
            },
        ],
        biaisDetectables: [
            {
                // Aucune détection automatique sur A et B (équivalence 1/2 = 2/4).
                // Le biais FRACTION_PAS_MESURE s'observe sur C à la relecture :
                // l'élève qui laisse C vide ou répond 1/4 refuse de mesurer au-delà de l'unité.
                code: "FRACTION_PAS_MESURE",
                declencheur: { type: "text_review" },
                ceQueRevele:
                    "Laisser C vide ou répondre 1/4 → l'élève refuse ou ne sait pas mesurer une longueur supérieure à l'unité.",
            },
        ],
        // aRelire : la mesure du segment C révèle un obstacle enseignant → relecture
        aRelire: true,
        // Pas de zone de texte : l'élève mesure et écrit, il n'explique pas
        avecExplication: false,
    },

    // ── Exercice 4 ────────────────────────────────────────────────────────────
    {
        numero: 4,
        titre: "Place les fractions sur la règle",
        competence:
            "Placer des fractions sur une règle graduée et lire la position d'un point",
        type: "compound",
        consigne: "Voici une règle graduée en huitièmes d'unité.",
        sousQuestions: [
            {
                id: "placement",
                type: "number_line",
                consigne:
                    "Place les fractions suivantes sur la règle : 1/8 — 3/8 — 4/8 — 6/8",
                graduation: { denominateur: 8, min: 0, max: 1 },
                fractionsAplacer: [
                    { n: 1, d: 8 },
                    { n: 3, d: 8 },
                    { n: 4, d: 8 },
                    { n: 6, d: 8 },
                ],
                biaisDetectables: [
                    {
                        code: "FRACTION_PAS_MESURE",
                        // 4/8 placé à mi-chemin entre 3/8 et 6/8 (raisonnement sur les chiffres 3 et 6)
                        declencheur: {
                            type: "position_wrong",
                            fraction: { n: 4, d: 8 },
                        },
                        ceQueRevele:
                            "Placer 4/8 à mi-chemin entre 3/8 et 6/8 (raisonnement sur les chiffres 3 et 6) → absence d'appui sur la grandeur.",
                    },
                ],
                aRelire: false,
            },
            {
                id: "encadrement",
                type: "fraction_input",
                // Consigne épurée — les bornes ne sont plus dans la consigne
                consigne:
                    "Un point P est marqué sur la règle graduée. Complète : La mesure de P est comprise entre ______ et ______.",
                // Figure support : règle en huitièmes avec point P affiché
                figureSupportId: "regle_huitiemes_point_P",
                items: [
                    {
                        id: "borne_inf",
                        attendu: { numerateur: 5, denominateur: 8 },
                    },
                    {
                        id: "borne_sup",
                        attendu: { numerateur: 6, denominateur: 8 },
                    },
                ],
                biaisDetectables: [],
                aRelire: false,
            },
            {
                id: "equivalence",
                type: "binary_choice",
                consigne:
                    "Zoé dit que 4/8 et 1/2 sont au même endroit sur la règle. A-t-elle raison ? Explique.",
                options: ["OUI", "NON"],
                attendu: "OUI",
                avecJustification: true,
                biaisDetectables: [],
                aRelire: true,
            },
        ],
        aRelire: false,
    },

    // ── Exercice 5 ────────────────────────────────────────────────────────────
    {
        numero: 5,
        titre: "Range les parts",
        competence: "Comparer des fractions de même numérateur",
        type: "sortable",
        consigne:
            "Cinq amis ont chacun mangé une part de gâteau. " +
            "Voici les fractions qu'ils ont mangées. " +
            "Range leurs parts de la plus petite à la plus grande.",
        // Source : document CE2 documente Ali, Bea, Chloé.
        // David (5/9) et Emma (5/7) ajoutés pour compléter à 5 items
        // en conservant la cohérence numérateur constant (même numérateur = 5).
        fractions: [
            { prenom: "Ali", n: 5, d: 6 },
            { prenom: "Bea", n: 5, d: 8 },
            { prenom: "Chloé", n: 5, d: 12 },
            { prenom: "David", n: 5, d: 9 },
            { prenom: "Emma", n: 5, d: 7 },
        ],
        // Ordre correct croissant : 5/12 < 5/9 < 5/8 < 5/7 < 5/6
        ordreAttendu: ["Chloé", "David", "Bea", "Emma", "Ali"],
        biaisDetectables: [
            {
                code: "BIAIS_ENTIER_DENOMINATEUR",
                // Ordre inverse = tri par dénominateur croissant
                // (l'élève pense : plus grand dénominateur = plus grande fraction)
                declencheur: {
                    type: "ordre_exact",
                    ordre: ["Ali", "Emma", "Bea", "David", "Chloé"],
                },
                ceQueRevele:
                    "Ranger dans l'ordre inverse (Ali < Emma < Bea < David < Chloé) " +
                    "→ biais entier appliqué au dénominateur : " +
                    "plus grand d = plus grande fraction.",
            },
        ],
        aRelire: false,
    },

    // ── Exercice 6 ────────────────────────────────────────────────────────────
    {
        numero: 6,
        titre: "Compare sans poser de calcul",
        competence:
            "Comparer des fractions dont l'un des dénominateurs est multiple de l'autre",
        type: "comparaison",
        consigne: "Sans poser de calcul, écris <, > ou = entre chaque paire.",
        comparaisons: [
            {
                id: "a",
                gauche: { n: 5, d: 12 },
                droite: { n: 1, d: 4 },
                attendu: ">",
            },
            {
                id: "b",
                gauche: { n: 7, d: 12 },
                droite: { n: 5, d: 6 },
                attendu: "<",
            },
            {
                id: "c",
                gauche: { n: 3, d: 4 },
                droite: { n: 9, d: 12 },
                attendu: "=",
            },
        ],
        biaisDetectables: [
            {
                code: "BIAIS_ENTIER_DENOMINATEUR",
                // a) : 5/12 < 1/4 « car 12 > 4 »
                declencheur: {
                    type: "comparaison_item_wrong",
                    itemId: "a",
                    valeurErronee: "<",
                },
                ceQueRevele:
                    "Répondre 5/12 < 1/4 en (a) → biais du dénominateur : " +
                    "12 > 4 donc la fraction est perçue comme plus petite.",
            },
            {
                code: "BIAIS_ENTIER_DENOMINATEUR",
                // b) : 7/12 > 5/6 « car 7 > 5 » (biais numérateur)
                declencheur: {
                    type: "comparaison_item_wrong",
                    itemId: "b",
                    valeurErronee: ">",
                },
                ceQueRevele:
                    "Répondre 7/12 > 5/6 en (b) → biais du numérateur : " +
                    "7 > 5 donc la fraction est perçue comme plus grande.",
            },
            {
                code: "EQUIVALENCE_NON_GENERALISEE",
                // c) : répondre < ou > au lieu de =
                declencheur: {
                    type: "comparaison_item_wrong",
                    itemId: "c",
                    valeurErronee: "<",
                },
                ceQueRevele:
                    "Répondre < en (c) → l'égalité 3/4 = 9/12 n'est pas mobilisée.",
            },
            {
                code: "EQUIVALENCE_NON_GENERALISEE",
                declencheur: {
                    type: "comparaison_item_wrong",
                    itemId: "c",
                    valeurErronee: ">",
                },
                ceQueRevele:
                    "Répondre > en (c) → l'égalité 3/4 = 9/12 n'est pas mobilisée.",
            },
        ],
        aRelire: false,
    },

    // ── Exercice 7 ────────────────────────────────────────────────────────────
    {
        numero: 7,
        titre: "Un problème de gâteau",
        competence:
            "Additionner des fractions (dénominateurs dont l'un est multiple de l'autre) dans un contexte",
        type: "compound",
        consigne:
            "Marc a fait un gâteau. Il en a mangé 1/10. Ange en a mangé 3/10 et Saïd en a mangé 2/10.",
        sousQuestions: [
            {
                id: "a",
                type: "fraction_input",
                consigne: "Quelle fraction du gâteau ont-ils mangée en tout ?",
                items: [
                    {
                        id: "resultat",
                        attendu: { numerateur: 6, denominateur: 10 },
                    },
                ],
                biaisDetectables: [
                    {
                        code: "ADDITION_DENOMINATEURS",
                        declencheur: {
                            type: "item_fraction_equals",
                            itemId: "resultat",
                            numerateur: 6,
                            denominateur: 30,
                        },
                        ceQueRevele:
                            "Répondre 6/30 (addition de 1+3+2=6 et de 10+10+10=30) → addition des dénominateurs, biais entier emblématique.",
                    },
                ],
                aRelire: false,
            },
            {
                id: "b",
                type: "fraction_input",
                consigne:
                    "Quelle fraction du gâteau reste-t-il ? Explique comment tu as trouvé.",
                items: [
                    {
                        id: "resultat",
                        attendu: { numerateur: 4, denominateur: 10 },
                    },
                ],
                biaisDetectables: [],
                aRelire: true,
            },
            {
                id: "c",
                type: "fraction_input",
                consigne:
                    "(Question complémentaire) Lina mange ensuite 1/5 du gâteau entier. Quelle fraction du gâteau a-t-on mangée en tout maintenant ?",
                items: [
                    {
                        id: "resultat",
                        attendu: { numerateur: 8, denominateur: 10 },
                    },
                ],
                biaisDetectables: [
                    {
                        code: "ADDITION_DENOMINATEURS",
                        declencheur: {
                            type: "item_fraction_equals",
                            itemId: "resultat",
                            numerateur: 7,
                            denominateur: 15,
                        },
                        ceQueRevele:
                            "Répondre 7/15 (addition de 6+1=7 et de 10+5=15) → même biais, incapacité à convertir 1/5 en 2/10 avant d'additionner.",
                    },
                ],
                aRelire: false,
            },
        ],
        aRelire: false,
    },

    // ── Exercice 8 ────────────────────────────────────────────────────────────
    {
        numero: 8,
        titre: "Quel chemin a-t-il parcouru ?",
        competence:
            "Mobiliser les fractions dans une situation de mesure (grandeur), pas seulement de partage d'un tout",
        type: "compound",
        consigne:
            "Un sentier est long d'une certaine distance que l'on appelle 1 unité. Léo a marché 3/4 du sentier le matin. L'après-midi, il a marché encore 1/4 du sentier.",
        sousQuestions: [
            {
                id: "a",
                type: "fraction_input",
                consigne:
                    "Quelle fraction du sentier a-t-il parcourue en tout ? Écris et explique.",
                items: [
                    {
                        id: "resultat",
                        attendu: { numerateur: 4, denominateur: 4 },
                    },
                ],
                biaisDetectables: [
                    {
                        code: "ADDITION_DENOMINATEURS",
                        declencheur: {
                            type: "item_fraction_equals",
                            itemId: "resultat",
                            numerateur: 4,
                            denominateur: 8,
                        },
                        ceQueRevele:
                            "Répondre 4/8 → addition des dénominateurs.",
                    },
                ],
                aRelire: true,
            },
            {
                id: "b",
                type: "binary_choice",
                consigne:
                    "A-t-il parcouru tout le sentier ? Comment le sais-tu ?",
                options: ["OUI", "NON"],
                attendu: "OUI",
                avecJustification: true,
                biaisDetectables: [],
                aRelire: true,
            },
            {
                id: "c",
                type: "binary_choice",
                consigne:
                    "Son ami Sam a marché 5/8 du même sentier. Qui a marché le plus loin ?",
                options: ["Léo", "Sam"],
                attendu: "Léo",
                avecJustification: true,
                biaisDetectables: [],
                aRelire: true,
            },
        ],
        aRelire: false,
    },
];
