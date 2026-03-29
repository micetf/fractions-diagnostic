import PropTypes from "prop-types";

/**
 * FractionInput
 *
 * Saisie d'une fraction par l'élève : deux champs numériques
 * (numérateur et dénominateur) séparés par une barre visuelle.
 *
 * Règles issues de la SRS §3.4 :
 * - La saisie dans un seul champ est enregistrée telle quelle
 *   (valeur diagnostique — ne pas forcer la complétion).
 * - Aucune validation de justesse n'est fournie à l'élève (SRS F-PAS-05).
 * - Le composant est contrôlé : value + onChange.
 *
 * Exercices sources utilisant ce composant :
 *   CE1 Ex.2, 7, 8 — CE2 Ex.7 — CM1 Ex.6, 7 — CM2 Ex.6, 7
 *
 * @param {object}   props
 * @param {{ numerateur: number|null, denominateur: number|null }} props.value
 *   Valeur courante. null si le champ est vide.
 * @param {function} props.onChange
 *   Appelé à chaque frappe avec { numerateur, denominateur }.
 * @param {string}   [props.idPrefix='fraction']
 *   Préfixe pour les id HTML (évite les collisions quand plusieurs
 *   FractionInput coexistent sur la même page).
 * @param {boolean}  [props.disabled=false]
 */
function FractionInput({
    value,
    onChange,
    idPrefix = "fraction",
    disabled = false,
}) {
    /**
     * Convertit la valeur d'un champ en entier ou null.
     * @param {string} raw
     * @returns {number|null}
     */
    function parseField(raw) {
        const trimmed = raw.trim();
        if (trimmed === "") return null;
        const parsed = parseInt(trimmed, 10);
        return isNaN(parsed) ? null : parsed;
    }

    function handleNumerateur(e) {
        onChange({
            numerateur: parseField(e.target.value),
            denominateur: value.denominateur,
        });
    }

    function handleDenominateur(e) {
        onChange({
            numerateur: value.numerateur,
            denominateur: parseField(e.target.value),
        });
    }

    const inputClass = `
    w-14 h-12 text-center text-xl font-mono font-semibold rounded-lg border
    focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    bg-white border-slate-300 text-slate-800
    [appearance:textfield]
    [&::-webkit-inner-spin-button]:appearance-none
    [&::-webkit-outer-spin-button]:appearance-none
`;

    return (
        <div
            className="inline-flex flex-col items-center gap-0.5"
            role="group"
            aria-label="Saisie d'une fraction"
        >
            {/* Numérateur */}
            <input
                id={`${idPrefix}-num`}
                type="number"
                min="0"
                step="1"
                value={value.numerateur ?? ""}
                onChange={handleNumerateur}
                disabled={disabled}
                aria-label="Numérateur"
                className={inputClass}
            />

            {/* Barre de fraction */}
            <div className="w-14 h-px bg-slate-700 my-0.5" aria-hidden="true" />

            {/* Dénominateur */}
            <input
                id={`${idPrefix}-den`}
                type="number"
                min="0"
                step="1"
                value={value.denominateur ?? ""}
                onChange={handleDenominateur}
                disabled={disabled}
                aria-label="Dénominateur"
                className={inputClass}
            />
        </div>
    );
}

FractionInput.propTypes = {
    value: PropTypes.shape({
        numerateur: PropTypes.number,
        denominateur: PropTypes.number,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    idPrefix: PropTypes.string,
    disabled: PropTypes.bool,
};

export default FractionInput;
