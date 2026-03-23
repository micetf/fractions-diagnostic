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
                return Object.fromEntries(
                    node.items.map((item) => [
                        item.id,
                        { numerateur: null, denominateur: null },
                    ])
                );
            }
            return { numerateur: null, denominateur: null };

        case "binary_choice":
            // texte toujours présent — ignoré si avecJustification est absent
            return { choix: null, texte: "" };

        case "selection":
            return [];

        case "coloring":
            if (node.figures) {
                // Plusieurs figures indépendantes (CE1 Ex.3)
                return Object.fromEntries(
                    node.figures.map((f) => [
                        f.id,
                        Array(f.nbParts ?? 2).fill(false),
                    ])
                );
            }
            // Figure unique avec nbParts
            return Array(node.nbParts ?? node.partiesAColorier ?? 2).fill(
                false
            );

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

        case "text":
        default:
            return "";
    }
}
