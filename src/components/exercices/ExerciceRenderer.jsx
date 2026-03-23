import PropTypes from "prop-types";
import FractionInput from "./FractionInput";
import BinaryChoice from "./BinaryChoice";
import TextJustification from "./TextJustification";
import FigureSelector from "./FigureSelector";
import ColoringFigure from "./ColoringFigure";
import NumberLine from "./NumberLine";
import { figuresCE1Ex1 } from "./figures/CE1Ex1";
import { figuresCE1Ex2 } from "./figures/CE1Ex2";
import { figuresCE2Ex2 } from "./figures/CE2Ex2";
import { figuresCM2Ex4 } from "./figures/CM2Ex4";
import { segmentsCE1Ex3TriangleD } from "./figures/segmentsCE1";
import { getInitialValue } from "@/utils/initialValues";

/**
 * Registre des figures SVG pour les exercices de type 'selection'.
 * Clé : "NIVEAU-NUMERO".
 */
const FIGURE_REGISTRY = {
    "CE1-1": figuresCE1Ex1,
    "CE2-2": figuresCE2Ex2,
    "CM2-4": figuresCM2Ex4,
};

/**
 * Génère des segments rectangulaires égaux pour une bande de N parts.
 * Utilisé pour les exercices de coloriage sans SVG spécifique.
 *
 * @param {number} n
 * @returns {Array}
 */
function makeSegmentsAuto(n) {
    const partW = 300 / n;
    return Array.from({ length: n }, (_, i) => ({
        shape: "rect",
        label: `Part ${i + 1}`,
        x: i * partW,
        y: 10,
        w: partW,
        h: 60,
    }));
}

/**
 * Retourne les segments pour une figure de coloriage.
 * Cas particulier : triangle (CE1 Ex.3 figure D).
 *
 * @param {object} figure - Définition de la figure (depuis les data).
 * @returns {Array}
 */
function makeSegmentsForFigure(figure) {
    if (figure.description?.toLowerCase().includes("triangle")) {
        return segmentsCE1Ex3TriangleD;
    }
    return makeSegmentsAuto(figure.nbParts ?? 2);
}

/**
 * ExerciceRenderer
 *
 * Renders any exercise or sous-question node using the appropriate
 * interactive component. Handles all types recursively for 'compound'.
 *
 * Aucun retour de justesse n'est donné à l'élève (SRS F-PAS-05) :
 * ce composant affiche uniquement les champs de saisie.
 *
 * @param {object}   props
 * @param {object}   props.exercice  - Nœud exercice ou sous-question.
 * @param {string}   props.niveau    - 'CE1' | 'CE2' | 'CM1' | 'CM2'.
 * @param {any}      props.value     - Valeur courante (structure selon le type).
 * @param {function} props.onChange  - Appelé avec la nouvelle valeur.
 */
