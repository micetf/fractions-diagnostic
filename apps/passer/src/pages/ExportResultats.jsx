/**
 * @fileoverview ExportResultats — export des résultats partiels (Phase 3).
 *
 * Accessible uniquement par l'enseignant (lien discret depuis FinPassation
 * ou depuis l'URL admin). Pas accessible aux élèves pendant la passation.
 *
 * Deux actions :
 *   1. Exporter le fichier résultats JSON (SRS F-PAS-19, F-PAS-20, F-PAS-21)
 *   2. Effacer les données locales après export (SRS NF-SEC-05, F-PAS-22)
 *
 * @module pages/ExportResultats
 */
import { useState } from "react";
import PropTypes from "prop-types";
import { usePasserContext } from "@/context/PasserContext";

/**
 * Déclenche le téléchargement d'un Blob.
 *
 * @param {Blob}   blob
 * @param {string} filename
 */
function telecharger(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * @param {object}   props
 * @param {function} props.onRetour - Retour à la grille des prénoms.
 */
function ExportResultats({ onRetour }) {
    const { state, dispatch } = usePasserContext();
    const { diagnostic, passations } = state;

    const [exporte, setExporte] = useState(false);
    const [efface, setEfface] = useState(false);
    const [confirmEffacer, setConfirmEffacer] = useState(false);

    if (!diagnostic) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
                <p className="text-slate-400">Aucun diagnostic actif.</p>
            </div>
        );
    }

    const passationsTerminees = passations.filter(
        (p) =>
            p.diagnostic_id === diagnostic.diagnostic_id &&
            p.statut === "terminee"
    );

    function handleExporter() {
        const fichier = {
            type: "fractions-resultats",
            version: "2.0",
            exported_at: new Date().toISOString(),
            diagnostic_id: diagnostic.diagnostic_id,
            passations: passationsTerminees,
        };

        const blob = new Blob([JSON.stringify(fichier, null, 2)], {
            type: "application/json",
        });

        const dateStr = new Date().toISOString().slice(0, 10);
        const idCourt = diagnostic.diagnostic_id.slice(0, 8);
        const filename = `fractions-resultats-${diagnostic.niveau}-${dateStr}-${idCourt}.json`;
        telecharger(blob, filename);
        setExporte(true);
    }

    function handleEffacer() {
        dispatch({ type: "EFFACER_LOCAL" });
        setEfface(true);
    }

    if (efface) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
                <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5 text-3xl" aria-hidden="true">✓</div>
                    <h1 className="text-lg font-semibold text-slate-800 mb-2">
                        Données effacées
                    </h1>
                    <p className="text-sm text-slate-500 mb-6">
                        Cette tablette est prête pour un nouveau diagnostic.
                    </p>
                    <button
                        type="button"
                        onClick={onRetour}
                        className="w-full py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors"
                    >
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-semibold text-slate-800 mb-2">
                    Résultats à envoyer
                </h1>
                <p className="text-sm text-slate-500 mb-8">
                    {passationsTerminees.length} passation
                    {passationsTerminees.length > 1 ? "s" : ""} terminée
                    {passationsTerminees.length > 1 ? "s" : ""} sur cette tablette.
                </p>

                <div className="flex flex-col gap-4">
                    {/* Export */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h2 className="text-base font-semibold text-slate-800 mb-1">
                            1. Exporter les résultats
                        </h2>
                        <p className="text-sm text-slate-500 mb-4">
                            Télécharge un fichier JSON à importer sur la tablette
                            de l&apos;enseignant·e.
                        </p>
                        <button
                            type="button"
                            onClick={handleExporter}
                            disabled={passationsTerminees.length === 0}
                            className="w-full py-3 rounded-xl bg-brand-600 text-white
                                       font-semibold hover:bg-brand-700 transition-colors
                                       disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Télécharger les résultats
                        </button>
                        {exporte && (
                            <p className="text-sm text-green-600 mt-2 text-center">
                                ✓ Fichier téléchargé
                            </p>
                        )}
                    </div>

                    {/* Effacement RGPD */}
                    {exporte && (
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-base font-semibold text-slate-800 mb-1">
                                2. Effacer les données locales
                            </h2>
                            <p className="text-sm text-slate-500 mb-4">
                                Recommandé pour la confidentialité des élèves.
                                Les données sont déjà dans le fichier exporté.
                            </p>
                            {!confirmEffacer ? (
                                <button
                                    type="button"
                                    onClick={() => setConfirmEffacer(true)}
                                    className="w-full py-3 rounded-xl border border-danger-300
                                               bg-white hover:bg-danger-50 text-danger-700
                                               font-semibold transition-colors"
                                >
                                    Effacer les données de cette tablette
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-sm text-danger-700 font-semibold">
                                        Confirmer l&apos;effacement ?
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleEffacer}
                                            className="flex-1 py-2 rounded-xl bg-danger-500
                                                       hover:bg-danger-600 text-white font-semibold
                                                       transition-colors text-sm"
                                        >
                                            Oui, effacer
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setConfirmEffacer(false)}
                                            className="flex-1 py-2 rounded-xl border border-slate-200
                                                       hover:bg-slate-50 text-slate-600 font-semibold
                                                       transition-colors text-sm"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Retour */}
                    <button
                        type="button"
                        onClick={onRetour}
                        className="text-sm text-slate-400 hover:text-slate-600 transition-colors py-2"
                    >
                        ← Retour à la liste des élèves
                    </button>
                </div>
            </div>
        </div>
    );
}

ExportResultats.propTypes = {
    onRetour: PropTypes.func.isRequired,
};

export default ExportResultats;
