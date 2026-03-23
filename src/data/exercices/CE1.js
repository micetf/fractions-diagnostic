/**
 * @fileoverview Exercices diagnostiques — Fractions CE1.
 *
 * Source : « Exercices diagnostiques — Fractions CE1 »
 * Cadre de référence : programme de mathématiques cycle 2,
 * BO n° 41 du 31 octobre 2024, et Passeur de Monica Neagoy.
 * Destinés aux élèves de CE1 en fin d'année (période 4–5).
 */

/**
 * Métadonnées de niveau issues des conseils de passation.
 * Textes verbatim du document source.
 */
export const metadonnees = {
    niveau: "CE1",
    cadreReference:
        "Programme de mathématiques cycle 2, BO n° 41 du 31 octobre 2024",
    passation: {
        format: "Passation individuelle écrite, sans manipulation autorisée (les erreurs doivent apparaître spontanément).",
        dureeMinutes: { min: 25, max: 30 },
        periode: "Fin d'année (période 4 ou 5)",
        recommandationSelection: null,
    },
    conseilsAnalyse: [
        "Les erreurs sur les exercices 1, 2, 6 indiquent des manques sur les fondamentaux (équipartition, unité de référence) et nécessitent un retour à la manipulation avant tout autre enseignement.",
        "Les erreurs sur 4 et 7 signalent le biais entier, le plus tenace et le plus documenté.",
        "Les erreurs sur 5 et 8 révèlent une fragilité dans le sens de l'unité et du complément à 1.",
    ],
};

/**
 * @type {Array<import('../types').Exercice>}
 */
