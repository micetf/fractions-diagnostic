import { useState } from "react";
import { useAppContext } from "@/context/useAppContext";
import Layout from "@/components/common/Layout";
import PinGate from "@/components/common/PinGate";
import AccueilEnseignant from "@/pages/enseignant/AccueilEnseignant";
import GestionClasses from "@/pages/enseignant/GestionClasses";
import CreerSession from "@/pages/enseignant/CreerSession";
import ListeSessions from "@/pages/enseignant/ListeSessions";
import AnalyseSession from "@/pages/enseignant/AnalyseSession";
import ExportImport from "@/pages/enseignant/ExportImport";
import AccueilEleve from "@/pages/eleve/AccueilEleve";

/**
 * App — composant racine.
 *
 * Logique de démarrage :
 *
 *   1. Pas de config (premier lancement) → PinGate create
 *   2. Config présente + session_en_cours_id valide
 *      → mode élève directement, sans PIN (l'enseignant a lancé la session)
 *   3. Config présente + enseignant non déverrouillé → PinGate verify
 *   4. Enseignant déverrouillé → tableau de bord
 *
 * Ce comportement permet à un élève d'ouvrir le navigateur seul
 * et de passer la session préparée par son enseignant, sans PIN.
 */
function App() {
    const { state, dispatch } = useAppContext();

    const [teacherUnlocked, setTeacherUnlocked] = useState(false);
    const [teacherPage, setTeacherPage] = useState("accueil");
    const [sessionAnalyseId, setSessionAnalyseId] = useState(null);

    // Session active dérivée depuis le config persisté
    const sessionActivePersistee = state.config?.session_en_cours_id ?? null;
    const sessionActive = sessionActivePersistee
        ? (state.sessions.find(
              (s) => s.id === sessionActivePersistee && s.statut === "en_cours"
          ) ?? null)
        : null;

    function handlePinSuccess() {
        setTeacherUnlocked(true);
    }

    /**
     * Lance la session : persiste l'id dans config, bascule en mode élève.
     * L'enseignant est verrouillé — PIN requis au retour.
     */
    function handleLancerSession(session) {
        dispatch({
            type: "SET_SESSION_ACTIVE",
            payload: { session_id: session.id },
        });
        setTeacherUnlocked(false);
    }

    /**
     * Retour en mode enseignant après vérification du PIN.
     * Efface la session active persistée.
     */
    function handleRetourEnseignant() {
        dispatch({ type: "CLEAR_SESSION_ACTIVE" });
        setTeacherUnlocked(true);
    }

    // ── Garde hydratation ─────────────────────────────────────────────────
    if (!state._hydrated) return null;

    // ── Cas 1 : premier lancement ─────────────────────────────────────────
    if (state.config === null) {
        return <PinGate mode="create" onSuccess={handlePinSuccess} />;
    }

    // ── Cas 2 : session active persistée → mode élève sans PIN ────────────
    // L'élève peut ouvrir le navigateur seul et trouver la session prête.
    if (sessionActive) {
        return (
            <Layout mode="student" onSwitchMode={() => {}} pageActive="eleve">
                <AccueilEleve
                    sessionActiveId={sessionActive.id}
                    onCallTeacher={() => {
                        // Le PinGate appellera handleRetourEnseignant après succès
                    }}
                    onCallTeacherSuccess={handleRetourEnseignant}
                />
            </Layout>
        );
    }

    // ── Cas 3 : enseignant non déverrouillé ───────────────────────────────
    if (!teacherUnlocked) {
        return <PinGate mode="verify" onSuccess={handlePinSuccess} />;
    }

    // ── Cas 4 : enseignant déverrouillé ───────────────────────────────────
    const teacherPages = {
        accueil: (
            <AccueilEnseignant
                onStartSession={() => {}}
                onNavigate={setTeacherPage}
            />
        ),
        classes: <GestionClasses onNavigate={setTeacherPage} />,
        sessions: (
            <ListeSessions
                onNavigate={setTeacherPage}
                onRelancerSession={handleLancerSession}
                onAnalyserSession={(id) => {
                    setSessionAnalyseId(id);
                    setTeacherPage("analyse");
                }}
            />
        ),
        "creer-session": (
            <CreerSession
                onNavigate={setTeacherPage}
                onLancer={handleLancerSession}
            />
        ),
        analyse: (
            <AnalyseSession
                sessionId={sessionAnalyseId}
                onNavigate={setTeacherPage}
            />
        ),
        "export-import": <ExportImport onNavigate={setTeacherPage} />,
    };

    return (
        <Layout mode="teacher" onSwitchMode={() => {}} pageActive={teacherPage}>
            {teacherPages[teacherPage] ?? teacherPages.accueil}
        </Layout>
    );
}

export default App;
