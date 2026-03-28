import PropTypes from "prop-types";

/**
 * @typedef {object} SegmentDef
 * @property {'rect'|'polygon'|'path'} shape
 * @property {string}  [label]
 * @property {number}  [x]       - rect uniquement
 * @property {number}  [y]       - rect uniquement
 * @property {number}  [w]       - rect uniquement
 * @property {number}  [h]       - rect uniquement
 * @property {string}  [points]  - polygon uniquement
 * @property {string}  [d]       - path uniquement
 */

/**
 * ColoringFigure
 *
 * Figure SVG composée de N segments cliquables.
 * Clic = colorié, second clic = vide.
 * Le patron de coloriage complet est enregistré comme tableau de booléens.
 *
 * Règles issues de la SRS §3.4 :
 * - Le patron exact (quelles parts) est enregistré tel quel (valeur diagnostique).
 * - Aucun retour de justesse n'est donné à l'élève (SRS F-PAS-05).
 * - Composant contrôlé : value (boolean[]) + onChange.
 *
 * Exercices sources utilisant ce composant :
 *   CE1 Ex.3, Ex.5 — CM1 Ex.2, Ex.6 — CM2 Ex.1
 *
 * Pour les fractions > 1 (CM2 Ex.1), les segments sont générés par
 * makeSegmentsMultiUnite() dans ExerciceRenderer, qui produit des
 * bandes-unités séparées et identiques. ColoringFigure ne connaît
 * pas la notion d'unité : il colorie des segments, point.
 *
 * @param {object}       props
 * @param {SegmentDef[]} props.segments  - Définitions des segments SVG.
 * @param {boolean[]}    props.value     - État de chaque segment (true = colorié).
 * @param {function}     props.onChange  - Appelé avec le nouveau tableau boolean[].
 * @param {string}       [props.couleur='#bbd1ff'] - Couleur de remplissage.
 * @param {boolean}      [props.disabled=false]    - Désactive les interactions.
 * @param {number}       [props.viewBoxW=300]
 * @param {number}       [props.viewBoxH=80]
 */
function ColoringFigure({
    segments,
    value,
    onChange,
    couleur = "#bbd1ff",
    disabled = false,
    viewBoxW = 300,
    viewBoxH = 80,
}) {
    /**
     * Bascule l'état du segment à l'index donné.
     * @param {number} index
     */
    function handleClick(index) {
        if (disabled) return;
        const next = value.map((v, i) => (i === index ? !v : v));
        onChange(next);
    }

    return (
        <svg
            width="100%"
            viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
            aria-label="Figure à colorier"
            style={{ maxWidth: viewBoxW }}
        >
            {segments.map((seg, i) => (
                <g
                    key={i}
                    onClick={() => handleClick(i)}
                    style={{ cursor: disabled ? "not-allowed" : "pointer" }}
                    role="checkbox"
                    aria-checked={value[i]}
                    aria-label={seg.label ?? `Part ${i + 1}`}
                    tabIndex={disabled ? -1 : 0}
                    onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                            e.preventDefault();
                            handleClick(i);
                        }
                    }}
                >
                    {seg.shape === "rect" && (
                        <rect
                            x={seg.x}
                            y={seg.y}
                            width={seg.w}
                            height={seg.h}
                            fill={value[i] ? couleur : "white"}
                            stroke="#475569"
                            strokeWidth="1"
                            opacity={disabled ? 0.5 : 1}
                        />
                    )}

                    {seg.shape === "polygon" && (
                        <polygon
                            points={seg.points}
                            fill={value[i] ? couleur : "white"}
                            stroke="#475569"
                            strokeWidth="1"
                            opacity={disabled ? 0.5 : 1}
                        />
                    )}

                    {seg.shape === "path" && (
                        <path
                            d={seg.d}
                            fill={value[i] ? couleur : "white"}
                            stroke="#475569"
                            strokeWidth="1"
                            opacity={disabled ? 0.5 : 1}
                        />
                    )}
                </g>
            ))}
        </svg>
    );
}

ColoringFigure.propTypes = {
    segments: PropTypes.arrayOf(
        PropTypes.shape({
            shape: PropTypes.oneOf(["rect", "polygon", "path"]).isRequired,
            label: PropTypes.string,
            x: PropTypes.number,
            y: PropTypes.number,
            w: PropTypes.number,
            h: PropTypes.number,
            points: PropTypes.string,
            d: PropTypes.string,
        })
    ).isRequired,
    value: PropTypes.arrayOf(PropTypes.bool).isRequired,
    onChange: PropTypes.func.isRequired,
    couleur: PropTypes.string,
    disabled: PropTypes.bool,
    viewBoxW: PropTypes.number,
    viewBoxH: PropTypes.number,
};

export default ColoringFigure;
