/**
 * DemiDroiteCM2Ex3B
 *
 * Demi-droite graduée en tiers (0 → 4) pour CM2 Ex.3 Partie B.
 * Points A et B prépositionnés. Lecture seule, sans interaction.
 *
 *   A = entre 7/3 et 8/3  → positionné à 7.5/3 visuellement
 *   B = 11/3
 *
 * Erreurs documentées (source CM2) :
 *   A → lecture ordinale (compter les traits) au lieu de lire une mesure
 *   B → ne pas trouver 3+2/3 ni 4−1/3
 */
function DemiDroiteCM2Ex3B() {
    const X0 = 50;
    const UNIT = 130;
    const MAX = 4;
    const D = 3;
    const LEN = UNIT * MAX;
    const Y = 44;
    const STEPS = D * MAX; // 12 graduations

    // const xAt = (n, d) => X0 + (n / d) * UNIT;

    const points = [
        { id: "A", val: 7.5 / 3, couleur: "#2f5ee8" }, // entre 7/3 et 8/3
        { id: "B", val: 11 / 3, couleur: "#d97706" },
    ];

    return (
        <svg
            width="100%"
            viewBox="0 0 610 78"
            aria-label="Demi-droite graduée en tiers avec points A et B"
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
            <polygon
                points={`${X0 + LEN + 20},${Y} ${X0 + LEN + 10},${Y - 5} ${X0 + LEN + 10},${Y + 5}`}
                fill="#475569"
            />

            {/* Graduations */}
            {Array.from({ length: STEPS + 1 }, (_, i) => {
                const x = X0 + (i / STEPS) * LEN;
                const isMajor = i % D === 0;
                const h = isMajor ? 12 : 6;
                const label = isMajor ? String(i / D) : null;
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

            {/* Points A et B */}
            {points.map((pt) => {
                const x = X0 + pt.val * UNIT;
                return (
                    <g key={pt.id}>
                        <line
                            x1={x}
                            y1={Y - 18}
                            x2={x}
                            y2={Y}
                            stroke={pt.couleur}
                            strokeWidth="1.5"
                            strokeDasharray="3,2"
                        />
                        <circle
                            cx={x}
                            cy={Y}
                            r={6}
                            fill={pt.couleur}
                            stroke="white"
                            strokeWidth="2"
                        />
                        <text
                            x={x}
                            y={Y - 22}
                            textAnchor="middle"
                            fontSize="13"
                            fontWeight="700"
                            fill={pt.couleur}
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

export default DemiDroiteCM2Ex3B;
