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
 * Orchestrateur du mode élève. Quatre états possibles :
 *   1. Pas de session active → écran d'attente
 *   2. Session active, élève non sélectionné → ChoixEleve
 *   3. Élève sélectionné, passation non terminée → PassationRunner
 *   4. Passation terminée → FinPassation
 *   + PinGate en superposition si l'élève appelle l'enseignant
 *
 * @param {object}      props
 * @param {string|null} props.sessionActiveId  - Id de la session en cours.
 * @param {function}    props.onCallTeacher     - Succès PIN → retour enseignant.
 */
function AccueilEleve({ sessionActiveId = null, onCallTeacher }) {
    const { state } = useAppContext();

    const [eleveId, setEleveId] = useState(null);
    const [termine, setTermine] = useState(false);
    const [showPin, setShowPin] = useState(false);

    const session =
        state.sessions.find(
            (s) => s.id === sessionActiveId && s.statut === "en_cours"
        ) ?? null;

    // ── PinGate retour enseignant ───────────────────────────────────────────
    if (showPin) {
        return <PinGate mode="verify" onSuccess={onCallTeacher} />;
    }

    // ── Pas de session active ───────────────────────────────────────────────
    if (!session) {
        return (
            <div
                className="min-h-[calc(100vh-88px)] flex flex-col items-center
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
                    Appelle ton enseignant(e)
                </button>
            </div>
        );
    }

    // ── Passation terminée ──────────────────────────────────────────────────
    if (termine) {
        return <FinPassation onAppelerEnseignant={() => setShowPin(true)} />;
    }

    // ── Élève non sélectionné ───────────────────────────────────────────────
    if (!eleveId) {
        return <ChoixEleve session={session} onChoix={setEleveId} />;
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
    onCallTeacher: PropTypes.func.isRequired,
};

export default AccueilEleve;
