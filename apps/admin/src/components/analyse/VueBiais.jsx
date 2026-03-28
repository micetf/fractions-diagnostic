/**
 * @fileoverview VueBiais — vue biais redessinée (Module 5).
 *
 * v2.2 :
 *   - Tri : biais en alerte (≥ 30 %) en tête, puis par fréquence décroissante.
 *   - Barre de fréquence visuelle (% de la classe).
 *   - Prénoms cliquables → profil élève via onVoirProfil.
 *   - Bandeau si items A_VALIDER en attente (fréquences provisoires).
 *   - En-tête synthétique : nb de biais distincts + nb d'élèves touchés.
 *
 * @module components/analyse/VueBiais
 */
import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";
import { getBiais } from "@fractions-diagnostic/data/biais";
import { getMetadonnees } from "@fractions-diagnostic/data";
import {
    construireDistribBiais,
    depasseSeuil,
    collecterItemsARelire,
} from "@/utils/analyseSession";

// ─── Sous-composant : carte d'un biais ───────────────────────────────────────

/**
 * BiaisCard
 *
 * Carte d'un biais détecté avec fréquence, prénoms et recommandation.
 *
 * @param {object}   props
 * @param {string}   props.code
 * @param {string[]} props.eleveIds
 * @param {number[]} props.exerciceNumeros
 * @param {boolean}  props.alerte
 * @param {string|null} props.recommandation
 * @param {number}   props.nbPassations - Nb de passations terminées (dénominateur %).
 * @param {object[]} props.eleves
 * @param {function} props.onVoirProfil - (eleveId) → ouvre le profil.
 */
function BiaisCard({
    code,
    eleveIds,
    exerciceNumeros,
    alerte,
    recommandation,
    nbPassations,
    eleves,
    onVoirProfil,
}) {
    const def = getBiais(code);
    const pct =
        nbPassations > 0
            ? Math.round((eleveIds.length / nbPassations) * 100)
            : 0;

    return (
        <div
            className={`rounded-xl border overflow-hidden
                ${
                    alerte
                        ? "border-danger-200 bg-danger-50"
                        : "border-slate-200 bg-white"
                }`}
        >
            {/* ── En-tête ────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 px-4 pt-4 pb-3">
                <div className="flex-1 min-w-0">
                    {alerte && (
                        <span
                            className="inline-block text-xs font-semibold
                                         text-danger-700 bg-danger-100 rounded-full
                                         px-2 py-0.5 mb-1.5"
                        >
                            ⚠ Alerte classe
                        </span>
                    )}
                    <p
                        className={`font-semibold text-sm
                        ${alerte ? "text-danger-700" : "text-slate-800"}`}
                    >
                        {def?.intitule ?? code}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                        {def?.description ?? ""}
                    </p>
                </div>

                {/* Badge nb élèves */}
                <span
                    className={`shrink-0 text-xs font-semibold px-2.5 py-1
                                rounded-full whitespace-nowrap
                                ${
                                    alerte
                                        ? "bg-danger-100 text-danger-700"
                                        : "bg-slate-100 text-slate-600"
                                }`}
                >
                    {eleveIds.length} élève{eleveIds.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* ── Barre de fréquence ─────────────────────────────────────── */}
            <div className="px-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all
                                ${alerte ? "bg-danger-400" : "bg-slate-400"}`}
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    <span
                        className={`text-xs font-semibold w-10 text-right
                            ${alerte ? "text-danger-700" : "text-slate-600"}`}
                    >
                        {pct} %
                    </span>
                </div>
                <p className="text-xs text-slate-400">
                    de la classe · Exercice
                    {exerciceNumeros.length > 1 ? "s" : ""}{" "}
                    {exerciceNumeros
                        .sort((a, b) => a - b)
                        .map((n) => `Ex.${n}`)
                        .join(", ")}
                </p>
            </div>

            {/* ── Prénoms cliquables ─────────────────────────────────────── */}
            <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                {eleveIds.map((id) => {
                    const el = eleves.find((e) => e.id === id);
                    const prenom = el?.prenom ?? id;
                    return (
                        <button
                            key={id}
                            onClick={() => onVoirProfil(id)}
                            className={`text-xs px-2.5 py-1 rounded-full
                                        transition-colors cursor-pointer
                                        ${
                                            alerte
                                                ? "bg-danger-100 text-danger-700 hover:bg-danger-200"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                            title={`Voir le profil de ${prenom}`}
                        >
                            {prenom}
                        </button>
                    );
                })}
            </div>

            {/* ── Recommandation source (SRS F-ANA-05) ──────────────────── */}
            {alerte && recommandation && (
                <div className="mx-4 mb-4 pt-2 border-t border-danger-200">
                    <p className="text-xs font-semibold text-danger-700 mb-1">
                        Recommandation pédagogique (source)
                    </p>
                    <p className="text-xs text-danger-600 italic leading-relaxed">
                        {recommandation}
                    </p>
                </div>
            )}
        </div>
    );
}

BiaisCard.propTypes = {
    code: PropTypes.string.isRequired,
    eleveIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    exerciceNumeros: PropTypes.arrayOf(PropTypes.number).isRequired,
    alerte: PropTypes.bool.isRequired,
    recommandation: PropTypes.string,
    nbPassations: PropTypes.number.isRequired,
    eleves: PropTypes.array.isRequired,
    onVoirProfil: PropTypes.func.isRequired,
};

