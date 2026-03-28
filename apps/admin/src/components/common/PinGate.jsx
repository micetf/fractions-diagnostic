/**
 * @fileoverview PinGate — portail d'accès au mode enseignant.
 *
 * Deux modes :
 *   - 'create'  : premier lancement. Saisie + confirmation + indice + aide-mémoire.
 *   - 'verify'  : lancements suivants. Pavé numérique, auto-validation au 4e chiffre.
 *
 * Flux "code oublié" (SRS F-AUTH-07) :
 *   1. Avertissement + proposition d'export JSON
 *   2. Confirmation par saisie de "EFFACER"
 *   3. Reset → PinGate repasse en mode create
 *
 * @module components/common/PinGate
 */

import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { hashPin, verifyPin } from "@fractions-diagnostic/shared/pinHash";
import { useAppContext } from "@/context/useAppContext";
import { exporterJSON } from "@/utils/exportData";

// ─── Constantes ───────────────────────────────────────────────────────────────

const PIN_LENGTH = 4;
const NUMPAD_KEYS = ["1","2","3","4","5","6","7","8","9","del","0","ok"];

// ─── PinDots ─────────────────────────────────────────────────────────────────

function PinDots({ pin, erreur }) {
    return (
        <div
            className="flex gap-5 justify-center py-6"
            role="status"
            aria-live="polite"
            aria-label={`${pin.length} chiffre${pin.length !== 1 ? "s" : ""} saisi${pin.length !== 1 ? "s" : ""} sur ${PIN_LENGTH}`}
        >
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <div
                    key={i}
                    className={[
                        "w-4 h-4 rounded-full border-2 transition-all duration-200",
                        i < pin.length
                            ? erreur
                                ? "bg-red-500 border-red-500 scale-110"
                                : "bg-brand-600 border-brand-600 scale-110"
                            : "bg-transparent border-slate-300",
                    ].join(" ")}
                />
            ))}
        </div>
    );
}

PinDots.propTypes = {
    pin:    PropTypes.string.isRequired,
    erreur: PropTypes.bool.isRequired,
};

// ─── NumKey ──────────────────────────────────────────────────────────────────

function NumKey({ label, onPress, variant, disabled = false }) {
    if (variant === "empty") return <div className="min-h-[64px]" />;

    const display = { del: "⌫", ok: "✓" }[label] ?? label;

    const styles = {
        digit: "bg-white border border-slate-200 text-slate-800 text-2xl " +
               "hover:bg-slate-50 hover:border-slate-300 shadow-sm active:bg-slate-100",
        del:   "bg-slate-100 border border-slate-200 text-slate-500 text-xl " +
               "hover:bg-slate-200 active:bg-slate-300",
        ok:    "bg-brand-600 text-white text-xl shadow-md " +
               "hover:bg-brand-700 active:bg-brand-800 " +
               "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
    };

    return (
        <button
            type="button"
            aria-label={
                label === "del" ? "Effacer le dernier chiffre"
                : label === "ok" ? "Valider le code"
                : `Chiffre ${label}`
            }
            disabled={disabled}
            className={
                "flex items-center justify-center rounded-2xl font-semibold " +
                "select-none transition-all duration-100 active:scale-95 " +
                "touch-manipulation min-h-[64px] " + styles[variant]
            }
            onPointerDown={(e) => { e.preventDefault(); if (!disabled) onPress(); }}
        >
            {display}
        </button>
    );
}

NumKey.propTypes = {
    label:    PropTypes.string.isRequired,
    onPress:  PropTypes.func.isRequired,
    variant:  PropTypes.oneOf(["digit", "del", "ok", "empty"]).isRequired,
    disabled: PropTypes.bool,
};

// ─── Numpad ───────────────────────────────────────────────────────────────────

function Numpad({ onDigit, onDelete, onOk, okDisabled, okHidden }) {
    return (
        <div className="grid grid-cols-3 gap-3" role="group" aria-label="Pavé numérique">
            {NUMPAD_KEYS.map((key) => {
                if (key === "del")
                    return <NumKey key="del" label="del" onPress={onDelete} variant="del" />;
                if (key === "ok")
                    return okHidden
                        ? <div key="ok" className="min-h-[64px]" />
                        : <NumKey key="ok" label="ok" onPress={onOk} variant="ok" disabled={okDisabled} />;
                return (
                    <NumKey key={key} label={key} onPress={() => onDigit(key)} variant="digit" />
                );
            })}
        </div>
    );
}

