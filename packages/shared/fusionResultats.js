/**
 * @fileoverview Fusion des résultats partiels importés depuis un appareil élève.
 *
 * Règle de fusion (SRS F-RES-03) :
 *   En cas de doublon (même eleve_id + même diagnostic_id) :
 *   - La passation avec le plus grand nombre de réponses gagne.
 *   - À égalité, la plus récente (date_fin) gagne.
 *   - Si aucune date_fin, on garde l'existante.
 *
 * Cette fonction est pure : elle ne modifie pas ses arguments.
 *
 * @module @fractions-diagnostic/shared/fusionResultats
 */

/**
 * @typedef {import('./types.js').PassationEleve} PassationEleve
 */

/**
 * Résultat de la fusion.
 *
 * @typedef {object} ResultatFusion
 * @property {PassationEleve[]} passations  - Liste fusionnée complète.
 * @property {number}           ajoutees    - Nombre de nouvelles passations ajoutées.
 * @property {number}           remplacees  - Nombre de doublons résolus (importée a gagné).
 * @property {number}           ignorees    - Nombre de doublons ignorés (existante a gagné).
 * @property {string[]}         elevesAjoutes   - Prénoms/ids des élèves ajoutés.
 * @property {string[]}         elevesRemplaces - Ids des élèves dont la passation a été remplacée.
 */

/**
 * Fusionne des passations importées dans les passations existantes.
 *
 * @param {PassationEleve[]} existantes  - Passations déjà présentes sur l'appareil admin.
 * @param {PassationEleve[]} importees   - Passations du fichier résultats importé.
 * @returns {ResultatFusion}
 */
export function fusionnerPassations(existantes, importees) {
    const resultat = [...existantes];
    let ajoutees = 0;
    let remplacees = 0;
    let ignorees = 0;
    const elevesAjoutes = [];
    const elevesRemplaces = [];

    for (const importee of importees) {
        const idx = resultat.findIndex(
            (p) =>
                p.eleve_id === importee.eleve_id &&
                p.diagnostic_id === importee.diagnostic_id
        );

        if (idx === -1) {
            // Pas de doublon → ajouter
            resultat.push(importee);
            ajoutees++;
            elevesAjoutes.push(importee.eleve_id);
        } else {
            const existante = resultat[idx];

            // Règle : plus complète gagne
            const importeeGagne =
                importee.reponses.length > existante.reponses.length ||
                (importee.reponses.length === existante.reponses.length &&
                    importee.date_fin != null &&
                    existante.date_fin != null &&
                    importee.date_fin > existante.date_fin);

            if (importeeGagne) {
                resultat[idx] = importee;
                remplacees++;
                elevesRemplaces.push(importee.eleve_id);
            } else {
                ignorees++;
            }
        }
    }

    return {
        passations: resultat,
        ajoutees,
        remplacees,
        ignorees,
        elevesAjoutes,
        elevesRemplaces,
    };
}
