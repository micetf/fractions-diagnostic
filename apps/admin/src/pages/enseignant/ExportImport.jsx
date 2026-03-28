/**
 * @fileoverview ExportImport — sauvegarde et restauration des données.
 *
 * Quatre actions (SRS F-EXP-01 à F-EXP-04) :
 *   1. Export CSV     — matrice de résultats d'un diagnostic sélectionné
 *   2. Export JSON    — sauvegarde complète du localStorage
 *   3. Import JSON    — restauration depuis un fichier, avec confirmation
 *   4. Remise à zéro  — efface tout après export préalable obligatoire
 *
 * v2.0 : sessions → diagnostics, suppression du filtre statut.
 *
 * @module pages/enseignant/ExportImport
 */
import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";
import {
    exporterJSON,
    importerJSON,
    exporterCSV,
    reinitialiser,
} from "@/utils/exportData";

// ─── Composant principal ──────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {function} props.onNavigate
 */
function ExportImport({ onNavigate }) {
    const { state } = useAppContext();

    const [diagnosticCSV, setDiagnosticCSV] = useState("");
    const [importStatut, setImportStatut] = useState(null);
    const [importErreur, setImportErreur] = useState("");
    const [fichierImport, setFichierImport] = useState(null);
    const [resetStatut, setResetStatut] = useState(null);
    const [resetSaisie, setResetSaisie] = useState("");
    const fileInputRef = useRef(null);

    // Tous les diagnostics sont disponibles pour l'export (pas de statut en v2.0)
    const diagnostics = state.diagnostics ?? [];

    // ── Export CSV ────────────────────────────────────────────────────────────
    function handleExportCSV() {
        const diagnostic = diagnostics.find((d) => d.id === diagnosticCSV);
        if (!diagnostic) return;
        const classe = state.classes.find((c) => c.id === diagnostic.classe_id);
        const eleves = classe?.eleves ?? [];
        exporterCSV(diagnostic, eleves, state.passations);
    }

    // ── Export JSON ───────────────────────────────────────────────────────────
    function handleExportJSON() {
        exporterJSON();
    }

    // ── Import JSON ───────────────────────────────────────────────────────────
    function handleFichierChange(e) {
        const f = e.target.files?.[0];
        if (!f) return;
        setFichierImport(f);
        setImportStatut("confirm");
        setImportErreur("");
    }

    function handleAnnulerImport() {
        setImportStatut(null);
        setFichierImport(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    async function handleConfirmerImport() {
        if (!fichierImport) return;
        const result = await importerJSON(fichierImport);
        if (result.ok) {
            window.location.reload();
        } else {
            setImportStatut("erreur");
            setImportErreur(result.erreur ?? "Erreur inconnue.");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
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
                <span className="text-slate-800 font-medium">Export / Import</span>
            </nav>

            <h1 className="text-2xl font-semibold text-slate-800 mb-8">
                Export / Import
            </h1>

            <div className="flex flex-col gap-6">

                {/* ── Export CSV ──────────────────────────────────────────── */}
                <Section
                    titre="Export CSV — résultats d'un diagnostic"
                    description="Produit un tableau exploitable dans LibreOffice Calc ou Excel : une colonne par exercice, une ligne par élève."
                >
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="diagnostic-csv"
                                className="text-xs font-semibold text-slate-500"
                            >
                                Diagnostic à exporter
                            </label>
                            <select
                                id="diagnostic-csv"
                                value={diagnosticCSV}
                                onChange={(e) => setDiagnosticCSV(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-slate-200
                                           text-sm text-slate-700 bg-white
                                           focus:outline-none focus:ring-2
                                           focus:ring-brand-400"
                            >
                                <option value="">— choisir un diagnostic —</option>
                                {diagnostics.map((d) => {
                                    const cl = state.classes.find(
                                        (c) => c.id === d.classe_id
                                    );
                                    const label = [
                                        cl?.nom ?? "Classe inconnue",
                                        d.niveau,
                                        d.libelle,
                                        new Date(d.date_creation).toLocaleDateString("fr-FR"),
                                    ]
                                        .filter(Boolean)
                                        .join(" — ");
                                    return (
                                        <option key={d.id} value={d.id}>
                                            {label}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <button
                            onClick={handleExportCSV}
                            disabled={!diagnosticCSV}
                            className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                                       text-white text-sm font-medium transition-colors
                                       cursor-pointer disabled:opacity-40
                                       disabled:cursor-not-allowed"
                        >
                            Télécharger le CSV
                        </button>
                    </div>
                    {diagnostics.length === 0 && (
                        <p className="text-sm text-slate-400 mt-2">
                            Aucun diagnostic créé.
                        </p>
                    )}
                </Section>

                {/* ── Export JSON ─────────────────────────────────────────── */}
                <Section
                    titre="Export JSON — sauvegarde complète"
                    description="À conserver en lieu sûr. Permet de restaurer toutes vos classes, diagnostics et résultats sur un autre appareil ou après effacement du navigateur."
                >
                    <button
                        onClick={handleExportJSON}
                        className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                                   text-white text-sm font-medium transition-colors
                                   cursor-pointer"
                    >
                        Télécharger la sauvegarde
                    </button>
                </Section>

                {/* ── Import JSON ─────────────────────────────────────────── */}
                <Section
                    titre="Import JSON — restaurer une sauvegarde"
                    description="Restaure les données depuis un fichier exporté. Toutes les données actuelles seront remplacées."
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
                                className="inline-block px-5 py-2 rounded-lg border
                                           border-danger-300 bg-white hover:bg-danger-50
                                           text-danger-700 text-sm font-medium
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
                        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4">
                            <p className="text-sm font-semibold text-danger-700 mb-1">
                                Confirmer le remplacement des données ?
                            </p>
                            <p className="text-xs text-danger-600 mb-3">
                                Fichier :{" "}
                                <span className="font-mono">{fichierImport?.name}</span>
                                <br />
                                Toutes les données actuelles seront remplacées.
                                Cette action est irréversible.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleConfirmerImport}
                                    className="px-4 py-2 rounded-lg bg-danger-500
                                               hover:bg-danger-600 text-white text-sm
                                               font-medium transition-colors cursor-pointer"
                                >
                                    Oui, remplacer
                                </button>
                                <button
                                    onClick={handleAnnulerImport}
                                    className="px-4 py-2 rounded-lg border border-slate-200
                                               hover:bg-slate-50 text-slate-600 text-sm
                                               font-medium transition-colors cursor-pointer"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                </Section>

                {/* ── Remise à zéro ───────────────────────────────────────── */}
                <Section
                    titre="Remise à zéro"
                    description="Efface toutes les données : classes, élèves, diagnostics et passations. Effectuez un export JSON avant de continuer."
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
                                Cette action est irréversible.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setResetStatut("saisie")}
                                    className="px-4 py-2 rounded-lg bg-danger-500
                                               hover:bg-danger-600 text-white text-sm
                                               font-medium transition-colors cursor-pointer"
                                >
                                    Oui, continuer
                                </button>
                                <button
                                    onClick={() => setResetStatut(null)}
                                    className="px-4 py-2 rounded-lg border border-slate-200
                                               hover:bg-slate-50 text-slate-600 text-sm
                                               font-medium transition-colors cursor-pointer"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                    {resetStatut === "saisie" && (
                        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4">
                            <p className="text-sm font-semibold text-danger-700 mb-1">
                                Tapez EFFACER pour confirmer
                            </p>
                            <p className="text-xs text-danger-600 mb-3">
                                Cette action supprime définitivement toutes les données.
                            </p>
                            <input
                                type="text"
                                value={resetSaisie}
                                onChange={(e) => setResetSaisie(e.target.value)}
                                placeholder="EFFACER"
                                autoFocus
                                autoComplete="off"
                                className="w-full px-3 py-2 rounded-lg border
                                           border-danger-300 text-sm font-mono mb-3
                                           focus:outline-none focus:ring-2
                                           focus:ring-danger-400 bg-white"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (resetSaisie !== "EFFACER") return;
                                        reinitialiser();
                                        window.location.reload();
                                    }}
                                    disabled={resetSaisie !== "EFFACER"}
                                    className="px-4 py-2 rounded-lg bg-danger-500
                                               hover:bg-danger-600 text-white text-sm
                                               font-medium transition-colors cursor-pointer
                                               disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Effacer définitivement
                                </button>
                                <button
                                    onClick={() => {
                                        setResetStatut(null);
                                        setResetSaisie("");
                                    }}
                                    className="px-4 py-2 rounded-lg border border-slate-200
                                               hover:bg-slate-50 text-slate-600 text-sm
                                               font-medium transition-colors cursor-pointer"
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

// ─── Sous-composant Section ───────────────────────────────────────────────────

/**
 * @param {object}          props
 * @param {string}          props.titre
 * @param {string}          props.description
 * @param {'default'|'danger'} [props.accent='default']
 * @param {React.ReactNode} props.children
 */
function Section({ titre, description, accent = "default", children }) {
    const border =
        accent === "danger" ? "border-danger-200" : "border-slate-200";
    return (
        <div className={`bg-white rounded-xl border ${border} p-6`}>
            <h2 className="text-base font-semibold text-slate-800 mb-1">
                {titre}
            </h2>
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
