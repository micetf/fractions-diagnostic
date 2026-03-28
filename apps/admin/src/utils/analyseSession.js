/**
 * @fileoverview Fonctions pures de calcul pour le tableau de bord.
 *
 * Toutes les fonctions sont calculées à la volée depuis le state —
 * aucune donnée d'analyse n'est persistée (SRS §5).
 *
 * v2.1 :
 *   - estReponseVide()  : détecte les réponses vides par type (correctif bug REUSSI faux).
 *   - etatReponse()     : corrigé — vérifie la vacuité avant de retourner REUSSI.
 *   - SCORE / scoreReponse() : nouvelle couche non destructive.
 *     RELIRE n'est plus un état primaire : binary_choice et selection sont
 *     auto-évalués ; seuls coloring sans attendu et text pur restent A_VALIDER.
 *   - scoreEleve()      : agrégation des scores d'un élève sur une passation.
 *
 * @module utils/analyseSession
 */

// ─── États legacy (compatibilité avec MatriceResultats, ProfilEleve, export) ──

/**
 * États possibles d'une cellule de la matrice (legacy).
 * Utilisés par etatReponse() et tous les composants existants.
 *
 * @enum {string}
 */
export const ETATS = {
    REUSSI: "reussi",
    BIAIS: "biais",
    RELIRE: "relire",
    NON_FAIT: "non_fait",
};

// ─── États enrichis (nouveaux composants Phase 3) ─────────────────────────────

/**
 * États de scoreReponse() — 5 états ordonnés, sans RELIRE comme état primaire.
 *
 * Ordre de sévérité décroissant : BIAIS > ECHEC > A_VALIDER > REUSSI > NON_FAIT.
 * A_VALIDER est transitoire : il disparaît dès que l'enseignant valide l'item
 * via l'interface de validation rapide (Module 3).
 *
 * @enum {string}
 */
export const SCORE = {
    REUSSI: "reussi",
    BIAIS: "biais",
    ECHEC: "echec",
    A_VALIDER: "a_valider",
    NON_FAIT: "non_fait",
};

// ─── Détection de réponse vide ────────────────────────────────────────────────

/**
 * Détermine si une valeur brute est substantiellement vide pour un type donné.
 *
 * Une réponse "vide" est une réponse soumise techniquement (l'objet existe)
 * mais sans contenu réel de la part de l'élève — par exemple un number_line
 * dont toutes les positions sont null, ou un binary_choice sans choix posé.
 *
 * Cette fonction est le correctif du bug où etatReponse() retournait REUSSI
 * par défaut sur des réponses vides (aucun biais détectable sur du vide).
 *
 * @param {any}    valeur_brute - Valeur issue de ReponseExercice.valeur_brute.
 * @param {string} type        - Type de l'exercice (cf. SRS §5.6).
 * @returns {boolean} true si la réponse est considérée vide.
 */
export function estReponseVide(valeur_brute, type) {
    if (valeur_brute === null || valeur_brute === undefined) return true;

    switch (type) {
        case "fraction_input": {
            if (typeof valeur_brute !== "object" || Array.isArray(valeur_brute))
                return true;
            // Single : { numerateur, denominateur }
            if ("numerateur" in valeur_brute) {
                return (
                    valeur_brute.numerateur === null &&
                    valeur_brute.denominateur === null
                );
            }
            // Multi-items : { A: {num, denom}, B: {num, denom}, __explication?: "" }
            const items = Object.entries(valeur_brute).filter(
                ([k]) => !k.startsWith("__")
            );
            return items.every(
                ([, v]) => v?.numerateur === null && v?.denominateur === null
            );
        }

        case "binary_choice":
            return (
                valeur_brute?.choix === null ||
                valeur_brute?.choix === undefined
            );

        case "selection":
            if (Array.isArray(valeur_brute)) return valeur_brute.length === 0;
            if (Array.isArray(valeur_brute?.selection))
                return valeur_brute.selection.length === 0;
            return true;

        case "coloring": {
            if (Array.isArray(valeur_brute))
                return valeur_brute.every((v) => v === false);
            // Multi-figures : { A: boolean[], B: boolean[], ... }
            if (typeof valeur_brute === "object") {
                return Object.values(valeur_brute).every(
                    (arr) => Array.isArray(arr) && arr.every((v) => v === false)
                );
            }
            return true;
        }

        case "number_line":
            if (typeof valeur_brute === "object" && valeur_brute !== null)
                return Object.values(valeur_brute).every((v) => v === null);
            return valeur_brute === null;

        case "text":
            return (
                typeof valeur_brute !== "string" || valeur_brute.trim() === ""
            );

        case "compound":
            // Vide si toutes les sous-réponses sont null / undefined / chaîne vide.
            // On ne peut pas connaître le type de chaque sous-réponse ici —
            // on utilise une heuristique conservative.
            if (typeof valeur_brute === "object" && valeur_brute !== null) {
                return Object.values(valeur_brute).every(
                    (v) => v === null || v === undefined || v === ""
                );
            }
            return true;

        default:
            return valeur_brute === null || valeur_brute === undefined;
    }
}

