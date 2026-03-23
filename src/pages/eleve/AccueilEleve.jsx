import { useState } from "react";
import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";
import PinGate from "@/components/common/PinGate";
import ChoixEleve from "./ChoixEleve";
import FinPassation from "./FinPassation";
import PassationRunner from "./PassationRunner";

/**
 * AccueilEleve
 *
 * Orchestrateur du mode élève.
 *
 * Flux normal :
 *   1. Session active → ChoixEleve
 *   2. Élève sélectionné → PassationRunner
 *   3. Passation terminée → FinPassation
 *      ├─ "Élève suivant"          → retour ChoixEleve (sans PIN)
 *      └─ "Retour mode enseignant" → PinGate → onSuccess → onCallTeacherSuccess
 *
 * @param {object}      props
 * @param {string|null} props.sessionActiveId
 * @param {function}    props.onCallTeacherSuccess - Appelé après succès du PIN.
 */
function AccueilEleve({ sessionActiveId = null, onCallTeacherSuccess }) {
    const { state } = useAppContext();

    const [eleveId, setEleveId] = useState(null);
    const [termine, setTermine] = useState(false);
    const [showPin, setShowPin] = useState(false);

    const session =
        state.sessions.find(
            (s) => s.id === sessionActiveId && s.statut === "en_cours"
        ) ?? null;

    function handleSuivant() {
        setEleveId(null);
        setTermine(false);
    }

    // ── PinGate retour enseignant ───────────────────────────────────────────
    if (showPin) {
        return <PinGate mode="verify" onSuccess={onCallTeacherSuccess} />;
    }

    // ── Pas de session active ───────────────────────────────────────────────
    if (!session) {
        return (
            <div
                className="min-h-[calc(100vh-56px)] flex flex-col items-center
                      justify-center px-4 py-10 gap-8"
            >
                <div
                    className="w-full max-w-sm bg-white rounded-2xl shadow-sm
                        border border-brand-100 p-8 flex flex-col
                        items-center gap-6 text-center"
                >
                    <div
                        className="w-20 h-20 rounded-full bg-brand-100 flex items-center
                       justify-center font-display font-bold text-4xl
                       text-brand-600 select-none"
                        aria-hidden="true"
                    >
                        ½
                    </div>

                    <div>
                        <h1 className="font-display font-bold text-2xl text-slate-800">
                            Exercices sur les fractions
                        </h1>
                        <p className="mt-2 text-base text-slate-500">
                            Ton enseignant(e) va préparer les exercices pour
                            toi.
                        </p>
                    </div>

                    <button
                        disabled
                        className="w-full py-3 rounded-xl text-base font-semibold
                       bg-brand-200 text-brand-400 cursor-not-allowed"
                    >
                        En attente de la session…
                    </button>
                </div>

                <button
                    onClick={() => setShowPin(true)}
                    className="text-sm text-slate-400 hover:text-slate-600
                     underline underline-offset-2 transition-colors cursor-pointer"
                >
                    Retour mode enseignant
                </button>
            </div>
        );
    }

    // ── Passation terminée ──────────────────────────────────────────────────
    if (termine) {
        return (
            <FinPassation
                onSuivant={handleSuivant}
                onAppelerEnseignant={() => setShowPin(true)}
            />
        );
    }

    // ── Élève non sélectionné → sélecteur ──────────────────────────────────
    if (!eleveId) {
        return (
            <ChoixEleve
                session={session}
                onChoix={setEleveId}
                onRetourEnseignant={() => setShowPin(true)}
            />
        );
    }

    // ── Passation en cours ──────────────────────────────────────────────────
    return (
        <PassationRunner
            session={session}
            eleveId={eleveId}
            onTermine={() => setTermine(true)}
        />
    );
}

AccueilEleve.propTypes = {
    sessionActiveId: PropTypes.string,
    onCallTeacherSuccess: PropTypes.func.isRequired,
};

export default AccueilEleve;
