import PropTypes from "prop-types";

/**
 * BinaryChoice
 *
 * Choix exclusif parmi 2 ou 3 options (boutons radio visuels).
 *
 * Règles issues de la SRS §3.4 :
 * - La sélection est immédiate au clic, sans bouton de validation intermédiaire.
 * - Aucun retour de justesse n'est donné à l'élève (SRS F-PAS-05).
 * - Composant contrôlé : value + onChange.
 *
 * Exercices sources utilisant ce composant :
 *   CE1 Ex.4, 6 — CE2 Ex.1, 5, 6 — CM1 Ex.1 (3 options), 2, 5 — CM2 Ex.2, 5, 8
 *
 * @param {object}   props
 * @param {string[]} props.options        - Tableau des libellés (2 ou 3 éléments).
 * @param {string|null} props.value       - Option sélectionnée, ou null.
 * @param {function} props.onChange       - Appelé avec le libellé sélectionné.
 * @param {boolean}  [props.disabled=false]
 */
function BinaryChoice({ options, value = null, onChange, disabled = false }) {
    return (
        <div
            className="flex flex-wrap gap-3"
            role="group"
            aria-label="Choisir une réponse"
        >
            {options.map((option) => {
                const selected = value === option;
                return (
                    <button
                        key={option}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(option)}
                        aria-pressed={selected}
                        className={`
              px-6 py-3 rounded-xl text-base font-semibold border-2
              transition-colors cursor-pointer select-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                  selected
                      ? "bg-brand-500 border-brand-600 text-white"
                      : "bg-white border-slate-300 text-slate-700 hover:border-brand-400 hover:bg-brand-50"
              }
            `}
                    >
                        {option}
                    </button>
                );
            })}
        </div>
    );
}

BinaryChoice.propTypes = {
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

export default BinaryChoice;
