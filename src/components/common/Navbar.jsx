/**
 * @file Navbar.jsx — barre de navigation contextuelle selon le mode.
 *
 * @description
 * Portage du design de fractions-ce1-u1s6/src/components/Navbar.jsx
 * (FredM, micetf.fr) adapté au contexte de DiagFractions.
 *
 * Deux comportements selon `mode` :
 *
 * ── Mode `teacher` ──────────────────────────────────────────────────
 *   Gauche : lien MiCetF
 *   Centre : « 🧮 Fractions Diagnostic » (statique, Fredoka)
 *   Droite : [? Aide]  [♥ PayPal]  [✉ Email]
 *
 * ── Mode `student` ──────────────────────────────────────────────────
 *   Gauche : lien MiCetF
 *   Centre : zone d'appui long (2 s) — titre + badge « MODE ÉLÈVE »
 *   Droite : [? Aide] uniquement
 *
 * Différences avec fractions-ce1-u1s6 :
 *   - Pas de mode `visitor` (DiagFractions est toujours enseignant ou élève)
 *   - Pas d'`atelierMeta` ni d'`activeStudent`
 *   - `onHelp` ouvre HelpPanel (drawer) au lieu de HelpModal (overlay)
 *   - Pas de bouton ← retour (pas de VisitorScreen dans DiagFractions)
 *
 * @module components/common/Navbar
 */

import PropTypes from "prop-types";
import NavCenter from "@/components/navbar/NavCenter";
import NavActions from "@/components/navbar/NavActions";

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Barre de navigation MiCetF — fixe, z-50, h-14 (56 px).
 * Design identique à fractions-ce1-u1s6 : bg-gray-800, Nunito, 3 zones.
 *
 * @param {'teacher'|'student'} props.mode            - Mode courant.
 * @param {Function}            props.onHelp          - Ouvre le HelpPanel.
 * @param {Function|null}       [props.onLongPressStart] - Début appui long (student).
 * @param {Function|null}       [props.onLongPressEnd]   - Fin appui long   (student).
 * @returns {JSX.Element}
 */
export default function Navbar({
    mode,
    onHelp,
    onLongPressStart = null,
    onLongPressEnd = null,
}) {
    const isStudent = mode === "student";

    return (
        <nav
            className="fixed top-0 left-0 right-0 bg-gray-800 shadow-lg z-50 h-14"
            aria-label="Barre de navigation principale"
            style={{ fontFamily: "'Nunito', sans-serif" }}
        >
            <div className="h-full max-w-full px-3 flex items-center justify-between">
                {/* ── Gauche : lien MiCetF ───────────────────────────────────── */}
                <a
                    href="https://micetf.fr"
                    className="text-white font-semibold text-lg
                               hover:text-gray-300 transition shrink-0"
                    title="Retour à MiCetF"
                >
                    MiCetF
                </a>

                {/* ── Centre : titre + zone long-press en mode élève ─────────── */}
                <div className="flex-1 flex items-center justify-center min-w-0 px-2">
                    <NavCenter
                        isStudent={isStudent}
                        onLongPressStart={isStudent ? onLongPressStart : null}
                        onLongPressEnd={isStudent ? onLongPressEnd : null}
                    />
                </div>

                {/* ── Droite : actions ───────────────────────────────────────── */}
                <NavActions isStudent={isStudent} onHelp={onHelp} />
            </div>
        </nav>
    );
}

Navbar.propTypes = {
    /** Mode d'affichage courant. */
    mode: PropTypes.oneOf(["teacher", "student"]).isRequired,
    /** Ouvre le HelpPanel contextuel. */
    onHelp: PropTypes.func.isRequired,
    /** Callback de début d'appui long (fourni par useLongPress). */
    onLongPressStart: PropTypes.func,
    /** Callback de fin d'appui long. */
    onLongPressEnd: PropTypes.func,
};
