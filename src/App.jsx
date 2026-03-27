/**
 * @file App.jsx — composant racine.
 *
 * @description
 * Machine à états simplifiée — 2 cas exclusifs (au lieu de 4 avant le Sprint 2) :
 *
 *   ┌─────────────────────────────────────────────────────────────────┐
 *   │  sessionActive ?                                                │
 *   │  ┌─── oui ──► Mode élève (AccueilEleve)                        │
 *   │  │              Long press 2 s sur titre navbar                │
 *   │  │              ──► TeacherConfirmOverlay                      │
 *   │  │              ──► [Oui] ──► handleRetourEnseignant()         │
 *   │  │                                                             │
 *   │  └─── non ──► Mode enseignant (tableau de bord, direct)        │
 *   └─────────────────────────────────────────────────────────────────┘
 *
 * Supprimé au Sprint 2 :
 *   - PinGate (create + verify)
 *   - teacherUnlocked state
 *   - handlePinSuccess
 *
 * Ajouté au Sprint 2 :
 *   - useLongPress → showTeacherConfirm
 *   - TeacherConfirmOverlay rendu à la racine (hors Layout)
 *   - onRetourEnseignant propagé à AccueilEleve (remplace onCallTeacherSuccess)
 *
 * @module App
 */

import { useState, useCallback } from "react";
import { useAppContext } from "@/context/useAppContext";
import { useLongPress } from "@/hooks/useLongPress";
import Layout from "@/components/common/Layout";
import TeacherConfirmOverlay from "@/components/common/TeacherConfirmOverlay";
import AccueilEnseignant from "@/pages/enseignant/AccueilEnseignant";
import GestionClasses from "@/pages/enseignant/GestionClasses";
import CreerSession from "@/pages/enseignant/CreerSession";
import ListeSessions from "@/pages/enseignant/ListeSessions";
import AnalyseSession from "@/pages/enseignant/AnalyseSession";
import ExportImport from "@/pages/enseignant/ExportImport";
import AccueilEleve from "@/pages/eleve/AccueilEleve";

// ─── Composant ─────────────────────────────────────────────────────────────────

function App() {
    const { state, dispatch } = useAppContext();

    const [teacherPage, setTeacherPage] = useState("accueil");
    const [sessionAnalyseId, setSessionAnalyseId] = useState(null);
    const [showTeacherConfirm, setShowTeacherConfirm] = useState(false);

    // ── Session active dérivée depuis le config persisté ──────────────────
    const sessionActivePersistee = state.config?.session_en_cours_id ?? null;
    const sessionActive = sessionActivePersistee
        ? (state.sessions.find(
              (s) => s.id === sessionActivePersistee && s.statut === "en_cours"
          ) ?? null)
        : null;

    // ── Long press : déclenche l'overlay de confirmation ─────────────────
    const longPressHandlers = useLongPress(
        useCallback(() => setShowTeacherConfirm(true), [])
    );

    // ── Handlers ─────────────────────────────────────────────────────────

    /**
     * Lance la session : persiste l'id dans config, bascule en mode élève.
     *
     * @param {object} session - Session créée par CreerSession.
     */
    function handleLancerSession(session) {
        dispatch({
            type: "SET_SESSION_ACTIVE",
            payload: { session_id: session.id },
        });
    }

    /**
     * Retour en mode enseignant — appelé après confirmation de l'overlay.
     * Efface la session active persistée → App rebascule sur le cas "dashboard".
     */
    function handleRetourEnseignant() {
        setShowTeacherConfirm(false);
        dispatch({ type: "CLEAR_SESSION_ACTIVE" });
    }

    /**
     * Ferme l'overlay sans action (clic sur fond ou bouton "Non").
     */
    const handleAnnulerConfirm = useCallback(() => {
        setShowTeacherConfirm(false);
    }, []);

    // ── Garde hydratation ─────────────────────────────────────────────────
    if (!state._hydrated) return null;

    // ── Cas 1 : session active → mode élève ──────────────────────────────
    if (sessionActive) {
        return (
            <>
                <Layout
                    mode="student"
                    pageActive="eleve"
                    onLongPressStart={longPressHandlers.onPointerDown}
                    onLongPressEnd={longPressHandlers.onPointerUp}
                >
                    <AccueilEleve
                        sessionActiveId={sessionActive.id}
                        onRetourEnseignant={() => setShowTeacherConfirm(true)}
                    />
                </Layout>

                {/* Overlay rendu à la racine — au-dessus de tout (z-50) */}
                {showTeacherConfirm && (
                    <TeacherConfirmOverlay
                        onConfirm={handleRetourEnseignant}
                        onCancel={handleAnnulerConfirm}
                    />
                )}
            </>
        );
    }

    // ── Cas 2 : pas de session active → tableau de bord enseignant ────────
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
        <Layout mode="teacher" pageActive={teacherPage}>
            {teacherPages[teacherPage] ?? teacherPages.accueil}
        </Layout>
    );
}

export default App;
