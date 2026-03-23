import PropTypes from "prop-types";

/**
 * TextJustification
 *
 * Zone de saisie libre pour les justifications élève.
 *
 * Règles issues de la SRS §3.4 :
 * - Tout item TextJustification est systématiquement marqué `aRelire: true`.
 *   Aucun biais ne peut être détecté automatiquement sur ce composant.
 * - Aucun retour de justesse n'est donné à l'élève (SRS F-PAS-05).
 * - Composant contrôlé : value + onChange.
 *
 * Utilisé seul ou en combinaison avec BinaryChoice (le choix précède
 * toujours la justification dans les exercices sources).
 *
 * Exercices sources utilisant ce composant :
 *   CE1 Ex.4, 7, 8 — CE2 Ex.1, 5, 6 — CM1 Ex.1, 5, 6, 7, 8 — CM2 Ex.5, 6, 7, 8
 *
 * @param {object}   props
 * @param {string}   props.value          - Texte courant.
 * @param {function} props.onChange        - Appelé avec la chaîne saisie.
 * @param {string}   [props.label]         - Libellé affiché au-dessus du champ.
 * @param {string}   [props.placeholder]
 * @param {boolean}  [props.disabled=false]
 */
function TextJustification({ value, onChange, label, placeholder, disabled }) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label className="text-base text-slate-700">{label}</label>
            )}

            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                rows={3}
                className="
          w-full px-4 py-3 rounded-xl border border-slate-300 text-base
          font-sans text-slate-800 resize-y
          focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          bg-white placeholder:text-slate-400
        "
            />
        </div>
    );
}

TextJustification.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
};

TextJustification.defaultProps = {
    label: "Explique comment tu as trouvé :",
    placeholder: "Écris ta réponse ici…",
    disabled: false,
};

export default TextJustification;
