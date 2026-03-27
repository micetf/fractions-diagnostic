/**
 * @file Layout.jsx — squelette de page avec navbar MiCetF.
 *
 * @description
 * Fournit la navbar fixe et le panneau d'aide contextuelle.
 * En mode élève, la zone centrale du titre devient la cible
 * du geste d'appui long (2 s) qui permet à l'enseignant·e de
 * reprendre la main — pattern identique à fractions-ce1-u1s6.
 *
 * Props ajoutées au Sprint 2 :
 *   - onLongPressStart / onLongPressEnd  (mode "student" uniquement)
 *
 * Ces callbacks sont fournis par App.jsx via useLongPress() et
 * déclenchent TeacherConfirmOverlay dans App.jsx.
 * Layout reste un composant de présentation pur — aucun état métier.
 *
 * @module components/common/Layout
 */

import { useState } from "react";
import PropTypes from "prop-types";
import HelpPanel from "./HelpPanel";

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Squelette de page — navbar + aide contextuelle + slot children.
 *
 * @param {object}          props
 * @param {'teacher'|'student'} props.mode          - Mode courant.
 * @param {function}        props.onSwitchMode      - (non utilisé, conservé pour compatibilité)
 * @param {string}          props.pageActive        - Page courante pour l'aide.
 * @param {React.ReactNode} props.children          - Contenu principal.
 * @param {function|null}   [props.onLongPressStart] - Début appui long (mode student).
 * @param {function|null}   [props.onLongPressEnd]   - Fin appui long   (mode student).
 */
