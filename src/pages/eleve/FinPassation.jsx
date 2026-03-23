import PropTypes from "prop-types";

/**
 * FinPassation
 *
 * Écran affiché après la soumission du dernier exercice (SRS F-PAS-09, F-PAS-10).
 *
 * Contraintes sources :
 * - Message neutre — aucun score, aucun biais, aucune correction (F-PAS-09).
 * - Bouton "Appelle ton enseignant(e)" → déclenche la vérification du PIN (F-PAS-10).
 *
 * @param {object}   props
 * @param {function} props.onAppelerEnseignant - Déclenche le PinGate de retour.
 */
function FinPassation({ onAppelerEnseignant }) {
    return (
        <div
            className="min-h-[calc(100vh-88px)] flex flex-col items-center
                    justify-center px-4 py-10 gap-8"
        >
            {/* Carte principale */}
            <div
                className="w-full max-w-sm bg-white rounded-2xl shadow-sm
                      border border-success-100 p-8 flex flex-col
                      items-center gap-6 text-center"
            >
                {/* Symbole de fin */}
                <div
                    className="w-20 h-20 rounded-full bg-success-100 flex items-center
                     justify-center font-display font-bold text-4xl
                     text-success-700 select-none"
                    aria-hidden="true"
                >
                    ✓
                </div>

                <div>
                    <h1 className="font-display font-bold text-2xl text-slate-800">
                        C'est terminé !
                    </h1>
                    <p className="mt-2 text-base text-slate-500">
                        Merci d'avoir répondu à tous les exercices.
                    </p>
                </div>
            </div>

            {/* Bouton retour enseignant */}
            <div className="text-center">
                <p className="text-sm text-slate-400 mb-3">Tu as tout fini ?</p>
                <button
                    onClick={onAppelerEnseignant}
                    className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600
                     text-white text-base font-semibold transition-colors
                     cursor-pointer"
                >
                    Appelle ton enseignant(e)
                </button>
            </div>
        </div>
    );
}

FinPassation.propTypes = {
    onAppelerEnseignant: PropTypes.func.isRequired,
};

export default FinPassation;