// ─── État legacy (compatibilité ascendante) ───────────────────────────────────

/**
 * Détermine l'état legacy d'une réponse pour la matrice existante.
 *
 * Priorité : biais > relire > réussi > non_fait.
 *
 * Correctif v2.1 : appelle estReponseVide() avant de conclure REUSSI,
 * éliminant le bug qui marquait les réponses vides (ex. number_line tout à null)
 * comme réussies par défaut.
 *
 * @param {object|undefined} reponse - ReponseExercice ou undefined.
 * @returns {string} Une des constantes ETATS.
 */
export function etatReponse(reponse) {
    if (!reponse) return ETATS.NON_FAIT;

    const biais = [
        ...(reponse.biais_auto ?? []),
        ...(reponse.biais_manuel ?? []),
    ];
    if (biais.length > 0) return ETATS.BIAIS;
    if (reponse.a_relire) return ETATS.RELIRE;

    // Correctif : une réponse vide sans biais n'est pas une réussite.
    if (estReponseVide(reponse.valeur_brute, reponse.type))
        return ETATS.NON_FAIT;

    return ETATS.REUSSI;
}

// ─── Score enrichi (nouveaux composants) ─────────────────────────────────────

/**
 * Calcule le score enrichi d'une réponse.
 *
 * Contrairement à etatReponse(), scoreReponse() n'utilise jamais RELIRE
 * comme état primaire. Les items composites (binary_choice + texte,
 * selection + justification) sont évalués sur leur partie auto-évaluable.
 * Seuls les coloriages sans attendu défini et les textes purs restent
 * A_VALIDER jusqu'à la validation manuelle de l'enseignant.
 *
 * Le champ optionnel `validation_manuelle` ('reussi' | 'echec' | null)
 * est écrit par l'interface de validation rapide (Module 3) et prend
 * toujours la priorité sur l'inférence automatique.
 *
 * @param {object|undefined} reponse - ReponseExercice (avec validation_manuelle optionnel).
 * @returns {string} Une des constantes SCORE.
 */
export function scoreReponse(reponse) {
    if (!reponse) return SCORE.NON_FAIT;
    if (estReponseVide(reponse.valeur_brute, reponse.type))
        return SCORE.NON_FAIT;

    // Biais (auto ou manuel) — priorité absolue.
    const biais = [
        ...(reponse.biais_auto ?? []),
        ...(reponse.biais_manuel ?? []),
    ];
    if (biais.length > 0) return SCORE.BIAIS;

    // Validation manuelle posée par l'enseignant — prioritaire sur a_relire.
    // DOIT être évalué avant le bloc a_relire : VALIDER_ITEM passe
    // a_relire à false au moment même où il écrit validation_manuelle.
    if (reponse.validation_manuelle === "echec") return SCORE.ECHEC;
    if (reponse.validation_manuelle === "reussi") return SCORE.REUSSI;

    if (reponse.a_relire) {
        // binary_choice : le choix est auto-évaluable, le texte est un enrichissement.
        if (reponse.type === "binary_choice") return SCORE.REUSSI;
        // selection : la sélection est auto-évaluable, la justification est un enrichissement.
        if (reponse.type === "selection") return SCORE.REUSSI;
        // coloring, text, compound avec sous-question text → validation enseignant requise.
        return SCORE.A_VALIDER;
    }

    return SCORE.REUSSI;
}

// ─── Agrégation par élève ─────────────────────────────────────────────────────

/**
 * Calcule les scores agrégés d'un élève sur l'ensemble de sa passation.
 *
 * Le taux de réussite est calculé sur les items évalués uniquement
 * (hors A_VALIDER et NON_FAIT) pour éviter de pénaliser un élève dont
 * des items attendent encore une validation manuelle.
 *
 * @param {object|null} passation - PassationEleve ou null.
 * @returns {{
 *   total:             number,
 *   reussi:            number,
 *   biais:             number,
 *   echec:             number,
 *   aValider:          number,
 *   nonFait:           number,
 *   tauxReussite:      number|null,
 *   aValiderPending:   boolean,
 * }|null} null si passation absente ou sans réponses.
 */
