/**
 * @fileoverview Fonctions pures de calcul pour le tableau de bord.
 *
 * Toutes les fonctions sont calculées à la volée depuis le state —
 * aucune donnée d'analyse n'est persistée (SRS §5).
 */

/**
 * États possibles d'une cellule de la matrice.
 */
export const ETATS = {
    REUSSI: "reussi",
    BIAIS: "biais",
    RELIRE: "relire",
    NON_FAIT: "non_fait",
};

/**
 * Détermine l'état d'une réponse pour l'affichage matrice.
 *
 * Priorité : biais > relire > réussi > non_fait.
 *
 * @param {object|undefined} reponse - ReponseExercice ou undefined.
 * @returns {string} Une des constantes ETATS.
 */
export function etatReponse(reponse) {
    if (!reponse) return ETATS.NON_FAIT;
    const biauts = [
        ...(reponse.biais_auto ?? []),
        ...(reponse.biais_manuel ?? []),
    ];
    if (biauts.length > 0) return ETATS.BIAIS;
    if (reponse.a_relire) return ETATS.RELIRE;
    return ETATS.REUSSI;
}

/**
 * Construit la matrice élèves × exercices pour une session.
 *
 * @param {object}   session     - Session.
 * @param {object[]} passations  - Toutes les PassationEleve.
 * @param {object[]} eleves      - Élèves de la classe.
 * @returns {{
 *   eleves: object[],
 *   numeros: number[],
 *   cellules: object,       // cellules[eleveId][numero] = ReponseExercice | undefined
 *   tauxReussite: object,   // tauxReussite[numero] = 0..1 | null
 * }}
 */
export function construireMatrice(session, passations, eleves) {
    const numeros = session.exercices_selectionnes;
    const passTerminees = passations.filter(
        (p) => p.session_id === session.id && p.statut === "terminee"
    );

    const cellules = {};
    for (const eleve of eleves) {
        cellules[eleve.id] = {};
        const passation = passTerminees.find((p) => p.eleve_id === eleve.id);
        if (!passation) continue;
        for (const rep of passation.reponses) {
            cellules[eleve.id][rep.exercice_numero] = rep;
        }
    }

    // Taux de réussite par exercice (uniquement sur les passations terminées)
    const tauxReussite = {};
    for (const numero of numeros) {
        const reponsesExo = passTerminees
            .map((p) => p.reponses.find((r) => r.exercice_numero === numero))
            .filter(Boolean);
        if (reponsesExo.length === 0) {
            tauxReussite[numero] = null;
            continue;
        }
        const reussies = reponsesExo.filter(
            (r) => etatReponse(r) === ETATS.REUSSI
        ).length;
        tauxReussite[numero] = reussies / reponsesExo.length;
    }

    return { eleves, numeros, cellules, tauxReussite };
}

/**
 * Calcule la distribution des biais sur une session.
 *
 * @param {object}   session
 * @param {object[]} passations
 * @param {object[]} eleves
 * @returns {Map<string, { eleveIds: string[], exerciceNumeros: number[] }>}
 *   Clé = code biais, valeur = élèves et exercices concernés.
 */
export function construireDistribBiais(session, passations) {
    const passTerminees = passations.filter(
        (p) => p.session_id === session.id && p.statut === "terminee"
    );
    const map = new Map();

    for (const passation of passTerminees) {
        for (const rep of passation.reponses) {
            const codes = [
                ...(rep.biais_auto ?? []),
                ...(rep.biais_manuel ?? []),
            ];
            for (const code of codes) {
                if (!map.has(code))
                    map.set(code, { eleveIds: [], exerciceNumeros: [] });
                const entry = map.get(code);
                if (!entry.eleveIds.includes(passation.eleve_id)) {
                    entry.eleveIds.push(passation.eleve_id);
                }
                if (!entry.exerciceNumeros.includes(rep.exercice_numero)) {
                    entry.exerciceNumeros.push(rep.exercice_numero);
                }
            }
        }
    }

    return map;
}

/**
 * Collecte tous les items à relire d'une session.
 *
 * @param {object}   session
 * @param {object[]} passations
 * @returns {{
 *   passation_id: string,
 *   eleve_id: string,
 *   reponse: object,
 * }[]}
 */
export function collecterItemsARelire(session, passations) {
    return passations
        .filter((p) => p.session_id === session.id && p.statut === "terminee")
        .flatMap((p) =>
            p.reponses
                .filter((r) => r.a_relire)
                .map((r) => ({
                    passation_id: p.id,
                    eleve_id: p.eleve_id,
                    reponse: r,
                }))
        );
}

/**
 * Vérifie si un biais dépasse le seuil d'alerte de 30 % sur un exercice.
 * (SRS F-ANA-05)
 *
 * @param {string}   code        - Code biais.
 * @param {number}   exerciceNum - Numéro de l'exercice.
 * @param {object}   session
 * @param {object[]} passations
 * @returns {boolean}
 */
export function depasseSeuil(code, exerciceNum, session, passations) {
    const passTerminees = passations.filter(
        (p) => p.session_id === session.id && p.statut === "terminee"
    );
    const ayantPasseExo = passTerminees.filter((p) =>
        p.reponses.some((r) => r.exercice_numero === exerciceNum)
    );
    if (ayantPasseExo.length === 0) return false;
    const ayantBiais = ayantPasseExo.filter((p) =>
        p.reponses.some(
            (r) =>
                r.exercice_numero === exerciceNum &&
                [...(r.biais_auto ?? []), ...(r.biais_manuel ?? [])].includes(
                    code
                )
        )
    );
    return ayantBiais.length / ayantPasseExo.length >= 0.3;
}
