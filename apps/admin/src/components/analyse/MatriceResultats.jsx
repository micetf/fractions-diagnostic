import { useState } from "react";
import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";
import { getBiais } from "@/data/biais";
import { construireMatrice, etatReponse, ETATS } from "@/utils/analyseSession";

/**
 * Styles des cellules selon leur état.
 */
const STYLE_ETAT = {
    [ETATS.REUSSI]: "bg-success-100 text-success-700",
    [ETATS.BIAIS]: "bg-danger-100  text-danger-700",
    [ETATS.RELIRE]: "bg-review-100  text-review-700",
    [ETATS.NON_FAIT]: "bg-slate-50    text-slate-400",
};

const LABEL_ETAT = {
    [ETATS.REUSSI]: "✓",
    [ETATS.BIAIS]: "!",
    [ETATS.RELIRE]: "?",
    [ETATS.NON_FAIT]: "—",
};

/**
 * MatriceResultats
 *
 * Tableau élèves × exercices avec taux de réussite (SRS F-ANA-01, F-ANA-02).
 * Clic sur une cellule → popover de détail (SRS F-ANA-03).
 *
 * @param {object}   props
 * @param {object}   props.session
 * @param {object[]} props.eleves
 * @param {function} props.onVoirProfil - (eleveId) → ouvre le profil.
 */
