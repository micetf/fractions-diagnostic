/**
 * @fileoverview ItemsARevoir — file de validation rapide (Module 3).
 *
 * Remplace l'ancienne vue "À relire" par une interface de traitement
 * en un clic par item.
 *
 * Trois actions par item :
 *   - Réussi    → biais_manuel: [], validation_manuelle: null,  a_relire: false
 *   - Biais     → biais_manuel: [code], validation_manuelle: null, a_relire: false
 *   - Échec     → biais_manuel: [], validation_manuelle: 'echec', a_relire: false
 *
 * Seuls les items dont scoreReponse() === SCORE.A_VALIDER apparaissent
 * (binary_choice et selection sont exclus — auto-évalués par scoreReponse).
 *
 * @module components/analyse/ItemsARevoir
 */
import { useState } from "react";
import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";
import { getExercice } from "@fractions-diagnostic/data";
import { collecterItemsARelire } from "@/utils/analyseSession";

// ─── Helpers — formatage de la production élève ───────────────────────────────

/**
 * Extrait le(s) biais détectables via text_review d'un nœud exercice.
 * Parcourt récursivement les sousQuestions.
 *
 * @param {object} noeud - Exercice ou sous-question.
 * @returns {{ code: string, intitule?: string, ceQueRevele: string }[]}
 */
function extraireBiaisTextReview(noeud) {
    if (!noeud) return [];
    const directs = (noeud.biaisDetectables ?? []).filter(
        (b) => b.declencheur?.type === "text_review"
    );
    const recursifs = (noeud.sousQuestions ?? []).flatMap(
        extraireBiaisTextReview
    );
    return [...directs, ...recursifs];
}

/**
 * Retourne le résumé lisible d'un coloriage booléen.
 *
 * @param {boolean[]} tableau
 * @param {number|undefined} attendu - Nombre de parts attendues.
 * @returns {{ nb: number, total: number, attendu: number|null }}
 */
function resumeColoriage(tableau, attendu) {
    const nb = tableau.filter(Boolean).length;
    return { nb, total: tableau.length, attendu: attendu ?? null };
}

/**
 * Retourne les textes libres contenus dans une valeur brute composite.
 * Extrait __justification, __explication, et les clés de type string non vides.
 *
 * @param {any} valeur
 * @returns {string[]}
 */
function extraireTextes(valeur) {
    if (!valeur || typeof valeur !== "object") return [];
    return Object.entries(valeur)
        .filter(([, v]) => typeof v === "string" && v.trim() !== "")
        .map(([k, v]) => {
            if (k === "__justification") return `Justification : ${v}`;
            if (k === "__explication") return `Explication : ${v}`;
            return v;
        });
}

// ─── Sous-composant : rendu visuel du coloriage ───────────────────────────────

/**
 * ColoriageVisuel
 *
 * Affiche un tableau booléen sous forme de cases colorées / vides.
 * Maximum 20 cases affichées pour lisibilité.
 *
 * @param {object} props
 * @param {boolean[]} props.cases
 * @param {number|undefined} props.attendu
 */
function ColoriageVisuel({ cases, attendu }) {
    const { nb } = resumeColoriage(cases, attendu);
    const affichees = cases.slice(0, 20);

    return (
        <div>
            <div className="flex flex-wrap gap-1 mb-1.5">
                {affichees.map((col, i) => (
                    <span
                        key={i}
                        className={`inline-block w-5 h-5 rounded-sm border
                            ${
                                col
                                    ? "bg-brand-400 border-brand-500"
                                    : "bg-white border-slate-300"
                            }`}
                    />
                ))}
                {cases.length > 20 && (
                    <span className="text-xs text-slate-400 self-center ml-1">
                        +{cases.length - 20}
                    </span>
                )}
            </div>
            <p className="text-xs text-slate-500">
                {nb} case{nb !== 1 ? "s" : ""} coloriée{nb !== 1 ? "s" : ""}
                {attendu != null && (
                    <span
                        className={`ml-1 font-medium
                            ${
                                nb === attendu
                                    ? "text-success-600"
                                    : "text-danger-600"
                            }`}
                    >
                        ({attendu} attendue{attendu !== 1 ? "s" : ""})
                    </span>
                )}
            </p>
        </div>
    );
}

ColoriageVisuel.propTypes = {
    cases: PropTypes.arrayOf(PropTypes.bool).isRequired,
    attendu: PropTypes.number,
};

// ─── Sous-composant : production de l'élève ───────────────────────────────────

/**
 * ProductionEleve
 *
 * Affiche la valeur brute de manière lisible selon le type de réponse.
 *
 * @param {object} props
 * @param {any}    props.valeur - ReponseExercice.valeur_brute
 * @param {string} props.type  - ReponseExercice.type
 * @param {object} props.exercice - Définition de l'exercice (pour partiesAttendues)
 */
