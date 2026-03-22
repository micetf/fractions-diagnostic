/**
 * @fileoverview Exercices diagnostiques — Fractions CM2.
 *
 * Source : « Exercices diagnostiques — Fractions CM2 »
 * Cadre de référence : programme de mathématiques cycle 3,
 * BO n° 16 du 17 avril 2025, et Passeur de Monica Neagoy.
 * Les fractions ont un dénominateur ≤ 60 (sauf fractions décimales ≤ 1 000).
 */

export const metadonnees = {
    niveau: "CM2",
    cadreReference:
        "Programme de mathématiques cycle 3, BO n° 16 du 17 avril 2025",
    passation: {
        format: "Passation individuelle écrite sans manipulation. Pour l'exercice 3, fournir la demi-droite pré-imprimée. Pour les exercices 7 et 8, autoriser un schéma d'aide.",
        dureeMinutes: { min: 40, max: 45 },
        periode: "En cours ou en fin d'année",
        recommandationSelection:
            "En début d'année, privilégier les exercices 1, 2 et 7 pour évaluer la solidité des acquis CM1.",
    },
    conseilsAnalyse: [
        "Erreurs sur 1, 2, 3 → le statut de nombre des fractions > 1 n'est toujours pas stabilisé ; retour aux bandes-unité et à la demi-droite avant tout travail de calcul.",
        "Erreurs sur 4, 5, 6 → l'équivalence et le calcul restent procéduraux sans appui sur la grandeur ; les changements de dénominateur doivent être justifiés par la verbalisation et les représentations.",
        "Erreurs sur 7 → la fraction non unitaire comme opérateur (deux tiers de…, trois quarts de…) n'est pas construite ; prévoir des situations concrètes avec des collections et des grandeurs.",
        "Erreurs sur 8d → le sens rapport/taux de la fraction est absent ; c'est un obstacle documenté, difficile à lever sans contextes explicitement proportionnels.",
        "Cohérence de la série CE1→CM2 : un élève qui échoue systématiquement aux exercices de comparaison en CM2 présente souvent des lacunes dès le CE1 sur l'équipartition et l'unité de référence.",
    ],
};

