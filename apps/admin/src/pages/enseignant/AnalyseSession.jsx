/**
 * @fileoverview AnalyseSession — analyse complète d'un diagnostic.
 *
 * Renommage prévu en AnalyseDiagnostic.jsx au Sprint 2.
 *
 * v2.0 : state.sessions → state.diagnostics, session_id → diagnostic_id.
 * Les composants enfants (MatriceResultats, VueBiais, etc.) reçoivent
 * toujours une prop nommée `session` pour compatibilité — sera renommé
 * en `diagnostic` au Sprint 2 lors de leur adaptation.
 *
 * @module pages/enseignant/AnalyseSession
 */
import { useState } from "react";
import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";
import MatriceResultats from "@/components/analyse/MatriceResultats";
import VueBiais from "@/components/analyse/VueBiais";
import ProfilEleve from "@/components/analyse/ProfilEleve";
import ItemsARevoir from "@/components/analyse/ItemsARevoir";

const ONGLETS = [
    { id: "matrice", label: "Matrice" },
    { id: "biais", label: "Biais" },
    { id: "relire", label: "À relire" },
];

/**
 * @param {object}   props
 * @param {string}   props.sessionId  - Id du diagnostic à analyser.
 * @param {function} props.onNavigate
 */
function AnalyseSession({ sessionId, onNavigate }) {
    const { state } = useAppContext();
    const [onglet, setOnglet] = useState("matrice");
    const [eleveActif, setEleveActif] = useState(null);

    // v2.0 : cherche dans diagnostics (et non plus sessions)
    const diagnostic = state.diagnostics?.find((d) => d.id === sessionId) ?? null;
    const classe = diagnostic
        ? (state.classes.find((c) => c.id === diagnostic.classe_id) ?? null)
        : null;
    const eleves = classe?.eleves ?? [];
    const eleve = eleves.find((e) => e.id === eleveActif) ?? null;

    if (!diagnostic) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-10">
                <p className="text-slate-400">Diagnostic introuvable.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            {/* Fil d'Ariane */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                <button
                    onClick={() => onNavigate("accueil")}
                    className="hover:text-brand-600 transition-colors cursor-pointer"
                >
                    Tableau de bord
                </button>
                <span>/</span>
                <button
                    onClick={() => onNavigate("diagnostics")}
                    className="hover:text-brand-600 transition-colors cursor-pointer"
                >
                    Diagnostics
                </button>
                <span>/</span>
                <span className="text-slate-800 font-medium">
                    {classe?.nom ?? "—"} · {diagnostic.niveau}
                    {diagnostic.libelle ? ` · ${diagnostic.libelle}` : ""}
                </span>
            </nav>

            {/* Profil élève */}
            {eleve ? (
                <ProfilEleve
                    session={diagnostic}
                    eleve={eleve}
                    onRetour={() => {
                        setEleveActif(null);
                        setOnglet("matrice");
                    }}
                />
            ) : (
                <>
                    {/* Onglets */}
                    <div className="flex gap-1 mb-6 border-b border-slate-200">
                        {ONGLETS.map((o) => (
                            <button
                                key={o.id}
                                onClick={() => setOnglet(o.id)}
                                className={`px-4 py-2.5 text-sm font-medium transition-colors
                                            cursor-pointer rounded-t-lg -mb-px border-b-2
                                            ${
                                                onglet === o.id
                                                    ? "border-brand-500 text-brand-600"
                                                    : "border-transparent text-slate-500 hover:text-slate-700"
                                            }`}
                            >
                                {o.label}
                            </button>
                        ))}
                    </div>

                    {/* Contenu */}
                    {onglet === "matrice" && (
                        <MatriceResultats
                            session={diagnostic}
                            eleves={eleves}
                            onVoirProfil={setEleveActif}
                        />
                    )}
                    {onglet === "biais" && (
                        <VueBiais session={diagnostic} eleves={eleves} />
                    )}
                    {onglet === "relire" && (
                        <ItemsARevoir session={diagnostic} eleves={eleves} />
                    )}
                </>
            )}
        </div>
    );
}

AnalyseSession.propTypes = {
    sessionId: PropTypes.string.isRequired,
    onNavigate: PropTypes.func.isRequired,
};

export default AnalyseSession;
