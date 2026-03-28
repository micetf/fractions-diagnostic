/**
 * @fileoverview Segments SVG pour les exercices de coloriage CE1.
 *
 * Source : exercices diagnostiques CE1, exercices 3 et 5.
 *
 * Conventions :
 *   - Bande horizontale partagée en N parts égales de 60px de hauteur.
 *   - Largeur totale 300px, parts de largeur égale = 300 / N.
 */

/**
 * Génère N segments rectangulaires égaux pour une bande horizontale.
 *
 * @param {number} n     - Nombre de parts.
 * @param {number} [w=300] - Largeur totale.
 * @param {number} [h=60]  - Hauteur.
 * @returns {import('../ColoringFigure').SegmentDef[]}
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
 * CE1 Ex.3 figure C — Bande de 6 cases.
 * Attendu : colorier 3 cases sur 6 (= 1/2).
 * Biais documenté : colorier 1 case sur 6 (confusion fraction unitaire / non unitaire).
 */
export const segmentsCE1Ex3BandeC = bandeEgale(6);

/**
 * CE1 Ex.5 — Bande de 5 parts.
 * Attendu : colorier 3 parts (= 3/5).
 */
export const segmentsCE1Ex5 = bandeEgale(5);

/**
 * CE1 Ex.3 figure A — Rectangle horizontal partagé en 2.
 * Attendu : colorier 1 part sur 2 (= 1/2).
 */
export const segmentsCE1Ex3RectA = bandeEgale(2);

/**
 * CE1 Ex.3 figure D — Triangle équilatéral partagé en 2 par axe vertical.
 * Chaque demi-triangle est un polygon.
 * Axe de symétrie vertical au centre du triangle.
 *
 * Triangle inscrit dans un carré 80×70.
 * Sommet haut : (40, 5), bas-gauche : (5, 68), bas-droit : (75, 68).
 * Axe vertical : (40, 5) → (40, 68).
 */
export const segmentsCE1Ex3TriangleD = [
    {
        shape: "polygon",
        label: "Moitié gauche",
        points: "40,5 5,68 40,68",
    },
    {
        shape: "polygon",
        label: "Moitié droite",
        points: "40,5 40,68 75,68",
    },
];
