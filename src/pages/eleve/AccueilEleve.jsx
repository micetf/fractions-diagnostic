import PropTypes from "prop-types";

/**
 * AccueilEleve
 *
 * Page d'accueil du mode élève.
 * Sprint 0 : squelette uniquement.
 * Le sélecteur d'élève et PassationRunner sont produits aux sprints S11–S12.
 *
 * Contrainte SRS NF-UX-01 : police ≥ 16 px (text-base),
 * consignes en 18 px (text-lg).
 *
 * @param {object}   props
 * @param {function} props.onReturnToTeacher - Retour en mode enseignant.
 *                                             Conditionné par le PIN à partir de S3.
 */
function AccueilEleve({ onReturnToTeacher }) {
    return (
        <div className="min-h-[calc(100vh-88px)] flex flex-col items-center justify-center px-4 py-10">
            <div
                className="w-full max-w-sm bg-white rounded-2xl shadow-sm
                      border border-brand-100 p-8 flex flex-col items-center gap-6 text-center"
            >
                {/* Symbole décoratif */}
                <div
                    className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center
                     font-display font-bold text-4xl text-brand-600 select-none"
                    aria-hidden="true"
                >
                    ½
                </div>

                <div>
                    <h1 className="font-display font-bold text-2xl text-slate-800 leading-snug">
                        Exercices sur les fractions
                    </h1>
                    <p className="mt-2 text-base text-slate-500">
                        Ton enseignant(e) va préparer les exercices pour toi.
                    </p>
                </div>

                {/* Placeholder — activé en S11 */}
                <button
                    disabled
                    className="w-full py-3 rounded-xl text-base font-semibold
                     bg-brand-200 text-brand-400 cursor-not-allowed"
                >
                    En attente de la session…
                </button>
            </div>

            {/* Lien de test sprint 0 uniquement */}
            <button
                onClick={onReturnToTeacher}
                className="mt-8 text-sm text-slate-400 hover:text-slate-600
                   underline underline-offset-2 transition-colors cursor-pointer"
            >
                ← Retour mode enseignant (test S0)
            </button>
        </div>
    );
}

AccueilEleve.propTypes = {
    onReturnToTeacher: PropTypes.func.isRequired,
};

export default AccueilEleve;