function ProductionEleve({ valeur, type, exercice }) {
    if (!valeur)
        return <p className="text-sm text-slate-400 italic">Aucune réponse.</p>;

    // ── Texte libre ──────────────────────────────────────────────────────────
    if (type === "text") {
        return (
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {typeof valeur === "string" && valeur.trim() ? (
                    valeur
                ) : (
                    <span className="italic text-slate-400">(texte vide)</span>
                )}
            </p>
        );
    }

    // ── Coloriage — tableau plat ──────────────────────────────────────────────
    if (type === "coloring" && Array.isArray(valeur)) {
        const attendu =
            exercice?.partiesAttendues ?? exercice?.partiesAColorier ?? null;
        return <ColoriageVisuel cases={valeur} attendu={attendu} />;
    }

    // ── Coloriage — multi-figures ─────────────────────────────────────────────
    if (type === "coloring" && typeof valeur === "object") {
        return (
            <div className="flex flex-col gap-2">
                {Object.entries(valeur).map(([id, cases]) => {
                    const fig = exercice?.figures?.find((f) => f.id === id);
                    return (
                        <div key={id}>
                            <p className="text-xs text-slate-400 mb-1">
                                Figure {id}
                            </p>
                            <ColoriageVisuel
                                cases={cases}
                                attendu={fig?.partiesAttendues ?? null}
                            />
                        </div>
                    );
                })}
            </div>
        );
    }

    // ── Compound (textes extraits) ────────────────────────────────────────────
    if (type === "compound" && typeof valeur === "object") {
        const textes = extraireTextes(valeur);
        if (textes.length === 0)
            return (
                <p className="text-sm text-slate-400 italic">
                    Aucun texte libre.
                </p>
            );
        return (
            <div className="flex flex-col gap-1">
                {textes.map((t, i) => (
                    <p
                        key={i}
                        className="text-sm text-slate-700 whitespace-pre-wrap"
                    >
                        {t}
                    </p>
                ))}
            </div>
        );
    }

    // ── Fallback ─────────────────────────────────────────────────────────────
    return (
        <p className="text-sm text-slate-500 font-mono break-all">
            {JSON.stringify(valeur)}
        </p>
    );
}

ProductionEleve.propTypes = {
    valeur: PropTypes.any,
    type: PropTypes.string.isRequired,
    exercice: PropTypes.object,
};

// ─── Sous-composant : carte d'un item ─────────────────────────────────────────

/**
 * ItemCard
 *
 * Carte de validation rapide d'un item A_VALIDER.
 * Trois actions immédiates : Réussi / Biais / Échec.
 *
 * @param {object}   props
 * @param {string}   props.passation_id
 * @param {object}   props.reponse
 * @param {object}   props.eleve
 * @param {object}   props.exercice
 * @param {function} props.dispatch
 */