function Layout({
    mode,
    pageActive,
    children,
    onLongPressStart = null,
    onLongPressEnd = null,
}) {
    const [menuOuvert, setMenuOuvert] = useState(false);
    const [aideOuverte, setAideOuverte] = useState(false);

    const isStudent = mode === "student";

    const modeLabel = isStudent ? "MODE ÉLÈVE" : "MODE ENSEIGNANT";
    const modeCls = isStudent
        ? "bg-brand-600 text-white"
        : "bg-slate-600 text-white";

    /**
     * Badge central de la navbar.
     *
     * En mode élève : zone d'appui long de 2 s → accès enseignant.
     * En mode enseignant : badge statique sans interaction.
     *
     * WebkitTapHighlightColor supprimé pour éviter le flash bleu sur iOS.
     */
    const modeBadge =
        isStudent && onLongPressStart ? (
            <div
                onPointerDown={onLongPressStart}
                onPointerUp={onLongPressEnd}
                onPointerLeave={onLongPressEnd}
                title="Appui long (2 s) : espace enseignant·e"
                className="cursor-pointer select-none rounded-full px-3 py-1
                           hover:brightness-110 active:scale-95 transition-all
                           touch-manipulation"
                style={{ WebkitTapHighlightColor: "transparent" }}
                role="button"
                aria-label="Appui long pour accéder à l'espace enseignant·e"
            >
                <span
                    className={`${modeCls} text-xs font-bold px-3 py-1
                                rounded-full uppercase tracking-wider`}
                >
                    {modeLabel}
                </span>
            </div>
        ) : (
            <span
                className={`${modeCls} text-xs font-bold px-3 py-1
                            rounded-full uppercase tracking-wider`}
            >
                {modeLabel}
            </span>
        );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ── Navbar micetf.fr ──────────────────────────────────────── */}
            <nav
                className="fixed top-0 left-0 right-0 bg-gray-800 shadow-lg z-50"
                aria-label="Barre de navigation principale"
            >
                <div className="max-w-full px-4">
                    <div className="flex items-center justify-between h-14">
                        {/* ── Gauche : logo MiCetF ─────────────────────── */}
                        <a
                            href="https://micetf.fr"
                            className="text-white font-semibold text-lg
                                       hover:text-gray-300 transition shrink-0"
                        >
                            MiCetF
                        </a>

                        {/* ── Hamburger (mobile) ───────────────────────── */}
                        <button
                            type="button"
                            onClick={() => setMenuOuvert((v) => !v)}
                            className="md:hidden inline-flex items-center
                                       justify-center p-2 text-gray-400
                                       hover:text-white hover:bg-gray-700
                                       rounded transition"
                            aria-controls="navbarMenu"
                            aria-expanded={menuOuvert}
                            aria-label="Ouvrir le menu"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>

                        {/* ── Menu principal ───────────────────────────── */}
                        <div
                            id="navbarMenu"
                            className={`
                                ${menuOuvert ? "block" : "hidden"}
                                md:flex md:items-center md:gap-2
                            `}
                        >
                            {/* Badge mode — long-pressable en mode élève */}
                            {modeBadge}

                            {/* Bouton aide */}
                            <button
                                type="button"
                                onClick={() => setAideOuverte(true)}
                                className="px-3 py-2 bg-gray-600 text-white rounded
                                           hover:bg-gray-500 transition my-1 mx-1
                                           inline-flex items-center gap-1
                                           text-sm font-medium"
                                aria-label="Ouvrir l'aide"
                            >
                                <span aria-hidden="true">?</span>
                                <span className="hidden sm:inline">Aide</span>
                            </button>

                            {/* Bouton PayPal — mode enseignant uniquement */}
                            {!isStudent && (
                                <li className="list-none">
                                    <form
                                        action="https://www.paypal.com/donate"
                                        method="post"
                                        target="_blank"
                                        className="inline"
                                    >
                                        <input
                                            type="hidden"
                                            name="hosted_button_id"
                                            value="XXXXXXXXXXXXXXX"
                                        />
                                        <button
                                            type="submit"
                                            className="px-3 py-2 bg-gray-600 text-white
                                                       rounded hover:bg-gray-500 transition
                                                       my-1 mx-1 inline-block text-sm"
                                            title="Faire un don via PayPal"
                                        >
                                            ♥
                                        </button>
                                    </form>
                                </li>
                            )}

                            {/* Lien contact — mode enseignant uniquement */}
                            {!isStudent && (
                                <a
                                    href="mailto:webmaster@micetf.fr?subject=À propos de /fractions-diagnostic"
                                    className="px-3 py-2 bg-gray-600 text-white rounded
                                               hover:bg-gray-700 transition my-1 mx-1
                                               inline-block"
                                    title="Pour contacter le webmaster..."
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        className="h-4 w-4 inline"
                                        fill="#f8f9fa"
                                    >
                                        <path d="M18 2a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V4c0-1.1.9-2 2-2h16zm-4.37 9.1L20 16v-2l-5.12-3.9L20 6V4l-10 8L0 4v2l5.12 4.1L0 14v2l6.37-4.9L10 14l3.63-2.9z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Panneau d'aide contextuelle ───────────────────────────── */}
            <HelpPanel
                ouvert={aideOuverte}
                onFermer={() => setAideOuverte(false)}
                pageActive={pageActive}
            />

            {/* ── Contenu principal ─────────────────────────────────────── */}
            <main className="pt-14">{children}</main>

            {/* ── Pied de page ─────────────────────────────────────────── */}
            <footer className="text-center text-xs text-slate-400 py-4 mt-8">
                Données stockées localement sur cet ordinateur
            </footer>
        </div>
    );
}

Layout.propTypes = {
    /** Mode d'affichage courant. */
    mode: PropTypes.oneOf(["teacher", "student"]).isRequired,
    /** Conservé pour compatibilité ascendante — non utilisé en v2. */
    onSwitchMode: PropTypes.func,
    /** Clé de la page active pour l'aide contextuelle. */
    pageActive: PropTypes.string.isRequired,
    /** Contenu principal injecté via children. */
    children: PropTypes.node.isRequired,
    /**
     * Callback de début d'appui long — fourni par useLongPress() dans App.jsx.
     * Requis pour activer la zone long-press en mode élève.
     */
    onLongPressStart: PropTypes.func,
    /**
     * Callback de fin d'appui long (pointerUp ou pointerLeave).
     * Annule le timer si l'appui est relâché avant 2 s.
     */
    onLongPressEnd: PropTypes.func,
};

Layout.defaultProps = {
    onSwitchMode: () => {},
    onLongPressStart: null,
    onLongPressEnd: null,
};

export default Layout;
