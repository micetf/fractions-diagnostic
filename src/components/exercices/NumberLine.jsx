import { useRef, useState } from "react";
import PropTypes from "prop-types";

/**
 * Dimensions de la viewBox SVG.
 * La viewBox est fixe à 600×80 — le SVG est responsive via width="100%".
 * La conversion coordonnées-écran → coordonnées-SVG tient compte du scaling.
 */
const VB_W = 600;
const VB_H = 80;
const LINE_X1 = 50; // début de la droite (SVG)
const LINE_X2 = 535; // fin de la droite (SVG, avant la flèche)
const LINE_LEN = LINE_X2 - LINE_X1; // 485
const LINE_Y = 36; // ordonnée de la droite
const PT_R = 8; // rayon du point draggable

// ─── Fonctions de conversion ─────────────────────────────────────────────────

/**
 * Valeur fractionnaire → coordonnée x SVG.
 *
 * @param {number} n - Numérateur.
 * @param {number} d - Dénominateur.
 * @param {number} min - Valeur minimale de la droite.
 * @param {number} max - Valeur maximale de la droite.
 * @returns {number}
 */
function fractionToX(n, d, min, max) {
    return LINE_X1 + ((n / d - min) / (max - min)) * LINE_LEN;
}

/**
 * Coordonnée x SVG → fraction la plus proche sur la graduation.
 *
 * @param {number} x
 * @param {number} denominateur
 * @param {number} min
 * @param {number} max
 * @returns {{ numerateur: number, denominateur: number }}
 */
function xToNearestFraction(x, denominateur, min, max) {
    const value = min + ((x - LINE_X1) / LINE_LEN) * (max - min);
    const clamped = Math.max(min, Math.min(max, value));
    const step = Math.round(clamped * denominateur);
    const maxStep = (max - min) * denominateur;
    const snapped = Math.max(0, Math.min(maxStep, step));
    return {
        numerateur: Math.round(min * denominateur + snapped),
        denominateur,
    };
}

/**
 * Construit la liste des graduations à afficher.
 *
 * @param {number} denominateur
 * @param {number} min
 * @param {number} max
 * @returns {Array<{ x, isMajor, n, d }>}
 */
function buildGraduations(denominateur, min, max) {
    const totalSteps = Math.round((max - min) * denominateur);
    const grads = [];
    for (let i = 0; i <= totalSteps; i++) {
        const n = Math.round(min * denominateur) + i;
        const x = LINE_X1 + (i / totalSteps) * LINE_LEN;
        const isMajor = n % denominateur === 0;
        grads.push({ x, isMajor, n, d: denominateur });
    }
    return grads;
}

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * NumberLine
 *
 * Demi-droite graduée interactive avec un point déplaçable.
 * Le point s'accroche (snap) à la graduation la plus proche au relâchement.
 *
 * Composant contrôlé : `value` + `onChange`.
 * Si `value` est null, un clic sur la droite pose le point.
 *
 * Utilisé pour :
 *   CE2 Ex.4 (dénominateur 8, max 1)
 *   CM1 Ex.3 (dénominateur 4, max 2)
 *   CM2 Ex.3 (dénominateur 3, max 4)
 *
 * @param {object}  props
 * @param {object}  props.graduation          - Config de la graduation.
 * @param {number}  props.graduation.denominateur
 * @param {number}  props.graduation.min
 * @param {number}  props.graduation.max
 * @param {{ numerateur: number, denominateur: number } | null} props.value
 * @param {function} props.onChange           - Appelé avec { numerateur, denominateur }.
 * @param {string}  [props.couleur='#2f5ee8'] - Couleur du point.
 * @param {string}  [props.etiquette]         - Libellé affiché sous le point.
 */
