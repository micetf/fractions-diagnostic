/**
 * @fileoverview MatriceResultats — matrice redessinée (Module 4).
 *
 * v2.2 :
 *   - scoreReponse() (5 états) remplace etatReponse() (4 états).
 *   - ECHEC : nouvel état distinct de BIAIS et NON_FAIT.
 *   - A_VALIDER : remplace RELIRE — état transitoire actionnable.
 *   - Colonne score par élève (taux sur items évalués).
 *   - Taux par exercice recalculé via scoreReponse().
 *   - Bandeau d'alerte si items A_VALIDER en attente.
 *   - onVoirProfil conservé (clic sur le prénom).
 *
 * @module components/analyse/MatriceResultats
 */
import { useState } from "react";
import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";
import { getBiais } from "@fractions-diagnostic/data/biais";
import { construireMatrice, scoreReponse, SCORE } from "@/utils/analyseSession";

// ─── Styles et labels par état ────────────────────────────────────────────────

const STYLE_SCORE = {
    [SCORE.REUSSI]: "bg-success-100 text-success-700 hover:bg-success-200",
    [SCORE.BIAIS]: "bg-danger-100  text-danger-700  hover:bg-danger-200",
    [SCORE.ECHEC]: "bg-orange-100  text-orange-700  hover:bg-orange-200",
    [SCORE.A_VALIDER]: "bg-review-100  text-review-700  hover:bg-review-200",
    [SCORE.NON_FAIT]: "bg-slate-50    text-slate-400   hover:bg-slate-100",
};

const LABEL_SCORE = {
    [SCORE.REUSSI]: "✓",
    [SCORE.BIAIS]: "!",
    [SCORE.ECHEC]: "✗",
    [SCORE.A_VALIDER]: "◎",
    [SCORE.NON_FAIT]: "—",
};

const LIBELLE_SCORE = {
    [SCORE.REUSSI]: "Réussi",
    [SCORE.BIAIS]: "Biais détecté",
    [SCORE.ECHEC]: "Échec",
    [SCORE.A_VALIDER]: "À valider",
    [SCORE.NON_FAIT]: "Non fait",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Formate une valeur brute en texte lisible.
 * @param {any} v
 * @returns {string}
 */
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
        return Object.entries(v)
            .filter(([k]) => !k.startsWith("__"))
            .map(([k, val]) => `${k}: ${formaterValeur(val)}`)
            .join(" · ");
    }
    return String(v);
}

/**
 * Classe Tailwind pour un taux de réussite donné.
 * @param {number|null} taux
 * @returns {string}
 */
function couleurTaux(taux) {
    if (taux === null) return "text-slate-400";
    if (taux >= 0.7) return "text-success-700 font-semibold";
    if (taux >= 0.4) return "text-review-700  font-semibold";
    return "text-danger-700 font-semibold";
}

// ─── Sous-composant : popover détail cellule ──────────────────────────────────

/**
 * DetailCellule
 *
 * Popover affichant le score, la valeur brute et les biais d'une cellule.
 *
 * @param {object}   props
 * @param {object}   props.reponse
 * @param {function} props.onClose
 * @param {function} props.onValider - Ouvre l'onglet À valider.
 */
