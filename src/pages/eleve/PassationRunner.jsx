import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";
import { getExercice } from "@/data/index";
import { getInitialValue } from "@/utils/initialValues";
import ExerciceRenderer from "@/components/exercices/ExerciceRenderer";

/**
 * Calcule récursivement si un nœud (exercice ou sous-question) nécessite
 * une relecture par l'enseignant.
 *
 * @param {object} node
 * @returns {boolean}
 */
function computeARelire(node) {
    if (node.aRelire === true) return true;
    if (node.sousQuestions)
        return node.sousQuestions.some((sq) => computeARelire(sq));
    return false;
}

/**
 * PassationRunner
 *
 * Orchestrateur séquentiel de la passation élève (SRS F-PAS-01 à F-PAS-08).
 *
 * Responsabilités :
 * - Trouver ou créer la passation dans AppContext.
 * - Présenter les exercices un par un dans l'ordre de session.exercices_selectionnes.
 * - Navigation unidirectionnelle uniquement (pas de retour arrière).
 * - Mesurer le temps passé sur chaque exercice.
 * - Sauvegarder chaque réponse via SAVE_REPONSE immédiatement après validation.
 * - Afficher une barre de progression sans score.
 * - Alerter en cas de tentative de rechargement / fermeture.
 * - Appeler onTermine() quand tous les exercices sont soumis.
 *
 * Aucun retour de justesse n'est fourni à l'élève (SRS F-PAS-05).
 *
 * @param {object}   props
 * @param {object}   props.session    - Session active (statut 'en_cours').
 * @param {string}   props.eleveId    - Identifiant de l'élève.
 * @param {function} props.onTermine  - Appelé quand la passation est terminée.
 */
function PassationRunner({ session, eleveId, onTermine }) {
    const { state, dispatch } = useAppContext();

    const [passationId, setPassationId] = useState(null);
    const [valeurCourante, setValeurCourante] = useState(null);

    const debutTempsRef = useRef(Date.now());
    const termineRef = useRef(false);

    // ── Trouver ou créer la passation ────────────────────────────────────────
    useEffect(() => {
        const existante = state.passations.find(
            (p) =>
                p.session_id === session.id &&
                p.eleve_id === eleveId &&
                p.statut === "en_cours"
        );
        if (existante) {
            setPassationId(existante.id);
        } else {
            const id = crypto.randomUUID();
            dispatch({
                type: "CREATE_PASSATION",
                payload: {
                    id,
                    session_id: session.id,
                    eleve_id: eleveId,
                    statut: "en_cours",
                    date_debut: new Date().toISOString(),
                    date_fin: null,
                    reponses: [],
                },
            });
            setPassationId(id);
        }
    }, [session.id, eleveId]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Garde navigation (SRS F-PAS-08) ─────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, []);

    // ── État dérivé ───────────────────────────────────────────────────────────
    const passation =
        state.passations.find((p) => p.id === passationId) ?? null;
    const exerciceIndex = passation?.reponses.length ?? 0;
    const numeros = session.exercices_selectionnes;
    const currentNumero = numeros[exerciceIndex];
    const exercice = currentNumero
        ? getExercice(session.niveau, currentNumero)
        : null;
    const total = numeros.length;

    // ── Initialiser la valeur courante quand l'exercice change ───────────────
    useEffect(() => {
        if (!exercice) return;
        setValeurCourante(getInitialValue(exercice));
        debutTempsRef.current = Date.now();
    }, [exercice?.numero]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Détecter la fin de passation ─────────────────────────────────────────
    useEffect(() => {
        if (!passation || termineRef.current) return;
        if (exerciceIndex >= total) {
            termineRef.current = true;
            dispatch({
                type: "FINISH_PASSATION",
                payload: {
                    id: passationId,
                    date_fin: new Date().toISOString(),
                },
            });
            onTermine();
        }
    }, [exerciceIndex, total, passation]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Valider et passer à l'exercice suivant ───────────────────────────────
    function handleValider() {
        if (!passationId || !exercice) return;
        const reponse = {
            exercice_numero: currentNumero,
            type: exercice.type,
            valeur_brute: valeurCourante,
            biais_auto: [], // calculé en S13
            biais_manuel: null,
            duree_ms: Date.now() - debutTempsRef.current,
            a_relire: computeARelire(exercice),
        };
        dispatch({
            type: "SAVE_REPONSE",
            payload: { passation_id: passationId, reponse },
        });
    }

    // ── Rendu ─────────────────────────────────────────────────────────────────

    // Passation pas encore créée dans le state
    if (!passationId || !passation) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-400 text-base">Préparation…</p>
            </div>
        );
    }

    // Fin en cours de traitement
    if (exerciceIndex >= total || !exercice) return null;

    // Progression (SRS F-PAS-06)
    const progression = (exerciceIndex / total) * 100;

    return (
        <div className="min-h-screen flex flex-col">
            {/* ── Barre de progression ──────────────────────────────────────── */}
            <div
                className="w-full bg-slate-100 h-1.5"
                role="progressbar"
                aria-valuenow={exerciceIndex + 1}
                aria-valuemin={1}
                aria-valuemax={total}
            >
                <div
                    className="h-1.5 bg-brand-500 transition-all duration-300"
                    style={{ width: `${progression}%` }}
                />
            </div>

            {/* ── Compteur ──────────────────────────────────────────────────── */}
            <div className="flex justify-end px-4 pt-2 pb-0">
                <span className="text-xs text-slate-400 font-mono">
                    {exerciceIndex + 1} / {total}
                </span>
            </div>

            {/* ── Corps de l'exercice ───────────────────────────────────────── */}
            <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
                {/* Consigne principale (SRS NF-UX-01 : ≥ 18 px) */}
                {exercice.consigne && (
                    <p className="text-lg text-slate-800 leading-relaxed">
                        {exercice.consigne}
                    </p>
                )}

                {/* Composant de réponse */}
                <div className="flex flex-col gap-4">
                    <ExerciceRenderer
                        exercice={exercice}
                        niveau={session.niveau}
                        value={valeurCourante}
                        onChange={setValeurCourante}
                    />
                </div>
            </div>

            {/* ── Bouton de validation ──────────────────────────────────────── */}
            <div className="w-full max-w-2xl mx-auto px-4 py-6">
                <button
                    onClick={handleValider}
                    className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600
                     text-white text-lg font-semibold transition-colors cursor-pointer"
                >
                    {exerciceIndex + 1 < total ? "Valider →" : "Terminer"}
                </button>
            </div>
        </div>
    );
}

PassationRunner.propTypes = {
    session: PropTypes.object.isRequired,
    eleveId: PropTypes.string.isRequired,
    onTermine: PropTypes.func.isRequired,
};

export default PassationRunner;
