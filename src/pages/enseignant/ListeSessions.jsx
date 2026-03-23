import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";

/**
 * ListeSessions
 *
 * Historique des sessions diagnostiques (SRS F-SES-05, F-SES-06).
 * Permet de clôturer une session en cours ou de la relancer en mode élève.
 *
 * @param {object}   props
 * @param {function} props.onNavigate          - Navigation interne enseignant.
 * @param {function} props.onRelancerSession   - Bascule en mode élève avec la session.
 */
function ListeSessions({ onNavigate, onRelancerSession, onAnalyserSession }) {
    const { state, dispatch } = useAppContext();

    const sessions = [...state.sessions].sort(
        (a, b) => new Date(b.date_creation) - new Date(a.date_creation)
    );

    function nbPassationsTerminees(sessionId) {
        return state.passations.filter(
            (p) => p.session_id === sessionId && p.statut === "terminee"
        ).length;
    }

    function nomClasse(classeId) {
        return state.classes.find((c) => c.id === classeId)?.nom ?? "—";
    }

    function handleCloturer(sessionId) {
        dispatch({ type: "CLOSE_SESSION", payload: { id: sessionId } });
    }

    function formatDate(iso) {
        return new Date(iso).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            {/* Fil d'Ariane */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <button
                    onClick={() => onNavigate("accueil")}
                    className="hover:text-brand-600 transition-colors cursor-pointer"
                >
                    Tableau de bord
                </button>
                <span>/</span>
                <span className="text-slate-800 font-medium">Sessions</span>
            </nav>

            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-slate-800">
                    Sessions
                </h1>
                <button
                    onClick={() => onNavigate("creer-session")}
                    className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                     text-white text-sm font-medium transition-colors cursor-pointer"
                >
                    + Nouvelle session
                </button>
            </div>

            {/* Liste */}
            {sessions.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10">
                    Aucune session créée.
                </p>
            ) : (
                <ul className="space-y-3">
                    {sessions.map((session) => {
                        const nbTerminees = nbPassationsTerminees(session.id);
                        const enCours = session.statut === "en_cours";
                        const classe = state.classes.find(
                            (c) => c.id === session.classe_id
                        );
                        const nbEleves = classe?.eleves?.length ?? 0;

                        return (
                            <li
                                key={session.id}
                                className="rounded-xl border border-slate-200 bg-white p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    {/* Infos session */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="font-semibold text-slate-800">
                                                {nomClasse(session.classe_id)}
                                            </span>
                                            <span
                                                className="text-xs font-mono px-2 py-0.5 rounded-full
                                       bg-slate-100 text-slate-500"
                                            >
                                                {session.niveau}
                                            </span>
                                            <StatutBadge
                                                statut={session.statut}
                                            />
                                        </div>

                                        <p className="text-xs text-slate-400">
                                            Créée le{" "}
                                            {formatDate(session.date_creation)}
                                            {" · "}
                                            Exercices :{" "}
                                            {session.exercices_selectionnes.join(
                                                ", "
                                            )}
                                        </p>

                                        <p className="text-xs text-slate-500 mt-1">
                                            {nbTerminees} / {nbEleves} passation
                                            {nbTerminees > 1 ? "s" : ""}{" "}
                                            terminée{nbTerminees > 1 ? "s" : ""}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 shrink-0">
                                        {enCours && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        onRelancerSession(
                                                            session
                                                        )
                                                    }
                                                    className="px-4 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600
                                     text-white text-xs font-medium transition-colors cursor-pointer
                                     whitespace-nowrap"
                                                >
                                                    Lancer passation
                                                </button>
                                                {/* Bouton analyser — toutes les sessions (en cours ou clôturées) */}
                                                <button
                                                    onClick={() =>
                                                        onAnalyserSession(
                                                            session.id
                                                        )
                                                    }
                                                    className="px-4 py-1.5 rounded-lg border border-slate-200
                               hover:bg-slate-50 text-slate-600 text-xs font-medium
                               transition-colors cursor-pointer whitespace-nowrap"
                                                >
                                                    Analyser
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleCloturer(
                                                            session.id
                                                        )
                                                    }
                                                    className="px-4 py-1.5 rounded-lg border border-slate-200
                                     hover:bg-slate-50 text-slate-500 text-xs font-medium
                                     transition-colors cursor-pointer whitespace-nowrap"
                                                >
                                                    Clôturer
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

ListeSessions.propTypes = {
    onNavigate: PropTypes.func.isRequired,
    onRelancerSession: PropTypes.func.isRequired,
    onAnalyserSession: PropTypes.func.isRequired,
};

/* ── Sous-composant ────────────────────────────────────────────────── */

/**
 * StatutBadge
 * @param {{ statut: 'en_cours'|'terminee' }} props
 */
function StatutBadge({ statut }) {
    if (statut === "en_cours") {
        return (
            <span
                className="text-xs px-2 py-0.5 rounded-full
                       bg-success-100 text-success-700 font-medium"
            >
                En cours
            </span>
        );
    }
    return (
        <span
            className="text-xs px-2 py-0.5 rounded-full
                     bg-slate-100 text-slate-500 font-medium"
        >
            Clôturée
        </span>
    );
}

StatutBadge.propTypes = {
    statut: PropTypes.oneOf(["en_cours", "terminee"]).isRequired,
};

export default ListeSessions;
