/**
 * @fileoverview FinPassation — écran de fin de passation.
 *
 * Aucun score, aucun résultat, aucun biais affiché (SRS F-PAS-16).
 * Un seul bouton proéminent : passer la tablette (SRS F-PAS-17).
 * Lien discret vers l'interface admin en bas (SRS F-PAS-18).
 *
 * @module pages/FinPassation
 */
import PropTypes from "prop-types";

/**
 * @param {object}   props
 * @param {string}   props.prenom       - Prénom de l'élève qui vient de terminer.
 * @param {function} props.onSuivant    - Retour à la grille des prénoms.
 * @param {function} props.onAdmin      - Ouvre l'interface admin.
 */
function FinPassation({ prenom, onSuivant, onAdmin }) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-sm text-center">

                {/* Icône succès */}
                <div
                    className="w-24 h-24 rounded-full bg-green-100 flex items-center
                               justify-center text-5xl mx-auto mb-6 select-none"
                    aria-hidden="true"
                >
                    ✓
                </div>

                <h1 className="text-2xl font-bold text-slate-800 mb-2">
                    C&apos;est terminé !
                </h1>
                <p className="text-slate-500 mb-10">
                    Merci {prenom}.
                </p>

                {/* Bouton principal */}
                <button
                    type="button"
                    onClick={onSuivant}
                    className="w-full py-5 rounded-2xl bg-brand-600 text-white
                               text-xl font-bold hover:bg-brand-700 active:bg-brand-800
                               transition-colors touch-manipulation mb-4"
                >
                    Passer la tablette au camarade suivant →
                </button>

                {/* Lien discret admin */}
                <button
                    type="button"
                    onClick={onAdmin}
                    className="text-xs text-slate-400 hover:text-slate-600
                               transition-colors py-2"
                >
                    Retour mode enseignant·e
                </button>
            </div>
        </div>
    );
}

FinPassation.propTypes = {
    prenom:    PropTypes.string.isRequired,
    onSuivant: PropTypes.func.isRequired,
    onAdmin:   PropTypes.func.isRequired,
};

export default FinPassation;