function DetailCellule({ reponse, onClose, onValider }) {
    const score = scoreReponse(reponse);
    const tousLesBiais = [
        ...(reponse.biais_auto ?? []),
        ...(reponse.biais_manuel ?? []),
    ];
    const duree = reponse.duree_ms
        ? reponse.duree_ms < 60000
            ? `${Math.round(reponse.duree_ms / 1000)} s`
            : `${Math.round(reponse.duree_ms / 60000)} min`
        : null;

    return (
        <div
            className="absolute z-20 left-1/2 -translate-x-1/2 top-10
                        w-64 bg-white rounded-xl border border-slate-200
                        shadow-lg p-4 text-left"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Fermeture */}
            <button
                onClick={onClose}
                className="absolute top-2 right-2 text-slate-400
                           hover:text-slate-600 cursor-pointer text-lg leading-none"
                aria-label="Fermer"
            >
                ×
            </button>

            {/* En-tête */}
            <p
                className="text-xs font-semibold text-slate-500 uppercase
                          tracking-wide mb-2"
            >
                Exercice {reponse.exercice_numero}
                {duree && (
                    <span className="ml-2 font-normal normal-case">
                        ({duree})
                    </span>
                )}
            </p>

            {/* Badge état */}
            <span
                className={`inline-flex items-center gap-1 text-xs font-semibold
                            px-2 py-0.5 rounded-full mb-3
                            ${STYLE_SCORE[score].split(" ").slice(0, 2).join(" ")}`}
            >
                {LABEL_SCORE[score]} {LIBELLE_SCORE[score]}
            </span>

            {/* Valeur brute */}
            <div className="mb-3">
                <p className="text-xs text-slate-400 mb-0.5">Réponse</p>
                <p className="text-sm font-mono text-slate-700 break-all">
                    {formaterValeur(reponse.valeur_brute)}
                </p>
            </div>

            {/* Biais */}
            {tousLesBiais.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                    {tousLesBiais.map((code) => {
                        const def = getBiais(code);
                        return (
                            <div
                                key={code}
                                className="rounded-lg bg-danger-50 border
                                           border-danger-100 px-3 py-2"
                            >
                                <p
                                    className="text-xs font-semibold
                                              text-danger-700 mb-0.5"
                                >
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

            {/* Validation manuelle posée */}
            {reponse.validation_manuelle === "echec" && (
                <p
                    className="text-xs text-orange-600 bg-orange-50
                              rounded-lg px-3 py-2 mb-2"
                >
                    Échec confirmé manuellement.
                </p>
            )}

            {/* Lien vers validation si A_VALIDER */}
            {score === SCORE.A_VALIDER && (
                <button
                    onClick={() => {
                        onClose();
                        onValider();
                    }}
                    className="w-full mt-1 text-xs text-review-700 bg-review-50
                               hover:bg-review-100 border border-review-200
                               rounded-lg px-3 py-2 text-center transition-colors
                               cursor-pointer"
                >
                    Aller à « À valider » →
                </button>
            )}
        </div>
    );
}

DetailCellule.propTypes = {
    reponse: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onValider: PropTypes.func.isRequired,
};

// ─── Composant principal ──────────────────────────────────────────────────────

/**
 * MatriceResultats
 *
 * Tableau élèves × exercices avec taux de réussite (SRS F-ANA-01, F-ANA-02).
 * Clic sur cellule → popover de détail.
 * Clic sur prénom  → profil élève.
 *
 * @param {object}   props
 * @param {object}   props.session
 * @param {object[]} props.eleves
 * @param {function} props.onVoirProfil - (eleveId) → ouvre le profil.
 * @param {function} props.onValider    - Bascule vers l'onglet "À valider".
 */
function MatriceResultats({ session, eleves, onVoirProfil, onValider }) {
    const { state } = useAppContext();
    const [celluleActive, setCelluleActive] = useState(null);

    const { numeros, cellules, scoresEleves } = construireMatrice(
        session,
        state.passations,
        eleves
    );

    const passTerminees = state.passations.filter(
        (p) => p.diagnostic_id === session.id && p.statut === "terminee"
    );

    // ── Taux de réussite par exercice (scoreReponse) ──────────────────────────
    const tauxScore = {};
    for (const numero of numeros) {
        const reponsesExo = passTerminees
            .map((p) => p.reponses.find((r) => r.exercice_numero === numero))
            .filter(Boolean);
        if (reponsesExo.length === 0) {
            tauxScore[numero] = null;
            continue;
        }
        const evalues = reponsesExo.filter(
            (r) =>
                scoreReponse(r) !== SCORE.NON_FAIT &&
                scoreReponse(r) !== SCORE.A_VALIDER
        ).length;
        const reussies = reponsesExo.filter(
            (r) => scoreReponse(r) === SCORE.REUSSI
        ).length;
        tauxScore[numero] = evalues > 0 ? reussies / evalues : null;
    }

    // ── Comptage des items A_VALIDER (bandeau d'alerte) ───────────────────────
    const nbAValider = [...scoresEleves.values()].reduce(
        (acc, s) => acc + (s?.aValider ?? 0),
        0
    );

    function toggleCellule(eleveId, numero) {
        const key = `${eleveId}-${numero}`;
        setCelluleActive((prev) => (prev === key ? null : key));
    }

    return (
        <div>
            {/* Récap passations */}
            <p className="text-sm text-slate-500 mb-3">
                {passTerminees.length} passation
                {passTerminees.length !== 1 ? "s" : ""} terminée
                {passTerminees.length !== 1 ? "s" : ""} sur {eleves.length}{" "}
                élève
                {eleves.length !== 1 ? "s" : ""}
            </p>

            {/* Bandeau d'alerte A_VALIDER */}
            {nbAValider > 0 && (
                <div
                    className="flex items-center justify-between gap-3
                                rounded-lg border border-review-200 bg-review-50
                                px-4 py-2.5 mb-4"
                >
                    <p className="text-xs text-review-700">
                        <span className="font-semibold">
                            ◎ {nbAValider} item
                            {nbAValider !== 1 ? "s" : ""} en attente de
                            validation
                        </span>{" "}
                        — les taux affichés sont provisoires.
                    </p>
                    <button
                        onClick={onValider}
                        className="shrink-0 text-xs font-medium text-review-700
                                   underline hover:no-underline cursor-pointer"
                    >
                        Valider →
                    </button>
                </div>
            )}

            {passTerminees.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                    Aucune passation terminée pour cette session.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="border-collapse text-sm w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th
                                    className="text-left px-4 py-2.5 text-xs
                                               font-semibold text-slate-500 uppercase
                                               tracking-wide min-w-32.5"
                                >
                                    Élève
                                </th>
                                {numeros.map((n) => (
                                    <th
                                        key={n}
                                        className="px-2 py-2.5 text-xs font-semibold
                                                   text-slate-500 text-center min-w-11"
                                    >
                                        Ex.{n}
                                    </th>
                                ))}
                                <th
                                    className="px-3 py-2.5 text-xs font-semibold
                                               text-slate-500 text-center min-w-15"
                                >
                                    Score
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {eleves.map((eleve) => {
                                const score = scoresEleves.get(eleve.id);
                                return (
                                    <tr
                                        key={eleve.id}
                                        className="border-b border-slate-100
                                                   hover:bg-slate-50 transition-colors"
                                    >
                                        {/* Prénom — clic → profil */}
                                        <td className="px-4 py-2">
                                            <button
                                                onClick={() =>
                                                    onVoirProfil(eleve.id)
                                                }
                                                className="text-sm font-medium
                                                           text-slate-700 hover:text-brand-600
                                                           transition-colors cursor-pointer
                                                           text-left"
                                            >
                                                {eleve.prenom}
                                                {eleve.nom ? (
                                                    <span
                                                        className="text-slate-400
                                                                     font-normal ml-1"
                                                    >
                                                        {eleve.nom[0]}.
                                                    </span>
                                                ) : null}
                                            </button>
                                        </td>

                                        {/* Cellules exercices */}
                                        {numeros.map((numero) => {
                                            const reponse =
                                                cellules[eleve.id]?.[numero];
                                            const etat = reponse
                                                ? scoreReponse(reponse)
                                                : SCORE.NON_FAIT;
                                            const key = `${eleve.id}-${numero}`;
                                            const active =
                                                celluleActive === key;

                                            return (
                                                <td
                                                    key={numero}
                                                    className="px-2 py-2 text-center relative"
                                                >
                                                    <button
                                                        onClick={() =>
                                                            reponse
                                                                ? toggleCellule(
                                                                      eleve.id,
                                                                      numero
                                                                  )
                                                                : null
                                                        }
                                                        className={`w-8 h-8 rounded-lg text-xs
                                                                    font-bold transition-colors
                                                                    ${STYLE_SCORE[etat]}
                                                                    ${reponse ? "cursor-pointer" : "cursor-default"}
                                                                    ${active ? "ring-2 ring-brand-400" : ""}`}
                                                        title={
                                                            LIBELLE_SCORE[etat]
                                                        }
                                                    >
                                                        {LABEL_SCORE[etat]}
                                                    </button>

                                                    {active && reponse && (
                                                        <DetailCellule
                                                            reponse={reponse}
                                                            onClose={() =>
                                                                setCelluleActive(
                                                                    null
                                                                )
                                                            }
                                                            onValider={
                                                                onValider
                                                            }
                                                        />
                                                    )}
                                                </td>
                                            );
                                        })}

                                        {/* Colonne score élève */}
                                        <td className="px-3 py-2 text-center">
                                            {score === null ? (
                                                <span className="text-xs text-slate-400">
                                                    —
                                                </span>
                                            ) : (
                                                <span
                                                    className={`text-xs ${couleurTaux(score.tauxReussite)}`}
                                                    title={
                                                        score.aValiderPending
                                                            ? "Taux provisoire — items en attente"
                                                            : undefined
                                                    }
                                                >
                                                    {score.aValiderPending && (
                                                        <span className="text-review-500 mr-0.5">
                                                            ~
                                                        </span>
                                                    )}
                                                    {score.tauxReussite !== null
                                                        ? `${Math.round(score.tauxReussite * 100)} %`
                                                        : "—"}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* Ligne taux de réussite par exercice */}
                            <tr className="bg-slate-100 border-t-2 border-slate-200">
                                <td
                                    className="px-4 py-2.5 text-xs font-semibold
                                               text-slate-500 uppercase tracking-wide"
                                >
                                    Taux classe
                                </td>
                                {numeros.map((n) => {
                                    const taux = tauxScore[n];
                                    return (
                                        <td
                                            key={n}
                                            className="px-2 py-2 text-center"
                                        >
                                            <span
                                                className={`text-xs ${couleurTaux(taux)}`}
                                            >
                                                {taux === null
                                                    ? "—"
                                                    : `${Math.round(taux * 100)} %`}
                                            </span>
                                        </td>
                                    );
                                })}
                                {/* Cellule vide sous "Score" */}
                                <td />
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* Légende */}
            <div className="flex flex-wrap gap-3 mt-4">
                {Object.entries(LIBELLE_SCORE).map(([etat, libelle]) => (
                    <span
                        key={etat}
                        className="flex items-center gap-1.5 text-xs text-slate-500"
                    >
                        <span
                            className={`w-5 h-5 rounded flex items-center
                                        justify-center text-xs font-bold
                                        ${STYLE_SCORE[etat].split(" ").slice(0, 2).join(" ")}`}
                        >
                            {LABEL_SCORE[etat]}
                        </span>
                        {libelle}
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
    onValider: PropTypes.func.isRequired,
};

export default MatriceResultats;
