/**
 * @fileoverview Dictionnaire des codes biais auto-détectables.
 *
 * Source : exercices diagnostiques CE1–CM2, conseils de passation.
 * Ces 14 codes sont les seuls pour lesquels une détection automatique
 * fiable est possible à partir de la réponse numérique de l'élève.
 * Tout autre obstacle didactique est traité en « aRelire ».
 */

/** @typedef {{ code: string, intitule: string, description: string, niveaux: string[] }} BiaisDefinition */

/** @type {Record<string, BiaisDefinition>} */
export const BIAIS = {
    EQUIPARTITION: {
        code: "EQUIPARTITION",
        intitule: "Équipartition non acquise",
        description:
            "L'élève accepte des parts inégales comme valides pour représenter une fraction.",
        niveaux: ["CE1"],
    },

    INVERSION_NUM_DENOM: {
        code: "INVERSION_NUM_DENOM",
        intitule: "Inversion numérateur / dénominateur",
        description: "L'élève écrit numérateur et dénominateur inversés.",
        niveaux: ["CE1", "CM2"],
    },

    BIAIS_ENTIER_DENOMINATEUR: {
        code: "BIAIS_ENTIER_DENOMINATEUR",
        intitule: "Biais entier sur le dénominateur",
        description:
            "L'élève raisonne sur les entiers du dénominateur : plus grand dénominateur = plus grande fraction.",
        niveaux: ["CE1", "CE2", "CM1", "CM2"],
    },

    ADDITION_DENOMINATEURS: {
        code: "ADDITION_DENOMINATEURS",
        intitule: "Addition des dénominateurs",
        description:
            "L'élève additionne les dénominateurs comme des entiers (ex. : 1/5 + 2/5 = 3/10).",
        niveaux: ["CE1", "CE2", "CM1", "CM2"],
    },

    ABSENCE_COMPLEMENT_A_1: {
        code: "ABSENCE_COMPLEMENT_A_1",
        intitule: "Absence du sens du complément à 1",
        description:
            "L'élève ne sait pas calculer le complément d'une fraction à 1.",
        niveaux: ["CE1"],
    },

    EQUIVALENCE_NON_GENERALISEE: {
        code: "EQUIVALENCE_NON_GENERALISEE",
        intitule: "Équivalence non généralisée",
        description:
            "L'élève ne reconnaît les fractions égales que pour les multiples évidents (× 2, × 3).",
        niveaux: ["CE2", "CM2"],
    },

    FRACTION_PAS_MESURE: {
        code: "FRACTION_PAS_MESURE",
        intitule: "Fraction non vécue comme mesure",
        description:
            "L'élève ne perçoit pas la fraction comme une mesure positionnée sur la droite graduée.",
        niveaux: ["CE2"],
    },

    FRACTION_TOUJOURS_INF_1: {
        code: "FRACTION_TOUJOURS_INF_1",
        intitule: "Fraction toujours inférieure à 1",
        description:
            "L'élève considère qu'une fraction est toujours inférieure à 1.",
        niveaux: ["CM1"],
    },

    N_SUR_N_NON_ACQUIS: {
        code: "N_SUR_N_NON_ACQUIS",
        intitule: "n/n = 1 non acquis",
        description: "L'élève ne reconnaît pas que n/n = 1.",
        niveaux: ["CM1", "CM2"],
    },

    REFUS_DEPASSER_UNITE: {
        code: "REFUS_DEPASSER_UNITE",
        intitule: "Refus de dépasser l'unité",
        description:
            "L'élève place une fraction > 1 entre 0 et 1 sur la droite graduée.",
        niveaux: ["CM1"],
    },

    FRACTION_OPERATEUR_NON_CONSTRUITE: {
        code: "FRACTION_OPERATEUR_NON_CONSTRUITE",
        intitule: "Fraction-opérateur non construite",
        description:
            "L'élève traite la fraction comme un entier à additionner ou soustraire à la quantité.",
        niveaux: ["CM1"],
    },

    EQUIVALENCE_PARTIELLE: {
        code: "EQUIVALENCE_PARTIELLE",
        intitule: "Équivalence partielle",
        description:
            "L'élève ne reconnaît pas les équivalences au-delà des multiples évidents (× 2, × 3).",
        niveaux: ["CM2"],
    },

    FRACTION_OP_NON_UNITAIRE: {
        code: "FRACTION_OP_NON_UNITAIRE",
        intitule: "Fraction opérateur non unitaire non construite",
        description:
            "L'élève réduit la fraction non unitaire à sa fraction unitaire (oubli du numérateur).",
        niveaux: ["CM2"],
    },

    SENS_RAPPORT_TAUX_ABSENT: {
        code: "SENS_RAPPORT_TAUX_ABSENT",
        intitule: "Sens rapport/taux absent",
        description: "L'élève confond fraction-rapport et nombre absolu.",
        niveaux: ["CM2"],
    },
};

/**
 * Retourne la définition d'un biais à partir de son code.
 * @param {string} code
 * @returns {BiaisDefinition | undefined}
 */
export function getBiais(code) {
    return BIAIS[code];
}
