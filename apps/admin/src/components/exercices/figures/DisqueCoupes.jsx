import PropTypes from "prop-types";

/**
 * DisqueCoupes
 *
 * Disque partagé en N secteurs égaux, les K premiers coloriés.
 *
 * @param {object} props
 * @param {number} props.n
 * @param {number} props.k
 * @param {number} [props.size=80]
 */
function DisqueCoupes({ n, k, size = 80 }) {
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 6;

    const fill = "#bbd1ff";
    const stroke = "#475569";

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            aria-hidden="true"
        >
            {Array.from({ length: n }, (_, i) => {
                const a1 = (i / n) * 2 * Math.PI - Math.PI / 2;
                const a2 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
                const x1 = cx + r * Math.cos(a1);
                const y1 = cy + r * Math.sin(a1);
                const x2 = cx + r * Math.cos(a2);
                const y2 = cy + r * Math.sin(a2);
                const large = 1 / n > 0.5 ? 1 : 0;
                return (
                    <path
                        key={i}
                        d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`}
                        fill={i < k ? fill : "white"}
                        stroke={stroke}
                        strokeWidth="1"
                    />
                );
            })}
        </svg>
    );
}

DisqueCoupes.propTypes = {
    n: PropTypes.number.isRequired,
    k: PropTypes.number.isRequired,
    size: PropTypes.number,
};

export default DisqueCoupes;
