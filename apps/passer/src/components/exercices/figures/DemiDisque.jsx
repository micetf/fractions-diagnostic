/**
 * DemiDisque
 *
 * Figure SVG d'un demi-disque utilisée comme support visuel de CE1 Ex.6.
 * Source : « Voici un demi-disque. » — exercices diagnostiques CE1, exercice 6.
 *
 * La ligne de coupure est horizontale (diamètre), demi-disque supérieur.
 */
function DemiDisque() {
    const cx = 60;
    const cy = 60;
    const r = 50;

    return (
        <svg
            width="120"
            height="70"
            viewBox="0 0 120 70"
            aria-label="Un demi-disque"
        >
            {/* Demi-disque supérieur — arc de 180° */}
            <path
                d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy} Z`}
                fill="#bbd1ff"
                stroke="#475569"
                strokeWidth="1.5"
            />
            {/* Diamètre — ligne de base */}
            <line
                x1={cx - r}
                y1={cy}
                x2={cx + r}
                y2={cy}
                stroke="#475569"
                strokeWidth="1.5"
            />
        </svg>
    );
}

export default DemiDisque;
