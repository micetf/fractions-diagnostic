import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";

/**
 * AccueilEnseignant
 *
 * Sprint 5 : cartes "Sessions" et "Créer une session" actives.
 *
 * @param {object}   props
 * @param {function} props.onStartSession - Bascule en mode élève (actif en S5).
 * @param {function} props.onNavigate     - Navigation interne enseignant.
 */
function AccueilEnseignant({ onNavigate }) {
    const { state } = useAppContext();

    const nbSessionsEnCours = state.sessions.filter(
        (s) => s.statut === "en_cours"
    ).length;

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
                <NavCard
                    titre="Mes classes"
                    description="Créer et gérer les classes et les élèves."
                    onClick={() => onNavigate("classes")}
                    actif
                />

                <NavCard
                    titre="Sessions"
                    description="Historique et gestion des sessions diagnostiques."
                    onClick={() => onNavigate("sessions")}
                    actif
                    badge={
                        nbSessionsEnCours > 0
                            ? `${nbSessionsEnCours} en cours`
                            : null
                    }
                />

                <NavCard
                    titre="Nouvelle session"
                    description="Sélectionner les exercices et lancer la passation."
                    onClick={() => onNavigate("creer-session")}
                    actif
                    accent
                />

                <NavCard
                    titre="Analyse des résultats"
                    description="Matrice de résultats, profils élèves, biais détectés."
                    sprint="S14"
                />
                <NavCard
                    titre="Export / Import"
                    description="Sauvegarder et restaurer les données."
                    onClick={() => onNavigate("export-import")}
                    actif
                />
            </div>
        </div>
    );
}

AccueilEnseignant.propTypes = {
    onStartSession: PropTypes.func.isRequired,
    onNavigate: PropTypes.func.isRequired,
};

/* ── Sous-composant ─────────────────────────────────────────────────── */

/**
 * NavCard
 *
 * @param {object}   props
 * @param {string}   props.titre
 * @param {string}   props.description
 * @param {boolean}  [props.actif=false]
 * @param {boolean}  [props.accent=false]  - Style mise en avant.
 * @param {function} [props.onClick]
 * @param {string}   [props.sprint]
 * @param {string}   [props.badge]         - Badge compteur.
 */
function NavCard({
    titre,
    description,
    actif = false,
    accent = false,
    onClick = undefined,
    sprint = undefined,
    badge = undefined,
}) {
    const base =
        "rounded-xl border p-5 flex flex-col gap-2 transition-colors text-left";

    if (actif) {
        const color = accent
            ? "bg-brand-500 border-brand-600 hover:bg-brand-600 text-white"
            : "bg-white border-brand-200 hover:bg-brand-50 hover:border-brand-300";
        return (
            <button
                onClick={onClick}
                className={`${base} ${color} cursor-pointer w-full`}
            >
                <div className="flex items-start justify-between gap-2">
                    <span
                        className={`font-semibold ${accent ? "text-white" : "text-slate-800"}`}
                    >
                        {titre}
                    </span>
                    {badge && (
                        <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0
              ${
                  accent
                      ? "bg-white/20 text-white"
                      : "bg-success-100 text-success-700"
              }`}
                        >
                            {badge}
                        </span>
                    )}
                </div>
                <span
                    className={`text-sm ${accent ? "text-white/80" : "text-slate-500"}`}
                >
                    {description}
                </span>
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
    accent: PropTypes.bool,
    onClick: PropTypes.func,
    sprint: PropTypes.string,
    badge: PropTypes.string,
};

export default AccueilEnseignant;
