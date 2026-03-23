/**
 * @fileoverview Exercices diagnostiques — Fractions CM1.
 *
 * Source : « Exercices diagnostiques — Fractions CM1 »
 * Cadre de référence : programme de mathématiques cycle 3,
 * BO n° 16 du 17 avril 2025, et Passeur de Monica Neagoy.
 * Les fractions ont un dénominateur ≤ 20 (sauf fractions décimales ≤ 100).
 */

export const metadonnees = {
    niveau: "CM1",
    cadreReference:
        "Programme de mathématiques cycle 3, BO n° 16 du 17 avril 2025",
    passation: {
        format: "Passation individuelle écrite sans manipulation. Pour les exercices 3 et 4, fournir la demi-droite pré-imprimée avec les graduations.",
        dureeMinutes: { min: 35, max: 40 },
        periode: "En cours ou en fin d'année",
        recommandationSelection:
            "En début d'année de CM1, commencer par les exercices 1, 2 et 7 pour évaluer les acquis CE2.",
    },
    conseilsAnalyse: [
        "Erreurs massives sur 1, 2, 3 → le seuil du 1 n'est pas franchi ; les fractions supérieures à 1 ne sont pas encore des nombres. Retour aux bandes et aux règles graduées avant tout calcul.",
        "Erreurs sur 4, 5 → la demi-droite graduée n'est pas encore un outil de comparaison et de repérage opérationnel.",
        "Erreurs sur 6 → le biais entier sur le calcul est toujours actif ; la conversion par équivalence doit être retravaillée avec des supports matériels.",
        "Erreurs sur 7, 8 → la fraction comme opérateur n'est pas encore construite ; prévoir des situations de partage de quantités concrètes (recettes, mesures).",
    ],
};

