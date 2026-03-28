/**
 * @fileoverview Détection automatique des biais didactiques.
 *
 * Implémente les 7 types de déclencheurs définis dans les fichiers data :
 *
 *   selection_includes      — la sélection contient un id interdit
 *   selection_exact         — la sélection est exactement un ensemble
 *   selection_excludes_any  — des ids attendus sont absents
 *   item_fraction_equals    — un item précis d'un fraction_input a une valeur
 *   fraction_equals         — fraction_input à item unique = valeur cible
 *   choice_equals           — choix binaire = valeur cible
 *   position_wrong          — point NumberLine hors de la position correcte
 *
 * Le type `text_review` n'est jamais détectable automatiquement.
 * Il est traité en amont via le flag `aRelire` (SRS F-DET-02).
 *
 * Source : biaisDetectables dans src/data/exercices/*.js
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Compare deux fractions par leur valeur décimale.
 * Tolérance : 0.001 (couvre les erreurs d'arrondi flottant).
 *
 * @param {{ numerateur: number|null, denominateur: number|null }} f
 * @param {number} n
 * @param {number} d
 * @returns {boolean}
 */
function fractionEgale(f, n, d) {
    if (!f || f.numerateur === null || f.denominateur === null) return false;
    if (f.denominateur === 0 || d === 0) return false;
    return Math.abs(f.numerateur / f.denominateur - n / d) < 0.001;
}

/**
 * Évalue un déclencheur contre une valeur brute.
 *
 * @param {object} declencheur - Déclencheur issu des biaisDetectables.
 * @param {any}    valeur      - Valeur brute produite par l'élève.
 * @returns {boolean}
 */
function evaluerDeclencheur(declencheur, valeur) {
    switch (declencheur.type) {
        case "selection_includes":
            return Array.isArray(valeur) && valeur.includes(declencheur.valeur);

        case "selection_exact":
            return (
                Array.isArray(valeur) &&
                valeur.length === declencheur.valeurs.length &&
                declencheur.valeurs.every((v) => valeur.includes(v))
            );

        case "selection_excludes_any":
            // Biais si au moins une des valeurs attendues est absente de la sélection
            return (
                Array.isArray(valeur) &&
                valeur.length > 0 &&
                declencheur.valeurs.some((v) => !valeur.includes(v))
            );

        case "item_fraction_equals":
            // valeur = { [itemId]: { numerateur, denominateur }, ... }
            return fractionEgale(
                valeur?.[declencheur.itemId],
                declencheur.numerateur,
                declencheur.denominateur
            );

        case "fraction_equals":
            // valeur = { numerateur, denominateur }
            return fractionEgale(
                valeur,
                declencheur.numerateur,
                declencheur.denominateur
            );

        case "choice_equals":
            // valeur = { choix, texte } ou string directe
            if (typeof valeur === "string")
                return valeur === declencheur.valeur;
            return valeur?.choix === declencheur.valeur;

        case "position_wrong": {
            // valeur = { [key]: { numerateur, denominateur } | null, ... }
            // ou { numerateur, denominateur } | null
            const key = `${declencheur.fraction.n}/${declencheur.fraction.d}`;
            const pt =
                typeof valeur === "object" && key in valeur
                    ? valeur[key]
                    : valeur;
            if (!pt) return false;
            const valeurCorrecte =
                declencheur.fraction.n / declencheur.fraction.d;
            const valeurEleve = pt.numerateur / pt.denominateur;
            return Math.abs(valeurEleve - valeurCorrecte) > 0.1;
        }

        case "position_range": {
            // Biais si le point est placé en-dessous d'une position maximale
            const key = `${declencheur.fraction.n}/${declencheur.fraction.d}`;
            const pt =
                typeof valeur === "object" && key in valeur
                    ? valeur[key]
                    : valeur;
            if (!pt) return false;
            return pt.numerateur / pt.denominateur <= declencheur.maxPosition;
        }

        case "text_review":
            // Jamais détectable automatiquement — géré via aRelire
            return false;

        case "encadrement_wrong": {
            const inf = parseInt(valeur?.inf, 10);
            const sup = parseInt(valeur?.sup, 10);
            return inf === declencheur.borneInf && sup === declencheur.borneSup;
        }

        default:
            return false;
    }
}

// ─── Détecteur principal ───────────────────────────────────────────────────────

/**
 * Collecte les codes biais déclenchés par une valeur brute pour un nœud.
 * Parcourt récursivement les sousQuestions pour les exercices de type 'compound'.
 *
 * @param {object} node   - Exercice ou sous-question issu des fichiers data.
 * @param {any}    valeur - Valeur brute produite par l'élève.
 * @returns {string[]}    - Codes biais déclenchés (uniques, sans doublon).
 */
function collecterBiaisNoeud(node, valeur) {
    const codes = new Set();

    // Biais définis directement sur ce nœud
    for (const biais of node.biaisDetectables ?? []) {
        if (evaluerDeclencheur(biais.declencheur, valeur)) {
            codes.add(biais.code);
        }
    }

    // Récursion sur les sous-questions pour compound
    if (node.type === "compound" && Array.isArray(node.sousQuestions)) {
        for (const sq of node.sousQuestions) {
            const valeurSq = valeur?.[sq.id];
            const biaissq = collecterBiaisNoeud(sq, valeurSq);
            biaissq.forEach((c) => codes.add(c));
        }
    }

    return [...codes];
}

/**
 * detecterBiais
 *
 * Point d'entrée public. Retourne les codes biais déclenchés par la réponse
 * d'un élève à un exercice. Ne retourne jamais de doublon.
 *
 * @param {object} exercice    - Exercice issu des fichiers data.
 * @param {any}    valeurBrute - Valeur brute produite par l'élève.
 * @returns {string[]}
 */
export function detecterBiais(exercice, valeurBrute) {
    return collecterBiaisNoeud(exercice, valeurBrute);
}
