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
 * Registre des figures illustrant chaque item d'un exercice fraction_input.
 * Clé : "NIVEAU-NUMERO". Valeur : objet { itemId → ReactNode }.
 */
const ITEM_FIGURE_REGISTRY = {
    "CE1-2": figuresCE1Ex2,
};

/**
 * Génère des segments rectangulaires égaux pour une bande de N parts.
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
 *
 * @param {object} figure
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
 * Sélectionne et rend le composant de saisie approprié pour un exercice
 * ou une sous-question. Gère tous les types définis dans les données sources,
 * y compris les types composés (récursion sur sousQuestions).
 *
 * Aucun retour de justesse n'est donné à l'élève (SRS F-PAS-05).
 *
 * @param {object}   props
 * @param {object}   props.exercice  - Nœud exercice ou sous-question.
 * @param {string}   props.niveau    - 'CE1' | 'CE2' | 'CM1' | 'CM2'.
 * @param {any}      props.value     - Valeur courante.
 * @param {function} props.onChange  - Appelé avec la nouvelle valeur.
 */
function ExerciceRenderer({ exercice, niveau, value = undefined, onChange }) {
    const val = value ?? getInitialValue(exercice);

    switch (exercice.type) {
        // ── Fraction input ────────────────────────────────────────────────────
        case "fraction_input": {
            if (exercice.items?.length > 0) {
                const itemFigures =
                    ITEM_FIGURE_REGISTRY[`${niveau}-${exercice.numero}`] ?? {};

                return (
                    <div className="flex flex-col gap-6">
                        {/* Items : figure + FractionInput */}
                        <div className="flex flex-wrap gap-8 items-end">
                            {exercice.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col items-center gap-3"
                                >
                                    {/* Figure illustrative si disponible */}
                                    {itemFigures[item.id] ? (
                                        <div className="flex items-center justify-center">
                                            {itemFigures[item.id]}
                                        </div>
                                    ) : item.description ? (
                                        /* Description texte si pas de figure */
                                        <p className="text-sm text-slate-500 text-center max-w-36">
                                            {item.description}
                                        </p>
                                    ) : null}

                                    {/* Label de l'item uniquement si plusieurs items */}
                                    {exercice.items.length > 1 && (
                                        <span className="text-xs font-mono text-slate-400">
                                            {item.id}
                                        </span>
                                    )}

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

                        {/* Champ d'explication si l'exercice est marqué aRelire
                (CE1 Ex.7, CE2 Ex.7, CM1 Ex.6, CM2 Ex.6) */}
                        {exercice.aRelire && (
                            <TextJustification
                                value={
                                    typeof val.__explication === "string"
                                        ? val.__explication
                                        : ""
                                }
                                onChange={(v) =>
                                    onChange({ ...val, __explication: v })
                                }
                                label="Explique avec un dessin ou des mots comment tu as trouvé :"
                            />
                        )}
                    </div>
                );
            }

            // Item unique
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

export default ExerciceRenderer;
