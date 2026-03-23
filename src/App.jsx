import { useState } from "react";
import { useAppContext } from "@/context/useAppContext";
import Layout from "@/components/common/Layout";
import PinGate from "@/components/common/PinGate";
import AccueilEnseignant from "@/pages/enseignant/AccueilEnseignant";
import GestionClasses from "@/pages/enseignant/GestionClasses";
import CreerSession from "@/pages/enseignant/CreerSession";
import ListeSessions from "@/pages/enseignant/ListeSessions";
import AccueilEleve from "@/pages/eleve/AccueilEleve";

/**
 * App — composant racine.
 *
 * `sessionActiveId` est restauré (supprimé à S5 pour lint, nécessaire à S11).
 */
function App() {
    const { state } = useAppContext();

    const [mode, setMode] = useState("teacher");
    const [teacherUnlocked, setTeacherUnlocked] = useState(false);
    const [teacherPage, setTeacherPage] = useState("accueil");
    const [sessionActiveId, setSessionActiveId] = useState(null);

    function handlePinSuccess() {
        setTeacherUnlocked(true);
        setMode("teacher");
    }

    function handleLancerSession(session) {
        setSessionActiveId(session.id);
        setTeacherUnlocked(false);
        setMode("student");
    }

    if (!state._hydrated) return null;

    if (state.config === null) {
        return <PinGate mode="create" onSuccess={handlePinSuccess} />;
    }

    if (mode === "student") {
        return (
            <Layout mode="student" onSwitchMode={() => {}}>
                <AccueilEleve
                    sessionActiveId={sessionActiveId}
                    onCallTeacher={handlePinSuccess}
                />
            </Layout>
        );
    }

    if (!teacherUnlocked) {
        return <PinGate mode="verify" onSuccess={handlePinSuccess} />;
    }

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
    };

    return (
        <Layout mode="teacher" onSwitchMode={() => {}}>
            {teacherPages[teacherPage] ?? teacherPages.accueil}
        </Layout>
    );
}

export default App;