function ItemCard({ passation_id, reponse, eleve, exercice, dispatch }) {
    const [biaisOuvert, setBiaisOuvert] = useState(false);

    // Biais spécifiques à cet item (text_review uniquement — les autres sont auto)
    const biaisDisponibles = extraireBiaisTextReview(exercice);

    /**
     * Valide l'item comme réussi (sans biais).
     */
    function handleReussi() {
        dispatch({
            type: "VALIDER_ITEM",
            payload: {
                passation_id,
                exercice_numero: reponse.exercice_numero,
                biais_manuel: [],
                validation_manuelle: null,
            },
        });
    }

    /**
     * Valide l'item comme échec (sans biais identifié).
     */
    function handleEchec() {
        dispatch({
            type: "VALIDER_ITEM",
            payload: {
                passation_id,
                exercice_numero: reponse.exercice_numero,
                biais_manuel: [],
                validation_manuelle: "echec",
            },
        });
    }

    /**
     * Valide l'item avec un biais identifié.
     *
     * @param {string} code - Code du biais sélectionné.
     */
    function handleBiais(code) {
        dispatch({
            type: "VALIDER_ITEM",
            payload: {
                passation_id,
                exercice_numero: reponse.exercice_numero,
                biais_manuel: [code],
                validation_manuelle: null,
            },
        });
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* ── En-tête ─────────────────────────────────────────────────── */}
            <div
                className="flex items-start justify-between gap-3 px-4 pt-4 pb-3
                            border-b border-slate-100"
            >
                <div>
                    <p className="font-semibold text-sm text-slate-800">
                        {eleve?.prenom ?? "—"}
                        {eleve?.nom ? ` ${eleve.nom}` : ""}
                        <span className="font-normal text-slate-400 ml-2">
                            Ex.{reponse.exercice_numero}
                        </span>
                    </p>
                    {exercice?.competence && (
                        <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                            {exercice.competence}
                        </p>
                    )}
                </div>
                <span
                    className="shrink-0 text-xs px-2 py-0.5 rounded-full
                                 bg-review-100 text-review-700 font-medium"
                >
                    À valider
                </span>
            </div>

            {/* ── Production de l'élève ────────────────────────────────────── */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                    Production de l'élève
                </p>
                <ProductionEleve
                    valeur={reponse.valeur_brute}
                    type={reponse.type}
                    exercice={exercice}
                />
            </div>

            {/* ── Actions principales ──────────────────────────────────────── */}
            <div className="flex items-center gap-2 px-4 py-3">
                {/* Réussi */}
                <button
                    onClick={handleReussi}
                    className="flex-1 flex items-center justify-center gap-1.5
                               py-2 rounded-lg bg-success-500 hover:bg-success-600
                               text-white text-sm font-medium transition-colors cursor-pointer"
                >
                    <span>✓</span>
                    <span>Réussi</span>
                </button>

                {/* Biais */}
                <button
                    onClick={() => setBiaisOuvert((v) => !v)}
                    className={`flex-1 flex items-center justify-center gap-1.5
                                py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                                border
                                ${
                                    biaisOuvert
                                        ? "bg-danger-50 border-danger-300 text-danger-700"
                                        : "bg-white border-slate-200 text-slate-600 hover:border-danger-300"
                                }`}
                >
                    <span>!</span>
                    <span>Biais</span>
                    <span className="text-xs opacity-60">
                        {biaisOuvert ? "▲" : "▼"}
                    </span>
                </button>

                {/* Échec */}
                <button
                    onClick={handleEchec}
                    className="flex-1 flex items-center justify-center gap-1.5
                               py-2 rounded-lg bg-white hover:bg-danger-50
                               border border-slate-200 hover:border-danger-300
                               text-slate-600 hover:text-danger-700
                               text-sm font-medium transition-colors cursor-pointer"
                >
                    <span>✗</span>
                    <span>Échec</span>
                </button>
            </div>

            {/* ── Panneau biais (dépliable) ────────────────────────────────── */}
            {biaisOuvert && (
                <div className="px-4 pb-4 border-t border-danger-100 bg-danger-50">
                    <p className="text-xs font-semibold text-danger-700 mt-3 mb-2">
                        Quel biais identifier ?
                    </p>
                    {biaisDisponibles.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {biaisDisponibles.map((b) => (
                                <button
                                    key={b.code}
                                    onClick={() => handleBiais(b.code)}
                                    className="text-left rounded-lg border border-danger-200
                                               bg-white hover:bg-danger-100 px-3 py-2
                                               transition-colors cursor-pointer"
                                >
                                    <p className="text-xs font-semibold text-danger-700">
                                        {b.code}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                                        {b.ceQueRevele}
                                    </p>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">
                            Aucun biais pré-défini pour cet item. Utiliser «
                            Réussi » ou « Échec ».
                        </p>
                    )}
                </div>
            )}
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

// ─── Composant principal ──────────────────────────────────────────────────────

/**
 * ItemsARevoir
 *
 * File de validation rapide des items A_VALIDER (Module 3).
 * Remplace l'ancienne vue "À relire" (SRS F-ANA-09, F-ANA-10).
 *
 * Affiche un compteur de progression et une carte par item.
 * Chaque validation met à jour la matrice et les biais en temps réel
 * via le reducer AppContext.
 *
 * @param {object}   props
 * @param {object}   props.session
 * @param {object[]} props.eleves
 */
function ItemsARevoir({ session, eleves }) {
    const { state, dispatch } = useAppContext();

    const items = collecterItemsARelire(session, state.passations);
    const total = items.length;

    // ── File vide ─────────────────────────────────────────────────────────────
    if (total === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <span className="text-3xl">✓</span>
                <p className="text-sm font-semibold text-success-700">
                    Tous les items ont été validés.
                </p>
                <p className="text-xs text-slate-400 text-center max-w-xs">
                    Les données sont complètes. La matrice et les biais
                    reflètent désormais l'ensemble des passations.
                </p>
            </div>
        );
    }

    // ── Barre de progression ──────────────────────────────────────────────────
    const passationsTerminees = state.passations.filter(
        (p) => p.diagnostic_id === session.id && p.statut === "terminee"
    );
    const totalItems = passationsTerminees.flatMap((p) =>
        p.reponses.filter((r) => r.a_relire)
    ).length;
    const valides = totalItems - total;
    const pct = totalItems > 0 ? Math.round((valides / totalItems) * 100) : 0;

    return (
        <div>
            {/* ── En-tête de progression ────────────────────────────────────── */}
            <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold text-slate-700">
                        {total} item{total !== 1 ? "s" : ""} à valider
                    </p>
                    <p className="text-xs text-slate-400">
                        {valides} / {totalItems} validés
                    </p>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-brand-400 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                    Chaque validation met à jour la matrice et les biais en
                    temps réel.
                </p>
            </div>

            {/* ── File d'items ──────────────────────────────────────────────── */}
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
        </div>
    );
}

ItemsARevoir.propTypes = {
    session: PropTypes.object.isRequired,
    eleves: PropTypes.array.isRequired,
};

export default ItemsARevoir;
