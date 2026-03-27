/**
 * @file AccueilEleve.jsx — orchestrateur du mode élève.
 *
 * @description
 * Gère les sous-états du mode élève :
 *   1. Session active   → ChoixEleve (sélection du prénom)
 *   2. Élève sélectionné → PassationRunner (exercices)
 *   3. Passation terminée → FinPassation (écran de fin)
 *
 * Changements Sprint 2 :
 *   - Suppression de `showPin` state et du PinGate embarqué.
 *   - `onCallTeacherSuccess` remplacé par `onRetourEnseignant`.
 *     Les boutons "Retour mode enseignant" (ChoixEleve, FinPassation,
 *     écran "pas de session") appellent directement ce callback,
 *     qui déclenche TeacherConfirmOverlay dans App.jsx.
 *
 * L'overlay de confirmation est entièrement géré par App.jsx.
 * AccueilEleve reste sans connaissance du mécanisme d'accès enseignant.
 *
 * @module pages/eleve/AccueilEleve
 */

import { useState } from "react";
import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";
import ChoixEleve from "./ChoixEleve";
import FinPassation from "./FinPassation";
import PassationRunner from "./PassationRunner";

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Orchestrateur du mode élève.
 *
 * @param {object}      props
 * @param {string|null} props.sessionActiveId    - ID de la session en cours.
 * @param {function}    props.onRetourEnseignant - Déclenche TeacherConfirmOverlay
 *   dans App.jsx. Appelé depuis les boutons "Retour mode enseignant" de
 *   ChoixEleve, FinPassation et l'écran "pas de session".
 */
function AccueilEleve({ sessionActiveId = null, onRetourEnseignant }) {
    const { state } = useAppContext();

    const [eleveId, setEleveId] = useState(null);
    const [termine, setTermine] = useState(false);

    const session =
        state.sessions.find(
            (s) => s.id === sessionActiveId && s.statut === "en_cours"
        ) ?? null;

    /** Réinitialise pour l'élève suivant sans quitter le mode élève. */
    function handleSuivant() {
        setEleveId(null);
        setTermine(false);
    }

    // ── Pas de session active ─────────────────────────────────────────────
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

                {/* Accès enseignant — discret, toujours accessible */}
                <button
                    type="button"
                    onClick={onRetourEnseignant}
                    className="text-sm text-slate-400 hover:text-slate-600
                               underline underline-offset-2 transition-colors
                               cursor-pointer"
                >
                    Retour mode enseignant
                </button>
            </div>
        );
    }

    // ── Passation terminée ────────────────────────────────────────────────
    if (termine) {
        return (
            <FinPassation
                onSuivant={handleSuivant}
                onAppelerEnseignant={onRetourEnseignant}
            />
        );
    }

    // ── Élève non sélectionné → sélecteur ────────────────────────────────
    if (!eleveId) {
        return (
            <ChoixEleve
                session={session}
                onChoix={setEleveId}
                onRetourEnseignant={onRetourEnseignant}
            />
        );
    }

    // ── Passation en cours ────────────────────────────────────────────────
    return (
        <PassationRunner
            session={session}
            eleveId={eleveId}
            onTermine={() => setTermine(true)}
        />
    );
}

AccueilEleve.propTypes = {
    /** ID de la session en cours (null si aucune session active). */
    sessionActiveId: PropTypes.string,
    /**
     * Déclenche l'overlay de confirmation dans App.jsx.
     * Appelé par les boutons "Retour mode enseignant" des sous-écrans.
     */
    onRetourEnseignant: PropTypes.func.isRequired,
};

export default AccueilEleve;
