import PropTypes from "prop-types";

/**
 * ColoringFigure
 *
 * Figure SVG composée de N segments cliquables.
 * Clic = colorié, reclic = vide.
 * Le patron de coloriage complet est enregistré comme tableau de booléens.
 *
 * Règles issues de la SRS §3.4 :
 * - Le patron exact (quelles parts) est enregistré tel quel (valeur diagnostique).
 * - Aucun retour de justesse n'est donné à l'élève (SRS F-PAS-05).
 * - Composant contrôlé : value (boolean[]) + onChange.
 *
 * Exercices sources utilisant ce composant :
 *   CE1 Ex.3, Ex.5 — CM1 Ex.2, Ex.6
 *
 * @param {object}    props
 * @param {SegmentDef[]} props.segments - Définitions des segments SVG.
 * @param {boolean[]} props.value       - Tableau d'états (true = colorié).
 * @param {function}  props.onChange    - Appelé avec le nouveau tableau.
 * @param {string}    [props.couleur='#bbd1ff'] - Couleur de remplissage.
 * @param {boolean}   [props.disabled=false]
 * @param {number}    [props.viewBoxW=300]
 * @param {number}    [props.viewBoxH=80]
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
                    {/* Forme cliquable */}
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
            // rect
            x: PropTypes.number,
            y: PropTypes.number,
            w: PropTypes.number,
            h: PropTypes.number,
            // polygon
            points: PropTypes.string,
            // path
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
