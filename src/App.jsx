import { useState } from "react";
import Layout from "@/components/common/Layout";
import AccueilEnseignant from "@/pages/enseignant/AccueilEnseignant";
import AccueilEleve from "@/pages/eleve/AccueilEleve";

/**
 * App — composant racine.
 *
 * La navigation entre mode enseignant et mode élève est gérée
 * par un état React local. Pas de routeur : l'application tourne
 * sur un unique poste, dans un unique onglet (SRS §2.3).
 *
 * @typedef {'teacher' | 'student'} Mode
 */
function App() {
    /** @type {[Mode, function(Mode): void]} */
    const [mode, setMode] = useState("teacher");

    return (
        <Layout mode={mode} onSwitchMode={setMode}>
            {mode === "teacher" ? (
                <AccueilEnseignant onStartSession={() => setMode("student")} />
            ) : (
                <AccueilEleve onReturnToTeacher={() => setMode("teacher")} />
            )}
        </Layout>
    );
}

export default App;
