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
 * AnalyseSession
 *
 * Page d'analyse complète d'une session (SRS F-ANA-01 à F-ANA-10).
 * Navigation par onglets : Matrice / Biais / À relire / Profil élève.
 *
 * @param {object}   props
 * @param {string}   props.sessionId  - Id de la session à analyser.
 * @param {function} props.onNavigate
 */
function AnalyseSession({ sessionId, onNavigate }) {
    const { state } = useAppContext();
    const [onglet, setOnglet] = useState("matrice");
    const [eleveActif, setEleveActif] = useState(null);

    const session = state.sessions.find((s) => s.id === sessionId) ?? null;
    const classe = session
        ? (state.classes.find((c) => c.id === session.classe_id) ?? null)
        : null;
    const eleves = classe?.eleves ?? [];
    const eleve = eleves.find((e) => e.id === eleveActif) ?? null;

    if (!session) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-10">
                <p className="text-slate-400">Session introuvable.</p>
            </div>
        );
    }

    function handleVoirProfil(eleveId) {
        setEleveActif(eleveId);
    }

    function handleRetourMatrice() {
        setEleveActif(null);
        setOnglet("matrice");
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
                    onClick={() => onNavigate("sessions")}
                    className="hover:text-brand-600 transition-colors cursor-pointer"
                >
                    Sessions
                </button>
                <span>/</span>
                <span className="text-slate-800 font-medium">
                    {classe?.nom ?? "—"} · {session.niveau}
                </span>
            </nav>

            {/* Profil élève — overlay par-dessus les onglets */}
            {eleve ? (
                <ProfilEleve
                    session={session}
                    eleve={eleve}
                    onRetour={handleRetourMatrice}
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
                            session={session}
                            eleves={eleves}
                            onVoirProfil={handleVoirProfil}
                        />
                    )}
                    {onglet === "biais" && (
                        <VueBiais session={session} eleves={eleves} />
                    )}
                    {onglet === "relire" && (
                        <ItemsARevoir session={session} eleves={eleves} />
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
