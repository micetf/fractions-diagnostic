/**
 * @fileoverview Fabrique de valeurs initiales pour les composants de passation.
 *
 * Chaque exercice (ou sous-question) reçoit une valeur initiale typée
 * correspondant exactement à ce que l'élève va produire.
 * Ces structures sont aussi celles stockées dans ReponseExercice.valeur_brute.
 */

/**
 * Retourne la valeur initiale correspondant au type d'un nœud
 * (exercice ou sous-question).
 *
 * @param {object} node - Exercice ou sous-question issu des fichiers data.
 * @returns {any}
 */
export function getInitialValue(node) {
    switch (node.type) {
        case "fraction_input":
            if (node.items?.length > 0) {
                const base = Object.fromEntries(
                    node.items.map((item) => [
                        item.id,
                        { numerateur: null, denominateur: null },
                    ])
                );
                // Réserver la clé __explication si l'exercice demande une justification
                if (node.aRelire) base.__explication = "";
                return base;
            }
            return { numerateur: null, denominateur: null };

        case "binary_choice":
            // texte toujours présent — ignoré si avecJustification est absent
            return { choix: null, texte: "" };

        case "selection":
            // Si l'exercice nécessite une justification, on initialise aussi ce champ
            if (node.aRelire) return { selection: [], __justification: "" };
            return [];

        case "coloring": {
            // Fractions > 1 : nbUnites × partsParUnite cases (CM2 Ex.1)
            if (node.nbUnites && node.partsParUnite) {
                return Array(node.nbUnites * node.partsParUnite).fill(false);
            }
            // Multi-figures (CE1 Ex.3…) : objet { [id]: boolean[] }
            if (node.figures) {
                return Object.fromEntries(
                    node.figures.map((f) => [
                        f.id,
                        Array(f.nbParts ?? 2).fill(false),
                    ])
                );
            }
            // Figure unique standard
            return Array(node.nbParts ?? node.partiesAColorier ?? 2).fill(
                false
            );
        }

        case "number_line":
            if (node.fractionsAplacer?.length > 0) {
                return Object.fromEntries(
                    node.fractionsAplacer.map((f) => [`${f.n}/${f.d}`, null])
                );
            }
            return null;

        case "compound":
            return Object.fromEntries(
                (node.sousQuestions ?? []).map((sq) => [
                    sq.id,
                    getInitialValue(sq),
                ])
            );

        case "encadrement":
            return { inf: "", sup: "" };

        case "decomposition_addition":
        case "decomposition_soustraction":
            return { entier: "", num: "", den: "" };

        case "text":
            if (node.comparaisons?.length > 0) {
                const base = Object.fromEntries(
                    node.comparaisons.map((c) => [c.id, null])
                );
                base.__explication = "";
                return base;
            }
            // Fractions avec prénoms (CE2 Ex.5) → ordre initial = ordre de la source
            if (node.fractionsDocumentees?.length > 0) {
                return {
                    ordre: node.fractionsDocumentees.map((it) => it.prenom),
                    explication: "",
                };
            }
            // Fractions seules (CM1 Ex.5, CM2 Ex.5) → ordre initial = ordre de la source
            if (node.fractions?.length > 0) {
                return {
                    ordre: node.fractions.map((f) => `${f.n}/${f.d}`),
                    explication: "",
                };
            }
            return "";

        case "sortable": {
            // Ordre initial = ordre de présentation des fractions dans les données.
            // Pas de clé __explication — la justification est orale.
            if (node.fractions?.length > 0) {
                return { ordre: node.fractions.map((f) => `${f.n}/${f.d}`) };
            }
            // CE2 Ex.5 : fractions avec prénoms
            if (node.fractionsDocumentees?.length > 0) {
                return {
                    ordre: node.fractionsDocumentees.map((f) => f.prenom),
                };
            }
            return { ordre: [] };
        }

        case "comparaison": {
            // Un slot par item de comparaison, valeur initiale null.
            return Object.fromEntries(
                (node.comparaisons ?? []).map((c) => [c.id, null])
            );
        }

        case "number_input":
            return "";
        default:
            return "";
    }
}
