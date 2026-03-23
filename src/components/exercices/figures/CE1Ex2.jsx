/**
 * @fileoverview Figures SVG pour CE1 Ex.2 — Quelle fraction est coloriée ?
 *
 * Source : exercices diagnostiques CE1, exercice 2.
 *
 * A : bande partagée en 5 parts égales, 2 parts coloriées → attendu 2/5
 * B : disque partagé en 6 parts égales, 1 part coloriée  → attendu 1/6
 * C : bande partagée en 8 parts égales, 3 parts coloriées → attendu 3/8
 */

const FILL = "#bbd1ff"; // brand-200
const STROKE = "#475569"; // slate-600
const W = 180;
const H = 48;

function BandeColoriee({ n, k }) {
    const partW = W / n;
    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            {Array.from({ length: n }, (_, i) => (
                <rect
                    key={i}
                    x={i * partW}
                    y={4}
                    width={partW}
                    height={H - 8}
                    fill={i < k ? FILL : "white"}
                    stroke={STROKE}
                    strokeWidth="1"
                />
            ))}
        </svg>
    );
}

function DisqueCoupes({ n, k }) {
    const cx = 40;
    const cy = 40;
    const r = 34;
    const slices = Array.from({ length: n }, (_, i) => {
        const a1 = (i / n) * 2 * Math.PI - Math.PI / 2;
        const a2 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
        const x1 = cx + r * Math.cos(a1);
        const y1 = cy + r * Math.sin(a1);
        const x2 = cx + r * Math.cos(a2);
        const y2 = cy + r * Math.sin(a2);
        const large = 1 / n > 0.5 ? 1 : 0;
        return { x1, y1, x2, y2, large, colored: i < k };
    });
    return (
        <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
            {slices.map((s, i) => (
                <path
                    key={i}
                    d={`M${cx},${cy} L${s.x1},${s.y1} A${r},${r} 0 ${s.large} 1 ${s.x2},${s.y2} Z`}
                    fill={s.colored ? FILL : "white"}
                    stroke={STROKE}
                    strokeWidth="1"
                />
            ))}
        </svg>
    );
}

import PropTypes from "prop-types";
BandeColoriee.propTypes = {
    n: PropTypes.number.isRequired,
    k: PropTypes.number.isRequired,
};
DisqueCoupes.propTypes = {
    n: PropTypes.number.isRequired,
    k: PropTypes.number.isRequired,
};

export const figuresCE1Ex2 = {
    A: <BandeColoriee n={5} k={2} />,
    B: <DisqueCoupes n={6} k={1} />,
    C: <BandeColoriee n={8} k={3} />,
};
