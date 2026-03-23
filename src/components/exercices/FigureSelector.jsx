import PropTypes from "prop-types";

/**
 * FigureSelector
 *
 * Affiche un ensemble de figures cliquables. L'élève sélectionne
 * une ou plusieurs figures selon la consigne.
 *
 * Règles issues de la SRS §3.4 :
 * - Clic = sélection, reclic = désélection.
 * - Aucun retour de justesse n'est donné à l'élève (SRS F-PAS-05).
 * - Composant contrôlé : value (tableau d'ids) + onChange.
 *
 * Exercices sources utilisant ce composant :
 *   CE1 Ex.1 — CE2 Ex.2 — CM2 Ex.4
 *
 * @param {object}    props
 * @param {FigureDef[]} props.figures  - Définitions des figures à afficher.
 * @param {string[]}  props.value      - Ids des figures sélectionnées.
 * @param {function}  props.onChange   - Appelé avec le nouveau tableau d'ids.
 * @param {boolean}   [props.multiple=true]  - true = sélection multiple.
 * @param {boolean}   [props.disabled=false]
 */
function FigureSelector({ figures, value, onChange, multiple, disabled }) {
    function handleClick(id) {
        if (disabled) return;
        if (multiple) {
            const next = value.includes(id)
                ? value.filter((v) => v !== id)
                : [...value, id];
            onChange(next);
        } else {
            onChange(value.includes(id) ? [] : [id]);
        }
    }

    return (
        <div
            className="flex flex-wrap gap-4"
            role="group"
            aria-label="Choisir une figure"
        >
            {figures.map((fig) => {
                const selected = value.includes(fig.id);
                return (
                    <button
                        key={fig.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleClick(fig.id)}
                        aria-pressed={selected}
                        aria-label={fig.description ?? fig.id}
                        className={`
              rounded-xl border-2 p-2 transition-colors cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-brand-400
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                  selected
                      ? "border-brand-500 bg-brand-50"
                      : "border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50"
              }
            `}
                    >
                        {/* Étiquette de la figure */}
                        <div className="text-xs font-mono text-slate-400 text-center mb-1">
                            {fig.id}
                        </div>

                        {/* SVG de la figure */}
                        {fig.svg}
                    </button>
                );
            })}
        </div>
    );
}

FigureSelector.propTypes = {
    figures: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            svg: PropTypes.node.isRequired,
            description: PropTypes.string,
        })
    ).isRequired,
    value: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired,
    multiple: PropTypes.bool,
    disabled: PropTypes.bool,
};

FigureSelector.defaultProps = {
    multiple: true,
    disabled: false,
};

export default FigureSelector;
