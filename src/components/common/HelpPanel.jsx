import PropTypes from "prop-types";
import { getAide } from "@/data/aide";

/**
 * HelpPanel
 *
 * Panneau d'aide contextuelle latéral (drawer depuis la droite).
 * Affiché sur demande via le bouton "?" de la navbar.
 * Contenu déterminé par la prop `pageActive`.
 *
 * @param {object}   props
 * @param {boolean}  props.ouvert       - Visibilité du panneau.
 * @param {function} props.onFermer     - Ferme le panneau.
 * @param {string}   props.pageActive   - Clé de la page courante.
 */
function HelpPanel({ ouvert, onFermer, pageActive }) {
    const aide = getAide(pageActive);

    return (
        <>
            {/* Overlay sombre */}
            {ouvert && (
                <div
                    className="fixed inset-0 bg-black/30 z-40"
                    onClick={onFermer}
                    aria-hidden="true"
                />
            )}

            {/* Panneau latéral */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Aide"
                className={`
          fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm
          bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out
          ${ouvert ? "translate-x-0" : "translate-x-full"}
        `}
            >
                {/* En-tête */}
                <div
                    className="flex items-center justify-between px-5 py-4
                        border-b border-slate-200 bg-slate-50 shrink-0"
                >
                    <div className="flex items-center gap-2">
                        <span
                            className="w-7 h-7 rounded-full bg-blue-600 text-white
                             flex items-center justify-center font-bold text-sm
                             shrink-0"
                        >
                            ?
                        </span>
                        <div>
                            <p className="font-semibold text-slate-800 leading-tight">
                                {aide.titre}
                            </p>
                            <p className="text-xs text-slate-400 leading-tight mt-0.5">
                                Aide contextuelle
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onFermer}
                        className="text-slate-400 hover:text-slate-600 text-2xl
                       leading-none cursor-pointer transition-colors"
                        aria-label="Fermer l'aide"
                    >
                        ×
                    </button>
                </div>

                {/* Contenu scrollable */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {/* Phrase d'intro */}
                    <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                        {aide.intro}
                    </p>

                    {/* Sections question / réponse */}
                    <div className="flex flex-col gap-4">
                        {aide.sections.map((section, i) => (
                            <div
                                key={i}
                                className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                            >
                                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                                    <p className="font-semibold text-sm text-slate-800">
                                        {section.q}
                                    </p>
                                </div>
                                <div className="px-4 py-3">
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {section.r}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pied de panneau */}
                <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 shrink-0">
                    <p className="text-xs text-slate-400 text-center">
                        L'aide change selon la page affichée.
                    </p>
                </div>
            </aside>
        </>
    );
}

HelpPanel.propTypes = {
    ouvert: PropTypes.bool.isRequired,
    onFermer: PropTypes.func.isRequired,
    pageActive: PropTypes.string.isRequired,
};

export default HelpPanel;
