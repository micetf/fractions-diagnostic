/**
 * @fileoverview Figures SVG pour CE2 Ex.2 — Fractions égales à 1/2.
 *
 * Source : exercices diagnostiques CE2, exercice 2.
 * Chaque figure est un label de fraction à entourer.
 * Réponses attendues : 2/4, 3/6, 5/10, 4/8.
 */

const W = 72;
const H = 52;

function FractionLabel({ n, d }) {
    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            <text
                x={W / 2}
                y={H / 2 - 6}
                textAnchor="middle"
                fontSize="16"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
                fill="#1e293b"
            >
                {n}
            </text>
            <line
                x1={W / 2 - 14}
                y1={H / 2 + 1}
                x2={W / 2 + 14}
                y2={H / 2 + 1}
                stroke="#1e293b"
                strokeWidth="1.5"
            />
            <text
                x={W / 2}
                y={H / 2 + 18}
                textAnchor="middle"
                fontSize="16"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
                fill="#1e293b"
            >
                {d}
            </text>
        </svg>
    );
}

import PropTypes from "prop-types";
FractionLabel.propTypes = {
    n: PropTypes.number.isRequired,
    d: PropTypes.number.isRequired,
};

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
