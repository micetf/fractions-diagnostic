/**
 * @fileoverview Segments SVG pour les exercices de coloriage CM1.
 *
 * Source : exercices diagnostiques CM1, exercices 2 et 6.
 *
 * CM1 Ex.2 : décomposer une fraction > 1 par dessin (ex. 7/4, 9/3, 11/4).
 *   → Plusieurs "disques" ou rectangles-unité juxtaposés.
 *   → Implémenté comme une bande continue divisée en parts.
 *
 * CM1 Ex.6 : calculs de fractions avec dessin d'appui.
 *   → Bande en quarts pour 3/4 + 1/2.
 */

/**
 * Génère N segments rectangulaires pour une bande.
 * @param {number} n
 * @param {number} [w=300]
 * @param {number} [h=60]
 */
function bandeEgale(n, w = 300, h = 60) {
    const partW = w / n;
    return Array.from({ length: n }, (_, i) => ({
        shape: "rect",
        label: `Part ${i + 1}`,
        x: i * partW,
        y: 10,
        w: partW,
        h,
    }));
}

/**
 * CM1 Ex.2a — 7/4 : 2 unités de 4 parts = 8 parts (colorier 7).
 * Ligne de séparation d'unité marquée par un trait plus épais (géré dans la démo).
 */
export const segmentsCM1Ex2a = bandeEgale(8);

/**
 * CM1 Ex.2c — 11/4 : 3 unités de 4 parts = 12 parts (colorier 11).
 */
export const segmentsCM1Ex2c = bandeEgale(12);

/**
 * CM1 Ex.6 — Bande en quarts pour visualiser 3/4 + 1/2.
 * 4 parts (dénominateur commun = 4).
 */
export const segmentsCM1Ex6 = bandeEgale(4);
