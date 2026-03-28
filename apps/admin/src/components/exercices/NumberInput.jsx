import PropTypes from "prop-types";

/**
 * NumberInput
 *
 * Champ numérique simple pour les sous-questions attendant une réponse
 * entière ou décimale (ex. : CM1 Ex.7 — fractions comme opérateurs).
 *
 * Retourne une string (cohérent avec les autres composants contrôlés).
 * Le type="number" active le clavier numérique sur mobile.
 *
 * @param {object}   props
 * @param {string}   props.value
 * @param {function} props.onChange
 * @param {string}   [props.unite]  - Unité affichée après le champ (ex. "cm").
 * @param {string}   [props.placeholder]
 */
function NumberInput({ value, onChange, unite = "", placeholder = "…" }) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="number"
                inputMode="decimal"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-36 px-4 py-2.5 rounded-xl border-2 border-slate-200
                   text-slate-800 text-lg font-mono text-center
                   focus:outline-none focus:ring-2 focus:ring-brand-400
                   focus:border-transparent"
            />
            {unite && (
                <span className="text-base text-slate-500 font-medium">
                    {unite}
                </span>
            )}
        </div>
    );
}

NumberInput.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    unite: PropTypes.string,
    placeholder: PropTypes.string,
};

export default NumberInput;
