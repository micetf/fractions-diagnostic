/**
 * @fileoverview TangramCarre — carré divisé en 8 triangles égaux.
 *
 * Représente une fraction k/8 en coloriant k triangles consécutifs.
 * Construction : depuis le centre, lignes vers les 4 coins et les
 * 4 milieux des côtés → 8 triangles isocèles rectangles égaux.
 *
 * Utilisé pour CE1 Ex.2 item C (3/8).
 *
 * @param {object} props
 * @param {number} [props.k=3]      - Nombre de triangles coloriés (défaut : 3).
 * @param {number} [props.n=8]      - Nombre total de triangles (défaut : 8, fixe).
 * @param {string} [props.couleur='#bbd1ff'] - Couleur de remplissage.
 */
import PropTypes from "prop-types";

function TangramCarre({ k = 3, couleur = "#bbd1ff" }) {
    const S = 100; // côté du carré
    const cx = S / 2;
    const cy = S / 2;

    // 8 points de la périphérie dans l'ordre trigonométrique (départ : haut-gauche)
    // Coins : (0,0) (S,0) (S,S) (0,S)
    // Milieux : (S/2,0) (S,S/2) (S/2,S) (0,S/2)
    const pts = [
        [0, 0], // 0 — coin haut-gauche
        [cx, 0], // 1 — milieu haut
        [S, 0], // 2 — coin haut-droite
        [S, cy], // 3 — milieu droite
        [S, S], // 4 — coin bas-droite
        [cx, S], // 5 — milieu bas
        [0, S], // 6 — coin bas-gauche
        [0, cy], // 7 — milieu gauche
    ];

    // 8 triangles : chaque triangle est formé par deux points consécutifs + centre
    const triangles = pts.map((p, i) => {
        const q = pts[(i + 1) % 8];
        return `${p[0]},${p[1]} ${q[0]},${q[1]} ${cx},${cy}`;
    });

    return (
        <svg
            viewBox={`-4 -4 ${S + 8} ${S + 8}`}
            width="100%"
            style={{ maxWidth: 160 }}
            aria-label={`Carré divisé en 8 parties, ${k} coloriées`}
        >
            {/* Triangles coloriés */}
            {triangles.slice(0, k).map((pts, i) => (
                <polygon
                    key={`col-${i}`}
                    points={pts}
                    fill={couleur}
                    stroke="#fff"
                    strokeWidth={1.5}
                />
            ))}

            {/* Triangles vides */}
            {triangles.slice(k).map((pts, i) => (
                <polygon
                    key={`vid-${i}`}
                    points={pts}
                    fill="#fff"
                    stroke="#cbd5e1"
                    strokeWidth={1}
                />
            ))}

            {/* Contour du carré */}
            <rect
                x={0}
                y={0}
                width={S}
                height={S}
                fill="none"
                stroke="#94a3b8"
                strokeWidth={1.5}
            />
        </svg>
    );
}

TangramCarre.propTypes = {
    k: PropTypes.number,
    couleur: PropTypes.string,
};

export default TangramCarre;
