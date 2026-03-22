import { useState } from "react";
import PropTypes from "prop-types";
import FractionInput from "@/components/exercices/FractionInput";

/**
 * SpikeFractionInput
 *
 * Page de démonstration pour S6 — à supprimer après validation.
 * Couvre les 3 situations documentées dans les sources :
 *   1. Saisie des deux champs → fraction complète
 *   2. Saisie du numérateur seul → dénominateur null (valeur diagnostique)
 *   3. Inversion num/dénom → biais détectable en S13
 *
 * @param {object}   props
 * @param {function} props.onNavigate
 */
function SpikeFractionInput({ onNavigate }) {
    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-semibold text-slate-800">
                    S6 — FractionInput
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
                <CasDeTest
                    titre="CE1 Ex.7 — Addition même dénominateur"
                    description="Réponse attendue : 3/5. Biais ADDITION_DENOMINATEURS → saisir 3/10."
                    scenarios={[
                        {
                            label: "Réponse correcte",
                            init: { numerateur: null, denominateur: null },
                        },
                        {
                            label: "Biais : addition dénom.",
                            init: { numerateur: null, denominateur: null },
                        },
                        {
                            label: "Numérateur seul (valeur diag)",
                            init: { numerateur: null, denominateur: null },
                        },
                    ]}
                />

                <CasDeTest
                    titre="CE1 Ex.2 — Lire une fraction"
                    description="Attendu : 2/5 pour A. Biais INVERSION_NUM_DENOM → saisir 5/2."
                    scenarios={[
                        {
                            label: "Correct : 2/5",
                            init: { numerateur: null, denominateur: null },
                        },
                        {
                            label: "Inversé : 5/2",
                            init: { numerateur: null, denominateur: null },
                        },
                    ]}
                />

                <CasDeTest
                    titre="CM2 Ex.6a — Addition dénominateurs différents"
                    description="Attendu : 13/8. Biais ADDITION_DENOMINATEURS → saisir 10/12."
                    scenarios={[
                        {
                            label: "Correct : 13/8",
                            init: { numerateur: null, denominateur: null },
                        },
                        {
                            label: "Biais : 10/12",
                            init: { numerateur: null, denominateur: null },
                        },
                    ]}
                />
            </div>
        </div>
    );
}

SpikeFractionInput.propTypes = {
    onNavigate: PropTypes.func.isRequired,
};

/* ── Cas de test ───────────────────────────────────────────────────────────── */

/**
 * CasDeTest
 *
 * @param {object} props
 * @param {string} props.titre
 * @param {string} props.description
 * @param {Array}  props.scenarios
 */
function CasDeTest({ titre, description, scenarios }) {
    const [valeurs, setValeurs] = useState(
        scenarios.map((s) => ({ ...s.init }))
    );

    function handleChange(i, fraction) {
        setValeurs((prev) => prev.map((v, j) => (j === i ? fraction : v)));
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-1">{titre}</h2>
            <p className="text-sm text-slate-500 mb-5">{description}</p>

            <div className="flex flex-wrap gap-8 items-end">
                {scenarios.map((scenario, i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                        <FractionInput
                            value={valeurs[i]}
                            onChange={(fraction) => handleChange(i, fraction)}
                            idPrefix={`cas-${titre.slice(0, 8).replace(/\s/g, "")}-${i}`}
                        />
                        <span className="text-xs text-slate-500 text-center max-w-24">
                            {scenario.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Valeurs enregistrées */}
            <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-2 font-mono">
                    Valeurs brutes enregistrées (structure
                    ReponseExercice.valeur_brute) :
                </p>
                <div className="flex flex-wrap gap-3">
                    {valeurs.map((v, i) => (
                        <div
                            key={i}
                            className="text-xs font-mono px-3 py-1.5 rounded-lg
                         bg-slate-50 border border-slate-200 text-slate-600"
                        >
                            <span className="text-slate-400">
                                {scenarios[i].label} →
                            </span>{" "}
                            num:{String(v.numerateur ?? "null")} dén:
                            {String(v.denominateur ?? "null")}
                        </div>
                    ))}
                </div>
            </div>

            {/* Reset */}
            <button
                onClick={() =>
                    setValeurs(scenarios.map((s) => ({ ...s.init })))
                }
                className="mt-3 text-xs text-slate-400 hover:text-slate-600
                   transition-colors cursor-pointer underline underline-offset-2"
            >
                Réinitialiser
            </button>
        </div>
    );
}

CasDeTest.propTypes = {
    titre: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    scenarios: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            init: PropTypes.object.isRequired,
        })
    ).isRequired,
};

export default SpikeFractionInput;
