/**
 * @fileoverview Figures SVG pour CE1 Ex.1 — Laquelle montre bien 1/4 ?
 *
 * Source : exercices diagnostiques CE1, exercice 1.
 * Quatre rectangles horizontaux, 120×60 px chacun.
 *
 * A : 4 parts égales, 1 coloriée           → correct
 * B : 4 parts inégales, 1 coloriée         → biais EQUIPARTITION si sélectionné
 * C : 4 parts égales, 3 coloriées          → incorrect
 * D : 4 parts égales, 1 coloriée, orienté à l'envers (part à droite) → correct
 */

const W = 120;
const H = 60;
const FILL_CORRECT = "#bbd1ff"; // brand-200
const FILL_NONE = "white";
const STROKE = "#475569"; // slate-600

export const figuresCE1Ex1 = [
    {
        id: "A",
        description:
            "Rectangle partagé en 4 parts égales, 1 part coloriée (première à gauche)",
        svg: (
            <svg
                width={W}
                height={H}
                viewBox={`0 0 ${W} ${H}`}
                aria-hidden="true"
            >
                {/* 4 parts égales : largeur 30 chacune */}
                <rect
                    x="0"
                    y="0"
                    width="30"
                    height={H}
                    fill={FILL_CORRECT}
                    stroke={STROKE}
                    strokeWidth="1"
                />
                <rect
                    x="30"
                    y="0"
                    width="30"
                    height={H}
                    fill={FILL_NONE}
                    stroke={STROKE}
                    strokeWidth="1"
                />
                <rect
                    x="60"
                    y="0"
                    width="30"
                    height={H}
                    fill={FILL_NONE}
                    stroke={STROKE}
                    strokeWidth="1"
                />
                <rect
                    x="90"
                    y="0"
                    width="30"
                    height={H}
                    fill={FILL_NONE}
                    stroke={STROKE}
                    strokeWidth="1"
                />
            </svg>
        ),
    },

    {
        id: "B",
        description: "Rectangle partagé en 4 parts inégales, 1 part coloriée",
        svg: (
            <svg
                width={W}
                height={H}
                viewBox={`0 0 ${W} ${H}`}
                aria-hidden="true"
            >
                {/* Parts inégales : 15, 25, 50, 30 */}
                <rect
                    x="0"
                    y="0"
                    width="15"
                    height={H}
                    fill={FILL_CORRECT}
                    stroke={STROKE}
                    strokeWidth="1"
                />
                <rect
                    x="15"
                    y="0"
                    width="25"
                    height={H}
                    fill={FILL_NONE}
                    stroke={STROKE}
                    strokeWidth="1"
                />
                <rect
                    x="40"
                    y="0"
                    width="50"
                    height={H}
                    fill={FILL_NONE}
                    stroke={STROKE}
                    strokeWidth="1"
                />
                <rect
                    x="90"
                    y="0"
                    width="30"
                    height={H}
                    fill={FILL_NONE}
                    stroke={STROKE}
                    strokeWidth="1"
                />
            </svg>
        ),
    },

    {
        id: "C",
        description: "Rectangle partagé en 4 parts égales, 3 parts coloriées",
        svg: (
            <svg
                width={W}
                height={H}
                viewBox={`0 0 ${W} ${H}`}
                aria-hidden="true"
            >
                <rect
                    x="0"
                    y="0"
                    width="30"
                    height={H}
                    fill={FILL_CORRECT}
                    stroke={STROKE}
                    strokeWidth="1"
                />
                <rect
                    x="30"
                    y="0"
                    width="30"
                    height={H}
                    fill={FILL_CORRECT}
                    stroke={STROKE}
                    strokeWidth="1"
                />
                <rect
                    x="60"
                    y="0"
                    width="30"
                    height={H}
                    fill={FILL_CORRECT}
                    stroke={STROKE}
                    strokeWidth="1"
                />
                <rect
                    x="90"
                    y="0"
                    width="30"
                    height={H}
                    fill={FILL_NONE}
                    stroke={STROKE}
                    strokeWidth="1"
                />
            </svg>
        ),
    },

    {
        id: "D",
        description:
            "Rectangle partagé en 4 parts égales, 1 part coloriée à droite (orienté différemment)",
        svg: (
            <svg
                width={W}
                height={H}
                viewBox={`0 0 ${W} ${H}`}
                aria-hidden="true"
            >
                {/* Part coloriée à droite — même structure, position différente */}
                <rect
                    x="0"
                    y="0"
                    width="30"
                    height={H}
                    fill={FILL_NONE}
                    stroke={STROKE}
                    strokeWidth="1"
                />
                <rect
                    x="30"
                    y="0"
                    width="30"
                    height={H}
                    fill={FILL_NONE}
                    stroke={STROKE}
                    strokeWidth="1"
                />
                <rect
                    x="60"
                    y="0"
                    width="30"
                    height={H}
                    fill={FILL_NONE}
                    stroke={STROKE}
                    strokeWidth="1"
                />
                <rect
                    x="90"
                    y="0"
                    width="30"
                    height={H}
                    fill={FILL_CORRECT}
                    stroke={STROKE}
                    strokeWidth="1"
                />
            </svg>
        ),
    },
];
