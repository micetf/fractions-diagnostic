import { useState } from "react";
import PropTypes from "prop-types";
import FigureSelector from "@/components/exercices/FigureSelector";
import { figuresCE1Ex1 } from "@/components/exercices/figures/CE1Ex1";
import { figuresCE2Ex2 } from "@/components/exercices/figures/CE2Ex2";
import { figuresCM2Ex4 } from "@/components/exercices/figures/CM2Ex4";

/**
 * SpikeS8
 *
 * Page de démonstration temporaire pour S8.
 * À supprimer après validation.
 *
 * @param {object}   props
 * @param {function} props.onNavigate
 */
function SpikeS8({ onNavigate }) {
    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-semibold text-slate-800">
                    S8 — FigureSelector
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
                    titre="CE1 Ex.1 — Laquelle montre 1/4 ?"
                    description="Sélection multiple. Attendu : A et D. Biais EQUIPARTITION si B sélectionné."
                    figures={figuresCE1Ex1}
                    reponsesAttendues={["A", "D"]}
                    multiple
                />

                <CasDeTest
                    titre="CE2 Ex.2 — Fractions égales à 1/2"
                    description="Sélection multiple. Attendues : 2/4, 3/6, 5/10, 4/8."
                    figures={figuresCE2Ex2}
                    reponsesAttendues={["2/4", "3/6", "5/10", "4/8"]}
                    multiple
                />

                <CasDeTest
                    titre="CM2 Ex.4 — Fractions égales à 2/3"
                    description="Sélection multiple. Attendues : 6/9, 8/12, 10/15, 14/21, 4/6."
                    figures={figuresCM2Ex4}
                    reponsesAttendues={["6/9", "8/12", "10/15", "14/21", "4/6"]}
                    multiple
                />
            </div>
        </div>
    );
}

SpikeS8.propTypes = {
    onNavigate: PropTypes.func.isRequired,
};

/* ── Cas de test ───────────────────────────────────────────────────────────── */

function CasDeTest({
    titre,
    description,
    figures,
    reponsesAttendues,
    multiple,
}) {
    const [selection, setSelection] = useState([]);

    const toutCorrect =
        selection.length === reponsesAttendues.length &&
        reponsesAttendues.every((id) => selection.includes(id));

    const auMoinsUneErreur = selection.some(
        (id) => !reponsesAttendues.includes(id)
    );

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-1">{titre}</h2>
            <p className="text-sm text-slate-500 mb-5">{description}</p>

            <FigureSelector
                figures={figures}
                value={selection}
                onChange={setSelection}
                multiple={multiple}
            />

            {/* Résultat */}
            {selection.length > 0 && (
                <div
                    className={`mt-4 px-3 py-2 rounded-lg text-sm font-medium
          ${
              toutCorrect
                  ? "bg-success-100 text-success-700"
                  : auMoinsUneErreur
                    ? "bg-danger-100 text-danger-700"
                    : "bg-review-100 text-review-700"
          }`}
                >
                    {toutCorrect
                        ? "✓ Sélection correcte."
                        : auMoinsUneErreur
                          ? "Sélection incorrecte (figure non attendue)."
                          : "Sélection incomplète."}
                </div>
            )}

            {/* Valeur brute */}
            <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs font-mono text-slate-400">
                    valeur_brute →{" "}
                    <span className="text-slate-600">
                        [{selection.map((id) => `"${id}"`).join(", ")}]
                    </span>
                </p>
            </div>

            <button
                onClick={() => setSelection([])}
                className="mt-2 text-xs text-slate-400 hover:text-slate-600
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
    figures: PropTypes.array.isRequired,
    reponsesAttendues: PropTypes.arrayOf(PropTypes.string).isRequired,
    multiple: PropTypes.bool.isRequired,
};

export default SpikeS8;
