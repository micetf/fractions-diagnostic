import PropTypes from "prop-types";

/**
 * CarreColorie
 *
 * Carré divisé en N triangles égaux depuis le centre (4 coins + 4 milieux
 * des côtés), les K premiers coloriés dans le sens horaire depuis le coin
 * supérieur gauche.
 *
 * Utilisé pour CE1 Ex.2 item C (n=8, k=3).
 *
 * @param {object} props
 * @param {number} props.n
 * @param {number} props.k
 * @param {number} [props.size=80]
 */
function CarreColorie({ n, k, size = 80 }) {
    const pad = 6;
    const S = size - pad * 2;
    const ox = pad;
    const oy = pad;
    const cx = ox + S / 2;
    const cy = oy + S / 2;

    const fill = "#bbd1ff";
    const stroke = "#475569";

    const pts = [
        [ox, oy],
        [ox + S / 2, oy],
        [ox + S, oy],
        [ox + S, oy + S / 2],
        [ox + S, oy + S],
        [ox + S / 2, oy + S],
        [ox, oy + S],
        [ox, oy + S / 2],
    ];

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            aria-hidden="true"
        >
            {Array.from({ length: n }, (_, i) => {
                const p = pts[i];
                const q = pts[(i + 1) % n];
                return (
                    <polygon
                        key={i}
                        points={`${p[0]},${p[1]} ${q[0]},${q[1]} ${cx},${cy}`}
                        fill={i < k ? fill : "white"}
                        stroke={stroke}
                        strokeWidth="1"
                    />
                );
            })}
        </svg>
    );
}

CarreColorie.propTypes = {
    n: PropTypes.number.isRequired,
    k: PropTypes.number.isRequired,
    size: PropTypes.number,
};

export default CarreColorie;
