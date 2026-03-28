/**
 * @fileoverview CreerSession — création d'un diagnostic.
 *
 * Renommage prévu en CreerDiagnostic.jsx au Sprint 2.
 *
 * v2.0 :
 *   - CREATE_SESSION → CREATE_DIAGNOSTIC
 *   - Suppression du champ statut (SRS F-DIA-06)
 *   - Ajout du champ libelle (optionnel)
 *   - Routes sessions → diagnostics
 *   - Suppression de onLancer (plus de bascule mode élève depuis l'admin)
 *
 * @module pages/enseignant/CreerSession
 */
import { useState } from "react";
import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";
import { getExercices, getMetadonnees } from "@/data/index";
import {
    calculerDureeEstimee,
    intitulerBiaisExercice,
} from "@/utils/sessionHelpers";

const NIVEAUX = ["CE1", "CE2", "CM1", "CM2"];

/**
 * @param {object}   props
 * @param {function} props.onNavigate - Navigation interne enseignant.
 * @param {function} props.onLancer   - Appelé après création (reçoit le diagnostic).
 */
function CreerSession({ onNavigate, onLancer }) {
    const { state, dispatch } = useAppContext();

    const [etape, setEtape] = useState(1);
    const [classeId, setClasseId] = useState("");
    const [niveau, setNiveau] = useState("CE1");
    const [libelle, setLibelle] = useState("");
    const [selection, setSelection] = useState([]);
    const [erreur, setErreur] = useState("");

    const classesActives = state.classes.filter((c) => !c.archive);
    const classeChoisie = state.classes.find((c) => c.id === classeId) ?? null;

    const exercices = getExercices(niveau);
    const metadonnees = getMetadonnees(niveau);
    const dureeEstimee = calculerDureeEstimee(niveau, selection.length);

    // ── Étape 1 ───────────────────────────────────────────────────────────────

    function handleEtape1(e) {
        e.preventDefault();
        if (!classeId) {
            setErreur("Veuillez sélectionner une classe.");
            return;
        }
        setSelection([]);
        setErreur("");
        setEtape(2);
    }

    // ── Étape 2 ───────────────────────────────────────────────────────────────

    function toggleExercice(numero) {
        setSelection((prev) =>
            prev.includes(numero)
                ? prev.filter((n) => n !== numero)
                : [...prev, numero].sort((a, b) => a - b)
        );
    }

    function handleCreer(e) {
        e.preventDefault();
        if (selection.length === 0) {
            setErreur("Sélectionnez au moins un exercice.");
            return;
        }
        const diagnostic = {
            id: crypto.randomUUID(),
            classe_id: classeId,
            niveau,
            exercices_selectionnes: selection,
            libelle: libelle.trim() || null,
            date_creation: new Date().toISOString(),
        };
        dispatch({ type: "CREATE_DIAGNOSTIC", payload: diagnostic });
        onLancer(diagnostic);
    }

    // ── Rendu ─────────────────────────────────────────────────────────────────

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
                <button
                    onClick={() => onNavigate("diagnostics")}
                    className="hover:text-brand-600 transition-colors cursor-pointer"
                >
                    Diagnostics
                </button>
                <span>/</span>
                <span className="text-slate-800 font-medium">
                    Nouveau diagnostic
                </span>
            </nav>

            <h1 className="text-2xl font-semibold text-slate-800 mb-6">
                Nouveau diagnostic
            </h1>

            {/* ── Étape 1 ───────────────────────────────────────────────────── */}
            {etape === 1 && (
                <form
                    onSubmit={handleEtape1}
                    className="bg-white rounded-xl border border-slate-200 p-6"
                >
                    <p className="text-sm font-semibold text-slate-700 mb-4">
                        Étape 1 — Classe et niveau
                    </p>

                    {classesActives.length === 0 ? (
                        <p className="text-sm text-slate-400 mb-4">
                            Aucune classe disponible.{" "}
                            <button
                                type="button"
                                onClick={() => onNavigate("classes")}
                                className="text-brand-600 hover:underline cursor-pointer"
                            >
                                Créer une classe
                            </button>
                        </p>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="flex-1">
                                <label
                                    className="block text-xs font-medium text-slate-600 mb-1"
                                    htmlFor="classe-select"
                                >
                                    Classe{" "}
                                    <span className="text-danger-500">*</span>
                                </label>
                                <select
                                    id="classe-select"
                                    value={classeId}
                                    onChange={(e) => {
                                        setClasseId(e.target.value);
                                        const c = state.classes.find(
                                            (cl) => cl.id === e.target.value
                                        );
                                        if (c) setNiveau(c.niveau);
                                        setErreur("");
                                    }}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm
                                               focus:outline-none focus:ring-2 focus:ring-brand-400
                                               focus:border-transparent bg-white cursor-pointer"
                                >
                                    <option value="">— Choisir une classe —</option>
                                    {classesActives.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.nom} ({c.niveau})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    className="block text-xs font-medium text-slate-600 mb-1"
                                    htmlFor="niveau-select"
                                >
                                    Niveau du diagnostic
                                </label>
                                <select
                                    id="niveau-select"
                                    value={niveau}
                                    onChange={(e) => setNiveau(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm
                                               focus:outline-none focus:ring-2 focus:ring-brand-400
                                               focus:border-transparent bg-white cursor-pointer"
                                >
                                    {NIVEAUX.map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Libellé optionnel */}
                    <div className="mb-4">
                        <label
                            className="block text-xs font-medium text-slate-600 mb-1"
                            htmlFor="libelle-input"
                        >
                            Libellé{" "}
                            <span className="text-slate-400 font-normal">
                                (optionnel — ex. : « Octobre »)
                            </span>
                        </label>
                        <input
                            id="libelle-input"
                            type="text"
                            value={libelle}
                            onChange={(e) => setLibelle(e.target.value)}
                            placeholder="Laisser vide si non nécessaire"
                            maxLength={40}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-brand-400
                                       focus:border-transparent bg-white"
                        />
                    </div>

                    {erreur && (
                        <p className="text-xs text-danger-600 mb-3" role="alert">
                            {erreur}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={classesActives.length === 0}
                        className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                                   text-white text-sm font-medium transition-colors cursor-pointer
                                   disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Suivant →
                    </button>
                </form>
            )}

            {/* ── Étape 2 ───────────────────────────────────────────────────── */}
            {etape === 2 && (
                <form onSubmit={handleCreer}>
                    {/* Récap */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-slate-500">
                            <span className="font-medium text-slate-700">
                                {classeChoisie?.nom}
                            </span>
                            {" · "}
                            {niveau}
                            {libelle && (
                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                                    {libelle}
                                </span>
                            )}
                        </p>
                        <button
                            type="button"
                            onClick={() => { setEtape(1); setErreur(""); }}
                            className="text-xs text-slate-400 hover:text-brand-600 transition-colors cursor-pointer"
                        >
                            ← Modifier
                        </button>
                    </div>

                    {/* Recommandation */}
                    {metadonnees?.passation?.recommandationSelection && (
                        <div className="mb-4 px-4 py-3 rounded-lg bg-accent-50 border border-accent-200">
                            <p className="text-xs font-semibold text-accent-800 mb-0.5">
                                Conseil de passation
                            </p>
                            <p className="text-sm text-accent-700">
                                {metadonnees.passation.recommandationSelection}
                            </p>
                        </div>
                    )}

                    {/* Durée estimée */}
                    <div className="mb-4 flex items-center gap-3">
                        <span className="text-sm text-slate-500">
                            {selection.length === 0 ? (
                                "Sélectionnez des exercices pour estimer la durée."
                            ) : (
                                <>
                                    Durée estimée :{" "}
                                    <span className="font-semibold text-slate-700">
                                        ~{dureeEstimee} min
                                    </span>{" "}
                                    ({selection.length} exercice
                                    {selection.length > 1 ? "s" : ""})
                                </>
                            )}
                        </span>
                    </div>

                    {/* Tableau de lecture rapide */}
                    <div className="rounded-xl border border-slate-200 overflow-hidden mb-6">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="w-10 px-3 py-2.5"></th>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-8">
                                        N°
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Compétence
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                                        Biais ciblé(s)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {exercices.map((ex) => {
                                    const checked = selection.includes(ex.numero);
                                    const intitules = intitulerBiaisExercice(ex);
                                    return (
                                        <tr
                                            key={ex.numero}
                                            onClick={() => toggleExercice(ex.numero)}
                                            className={`cursor-pointer transition-colors
                                                ${checked ? "bg-brand-50 hover:bg-brand-100" : "bg-white hover:bg-slate-50"}`}
                                        >
                                            <td className="px-3 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleExercice(ex.numero)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-4 h-4 accent-brand-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-slate-400">
                                                {ex.numero}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">
                                                {ex.competence}
                                            </td>
                                            <td className="px-4 py-3 hidden sm:table-cell">
                                                {intitules.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {intitules.map((intitule) => (
                                                            <span
                                                                key={intitule}
                                                                className="inline-block text-xs px-2 py-0.5 rounded-full bg-danger-100 text-danger-700"
                                                            >
                                                                {intitule}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-review-600">
                                                        Réponse ouverte (relecture)
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {erreur && (
                        <p className="text-xs text-danger-600 mb-3" role="alert">
                            {erreur}
                        </p>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600
                                       text-white font-semibold text-sm transition-colors cursor-pointer"
                        >
                            Créer le diagnostic →
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigate("diagnostics")}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50
                                       text-slate-600 text-sm transition-colors cursor-pointer"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

CreerSession.propTypes = {
    onNavigate: PropTypes.func.isRequired,
    onLancer: PropTypes.func.isRequired,
};

export default CreerSession;