Numpad.propTypes = {
    onDigit:    PropTypes.func.isRequired,
    onDelete:   PropTypes.func.isRequired,
    onOk:       PropTypes.func.isRequired,
    okDisabled: PropTypes.bool.isRequired,
    okHidden:   PropTypes.bool.isRequired,
};

// ─── AideMemoire ─────────────────────────────────────────────────────────────

function AideMemoire({ onContinue }) {
    const navigateur = navigator.userAgent.includes("Firefox") ? "Firefox"
        : navigator.userAgent.includes("Chrome") ? "Chrome"
        : "votre navigateur";

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center print:hidden">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5 text-3xl" aria-hidden="true">✓</div>
                <h1 className="text-lg font-semibold text-slate-800 mb-2">Votre code est créé</h1>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    Notez-le sur le billet ci-dessous et rangez-le en lieu sûr.{" "}
                    <strong className="text-slate-700">Un code oublié nécessite une remise à zéro.</strong>
                </p>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 mb-6 text-left">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">✂ À découper et conserver</p>
                    <div className="space-y-2 text-sm text-slate-700">
                        <p><span className="text-slate-400">Application :</span> Fractions Diagnostic</p>
                        <p><span className="text-slate-400">Mon code :</span>{" "}<span className="inline-block border-b-2 border-slate-400 w-24 h-5" /></p>
                        <p className="text-xs text-slate-400">Navigateur : {navigateur}</p>
                    </div>
                    <button type="button" className="mt-4 text-xs text-brand-600 hover:text-brand-700 underline underline-offset-2" onClick={() => window.print()}>
                        Imprimer cet aide-mémoire →
                    </button>
                </div>
                <button type="button" className="w-full py-3 px-6 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors" onClick={onContinue}>
                    Commencer à configurer l&apos;application
                </button>
            </div>
            <div className="hidden print:block p-8 text-sm font-sans">
                <div className="border-2 border-dashed border-gray-400 p-6 max-w-xs">
                    <p className="font-bold text-base mb-3">Fractions Diagnostic — Code enseignant·e</p>
                    <table className="w-full text-sm"><tbody>
                        <tr><td className="text-gray-500 pr-4 py-1">Mon code :</td><td><span className="inline-block border-b border-gray-600 w-24 h-5" /></td></tr>
                        <tr><td className="text-gray-500 pr-4 py-1">Navigateur :</td><td className="text-gray-700">{navigateur}</td></tr>
                    </tbody></table>
                    <p className="text-xs text-gray-400 mt-4">Ranger dans le cahier de préparation.</p>
                </div>
            </div>
        </div>
    );
}

AideMemoire.propTypes = { onContinue: PropTypes.func.isRequired };

// ─── FluxOubli ────────────────────────────────────────────────────────────────

/**
 * Flux de récupération en cas de PIN oublié (SRS F-AUTH-07).
 * Accessible sans authentification.
 *
 * Étapes :
 *   'avertissement' → export proposé + explication
 *   'confirmer'     → saisie de "EFFACER"
 *   → dispatch RESET_ALL → rechargement
 *
 * @param {function} props.onAnnuler - Retour à l'écran PIN
 */
