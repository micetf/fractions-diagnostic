/**
 * @fileoverview Abstraction du localStorage avec préfixes séparés.
 *
 * Deux namespaces distincts garantissent l'isolation des données
 * entre l'interface admin et l'interface passation, même lorsque
 * les deux sont ouvertes sur le même appareil (SRS §3.2).
 *
 * @module @fractions-diagnostic/shared/storage
 */

// ─── Préfixes ──────────────────────────────────────────────────────────────────

/** Préfixe des clés de l'interface admin. */
export const ADMIN_PREFIX = "fractions-admin_";

/** Préfixe des clés de l'interface passation. */
export const PASSER_PREFIX = "fractions-passer_";

// ─── Clés admin ───────────────────────────────────────────────────────────────

/**
 * Clés localStorage de l'interface admin.
 * @enum {string}
 */
export const ADMIN_KEYS = {
    config:      ADMIN_PREFIX + "config",
    classes:     ADMIN_PREFIX + "classes",
    diagnostics: ADMIN_PREFIX + "diagnostics",
    passations:  ADMIN_PREFIX + "passations",
};

// ─── Clés passation ───────────────────────────────────────────────────────────

/**
 * Clés localStorage de l'interface passation.
 * @enum {string}
 */
export const PASSER_KEYS = {
    diagnostic: PASSER_PREFIX + "diagnostic",
    passations: PASSER_PREFIX + "passations",
};

// ─── Helpers universels ───────────────────────────────────────────────────────

/**
 * Lit et désérialise une valeur depuis le localStorage.
 *
 * @param {string} key - Clé localStorage complète (avec préfixe).
 * @returns {any|null} Valeur désérialisée, ou null si absente ou invalide.
 */
export function getItem(key) {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

/**
 * Sérialise et écrit une valeur dans le localStorage.
 *
 * @param {string} key   - Clé localStorage complète (avec préfixe).
 * @param {any}    value - Valeur à persister (doit être sérialisable en JSON).
 * @returns {boolean} true si l'écriture a réussi, false sinon.
 */
export function setItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        console.warn(`[storage] Impossible d'écrire la clé « ${key} »`);
        return false;
    }
}

/**
 * Supprime une entrée du localStorage.
 *
 * @param {string} key - Clé localStorage complète (avec préfixe).
 */
export function removeItem(key) {
    try {
        localStorage.removeItem(key);
    } catch {
        // Silencieux
    }
}

/**
 * Efface toutes les clés correspondant à un préfixe donné.
 * Utilisé pour l'effacement RGPD sur l'appareil de passation (SRS NF-SEC-05)
 * et la remise à zéro annuelle sur l'appareil admin (SRS F-EXP-04).
 *
 * @param {string} prefix - Préfixe à cibler (ADMIN_PREFIX ou PASSER_PREFIX).
 * @returns {number} Nombre de clés supprimées.
 */
export function clearPrefix(prefix) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) keys.push(key);
    }
    keys.forEach((key) => localStorage.removeItem(key));
    return keys.length;
}
