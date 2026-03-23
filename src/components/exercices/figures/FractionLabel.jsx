import PropTypes from "prop-types";

/**
 * FractionLabel
 * @param {number} props.n
 * @param {number} props.d
 * @param {number} [props.w=76]
 * @param {number} [props.h=52]
 */
function FractionLabel({ n, d, w = 76, h = 52 }) {
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

export default FractionLabel;