function FluxOubli({ onAnnuler }) {
    const { dispatch } = useAppContext();
    const [etape, setEtape] = useState("avertissement");
    const [saisie, setSaisie] = useState("");

    function handleReset() {
        if (saisie !== "EFFACER") return;
        dispatch({ type: "RESET_ALL" });
        window.location.reload();
    }

    if (etape === "avertissement") {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
                <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-danger-200 p-8">
                    <div className="w-14 h-14 rounded-full bg-danger-100 flex items-center justify-center mx-auto mb-5 text-2xl" aria-hidden="true">⚠️</div>
                    <h1 className="text-lg font-semibold text-slate-800 text-center mb-2">Code oublié</h1>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed text-center">
                        Sans le code, la seule issue est la <strong>remise à zéro</strong> de l&apos;application.
                        Vos classes, diagnostics et résultats seront effacés.
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                        <p className="text-sm font-semibold text-amber-800 mb-2">
                            Avant de continuer :
                        </p>
                        <p className="text-sm text-amber-700 mb-3">
                            Si vous avez déjà exporté une sauvegarde JSON, vous pourrez
                            restaurer vos données après la remise à zéro.
                        </p>
                        <button
                            type="button"
                            onClick={() => exporterJSON()}
                            className="w-full py-2 px-4 rounded-lg bg-amber-600 hover:bg-amber-700
                                       text-white text-sm font-medium transition-colors"
                        >
                            Télécharger la sauvegarde JSON maintenant
                        </button>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => setEtape("confirmer")}
                            className="w-full py-2.5 rounded-xl border border-danger-300
                                       bg-white hover:bg-danger-50 text-danger-700
                                       text-sm font-medium transition-colors"
                        >
                            Continuer vers la remise à zéro →
                        </button>
                        <button
                            type="button"
                            onClick={onAnnuler}
                            className="w-full py-2.5 rounded-xl border border-slate-200
                                       hover:bg-slate-50 text-slate-600 text-sm transition-colors"
                        >
                            Retour — j&apos;ai retrouvé mon code
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-danger-200 p-8">
                <h1 className="text-lg font-semibold text-slate-800 text-center mb-2">
                    Confirmer la remise à zéro
                </h1>
                <p className="text-sm text-slate-500 text-center mb-6">
                    Tapez <strong className="font-mono text-danger-700">EFFACER</strong> pour confirmer.
                    Cette action est irréversible.
                </p>
                <input
                    type="text"
                    value={saisie}
                    onChange={(e) => setSaisie(e.target.value)}
                    placeholder="EFFACER"
                    autoFocus
                    autoComplete="off"
                    className="w-full px-4 py-3 rounded-xl border border-danger-300
                               text-sm font-mono mb-4 focus:outline-none
                               focus:ring-2 focus:ring-danger-400 bg-white"
                />
                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={saisie !== "EFFACER"}
                        className="w-full py-2.5 rounded-xl bg-danger-500 hover:bg-danger-600
                                   text-white text-sm font-semibold transition-colors
                                   disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Effacer définitivement
                    </button>
                    <button
                        type="button"
                        onClick={onAnnuler}
                        className="w-full py-2.5 rounded-xl border border-slate-200
                                   hover:bg-slate-50 text-slate-600 text-sm transition-colors"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
}

FluxOubli.propTypes = { onAnnuler: PropTypes.func.isRequired };

// ─── PinGate (composant principal) ───────────────────────────────────────────

