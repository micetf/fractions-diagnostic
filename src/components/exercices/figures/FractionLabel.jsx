import PropTypes from "prop-types";

/**
 * FractionLabel
 *
 * Affiche une fraction sous forme d'écriture mathématique (numérateur,
 * barre, dénominateur) dans un SVG de dimensions fixes.
 *
 * Utilisé dans les figures de CE2 Ex.2 et CM2 Ex.4.
 *
 * @param {object} props
 * @param {number} props.n  - Numérateur.
 * @param {number} props.d  - Dénominateur.
 * @param {number} [props.w=76] - Largeur du SVG.
 * @param {number} [props.h=52] - Hauteur du SVG.
 */
function FractionLabel({ n, d, w, h }) {
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
            <text
                x={w / 2}
                y={h / 2 - 6}
                textAnchor="middle"
                fontSize="15"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
                fill="#1e293b"
            >
                {n}
            </text>
            <line
                x1={w / 2 - 16}
                y1={h / 2 + 1}
                x2={w / 2 + 16}
                y2={h / 2 + 1}
                stroke="#1e293b"
                strokeWidth="1.5"
            />
            <text
                x={w / 2}
                y={h / 2 + 18}
                textAnchor="middle"
                fontSize="15"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
                fill="#1e293b"
            >
                {d}
            </text>
        </svg>
    );
}

FractionLabel.propTypes = {
    n: PropTypes.number.isRequired,
    d: PropTypes.number.isRequired,
    w: PropTypes.number,
    h: PropTypes.number,
};

FractionLabel.defaultProps = {
    w: 76,
    h: 52,
};

export default FractionLabel;
