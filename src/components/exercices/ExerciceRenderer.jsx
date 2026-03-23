import PropTypes from "prop-types";
import FractionInput from "./FractionInput";
import BinaryChoice from "./BinaryChoice";
import TextJustification from "./TextJustification";
import FigureSelector from "./FigureSelector";
import ColoringFigure from "./ColoringFigure";
import NumberLine from "./NumberLine";
import SortableFractions from "./SortableFractions";
import NumberInput from "./NumberInput";
import DemiDroiteTiers from "./figures/DemiDroiteTiers";
import RulerWithPointP from "./figures/RulerWithPointP";
import { figuresCE1Ex1 } from "./figures/CE1Ex1";
import { figuresCE1Ex2 } from "./figures/CE1Ex2";
import { figuresCE2Ex2 } from "./figures/CE2Ex2";
import { figuresCM2Ex4 } from "./figures/CM2Ex4";
import DemiDisque from "./figures/DemiDisque";
import RegletteSegments from "./figures/RegletteSegments";
import { segmentsCE1Ex3TriangleD } from "./figures/segmentsCE1";
import { getInitialValue } from "@/utils/initialValues";

/** Registre figures SVG pour les exercices 'selection'. Clé : "NIVEAU-NUMERO". */
const FIGURE_REGISTRY = {
    "CE1-1": figuresCE1Ex1,
    "CE2-2": figuresCE2Ex2,
    "CM2-4": figuresCM2Ex4,
};

/** Registre figures pour les items fraction_input. Clé : "NIVEAU-NUMERO". */
const ITEM_FIGURE_REGISTRY = {
    "CE1-2": figuresCE1Ex2,
};

/**
 * Figures identifiées par un id dans les données (exercice.figureSupportId).
 * Permet d'afficher une figure support au-dessus d'un fraction_input
 * sans dépendre du couple NIVEAU-NUMERO.
 */
const FIGURE_SUPPORT_ID_REGISTRY = {
    regle_huitiemes_point_P: () => <RulerWithPointP />,
    demi_droite_tiers: () => <DemiDroiteTiers />,
};

/**
 * Figure support affichée au-dessus des items pour certains exercices.
 * Clé : "NIVEAU-NUMERO".
 */
const SUPPORT_FIGURE_REGISTRY = {
    "CE2-3": <RegletteSegments />,
};

/**
 * Figures support pour les exercices compound qui affichent un objet
 * avant leurs sous-questions. Clé : "NIVEAU-NUMERO".
 */
const FIGURE_COMPOUND_REGISTRY = {
    "CE1-6": <DemiDisque />,
    "CM1-4": <DemiDroiteTiers />,
};

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

function makeSegmentsForFigure(figure) {
    const desc = figure.description?.toLowerCase() ?? "";
    if (desc.includes("triangle")) return segmentsCE1Ex3TriangleD;
    if (desc.includes("disque")) return makeSegmentsDisque(figure.nbParts ?? 2);
    return makeSegmentsAuto(figure.nbParts ?? 2);
}
/**
 * Génère N segments en secteurs de disque (paths SVG) pour ColoringFigure.
 * Disque centré en (40, 40), rayon 34, viewBox 80×80.
 *
 * @param {number} n - Nombre de secteurs.
 * @returns {Array}
 */
function makeSegmentsDisque(n) {
    const cx = 40;
    const cy = 40;
    const r = 34;
    return Array.from({ length: n }, (_, i) => {
        const a1 = (i / n) * 2 * Math.PI - Math.PI / 2;
        const a2 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
        const x1 = cx + r * Math.cos(a1);
        const y1 = cy + r * Math.sin(a1);
        const x2 = cx + r * Math.cos(a2);
        const y2 = cy + r * Math.sin(a2);
        const large = 1 / n > 0.5 ? 1 : 0;
        return {
            shape: "path",
            label: `Secteur ${i + 1}`,
            d: `M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`,
        };
    });
}

// ─── Composant interne : fraction SVG inline ──────────────────────────────────

