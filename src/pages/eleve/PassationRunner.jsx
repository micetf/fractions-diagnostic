import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";
import { getExercice } from "@/data/index";
import { getInitialValue } from "@/utils/initialValues";
import ExerciceRenderer from "@/components/exercices/ExerciceRenderer";
import { useBiaisDetector } from "@/hooks/useBiaisDetector";

/**
 * Calcule récursivement si un nœud requiert une relecture enseignant.
 * @param {object} node
 * @returns {boolean}
 */
function computeARelire(node) {
    if (node.aRelire === true) return true;
    if (node.sousQuestions)
        return node.sousQuestions.some((sq) => computeARelire(sq));
    return false;
}

// ─── PassationRunner ──────────────────────────────────────────────────────────

/**
 * PassationRunner
 *
 * Orchestrateur séquentiel de la passation élève (SRS F-PAS-01 à F-PAS-08).
 *
 * Responsabilités :
 * - Trouver ou créer la passation dans AppContext (une seule fois au montage).
 * - Calculer l'exercice courant depuis passation.reponses.length.
 * - Afficher la barre de progression sans score (SRS F-PAS-06).
 * - Alerter en cas de rechargement/fermeture (SRS F-PAS-08).
 * - Déléguer l'affichage et la saisie à ExerciceStep (keyed).
 * - Dispatcher SAVE_REPONSE à chaque validation.
 * - Dispatcher FINISH_PASSATION et appeler onTermine() à la fin.
 *
 * Aucun setState n'est appelé dans les effets.
 * La mesure du temps est déléguée à ExerciceStep.
 *
 * @param {object}   props
 * @param {object}   props.session    - Session active.
 * @param {string}   props.eleveId    - Identifiant de l'élève.
 * @param {function} props.onTermine  - Appelé quand la passation est terminée.
 */
