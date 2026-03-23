import PropTypes from "prop-types";

/**
 * FinPassation
 *
 * Écran affiché après la soumission du dernier exercice (SRS F-PAS-09, F-PAS-10).
 *
 * Deux actions disponibles :
 * - « Élève suivant » : remet le mode élève à zéro pour le prochain élève,
 *   sans quitter le mode élève ni demander le PIN.
 * - « Appelle ton enseignant(e) » : déclenche la vérification du PIN
 *   pour retourner au tableau de bord (F-PAS-10).
 *
 * Contrainte source : aucun score, aucun résultat, aucun biais affiché (F-PAS-09).
 *
 * @param {object}   props
 * @param {function} props.onSuivant             - Passe au prochain élève sans PIN.
 * @param {function} props.onAppelerEnseignant   - Déclenche le PinGate de retour.
 */
function FinPassation({ onSuivant, onAppelerEnseignant }) {
    return (
        <div
            className="min-h-[calc(100vh-56px)] flex flex-col items-center
                    justify-center px-4 py-10 gap-8"
        >
            {/* Carte principale */}
            <div
                className="w-full max-w-sm bg-white rounded-2xl shadow-sm
                      border border-success-100 p-8 flex flex-col
                      items-center gap-6 text-center"
            >
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

                {/* Action principale : élève suivant */}
                <button
                    onClick={onSuivant}
                    className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600
                     text-white text-base font-semibold transition-colors
                     cursor-pointer"
                >
                    Élève suivant →
                </button>
            </div>

            {/* Action secondaire : retour enseignant */}
            <div className="text-center">
                <p className="text-sm text-slate-400 mb-3">
                    Tous les élèves ont passé le diagnostic ?
                </p>
                <button
                    onClick={onAppelerEnseignant}
                    className="px-6 py-2.5 rounded-xl border border-slate-300
                     hover:bg-slate-100 text-slate-600 text-sm font-medium
                     transition-colors cursor-pointer"
                >
                    Retour mode enseignant
                </button>
            </div>
        </div>
    );
}

FinPassation.propTypes = {
    onSuivant: PropTypes.func.isRequired,
    onAppelerEnseignant: PropTypes.func.isRequired,
};

export default FinPassation;