/**
 * FractionSVG
 *
 * Affiche une fraction sous forme mathématique (numérateur / barre / dénominateur)
 * dans un conteneur inline. Utilisé pour les exercices de classement et comparaison.
 *
 * @param {{ n: number, d: number }} props
 */
function FractionSVG({ n, d }) {
    return (
        <span
            className="inline-flex flex-col items-center leading-none
                     font-mono font-semibold text-slate-800 text-base select-none"
        >
            <span>{n}</span>
            <span className="w-full border-t border-slate-800 my-0.5" />
            <span>{d}</span>
        </span>
    );
}

FractionSVG.propTypes = {
    n: PropTypes.number.isRequired,
    d: PropTypes.number.isRequired,
};

// ─── Composant principal ──────────────────────────────────────────────────────

/**
 * ExerciceRenderer
 *
 * Rend le composant de saisie approprié pour un exercice ou une sous-question.
 * Gère tous les types définis dans les données sources, y compris les
 * types composés (récursion sur sousQuestions) et les types texte structurés.
 *
 * Aucun retour de justesse n'est donné à l'élève (SRS F-PAS-05).
 *
 * @param {object}   props
 * @param {object}   props.exercice
 * @param {string}   props.niveau
 * @param {any}      props.value
 * @param {function} props.onChange
 */