function NumberLine({ graduation, value, onChange, couleur, etiquette }) {
    const { denominateur, min, max } = graduation;
    const svgRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [dragX, setDragX] = useState(null);

    // Coordonnée x affichée (pendant le drag : libre ; sinon : snappée)
    const displayX =
        dragging && dragX !== null
            ? dragX
            : value
              ? fractionToX(value.numerateur, value.denominateur, min, max)
              : null;

    // ── Conversion coordonnées client → SVG ──────────────────────────────────

    function clientToSvgX(clientX) {
        const svg = svgRef.current;
        if (!svg) return LINE_X1;
        const rect = svg.getBoundingClientRect();
        const scale = VB_W / rect.width;
        const raw = (clientX - rect.left) * scale;
        return Math.max(LINE_X1, Math.min(LINE_X2, raw));
    }

    // ── Gestionnaires de drag ─────────────────────────────────────────────────

    function handlePointerDown(e) {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
        setDragX(clientToSvgX(e.clientX));
    }

    function handlePointerMove(e) {
        if (!dragging) return;
        setDragX(clientToSvgX(e.clientX));
    }

    function handlePointerUp(e) {
        if (!dragging) return;
        setDragging(false);
        const snapped = xToNearestFraction(
            clientToSvgX(e.clientX),
            denominateur,
            min,
            max
        );
        setDragX(null);
        onChange(snapped);
    }

    // ── Clic pour poser le point (quand value === null) ───────────────────────

    function handleLineClick(e) {
        if (value !== null) return;
        const snapped = xToNearestFraction(
            clientToSvgX(e.clientX),
            denominateur,
            min,
            max
        );
        onChange(snapped);
    }

    // ── Graduations ───────────────────────────────────────────────────────────

    const graduations = buildGraduations(denominateur, min, max);

    // ── Rendu ─────────────────────────────────────────────────────────────────

    return (
        <div className="w-full select-none">
            <svg
                ref={svgRef}
                width="100%"
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                overflow="visible"
                aria-label="Demi-droite graduée"
            >
                {/* ── Droite ──────────────────────────────────────────── */}
                <line
                    x1={LINE_X1}
                    y1={LINE_Y}
                    x2={LINE_X2}
                    y2={LINE_Y}
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                {/* Flèche */}
                <polygon
                    points={`${LINE_X2 + 10},${LINE_Y} ${LINE_X2},${LINE_Y - 5} ${LINE_X2},${LINE_Y + 5}`}
                    fill="#94a3b8"
                />

                {/* ── Graduations ─────────────────────────────────────── */}
                {graduations.map(({ x, isMajor, n, d }) => {
                    const hBar = isMajor ? 14 : 8;
                    const label = isMajor
                        ? n % d === 0
                            ? String(n / d)
                            : `${n}/${d}`
                        : null;
                    return (
                        <g key={`${n}/${d}`}>
                            <line
                                x1={x}
                                y1={LINE_Y - hBar / 2}
                                x2={x}
                                y2={LINE_Y + hBar / 2}
                                stroke={isMajor ? "#475569" : "#94a3b8"}
                                strokeWidth={isMajor ? 1.5 : 1}
                            />
                            {label && (
                                <text
                                    x={x}
                                    y={LINE_Y + hBar / 2 + 13}
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

                {/* ── Zone de clic pour poser le point ────────────────── */}
                {displayX === null && (
                    <rect
                        x={LINE_X1}
                        y={LINE_Y - 20}
                        width={LINE_LEN}
                        height={40}
                        fill="transparent"
                        style={{ cursor: "crosshair" }}
                        onClick={handleLineClick}
                    />
                )}

                {/* ── Point draggable ─────────────────────────────────── */}
                {displayX !== null && (
                    <g
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        style={{
                            cursor: dragging ? "grabbing" : "grab",
                            touchAction: "none",
                        }}
                    >
                        {/* Zone de capture plus large que le cercle visible */}
                        <circle
                            cx={displayX}
                            cy={LINE_Y}
                            r={PT_R + 6}
                            fill="transparent"
                        />
                        {/* Cercle visible */}
                        <circle
                            cx={displayX}
                            cy={LINE_Y}
                            r={PT_R}
                            fill={dragging ? "#1a36a6" : couleur}
                            stroke="white"
                            strokeWidth="2.5"
                        />
                        {/* Étiquette au-dessus du point */}
                        {etiquette && (
                            <text
                                x={displayX}
                                y={LINE_Y - PT_R - 6}
                                textAnchor="middle"
                                fontSize="11"
                                fill={couleur}
                                fontWeight="600"
                                fontFamily="ui-monospace, monospace"
                            >
                                {etiquette}
                            </text>
                        )}
                    </g>
                )}
            </svg>

            {/* Valeur courante — affichée sous le SVG */}
            {value && (
                <p className="text-xs text-center text-slate-400 mt-1 font-mono">
                    Position : {value.numerateur}/{value.denominateur}
                    {value.numerateur % value.denominateur === 0
                        ? ` = ${value.numerateur / value.denominateur}`
                        : ""}
                </p>
            )}
        </div>
    );
}

NumberLine.propTypes = {
    graduation: PropTypes.shape({
        denominateur: PropTypes.number.isRequired,
        min: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
    }).isRequired,
    value: PropTypes.shape({
        numerateur: PropTypes.number.isRequired,
        denominateur: PropTypes.number.isRequired,
    }),
    onChange: PropTypes.func.isRequired,
    couleur: PropTypes.string,
    etiquette: PropTypes.string,
};

NumberLine.defaultProps = {
    value: null,
    couleur: "#2f5ee8",
    etiquette: undefined,
};

export default NumberLine;
