/**
 * RulerWithPointP
 *
 * Règle graduée en huitièmes avec le point P placé entre 5/8 et 6/8.
 * Les graduations intermédiaires sont affichées sans labels — l'élève
 * doit compter pour localiser P (valeur diagnostique préservée).
 * Seuls 0 et 1 sont étiquetés.
 *
 * Source : CE2 Ex.4 "Place les fractions sur la règle" —
 *          sous-question encadrement.
 */
function RulerWithPointP() {
    const X0 = 60;
    const UNIT = 400;
    const Y = 36;
    const D = 8; // huitièmes
    const P = 5.5 / D; // point P entre 5/8 et 6/8

    const xAt = (v) => X0 + v * UNIT;
    const xP = xAt(P);

    return (
        <svg
            width="100%"
            viewBox="0 0 520 72"
            aria-label="Règle graduée en huitièmes avec le point P"
        >
            {/* Droite */}
            <line
                x1={X0}
                y1={Y}
                x2={X0 + UNIT + 10}
                y2={Y}
                stroke="#475569"
                strokeWidth="2"
                strokeLinecap="round"
            />
            {/* Flèche */}
            <polygon
                points={`${X0 + UNIT + 20},${Y} ${X0 + UNIT + 10},${Y - 5} ${X0 + UNIT + 10},${Y + 5}`}
                fill="#475569"
            />

            {/* Graduations */}
            {Array.from({ length: D + 1 }, (_, i) => {
                const x = xAt(i / D);
                const isMajor = i === 0 || i === D;
                const h = isMajor ? 14 : 7;
                const label = i === 0 ? "0" : i === D ? "1" : null;
                return (
                    <g key={i}>
                        <line
                            x1={x}
                            y1={Y - h}
                            x2={x}
                            y2={Y + h}
                            stroke={isMajor ? "#1e293b" : "#64748b"}
                            strokeWidth={isMajor ? 2 : 1}
                        />
                        {label && (
                            <text
                                x={x}
                                y={Y + h + 13}
                                textAnchor="middle"
                                fontSize="12"
                                fill="#475569"
                                fontFamily="ui-monospace, monospace"
                            >
                                {label}
                            </text>
                        )}
                    </g>
                );
            })}

            {/* Point P */}
            <circle
                cx={xP}
                cy={Y}
                r={6}
                fill="#dc2626"
                stroke="white"
                strokeWidth="2"
            />
            <text
                x={xP}
                y={Y - 14}
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill="#dc2626"
                fontFamily="ui-sans-serif, sans-serif"
            >
                P
            </text>
        </svg>
    );
}

export default RulerWithPointP;