function ExerciceRenderer({ exercice, niveau, value = undefined, onChange }) {
    const val = value ?? getInitialValue(exercice);

    switch (exercice.type) {
        // ── Fraction input ────────────────────────────────────────────────────
        case "fraction_input": {
            if (exercice.items?.length > 0) {
                const itemFigures =
                    ITEM_FIGURE_REGISTRY[`${niveau}-${exercice.numero}`] ?? {};
                const figureSupport =
                    SUPPORT_FIGURE_REGISTRY[`${niveau}-${exercice.numero}`];
                // Figure support identifiée par id (ex. : règle avec point P)
                const figureParId = exercice.figureSupportId
                    ? FIGURE_SUPPORT_ID_REGISTRY[exercice.figureSupportId]?.()
                    : null;

                return (
                    <div className="flex flex-col gap-6">
                        {/* Figure support par id (ex. : CE2 Ex.4 encadrement) */}
                        {figureParId && (
                            <div className="w-full">{figureParId}</div>
                        )}
                        {/* Figure support par NIVEAU-NUMERO */}
                        {figureSupport && (
                            <div className="w-full">{figureSupport}</div>
                        )}

                        <div className="flex flex-wrap gap-8 items-end">
                            {exercice.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col items-center gap-3"
                                >
                                    {itemFigures[item.id] ? (
                                        <div className="flex items-center justify-center">
                                            {itemFigures[item.id]}
                                        </div>
                                    ) : item.description ? (
                                        <p className="text-sm text-slate-500 text-center max-w-36">
                                            {item.description}
                                        </p>
                                    ) : null}
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
                        {/* Explication uniquement si avecExplication !== false */}
                        {exercice.aRelire &&
                            exercice.avecExplication !== false && (
                                <TextJustification
                                    value={
                                        typeof val.__explication === "string"
                                            ? val.__explication
                                            : ""
                                    }
                                    onChange={(v) =>
                                        onChange({ ...val, __explication: v })
                                    }
                                    label="Explique comment tu as trouvé :"
                                />
                            )}
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
                return (
                    <TextJustification
                        value={typeof val === "string" ? val : ""}
                        onChange={onChange}
                        label="Indique ta réponse :"
                    />
                );
            }
            return (
                <div className="flex flex-col gap-4">
                    <FigureSelector
                        figures={figures}
                        value={
                            Array.isArray(val)
                                ? val
                                : Array.isArray(val?.selection)
                                  ? val.selection
                                  : []
                        }
                        onChange={(sel) =>
                            exercice.aRelire
                                ? onChange({ ...(val ?? {}), selection: sel })
                                : onChange(sel)
                        }
                        multiple
                    />
                    {/* Justification requise sur les exercices de sélection avec aRelire */}
                    {exercice.aRelire && (
                        <TextJustification
                            value={
                                typeof val.__justification === "string"
                                    ? val.__justification
                                    : ""
                            }
                            onChange={(v) =>
                                onChange({ ...val, __justification: v })
                            }
                            label="Justifie tes choix :"
                        />
                    )}
                </div>
            );
        }

        // ── Coloriage ─────────────────────────────────────────────────────────
        case "coloring": {
            if (exercice.figures) {
                return (
                    <div className="flex flex-col gap-6">
                        {exercice.figures.map((fig) => {
                            const segments = makeSegmentsForFigure(fig);
                            const figVal =
                                val?.[fig.id] ??
                                Array(fig.nbParts ?? 2).fill(false);
                            const desc = fig.description?.toLowerCase() ?? "";
                            const isTriangle = desc.includes("triangle");
                            const isDisque = desc.includes("disque");

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
                                        viewBoxW={
                                            isTriangle || isDisque ? 80 : 300
                                        }
                                        viewBoxH={80}
                                        uniteSize={exercice.uniteSize}
                                    />
                                </div>
                            );
                        })}
                    </div>
                );
            }
            const n = exercice.nbParts ?? exercice.partiesAColorier ?? 2;
            return (
                <ColoringFigure
                    segments={makeSegmentsAuto(n)}
                    value={Array.isArray(val) ? val : Array(n).fill(false)}
                    onChange={onChange}
                    viewBoxW={300}
                    viewBoxH={80}
                    uniteSize={exercice.uniteSize}
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
                    <div className="flex flex-col gap-4">
                        {exercice.fractionsAplacer.map((f, i) => {
                            const key = `${f.n}/${f.d}`;
                            const ptVal = val?.[key] ?? null;
                            return (
                                <div
                                    key={key}
                                    className="flex items-center gap-4"
                                >
                                    {/* Label de la fraction — toujours visible, jamais sur le point */}
                                    <div
                                        className="shrink-0 w-14 flex flex-col items-center
                                  leading-none font-mono font-bold
                                  text-slate-700 text-lg select-none"
                                    >
                                        <span>{f.n}</span>
                                        <span className="w-full border-t-2 border-slate-700 my-0.5" />
                                        <span>{f.d}</span>
                                    </div>
                                    <div className="flex-1">
                                        <NumberLine
                                            graduation={exercice.graduation}
                                            value={ptVal}
                                            onChange={(v) =>
                                                onChange({ ...val, [key]: v })
                                            }
                                            couleur={
                                                COULEURS[i % COULEURS.length]
                                            }
                                            showLabel={false}
                                        />
                                    </div>
                                </div>
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

        // ── Texte (simple ou structuré) ───────────────────────────────────────
        case "text": {
            // ── CE2 Ex.6 — Comparaisons de fractions (< / > / =) ───────────────
            // Source : exercice 6 CE2, comparaisons[].{gauche, droite, attendu}
            if (exercice.comparaisons?.length > 0) {
                const objVal =
                    typeof val === "object" &&
                    val !== null &&
                    !Array.isArray(val)
                        ? val
                        : {};
                return (
                    <div className="flex flex-col gap-6">
                        {exercice.comparaisons.map((comp) => (
                            <div
                                key={comp.id}
                                className="flex items-center gap-4 flex-wrap"
                            >
                                {/* Fraction gauche */}
                                <div className="flex items-center justify-center w-12">
                                    <FractionSVG
                                        n={comp.gauche.n}
                                        d={comp.gauche.d}
                                    />
                                </div>

                                {/* Boutons <, >, = */}
                                <div className="flex gap-2">
                                    {["<", ">", "="].map((signe) => (
                                        <button
                                            key={signe}
                                            type="button"
                                            onClick={() =>
                                                onChange({
                                                    ...objVal,
                                                    [comp.id]: signe,
                                                })
                                            }
                                            className={`w-10 h-10 rounded-lg text-lg font-bold border-2
                                  transition-colors cursor-pointer select-none
                        ${
                            objVal[comp.id] === signe
                                ? "bg-brand-500 border-brand-600 text-white"
                                : "bg-white border-slate-300 text-slate-700 hover:border-brand-400 hover:bg-brand-50"
                        }`}
                                        >
                                            {signe}
                                        </button>
                                    ))}
                                </div>

                                {/* Fraction droite */}
                                <div className="flex items-center justify-center w-12">
                                    <FractionSVG
                                        n={comp.droite.n}
                                        d={comp.droite.d}
                                    />
                                </div>

                                {/* Label lettre */}
                                <span className="text-xs text-slate-400 font-mono">
                                    ({comp.id})
                                </span>
                            </div>
                        ))}

                        <TextJustification
                            value={
                                typeof objVal.__explication === "string"
                                    ? objVal.__explication
                                    : ""
                            }
                            onChange={(v) =>
                                onChange({ ...objVal, __explication: v })
                            }
                            label="Explique ta réponse en une phrase pour chaque comparaison :"
                        />
                    </div>
                );
            }

            // ── CM1 Ex.5 / CM2 Ex.5 — Fractions à ranger ───────────────────────
            // Source : exercice 5 CM1/CM2, fractions[].{n, d}
            if (exercice.fractions?.length > 0) {
                const items = exercice.fractions.map((f) => ({
                    id: `${f.n}/${f.d}`,
                    fraction: f,
                }));
                const objVal =
                    val && typeof val === "object" && "ordre" in val
                        ? val
                        : { ordre: items.map((it) => it.id), explication: "" };
                return (
                    <div className="flex flex-col gap-5">
                        <SortableFractions
                            items={items}
                            value={objVal.ordre}
                            onChange={(ordre) => onChange({ ...objVal, ordre })}
                        />
                        <TextJustification
                            value={objVal.explication ?? ""}
                            onChange={(explication) =>
                                onChange({ ...objVal, explication })
                            }
                            label="Explique ta stratégie :"
                        />
                    </div>
                );
            }

            // ── CE2 Ex.5 — Fractions documentées (personnes + fractions) ────────
            // Source : exercice 5 CE2, fractionsDocumentees[].{prenom, fraction{n,d}}
            // Note : le document source ne spécifie que 3 amis sur 5.
            if (exercice.fractionsDocumentees?.length > 0) {
                const items = exercice.fractionsDocumentees.map((it) => ({
                    id: it.prenom,
                    prenom: it.prenom,
                    fraction: it.fraction,
                }));
                const objVal =
                    val && typeof val === "object" && "ordre" in val
                        ? val
                        : { ordre: items.map((it) => it.id), explication: "" };
                return (
                    <div className="flex flex-col gap-5">
                        <SortableFractions
                            items={items}
                            value={objVal.ordre}
                            onChange={(ordre) => onChange({ ...objVal, ordre })}
                        />
                        <TextJustification
                            value={objVal.explication ?? ""}
                            onChange={(explication) =>
                                onChange({ ...objVal, explication })
                            }
                            label="Explique comment tu as trouvé :"
                        />
                    </div>
                );
            }

            // ── Texte libre par défaut ───────────────────────────────────────────
            return (
                <TextJustification
                    value={typeof val === "string" ? val : ""}
                    onChange={onChange}
                    label={"Ta réponse :"}
                    placeholder="Écris ta réponse ici…"
                />
            );
        }

        // ── Saisie numérique ──────────────────────────────────────────────
        case "number_input": {
            return (
                <NumberInput
                    value={typeof val === "string" ? val : ""}
                    onChange={onChange}
                    unite={exercice.unite ?? ""}
                />
            );
        }

        // ── Composé (sous-questions) ──────────────────────────────────────────
        case "compound": {
            const figureSupport =
                FIGURE_COMPOUND_REGISTRY[`${niveau}-${exercice.numero}`];
            return (
                <div className="flex flex-col gap-6">
                    {/* Figure support si présente (ex. : demi-disque CE1 Ex.6) */}
                    {figureSupport && (
                        <div className="flex items-center justify-center py-2">
                            {figureSupport}
                        </div>
                    )}

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
