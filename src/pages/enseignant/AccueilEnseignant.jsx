import PropTypes from "prop-types";

/**
 * AccueilEnseignant
 *
 * Page d'accueil du mode enseignant.
 * Sprint 4 : bloc de test S2 retiré, carte "Mes classes" active.
 *
 * @param {object}   props
 * @param {function} props.onStartSession - Bascule en mode élève (actif en S5).
 * @param {function} props.onNavigate     - Navigation interne enseignant.
 */
function AccueilEnseignant({ onStartSession, onNavigate }) {
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
                {/* Carte active */}
                <NavCard
                    titre="Mes classes"
                    description="Créer et gérer les classes et les élèves."
                    onClick={() => onNavigate("classes")}
                    actif
                />

                {/* Cartes à venir */}
                <NavCard
                    titre="Créer une session"
                    description="Sélectionner les exercices et lancer la passation."
                    sprint="S5"
                />
                <NavCard
                    titre="Analyse des résultats"
                    description="Matrice de résultats, profils élèves, biais détectés."
                    sprint="S14"
                />
                <NavCard
                    titre="Export / Import"
                    description="Sauvegarder et restaurer les données."
                    sprint="S18"
                />
            </div>

            {/* Accès rapide mode élève — test S3, sera retiré en S5 */}
            <div className="mt-10 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-400 mb-3">
                    Test — basculer manuellement en mode élève :
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
    onNavigate: PropTypes.func.isRequired,
};

/* ── Sous-composants ─────────────────────────────────────────────── */

/**
 * NavCard
 *
 * @param {object}   props
 * @param {string}   props.titre
 * @param {string}   props.description
 * @param {boolean}  [props.actif=false]  - Carte cliquable.
 * @param {function} [props.onClick]
 * @param {string}   [props.sprint]       - Badge sprint si non actif.
 */
function NavCard({ titre, description, actif, onClick, sprint }) {
    const base = "rounded-xl border p-5 flex flex-col gap-2 transition-colors";

    if (actif) {
        return (
            <button
                onClick={onClick}
                className={`${base} bg-white border-brand-200 hover:bg-brand-50
                    hover:border-brand-300 text-left cursor-pointer`}
            >
                <span className="font-semibold text-slate-800">{titre}</span>
                <span className="text-sm text-slate-500">{description}</span>
            </button>
        );
    }

    return (
        <div
            className={`${base} bg-white border-slate-200 opacity-50 cursor-not-allowed select-none`}
        >
            <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">{titre}</span>
                {sprint && (
                    <span
                        className="text-xs font-mono text-slate-400 bg-slate-100
                           px-2 py-0.5 rounded-full shrink-0"
                    >
                        {sprint}
                    </span>
                )}
            </div>
            <span className="text-sm text-slate-500">{description}</span>
        </div>
    );
}

NavCard.propTypes = {
    titre: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    actif: PropTypes.bool,
    onClick: PropTypes.func,
    sprint: PropTypes.string,
};

NavCard.defaultProps = {
    actif: false,
    onClick: undefined,
    sprint: undefined,
};

export default AccueilEnseignant;
