import { useState } from "react";
import { useAppContext } from "@/context/useAppContext";
import Layout from "@/components/common/Layout";
import PinGate from "@/components/common/PinGate";
import AccueilEnseignant from "@/pages/enseignant/AccueilEnseignant";
import GestionClasses from "@/pages/enseignant/GestionClasses";
import AccueilEleve from "@/pages/eleve/AccueilEleve";

/**
 * App — composant racine.
 *
 * Gestion de la navigation par état local :
 *   - `mode`          : 'teacher' | 'student'
 *   - `teacherPage`   : page courante dans le mode enseignant
 *   - `teacherUnlocked` : PIN vérifié dans la session courante
 *
 * @typedef {'accueil'|'classes'} TeacherPage
 */
function App() {
    const { state } = useAppContext();

    const [mode, setMode] = useState("teacher");
    const [teacherUnlocked, setTeacherUnlocked] = useState(false);
    /** @type {[TeacherPage, function(TeacherPage): void]} */
    const [teacherPage, setTeacherPage] = useState("accueil");

    function handleStartSession() {
        setTeacherUnlocked(false);
        setMode("student");
    }

    function handlePinSuccess() {
        setTeacherUnlocked(true);
        setMode("teacher");
    }

    // Hydratation en cours — ne rien afficher pour éviter un flash
    if (!state._hydrated) return null;

    // Premier lancement : pas de config
    if (state.config === null) {
        return <PinGate mode="create" onSuccess={handlePinSuccess} />;
    }

    // Mode élève
    if (mode === "student") {
        return (
            <Layout mode="student" onSwitchMode={() => {}}>
                <AccueilEleve onCallTeacher={handlePinSuccess} />
            </Layout>
        );
    }

    // Enseignant non déverrouillé
    if (!teacherUnlocked) {
        return <PinGate mode="verify" onSuccess={handlePinSuccess} />;
    }

    // Enseignant déverrouillé — routage interne
    const teacherPages = {
        accueil: (
            <AccueilEnseignant
                onStartSession={handleStartSession}
                onNavigate={setTeacherPage}
            />
        ),
        classes: <GestionClasses onNavigate={setTeacherPage} />,
    };

    return (
        <Layout mode="teacher" onSwitchMode={() => {}}>
            {teacherPages[teacherPage] ?? teacherPages.accueil}
        </Layout>
    );
}

export default App;
