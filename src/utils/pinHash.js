/**
 * @fileoverview Hachage SHA-256 du PIN enseignant.
 *
 * Utilise l'API Web Crypto native du navigateur.
 * Le PIN en clair ne transite jamais hors de cette fonction (SRS NF-SEC-01).
 */

/**
 * Calcule le hachage SHA-256 d'un PIN.
 *
 * @param {string} pin - PIN en clair (4 chiffres).
 * @returns {Promise<string>} Hash hexadécimal 64 caractères.
 */
export async function hashPin(pin) {
    const encoded = new TextEncoder().encode(pin);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Vérifie qu'un PIN en clair correspond au hash stocké.
 *
 * @param {string} pin        - PIN en clair saisi par l'utilisateur.
 * @param {string} storedHash - Hash SHA-256 stocké dans localStorage.
 * @returns {Promise<boolean>}
 */
export async function verifyPin(pin, storedHash) {
    const candidate = await hashPin(pin);
    return candidate === storedHash;
}