function ExerciceRenderer({ exercice, niveau, value, onChange }) {
    const val = value ?? getInitialValue(exercice);

    switch (exercice.type) {
        // ── Fraction input ────────────────────────────────────────────────────
        case "fraction_input": {
            if (exercice.items?.length > 0) {
                // Registre des figures illustrant chaque item
                const ITEM_FIGURES = {
                    "CE1-2": figuresCE1Ex2,
                };
                const itemFigures =
                    ITEM_FIGURES[`${niveau}-${exercice.numero}`] ?? {};

                return (
                    <div className="flex flex-wrap gap-8 items-start">
                        {exercice.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col items-center gap-3"
                            >
                                {/* Figure illustrative si disponible */}
                                {itemFigures[item.id] && (
                                    <div className="flex items-center justify-center">
                                        {itemFigures[item.id]}
                                    </div>
                                )}
                                {/* Description texte si pas de figure */}
                                {!itemFigures[item.id] && item.description && (
                                    <p className="text-sm text-slate-500 text-center max-w-32">
                                        {item.description}
                                    </p>
                                )}
                                {/* Libellé de l'item */}
                                <span className="text-xs font-mono text-slate-400 uppercase">
                                    Figure {item.id}
                                </span>
                                <FractionInput
                                    value={
                                        val[item.id] ?? {
                                            numerateur: null,
                                            denominateur: null,
                                        }
                                    }
                                    onChange={(v) =>
                                        onChange({ ...val, [item.id]: v })
                                    }
                                    idPrefix={`fraction-${item.id}`}
                                />
                            </div>
                        ))}
                    </div>
                );
            }
            return (
                <FractionInput
                    value={val}
                    onChange={onChange}
                    idPrefix={`fraction-${exercice.id ?? exercice.numero}`}
                />
            );
        }

        // ── Choix binaire ─────────────────────────────────────────────────────
        case "binary_choice": {
            return (
                <div className="flex flex-col gap-4">
                    <BinaryChoice
                        options={exercice.options}
                        value={val.choix}
                        onChange={(choix) => onChange({ ...val, choix })}
                    />
                    {exercice.avecJustification && (
                        <TextJustification
                            value={val.texte ?? ""}
                            onChange={(texte) => onChange({ ...val, texte })}
                        />
                    )}
                </div>
            );
        }

        // ── Sélection de figures ──────────────────────────────────────────────
        case "selection": {
            const key = `${niveau}-${exercice.numero}`;
            const figures = FIGURE_REGISTRY[key] ?? [];
            if (figures.length === 0) {
                // Fallback texte si pas de figures SVG pour cet exercice
                return (
                    <TextJustification
                        value={typeof val === "string" ? val : ""}
                        onChange={onChange}
                        label="Indique ta réponse :"
                    />
                );
            }
            return (
                <FigureSelector
                    figures={figures}
                    value={Array.isArray(val) ? val : []}
                    onChange={onChange}
                    multiple
                />
            );
        }

        // ── Coloriage ─────────────────────────────────────────────────────────
        case "coloring": {
            if (exercice.figures) {
                // Plusieurs figures indépendantes (CE1 Ex.3)
                return (
                    <div className="flex flex-col gap-6">
                        {exercice.figures.map((fig) => {
                            const segments = makeSegmentsForFigure(fig);
                            const figVal =
                                val?.[fig.id] ??
                                Array(fig.nbParts ?? 2).fill(false);
                            const isTriangle = fig.description
                                ?.toLowerCase()
                                .includes("triangle");
                            return (
                                <div key={fig.id}>
                                    <p className="text-sm text-slate-500 mb-2">
                                        Figure {fig.id}
                                        {fig.description
                                            ? ` — ${fig.description}`
                                            : ""}
                                    </p>
                                    <ColoringFigure
                                        segments={segments}
                                        value={figVal}
                                        onChange={(v) =>
                                            onChange({ ...val, [fig.id]: v })
                                        }
                                        viewBoxW={isTriangle ? 80 : 300}
                                        viewBoxH={80}
                                    />
                                </div>
                            );
                        })}
                    </div>
                );
            }
            // Figure unique
            const n = exercice.nbParts ?? exercice.partiesAColorier ?? 2;
            const segments = makeSegmentsAuto(n);
            return (
                <ColoringFigure
                    segments={segments}
                    value={Array.isArray(val) ? val : Array(n).fill(false)}
                    onChange={onChange}
                    viewBoxW={300}
                    viewBoxH={80}
                />
            );
        }

        // ── Droite graduée ────────────────────────────────────────────────────
        case "number_line": {
            if (exercice.fractionsAplacer?.length > 0) {
                const COULEURS = [
                    "#2f5ee8",
                    "#d97706",
                    "#15803d",
                    "#b91c1c",
                    "#7c3aed",
                ];
                return (
                    <div className="flex flex-col gap-3">
                        {exercice.fractionsAplacer.map((f, i) => {
                            const key = `${f.n}/${f.d}`;
                            const ptVal = val?.[key] ?? null;
                            return (
                                <NumberLine
                                    key={key}
                                    graduation={exercice.graduation}
                                    value={ptVal}
                                    onChange={(v) =>
                                        onChange({ ...val, [key]: v })
                                    }
                                    couleur={COULEURS[i % COULEURS.length]}
                                    etiquette={key}
                                />
                            );
                        })}
                    </div>
                );
            }
            // Point unique
            return (
                <NumberLine
                    graduation={exercice.graduation}
                    value={val}
                    onChange={onChange}
                />
            );
        }

        // ── Texte libre ───────────────────────────────────────────────────────
        case "text": {
            return (
                <TextJustification
                    value={typeof val === "string" ? val : ""}
                    onChange={onChange}
                    label={
                        exercice.consigne ?? "Explique comment tu as trouvé :"
                    }
                    placeholder="Écris ta réponse ici…"
                />
            );
        }

        // ── Composé (sous-questions) ──────────────────────────────────────────
        case "compound": {
            return (
                <div className="flex flex-col gap-6">
                    {(exercice.sousQuestions ?? []).map((sq) => (
                        <div key={sq.id} className="flex flex-col gap-3">
                            {sq.consigne && (
                                <p className="text-base text-slate-700">
                                    {sq.consigne}
                                </p>
                            )}
                            <ExerciceRenderer
                                exercice={sq}
                                niveau={niveau}
                                value={val?.[sq.id] ?? getInitialValue(sq)}
                                onChange={(sqVal) =>
                                    onChange({ ...val, [sq.id]: sqVal })
                                }
                            />
                        </div>
                    ))}
                </div>
            );
        }

        // ── Fallback ──────────────────────────────────────────────────────────
        default: {
            return (
                <TextJustification
                    value={typeof val === "string" ? val : ""}
                    onChange={onChange}
                    label="Ta réponse :"
                />
            );
        }
    }
}

ExerciceRenderer.propTypes = {
    exercice: PropTypes.object.isRequired,
    niveau: PropTypes.oneOf(["CE1", "CE2", "CM1", "CM2"]).isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
};

ExerciceRenderer.defaultProps = {
    value: undefined,
};

export default ExerciceRenderer;
