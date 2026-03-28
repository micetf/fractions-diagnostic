/**
 * @fileoverview EcranAttente — affiché quand aucune config n'est disponible
 * ou quand tous les élèves ont terminé.
 *
 * Aucun lien vers l'interface admin visible par les élèves (SRS NF-SEC-06).
 * Lien discret "Espace enseignant·e" accessible uniquement quand tous ont passé.
 *
 * @module pages/EcranAttente
 */
import PropTypes from "prop-types";

/**
 * @param {object}   props
 * @param {boolean}  props.tousTermines  - true si tous les élèves ont passé.
 * @param {function} props.onImporter    - Ouvre l'écran d'import de config.
 * @param {function} props.onExporter    - Ouvre l'écran d'export des résultats.
 */
function EcranAttente({ tousTermines, onImporter, onExporter }) {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                <div
                    className="w-20 h-20 rounded-full bg-brand-100 flex items-center
                               justify-center text-4xl font-bold text-brand-600
                               mx-auto mb-6 select-none"
                    aria-hidden="true"
                >
                    ½
                </div>

                {tousTermines ? (
                    <>
                        <h1 className="text-xl font-semibold text-slate-800 mb-3">
                            Tous les élèves ont passé
                        </h1>
                        <p className="text-sm text-slate-500 leading-relaxed mb-8">
                            Le diagnostic est terminé sur cette tablette.
                            Appelle ton enseignant·e.
                        </p>
                        {/* Lien discret enseignant (SRS F-PAS-18) */}
                        <button
                            type="button"
                            onClick={onExporter}
                            className="w-full py-3 px-6 bg-brand-600 text-white rounded-xl
                                       font-semibold hover:bg-brand-700 active:bg-brand-800
                                       transition-colors touch-manipulation mb-3"
                        >
                            Espace enseignant·e
                        </button>
                        <button
                            type="button"
                            onClick={onImporter}
                            className="w-full py-2 px-6 rounded-xl border border-slate-200
                                       text-slate-500 text-sm hover:bg-slate-50
                                       transition-colors touch-manipulation"
                        >
                            Nouveau diagnostic
                        </button>
                    </>
                ) : (
                    <>
                        <h1 className="text-xl font-semibold text-slate-800 mb-3">
                            Cette tablette n&apos;est pas encore prête
                        </h1>
                        <p className="text-sm text-slate-500 leading-relaxed mb-6">
                            Appelle ton enseignant·e pour configurer les exercices.
                        </p>
                        <button
                            type="button"
                            onClick={onImporter}
                            className="w-full py-3 px-6 bg-brand-600 text-white rounded-xl
                                       font-semibold hover:bg-brand-700 active:bg-brand-800
                                       transition-colors touch-manipulation"
                        >
                            Importer une configuration
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

EcranAttente.propTypes = {
    tousTermines: PropTypes.bool.isRequired,
    onImporter:   PropTypes.func.isRequired,
    onExporter:   PropTypes.func.isRequired,
};

export default EcranAttente;
