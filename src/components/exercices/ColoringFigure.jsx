import PropTypes from "prop-types";

/**
 * @typedef {object} SegmentDef
 * @property {'rect'|'polygon'|'path'} shape
 * @property {string}  [label]
 * @property {number}  [x]       - rect
 * @property {number}  [y]       - rect
 * @property {number}  [w]       - rect
 * @property {number}  [h]       - rect
 * @property {string}  [points]  - polygon
 * @property {string}  [d]       - path
 */

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
 *   CE1 Ex.3, Ex.5 — CM1 Ex.2, Ex.6 — CM2 Ex.1
 *
 * @param {object}       props
 * @param {SegmentDef[]} props.segments    - Définitions des segments SVG.
 * @param {boolean[]}    props.value       - Tableau d'états (true = colorié).
 * @param {function}     props.onChange    - Appelé avec le nouveau tableau.
 * @param {string}       [props.couleur='#bbd1ff']  - Couleur de remplissage.
 * @param {boolean}      [props.disabled=false]
 * @param {number}       [props.viewBoxW=300]
 * @param {number}       [props.viewBoxH=80]
 * @param {number}       [props.uniteSize]
 *   Si défini, trace un séparateur épais toutes les N cases pour matérialiser
 *   la frontière entre unités (CM2 Ex.1 : représentation de fractions > 1).
 *   Applicable uniquement aux segments de type 'rect'.
 *   Ne souffle pas la réponse : l'élève choisit combien de groupes colorier.
 */
function ColoringFigure({
    segments,
    value,
    onChange,
    couleur = "#bbd1ff",
    disabled = false,
    viewBoxW = 300,
    viewBoxH = 80,
    uniteSize = undefined,
}) {
    function handleClick(index) {
        if (disabled) return;
        const next = value.map((v, i) => (i === index ? !v : v));
        onChange(next);
    }

    // ── Positions des séparateurs d'unité ──────────────────────────────────────
    // Calculés une seule fois à partir des segments rect dont l'index
    // est un multiple de uniteSize (hors 0).
    const separateurs = [];
    if (uniteSize && uniteSize > 0) {
        for (let i = uniteSize; i < segments.length; i += uniteSize) {
            const seg = segments[i];
            if (seg?.shape === "rect" && typeof seg.x === "number") {
                separateurs.push({
                    x: seg.x,
                    y1: (seg.y ?? 10) - 6,
                    y2: (seg.y ?? 10) + (seg.h ?? 60) + 6,
                });
            }
        }
    }

    return (
        <svg
            width="100%"
            viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
            aria-label="Figure à colorier"
            style={{ maxWidth: viewBoxW }}
        >
            {/* ── Segments cliquables ───────────────────────────────────────────── */}
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

            {/* ── Séparateurs d'unité (uniteSize) ──────────────────────────────── */}
            {/*
        Dessinés PAR-DESSUS les segments pour être bien visibles.
        Trait épais (#1e293b), légèrement plus haut et plus bas que la bande.
        Matérialise la frontière entre unités sans indiquer combien en utiliser.
      */}
            {separateurs.map((sep, idx) => (
                <line
                    key={`sep-${idx}`}
                    x1={sep.x}
                    y1={sep.y1}
                    x2={sep.x}
                    y2={sep.y2}
                    stroke="#1e293b"
                    strokeWidth="3"
                    strokeLinecap="round"
                    pointerEvents="none" /* les clics passent au segment sous-jacent */
                />
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
    uniteSize: PropTypes.number,
};

export default ColoringFigure;
