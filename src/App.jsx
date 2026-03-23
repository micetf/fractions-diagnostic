import { useState } from "react";
import { useAppContext } from "@/context/useAppContext";
import Layout from "@/components/common/Layout";
import PinGate from "@/components/common/PinGate";
import AccueilEnseignant from "@/pages/enseignant/AccueilEnseignant";
import GestionClasses from "@/pages/enseignant/GestionClasses";
import CreerSession from "@/pages/enseignant/CreerSession";
import ListeSessions from "@/pages/enseignant/ListeSessions";
import AccueilEleve from "@/pages/eleve/AccueilEleve";
import SpikeS7 from "@/pages/enseignant/SpikeS7";
/**
 * App — composant racine.
 *
 * Navigation par état local :
 *   - `mode`            : 'teacher' | 'student'
 *   - `teacherPage`     : page courante mode enseignant
 *   - `teacherUnlocked` : PIN vérifié dans la session courante
 *   - `sessionActiveId` : id de la session en cours de passation (utilisé en S11)
 *
 * @typedef {'accueil'|'classes'|'sessions'|'creer-session'} TeacherPage
 */
function App() {
    const { state } = useAppContext();

    const [mode, setMode] = useState("teacher");
    const [teacherUnlocked, setTeacherUnlocked] = useState(false);
    const [teacherPage, setTeacherPage] = useState("accueil");
    const [, setSessionActiveId] = useState(null);

    function handlePinSuccess() {
        setTeacherUnlocked(true);
        setMode("teacher");
    }

    /**
     * Lance la passation : enregistre la session active, verrouille
     * le mode enseignant et bascule en mode élève (SRS F-PAS-01).
     *
     * @param {object} session - Session créée ou relancée.
     */
    function handleLancerSession(session) {
        setSessionActiveId(session.id);
        setTeacherUnlocked(false);
        setMode("student");
    }

    // ── Garde hydratation ───────────────────────────────────────────────────
    if (!state._hydrated) return null;

    // ── Premier lancement ───────────────────────────────────────────────────
    if (state.config === null) {
        return <PinGate mode="create" onSuccess={handlePinSuccess} />;
    }

    // ── Mode élève ──────────────────────────────────────────────────────────
    if (mode === "student") {
        return (
            <Layout mode="student" onSwitchMode={() => {}}>
                <AccueilEleve onCallTeacher={handlePinSuccess} />
            </Layout>
        );
    }

    // ── Enseignant non déverrouillé ─────────────────────────────────────────
    if (!teacherUnlocked) {
        return <PinGate mode="verify" onSuccess={handlePinSuccess} />;
    }

    // ── Enseignant déverrouillé — routage interne ───────────────────────────
    const teacherPages = {
        accueil: (
            <AccueilEnseignant
                onStartSession={() => setMode("student")}
                onNavigate={setTeacherPage}
            />
        ),
        classes: <GestionClasses onNavigate={setTeacherPage} />,
        sessions: (
            <ListeSessions
                onNavigate={setTeacherPage}
                onRelancerSession={handleLancerSession}
            />
        ),
        "creer-session": (
            <CreerSession
                onNavigate={setTeacherPage}
                onLancer={handleLancerSession}
            />
        ),
        s7: <SpikeS7 onNavigate={setTeacherPage} />,
    };

    return (
        <Layout mode="teacher" onSwitchMode={() => {}}>
            {teacherPages[teacherPage] ?? teacherPages.accueil}
        </Layout>
    );
}

export default App;
