/**
 * @fileoverview ExportImport — sauvegarde, échanges JSON et remise à zéro.
 *
 * Cinq actions (SRS F-EXP-01 à F-EXP-04, F-RES-01 à F-RES-05) :
 *   1. Export CSV     — matrice d'un diagnostic
 *   2. Export config  — fichier pour les appareils élèves (Phase 1)
 *   3. Import résultats — fusion depuis un appareil élève (Phase 3)
 *   4. Export JSON    — sauvegarde complète
 *   5. Import JSON    — restauration complète
 *   6. Remise à zéro
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
    exporterConfig,
    reinitialiser,
} from "@/utils/exportData";
import { fusionnerPassations } from "@fractions-diagnostic/shared/fusionResultats";
import RapportFusion from "@/components/common/RapportFusion";

// ─── Validation fichier résultats ─────────────────────────────────────────────

/**
 * @param {any} data
 * @returns {{ ok: boolean, erreur?: string }}
 */
function validerResultats(data) {
    if (!data || typeof data !== "object")
        return { ok: false, erreur: "Le fichier n'est pas un JSON valide." };
    if (data.type !== "fractions-resultats")
        return { ok: false, erreur: "Ce fichier n'est pas un fichier de résultats." };
    if (!data.diagnostic_id)
        return { ok: false, erreur: "Identifiant de diagnostic manquant." };
    if (!Array.isArray(data.passations))
        return { ok: false, erreur: 'Champ "passations" manquant ou invalide.' };
    return { ok: true };
}

// ─── Composant principal ──────────────────────────────────────────────────────

