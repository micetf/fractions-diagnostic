/**
 * @file TeacherConfirmOverlay.jsx — modal de confirmation avant accès
 * à l'espace enseignant.
 *
 * @description
 * Affiché après le déclenchement du geste d'appui long (2 s) sur la
 * zone centrale de la navbar en mode élève.
 *
 * La friction volontaire — deux boutons explicites, libellés clairs —
 * décourage un élève de primaire d'entrer par accident dans l'espace
 * enseignant sans nécessiter de code PIN.
 *
 * Adapté de fractions-ce1-u1s6/src/components/ui/TeacherConfirmOverlay.jsx
 * (FredM, micetf.fr) avec les ajustements suivants :
 * - Police `font-display` (Tailwind custom DiagFractions) au lieu de Fredoka
 * - Couleurs `brand-*` et `slate-*` cohérentes avec Layout.jsx et PinGate.jsx
 * - Classe d'animation `kf-up` retirée (non définie dans DiagFractions)
 * - Texte adapté au registre "vous" de DiagFractions (vs "tu" de fractions-ce1-u1s6)
 *
 * @module components/common/TeacherConfirmOverlay
 */

import PropTypes from "prop-types";

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Modal plein-écran de confirmation pour accéder au mode enseignant.
 *
 * Rendu en `fixed inset-0 z-50` : passe au-dessus de la navbar (z-50)
 * et du contenu principal, cohérent avec PinGate.jsx et HelpPanel.jsx.
 *
 * @param {Object}   props
 * @param {Function} props.onConfirm - Bascule en mode enseignant.
 * @param {Function} props.onCancel  - Ferme le modal sans action.
 *
 * @returns {JSX.Element}
 */
export default function TeacherConfirmOverlay({ onConfirm, onCancel }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{
                background: "rgba(15, 23, 42, 0.85)",
                backdropFilter: "blur(4px)",
            }}
            /* Clic sur le fond → annulation (cohérent avec HelpPanel) */
            onClick={onCancel}
        >
            {/* Carte centrale — stopPropagation évite la fermeture au clic interne */}
            <div
                className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full
                            text-center"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="teacher-confirm-title"
            >
                {/* Icône */}
                <span className="text-5xl block mb-4" aria-hidden="true">
                    🎓
                </span>

                {/* Titre */}
                <h2
                    id="teacher-confirm-title"
                    className="font-display font-bold text-2xl text-slate-800 mb-2"
                >
                    Mode enseignant
                </h2>

                {/* Message */}
                <p className="text-slate-500 text-sm font-medium mb-8">
                    Êtes-vous l&apos;enseignant·e de cette classe ?
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    {/* Confirmation — action principale */}
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full py-4 rounded-2xl bg-slate-800 text-white
                                   font-bold text-base
                                   hover:bg-slate-700 active:scale-[.98]
                                   transition-all touch-manipulation"
                    >
                        Oui, accéder →
                    </button>

                    {/* Annulation — secondaire, discret */}
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full py-3 rounded-2xl text-slate-400
                                   font-semibold text-sm
                                   hover:text-slate-600 hover:bg-slate-50
                                   transition-colors touch-manipulation"
                    >
                        Non, revenir aux exercices
                    </button>
                </div>
            </div>
        </div>
    );
}

TeacherConfirmOverlay.propTypes = {
    /** Bascule en mode enseignant après confirmation. */
    onConfirm: PropTypes.func.isRequired,
    /** Ferme le modal sans changer de mode. */
    onCancel: PropTypes.func.isRequired,
};
