/**
 * @fileoverview App — composant racine de l'interface admin.
 *
 * Routage par état (pas de react-router-dom).
 *
 * v2.0 — Changements par rapport à v1.0 :
 *   - Suppression de la bascule mode élève ↔ mode enseignant
 *   - Suppression du long press et de TeacherConfirmOverlay
 *   - Suppression de SET_SESSION_ACTIVE / CLEAR_SESSION_ACTIVE
 *   - Routes sessions/* renommées en diagnostics/*
 *   - PinGate sera ajouté au Sprint 2
 *
 * @module App
 */

import { useState } from "react";
import { useAppContext } from "@/context/useAppContext";
import Layout from "@/components/common/Layout";
import AccueilEnseignant from "@/pages/enseignant/AccueilEnseignant";
import GestionClasses from "@/pages/enseignant/GestionClasses";
import CreerSession from "@/pages/enseignant/CreerSession";
import ListeSessions from "@/pages/enseignant/ListeSessions";
import AnalyseSession from "@/pages/enseignant/AnalyseSession";
import ExportImport from "@/pages/enseignant/ExportImport";

// ─── Composant ────────────────────────────────────────────────────────────────

function App() {
    const { state } = useAppContext();

    const [page, setPage] = useState("accueil");
    const [diagnosticAnalyseId, setDiagnosticAnalyseId] = useState(null);

    // ── Garde hydratation ─────────────────────────────────────────────────
    if (!state._hydrated) return null;

    // ── Pages disponibles ─────────────────────────────────────────────────
    const pages = {
        accueil: (
            <AccueilEnseignant onNavigate={setPage} />
        ),
        classes: (
            <GestionClasses onNavigate={setPage} />
        ),
        // "diagnostics" et "creer-diagnostic" seront renommés au Sprint 2.
        // Pour l'instant on pointe vers les composants existants.
        diagnostics: (
            <ListeSessions
                onNavigate={setPage}
                onRelancerSession={() => {}}
                onAnalyserSession={(id) => {
                    setDiagnosticAnalyseId(id);
                    setPage("analyse");
                }}
            />
        ),
        "creer-diagnostic": (
            <CreerSession
                onNavigate={setPage}
                onLancer={() => setPage("diagnostics")}
            />
        ),
        analyse: (
            <AnalyseSession
                sessionId={diagnosticAnalyseId}
                onNavigate={setPage}
            />
        ),
        "export-import": (
            <ExportImport onNavigate={setPage} />
        ),
    };

    return (
        <Layout mode="teacher" pageActive={page}>
            {pages[page] ?? pages.accueil}
        </Layout>
    );
}

export default App;
