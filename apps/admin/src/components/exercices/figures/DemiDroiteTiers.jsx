/**
 * DemiDroiteTiers
 *
 * Demi-droite graduée en tiers avec trois points A, B, C prépositionnés.
 * Support visuel de CM1 Ex.4 (lecture de position sur la demi-droite).
 *
 * Positions choisies par transposition numérique, cohérentes avec les
 * erreurs documentées dans la source CM1 :
 *   A = 2/3  (sous l'unité — cas simple)
 *   B = 5/3  (entre 1 et 2, fraction > 1 — obstacle documenté)
 *   C = 6/3  (= 2, entier exact — biais n/n non acquis documenté)
 *
 * Composant lecture seule, sans interaction.
 */
function DemiDroiteTiers() {
    const X0 = 50;
    const UNIT = 160;
    const D = 3;
    const MAX = 3; // 0, 1/3, …, 9/3 = 3
    const LEN = UNIT * MAX;
    const Y = 44;
    const STEPS = D * MAX; // 9 graduations

    function xAt(n, d) {
        return X0 + (n / d) * UNIT;
    }

    const points = [
        { id: "A", n: 2, d: 3 },
        { id: "B", n: 5, d: 3 },
        { id: "C", n: 6, d: 3 },
    ];

    const COLORS = { A: "#2f5ee8", B: "#d97706", C: "#15803d" };

    return (
        <svg
            width="100%"
            viewBox="0 0 570 78"
            aria-label="Demi-droite graduée en tiers avec points A, B et C"
        >
            {/* Droite */}
            <line
                x1={X0}
                y1={Y}
                x2={X0 + LEN + 10}
                y2={Y}
                stroke="#475569"
                strokeWidth="2"
            />
            {/* Flèche */}
            <polygon
                points={`${X0 + LEN + 20},${Y} ${X0 + LEN + 10},${Y - 5} ${X0 + LEN + 10},${Y + 5}`}
                fill="#475569"
            />

            {/* Graduations */}
            {Array.from({ length: STEPS + 1 }, (_, i) => {
                const x = X0 + (i / STEPS) * LEN;
                const isMajor = i % D === 0;
                const h = isMajor ? 12 : 6;
                const nVal = i;
                const label = isMajor ? String(nVal / D) : null;
                return (
                    <g key={i}>
                        <line
                            x1={x}
                            y1={Y - h}
                            x2={x}
                            y2={Y + h}
                            stroke={isMajor ? "#1e293b" : "#94a3b8"}
                            strokeWidth={isMajor ? 1.5 : 1}
                        />
                        {label && (
                            <text
                                x={x}
                                y={Y + h + 13}
                                textAnchor="middle"
                                fontSize="11"
                                fill="#64748b"
                                fontFamily="ui-monospace, monospace"
                            >
                                {label}
                            </text>
                        )}
                    </g>
                );
            })}

            {/* Points A, B, C */}
            {points.map((pt) => {
                const x = xAt(pt.n, pt.d);
                const c = COLORS[pt.id];
                return (
                    <g key={pt.id}>
                        {/* Ligne verticale de repère */}
                        <line
                            x1={x}
                            y1={Y - 18}
                            x2={x}
                            y2={Y}
                            stroke={c}
                            strokeWidth="1.5"
                            strokeDasharray="3,2"
                        />
                        <circle
                            cx={x}
                            cy={Y}
                            r={6}
                            fill={c}
                            stroke="white"
                            strokeWidth="2"
                        />
                        <text
                            x={x}
                            y={Y - 22}
                            textAnchor="middle"
                            fontSize="13"
                            fontWeight="700"
                            fill={c}
                            fontFamily="ui-sans-serif, sans-serif"
                        >
                            {pt.id}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

export default DemiDroiteTiers;