export const exercices = [
    // ── Exercice 1 ────────────────────────────────────────────────────────────
    {
        numero: 1,
        titre: "Laquelle montre bien 1/4 ?",
        competence: "Identifier les figures représentant la fraction 1/4",
        type: "selection",
        consigne:
            "Voici 4 rectangles. Dans certains, une partie est coloriée. Entoure seulement les rectangles qui montrent 1/4 du rectangle.",
        figures: [
            {
                id: "A",
                description:
                    "Rectangle partagé en 4 parts égales, 1 part coloriée",
                correct: true,
            },
            {
                id: "B",
                description:
                    "Rectangle partagé en 4 parts inégales, 1 part coloriée",
                correct: false,
            },
            {
                id: "C",
                description:
                    "Rectangle partagé en 4 parts égales, 3 parts coloriées",
                correct: false,
            },
            {
                id: "D",
                description:
                    "Rectangle partagé en 4 parts égales, 1 part coloriée, figure orientée à l'envers",
                correct: true,
            },
        ],
        reponsesAttendues: ["A", "D"],
        biaisDetectables: [
            {
                code: "EQUIPARTITION",
                declencheur: { type: "selection_includes", valeur: "B" },
                ceQueRevele:
                    "Entourer B indique que l'élève n'a pas intégré la condition d'équipartition, fondamentale avant toute écriture fractionnaire. Ne pas entourer D indique une représentation rigide liée à l'orientation de la figure.",
            },
        ],
        aRelire: false,
    },

    // ── Exercice 2 ────────────────────────────────────────────────────────────
    {
        numero: 2,
        titre: "Quelle fraction est coloriée ?",
        competence: "Lire et écrire une fraction à partir d'une représentation",
        type: "fraction_input",
        consigne:
            "Dans chaque figure, une partie est coloriée. Écris la fraction qui correspond à la partie coloriée.",
        items: [
            {
                id: "A",
                description:
                    "Bande partagée en 5 parts égales, 2 parts coloriées",
                attendu: { numerateur: 2, denominateur: 5 },
            },
            {
                id: "B",
                description:
                    "Disque partagé en 6 parts égales, 1 part coloriée",
                attendu: { numerateur: 1, denominateur: 6 },
            },
            {
                id: "C",
                description:
                    "Bande partagée en 8 parts égales, 3 parts coloriées",
                attendu: { numerateur: 3, denominateur: 8 },
            },
        ],
        biaisDetectables: [
            {
                code: "INVERSION_NUM_DENOM",
                // Détection sur l'item A uniquement (cas le plus documenté dans la source)
                declencheur: {
                    type: "item_fraction_equals",
                    itemId: "A",
                    numerateur: 5,
                    denominateur: 2,
                },
                ceQueRevele:
                    "Inverser numérateur et dénominateur (ex. : 5/2 pour A) → le sens des termes n'est pas stabilisé.",
            },
        ],
        aRelire: false,
    },

    // ── Exercice 3 ────────────────────────────────────────────────────────────
    {
        numero: 3,
        titre: "C'est toujours 1/2 ?",
        competence:
            "Reconnaître qu'une même fraction peut être représentée de différentes manières",
        type: "coloring",
        consigne: "Colorie 1/2 de chaque figure.",
        figures: [
            { id: "A", description: "Rectangle horizontal", nbParts: 2 },
            { id: "B", description: "Disque", nbParts: 2 },
            {
                id: "C",
                description: "Bande de 6 cases",
                nbParts: 6,
                partiesAttendues: 3,
            },
            {
                id: "D",
                description:
                    "Triangle équilatéral partagé en 2 parties égales par un axe de symétrie",
                nbParts: 2,
            },
        ],
        // Coloriages libres → détection impossible automatiquement
        biaisDetectables: [],
        aRelire: true,
    },

    // ── Exercice 4 ────────────────────────────────────────────────────────────
    {
        numero: 4,
        titre: "Laquelle est la plus grande ?",
        competence: "Comparer des fractions dont le numérateur est 1",
        type: "binary_choice",
        consigne:
            "Chaque enfant a une barre de chocolat de la même taille. Lola a mangé 1/3 de sa barre. Tom a mangé 1/6 de sa barre. Qui a mangé le plus ? Entoure la bonne réponse et complète la phrase.",
        options: ["Lola", "Tom"],
        attendu: "Lola",
        // La justification textuelle nécessite une relecture enseignant
        avecJustification: true,
        biaisDetectables: [
            {
                code: "BIAIS_ENTIER_DENOMINATEUR",
                declencheur: { type: "choice_equals", valeur: "Tom" },
                ceQueRevele:
                    "Choisir Tom « parce que 6 est plus grand que 3 » → biais classique du raisonnement sur les entiers appliqué aux fractions : plus le dénominateur est grand, plus les parts sont petites.",
            },
        ],
        aRelire: true,
    },

    // ── Exercice 5 ────────────────────────────────────────────────────────────
    {
        numero: 5,
        titre: "Colorie et écris",
        competence: "Écrire et représenter des fractions non unitaires",
        type: "compound",
        consigne: "Voici une bande partagée en 5 parts égales.",
        sousQuestions: [
            {
                id: "coloriage",
                type: "coloring",
                consigne: "Colorie 3 parts.",
                nbParts: 5,
                partiesAColorier: 3,
                biaisDetectables: [],
                aRelire: true,
            },
            {
                id: "fraction_coloriee",
                type: "fraction_input",
                consigne:
                    "Écris la fraction qui correspond à la partie que tu as coloriée :",
                attendu: { numerateur: 3, denominateur: 5 },
                biaisDetectables: [
                    {
                        code: "INVERSION_NUM_DENOM",
                        declencheur: {
                            type: "fraction_equals",
                            numerateur: 5,
                            denominateur: 3,
                        },
                        ceQueRevele:
                            "Écrire 3/2 ou 3/3 → numérateur et dénominateur confondus.",
                    },
                ],
                aRelire: false,
            },
            {
                id: "fraction_non_coloriee",
                type: "fraction_input",
                consigne:
                    "Écris la fraction qui correspond à la partie que tu n'as pas coloriée :",
                attendu: { numerateur: 2, denominateur: 5 },
                biaisDetectables: [
                    {
                        // L'élève écrit 2/3 : 2 parts restantes sur 3 coloriées (au lieu de 5 au total)
                        code: "INVERSION_NUM_DENOM",
                        declencheur: {
                            type: "fraction_equals",
                            numerateur: 2,
                            denominateur: 3,
                        },
                        ceQueRevele:
                            "Écrire 2/3 → l'unité de référence est prise sur les parts coloriées et non sur le tout.",
                    },
                ],
                aRelire: false,
            },
            {
                id: "verification",
                type: "binary_choice",
                consigne: "Vérifie : les deux fractions font-elles le tout ?",
                options: ["OUI", "NON"],
                attendu: "OUI",
                biaisDetectables: [
                    {
                        code: "ABSENCE_COMPLEMENT_A_1",
                        declencheur: { type: "choice_equals", valeur: "NON" },
                        ceQueRevele:
                            "Répondre NON à la vérification → absence du sens de 5/5 = 1.",
                    },
                ],
                aRelire: false,
            },
        ],
        aRelire: true,
    },

    // ── Exercice 6 ────────────────────────────────────────────────────────────
    {
        numero: 6,
        titre: "Le tout change tout",
        competence:
            "Comprendre que la fraction est définie par rapport à un tout",
        type: "compound",
        consigne: "Voici un demi-disque.",
        sousQuestions: [
            {
                id: "question_A",
                type: "fraction_input",
                consigne:
                    "Si le tout est 1 disque entier, quelle fraction représente ce demi-disque ?",
                attendu: { numerateur: 1, denominateur: 2 },
                biaisDetectables: [],
                aRelire: false,
            },
            {
                id: "question_B_choix",
                type: "binary_choice",
                consigne:
                    "Si le tout est 2 disques entiers, est-ce que la réponse change ?",
                options: ["OUI", "NON"],
                attendu: "OUI",
                biaisDetectables: [],
                // Note source : ne pas donner l'écriture fractionnaire attendue pour B ;
                // l'objectif est que l'élève perçoive que la fraction dépend du tout choisi.
                aRelire: false,
            },
            {
                id: "question_B_fraction",
                type: "fraction_input",
                consigne:
                    "Si oui, quelle fraction représente maintenant ce demi-disque ?",
                // La source précise de ne pas donner la réponse attendue → relecture enseignant
                attendu: null,
                biaisDetectables: [],
                aRelire: true,
            },
        ],
        // Note : répondre systématiquement 1/2 quelle que soit la question,
        // ou NON en B → indicateur fort d'absence de travail sur la définition du tout.
        // Détection manuelle par l'enseignant (aRelire).
        aRelire: true,
    },

    // ── Exercice 7 ────────────────────────────────────────────────────────────
    {
        numero: 7,
        titre: "On ajoute des fractions",
        competence: "Additionner des fractions de même dénominateur",
        type: "fraction_input",
        consigne:
            "Lucie a mangé 1/5 d'un gâteau. Son frère a mangé 2/5 du même gâteau. Quelle fraction du gâteau ont-ils mangée en tout ? Complète : ils ont mangé ______ du gâteau. Explique avec un dessin ou des mots comment tu as trouvé.",
        items: [
            {
                id: "resultat",
                description: "Fraction totale mangée",
                attendu: { numerateur: 3, denominateur: 5 },
            },
        ],
        biaisDetectables: [
            {
                code: "ADDITION_DENOMINATEURS",
                declencheur: {
                    type: "item_fraction_equals",
                    itemId: "resultat",
                    numerateur: 3,
                    denominateur: 10,
                },
                ceQueRevele:
                    "Répondre 3/10 → addition des numérateurs et des dénominateurs, biais du raisonnement sur les entiers appliqué aux fractions. C'est l'erreur la plus fréquente et la plus emblématique : l'élève traite la fraction comme deux nombres séparés.",
            },
        ],
        aRelire: true,
    },

    // ── Exercice 8 ────────────────────────────────────────────────────────────
    {
        numero: 8,
        titre: "Il reste combien ?",
        competence: "Trouver le complément d'une fraction par rapport au tout",
        type: "fraction_input",
        consigne:
            "Marc a colorié 3/10 d'une figure en bleu. Il veut colorier le reste en rouge. Quelle fraction de la figure va-t-il colorier en rouge ? Explique comment tu as trouvé.",
        items: [
            {
                id: "resultat",
                description: "Fraction à colorier en rouge",
                attendu: { numerateur: 7, denominateur: 10 },
            },
        ],
        biaisDetectables: [
            {
                code: "ABSENCE_COMPLEMENT_A_1",
                // L'élève répond la même fraction (symétrie perçue)
                declencheur: {
                    type: "item_fraction_equals",
                    itemId: "resultat",
                    numerateur: 3,
                    denominateur: 10,
                },
                ceQueRevele:
                    "Répondre 3/10 (même fraction, par symétrie perçue) ou 7/7 → absence du sens « le tout = 10/10 ».",
            },
        ],
        aRelire: true,
    },
];
