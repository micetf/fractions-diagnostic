/**
 * @fileoverview ImportConfig — import du fichier de configuration (Phase 1).
 *
 * Valide le fichier JSON importé (type fractions-config, version 2.0)
 * et charge la configuration dans PasserContext.
 *
 * @module pages/ImportConfig
 */
import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { usePasserContext } from "@/context/PasserContext";

/**
 * Valide la structure minimale d'un fichier config.
 *
 * @param {any} data
 * @returns {{ ok: boolean, erreur?: string }}
 */
function validerConfig(data) {
    if (!data || typeof data !== "object")
        return { ok: false, erreur: "Le fichier n'est pas un JSON valide." };
    if (data.type !== "fractions-config")
        return { ok: false, erreur: "Ce fichier n'est pas une configuration de diagnostic." };
    if (!data.diagnostic_id)
        return { ok: false, erreur: "Identifiant de diagnostic manquant." };
    if (!Array.isArray(data.exercices_selectionnes) || data.exercices_selectionnes.length === 0)
        return { ok: false, erreur: "Aucun exercice sélectionné dans cette configuration." };
    if (!Array.isArray(data.eleves) || data.eleves.length === 0)
        return { ok: false, erreur: "Aucun élève dans cette configuration." };
    return { ok: true };
}

/**
 * @param {object}   props
 * @param {function} props.onSuccess - Appelé après import réussi.
 * @param {function} props.onAnnuler - Retour à l'écran d'attente.
 */
function ImportConfig({ onSuccess, onAnnuler }) {
    const { dispatch } = usePasserContext();
    const [erreur, setErreur] = useState("");
    const [pending, setPending] = useState(false);
    const fileInputRef = useRef(null);

    function handleFichier(e) {
        const fichier = e.target.files?.[0];
        if (!fichier) return;
        setPending(true);
        setErreur("");

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                const validation = validerConfig(data);
                if (!validation.ok) {
                    setErreur(validation.erreur);
                    setPending(false);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    return;
                }
                dispatch({ type: "CHARGER_CONFIG", payload: data });
                setPending(false);
                onSuccess();
            } catch {
                setErreur("Impossible de lire ce fichier.");
                setPending(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.onerror = () => {
            setErreur("Erreur de lecture du fichier.");
            setPending(false);
        };
        reader.readAsText(fichier, "utf-8");
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="text-center mb-6">
                    <div
                        className="w-14 h-14 rounded-full bg-brand-100 flex items-center
                                   justify-center mx-auto mb-4 text-2xl select-none"
                        aria-hidden="true"
                    >
                        📂
                    </div>
                    <h1 className="text-lg font-semibold text-slate-800">
                        Importer la configuration
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Sélectionnez le fichier{" "}
                        <span className="font-mono text-xs">fractions-config-*.json</span>{" "}
                        fourni par l&apos;enseignant·e.
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFichier}
                    className="hidden"
                    id="import-config"
                />
                <label
                    htmlFor="import-config"
                    className={`block w-full py-3 px-6 rounded-xl text-center font-semibold
                                text-sm transition-colors touch-manipulation cursor-pointer
                                ${pending
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800"
                                }`}
                >
                    {pending ? "Chargement…" : "Choisir un fichier…"}
                </label>

                {erreur && (
                    <p className="mt-4 text-sm text-red-600 text-center" role="alert">
                        {erreur}
                    </p>
                )}

                <button
                    type="button"
                    onClick={onAnnuler}
                    className="mt-4 w-full text-sm text-slate-400 hover:text-slate-600
                               transition-colors py-1 text-center"
                >
                    Annuler
                </button>
            </div>
        </div>
    );
}

ImportConfig.propTypes = {
    onSuccess: PropTypes.func.isRequired,
    onAnnuler: PropTypes.func.isRequired,
};

export default ImportConfig;
