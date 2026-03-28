/**
 * @fileoverview App — composant racine de l'interface passation.
 *
 * Routage par état — flux :
 *   attente → [import-config] → choix-eleve → passation → fin
 *                                                        ↘ export-resultats
 *
 * Pas de PIN, pas d'authentification, pas d'accès aux résultats (SRS F-PAS-01).
 *
 * @module App
 */

import { useState } from "react";
import { PasserContextProvider, usePasserContext } from "@/context/PasserContext";
import EcranAttente from "@/pages/EcranAttente";
import ImportConfig from "@/pages/ImportConfig";
import ChoixEleve from "@/pages/ChoixEleve";
import PassationRunner from "@/pages/PassationRunner";
import FinPassation from "@/pages/FinPassation";
import ExportResultats from "@/pages/ExportResultats";

// ─── Contenu principal (accès au contexte) ────────────────────────────────────

function AppContent() {
    const { state } = usePasserContext();

    const [ecran, setEcran] = useState("auto");
    const [eleveId, setEleveId] = useState(null);
    const [passationId, setPassationId] = useState(null);

    // ── Garde hydratation ─────────────────────────────────────────────────
    if (!state._hydrated) return null;

    const { diagnostic, passations } = state;

    // ── Écran import config (déclenché manuellement) ──────────────────────
    if (ecran === "import-config") {
        return (
            <ImportConfig
                onSuccess={() => setEcran("auto")}
                onAnnuler={() => setEcran("auto")}
            />
        );
    }

    // ── Écran export résultats (accessible depuis FinPassation) ───────────
    if (ecran === "export-resultats") {
        return (
            <ExportResultats
                onRetour={() => setEcran("auto")}
            />
        );
    }

    // ── Pas de config → attente ───────────────────────────────────────────
    if (!diagnostic) {
        return (
            <EcranAttente
                tousTermines={false}
                onImporter={() => setEcran("import-config")}
            />
        );
    }

    // ── Tous les élèves ont terminé → attente ─────────────────────────────
    const idsTermines = new Set(
        passations
            .filter(
                (p) =>
                    p.diagnostic_id === diagnostic.diagnostic_id &&
                    p.statut === "terminee"
            )
            .map((p) => p.eleve_id)
    );

    const tousTermines =
        diagnostic.eleves.length > 0 &&
        diagnostic.eleves.every((e) => idsTermines.has(e.id));

    if (tousTermines && ecran === "auto") {
        return (
            <EcranAttente
                tousTermines={true}
                onImporter={() => setEcran("import-config")}
            />
        );
    }

    // ── Passation en cours ────────────────────────────────────────────────
    if (ecran === "passation" && eleveId) {
        return (
            <PassationRunner
                eleveId={eleveId}
                onTermine={(pid) => {
                    setPassationId(pid);
                    setEcran("fin");
                }}
            />
        );
    }

    // ── Fin de passation ──────────────────────────────────────────────────
    if (ecran === "fin" && eleveId) {
        const eleve = diagnostic.eleves.find((e) => e.id === eleveId);
        return (
            <FinPassation
                prenom={eleve?.prenom ?? ""}
                onSuivant={() => {
                    setEleveId(null);
                    setPassationId(null);
                    setEcran("auto");
                }}
                onAdmin={() => {
                    // Ouvre l'interface admin dans un nouvel onglet (SRS F-PAS-18)
                    window.open("/fractions-diagnostic/", "_blank");
                }}
            />
        );
    }

    // ── Choix de l'élève (écran par défaut quand config présente) ─────────
    return (
        <ChoixEleve
            onChoisir={(id) => {
                setEleveId(id);
                setEcran("passation");
            }}
        />
    );
}

// ─── App (fournit le contexte) ────────────────────────────────────────────────

export default function App() {
    return (
        <PasserContextProvider>
            <AppContent />
        </PasserContextProvider>
    );
}
