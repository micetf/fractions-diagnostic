/**
 * @fileoverview Figures SVG pour CM2 Ex.4 — Fractions égales à 2/3.
 *
 * Source : exercices diagnostiques CM2, exercice 4.
 * Réponses attendues : 6/9, 8/12, 10/15, 14/21, 4/6.
 */

import PropTypes from "prop-types";

const W = 76;
const H = 52;

function FractionLabel({ n, d }) {
    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            <text
                x={W / 2}
                y={H / 2 - 6}
                textAnchor="middle"
                fontSize="15"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
                fill="#1e293b"
            >
                {n}
            </text>
            <line
                x1={W / 2 - 16}
                y1={H / 2 + 1}
                x2={W / 2 + 16}
                y2={H / 2 + 1}
                stroke="#1e293b"
                strokeWidth="1.5"
            />
            <text
                x={W / 2}
                y={H / 2 + 18}
                textAnchor="middle"
                fontSize="15"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
                fill="#1e293b"
            >
                {d}
            </text>
        </svg>
    );
}

FractionLabel.propTypes = {
    n: PropTypes.number.isRequired,
    d: PropTypes.number.isRequired,
};

export const figuresCM2Ex4 = [
    {
        id: "6/9",
        description: "Fraction 6/9",
        svg: <FractionLabel n={6} d={9} />,
    },
    {
        id: "4/5",
        description: "Fraction 4/5",
        svg: <FractionLabel n={4} d={5} />,
    },
    {
        id: "8/12",
        description: "Fraction 8/12",
        svg: <FractionLabel n={8} d={12} />,
    },
    {
        id: "10/15",
        description: "Fraction 10/15",
        svg: <FractionLabel n={10} d={15} />,
    },
    {
        id: "50/60",
        description: "Fraction 50/60",
        svg: <FractionLabel n={50} d={60} />,
    },
    {
        id: "14/21",
        description: "Fraction 14/21",
        svg: <FractionLabel n={14} d={21} />,
    },
    {
        id: "4/6",
        description: "Fraction 4/6",
        svg: <FractionLabel n={4} d={6} />,
    },
];
