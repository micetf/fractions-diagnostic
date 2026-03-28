/**
 * @fileoverview Parametres — page de paramètres de l'interface admin.
 *
 * Deux actions disponibles :
 *   1. Changer le code PIN (ancien PIN → nouveau PIN → nouvel indice)
 *   2. Remise à zéro (délégue à ExportImport via navigation)
 *
 * @module pages/enseignant/Parametres
 */
import { useState } from "react";
import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";
import { hashPin, verifyPin } from "@fractions-diagnostic/shared/pinHash";

// ─── Sous-composant : changement de PIN ──────────────────────────────────────

/**
 * Formulaire de changement de PIN en 3 étapes :
 *   1. Vérifier l'ancien PIN
 *   2. Saisir le nouveau PIN (2×)
 *   3. Saisir un nouvel indice
 *
 * @param {object}   props
 * @param {function} props.onSuccess
 * @param {function} props.onCancel
 */
function ChangerPin({ onSuccess, onCancel }) {
    const { state, dispatch } = useAppContext();

    const [etape, setEtape] = useState("ancien");
    const [ancien, setAncien] = useState("");
    const [nouveau, setNouveau] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [hint, setHint] = useState(state.config?.pin_hint ?? "");
    const [erreur, setErreur] = useState("");
    const [pending, setPending] = useState(false);

    async function handleVerifierAncien(e) {
        e.preventDefault();
        if (ancien.length !== 4) {
            setErreur("Le code doit contenir 4 chiffres.");
            return;
        }
        setPending(true);
        const ok = await verifyPin(ancien, state.config?.pin_hash ?? "");
        setPending(false);
        if (!ok) {
            setErreur("Code incorrect.");
            setAncien("");
            return;
        }
        setErreur("");
        setEtape("nouveau");
    }

    function handleValiderNouveau(e) {
        e.preventDefault();
        if (nouveau.length !== 4) {
            setErreur("Le nouveau code doit contenir 4 chiffres.");
            return;
        }
        if (nouveau !== confirmation) {
            setErreur("Les codes ne correspondent pas.");
            setConfirmation("");
            return;
        }
        setErreur("");
        setEtape("hint");
    }

    async function handleValiderHint(e) {
        e.preventDefault();
        setPending(true);
        const hash = await hashPin(nouveau);
        dispatch({
            type: "SET_CONFIG",
            payload: {
                ...state.config,
                pin_hash: hash,
                pin_hint: hint.trim() || null,
            },
        });
        setPending(false);
        onSuccess();
    }

    const inputClass =
        "w-full px-4 py-3 rounded-xl border border-slate-200 text-sm " +
        "focus:outline-none focus:ring-2 focus:ring-brand-400 " +
        "font-mono tracking-widest";

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4">
                Changer mon code
            </h2>

            {/* ── Étape 1 : ancien PIN ── */}
            {etape === "ancien" && (
                <form onSubmit={handleVerifierAncien} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            Code actuel
                        </label>
                        <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            value={ancien}
                            onChange={(e) => {
                                setAncien(e.target.value.replace(/\D/g, "").slice(0, 4));
                                setErreur("");
                            }}
                            autoFocus
                            className={inputClass}
                            placeholder="••••"
                        />
                    </div>
                    {erreur && (
                        <p className="text-sm text-red-600" role="alert">{erreur}</p>
                    )}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={pending || ancien.length !== 4}
                            className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                                       text-white text-sm font-medium transition-colors
                                       disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {pending ? "Vérification…" : "Suivant →"}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-5 py-2 rounded-lg border border-slate-200
                                       hover:bg-slate-50 text-slate-600 text-sm transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            )}

            {/* ── Étape 2 : nouveau PIN ── */}
            {etape === "nouveau" && (
                <form onSubmit={handleValiderNouveau} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            Nouveau code
                        </label>
                        <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            value={nouveau}
                            onChange={(e) => {
                                setNouveau(e.target.value.replace(/\D/g, "").slice(0, 4));
                                setErreur("");
                            }}
                            autoFocus
                            className={inputClass}
                            placeholder="••••"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            Confirmer le nouveau code
                        </label>
                        <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            value={confirmation}
                            onChange={(e) => {
                                setConfirmation(e.target.value.replace(/\D/g, "").slice(0, 4));
                                setErreur("");
                            }}
                            className={inputClass}
                            placeholder="••••"
                        />
                    </div>
                    {erreur && (
                        <p className="text-sm text-red-600" role="alert">{erreur}</p>
                    )}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={nouveau.length !== 4 || confirmation.length !== 4}
                            className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                                       text-white text-sm font-medium transition-colors
                                       disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Suivant →
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-5 py-2 rounded-lg border border-slate-200
                                       hover:bg-slate-50 text-slate-600 text-sm transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            )}

            {/* ── Étape 3 : nouvel indice ── */}
            {etape === "hint" && (
                <form onSubmit={handleValiderHint} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            Indice pour vous souvenir{" "}
                            <span className="text-slate-400 font-normal">(optionnel)</span>
                        </label>
                        <input
                            type="text"
                            value={hint}
                            onChange={(e) => setHint(e.target.value)}
                            maxLength={60}
                            autoFocus
                            placeholder="Ex. : mon année de naissance"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200
                                       text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={pending}
                            className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                                       text-white text-sm font-medium transition-colors
                                       disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {pending ? "Enregistrement…" : "Enregistrer →"}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-5 py-2 rounded-lg border border-slate-200
                                       hover:bg-slate-50 text-slate-600 text-sm transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

ChangerPin.propTypes = {
    onSuccess: PropTypes.func.isRequired,
    onCancel:  PropTypes.func.isRequired,
};

// ─── Composant principal ──────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {function} props.onNavigate
 */
function Parametres({ onNavigate }) {
    const [showChangerPin, setShowChangerPin] = useState(false);
    const [pinChange, setPinChange] = useState(false);

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
                <span className="text-slate-800 font-medium">Paramètres</span>
            </nav>

            <h1 className="text-2xl font-semibold text-slate-800 mb-8">
                Paramètres
            </h1>

            <div className="flex flex-col gap-6">
                {/* ── Code PIN ── */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    {!showChangerPin ? (
                        <>
                            <h2 className="text-base font-semibold text-slate-800 mb-1">
                                Code d&apos;accès
                            </h2>
                            <p className="text-sm text-slate-500 mb-4">
                                Modifiez votre code à 4 chiffres et votre indice.
                            </p>
                            {pinChange && (
                                <p className="text-sm text-green-600 mb-3">
                                    ✓ Code modifié avec succès.
                                </p>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowChangerPin(true);
                                    setPinChange(false);
                                }}
                                className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                                           text-white text-sm font-medium transition-colors cursor-pointer"
                            >
                                Changer mon code
                            </button>
                        </>
                    ) : (
                        <ChangerPin
                            onSuccess={() => {
                                setShowChangerPin(false);
                                setPinChange(true);
                            }}
                            onCancel={() => setShowChangerPin(false)}
                        />
                    )}
                </div>

                {/* ── Remise à zéro ── */}
                <div className="bg-white rounded-xl border border-danger-200 p-6">
                    <h2 className="text-base font-semibold text-slate-800 mb-1">
                        Remise à zéro
                    </h2>
                    <p className="text-sm text-slate-500 mb-4">
                        Efface toutes les données. À utiliser en début d&apos;année
                        scolaire, après avoir exporté une sauvegarde JSON.
                    </p>
                    <button
                        type="button"
                        onClick={() => onNavigate("export-import")}
                        className="px-5 py-2 rounded-lg border border-danger-300
                                   bg-white hover:bg-danger-50 text-danger-700
                                   text-sm font-medium transition-colors cursor-pointer"
                    >
                        Aller à Export / Import →
                    </button>
                </div>
            </div>
        </div>
    );
}

Parametres.propTypes = {
    onNavigate: PropTypes.func.isRequired,
};

export default Parametres;