export const exercices = [
    // ── Exercice 1 ────────────────────────────────────────────────────────────
    {
        numero: 1,
        titre: "Cette fraction est-elle plus grande que 1 ?",
        competence:
            "Identifier si une fraction est inférieure, égale ou supérieure à 1",
        type: "compound",
        consigne:
            "Pour chaque fraction, entoure la bonne réponse sans poser de calcul. Explique ta réponse en une phrase.",
        sousQuestions: [
            {
                id: "a",
                type: "binary_choice",
                fraction: { n: 3, d: 4 },
                consigne: "3/4 →",
                options: [
                    "plus petite que 1",
                    "égale à 1",
                    "plus grande que 1",
                ],
                attendu: "plus petite que 1",
                avecJustification: true,
                biaisDetectables: [],
                aRelire: true,
            },
            {
                id: "b",
                type: "binary_choice",
                fraction: { n: 7, d: 7 },
                consigne: "7/7 →",
                options: [
                    "plus petite que 1",
                    "égale à 1",
                    "plus grande que 1",
                ],
                attendu: "égale à 1",
                avecJustification: true,
                biaisDetectables: [
                    {
                        code: "N_SUR_N_NON_ACQUIS",
                        declencheur: {
                            type: "choice_equals",
                            valeur: "plus petite que 1",
                        },
                        ceQueRevele:
                            "Répondre « plus petite que 1 » pour 7/7 → n/n = 1 non acquis.",
                    },
                ],
                aRelire: true,
            },
            {
                id: "c",
                type: "binary_choice",
                fraction: { n: 9, d: 4 },
                consigne: "9/4 →",
                options: [
                    "plus petite que 1",
                    "égale à 1",
                    "plus grande que 1",
                ],
                attendu: "plus grande que 1",
                avecJustification: true,
                biaisDetectables: [
                    {
                        code: "FRACTION_TOUJOURS_INF_1",
                        declencheur: {
                            type: "choice_equals",
                            valeur: "plus petite que 1",
                        },
                        ceQueRevele:
                            "Répondre « plus petite que 1 » pour 9/4 → fraction perçue comme toujours < 1.",
                    },
                ],
                aRelire: true,
            },
            {
                id: "d",
                type: "binary_choice",
                fraction: { n: 5, d: 8 },
                consigne: "5/8 →",
                options: [
                    "plus petite que 1",
                    "égale à 1",
                    "plus grande que 1",
                ],
                attendu: "plus petite que 1",
                avecJustification: true,
                biaisDetectables: [],
                aRelire: true,
            },
            {
                id: "e",
                type: "binary_choice",
                fraction: { n: 12, d: 10 },
                consigne: "12/10 →",
                options: [
                    "plus petite que 1",
                    "égale à 1",
                    "plus grande que 1",
                ],
                attendu: "plus grande que 1",
                avecJustification: true,
                biaisDetectables: [
                    {
                        code: "FRACTION_TOUJOURS_INF_1",
                        declencheur: {
                            type: "choice_equals",
                            valeur: "plus petite que 1",
                        },
                        ceQueRevele:
                            "Répondre « plus petite que 1 » pour 12/10 → même obstacle que pour 9/4.",
                    },
                ],
                aRelire: true,
            },
        ],
        aRelire: false,
    },

    // ── Exercice 2 ────────────────────────────────────────────────────────────
    {
        numero: 2,
        titre: "Décompose cette fraction",
        competence:
            "Écrire une fraction supérieure à 1 comme somme d'un entier et d'une fraction inférieure à 1",
        type: "compound",
        consigne: "Complète les phrases et les égalités.",
        sousQuestions: [
            // ── a : 7/4 de pizza ─────────────────────────────────────────────
            {
                id: "a",
                type: "compound",
                consigne:
                    "7/4 de pizza, c'est ______ pizza(s) entière(s) et ______ quart(s) de pizza.\nOn écrit : 7/4 = ______ + ______",
                sousQuestions: [
                    {
                        id: "a_entier",
                        type: "number_input",
                        consigne: "Nombre de pizzas entières :",
                        unite: "pizza(s) entière(s)",
                        attendu: 1,
                        biaisDetectables: [],
                        aRelire: false,
                    },
                    {
                        id: "a_fraction",
                        type: "fraction_input",
                        consigne: "Fraction restante :",
                        items: [
                            {
                                id: "resultat",
                                attendu: { numerateur: 3, denominateur: 4 },
                            },
                        ],
                        biaisDetectables: [],
                        aRelire: false,
                    },
                ],
                biaisDetectables: [],
                aRelire: true,
            },

            // ── b : 9/3 = entier ──────────────────────────────────────────────
            {
                id: "b",
                type: "number_input",
                consigne: "9/3 =",
                // Attendu : 3. Un entier, pas une fraction.
                // L'élève qui bloque révèle que n/n = 1 n'est pas généralisé.
                attendu: 3,
                biaisDetectables: [
                    {
                        code: "N_SUR_N_NON_ACQUIS",
                        declencheur: { type: "text_review" },
                        ceQueRevele:
                            "Bloquer ou donner une valeur ≠ 3 → 9/3 = 3 non reconnu ; n/n = 1 non généralisé.",
                    },
                ],
                aRelire: true,
            },

            // ── c : 11/4 = entier + fraction ──────────────────────────────────
            {
                id: "c",
                type: "compound",
                consigne:
                    "11/4 = ______ + ______\nÉcris maintenant 11/4 autrement en une seule phrase.",
                sousQuestions: [
                    {
                        id: "c_entier",
                        type: "number_input",
                        consigne: "Partie entière :",
                        attendu: 2,
                        biaisDetectables: [],
                        aRelire: false,
                    },
                    {
                        id: "c_fraction",
                        type: "fraction_input",
                        consigne: "Fraction restante :",
                        items: [
                            {
                                id: "resultat",
                                attendu: { numerateur: 3, denominateur: 4 },
                            },
                        ],
                        biaisDetectables: [
                            {
                                code: "N_SUR_N_NON_ACQUIS",
                                declencheur: {
                                    type: "item_fraction_equals",
                                    itemId: "resultat",
                                    numerateur: 4,
                                    denominateur: 4,
                                },
                                ceQueRevele:
                                    "Répondre 11/4 = 2 + 4/4 → 4/4 = 1 non connecté à l'entier ; conservation du dénominateur non stabilisée.",
                            },
                        ],
                        aRelire: false,
                    },
                    {
                        id: "c_phrase",
                        type: "text",
                        consigne: "Écris 11/4 autrement en une seule phrase :",
                        biaisDetectables: [],
                        aRelire: true,
                    },
                ],
                biaisDetectables: [],
                aRelire: true,
            },
        ],
        aRelire: false,
    },

    // ── Exercice 3 ────────────────────────────────────────────────────────────
    {
        numero: 3,
        titre: "Place ces fractions sur la demi-droite graduée",
        competence:
            "Placer des fractions (dont des fractions > 1) sur une demi-droite graduée",
        type: "number_line",
        consigne:
            "Voici une demi-droite graduée avec l'unité. Les graduations sont en quarts. Place chaque fraction au bon endroit et écris son écriture à côté du point.",
        graduation: { denominateur: 4, min: 0, max: 2 },
        fractionsAplacer: [
            { n: 3, d: 4 },
            { n: 5, d: 4 },
            { n: 8, d: 4 },
            { n: 7, d: 4 },
            { n: 4, d: 4 },
        ],
        biaisDetectables: [
            {
                code: "REFUS_DEPASSER_UNITE",
                declencheur: {
                    type: "position_range",
                    fraction: { n: 5, d: 4 },
                    maxPosition: 1.0,
                },
                ceQueRevele:
                    "Placer 5/4 entre 0 et 1 → refus ou incapacité à dépasser l'unité.",
            },
            {
                code: "N_SUR_N_NON_ACQUIS",
                declencheur: {
                    type: "position_wrong",
                    fraction: { n: 4, d: 4 },
                },
                ceQueRevele:
                    "Placer 4/4 entre 3/4 et 5/4 sans reconnaître que 4/4 = 1 → obstacle fondamental sur l'égalité à 1.",
            },
        ],
        aRelire: false,
    },

    // ── Exercice 4 ────────────────────────────────────────────────────────────
    {
        numero: 4,
        titre: "Quel nombre est ce point ?",
        competence:
            "Repérer une fraction à partir d'un point placé sur la demi-droite graduée",
        type: "compound",
        consigne:
            "Voici une demi-droite graduée en tiers. Trois points A, B et C sont placés dessus.",
        figureSupportId: "demi_droite_tiers",
        sousQuestions: [
            {
                id: "a",
                type: "fraction_input",
                consigne: "Quelle fraction correspond au point A ?",
                items: [
                    {
                        id: "resultat",
                        attendu: { numerateur: 2, denominateur: 3 },
                    },
                ],
                biaisDetectables: [],
                aRelire: false,
            },
            {
                id: "b",
                type: "fraction_input",
                consigne: "Quelle fraction correspond au point B ?",
                items: [
                    {
                        id: "resultat",
                        attendu: { numerateur: 5, denominateur: 3 },
                    },
                ],
                biaisDetectables: [
                    {
                        code: "FRACTION_TOUJOURS_INF_1",
                        declencheur: { type: "text_review" },
                        ceQueRevele:
                            "Répondre une fraction < 1 pour B → l'élève refuse de lire une valeur supérieure à l'unité sur la droite.",
                    },
                ],
                aRelire: true,
            },
            {
                id: "c",
                type: "fraction_input",
                consigne: "Quelle fraction correspond au point C ?",
                items: [
                    {
                        id: "resultat",
                        attendu: { numerateur: 6, denominateur: 3 },
                    },
                ],
                biaisDetectables: [
                    {
                        code: "N_SUR_N_NON_ACQUIS",
                        declencheur: {
                            type: "item_fraction_equals",
                            itemId: "resultat",
                            numerateur: 2,
                            denominateur: 1,
                        },
                        ceQueRevele:
                            "Répondre 6/3 sans reconnaître que 6/3 = 2 → connexion fraction / entier non disponible.",
                    },
                ],
                aRelire: false,
            },
        ],
        aRelire: false,
    },

    // ── Exercice 5 ────────────────────────────────────────────────────────────
    {
        numero: 5,
        titre: "Range ces fractions",
        competence:
            "Comparer des fractions (de même numérateur, de même dénominateur, dont l'un est multiple de l'autre, y compris > 1)",
        type: "text",
        consigne:
            "Range ces fractions de la plus petite à la plus grande. Explique ta stratégie.",
        fractions: [
            { n: 3, d: 4 },
            { n: 5, d: 4 },
            { n: 3, d: 8 },
            { n: 7, d: 4 },
            { n: 3, d: 2 },
        ],
        ordreAttendu: ["3/8", "3/4", "5/4", "3/2", "7/4"],
        biaisDetectables: [
            {
                code: "BIAIS_ENTIER_DENOMINATEUR",
                declencheur: { type: "text_review" },
                ceQueRevele:
                    "Placer 3/2 après 7/4 « car 2 < 4 » → biais entier sur le dénominateur.",
            },
        ],
        aRelire: true,
    },

    // ── Exercice 6 ────────────────────────────────────────────────────────────
    {
        numero: 6,
        titre: "Calcule en expliquant",
        competence:
            "Additionner et soustraire des fractions (dénominateur dont l'un est multiple de l'autre)",
        type: "compound",
        consigne: "Calcule et explique chaque étape avec des mots.",
        sousQuestions: [
            {
                id: "a",
                type: "fraction_input",
                consigne: "3/4 + 1/2 = ______",
                items: [
                    {
                        id: "resultat",
                        attendu: { numerateur: 5, denominateur: 4 },
                    },
                ],
                biaisDetectables: [
                    {
                        code: "ADDITION_DENOMINATEURS",
                        declencheur: {
                            type: "item_fraction_equals",
                            itemId: "resultat",
                            numerateur: 4,
                            denominateur: 6,
                        },
                        ceQueRevele:
                            "Répondre 4/6 → addition des numérateurs et des dénominateurs ; biais entier emblématique.",
                    },
                ],
                aRelire: true,
            },
            {
                id: "b",
                type: "fraction_input",
                consigne: "7/4 − 1/2 = ______",
                items: [
                    {
                        id: "resultat",
                        attendu: { numerateur: 5, denominateur: 4 },
                    },
                ],
                biaisDetectables: [
                    {
                        code: "ADDITION_DENOMINATEURS",
                        declencheur: {
                            type: "item_fraction_equals",
                            itemId: "resultat",
                            numerateur: 6,
                            denominateur: 2,
                        },
                        ceQueRevele:
                            "Répondre 6/2 → soustraction des numérateurs et opération erronée sur les dénominateurs.",
                    },
                ],
                aRelire: true,
            },
            {
                id: "c",
                type: "compound",
                consigne:
                    "Nina part de son école vers un parc situé à 1 unité. " +
                    "Le matin, elle marche 3/4 d'unité. L'après-midi, elle marche encore 3/4 d'unité. " +
                    "Quelle fraction d'unité a-t-elle marchée en tout ? A-t-elle dépassé le parc ?",
                sousQuestions: [
                    {
                        id: "c_calcul",
                        type: "fraction_input",
                        consigne: "Fraction marchée en tout :",
                        items: [
                            {
                                id: "resultat",
                                attendu: { numerateur: 6, denominateur: 4 },
                            },
                        ],
                        biaisDetectables: [
                            {
                                code: "ADDITION_DENOMINATEURS",
                                declencheur: {
                                    type: "item_fraction_equals",
                                    itemId: "resultat",
                                    numerateur: 6,
                                    denominateur: 8,
                                },
                                ceQueRevele:
                                    "Répondre 6/8 → biais entier sur l'addition.",
                            },
                        ],
                        aRelire: false,
                    },
                    {
                        id: "c_comparaison",
                        // Reformulé : "dépassé le parc" plutôt que "plus ou moins que 1 unité"
                        // — le parc est un repère concret, pas une borne abstraite
                        type: "binary_choice",
                        consigne: "A-t-elle dépassé le parc ?",
                        options: ["OUI", "NON"],
                        attendu: "OUI",
                        biaisDetectables: [],
                        aRelire: false,
                    },
                ],
                aRelire: false,
            },
            ,
        ],
        aRelire: false,
    },

    // ── Exercice 7 ────────────────────────────────────────────────────────────
    {
        numero: 7,
        titre: "La fraction d'une quantité",
        competence:
            "Déterminer une fraction unitaire d'une quantité ou d'une grandeur (fraction comme opérateur)",
        type: "compound",
        consigne: null,
        sousQuestions: [
            {
                id: "a",
                type: "number_input",
                consigne:
                    "Une étagère mesure 60 cm. Quelle est la longueur d'un quart de cette étagère ?",
                unite: "cm",
                attendu: 15,
                biaisDetectables: [
                    {
                        code: "FRACTION_OPERATEUR_NON_CONSTRUITE",
                        declencheur: { type: "text_review" },
                        ceQueRevele:
                            "Répondre 56 (60 − 4) ou 64 (60 + 4) → la fraction traitée comme un entier à additionner ou soustraire.",
                    },
                ],
                aRelire: true,
            },
            {
                id: "b",
                type: "number_input",
                consigne:
                    "Dans un panier, il y a 12 œufs. Un tiers des œufs est cassé. Combien d'œufs sont cassés ?",
                unite: "œufs",
                attendu: 4,
                biaisDetectables: [
                    {
                        code: "FRACTION_OPERATEUR_NON_CONSTRUITE",
                        declencheur: { type: "text_review" },
                        ceQueRevele:
                            "Répondre 3 ou 4 par confusion numérateur/dénominateur → sens du dénominateur non stabilisé.",
                    },
                ],
                aRelire: true,
            },
            {
                id: "c",
                type: "number_input",
                consigne: "1/5 de 500 g de farine, c'est combien ?",
                unite: "g",
                attendu: 100,
                biaisDetectables: [],
                aRelire: true,
            },
            {
                id: "d",
                type: "text",
                consigne:
                    "Peux-tu trouver 1/4 de 10 mètres ? Explique ta méthode.",
                // Attendu : 2,5 m ou 2 + 1/2 m
                biaisDetectables: [
                    {
                        code: "FRACTION_OPERATEUR_NON_CONSTRUITE",
                        declencheur: { type: "text_review" },
                        ceQueRevele:
                            "Bloquer car 10 n'est pas divisible par 4 « en nombre entier » → l'élève n'accepte pas le résultat fractionnaire 2,5 m ou 2 + 1/2 m ; la fraction comme mesure non entière n'est pas disponible.",
                    },
                ],
                aRelire: true,
            },
        ],
        aRelire: true,
    },

    // ── Exercice 8 ────────────────────────────────────────────────────────────
    {
        numero: 8,
        titre: "Un problème à plusieurs étapes",
        competence:
            "Mobiliser la fraction avec des sens variés (partie d'un tout, mesure, opérateur) dans un problème",
        type: "compound",
        consigne:
            "Un sentier de randonnée passe devant un refuge situé à 1 unité du départ. " +
            "Trois randonneurs partent du même point pour une journée de marche.\n\n" +
            "Lou marche 3/4 d'unité le matin et 1/4 d'unité l'après-midi.\n" +
            "Max marche 3/4 d'unité le matin et 2/4 d'unité l'après-midi.\n" +
            "Éva marche 1/4 d'unité quatre fois de suite.",
        sousQuestions: [
            {
                id: "a",
                type: "binary_choice",
                consigne: "Lou arrive-t-il exactement au refuge ? Justifie.",
                options: ["OUI", "NON"],
                attendu: "OUI",
                avecJustification: true,
                biaisDetectables: [
                    {
                        code: "ADDITION_DENOMINATEURS",
                        declencheur: { type: "choice_equals", valeur: "NON" },
                        ceQueRevele:
                            "Répondre NON → additionner 3/4 + 1/4 = 4/8 sans identifier 4/4 = 1.",
                    },
                ],
                aRelire: true,
            },
            {
                id: "b",
                type: "compound",
                consigne: "Max dépasse-t-il le refuge ?",
                sousQuestions: [
                    {
                        id: "b_choix",
                        type: "binary_choice",
                        consigne: "Max dépasse-t-il le refuge ?",
                        options: ["OUI", "NON"],
                        attendu: "OUI",
                        biaisDetectables: [],
                        aRelire: false,
                    },
                    {
                        id: "b_depassement",
                        type: "fraction_input",
                        consigne: "De combien d'unité dépasse-t-il le refuge ?",
                        items: [
                            {
                                id: "resultat",
                                attendu: { numerateur: 1, denominateur: 4 },
                            },
                        ],
                        biaisDetectables: [],
                        aRelire: true,
                    },
                ],
                aRelire: false,
            },
            {
                id: "c",
                type: "binary_choice",
                consigne:
                    "Éva arrive-t-elle au même endroit que Lou ? Montre-le.",
                options: ["OUI", "NON"],
                attendu: "OUI",
                avecJustification: true,
                biaisDetectables: [],
                aRelire: true,
            },
        ],
        aRelire: false,
    },
];