// ─── Composant principal ──────────────────────────────────────────────────────

/**
 * VueBiais
 *
 * Distribution des biais détectés, triée par fréquence.
 * Les biais en alerte (≥ 30 %) apparaissent en tête.
 * Les prénoms sont cliquables pour ouvrir le profil élève.
 *
 * @param {object}   props
 * @param {object}   props.session
 * @param {object[]} props.eleves
 * @param {function} props.onVoirProfil - (eleveId) → ouvre le profil.
 */
function VueBiais({ session, eleves, onVoirProfil }) {
    const { state } = useAppContext();

    const distribBiais = construireDistribBiais(session, state.passations);
    const meta = getMetadonnees(session.niveau);
    const nbAValider = collecterItemsARelire(session, state.passations).length;
    const nbPassations = state.passations.filter(
        (p) => p.diagnostic_id === session.id && p.statut === "terminee"
    ).length;

    // ── État vide ─────────────────────────────────────────────────────────────
    if (distribBiais.size === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-sm text-slate-400">
                    Aucun biais détecté sur cette session.
                </p>
                {nbAValider > 0 && (
                    <p className="text-xs text-review-600 mt-2">
                        ◎ {nbAValider} item{nbAValider !== 1 ? "s" : ""} en
                        attente de validation — des biais pourraient apparaître
                        après traitement.
                    </p>
                )}
            </div>
        );
    }

    // ── Construction des entrées enrichies ────────────────────────────────────
    const entrees = [...distribBiais.entries()].map(
        ([code, { eleveIds, exerciceNumeros }]) => {
            const alerte = exerciceNumeros.some((n) =>
                depasseSeuil(code, n, session, state.passations)
            );
            const recommandation = alerte
                ? (meta?.conseilsAnalyse?.find(
                      (c) =>
                          c.toLowerCase().includes(code.toLowerCase()) ||
                          exerciceNumeros.some((n) => c.includes(`${n}`))
                  ) ?? null)
                : null;
            return { code, eleveIds, exerciceNumeros, alerte, recommandation };
        }
    );

    // ── Tri : alertes en tête, puis fréquence décroissante ────────────────────
    entrees.sort((a, b) => {
        if (a.alerte !== b.alerte) return a.alerte ? -1 : 1;
        return b.eleveIds.length - a.eleveIds.length;
    });

    // ── Stats synthétiques ────────────────────────────────────────────────────
    const nbBiaisDistincts = entrees.length;
    const nbAlertes = entrees.filter((e) => e.alerte).length;
    const elevesTouches = new Set(entrees.flatMap((e) => e.eleveIds));

    return (
        <div>
            {/* ── En-tête synthétique ───────────────────────────────────── */}
            <div className="flex flex-wrap gap-3 mb-4">
                <span
                    className="text-xs px-3 py-1.5 rounded-full
                                 bg-slate-100 text-slate-600"
                >
                    {nbBiaisDistincts} biais distinct
                    {nbBiaisDistincts !== 1 ? "s" : ""}
                </span>
                <span
                    className="text-xs px-3 py-1.5 rounded-full
                                 bg-slate-100 text-slate-600"
                >
                    {elevesTouches.size} élève
                    {elevesTouches.size !== 1 ? "s" : ""} concerné
                    {elevesTouches.size !== 1 ? "s" : ""}
                </span>
                {nbAlertes > 0 && (
                    <span
                        className="text-xs px-3 py-1.5 rounded-full
                                     bg-danger-100 text-danger-700 font-semibold"
                    >
                        {nbAlertes} alerte{nbAlertes !== 1 ? "s" : ""} classe
                    </span>
                )}
            </div>

            {/* ── Bandeau données provisoires ───────────────────────────── */}
            {nbAValider > 0 && (
                <div
                    className="rounded-lg border border-review-200 bg-review-50
                                px-4 py-2.5 mb-4"
                >
                    <p className="text-xs text-review-700">
                        <span className="font-semibold">
                            ◎ {nbAValider} item{nbAValider !== 1 ? "s" : ""} en
                            attente de validation
                        </span>{" "}
                        — les fréquences affichées sont provisoires.
                    </p>
                </div>
            )}

            {/* ── Liste des biais ───────────────────────────────────────── */}
            <div className="flex flex-col gap-4">
                {entrees.map(
                    ({
                        code,
                        eleveIds,
                        exerciceNumeros,
                        alerte,
                        recommandation,
                    }) => (
                        <BiaisCard
                            key={code}
                            code={code}
                            eleveIds={eleveIds}
                            exerciceNumeros={exerciceNumeros}
                            alerte={alerte}
                            recommandation={recommandation}
                            nbPassations={nbPassations}
                            eleves={eleves}
                            onVoirProfil={onVoirProfil}
                        />
                    )
                )}
            </div>
        </div>
    );
}

VueBiais.propTypes = {
    session: PropTypes.object.isRequired,
    eleves: PropTypes.array.isRequired,
    onVoirProfil: PropTypes.func.isRequired,
};

export default VueBiais;
