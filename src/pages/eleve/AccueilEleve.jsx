import { useState } from "react";
import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";
import PinGate from "@/components/common/PinGate";
import PassationRunner from "./PassationRunner";

/**
 * AccueilEleve
 *
 * Point d'entrée du mode élève.
 *
 * Sprint 11 : sélecteur d'élève inline + PassationRunner.
 * Sprint 12 : ChoixEleve et FinPassation remplacent les parties inline.
 *
 * Flux :
 *   1. Pas de session active → écran d'attente
 *   2. Session active, élève non sélectionné → sélecteur de prénom
 *   3. Élève sélectionné → PassationRunner
 *   4. Passation terminée → écran de fin neutre (SRS F-PAS-09, F-PAS-10)
 *
 * @param {object}   props
 * @param {string|null} props.sessionActiveId - Id de la session en cours.
 * @param {function} props.onCallTeacher       - Succès du PIN → retour enseignant.
 */
function AccueilEleve({ sessionActiveId, onCallTeacher }) {
    const { state } = useAppContext();

    const [eleveId, setEleveId] = useState(null);
    const [termine, setTermine] = useState(false);
    const [showPin, setShowPin] = useState(false);

    const session =
        state.sessions.find(
            (s) => s.id === sessionActiveId && s.statut === "en_cours"
        ) ?? null;
    const classe = session
        ? (state.classes.find((c) => c.id === session.classe_id) ?? null)
        : null;

    // ── PinGate retour enseignant ─────────────────────────────────────────────
    if (showPin) {
        return <PinGate mode="verify" onSuccess={onCallTeacher} />;
    }

    // ── Pas de session active ─────────────────────────────────────────────────
    if (!session || !classe) {
        return (
            <div
                className="min-h-[calc(100vh-88px)] flex flex-col items-center
                      justify-center px-4 py-10 gap-8"
            >
                <div
                    className="w-full max-w-sm bg-white rounded-2xl shadow-sm
                        border border-brand-100 p-8 flex flex-col items-center
                        gap-6 text-center"
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

    // ── Passation terminée (SRS F-PAS-09, F-PAS-10) ──────────────────────────
    if (termine) {
        return (
            <div
                className="min-h-[calc(100vh-88px)] flex flex-col items-center
                      justify-center px-4 py-10 gap-8"
            >
                <div
                    className="w-full max-w-sm bg-white rounded-2xl shadow-sm
                        border border-success-100 p-8 flex flex-col items-center
                        gap-6 text-center"
                >
                    <div
                        className="w-20 h-20 rounded-full bg-success-100 flex items-center
                          justify-center font-display font-bold text-4xl
                          text-success-700 select-none"
                        aria-hidden="true"
                    >
                        ✓
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-2xl text-slate-800">
                            C'est terminé !
                        </h1>
                        <p className="mt-2 text-base text-slate-500">
                            Merci d'avoir répondu à tous les exercices.
                        </p>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-sm text-slate-400 mb-3">
                        Tu as terminé ?
                    </p>
                    <button
                        onClick={() => setShowPin(true)}
                        className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600
                       text-white text-sm font-semibold transition-colors cursor-pointer"
                    >
                        Appelle ton enseignant(e)
                    </button>
                </div>
            </div>
        );
    }

    // ── Sélection de l'élève ──────────────────────────────────────────────────
    if (!eleveId) {
        const elevesDisponibles = classe.eleves.filter((el) => {
            // Masquer les élèves ayant déjà une passation terminée pour cette session
            const dejaTermine = state.passations.some(
                (p) =>
                    p.session_id === session.id &&
                    p.eleve_id === el.id &&
                    p.statut === "terminee"
            );
            return !dejaTermine;
        });

        return (
            <div
                className="min-h-[calc(100vh-88px)] flex flex-col items-center
                      justify-center px-4 py-10"
            >
                <div
                    className="w-full max-w-sm bg-white rounded-2xl shadow-sm
                        border border-brand-100 p-8"
                >
                    <h1
                        className="font-display font-bold text-2xl text-slate-800
                         text-center mb-6"
                    >
                        Qui es-tu ?
                    </h1>

                    {elevesDisponibles.length === 0 ? (
                        <p className="text-center text-sm text-slate-400">
                            Tous les élèves ont déjà passé cette session.
                        </p>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {[...elevesDisponibles]
                                .sort((a, b) =>
                                    a.prenom.localeCompare(b.prenom, "fr")
                                )
                                .map((el) => (
                                    <li key={el.id}>
                                        <button
                                            onClick={() => setEleveId(el.id)}
                                            className="w-full py-3 px-5 rounded-xl border border-slate-200
                                 hover:bg-brand-50 hover:border-brand-300
                                 text-slate-800 text-base font-medium text-left
                                 transition-colors cursor-pointer"
                                        >
                                            {el.prenom}
                                            {el.nom ? (
                                                <span className="text-slate-400 font-normal">
                                                    {" "}
                                                    {el.nom}
                                                </span>
                                            ) : null}
                                        </button>
                                    </li>
                                ))}
                        </ul>
                    )}
                </div>
            </div>
        );
    }

    // ── Passation en cours ────────────────────────────────────────────────────
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

AccueilEleve.defaultProps = {
    sessionActiveId: null,
};

export default AccueilEleve;
