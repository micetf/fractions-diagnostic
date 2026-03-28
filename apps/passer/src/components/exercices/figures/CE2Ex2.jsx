/**
 * @fileoverview Figures SVG pour CE2 Ex.2 — Fractions égales à 1/2.
 *
 * Source : exercices diagnostiques CE2, exercice 2.
 * Réponses attendues : 2/4, 3/6, 5/10, 4/8.
 */

import FractionLabel from "./FractionLabel";

export const figuresCE2Ex2 = [
    {
        id: "1/3",
        description: "Fraction 1/3",
        svg: <FractionLabel n={1} d={3} />,
    },
    {
        id: "2/4",
        description: "Fraction 2/4",
        svg: <FractionLabel n={2} d={4} />,
    },
    {
        id: "3/4",
        description: "Fraction 3/4",
        svg: <FractionLabel n={3} d={4} />,
    },
    {
        id: "3/6",
        description: "Fraction 3/6",
        svg: <FractionLabel n={3} d={6} />,
    },
    {
        id: "2/6",
        description: "Fraction 2/6",
        svg: <FractionLabel n={2} d={6} />,
    },
    {
        id: "5/10",
        description: "Fraction 5/10",
        svg: <FractionLabel n={5} d={10} />,
    },
    {
        id: "4/8",
        description: "Fraction 4/8",
        svg: <FractionLabel n={4} d={8} />,
    },
];