export const exercices = [
    // ── Exercice 1 ────────────────────────────────────────────────────────────
    {
        numero: 1,
        titre: "Représente cette fraction",
        competence:
            "Représenter une fraction (inférieure ou supérieure à 1) par une figure géométrique",
        type: "coloring",
        consigne:
            "Représente chaque fraction par un dessin. Indique clairement ce qui représente l'unité (le tout).",
        items: [
            { id: "a", fraction: { n: 5, d: 8 } },
            { id: "b", fraction: { n: 9, d: 4 } },
            { id: "c", fraction: { n: 7, d: 7 } },
            { id: "d", fraction: { n: 11, d: 3 } },
        ],
        biaisDetectables: [
            {
                code: "INVERSION_NUM_DENOM",
                declencheur: { type: "text_review" },
                ceQueRevele:
                    "En b) : dessiner un seul rectangle partagé en 9 parts dont 4 sont coloriées → inversion numérateur/dénominateur persistante.",
            },
            {
                code: "N_SUR_N_NON_ACQUIS",
                declencheur: { type: "text_review" },
                ceQueRevele:
                    "En c) : laisser blanc ou ne pas savoir que 7/7 = 1 peut se dessiner comme un tout entier → n/n = 1 toujours fragile.",
            },
        ],
        aRelire: true,
    },

    // ── Exercice 2 ────────────────────────────────────────────────────────────
    {
        numero: 2,
        titre: "Entre quels entiers se trouve cette fraction ?",
        competence: "Encadrer une fraction entre deux entiers consécutifs",
        type: "compound",
        consigne:
            "Sans poser de division, écris entre quels nombres entiers se trouve chaque fraction. Explique comment tu as trouvé.",
        sousQuestions: [
            {
                id: "a",
                type: "text",
                consigne: "43/8 est entre ______ et ______",
                attendu: { min: 5, max: 6 },
                biaisDetectables: [],
                aRelire: true,
            },
            {
                id: "b",
                type: "text",
                consigne: "58/7 est entre ______ et ______",
                attendu: { min: 8, max: 9 },
                biaisDetectables: [],
                aRelire: true,
            },
            {
                id: "c",
                type: "text",
                consigne: "21/4 est entre ______ et ______",
                attendu: { min: 5, max: 6 },
                biaisDetectables: [],
                aRelire: true,
            },
            {
                id: "d",
                type: "fraction_input",
                consigne:
                    "30/6 = ______ (cas particulier : cherche le nombre entier exact)",
                items: [
                    {
                        id: "resultat",
                        attendu: { numerateur: 5, denominateur: 1 },
                    },
                ],
                biaisDetectables: [
                    {
                        code: "N_SUR_N_NON_ACQUIS",
                        declencheur: { type: "text_review" },
                        ceQueRevele:
                            "Répondre « entre 4 et 5 » → 30/6 = 5 non identifié comme entier exact ; 6n/6 = n non disponible.",
                    },
                ],
                aRelire: true,
            },
        ],
        aRelire: true,
    },

    // ── Exercice 3 ────────────────────────────────────────────────────────────
    {
        numero: 3,
        titre: "Lis et place sur la demi-droite",
        competence:
            "Placer des fractions et repérer des points sur une demi-droite graduée",
        type: "compound",
        consigne:
            "Voici une demi-droite graduée en tiers, avec 0, 1, 2, 3 et 4 marqués.",
        sousQuestions: [
            {
                id: "placement",
                type: "number_line",
                consigne: "Place : 5/3 — 7/3 — 10/3 — 9/3",
                graduation: { denominateur: 3, min: 0, max: 4 },
                fractionsAplacer: [
                    { n: 5, d: 3 },
                    { n: 7, d: 3 },
                    { n: 10, d: 3 },
                    { n: 9, d: 3 },
                ],
                biaisDetectables: [
                    {
                        code: "N_SUR_N_NON_ACQUIS",
                        declencheur: {
                            type: "position_wrong",
                            fraction: { n: 9, d: 3 },
                        },
                        ceQueRevele:
                            "Placer 9/3 entre 8/3 et 10/3 sans reconnaître que 9/3 = 3 → incapacité à connecter fraction et entier sur la droite.",
                    },
                ],
                aRelire: false,
            },
            {
                id: "lecture",
                type: "text",
                consigne:
                    "Le point A est entre 7/3 et 8/3. Donne trois écritures différentes de la valeur 3 sur cette demi-droite. Le point B est à l'abscisse 11/3. Écris deux autres façons d'écrire cette valeur.",
                biaisDetectables: [],
                aRelire: true,
            },
        ],
        aRelire: false,
    },

    // ── Exercice 4 ────────────────────────────────────────────────────────────
    {
        numero: 4,
        titre: "Fractions égales : lesquelles ?",
        competence:
            "Identifier et établir des égalités entre fractions (cas variés, dénominateurs jusqu'à 60)",
        type: "selection",
        consigne:
            "Parmi les fractions suivantes, entoure toutes celles qui sont égales à 2/3. Justifie chaque réponse choisie. Pour une fraction que tu n'as pas entourée, explique pourquoi elle n'est pas égale à 2/3.",
        figures: [
            { id: "6/9", label: "6/9", correct: true },
            { id: "4/5", label: "4/5", correct: false },
            { id: "8/12", label: "8/12", correct: true },
            { id: "10/15", label: "10/15", correct: true },
            { id: "50/60", label: "50/60", correct: false },
            { id: "14/21", label: "14/21", correct: true },
            { id: "4/6", label: "4/6", correct: true },
        ],
        reponsesAttendues: ["6/9", "8/12", "10/15", "14/21", "4/6"],
        biaisDetectables: [
            {
                code: "EQUIVALENCE_PARTIELLE",
                declencheur: {
                    type: "selection_excludes_any",
                    valeurs: ["14/21", "10/15"],
                },
                ceQueRevele:
                    "Ne pas entourer 14/21 ou 10/15 → répertoire d'équivalences limité aux multiples évidents (× 2, × 3).",
            },
            {
                code: "INVERSION_NUM_DENOM",
                declencheur: { type: "selection_includes", valeur: "50/60" },
                ceQueRevele:
                    "Entourer 50/60 → confusion entre 50/60 = 5/6 et 2/3 = 4/6 ; les fractions proches de 2/3 sont confondues avec 2/3.",
            },
        ],
        aRelire: true,
    },

    // ── Exercice 5 ────────────────────────────────────────────────────────────
    {
        numero: 5,
        titre: "Range et compare",
        competence:
            "Comparer des fractions aux dénominateurs variés (dont le multiple commun est ≤ 60)",
        type: "text",
        consigne:
            "Range ces fractions de la plus petite à la plus grande. Explique ta stratégie. Puis réponds : 13/6 et 5/3, laquelle est la plus grande ? Justifie sans faire appel à la stratégie de la mise au même dénominateur uniquement.",
        fractions: [
            { n: 7, d: 4 },
            { n: 17, d: 12 },
            { n: 13, d: 6 },
            { n: 5, d: 3 },
            { n: 2, d: 1 },
        ],
        ordreAttendu: ["17/12", "7/4", "5/3", "13/6", "2/1"],
        biaisDetectables: [
            {
                code: "BIAIS_ENTIER_DENOMINATEUR",
                declencheur: { type: "text_review" },
                ceQueRevele:
                    "Erreur sur 7/4 vs 5/3 → biais entier : « 5 > 4 donc 5/3 > 7/4 » sans vérification.",
            },
            {
                code: "N_SUR_N_NON_ACQUIS",
                declencheur: { type: "text_review" },
                ceQueRevele:
                    "Placer 2/1 ailleurs qu'en dernier → 2/1 = 2 non reconnu comme entier.",
            },
        ],
        aRelire: true,
    },

    // ── Exercice 6 ────────────────────────────────────────────────────────────
    {
        numero: 6,
        titre: "Calcule en justifiant",
        competence:
            "Additionner et soustraire des fractions (dénominateurs différents, multiple commun ≤ 60)",
        type: "compound",
        consigne:
            "Calcule. À chaque fois, explique le changement de dénominateur avec une phrase ou un dessin.",
        sousQuestions: [
            {
                id: "a",
                type: "fraction_input",
                consigne: "3/4 + 7/8 = ______",
                items: [
                    {
                        id: "resultat",
                        attendu: { numerateur: 13, denominateur: 8 },
                    },
                ],
                biaisDetectables: [
                    {
                        code: "ADDITION_DENOMINATEURS",
                        declencheur: {
                            type: "item_fraction_equals",
                            itemId: "resultat",
                            numerateur: 10,
                            denominateur: 12,
                        },
                        ceQueRevele:
                            "Répondre 10/12 → addition des numérateurs et des dénominateurs ; biais entier emblématique persistant jusqu'en CM2.",
                    },
                ],
                aRelire: true,
            },
            {
                id: "b",
                type: "fraction_input",
                consigne: "11/6 − 5/12 = ______",
                items: [
                    {
                        id: "resultat",
                        attendu: { numerateur: 17, denominateur: 12 },
                    },
                ],
                biaisDetectables: [
                    {
                        code: "ADDITION_DENOMINATEURS",
                        declencheur: {
                            type: "item_fraction_equals",
                            itemId: "resultat",
                            numerateur: 6,
                            denominateur: 6,
                        },
                        ceQueRevele:
                            "Répondre 6/6 = 1 (soustraction numérique sans conversion) → absence de sens de l'équivalence dans un contexte de calcul.",
                    },
                ],
                aRelire: true,
            },
            {
                id: "c",
                type: "fraction_input",
                consigne: "3/4 + 7/8 + 1/2 = ______",
                items: [
                    {
                        id: "resultat",
                        attendu: { numerateur: 17, denominateur: 8 },
                    },
                ],
                biaisDetectables: [],
                aRelire: true,
            },
            {
                id: "d",
                type: "text",
                consigne:
                    "Johanna a tracé un triangle de périmètre 7 + 1/4 unités. Un côté mesure 2 + 1/8 unités et un autre 1 + 1/2 unités. Quelle est la longueur du troisième côté ?",
                biaisDetectables: [],
                aRelire: true,
            },
        ],
        aRelire: false,
    },

    // ── Exercice 7 ────────────────────────────────────────────────────────────
    {
        numero: 7,
        titre: "La fraction d'une quantité (opérateur non unitaire)",
        competence:
            "Déterminer une fraction non unitaire d'une quantité ou d'une grandeur",
        type: "compound",
        consigne: null,
        sousQuestions: [
            {
                id: "a",
                type: "text",
                consigne:
                    "Dans un sac, il y a 12 œufs. 2/3 des œufs sont cassés. Combien d'œufs sont cassés ? Explique ta démarche.",
                attendu: 8,
                biaisDetectables: [
                    {
                        code: "FRACTION_OP_NON_UNITAIRE",
                        declencheur: { type: "text_review" },
                        ceQueRevele:
                            "Répondre 4 (12 ÷ 3, en oubliant le numérateur 2) → la fraction non unitaire est réduite à la fraction unitaire correspondante.",
                    },
                ],
                aRelire: true,
            },
            {
                id: "b",
                type: "text",
                consigne:
                    "Une recette nécessite 3/10 de 500 g de farine. Quelle masse de farine faut-il peser ?",
                attendu: 150,
                biaisDetectables: [],
                aRelire: true,
            },
            {
                id: "c",
                type: "text",
                consigne:
                    "Un terrain mesure 60 m de long. Nadia en clôture 2/5. Quelle longueur clôture-t-elle ?",
                attendu: 24,
                biaisDetectables: [],
                aRelire: true,
            },
            {
                id: "d",
                type: "binary_choice",
                consigne:
                    "Théo dit : « 3/4 de 100 mètres, c'est plus que 2/3 de 100 mètres. » A-t-il raison ?",
                options: ["OUI", "NON"],
                attendu: "OUI",
                avecJustification: true,
                biaisDetectables: [],
                aRelire: true,
            },
        ],
        aRelire: true,
    },

    // ── Exercice 8 ────────────────────────────────────────────────────────────
    {
        numero: 8,
        titre: "Un problème à plusieurs sens",
        competence:
            "Mobiliser les fractions avec des sens variés (partie d'un tout, mesure, opérateur, rapport) dans un problème complexe",
        type: "compound",
        consigne: "Dans une classe de 30 élèves, 2/5 sont des filles.",
        sousQuestions: [
            {
                id: "a",
                type: "text",
                consigne: "Combien y a-t-il de filles dans cette classe ?",
                attendu: 12,
                biaisDetectables: [
                    {
                        code: "FRACTION_OP_NON_UNITAIRE",
                        declencheur: { type: "text_review" },
                        ceQueRevele:
                            "Répondre 6 (30 ÷ 5 = 6 sans multiplier par 2) → fraction non unitaire réduite à la fraction unitaire.",
                    },
                ],
                aRelire: true,
            },
            {
                id: "b",
                type: "fraction_input",
                consigne: "Quelle fraction de la classe sont les garçons ?",
                items: [
                    {
                        id: "resultat",
                        attendu: { numerateur: 3, denominateur: 5 },
                    },
                ],
                biaisDetectables: [],
                aRelire: false,
            },
            {
                id: "c",
                type: "compound",
                consigne:
                    "Les filles ont lu en moyenne 3/4 d'un livre par semaine pendant 4 semaines. Quelle fraction d'un livre ont-elles lue en tout ? Est-ce plus qu'un livre entier ?",
                sousQuestions: [
                    {
                        id: "c_calcul",
                        type: "fraction_input",
                        consigne: "Fraction d'un livre lue en tout :",
                        items: [
                            {
                                id: "resultat",
                                attendu: { numerateur: 12, denominateur: 4 },
                            },
                        ],
                        biaisDetectables: [
                            {
                                code: "ADDITION_DENOMINATEURS",
                                declencheur: {
                                    type: "item_fraction_equals",
                                    itemId: "resultat",
                                    numerateur: 12,
                                    denominateur: 16,
                                },
                                ceQueRevele:
                                    "Répondre 12/16 → addition des dénominateurs sur une addition itérée.",
                            },
                        ],
                        aRelire: false,
                    },
                    {
                        id: "c_comparaison",
                        type: "binary_choice",
                        consigne: "Est-ce plus qu'un livre entier ?",
                        options: ["OUI", "NON"],
                        attendu: "OUI",
                        biaisDetectables: [],
                        aRelire: false,
                    },
                ],
                aRelire: false,
            },
            {
                id: "d",
                type: "binary_choice",
                consigne:
                    "Dans une autre classe, 3/5 des élèves sont des filles. Peut-on dire que cette classe a plus de filles que la première ? Explique.",
                options: ["OUI", "NON"],
                // Réponse correcte : NON (sans connaître l'effectif total, on ne peut pas conclure)
                attendu: "NON",
                avecJustification: true,
                biaisDetectables: [
                    {
                        code: "SENS_RAPPORT_TAUX_ABSENT",
                        declencheur: { type: "choice_equals", valeur: "OUI" },
                        ceQueRevele:
                            "Répondre OUI sans condition → la fraction-rapport est confondue avec un nombre absolu ; 3/5 d'une classe inconnue ne peut être comparé à 2/5 de 30 élèves. C'est l'obstacle du sens rapport/taux, rarement travaillé explicitement à l'école primaire.",
                    },
                ],
                aRelire: true,
            },
        ],
        aRelire: false,
    },
];
