import { useState } from "react";
import PropTypes from "prop-types";

/**
 * FractionInline
 *
 * Fraction affichée en colonne (numérateur / barre / dénominateur).
 */
function FractionInline({ n, d }) {
    return (
        <span
            className="inline-flex flex-col items-center leading-none
                     font-mono font-bold text-slate-800 text-lg select-none"
        >
            <span>{n}</span>
            <span className="w-full border-t-2 border-slate-800 my-0.5" />
            <span>{d}</span>
        </span>
    );
}

FractionInline.propTypes = {
    n: PropTypes.number.isRequired,
    d: PropTypes.number.isRequired,
};

// ─── SortableFractions ────────────────────────────────────────────────────────

/**
 * SortableFractions
 *
 * Cartes glissables (drag-and-drop HTML5) pour ordonner des fractions.
 * Compatible souris et stylet — pas de dépendance externe.
 *
 * Utilisé pour :
 *   CE2 Ex.5 : fractions avec prénoms (fractionsDocumentees)
 *   CM1 Ex.5 : fractions seules (fractions)
 *   CM2 Ex.5 : fractions seules (fractions)
 *
 * @param {object[]} items
 *   Chaque item : { id: string, fraction: {n, d}, prenom?: string }
 * @param {string[]} value   - Tableau ordonné des ids.
 * @param {function} onChange - (string[]) => void
 */
function SortableFractions({ items, value, onChange }) {
    const [dragging, setDragging] = useState(null);
    const [dragOver, setDragOver] = useState(null);

    // Reconstruit la liste ordonnée depuis value
    const ordered =
        value.length === items.length
            ? value
                  .map((id) => items.find((it) => it.id === id))
                  .filter(Boolean)
            : [...items];

    function handleDragStart(i) {
        setDragging(i);
    }

    function handleDragOver(e, i) {
        e.preventDefault();
        if (i !== dragging) setDragOver(i);
    }

    function handleDrop(i) {
        if (dragging === null || dragging === i) {
            setDragging(null);
            setDragOver(null);
            return;
        }
        const next = [...ordered];
        const [moved] = next.splice(dragging, 1);
        next.splice(i, 0, moved);
        onChange(next.map((it) => it.id));
        setDragging(null);
        setDragOver(null);
    }

    function handleDragEnd() {
        setDragging(null);
        setDragOver(null);
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Indication de l'ordre attendu */}
            <p className="text-xs text-slate-400 flex items-center gap-1">
                <span className="text-base">↔</span>
                Fais glisser les cartes pour les mettre dans l'ordre, de la plus
                petite à la plus grande.
            </p>

            {/* Étiquettes d'ordre */}
            <div className="flex items-center gap-2 px-1">
                <span className="text-xs text-slate-400 w-20 shrink-0">
                    Plus petite
                </span>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 w-24 text-right shrink-0">
                    Plus grande
                </span>
            </div>

            {/* Cartes draggables */}
            <div
                className="flex flex-wrap gap-3 items-stretch min-h-24 p-3
                      rounded-xl border-2 border-dashed border-slate-200 bg-slate-50"
            >
                {ordered.map((item, i) => {
                    const isDragging = dragging === i;
                    const isTarget = dragOver === i && dragging !== i;

                    return (
                        <div
                            key={item.id}
                            draggable
                            onDragStart={() => handleDragStart(i)}
                            onDragOver={(e) => handleDragOver(e, i)}
                            onDrop={() => handleDrop(i)}
                            onDragEnd={handleDragEnd}
                            className={`
                flex flex-col items-center gap-2 px-5 py-3 rounded-xl border-2
                cursor-grab active:cursor-grabbing select-none
                transition-all duration-100 bg-white
                ${
                    isDragging
                        ? "opacity-30 border-brand-300 scale-95"
                        : isTarget
                          ? "border-brand-500 shadow-md scale-105"
                          : "border-slate-200 hover:border-brand-300 hover:shadow-sm"
                }
              `}
                        >
                            {/* Prénom si disponible */}
                            {item.prenom && (
                                <span className="text-sm font-semibold text-slate-700">
                                    {item.prenom}
                                </span>
                            )}
                            {/* Fraction */}
                            <FractionInline
                                n={item.fraction.n}
                                d={item.fraction.d}
                            />
                            {/* Poignée visuelle */}
                            <span className="text-slate-300 text-xs leading-none">
                                ⠿
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Récapitulatif de l'ordre courant */}
            {value.length === items.length && (
                <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500 px-1">
                    <span className="text-slate-400 mr-1">Ordre actuel :</span>
                    {ordered.map((it, i) => (
                        <span key={it.id} className="flex items-center gap-1">
                            {i > 0 && (
                                <span className="text-slate-300">&lt;</span>
                            )}
                            <span className="font-medium">
                                {it.prenom ??
                                    `${it.fraction.n}/${it.fraction.d}`}
                            </span>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

SortableFractions.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            fraction: PropTypes.shape({
                n: PropTypes.number.isRequired,
                d: PropTypes.number.isRequired,
            }).isRequired,
            prenom: PropTypes.string,
        })
    ).isRequired,
    value: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired,
};

export default SortableFractions;
