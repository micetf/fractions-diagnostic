/**
 * @fileoverview ListeDiagnostics — historique des diagnostics.
 *
 * Renommage prévu en ListeDiagnostics.jsx au Sprint 2.
 * Pour l'instant le fichier garde son nom pour ne pas casser les imports.
 *
 * v2.0 : pas de statut, pas de boutons Lancer/Clôturer.
 * Un diagnostic est toujours disponible (SRS F-DIA-06).
 *
 * @module pages/enseignant/ListeSessions
 */
import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";

/**
 * @param {object}   props
 * @param {function} props.onNavigate
 * @param {function} props.onAnalyserSession - Reçoit l'id du diagnostic.
 */
function ListeSessions({ onNavigate, onAnalyserSession }) {
    const { state } = useAppContext();

    const diagnostics = [...(state.diagnostics ?? [])].sort(
        (a, b) => new Date(b.date_creation) - new Date(a.date_creation)
    );

    function nbPassationsTerminees(diagnosticId) {
        return (state.passations ?? []).filter(
            (p) => p.diagnostic_id === diagnosticId && p.statut === "terminee"
        ).length;
    }

    function nomClasse(classeId) {
        return state.classes.find((c) => c.id === classeId)?.nom ?? "—";
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
                <span className="text-slate-800 font-medium">Diagnostics</span>
            </nav>

            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-slate-800">
                    Diagnostics
                </h1>
                <button
                    onClick={() => onNavigate("creer-diagnostic")}
                    className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                               text-white text-sm font-medium transition-colors cursor-pointer"
                >
                    + Nouveau diagnostic
                </button>
            </div>

            {/* Liste */}
            {diagnostics.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10">
                    Aucun diagnostic créé.
                </p>
            ) : (
                <ul className="space-y-3">
                    {diagnostics.map((diagnostic) => {
                        const nbTerminees = nbPassationsTerminees(diagnostic.id);
                        const classe = state.classes.find(
                            (c) => c.id === diagnostic.classe_id
                        );
                        const nbEleves = classe?.eleves?.length ?? 0;

                        return (
                            <li
                                key={diagnostic.id}
                                className="rounded-xl border border-slate-200 bg-white p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    {/* Infos diagnostic */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="font-semibold text-slate-800">
                                                {nomClasse(diagnostic.classe_id)}
                                            </span>
                                            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                                {diagnostic.niveau}
                                            </span>
                                            {diagnostic.libelle && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-medium">
                                                    {diagnostic.libelle}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            Créé le {formatDate(diagnostic.date_creation)}
                                            {" · "}
                                            Exercices :{" "}
                                            {diagnostic.exercices_selectionnes.join(", ")}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {nbTerminees} / {nbEleves} passation
                                            {nbEleves > 1 ? "s" : ""} terminée
                                            {nbTerminees > 1 ? "s" : ""}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <button
                                            onClick={() =>
                                                onAnalyserSession(diagnostic.id)
                                            }
                                            className="px-4 py-1.5 rounded-lg border border-brand-200
                                                       hover:bg-brand-50 text-brand-600 text-xs font-medium
                                                       transition-colors cursor-pointer whitespace-nowrap"
                                        >
                                            Analyser
                                        </button>
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
    onRelancerSession: PropTypes.func,
    onAnalyserSession: PropTypes.func.isRequired,
};

ListeSessions.defaultProps = {
    onRelancerSession: () => {},
};

export default ListeSessions;
