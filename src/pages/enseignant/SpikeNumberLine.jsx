import { useState } from "react";
import PropTypes from "prop-types";
import NumberLine from "@/components/exercices/NumberLine";

/**
 * SpikeNumberLine
 *
 * Page de démonstration temporaire pour le SPIKE S10.
 * Valide le composant NumberLine sur les 3 configurations
 * réelles issues des exercices sources.
 *
 * À SUPPRIMER après validation du SPIKE.
 *
 * @param {object}   props
 * @param {function} props.onNavigate
 */
function SpikeNumberLine({ onNavigate }) {
    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            {/* En-tête */}
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-semibold text-slate-800">
                    SPIKE S10 — NumberLine
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
                Fichier temporaire — à supprimer après validation. Critère de
                succès : drag fluide, snap correct, valeur fraction juste sur
                les 3 configs.
            </p>

            <div className="space-y-10">
                <CasDeTest
                    titre="CE2 Ex.4 — Huitièmes (0 à 1)"
                    description="Placer 1/8, 3/8, 4/8, 6/8 sur la règle graduée en huitièmes."
                    graduation={{ denominateur: 8, min: 0, max: 1 }}
                    fractionsTest={[
                        { label: "1/8", n: 1, d: 8 },
                        { label: "3/8", n: 3, d: 8 },
                        { label: "4/8", n: 4, d: 8 },
                        { label: "6/8", n: 6, d: 8 },
                    ]}
                />

                <CasDeTest
                    titre="CM1 Ex.3 — Quarts (0 à 2)"
                    description="Placer 3/4, 5/4, 8/4, 7/4, 4/4. Le point 5/4 doit dépasser 1."
                    graduation={{ denominateur: 4, min: 0, max: 2 }}
                    fractionsTest={[
                        { label: "3/4", n: 3, d: 4 },
                        { label: "5/4", n: 5, d: 4 },
                        { label: "4/4", n: 4, d: 4 },
                    ]}
                />

                <CasDeTest
                    titre="CM2 Ex.3 — Tiers (0 à 4)"
                    description="Placer 5/3, 7/3, 10/3, 9/3. Tester 9/3 = 3 (entier)."
                    graduation={{ denominateur: 3, min: 0, max: 4 }}
                    fractionsTest={[
                        { label: "5/3", n: 5, d: 3 },
                        { label: "9/3", n: 9, d: 3 },
                        { label: "10/3", n: 10, d: 3 },
                    ]}
                />
            </div>
        </div>
    );
}

SpikeNumberLine.propTypes = {
    onNavigate: PropTypes.func.isRequired,
};

/* ─── Cas de test ──────────────────────────────────────────────────────────── */

/**
 * CasDeTest
 *
 * Affiche une configuration de NumberLine avec plusieurs points
 * indépendants pour tester le placement de fractions multiples.
 *
 * @param {object} props
 * @param {string} props.titre
 * @param {string} props.description
 * @param {object} props.graduation
 * @param {Array}  props.fractionsTest
 */
function CasDeTest({ titre, description, graduation, fractionsTest }) {
    // État indépendant pour chaque point
    const [valeurs, setValeurs] = useState(
        Object.fromEntries(fractionsTest.map((f) => [f.label, null]))
    );

    function handleChange(label, fraction) {
        setValeurs((prev) => ({ ...prev, [label]: fraction }));
    }

    // Toutes les valeurs placées ?
    const toutPlace = Object.values(valeurs).every((v) => v !== null);
    const toutCorrect =
        toutPlace &&
        fractionsTest.every((f) => {
            const v = valeurs[f.label];
            // Comparer la valeur décimale (dénominateurs peuvent différer)
            return (
                v && Math.abs(v.numerateur / v.denominateur - f.n / f.d) < 0.001
            );
        });

    const COULEURS = ["#2f5ee8", "#d97706", "#15803d", "#b91c1c", "#7c3aed"];

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-1">{titre}</h2>
            <p className="text-sm text-slate-500 mb-4">{description}</p>

            {/* Un NumberLine par fraction à placer */}
            <div className="space-y-2">
                {fractionsTest.map((f, i) => (
                    <NumberLine
                        key={f.label}
                        graduation={graduation}
                        value={valeurs[f.label]}
                        onChange={(fraction) => handleChange(f.label, fraction)}
                        couleur={COULEURS[i % COULEURS.length]}
                        etiquette={f.label}
                    />
                ))}
            </div>

            {/* Résultat */}
            {toutPlace && (
                <div
                    className={`mt-4 px-3 py-2 rounded-lg text-sm font-medium
          ${
              toutCorrect
                  ? "bg-success-100 text-success-700"
                  : "bg-danger-100 text-danger-700"
          }`}
                >
                    {toutCorrect
                        ? "✓ Toutes les positions sont correctes."
                        : "Positions incorrectes — vérifier le snap."}
                </div>
            )}

            {/* Tableau des valeurs courantes */}
            <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-2 font-mono">
                    Valeurs enregistrées :
                </p>
                <div className="flex flex-wrap gap-3">
                    {fractionsTest.map((f) => {
                        const v = valeurs[f.label];
                        const correct =
                            v &&
                            Math.abs(
                                v.numerateur / v.denominateur - f.n / f.d
                            ) < 0.001;
                        return (
                            <div
                                key={f.label}
                                className={`text-xs font-mono px-3 py-1.5 rounded-lg border
                     ${
                         v === null
                             ? "bg-slate-50 text-slate-400 border-slate-200"
                             : correct
                               ? "bg-success-100 text-success-700 border-success-200"
                               : "bg-danger-100 text-danger-700 border-danger-200"
                     }`}
                            >
                                <span className="font-semibold">{f.label}</span>
                                {" → "}
                                {v === null
                                    ? "non placé"
                                    : `${v.numerateur}/${v.denominateur}`}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bouton reset */}
            <button
                onClick={() =>
                    setValeurs(
                        Object.fromEntries(
                            fractionsTest.map((f) => [f.label, null])
                        )
                    )
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
    graduation: PropTypes.object.isRequired,
    fractionsTest: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            n: PropTypes.number.isRequired,
            d: PropTypes.number.isRequired,
        })
    ).isRequired,
};

export default SpikeNumberLine;
