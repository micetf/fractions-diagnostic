/**
 * @fileoverview App — composant racine de l'interface admin.
 *
 * Logique de démarrage :
 *   1. Pas de config ou pas de pin_hash → PinGate mode create
 *   2. Config présente + non déverrouillé → PinGate mode verify
 *   3. Déverrouillé → tableau de bord
 *
 * @module App
 */

import { useState } from "react";
import { useAppContext } from "@/context/useAppContext";
import PinGate from "@/components/common/PinGate";
import Layout from "@/components/common/Layout";
import AccueilEnseignant from "@/pages/enseignant/AccueilEnseignant";
import GestionClasses from "@/pages/enseignant/GestionClasses";
import CreerSession from "@/pages/enseignant/CreerSession";
import ListeSessions from "@/pages/enseignant/ListeSessions";
import AnalyseSession from "@/pages/enseignant/AnalyseSession";
import ExportImport from "@/pages/enseignant/ExportImport";
import Parametres from "@/pages/enseignant/Parametres";

function App() {
    const { state } = useAppContext();

    const [debloque, setDebloque] = useState(false);
    const [page, setPage] = useState("accueil");
    const [diagnosticAnalyseId, setDiagnosticAnalyseId] = useState(null);

    if (!state._hydrated) return null;

    // ── Cas 1 : premier lancement ─────────────────────────────────────────
    if (state.config === null || !state.config?.pin_hash) {
        return (
            <PinGate
                mode="create"
                onSuccess={() => setDebloque(true)}
            />
        );
    }

    // ── Cas 2 : PIN existant, non déverrouillé ────────────────────────────
    if (!debloque) {
        return (
            <PinGate
                mode="verify"
                onSuccess={() => setDebloque(true)}
                context="Saisissez votre code pour accéder au tableau de bord."
            />
        );
    }

    // ── Cas 3 : déverrouillé ──────────────────────────────────────────────
    const pages = {
        accueil: (
            <AccueilEnseignant onNavigate={setPage} />
        ),
        classes: (
            <GestionClasses onNavigate={setPage} />
        ),
        diagnostics: (
            <ListeSessions
                onNavigate={setPage}
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
        parametres: (
            <Parametres onNavigate={setPage} />
        ),
    };

    return (
        <Layout mode="teacher" pageActive={page}>
            {pages[page] ?? pages.accueil}
        </Layout>
    );
}

export default App;
