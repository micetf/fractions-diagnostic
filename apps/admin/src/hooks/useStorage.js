/**
 * @fileoverview Abstraction du localStorage.
 *
 * Toutes les lectures/écritures de l'application passent par ces trois
 * fonctions. AppContext est le seul appelant légitime de setItem et removeItem.
 *
 * Les clés sont préfixées `fractions-diagnostic_` (SRS §5).
 */

/** Préfixe commun à toutes les clés de l'application. */
export const KEY_PREFIX = "fractions-diagnostic_";

/** Clés localStorage utilisées par l'application (SRS §5). */
export const KEYS = {
    config: KEY_PREFIX + "config",
    classes: KEY_PREFIX + "classes",
    sessions: KEY_PREFIX + "sessions",
    passations: KEY_PREFIX + "passations",
};

/**
 * Lit et désérialise une valeur depuis le localStorage.
 *
 * @param {string} key - Clé localStorage complète.
 * @returns {any | null} Valeur désérialisée, ou null si absente ou invalide.
 */
export function getItem(key) {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return null;
        return JSON.parse(raw);
    } catch {
        // JSON invalide ou localStorage inaccessible (ex. : mode privé saturé)
        return null;
    }
}

/**
 * Sérialise et écrit une valeur dans le localStorage.
 *
 * @param {string} key   - Clé localStorage complète.
 * @param {any}    value - Valeur à persister (doit être sérialisable en JSON).
 * @returns {boolean} true si l'écriture a réussi, false sinon.
 */
export function setItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        // Quota dépassé ou localStorage inaccessible
        console.warn(`[useStorage] Impossible d'écrire la clé « ${key} »`);
        return false;
    }
}

/**
 * Supprime une entrée du localStorage.
 *
 * @param {string} key - Clé localStorage complète.
 */
export function removeItem(key) {
    try {
        localStorage.removeItem(key);
    } catch {
        // Silencieux — la suppression est au mieux
    }
}