export function scoreEleve(passation) {
    if (!passation) return null;
    const reponses = passation.reponses ?? [];
    if (reponses.length === 0) return null;

    let reussi = 0,
        biais = 0,
        echec = 0,
        aValider = 0,
        nonFait = 0;

    for (const rep of reponses) {
        switch (scoreReponse(rep)) {
            case SCORE.REUSSI:
                reussi++;
                break;
            case SCORE.BIAIS:
                biais++;
                break;
            case SCORE.ECHEC:
                echec++;
                break;
            case SCORE.A_VALIDER:
                aValider++;
                break;
            case SCORE.NON_FAIT:
                nonFait++;
                break;
        }
    }

    const evalues = reussi + biais + echec;

    return {
        total: reponses.length,
        reussi,
        biais,
        echec,
        aValider,
        nonFait,
        // Taux sur items évalués uniquement (A_VALIDER exclus).
        tauxReussite: evalues > 0 ? reussi / evalues : null,
        aValiderPending: aValider > 0,
    };
}

// ─── Construction de la matrice ───────────────────────────────────────────────

/**
 * Construit la matrice élèves × exercices pour un diagnostic.
 *
 * v2.1 : ajoute scoresEleves (Map eleveId → résultat scoreEleve())
 * pour alimenter les nouvelles vues sans casser les composants existants.
 *
 * @param {object}   session     - Diagnostic.
 * @param {object[]} passations  - Toutes les PassationEleve.
 * @param {object[]} eleves      - Élèves de la classe.
 * @returns {{
 *   eleves:       object[],
 *   numeros:      number[],
 *   cellules:     object,
 *   tauxReussite: object,
 *   scoresEleves: Map<string, object>,
 * }}
 */
export function construireMatrice(session, passations, eleves) {
    const numeros = session.exercices_selectionnes;
    const passTerminees = passations.filter(
        (p) => p.diagnostic_id === session.id && p.statut === "terminee"
    );

    // Cellules élève × exercice
    const cellules = {};
    for (const eleve of eleves) {
        cellules[eleve.id] = {};
        const passation = passTerminees.find((p) => p.eleve_id === eleve.id);
        if (!passation) continue;
        for (const rep of passation.reponses) {
            cellules[eleve.id][rep.exercice_numero] = rep;
        }
    }

    // Taux de réussite par exercice (corrigé : utilise etatReponse() fixé)
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

    // Scores agrégés par élève (nouveau — alimente Phase 3)
    const scoresEleves = new Map();
    for (const eleve of eleves) {
        const passation = passTerminees.find((p) => p.eleve_id === eleve.id);
        scoresEleves.set(eleve.id, scoreEleve(passation ?? null));
    }

    return { eleves, numeros, cellules, tauxReussite, scoresEleves };
}

// ─── Distribution des biais ───────────────────────────────────────────────────

/**
 * Calcule la distribution des biais sur un diagnostic.
 *
 * @param {object}   session
 * @param {object[]} passations
 * @returns {Map<string, { eleveIds: string[], exerciceNumeros: number[] }>}
 */
export function construireDistribBiais(session, passations) {
    const passTerminees = passations.filter(
        (p) => p.diagnostic_id === session.id && p.statut === "terminee"
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
                if (!entry.eleveIds.includes(passation.eleve_id))
                    entry.eleveIds.push(passation.eleve_id);
                if (!entry.exerciceNumeros.includes(rep.exercice_numero))
                    entry.exerciceNumeros.push(rep.exercice_numero);
            }
        }
    }

    return map;
}

// ─── Items à relire ───────────────────────────────────────────────────────────

/**
 * Collecte les items dont le score est A_VALIDER sur un diagnostic.
 *
 * v2.1 : utilise scoreReponse() au lieu du flag a_relire brut,
 * ce qui exclut automatiquement les binary_choice et selection
 * (auto-évaluables) de la file de validation.
 *
 * @param {object}   session
 * @param {object[]} passations
 * @returns {{ passation_id: string, eleve_id: string, reponse: object }[]}
 */
export function collecterItemsARelire(session, passations) {
    return passations
        .filter(
            (p) => p.diagnostic_id === session.id && p.statut === "terminee"
        )
        .flatMap((p) =>
            p.reponses
                .filter((r) => scoreReponse(r) === SCORE.A_VALIDER)
                .map((r) => ({
                    passation_id: p.id,
                    eleve_id: p.eleve_id,
                    reponse: r,
                }))
        );
}

// ─── Seuil d'alerte biais ─────────────────────────────────────────────────────

/**
 * Vérifie si un biais dépasse le seuil d'alerte de 30 % sur un exercice.
 * (SRS F-ANA-05)
 *
 * @param {string}   code
 * @param {number}   exerciceNum
 * @param {object}   session
 * @param {object[]} passations
 * @returns {boolean}
 */
export function depasseSeuil(code, exerciceNum, session, passations) {
    const passTerminees = passations.filter(
        (p) => p.diagnostic_id === session.id && p.statut === "terminee"
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
