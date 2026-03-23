/**
 * RegletteSegments
 *
 * Règle graduée en quarts avec 3 segments à mesurer.
 * Source : CE2 Ex.3 — « Mesure avec ta règle graduée »
 *
 * Longueurs choisies par transposition numérique (non spécifiées dans la source) :
 *   A = 3/4  — lecture directe sur graduation principale
 *   B = 2/4  — biais documenté source : lire « 2 » au lieu de « 2/4 »
 *   C = 5/4  — dépasse l'unité → biais FRACTION_PAS_MESURE
 */
function RegletteSegments() {
    const X0 = 60; // x du zéro
    const UNIT = 160; // pixels par unité
    const RULER_Y = 158;

    function xAt(n, d) {
        return X0 + (n / d) * UNIT;
    }

    const segments = [
        { id: "A", n: 3, d: 4, y: 28 },
        { id: "B", n: 2, d: 4, y: 72 },
        { id: "C", n: 5, d: 4, y: 116 },
    ];

    // Graduations de 0 à 7/4 (toutes les 1/4)
    const grads = Array.from({ length: 8 }, (_, i) => ({
        i,
        x: X0 + (i / 4) * UNIT,
        isMajor: i % 4 === 0,
        label: i % 4 === 0 ? String(i / 4) : `${i}/4`,
    }));

    const rulerEnd = X0 + 1.75 * UNIT + 12; // flèche

    return (
        <svg
            width="100%"
            viewBox="0 0 460 198"
            aria-label="Règle graduée en quarts avec trois segments à mesurer"
        >
            {/* Ligne d'alignement verticale au zéro */}
            <line
                x1={X0}
                y1={14}
                x2={X0}
                y2={RULER_Y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4,3"
            />

            {/* Segments */}
            {segments.map((seg) => {
                const x2 = xAt(seg.n, seg.d);
                return (
                    <g key={seg.id}>
                        {/* Étiquette */}
                        <text
                            x={X0 - 22}
                            y={seg.y + 5}
                            textAnchor="middle"
                            fontSize="13"
                            fontWeight="700"
                            fill="#1e293b"
                            fontFamily="ui-sans-serif, sans-serif"
                        >
                            {seg.id}
                        </text>
                        {/* Corps du segment */}
                        <line
                            x1={X0}
                            y1={seg.y}
                            x2={x2}
                            y2={seg.y}
                            stroke="#1e293b"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                        {/* Tique de départ */}
                        <line
                            x1={X0}
                            y1={seg.y - 7}
                            x2={X0}
                            y2={seg.y + 7}
                            stroke="#1e293b"
                            strokeWidth="2"
                        />
                        {/* Tique de fin */}
                        <line
                            x1={x2}
                            y1={seg.y - 7}
                            x2={x2}
                            y2={seg.y + 7}
                            stroke="#1e293b"
                            strokeWidth="2"
                        />
                    </g>
                );
            })}

            {/* Règle */}
            <line
                x1={X0}
                y1={RULER_Y}
                x2={rulerEnd}
                y2={RULER_Y}
                stroke="#475569"
                strokeWidth="2"
            />
            {/* Flèche */}
            <polygon
                points={`${rulerEnd + 10},${RULER_Y} ${rulerEnd},${RULER_Y - 5} ${rulerEnd},${RULER_Y + 5}`}
                fill="#475569"
            />

            {/* Graduations */}
            {grads.map(({ i, x, isMajor, label }) => (
                <g key={i}>
                    <line
                        x1={x}
                        y1={RULER_Y - (isMajor ? 11 : 6)}
                        x2={x}
                        y2={RULER_Y + (isMajor ? 11 : 6)}
                        stroke={isMajor ? "#1e293b" : "#64748b"}
                        strokeWidth={isMajor ? 1.5 : 1}
                    />
                    <text
                        x={x}
                        y={RULER_Y + 24}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#64748b"
                        fontFamily="ui-monospace, monospace"
                    >
                        {label}
                    </text>
                </g>
            ))}
        </svg>
    );
}

export default RegletteSegments;
