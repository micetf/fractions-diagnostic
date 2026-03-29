import { useState } from "react";
import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";
import { getBiais } from "@fractions-diagnostic/data/biais";
import { getExercice } from "@fractions-diagnostic/data";
import { scoreReponse, SCORE } from "@/utils/analyseSession";
import { BIAIS } from "@fractions-diagnostic/data/biais";

/**
 * ProfilEleve
 *
 * Profil individuel d'un élève pour une session (SRS F-ANA-07, F-ANA-08).
 *
 * @param {object}   props
 * @param {object}   props.session
 * @param {object}   props.eleve
 * @param {function} props.onRetour
 */
function ProfilEleve({ session, eleve, onRetour }) {
    const { state, dispatch } = useAppContext();

    const passation =
        state.passations.find(
            (p) =>
                p.diagnostic_id === session.id &&
                p.eleve_id === eleve.id &&
                p.statut === "terminee"
        ) ?? null;

    const [note, setNote] = useState(passation?.note_enseignant ?? "");
    const [noteSauvee, setNoteSauvee] = useState(true);

    function handleNoteChange(v) {
        setNote(v);
        setNoteSauvee(false);
    }

    function handleSauveNote() {
        if (!passation) return;
        dispatch({
            type: "UPDATE_NOTE_ELEVE",
            payload: { passation_id: passation.id, note },
        });
        setNoteSauvee(true);
    }

    function formaterDuree(ms) {
        if (!ms) return "—";
        return ms < 60000
            ? `${Math.round(ms / 1000)} s`
            : `${Math.round(ms / 60000)} min`;
    }

    return (
        <div>
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                        {eleve.prenom}
                        {eleve.nom ? ` ${eleve.nom}` : ""}
                    </h2>
                    <p className="text-sm text-slate-400">
                        {session.niveau} —{" "}
                        {session.exercices_selectionnes.length} exercices
                    </p>
                </div>
                <button
                    onClick={onRetour}
                    className="text-sm text-slate-400 hover:text-brand-600
                     transition-colors cursor-pointer"
                >
                    ← Retour
                </button>
            </div>

            {!passation ? (
                <p className="text-sm text-slate-400 text-center py-8">
                    Cet élève n'a pas encore passé cette session.
                </p>
            ) : (
                <div className="flex flex-col gap-4">
                    {/* Exercices */}
                    {session.exercices_selectionnes.map((numero) => {
                        const reponse = passation.reponses.find(
                            (r) => r.exercice_numero === numero
                        );
                        const exercice = getExercice(session.niveau, numero);
                        const etat = scoreReponse(reponse);
                        const biais = [
                            ...(reponse?.biais_auto ?? []),
                            ...(reponse?.biais_manuel ?? []),
                        ];

                        const STYLE = {
                            [SCORE.REUSSI]: "border-success-200 bg-success-50",
                            [SCORE.BIAIS]: "border-danger-200  bg-danger-50",
                            [SCORE.ECHEC]: "border-orange-200  bg-orange-50",
                            [SCORE.A_VALIDER]:
                                "border-review-200  bg-review-50",
                            [SCORE.NON_FAIT]: "border-slate-200   bg-white",
                        };

                        return (
                            <div
                                key={numero}
                                className={`rounded-xl border p-4 ${STYLE[etat]}`}
                            >
                                <div className="flex items-start justify-between gap-3 mb-1">
                                    <p className="font-medium text-sm text-slate-800">
                                        Ex.{numero}
                                        {exercice ? (
                                            <span className="font-normal text-slate-500">
                                                {" "}
                                                — {exercice.competence}
                                            </span>
                                        ) : null}
                                    </p>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {reponse && (
                                            <span className="text-xs text-slate-400">
                                                {formaterDuree(
                                                    reponse.duree_ms
                                                )}
                                            </span>
                                        )}
                                        <EtatBadge etat={etat} />
                                    </div>
                                </div>

                                {/* Biais détectés */}
                                {biais.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {biais.map((code) => (
                                            <span
                                                key={code}
                                                className="text-xs px-2 py-0.5 rounded-full
                                       bg-danger-100 text-danger-700"
                                            >
                                                {getBiais(code)?.intitule ??
                                                    code}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {reponse?.a_relire && biais.length === 0 && (
                                    <p className="text-xs text-review-600 mt-1">
                                        À relire manuellement
                                    </p>
                                )}
                            </div>
                        );
                    })}

                    {/* Note enseignant (SRS F-ANA-08) */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-sm font-semibold text-slate-700 mb-2">
                            Notes de l'enseignant
                        </p>
                        <textarea
                            value={note}
                            onChange={(e) => handleNoteChange(e.target.value)}
                            rows={3}
                            placeholder="Observations post-passation, entretien oral…"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200
                         text-sm text-slate-700 resize-y
                         focus:outline-none focus:ring-2 focus:ring-brand-400
                         focus:border-transparent"
                        />
                        <div className="flex items-center justify-between mt-2">
                            <span
                                className={`text-xs ${noteSauvee ? "text-slate-400" : "text-review-600"}`}
                            >
                                {noteSauvee
                                    ? "Note enregistrée"
                                    : "Modifications non sauvegardées"}
                            </span>
                            <button
                                onClick={handleSauveNote}
                                disabled={noteSauvee}
                                className="px-4 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600
                           text-white text-xs font-medium transition-colors
                           cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

ProfilEleve.propTypes = {
    session: PropTypes.object.isRequired,
    eleve: PropTypes.object.isRequired,
    onRetour: PropTypes.func.isRequired,
};

/* ── EtatBadge ───────────────────────────────────────────────────────────────── */

function EtatBadge({ etat }) {
    const LABEL = {
        [SCORE.REUSSI]: { text: "Réussi", cls: "text-success-700" },
        [SCORE.BIAIS]: { text: "Biais", cls: "text-danger-700" },
        [SCORE.ECHEC]: { text: "Échec", cls: "text-orange-700" },
        [SCORE.A_VALIDER]: { text: "À valider", cls: "text-review-700" },
        [SCORE.NON_FAIT]: { text: "Non fait", cls: "text-slate-400" },
    };
    const { text, cls } = LABEL[etat] ?? LABEL[ETATS.NON_FAIT];
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
            {text}
        </span>
    );
}

EtatBadge.propTypes = { etat: PropTypes.string.isRequired };

export default ProfilEleve;
