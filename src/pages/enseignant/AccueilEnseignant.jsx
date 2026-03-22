import PropTypes from "prop-types";

/**
 * AccueilEnseignant
 *
 * Page d'accueil du mode enseignant.
 * Sprint 0 : squelette de navigation uniquement.
 * Les modules fonctionnels sont construits aux sprints S3 à S5.
 *
 * @param {object}   props
 * @param {function} props.onStartSession - Bascule en mode élève (actif en S5).
 */
function AccueilEnseignant({ onStartSession }) {
    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-semibold text-slate-800 mb-1">
                Tableau de bord
            </h1>
            <p className="text-sm text-slate-500 mb-8">
                Gérez vos classes, lancez des sessions diagnostiques et analysez
                les résultats.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SprintCard titre="Mes classes" sprint="S4" />
                <SprintCard titre="Créer une session" sprint="S5" />
                <SprintCard titre="Analyse des résultats" sprint="S14" />
                <SprintCard titre="Export / Import" sprint="S18" />
            </div>

            {/* Bouton de test bascule — remplacé par la logique PIN en S3 */}
            <div className="mt-10 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-400 mb-3">
                    Test sprint 0 — basculer manuellement en mode élève :
                </p>
                <button
                    onClick={onStartSession}
                    className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                     text-white text-sm font-medium transition-colors cursor-pointer"
                >
                    Passer en mode élève
                </button>
            </div>
        </div>
    );
}

AccueilEnseignant.propTypes = {
    onStartSession: PropTypes.func.isRequired,
};

/* ── Sous-composant interne ──────────────────────────────────────── */

/**
 * SprintCard
 *
 * Carte représentant un module à venir, avec sa référence de sprint.
 *
 * @param {object} props
 * @param {string} props.titre  - Nom du module.
 * @param {string} props.sprint - Référence du sprint SRS (ex. "S4").
 */
function SprintCard({ titre, sprint }) {
    return (
        <div
            className="rounded-xl border border-slate-200 bg-white p-5
                    opacity-50 cursor-not-allowed select-none"
        >
            <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">{titre}</span>
                <span
                    className="text-xs font-mono text-slate-400 bg-slate-100
                         px-2 py-0.5 rounded-full"
                >
                    {sprint}
                </span>
            </div>
        </div>
    );
}

SprintCard.propTypes = {
    titre: PropTypes.string.isRequired,
    sprint: PropTypes.string.isRequired,
};

export default AccueilEnseignant;
