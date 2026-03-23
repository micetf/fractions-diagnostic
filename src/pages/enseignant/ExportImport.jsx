import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";
import {
    exporterJSON,
    importerJSON,
    exporterCSV,
    reinitialiser,
} from "@/utils/exportData";

/**
 * ExportImport
 *
 * Interface de sauvegarde et restauration des données (SRS F-EXP-01/02/03).
 *
 * Trois actions disponibles :
 *   1. Export CSV  — matrice de résultats d'une session sélectionnée (F-EXP-01)
 *   2. Export JSON — sauvegarde complète du localStorage (F-EXP-02)
 *   3. Import JSON — restauration depuis un fichier, avec confirmation (F-EXP-03)
 *
 * @param {object}   props
 * @param {function} props.onNavigate
 */
function ExportImport({ onNavigate }) {
    const { state } = useAppContext();

    const [sessionCSV, setSessionCSV] = useState("");
    const [importStatut, setImportStatut] = useState(null); // null | 'confirm' | 'ok' | 'erreur'
    const [importErreur, setImportErreur] = useState("");
    const [fichierImport, setFichierImport] = useState(null);
    const [resetStatut, setResetStatut] = useState(null); // null | 'confirm' | 'saisie'
    const [resetSaisie, setResetSaisie] = useState("");
    const fileInputRef = useRef(null);

    const sessionsTerminees = state.sessions.filter(
        (s) => s.statut === "terminee"
    );

    // ── Export CSV ──────────────────────────────────────────────────────────────
    function handleExportCSV() {
        const session = state.sessions.find((s) => s.id === sessionCSV);
        if (!session) return;
        const classe = state.classes.find((c) => c.id === session.classe_id);
        const eleves = classe?.eleves ?? [];
        exporterCSV(session, eleves, state.passations);
    }

    // ── Export JSON ─────────────────────────────────────────────────────────────
    function handleExportJSON() {
        exporterJSON();
    }

    // ── Import JSON — sélection du fichier ─────────────────────────────────────
    function handleFichierChange(e) {
        const f = e.target.files?.[0];
        if (!f) return;
        setFichierImport(f);
        setImportStatut("confirm");
        setImportErreur("");
    }

    // ── Import JSON — confirmation ──────────────────────────────────────────────
    async function handleConfirmerImport() {
        if (!fichierImport) return;
        const resultat = await importerJSON(fichierImport);
        if (resultat.ok) {
            // Recharger la page pour que AppContext se ré-hydrate depuis le nouveau localStorage
            window.location.reload();
        } else {
            setImportStatut("erreur");
            setImportErreur(resultat.erreur);
        }
    }

    function handleAnnulerImport() {
        setImportStatut(null);
        setFichierImport(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            {/* Fil d'Ariane */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <button
                    onClick={() => onNavigate("accueil")}
                    className="hover:text-brand-600 transition-colors cursor-pointer"
                >
                    Tableau de bord
                </button>
                <span>/</span>
                <span className="text-slate-800 font-medium">
                    Export / Import
                </span>
            </nav>

            <h1 className="text-2xl font-semibold text-slate-800 mb-8">
                Export / Import
            </h1>

            <div className="flex flex-col gap-6">
                {/* ── Export CSV ──────────────────────────────────────────────── */}
                <Section
                    titre="Export CSV — matrice de résultats"
                    description="Exporte les résultats d'une session dans un tableau compatible avec un tableur (LibreOffice Calc, Excel…)."
                >
                    {sessionsTerminees.length === 0 ? (
                        <p className="text-sm text-slate-400">
                            Aucune session clôturée disponible pour l'export.
                        </p>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-3">
                            <select
                                value={sessionCSV}
                                onChange={(e) => setSessionCSV(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-400
                           focus:border-transparent bg-white cursor-pointer"
                            >
                                <option value="">
                                    — Choisir une session —
                                </option>
                                {sessionsTerminees.map((s) => {
                                    const classe = state.classes.find(
                                        (c) => c.id === s.classe_id
                                    );
                                    const date = new Date(
                                        s.date_creation
                                    ).toLocaleDateString("fr-FR");
                                    return (
                                        <option key={s.id} value={s.id}>
                                            {classe?.nom ?? "?"} · {s.niveau} ·{" "}
                                            {date}
                                        </option>
                                    );
                                })}
                            </select>
                            <button
                                onClick={handleExportCSV}
                                disabled={!sessionCSV}
                                className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                           text-white text-sm font-medium transition-colors cursor-pointer
                           disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Télécharger CSV
                            </button>
                        </div>
                    )}
                </Section>

                {/* ── Export JSON ─────────────────────────────────────────────── */}
                <Section
                    titre="Export JSON — sauvegarde complète"
                    description="Exporte toutes les données (classes, sessions, passations) dans un fichier JSON. À conserver en lieu sûr pour restaurer les données en cas d'effacement du navigateur."
                >
                    <button
                        onClick={handleExportJSON}
                        className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                       text-white text-sm font-medium transition-colors cursor-pointer"
                    >
                        Télécharger la sauvegarde
                    </button>
                </Section>

                {/* ── Import JSON ─────────────────────────────────────────────── */}
                <Section
                    titre="Import JSON — restaurer une sauvegarde"
                    description="Restaure les données depuis un fichier de sauvegarde précédemment exporté. Attention : cette opération remplace toutes les données actuelles."
                    accent="danger"
                >
                    {importStatut !== "confirm" ? (
                        <>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json,application/json"
                                onChange={handleFichierChange}
                                className="hidden"
                                id="import-json"
                            />
                            <label
                                htmlFor="import-json"
                                className="inline-block px-5 py-2 rounded-lg border border-danger-300
                           bg-white hover:bg-danger-50 text-danger-700 text-sm font-medium
                           transition-colors cursor-pointer"
                            >
                                Choisir un fichier…
                            </label>
                            {importStatut === "erreur" && (
                                <p className="text-sm text-danger-600 mt-2">
                                    {importErreur}
                                </p>
                            )}
                        </>
                    ) : (
                        /* Confirmation avant écrasement */
                        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4">
                            <p className="text-sm font-semibold text-danger-700 mb-1">
                                Confirmer le remplacement des données ?
                            </p>
                            <p className="text-xs text-danger-600 mb-3">
                                Fichier sélectionné :{" "}
                                <span className="font-mono">
                                    {fichierImport?.name}
                                </span>
                                <br />
                                Toutes les données actuelles seront remplacées.
                                Cette action est irréversible.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleConfirmerImport}
                                    className="px-4 py-2 rounded-lg bg-danger-500 hover:bg-danger-600
                             text-white text-sm font-medium transition-colors cursor-pointer"
                                >
                                    Oui, remplacer
                                </button>
                                <button
                                    onClick={handleAnnulerImport}
                                    className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50
                             text-slate-600 text-sm font-medium transition-colors cursor-pointer"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                </Section>

                {/* ── Remise à zéro ───────────────────────────────────────────── */}
                <Section
                    titre="Remise à zéro"
                    description="Efface toutes les données : classes, élèves, sessions, passations et code PIN. L'application revient à l'état du premier lancement. Effectuez un export JSON avant de continuer."
                    accent="danger"
                >
                    {resetStatut === null && (
                        <button
                            onClick={() => setResetStatut("confirm")}
                            className="px-5 py-2 rounded-lg border border-danger-300
                         bg-white hover:bg-danger-50 text-danger-700
                         text-sm font-medium transition-colors cursor-pointer"
                        >
                            Effacer toutes les données…
                        </button>
                    )}

                    {resetStatut === "confirm" && (
                        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4">
                            <p className="text-sm font-semibold text-danger-700 mb-1">
                                Avez-vous bien exporté une sauvegarde JSON ?
                            </p>
                            <p className="text-xs text-danger-600 mb-4">
                                Cette action est irréversible. Toutes les
                                données seront perdues si vous n'avez pas de
                                sauvegarde.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setResetStatut("saisie")}
                                    className="px-4 py-2 rounded-lg bg-danger-100 hover:bg-danger-200
                             text-danger-700 text-sm font-medium
                             transition-colors cursor-pointer"
                                >
                                    J'ai ma sauvegarde, continuer
                                </button>
                                <button
                                    onClick={() => setResetStatut(null)}
                                    className="px-4 py-2 rounded-lg border border-slate-200
                             hover:bg-slate-50 text-slate-600 text-sm font-medium
                             transition-colors cursor-pointer"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}

                    {resetStatut === "saisie" && (
                        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4">
                            <p className="text-sm font-semibold text-danger-700 mb-1">
                                Confirmation définitive
                            </p>
                            <p className="text-xs text-danger-600 mb-3">
                                Tapez{" "}
                                <span className="font-mono font-bold">
                                    EFFACER
                                </span>{" "}
                                pour confirmer la remise à zéro complète.
                            </p>
                            <input
                                type="text"
                                value={resetSaisie}
                                onChange={(e) => setResetSaisie(e.target.value)}
                                placeholder="EFFACER"
                                autoFocus
                                autoComplete="off"
                                className="w-full px-3 py-2 rounded-lg border border-danger-300
                           text-sm font-mono mb-3
                           focus:outline-none focus:ring-2 focus:ring-danger-400
                           focus:border-transparent bg-white"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (resetSaisie !== "EFFACER") return;
                                        reinitialiser();
                                        window.location.reload();
                                    }}
                                    disabled={resetSaisie !== "EFFACER"}
                                    className="px-4 py-2 rounded-lg bg-danger-500 hover:bg-danger-600
                             text-white text-sm font-medium transition-colors
                             cursor-pointer disabled:opacity-40
                             disabled:cursor-not-allowed"
                                >
                                    Effacer définitivement
                                </button>
                                <button
                                    onClick={() => {
                                        setResetStatut(null);
                                        setResetSaisie("");
                                    }}
                                    className="px-4 py-2 rounded-lg border border-slate-200
                             hover:bg-slate-50 text-slate-600 text-sm font-medium
                             transition-colors cursor-pointer"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                </Section>
            </div>
        </div>
    );
}

ExportImport.propTypes = {
    onNavigate: PropTypes.func.isRequired,
};

/* ── Section ─────────────────────────────────────────────────────────────────── */

/**
 * Section
 *
 * @param {object}   props
 * @param {string}   props.titre
 * @param {string}   props.description
 * @param {'default'|'danger'} [props.accent='default']
 * @param {React.ReactNode} props.children
 */
function Section({ titre, description, accent = "default", children }) {
    const border =
        accent === "danger" ? "border-danger-200" : "border-slate-200";
    return (
        <div className={`rounded-xl border ${border} bg-white p-5`}>
            <h2 className="font-semibold text-slate-800 mb-1">{titre}</h2>
            <p className="text-sm text-slate-500 mb-4">{description}</p>
            {children}
        </div>
    );
}

Section.propTypes = {
    titre: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    accent: PropTypes.oneOf(["default", "danger"]),
    children: PropTypes.node.isRequired,
};

export default ExportImport;
