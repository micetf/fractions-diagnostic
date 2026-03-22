import { useState } from "react";
import { useAppContext } from "@/context/useAppContext";
import Layout from "@/components/common/Layout";
import PinGate from "@/components/common/PinGate";
import AccueilEnseignant from "@/pages/enseignant/AccueilEnseignant";
import AccueilEleve from "@/pages/eleve/AccueilEleve";

/**
 * App — composant racine.
 *
 * Gestion de la navigation et des accès :
 *
 *   1. Pas de config → PinGate mode "create" (premier lancement)
 *   2. Config présente + enseignant non déverrouillé → PinGate mode "verify"
 *   3. Enseignant déverrouillé → mode enseignant
 *   4. Mode élève → AccueilEleve
 *      Fin de passation → PinGate mode "verify" avant retour enseignant
 *
 * `teacherUnlocked` est un état de session (non persisté) :
 * il se remet à false dès que l'on bascule en mode élève,
 * ce qui force la re-saisie du PIN au retour.
 */
function App() {
    const { state } = useAppContext();

    /** @type {['teacher'|'student', function]} */
    const [mode, setMode] = useState("teacher");

    /**
     * true tant que le PIN a été vérifié dans cette session côté enseignant.
     * Remis à false au passage en mode élève.
     */
    const [teacherUnlocked, setTeacherUnlocked] = useState(false);

    /**
     * Bascule vers le mode élève et verrouille l'accès enseignant.
     * Appelé depuis AccueilEnseignant (test S3) ou depuis CréerSession (S5).
     */
    function handleStartSession() {
        setTeacherUnlocked(false);
        setMode("student");
    }

    /**
     * Appelé par PinGate (mode create ou verify) après succès.
     * Déverrouille le mode enseignant et bascule l'affichage.
     */
    function handlePinSuccess() {
        setTeacherUnlocked(true);
        setMode("teacher");
    }

    // ── Cas 1 : premier lancement — aucune config ────────────────────────────
    if (!state._hydrated) {
        // Attendre la fin de l'hydratation pour éviter un flash du formulaire
        return null;
    }

    if (state.config === null) {
        return <PinGate mode="create" onSuccess={handlePinSuccess} />;
    }

    // ── Cas 4 : mode élève ───────────────────────────────────────────────────
    if (mode === "student") {
        return (
            <Layout mode="student" onSwitchMode={() => {}}>
                <AccueilEleve onCallTeacher={handlePinSuccess} />
            </Layout>
        );
    }

    // ── Cas 2 : enseignant non déverrouillé ──────────────────────────────────
    if (!teacherUnlocked) {
        return <PinGate mode="verify" onSuccess={handlePinSuccess} />;
    }

    // ── Cas 3 : enseignant déverrouillé ──────────────────────────────────────
    return (
        <Layout mode="teacher" onSwitchMode={() => {}}>
            <AccueilEnseignant onStartSession={handleStartSession} />
        </Layout>
    );
}

export default App;