function ExportImport({ onNavigate }) {
    const { state, dispatch } = useAppContext();

    const [diagnosticCSV, setDiagnosticCSV] = useState("");
    const [diagnosticConfig, setDiagnosticConfig] = useState("");

    // Import résultats
    const [rapportFusion, setRapportFusion] = useState(null);
    const [elevesRapport, setElevesRapport] = useState([]);
    const [importResErreur, setImportResErreur] = useState("");
    const fileResRef = useRef(null);

    // Import sauvegarde
    const [importStatut, setImportStatut] = useState(null);
    const [importErreur, setImportErreur] = useState("");
    const [fichierImport, setFichierImport] = useState(null);
    const fileInputRef = useRef(null);

    // Reset
    const [resetStatut, setResetStatut] = useState(null);
    const [resetSaisie, setResetSaisie] = useState("");

    const diagnostics = state.diagnostics ?? [];

    // ── Export CSV ────────────────────────────────────────────────────────────
    function handleExportCSV() {
        const diagnostic = diagnostics.find((d) => d.id === diagnosticCSV);
        if (!diagnostic) return;
        const classe = state.classes.find((c) => c.id === diagnostic.classe_id);
        exporterCSV(diagnostic, classe?.eleves ?? [], state.passations);
    }

    // ── Export config ─────────────────────────────────────────────────────────
    function handleExportConfig() {
        const diagnostic = diagnostics.find((d) => d.id === diagnosticConfig);
        if (!diagnostic) return;
        const classe = state.classes.find((c) => c.id === diagnostic.classe_id);
        exporterConfig(diagnostic, classe?.eleves ?? []);
    }

    // ── Import résultats (Phase 3) ────────────────────────────────────────────
    function handleFichierResultats(e) {
        const fichier = e.target.files?.[0];
        if (!fichier) return;
        setImportResErreur("");
        setRapportFusion(null);

        const reader = new FileReader();
        reader.onload = (ev) => {
            let data;
            try {
                data = JSON.parse(ev.target.result);
            } catch {
                setImportResErreur("Le fichier n'est pas du JSON valide.");
                if (fileResRef.current) fileResRef.current.value = "";
                return;
            }

            const validation = validerResultats(data);
            if (!validation.ok) {
                setImportResErreur(validation.erreur);
                if (fileResRef.current) fileResRef.current.value = "";
                return;
            }

            // Vérifier que le diagnostic existe (SRS F-RES-02)
            const diagnostic = diagnostics.find((d) => d.id === data.diagnostic_id);
            if (!diagnostic) {
                setImportResErreur(
                    "Le diagnostic de ce fichier est introuvable sur cet appareil. " +
                    "Vérifiez que vous importez sur le bon appareil."
                );
                if (fileResRef.current) fileResRef.current.value = "";
                return;
            }

            // Fusionner (SRS F-RES-03)
            const classe = state.classes.find((c) => c.id === diagnostic.classe_id);
            const eleves = classe?.eleves ?? [];
            const resultat = fusionnerPassations(state.passations, data.passations);

            dispatch({
                type: "FUSIONNER_PASSATIONS",
                payload: { passations: data.passations },
            });

            setRapportFusion(resultat);
            setElevesRapport(eleves);
            if (fileResRef.current) fileResRef.current.value = "";
        };
        reader.onerror = () => {
            setImportResErreur("Impossible de lire le fichier.");
        };
        reader.readAsText(fichier, "utf-8");
    }

    // ── Import sauvegarde ─────────────────────────────────────────────────────
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
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <button onClick={() => onNavigate("accueil")} className="hover:text-brand-600 transition-colors cursor-pointer">
                    Tableau de bord
                </button>
                <span>/</span>
                <span className="text-slate-800 font-medium">Export / Import</span>
            </nav>

            <h1 className="text-2xl font-semibold text-slate-800 mb-8">Export / Import</h1>

            <div className="flex flex-col gap-6">

                {/* ── Export config (Phase 1) ──────────────────────────────── */}
                <Section
                    titre="Phase 1 — Exporter la configuration"
                    description="Produit un fichier JSON à distribuer sur les tablettes élèves avant la passation."
                >
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="diagnostic-config" className="text-xs font-semibold text-slate-500">
                                Diagnostic à distribuer
                            </label>
                            <select
                                id="diagnostic-config"
                                value={diagnosticConfig}
                                onChange={(e) => setDiagnosticConfig(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
                            >
                                <option value="">— choisir un diagnostic —</option>
                                {diagnostics.map((d) => {
                                    const cl = state.classes.find((c) => c.id === d.classe_id);
                                    return (
                                        <option key={d.id} value={d.id}>
                                            {cl?.nom ?? "—"} · {d.niveau}{d.libelle ? ` · ${d.libelle}` : ""} · {new Date(d.date_creation).toLocaleDateString("fr-FR")}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <button
                            onClick={handleExportConfig}
                            disabled={!diagnosticConfig}
                            className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Télécharger la config
                        </button>
                    </div>
                </Section>

                {/* ── Import résultats (Phase 3) ───────────────────────────── */}
                <Section
                    titre="Phase 3 — Importer les résultats"
                    description="Importe un fichier fractions-resultats-*.json depuis une tablette élève. Les résultats sont fusionnés automatiquement."
                >
                    {rapportFusion ? (
                        <RapportFusion
                            rapport={rapportFusion}
                            eleves={elevesRapport}
                            onFermer={() => setRapportFusion(null)}
                        />
                    ) : (
                        <>
                            <input
                                ref={fileResRef}
                                type="file"
                                accept=".json,application/json"
                                onChange={handleFichierResultats}
                                className="hidden"
                                id="import-resultats"
                            />
                            <label
                                htmlFor="import-resultats"
                                className="inline-block px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors cursor-pointer"
                            >
                                Importer un fichier résultats…
                            </label>
                            {importResErreur && (
                                <p className="text-sm text-danger-600 mt-2">{importResErreur}</p>
                            )}
                        </>
                    )}
                </Section>

                {/* ── Export CSV ───────────────────────────────────────────── */}
                <Section
                    titre="Export CSV — matrice de résultats"
                    description="Tableau exploitable dans LibreOffice Calc ou Excel."
                >
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="diagnostic-csv" className="text-xs font-semibold text-slate-500">
                                Diagnostic à exporter
                            </label>
                            <select
                                id="diagnostic-csv"
                                value={diagnosticCSV}
                                onChange={(e) => setDiagnosticCSV(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
                            >
                                <option value="">— choisir un diagnostic —</option>
                                {diagnostics.map((d) => {
                                    const cl = state.classes.find((c) => c.id === d.classe_id);
                                    return (
                                        <option key={d.id} value={d.id}>
                                            {cl?.nom ?? "—"} · {d.niveau}{d.libelle ? ` · ${d.libelle}` : ""} · {new Date(d.date_creation).toLocaleDateString("fr-FR")}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <button
                            onClick={handleExportCSV}
                            disabled={!diagnosticCSV}
                            className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Télécharger le CSV
                        </button>
                    </div>
                </Section>

                {/* ── Export JSON sauvegarde ───────────────────────────────── */}
                <Section
                    titre="Export JSON — sauvegarde complète"
                    description="À conserver en lieu sûr. Permet de restaurer toutes vos données sur un autre appareil."
                >
                    <button
                        onClick={exporterJSON}
                        className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors cursor-pointer"
                    >
                        Télécharger la sauvegarde
                    </button>
                </Section>

                {/* ── Import JSON sauvegarde ───────────────────────────────── */}
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
                                className="inline-block px-5 py-2 rounded-lg border border-danger-300 bg-white hover:bg-danger-50 text-danger-700 text-sm font-medium transition-colors cursor-pointer"
                            >
                                Choisir un fichier…
                            </label>
                            {importStatut === "erreur" && (
                                <p className="text-sm text-danger-600 mt-2">{importErreur}</p>
                            )}
                        </>
                    ) : (
                        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4">
                            <p className="text-sm font-semibold text-danger-700 mb-1">
                                Confirmer le remplacement des données ?
                            </p>
                            <p className="text-xs text-danger-600 mb-3">
                                Fichier : <span className="font-mono">{fichierImport?.name}</span>
                                <br />Cette action est irréversible.
                            </p>
                            <div className="flex gap-2">
                                <button onClick={handleConfirmerImport} className="px-4 py-2 rounded-lg bg-danger-500 hover:bg-danger-600 text-white text-sm font-medium transition-colors cursor-pointer">
                                    Oui, remplacer
                                </button>
                                <button onClick={handleAnnulerImport} className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors cursor-pointer">
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                </Section>

                {/* ── Remise à zéro ───────────────────────────────────────── */}
                <Section
                    titre="Remise à zéro"
                    description="Efface toutes les données. Effectuez un export JSON avant de continuer."
                    accent="danger"
                >
                    {resetStatut === null && (
                        <button onClick={() => setResetStatut("confirm")} className="px-5 py-2 rounded-lg border border-danger-300 bg-white hover:bg-danger-50 text-danger-700 text-sm font-medium transition-colors cursor-pointer">
                            Effacer toutes les données…
                        </button>
                    )}
                    {resetStatut === "confirm" && (
                        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4">
                            <p className="text-sm font-semibold text-danger-700 mb-1">Avez-vous bien exporté une sauvegarde JSON ?</p>
                            <p className="text-xs text-danger-600 mb-4">Cette action est irréversible.</p>
                            <div className="flex gap-2">
                                <button onClick={() => setResetStatut("saisie")} className="px-4 py-2 rounded-lg bg-danger-500 hover:bg-danger-600 text-white text-sm font-medium transition-colors cursor-pointer">
                                    Oui, continuer
                                </button>
                                <button onClick={() => setResetStatut(null)} className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors cursor-pointer">
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                    {resetStatut === "saisie" && (
                        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4">
                            <p className="text-sm font-semibold text-danger-700 mb-1">Tapez EFFACER pour confirmer</p>
                            <input
                                type="text"
                                value={resetSaisie}
                                onChange={(e) => setResetSaisie(e.target.value)}
                                placeholder="EFFACER"
                                autoFocus
                                autoComplete="off"
                                className="w-full px-3 py-2 rounded-lg border border-danger-300 text-sm font-mono mb-3 focus:outline-none focus:ring-2 focus:ring-danger-400 bg-white"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { if (resetSaisie !== "EFFACER") return; reinitialiser(); window.location.reload(); }}
                                    disabled={resetSaisie !== "EFFACER"}
                                    className="px-4 py-2 rounded-lg bg-danger-500 hover:bg-danger-600 text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Effacer définitivement
                                </button>
                                <button onClick={() => { setResetStatut(null); setResetSaisie(""); }} className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors cursor-pointer">
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

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ titre, description, accent = "default", children }) {
    const border = accent === "danger" ? "border-danger-200" : "border-slate-200";
    return (
        <div className={`bg-white rounded-xl border ${border} p-6`}>
            <h2 className="text-base font-semibold text-slate-800 mb-1">{titre}</h2>
            <p className="text-sm text-slate-500 mb-4">{description}</p>
            {children}
        </div>
    );
}

Section.propTypes = {
    titre:       PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    accent:      PropTypes.oneOf(["default", "danger"]),
    children:    PropTypes.node.isRequired,
};

export default ExportImport;