export default function PinGate({ mode, onSuccess, onCancel, context }) {
    const { state, dispatch } = useAppContext();

    const [etape, setEtape] = useState("saisie");
    const [pin, setPin] = useState("");
    const [pinPremier, setPinPremier] = useState("");
    const [hint, setHint] = useState("");
    const [erreur, setErreur] = useState("");
    const [erreurDots, setErreurDots] = useState(false);
    const [pending, setPending] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [showOubli, setShowOubli] = useState(false);

    const isCreate = mode === "create";
    const hintStocke = state.config?.pin_hint ?? null;

    function animerErreur(msg) {
        setErreur(msg);
        setErreurDots(true);
        setTimeout(() => setErreurDots(false), 600);
    }

    useEffect(() => {
        function handleKey(e) {
            if (pending || etape === "aide_memoire" || etape === "hint" || showOubli) return;
            if (e.key >= "0" && e.key <= "9") handleDigit(e.key);
            if (e.key === "Backspace") handleDelete();
            if (e.key === "Enter") handleOk();
        }
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    });

    const handleDigit = useCallback((digit) => {
        if (pending) return;
        setErreur("");
        setPin((p) => {
            if (p.length >= PIN_LENGTH) return p;
            const next = p + digit;
            if (!isCreate && next.length === PIN_LENGTH) {
                setTimeout(() => validerVerify(next), 120);
            }
            return next;
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pending, isCreate]);

    const handleDelete = useCallback(() => {
        if (pending) return;
        setErreur("");
        setPin((p) => p.slice(0, -1));
    }, [pending]);

    async function validerVerify(pinAValider) {
        setPending(true);
        const ok = await verifyPin(pinAValider, state.config?.pin_hash ?? "");
        setPending(false);
        if (ok) {
            onSuccess();
        } else {
            animerErreur("Code incorrect. Réessayez.");
            setPin("");
        }
    }

    const handleOk = useCallback(async () => {
        if (pending || pin.length !== PIN_LENGTH) return;
        if (!isCreate) { await validerVerify(pin); return; }
        if (etape === "saisie") {
            setPinPremier(pin); setPin(""); setEtape("confirmation"); setErreur(""); return;
        }
        if (etape === "confirmation") {
            if (pin !== pinPremier) {
                animerErreur("Les codes ne correspondent pas. Recommencez.");
                setPin(""); setPinPremier(""); setEtape("saisie"); return;
            }
            setPin(""); setEtape("hint");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pending, pin, isCreate, etape, pinPremier]);

    async function handleValiderCreation() {
        setPending(true);
        const hash = await hashPin(pinPremier);
        dispatch({
            type: "SET_CONFIG",
            payload: {
                pin_hash: hash,
                pin_hint: hint.trim() || null,
                annee_scolaire: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
            },
        });
        setPending(false);
        setEtape("aide_memoire");
    }

    // ── Flux oubli ────────────────────────────────────────────────────────
    if (showOubli) {
        return <FluxOubli onAnnuler={() => { setShowOubli(false); setPin(""); setErreur(""); }} />;
    }

    if (etape === "aide_memoire") return <AideMemoire onContinue={onSuccess} />;

    if (etape === "hint") {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
                <div className="w-full max-w-xs bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4 text-2xl select-none" aria-hidden="true">💡</div>
                        <h1 className="text-lg font-semibold text-slate-800">Un indice pour vous souvenir</h1>
                        <p className="mt-1 text-sm text-slate-500">Optionnel — ne notez pas votre code ici.</p>
                    </div>
                    <input
                        type="text" value={hint} onChange={(e) => setHint(e.target.value)}
                        placeholder="Ex. : mon année de naissance" maxLength={60} autoFocus
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 mb-4"
                    />
                    <button type="button" onClick={handleValiderCreation} disabled={pending}
                        className="w-full py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50">
                        {pending ? "Création…" : "Créer mon code →"}
                    </button>
                </div>
            </div>
        );
    }

    const titre = isCreate
        ? etape === "saisie" ? "Choisissez votre code" : "Confirmez votre code"
        : "Espace enseignant·e";
    const sousTitre = isCreate
        ? etape === "saisie" ? "4 chiffres dont vous vous souviendrez facilement" : "Saisissez à nouveau le même code"
        : context ?? "Saisissez votre code pour accéder au tableau de bord";

    const StepDots = isCreate ? (
        <div className="flex gap-2 justify-center mb-1">
            <div className={`h-1.5 w-8 rounded-full transition-colors ${etape === "saisie" ? "bg-brand-600" : "bg-brand-200"}`} />
            <div className={`h-1.5 w-8 rounded-full transition-colors ${etape === "confirmation" ? "bg-brand-600" : "bg-slate-200"}`} />
        </div>
    ) : null;

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
            <div className="w-full max-w-xs bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="text-center mb-2">
                    <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4 text-2xl select-none" aria-hidden="true">
                        {isCreate ? "🔑" : "🔒"}
                    </div>
                    <h1 className="text-lg font-semibold text-slate-800">{titre}</h1>
                    <p className="mt-1 text-sm text-slate-500 leading-snug">{sousTitre}</p>
                </div>

                {StepDots}
                <PinDots pin={pin} erreur={erreurDots} />

                {erreur && <p className="text-sm text-red-600 text-center -mt-3 mb-4 leading-snug" role="alert">{erreur}</p>}
                {pending && <p className="text-sm text-slate-400 text-center -mt-3 mb-4">Vérification…</p>}

                <Numpad
                    onDigit={handleDigit} onDelete={handleDelete} onOk={handleOk}
                    okDisabled={pin.length !== PIN_LENGTH || pending}
                    okHidden={!isCreate}
                />

                {/* Indice + oubli (mode verify uniquement) */}
                {!isCreate && (
                    <div className="mt-4 text-center space-y-2">
                        {hintStocke && (
                            <>
                                <button type="button"
                                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors block w-full"
                                    onClick={() => setShowHint((v) => !v)}>
                                    {showHint ? "Masquer l'indice" : "Afficher l'indice"}
                                </button>
                                {showHint && (
                                    <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                                        💡 {hintStocke}
                                    </p>
                                )}
                            </>
                        )}
                        <button type="button"
                            className="text-xs text-slate-400 hover:text-danger-600 transition-colors block w-full"
                            onClick={() => setShowOubli(true)}>
                            J&apos;ai oublié mon code
                        </button>
                    </div>
                )}

                {!isCreate && onCancel && (
                    <button type="button"
                        className="mt-4 w-full text-sm text-slate-400 hover:text-slate-600 text-center transition-colors py-1"
                        onClick={onCancel}>
                        Annuler
                    </button>
                )}
            </div>
        </div>
    );
}

PinGate.propTypes = {
    mode:      PropTypes.oneOf(["create", "verify"]).isRequired,
    onSuccess: PropTypes.func.isRequired,
    onCancel:  PropTypes.func,
    context:   PropTypes.string,
};

PinGate.defaultProps = {
    onCancel: null,
    context:  null,
};
