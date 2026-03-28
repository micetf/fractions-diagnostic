import { useState } from "react";
import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";
import { getExercice } from "@fractions-diagnostic/data";
import { BIAIS } from "@fractions-diagnostic/data/biais";
import { collecterItemsARelire } from "@/utils/analyseSession";

/**
 * ItemsARevoir
 *
 * Vue consolidée des items à relire + attribution manuelle de biais
 * (SRS F-ANA-09, F-ANA-10).
 *
 * @param {object}   props
 * @param {object}   props.session
 * @param {object[]} props.eleves
 */
function ItemsARevoir({ session, eleves }) {
    const { state, dispatch } = useAppContext();

    const items = collecterItemsARelire(session, state.passations);

    if (items.length === 0) {
        return (
            <p className="text-sm text-slate-400 text-center py-8">
                Aucun item à relire pour cette session.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {items.map(({ passation_id, eleve_id, reponse }) => {
                const eleve = eleves.find((e) => e.id === eleve_id);
                const exercice = getExercice(
                    session.niveau,
                    reponse.exercice_numero
                );
                return (
                    <ItemCard
                        key={`${passation_id}-${reponse.exercice_numero}`}
                        passation_id={passation_id}
                        reponse={reponse}
                        eleve={eleve}
                        exercice={exercice}
                        dispatch={dispatch}
                    />
                );
            })}
        </div>
    );
}

ItemsARevoir.propTypes = {
    session: PropTypes.object.isRequired,
    eleves: PropTypes.array.isRequired,
};

/* ── ItemCard ────────────────────────────────────────────────────────────────── */

/**
 * ItemCard
 *
 * Carte d'un item à relire avec attribution manuelle de biais (SRS F-ANA-10).
 */
function ItemCard({ passation_id, reponse, eleve, exercice, dispatch }) {
    const biaisActuels = reponse.biais_manuel ?? [];
    const [selection, setSelection] = useState(new Set(biaisActuels));
    const [sauvegarde, setSauvegarde] = useState(true);

    function toggleBiais(code) {
        setSelection((prev) => {
            const next = new Set(prev);
            next.has(code) ? next.delete(code) : next.add(code);
            return next;
        });
        setSauvegarde(false);
    }

    function handleValider() {
        dispatch({
            type: "VALIDER_ITEM",
            payload: {
                passation_id,
                exercice_numero: reponse.exercice_numero,
                biais_manuel: [...selection],
            },
        });
        setSauvegarde(true);
    }

    function formaterValeur(v) {
        if (!v) return "—";
        if (typeof v === "string") return v || "(vide)";
        if (typeof v === "object" && "__explication" in v) {
            return v.__explication || "(vide)";
        }
        return JSON.stringify(v);
    }

    return (
        <div className="rounded-xl border border-review-200 bg-review-50 p-4">
            {/* En-tête */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                    <p className="font-semibold text-sm text-slate-800">
                        {eleve?.prenom ?? "?"}
                        {eleve?.nom ? ` ${eleve.nom}` : ""}
                        <span className="font-normal text-slate-500 ml-2">
                            Ex.{reponse.exercice_numero}
                        </span>
                    </p>
                    {exercice && (
                        <p className="text-xs text-slate-500 mt-0.5">
                            {exercice.competence}
                        </p>
                    )}
                </div>
                <span
                    className="text-xs px-2 py-0.5 rounded-full
                         bg-review-100 text-review-700 font-medium shrink-0"
                >
                    À relire
                </span>
            </div>

            {/* Valeur produite par l'élève */}
            <div className="rounded-lg bg-white border border-review-100 px-3 py-2 mb-4">
                <p className="text-xs text-slate-400 mb-1">
                    Réponse de l'élève
                </p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {formaterValeur(reponse.valeur_brute)}
                </p>
            </div>

            {/* Attribution manuelle de biais (SRS F-ANA-10) */}
            <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">
                    Attribuer un biais :
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                    {Object.values(BIAIS).map((biais) => (
                        <button
                            key={biais.code}
                            onClick={() => toggleBiais(biais.code)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors
                          cursor-pointer
                ${
                    selection.has(biais.code)
                        ? "bg-danger-500 border-danger-600 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:border-danger-300"
                }`}
                        >
                            {biais.intitule}
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    <span
                        className={`text-xs ${sauvegarde ? "text-slate-400" : "text-review-600"}`}
                    >
                        {sauvegarde ? "Validé" : "Non sauvegardé"}
                    </span>
                    <button
                        onClick={handleValider}
                        disabled={sauvegarde}
                        className="px-4 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600
                       text-white text-xs font-medium transition-colors cursor-pointer
                       disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Valider
                    </button>
                </div>
            </div>
        </div>
    );
}

ItemCard.propTypes = {
    passation_id: PropTypes.string.isRequired,
    reponse: PropTypes.object.isRequired,
    eleve: PropTypes.object,
    exercice: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
};

export default ItemsARevoir;
