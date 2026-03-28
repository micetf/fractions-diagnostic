/**
 * @file NavCenter.jsx — zone centrale contextuelle de la barre de navigation.
 *
 * @description
 * Adapté de fractions-ce1-u1s6/src/components/navbar/NavCenter.jsx (FredM, micetf.fr).
 *
 * Rend deux états selon le mode :
 *
 * 1. **Mode enseignant** (`isStudent` false) :
 *    titre fixe « 🧮 Fractions Diagnostic »
 *
 * 2. **Mode élève** (`isStudent` true) :
 *    zone d'appui long — titre + badge coloré « MODE ÉLÈVE »
 *    Le geste 2 s déclenche TeacherConfirmOverlay dans App.jsx.
 *
 * Différences avec fractions-ce1-u1s6 :
 *   - Pas d'`atelierMeta` (pas d'ateliers dans DiagFractions)
 *   - Pas d'`activeStudent` (prénom non affiché dans la navbar)
 *   - Badge « MODE ÉLÈVE » remplace le badge atelier
 *   - Couleur badge : brand-600 (Tailwind custom DiagFractions)
 *
 * @module navbar/NavCenter
 */

import PropTypes from "prop-types";

// ─── Constante ─────────────────────────────────────────────────────────────────

/** Police Fredoka — identique à fractions-ce1-u1s6. */
const FREDOKA = { fontFamily: "'Fredoka', sans-serif" };

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Zone centrale contextuelle de la Navbar.
 *
 * @param {boolean}       props.isStudent        - Vrai si mode élève actif.
 * @param {Function|null} props.onLongPressStart  - Début d'appui long (mode élève).
 * @param {Function|null} props.onLongPressEnd    - Fin / annulation d'appui long.
 * @returns {JSX.Element}
 */
export default function NavCenter({
    isStudent,
    onLongPressStart = null,
    onLongPressEnd = null,
}) {
    // ── Mode enseignant : titre statique ────────────────────────────────────
    if (!isStudent) {
        return (
            <span
                className="text-white font-semibold text-base"
                style={FREDOKA}
            >
                🧮 Fractions Diagnostic
            </span>
        );
    }

    // ── Mode élève : zone d'appui long ──────────────────────────────────────
    return (
        <div
            className="flex items-center gap-2 cursor-pointer select-none
                       rounded-xl px-2 py-1 hover:bg-white/10 transition-colors min-w-0"
            style={{ WebkitTapHighlightColor: "transparent" }}
            onPointerDown={onLongPressStart ?? undefined}
            onPointerUp={onLongPressEnd ?? undefined}
            onPointerLeave={onLongPressEnd ?? undefined}
            title="Appui long (2 s) : espace enseignant·e"
            role="button"
            aria-label="Appui long pour accéder à l'espace enseignant·e"
        >
            {/* Titre application */}
            <span
                className="text-white font-semibold text-base shrink-0"
                style={FREDOKA}
            >
                🧮 Fractions Diagnostic
            </span>

            {/* Séparateur · */}
            <span className="text-gray-500 mx-0.5 hidden sm:inline">·</span>

            {/* Badge MODE ÉLÈVE */}
            <span
                className="hidden sm:inline-flex items-center px-2 py-0.5
                           rounded-lg text-xs font-bold shrink-0
                           bg-brand-100 border border-brand-300 text-brand-700"
            >
                MODE ÉLÈVE
            </span>
        </div>
    );
}

NavCenter.propTypes = {
    /** Vrai si une session élève est active (mode student). */
    isStudent: PropTypes.bool.isRequired,
    /**
     * Callback de début d'appui long — fourni par useLongPress() dans App.jsx.
     * Ignoré en mode enseignant.
     */
    onLongPressStart: PropTypes.func,
    /**
     * Callback de fin d'appui long (pointerUp ou pointerLeave).
     * Ignoré en mode enseignant.
     */
    onLongPressEnd: PropTypes.func,
};
