import PropTypes from "prop-types";

/**
 * TangramCarre
 *
 * Carré divisé en 8 triangles égaux depuis le centre (4 coins + 4 milieux
 * des côtés), les K premiers coloriés dans le sens horaire depuis le coin
 * supérieur gauche.
 *
 * Utilisé pour CE1 Ex.2 item C (n=8, k=3).
 *
 * @param {object} props
 * @param {number} props.n    - Nombre total de triangles (doit être 8).
 * @param {number} props.k    - Nombre de triangles coloriés.
 * @param {number} [props.size=80]
 */
function TangramCarre({ n, k, size = 80 }) {
    const pad = 6;
    const S = size - pad * 2; // côté du carré interne
    const ox = pad; // origine x
    const oy = pad; // origine y
    const cx = ox + S / 2; // centre x
    const cy = oy + S / 2; // centre y

    const fill = "#bbd1ff";
    const stroke = "#475569";

    // 8 points périphériques dans le sens horaire depuis le coin haut-gauche :
    // coins et milieux de côtés alternés
    const pts = [
        [ox, oy], // 0 — coin haut-gauche
        [ox + S / 2, oy], // 1 — milieu haut
        [ox + S, oy], // 2 — coin haut-droite
        [ox + S, oy + S / 2], // 3 — milieu droite
        [ox + S, oy + S], // 4 — coin bas-droite
        [ox + S / 2, oy + S], // 5 — milieu bas
        [ox, oy + S], // 6 — coin bas-gauche
        [ox, oy + S / 2], // 7 — milieu gauche
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

TangramCarre.propTypes = {
    n: PropTypes.number.isRequired,
    k: PropTypes.number.isRequired,
    size: PropTypes.number,
};

export default TangramCarre;
