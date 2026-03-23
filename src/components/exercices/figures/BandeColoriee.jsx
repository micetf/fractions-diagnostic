import PropTypes from "prop-types";

/**
 * BandeColoriee
 *
 * Bande horizontale partagée en N parts égales, les K premières coloriées.
 * Utilisée dans CE1 Ex.2 (figures A et C).
 *
 * @param {object} props
 * @param {number} props.n - Nombre total de parts.
 * @param {number} props.k - Nombre de parts coloriées (depuis la gauche).
 * @param {number} [props.w=180] - Largeur totale du SVG.
 * @param {number} [props.h=48]  - Hauteur totale du SVG.
 */
function BandeColoriee({ n, k, w, h }) {
    const partW = w / n;
    const fill = "#bbd1ff";
    const stroke = "#475569";

    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
            {Array.from({ length: n }, (_, i) => (
                <rect
                    key={i}
                    x={i * partW}
                    y={4}
                    width={partW}
                    height={h - 8}
                    fill={i < k ? fill : "white"}
                    stroke={stroke}
                    strokeWidth="1"
                />
            ))}
        </svg>
    );
}

BandeColoriee.propTypes = {
    n: PropTypes.number.isRequired,
    k: PropTypes.number.isRequired,
    w: PropTypes.number,
    h: PropTypes.number,
};

BandeColoriee.defaultProps = {
    w: 180,
    h: 48,
};

export default BandeColoriee;
