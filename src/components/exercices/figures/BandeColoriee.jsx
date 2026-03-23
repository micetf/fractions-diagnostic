import PropTypes from "prop-types";

/**
 * BandeColoriee
 *
 * Bande horizontale partagée en N parts égales, les K premières coloriées.
 *
 * @param {object} props
 * @param {number} props.n
 * @param {number} props.k
 * @param {number} [props.w=180]
 * @param {number} [props.h=48]
 */
function BandeColoriee({ n, k, w = 180, h = 48 }) {
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

export default BandeColoriee;
