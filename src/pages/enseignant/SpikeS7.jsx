import { useState } from "react";
import PropTypes from "prop-types";
import BinaryChoice from "@/components/exercices/BinaryChoice";
import TextJustification from "@/components/exercices/TextJustification";

/**
 * SpikeS7
 *
 * Page de démonstration temporaire pour S7.
 * Couvre les combinaisons réelles issues des exercices sources.
 * À supprimer après validation.
 *
 * @param {object}   props
 * @param {function} props.onNavigate
 */
function SpikeS7({ onNavigate }) {
    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-semibold text-slate-800">
                    S7 — BinaryChoice + TextJustification
                </h1>
                <button
                    onClick={() => onNavigate("accueil")}
                    className="text-sm text-slate-400 hover:text-brand-600
                     transition-colors cursor-pointer"
                >
                    ← Retour
                </button>
            </div>
            <p
                className="text-xs text-amber-700 bg-amber-50 border border-amber-200
                    rounded-lg px-3 py-2 mb-8"
            >
                Fichier temporaire — à supprimer après validation.
            </p>

            <div className="space-y-8">
                {/* CE1 Ex.4 — OUI / NON avec justification */}
                <CasDeTest
                    titre="CE1 Ex.4 — Comparer fractions unitaires"
                    description='Options : Lola / Tom. Biais BIAIS_ENTIER_DENOMINATEUR si "Tom" sélectionné.'
                >
                    <CasOuiNon options={["Lola", "Tom"]} avecJustification />
                </CasDeTest>

                {/* CM1 Ex.1 — 3 options */}
                <CasDeTest
                    titre="CM1 Ex.1 — Comparer fraction à 1"
                    description="3 options : plus petite / égale / plus grande. Fraction : 9/4."
                >
                    <CasOuiNon
                        options={[
                            "plus petite que 1",
                            "égale à 1",
                            "plus grande que 1",
                        ]}
                        avecJustification={false}
                    />
                </CasDeTest>

                {/* CE2 Ex.1 — OUI / NON avec justification longue */}
                <CasDeTest
                    titre="CE2 Ex.1 — Égalité de fractions"
                    description="Tom dit que 6/8 et 3/4, c'est la même quantité. OUI / NON + justification."
                >
                    <CasOuiNon options={["OUI", "NON"]} avecJustification />
                </CasDeTest>

                {/* TextJustification seul */}
                <CasDeTest
                    titre="TextJustification — composant seul"
                    description="Utilisé pour les exercices avec dessin ou explication libre."
                >
                    <CasTexteSeul />
                </CasDeTest>
            </div>
        </div>
    );
}

SpikeS7.propTypes = {
    onNavigate: PropTypes.func.isRequired,
};

/* ── Sous-composants de test ────────────────────────────────────────────────── */

function CasDeTest({ titre, description, children }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-1">{titre}</h2>
            <p className="text-sm text-slate-500 mb-5">{description}</p>
            {children}
        </div>
    );
}

CasDeTest.propTypes = {
    titre: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

function CasOuiNon({ options, avecJustification }) {
    const [choix, setChoix] = useState(null);
    const [texte, setTexte] = useState("");

    return (
        <div className="space-y-4">
            <BinaryChoice options={options} value={choix} onChange={setChoix} />
            {avecJustification && (
                <TextJustification value={texte} onChange={setTexte} />
            )}
            <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-mono text-slate-400">
                    valeur_brute → choix:{" "}
                    <span className="text-slate-600">{choix ?? "null"}</span>
                    {avecJustification && (
                        <>
                            {" "}
                            · texte:{" "}
                            <span className="text-slate-600">
                                {texte
                                    ? `"${texte.slice(0, 40)}${texte.length > 40 ? "…" : ""}"`
                                    : "null"}
                            </span>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}

CasOuiNon.propTypes = {
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    avecJustification: PropTypes.bool.isRequired,
};

function CasTexteSeul() {
    const [texte, setTexte] = useState("");
    return (
        <div className="space-y-3">
            <TextJustification
                value={texte}
                onChange={setTexte}
                label="Explique avec un dessin ou des mots comment tu as trouvé :"
                placeholder="Écris ta réponse ici…"
            />
            <p className="text-xs font-mono text-slate-400">
                valeur_brute → texte:{" "}
                <span className="text-slate-600">
                    {texte
                        ? `"${texte.slice(0, 60)}${texte.length > 60 ? "…" : ""}"`
                        : "null"}
                </span>
                {" · "}a_relire: <span className="text-slate-600">true</span>
            </p>
        </div>
    );
}

export default SpikeS7;