function PassationRunner({ session, eleveId, onTermine }) {
    const { state, dispatch } = useAppContext();
    const { detecter } = useBiaisDetector();

    // ID stable pour la passation à créer.
    // Initialisé une seule fois via un test sur la valeur courante (pas d'impure call).
    const newIdRef = useRef(null);
    const termineRef = useRef(false);

    if (newIdRef.current === null) {
        newIdRef.current = crypto.randomUUID();
    }

    // ── Créer la passation si inexistante (une seule fois au montage) ─────────
    // Pas de setState ici — uniquement un dispatch externe (SRS §6.2).
    useEffect(() => {
        const existe = state.passations.find(
            (p) =>
                p.session_id === session.id &&
                p.eleve_id === eleveId &&
                p.statut === "en_cours"
        );
        if (!existe) {
            dispatch({
                type: "CREATE_PASSATION",
                payload: {
                    id: newIdRef.current,
                    session_id: session.id,
                    eleve_id: eleveId,
                    statut: "en_cours",
                    date_debut: new Date().toISOString(),
                    date_fin: null,
                    reponses: [],
                },
            });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // Intentionnellement vide : ne doit s'exécuter qu'une fois au montage.

    // ── Garde navigation (SRS F-PAS-08) ──────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, []);

    // ── État dérivé — aucun useState pour ces valeurs ─────────────────────────
    const passation =
        state.passations.find(
            (p) => p.session_id === session.id && p.eleve_id === eleveId
        ) ?? null;

    const exerciceIndex = passation?.reponses.length ?? 0;
    const numeros = session.exercices_selectionnes;
    const currentNumero = numeros[exerciceIndex];
    const exercice = currentNumero
        ? getExercice(session.niveau, currentNumero)
        : null;
    const total = numeros.length;
    const progression = (exerciceIndex / total) * 100;

    // ── Fin de passation ──────────────────────────────────────────────────────
    // Pas de setState dans cet effet — uniquement dispatch + callback prop.
    useEffect(() => {
        if (!passation || termineRef.current) return;
        if (exerciceIndex < total) return;
        termineRef.current = true;
        dispatch({
            type: "FINISH_PASSATION",
            payload: { id: passation.id, date_fin: new Date().toISOString() },
        });
        onTermine();
    }, [exerciceIndex, total, passation, dispatch, onTermine]);

    // ── Callback de validation — reçoit la valeur et la durée de ExerciceStep ─
    function handleValider(valeurCourante, dureeMs) {
        if (!passation || !exercice) return;
        dispatch({
            type: "SAVE_REPONSE",
            payload: {
                passation_id: passation.id,
                reponse: {
                    exercice_numero: currentNumero,
                    type: exercice.type,
                    valeur_brute: valeurCourante,
                    biais_auto: detecter(exercice, valeurCourante),
                    biais_manuel: null,
                    duree_ms: dureeMs,
                    a_relire: computeARelire(exercice),
                },
            },
        });
    }

    // ── Rendu ─────────────────────────────────────────────────────────────────

    if (!passation) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-400 text-base">Préparation…</p>
            </div>
        );
    }

    if (exerciceIndex >= total || !exercice) return null;

    return (
        <div className="min-h-screen flex flex-col">
            {/* Barre de progression (SRS F-PAS-06) */}
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

            <div className="flex justify-end px-4 pt-2 pb-0">
                <span className="text-xs text-slate-400 font-mono">
                    {exerciceIndex + 1} / {total}
                </span>
            </div>

            {/*
        ExerciceStep reçoit une key basée sur le numéro d'exercice courant.
        React démonte et remonte le composant à chaque nouvel exercice,
        ce qui reset automatiquement le state interne (valeurCourante, debutRef)
        sans avoir besoin d'un useEffect.
      */}
            <ExerciceStep
                key={currentNumero}
                exercice={exercice}
                niveau={session.niveau}
                isLast={exerciceIndex + 1 === total}
                onValider={handleValider}
            />
        </div>
    );
}

PassationRunner.propTypes = {
    session: PropTypes.object.isRequired,
    eleveId: PropTypes.string.isRequired,
    onTermine: PropTypes.func.isRequired,
};

// ─── ExerciceStep ─────────────────────────────────────────────────────────────

/**
 * ExerciceStep
 *
 * Composant enfant de PassationRunner, monté avec une `key` par exercice.
 * Gère localement :
 * - `valeurCourante` (initialisée depuis getInitialValue à chaque montage)
 * - La mesure du temps passé (debutRef, initialisé dans useEffect)
 *
 * Appelle `onValider(valeur, dureeMs)` quand l'élève clique sur Valider.
 *
 * @param {object}   props
 * @param {object}   props.exercice
 * @param {string}   props.niveau
 * @param {boolean}  props.isLast
 * @param {function} props.onValider  - (valeurCourante: any, dureeMs: number) => void
 */
function ExerciceStep({ exercice, niveau, isLast, onValider }) {
    // État local : reset automatique à chaque remontage (grâce à la key).
    const [valeurCourante, setValeurCourante] = useState(() =>
        getInitialValue(exercice)
    );

    // Chrono : initialisé dans useEffect pour éviter Date.now() dans le rendu.
    const debutRef = useRef(null);

    useEffect(() => {
        debutRef.current = Date.now();
    }, []);

    function handleValider() {
        const dureeMs =
            debutRef.current !== null ? Date.now() - debutRef.current : 0;
        onValider(valeurCourante, dureeMs);
    }

    return (
        <>
            {/* Corps de l'exercice (SRS NF-UX-01 : consigne ≥ 18 px) */}
            <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
                {exercice.consigne && (
                    <p className="text-lg text-slate-800 leading-relaxed">
                        {exercice.consigne}
                    </p>
                )}
                <ExerciceRenderer
                    exercice={exercice}
                    niveau={niveau}
                    value={valeurCourante}
                    onChange={setValeurCourante}
                />
            </div>

            {/* Bouton de validation */}
            <div className="w-full max-w-2xl mx-auto px-4 py-6">
                <button
                    onClick={handleValider}
                    className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600
                     text-white text-lg font-semibold transition-colors cursor-pointer"
                >
                    {isLast ? "Terminer" : "Valider →"}
                </button>
            </div>
        </>
    );
}

ExerciceStep.propTypes = {
    exercice: PropTypes.object.isRequired,
    niveau: PropTypes.oneOf(["CE1", "CE2", "CM1", "CM2"]).isRequired,
    isLast: PropTypes.bool.isRequired,
    onValider: PropTypes.func.isRequired,
};

export default PassationRunner;
