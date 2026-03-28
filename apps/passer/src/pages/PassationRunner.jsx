/**
 * @fileoverview PassationRunner — orchestrateur séquentiel de la passation.
 *
 * Responsabilités :
 *   - Trouver ou créer la passation dans PasserContext.
 *   - Afficher les exercices un par un (SRS F-PAS-09).
 *   - Mesurer la durée de chaque exercice (SRS F-PAS-14).
 *   - Enregistrer les réponses via SAVE_REPONSE.
 *   - Alerter en cas de fermeture pendant la passation (SRS F-PAS-15).
 *   - Appeler onTermine() après le dernier exercice.
 *
 * Aucun retour de justesse n'est donné à l'élève (SRS F-PAS-10).
 *
 * @module pages/PassationRunner
 */
import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { usePasserContext } from "@/context/PasserContext";
import { getExercice } from "@fractions-diagnostic/data";
import { getInitialValue } from "@fractions-diagnostic/engine/initialValues";
import { detecterBiais } from "@fractions-diagnostic/engine/biaisDetector";
import ExerciceRenderer from "@/components/exercices/ExerciceRenderer";

/**
 * @param {object}   props
 * @param {string}   props.eleveId   - Id de l'élève qui passe.
 * @param {function} props.onTermine - Appelé quand la passation est terminée.
 */
function PassationRunner({ eleveId, onTermine }) {
    const { state, dispatch } = usePasserContext();
    const { diagnostic, passations } = state;

    const newIdRef = useRef(crypto.randomUUID());
    const debutExerciceRef = useRef(Date.now());

    // ── Trouver ou créer la passation ─────────────────────────────────────
    const passationExistante = passations.find(
        (p) =>
            p.diagnostic_id === diagnostic.diagnostic_id &&
            p.eleve_id === eleveId
    );

    useEffect(() => {
        if (!passationExistante) {
            dispatch({
                type: "CREATE_PASSATION",
                payload: {
                    id: newIdRef.current,
                    diagnostic_id: diagnostic.diagnostic_id,
                    eleve_id: eleveId,
                    statut: "en_cours",
                    date_debut: new Date().toISOString(),
                    date_fin: null,
                    note_enseignant: "",
                    reponses: [],
                },
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const passationId = passationExistante?.id ?? newIdRef.current;
    const passation = passations.find((p) => p.id === passationId);
    const reponsesDejaSoumises = passation?.reponses ?? [];

    // ── Exercice courant ──────────────────────────────────────────────────
    const numeros = diagnostic.exercices_selectionnes;
    const indexCourant = reponsesDejaSoumises.length;

    // Passation déjà terminée (reprise)
    useEffect(() => {
        if (passationExistante?.statut === "terminee") {
            onTermine(passationId);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const numeroCourant = numeros[indexCourant];
    const exercice = numeroCourant
        ? getExercice(diagnostic.niveau, numeroCourant)
        : null;

    const [valeur, setValeur] = useState(() =>
        exercice ? getInitialValue(exercice) : null
    );

    // Réinitialiser la valeur à chaque nouvel exercice
    useEffect(() => {
        if (exercice) {
            setValeur(getInitialValue(exercice));
            debutExerciceRef.current = Date.now();
        }
    }, [numeroCourant]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Alerte fermeture ──────────────────────────────────────────────────
    useEffect(() => {
        function handleBeforeUnload(e) {
            e.preventDefault();
            e.returnValue = "";
        }
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, []);

    // ── Validation d'un exercice ──────────────────────────────────────────
    const handleValider = useCallback(() => {
        if (!exercice) return;

        const dureeMs = Date.now() - debutExerciceRef.current;
        const biaisAuto = detecterBiais(exercice, valeur);

        function computeARelire(node) {
            if (node.aRelire === true) return true;
            if (node.sousQuestions)
                return node.sousQuestions.some((sq) => computeARelire(sq));
            return false;
        }

        const reponse = {
            exercice_numero: numeroCourant,
            type: exercice.type,
            valeur_brute: valeur,
            biais_auto: biaisAuto,
            biais_manuel: null,
            duree_ms: dureeMs,
            a_relire: computeARelire(exercice),
        };

        dispatch({
            type: "SAVE_REPONSE",
            payload: { passation_id: passationId, reponse },
        });

        // Dernier exercice ?
        if (indexCourant + 1 >= numeros.length) {
            const dateFin = new Date().toISOString();
            dispatch({
                type: "FINISH_PASSATION",
                payload: { id: passationId, date_fin: dateFin },
            });
            onTermine(passationId);
        }
    }, [exercice, valeur, numeroCourant, indexCourant, numeros, passationId, dispatch, onTermine]);

    // ── Rendu ─────────────────────────────────────────────────────────────
    if (!exercice) return null;

    const eleve = diagnostic.eleves.find((e) => e.id === eleveId);
    const total = numeros.length;
    const position = indexCourant + 1;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Barre de progression — points ●●●○○○ (SRS F-PAS-11) */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 shrink-0">
                <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-600">
                        {eleve?.prenom}
                    </span>
                    <div
                        className="flex gap-2"
                        role="progressbar"
                        aria-valuenow={position}
                        aria-valuemin={1}
                        aria-valuemax={total}
                        aria-label={`Exercice ${position} sur ${total}`}
                    >
                        {Array.from({ length: total }).map((_, i) => (
                            <div
                                key={i}
                                className={[
                                    "w-3 h-3 rounded-full transition-colors",
                                    i < position
                                        ? "bg-brand-500"
                                        : "bg-slate-200",
                                ].join(" ")}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-slate-400 tabular-nums">
                        {position} / {total}
                    </span>
                </div>
            </div>

            {/* Exercice */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <ExerciceRenderer
                        exercice={exercice}
                        niveau={diagnostic.niveau}
                        value={valeur}
                        onChange={setValeur}
                    />
                </div>
            </div>

            {/* Bouton Valider */}
            <div className="bg-white border-t border-slate-200 px-4 py-4 shrink-0">
                <div className="max-w-2xl mx-auto">
                    <button
                        type="button"
                        onClick={handleValider}
                        className="w-full py-4 rounded-2xl bg-brand-600 text-white
                                   text-lg font-bold hover:bg-brand-700 active:bg-brand-800
                                   transition-colors touch-manipulation"
                    >
                        Valider →
                    </button>
                </div>
            </div>
        </div>
    );
}

PassationRunner.propTypes = {
    eleveId:   PropTypes.string.isRequired,
    onTermine: PropTypes.func.isRequired,
};

export default PassationRunner;