function MatriceResultats({ session, eleves, onVoirProfil }) {
    const { state } = useAppContext();
    const [celluleActive, setCelluleActive] = useState(null);

    const { numeros, cellules, tauxReussite } = construireMatrice(
        session,
        state.passations,
        eleves
    );

    const passTerminees = state.passations.filter(
        (p) => p.diagnostic_id === session.id && p.statut === "terminee"
    ).length;

    function toggleCellule(eleveId, numero) {
        const key = `${eleveId}-${numero}`;
        setCelluleActive((prev) => (prev === key ? null : key));
    }

    return (
        <div>
            {/* Récap passations */}
            <p className="text-sm text-slate-500 mb-4">
                {passTerminees} passation{passTerminees !== 1 ? "s" : ""}{" "}
                terminée{passTerminees !== 1 ? "s" : ""}
                {" sur "}
                {eleves.length} élève{eleves.length !== 1 ? "s" : ""}
            </p>

            {passTerminees === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                    Aucune passation terminée pour cette session.
                </p>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-sm border-collapse">
                        {/* En-têtes exercices */}
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th
                                    className="px-4 py-2.5 text-left text-xs font-semibold
                                text-slate-500 uppercase tracking-wide min-w-32"
                                >
                                    Élève
                                </th>
                                {numeros.map((n) => (
                                    <th
                                        key={n}
                                        className="px-3 py-2.5 text-center text-xs font-semibold
                                  text-slate-500 uppercase tracking-wide min-w-16"
                                    >
                                        Ex.{n}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {eleves.map((eleve, i) => (
                                <tr
                                    key={eleve.id}
                                    className={
                                        i % 2 === 1
                                            ? "bg-slate-50/50"
                                            : "bg-white"
                                    }
                                >
                                    {/* Nom de l'élève */}
                                    <td className="px-4 py-2.5">
                                        <button
                                            onClick={() =>
                                                onVoirProfil(eleve.id)
                                            }
                                            className="font-medium text-slate-700 hover:text-brand-600
                                 transition-colors cursor-pointer text-left"
                                        >
                                            {eleve.prenom}
                                            {eleve.nom ? (
                                                <span className="text-slate-400 font-normal">
                                                    {" "}
                                                    {eleve.nom}
                                                </span>
                                            ) : null}
                                        </button>
                                    </td>

                                    {/* Cellules exercices */}
                                    {numeros.map((n) => {
                                        const reponse = cellules[eleve.id]?.[n];
                                        const etat = etatReponse(reponse);
                                        const key = `${eleve.id}-${n}`;
                                        const active = celluleActive === key;

                                        return (
                                            <td
                                                key={n}
                                                className="px-2 py-1.5 text-center relative"
                                            >
                                                <button
                                                    onClick={() =>
                                                        toggleCellule(
                                                            eleve.id,
                                                            n
                                                        )
                                                    }
                                                    className={`w-8 h-8 rounded-lg text-xs font-bold
                                      transition-colors cursor-pointer
                                      ${STYLE_ETAT[etat]}
                                      ${active ? "ring-2 ring-brand-400" : ""}`}
                                                    title={etat}
                                                >
                                                    {LABEL_ETAT[etat]}
                                                </button>

                                                {/* Popover détail (SRS F-ANA-03) */}
                                                {active && reponse && (
                                                    <DetailCellule
                                                        reponse={reponse}
                                                        onClose={() =>
                                                            setCelluleActive(
                                                                null
                                                            )
                                                        }
                                                    />
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}

                            {/* Ligne taux de réussite (SRS F-ANA-02) */}
                            <tr className="bg-slate-100 border-t-2 border-slate-200">
                                <td className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">
                                    Taux réussite
                                </td>
                                {numeros.map((n) => {
                                    const taux = tauxReussite[n];
                                    return (
                                        <td
                                            key={n}
                                            className="px-2 py-2 text-center"
                                        >
                                            {taux === null ? (
                                                <span className="text-xs text-slate-400">
                                                    —
                                                </span>
                                            ) : (
                                                <span
                                                    className={`text-xs font-semibold
                          ${
                              taux >= 0.7
                                  ? "text-success-700"
                                  : taux >= 0.4
                                    ? "text-review-700"
                                    : "text-danger-700"
                          }`}
                                                >
                                                    {Math.round(taux * 100)} %
                                                </span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* Légende */}
            <div className="flex flex-wrap gap-4 mt-3">
                {Object.entries(LABEL_ETAT).map(([etat, label]) => (
                    <span
                        key={etat}
                        className="flex items-center gap-1.5 text-xs text-slate-500"
                    >
                        <span
                            className={`w-5 h-5 rounded flex items-center justify-center
                              text-xs font-bold ${STYLE_ETAT[etat]}`}
                        >
                            {label}
                        </span>
                        {etat === ETATS.REUSSI
                            ? "Réussi"
                            : etat === ETATS.BIAIS
                              ? "Biais détecté"
                              : etat === ETATS.RELIRE
                                ? "À relire"
                                : "Non fait"}
                    </span>
                ))}
            </div>
        </div>
    );
}

MatriceResultats.propTypes = {
    session: PropTypes.object.isRequired,
    eleves: PropTypes.array.isRequired,
    onVoirProfil: PropTypes.func.isRequired,
};

/* ── DetailCellule ───────────────────────────────────────────────────────────── */

/**
 * DetailCellule
 *
 * Popover affichant la valeur brute et les biais d'une cellule (SRS F-ANA-03).
 * S'affiche en absolu, centré sur la cellule.
 *
 * @param {object}   props
 * @param {object}   props.reponse
 * @param {string}   props.niveau
 * @param {function} props.onClose
 */
function DetailCellule({ reponse, onClose }) {
    const tousLesBiais = [
        ...(reponse.biais_auto ?? []),
        ...(reponse.biais_manuel ?? []),
    ];

    function formaterValeur(v) {
        if (v === null || v === undefined) return "—";
        if (typeof v === "string") return v || "(vide)";
        if (typeof v === "boolean") return v ? "Oui" : "Non";
        if (Array.isArray(v)) return v.length > 0 ? v.join(", ") : "(aucune)";
        if (typeof v === "object") {
            if ("numerateur" in v) {
                if (v.numerateur === null) return "—";
                return `${v.numerateur} / ${v.denominateur ?? "?"}`;
            }
            // Objet composé : afficher clé: valeur
            return Object.entries(v)
                .filter(([k]) => k !== "__explication")
                .map(([k, val]) => `${k}: ${formaterValeur(val)}`)
                .join(" · ");
        }
        return String(v);
    }

    const duree = reponse.duree_ms
        ? reponse.duree_ms < 60000
            ? `${Math.round(reponse.duree_ms / 1000)} s`
            : `${Math.round(reponse.duree_ms / 60000)} min`
        : null;

    return (
        <div
            className="absolute z-20 left-1/2 -translate-x-1/2 top-10
                 w-64 bg-white rounded-xl border border-slate-200 shadow-lg p-4 text-left"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Fermeture */}
            <button
                onClick={onClose}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600
                   cursor-pointer text-lg leading-none"
                aria-label="Fermer"
            >
                ×
            </button>

            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Exercice {reponse.exercice_numero}
                {duree ? (
                    <span className="ml-2 font-normal normal-case">
                        ({duree})
                    </span>
                ) : null}
            </p>

            {/* Valeur brute */}
            <div className="mb-3">
                <p className="text-xs text-slate-400 mb-0.5">Réponse</p>
                <p className="text-sm font-mono text-slate-700 break-all">
                    {formaterValeur(reponse.valeur_brute)}
                </p>
            </div>

            {/* Biais (SRS F-ANA-06 : description verbatim source) */}
            {tousLesBiais.length > 0 && (
                <div className="flex flex-col gap-2">
                    {tousLesBiais.map((code) => {
                        const def = getBiais(code);
                        return (
                            <div
                                key={code}
                                className="rounded-lg bg-danger-50 border border-danger-100 px-3 py-2"
                            >
                                <p className="text-xs font-semibold text-danger-700 mb-0.5">
                                    {def?.intitule ?? code}
                                </p>
                                <p className="text-xs text-danger-600">
                                    {def?.description ?? ""}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}

            {reponse.a_relire && tousLesBiais.length === 0 && (
                <p className="text-xs text-review-600 bg-review-50 rounded-lg px-3 py-2">
                    Item à relire manuellement.
                </p>
            )}
        </div>
    );
}

DetailCellule.propTypes = {
    reponse: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default MatriceResultats;
