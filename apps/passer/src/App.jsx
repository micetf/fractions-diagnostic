/**
 * @fileoverview App — composant racine de l'interface passation.
 *
 * Routage par état — flux :
 *   attente → [import-config] → choix-eleve → passation → fin
 *                                                        ↘ export-resultats
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

function AppContent() {
    const { state } = usePasserContext();

    const [ecran, setEcran] = useState("auto");
    const [eleveId, setEleveId] = useState(null);

    if (!state._hydrated) return null;

    const { diagnostic, passations } = state;

    // ── Import config ─────────────────────────────────────────────────────
    if (ecran === "import-config") {
        return (
            <ImportConfig
                onSuccess={() => setEcran("auto")}
                onAnnuler={() => setEcran("auto")}
            />
        );
    }

    // ── Export résultats ──────────────────────────────────────────────────
    if (ecran === "export-resultats") {
        return (
            <ExportResultats onRetour={() => setEcran("auto")} />
        );
    }

    // ── Pas de config ─────────────────────────────────────────────────────
    if (!diagnostic) {
        return (
            <EcranAttente
                tousTermines={false}
                onImporter={() => setEcran("import-config")}
                onExporter={() => setEcran("export-resultats")}
            />
        );
    }

    // ── Tous les élèves ont terminé ───────────────────────────────────────
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
                onExporter={() => setEcran("export-resultats")}
            />
        );
    }

    // ── Passation en cours ────────────────────────────────────────────────
    if (ecran === "passation" && eleveId) {
        return (
            <PassationRunner
                eleveId={eleveId}
                onTermine={() => setEcran("fin")}
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
                    setEcran("auto");
                }}
                onAdmin={() => setEcran("export-resultats")}
            />
        );
    }

    // ── Choix de l'élève ──────────────────────────────────────────────────
    return (
        <ChoixEleve
            onChoisir={(id) => {
                setEleveId(id);
                setEcran("passation");
            }}
        />
    );
}

export default function App() {
    return (
        <PasserContextProvider>
            <AppContent />
        </PasserContextProvider>
    );
}
