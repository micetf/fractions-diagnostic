import { useState } from "react";
import PropTypes from "prop-types";
import { hashPin, verifyPin } from "@/utils/pinHash";
import { useAppContext } from "@/context/useAppContext";

/**
 * PinGate
 *
 * Formulaire de création ou de vérification du PIN enseignant.
 *
 * Deux modes :
 *   - 'create'  : premier lancement — saisie + confirmation, hash persisté
 *                 dans AppContext (SET_CONFIG).
 *   - 'verify'  : lancements suivants — saisie simple comparée au hash stocké.
 *
 * Le PIN en clair n'est jamais persisté (SRS NF-SEC-01).
 *
 * @param {object}   props
 * @param {'create'|'verify'} props.mode      - Mode du formulaire.
 * @param {function} props.onSuccess           - Callback appelé après succès.
 */
function PinGate({ mode, onSuccess }) {
    const { state, dispatch } = useAppContext();

    const [pin, setPin] = useState("");
    const [confirm, setConfirm] = useState("");
    const [erreur, setErreur] = useState("");
    const [pending, setPending] = useState(false);

    // ── Création ──────────────────────────────────────────────────────────────
    async function handleCreate(e) {
        e.preventDefault();
        setErreur("");

        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            setErreur("Le code doit contenir exactement 4 chiffres.");
            return;
        }
        if (pin !== confirm) {
            setErreur("Les deux codes ne correspondent pas.");
            return;
        }

        setPending(true);
        const hash = await hashPin(pin);
        dispatch({
            type: "SET_CONFIG",
            payload: {
                pin_hash: hash,
                annee_scolaire:
                    new Date().getFullYear() +
                    "-" +
                    (new Date().getFullYear() + 1),
            },
        });
        setPending(false);
        onSuccess();
    }

    // ── Vérification ──────────────────────────────────────────────────────────
    async function handleVerify(e) {
        e.preventDefault();
        setErreur("");

        if (!pin) {
            setErreur("Veuillez saisir votre code.");
            return;
        }

        setPending(true);
        const ok = await verifyPin(pin, state.config?.pin_hash ?? "");
        setPending(false);

        if (ok) {
            onSuccess();
        } else {
            setErreur("Code incorrect.");
            setPin("");
        }
    }

    const isCreate = mode === "create";
    const handleSubmit = isCreate ? handleCreate : handleVerify;

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
            <div
                className="w-full max-w-xs bg-white rounded-2xl shadow-sm
                      border border-slate-200 p-8"
            >
                {/* En-tête */}
                <div className="mb-6 text-center">
                    <div
                        className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center
                          mx-auto mb-4 text-2xl font-display font-bold text-brand-600
                          select-none"
                        aria-hidden="true"
                    >
                        {isCreate ? "🔑" : "🔒"}
                    </div>
                    <h1 className="text-lg font-semibold text-slate-800">
                        {isCreate ? "Créer votre code" : "Code enseignant"}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {isCreate
                            ? "Choisissez un code à 4 chiffres pour protéger vos données."
                            : "Saisissez votre code à 4 chiffres."}
                    </p>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} noValidate>
                    {/* Champ username masqué — requis par les navigateurs pour l'accessibilité
              des formulaires contenant un champ password (https://goo.gl/9p2vKq) */}
                    <input
                        type="text"
                        autoComplete="username"
                        value="enseignant"
                        readOnly
                        className="sr-only"
                        aria-hidden="true"
                        tabIndex={-1}
                    />
                    <div className="mb-4">
                        <label
                            className="block text-sm font-medium text-slate-700 mb-1"
                            htmlFor="pin-input"
                        >
                            {isCreate ? "Votre code" : "Code"}
                        </label>
                        <input
                            id="pin-input"
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            value={pin}
                            onChange={(e) =>
                                setPin(
                                    e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 4)
                                )
                            }
                            placeholder="• • • •"
                            autoComplete={
                                isCreate ? "new-password" : "current-password"
                            }
                            autoFocus
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200
                         text-center text-2xl tracking-[0.5em] font-mono
                         focus:outline-none focus:ring-2 focus:ring-brand-400
                         focus:border-transparent"
                        />
                    </div>

                    {isCreate && (
                        <div className="mb-4">
                            <label
                                className="block text-sm font-medium text-slate-700 mb-1"
                                htmlFor="pin-confirm"
                            >
                                Confirmation
                            </label>
                            <input
                                id="pin-confirm"
                                type="password"
                                inputMode="numeric"
                                maxLength={4}
                                value={confirm}
                                onChange={(e) =>
                                    setConfirm(
                                        e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 4)
                                    )
                                }
                                autoComplete="new-password"
                                placeholder="• • • •"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200
                           text-center text-2xl tracking-[0.5em] font-mono
                           focus:outline-none focus:ring-2 focus:ring-brand-400
                           focus:border-transparent"
                            />
                        </div>
                    )}

                    {/* Message d'erreur */}
                    {erreur && (
                        <p
                            className="mb-4 text-sm text-danger-600 text-center"
                            role="alert"
                        >
                            {erreur}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600
                       text-white font-semibold text-sm transition-colors cursor-pointer
                       disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {pending
                            ? "Vérification…"
                            : isCreate
                              ? "Créer le code"
                              : "Accéder"}
                    </button>
                </form>
            </div>
        </div>
    );
}

PinGate.propTypes = {
    mode: PropTypes.oneOf(["create", "verify"]).isRequired,
    onSuccess: PropTypes.func.isRequired,
};

export default PinGate;
