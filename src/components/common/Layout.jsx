/**
 * @file Layout.jsx — squelette de page.
 *
 * @description
 * Assemble :
 *   - `Navbar` — barre de navigation (design fractions-ce1-u1s6)
 *   - `HelpPanel` — drawer d'aide contextuelle
 *   - `<main>` — slot children
 *   - `<footer>` — mention locale
 *
 * La logique d'affichage de la navbar (zones, long-press, actions)
 * est entièrement déléguée à Navbar.jsx → NavCenter.jsx → NavActions.jsx.
 * Layout reste un composant de présentation pur.
 *
 * @module components/common/Layout
 */

import { useState } from "react";
import PropTypes from "prop-types";
import Navbar from "./Navbar";
import HelpPanel from "./HelpPanel";

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Squelette de page avec navbar et aide contextuelle.
 *
 * @param {'teacher'|'student'} props.mode            - Mode courant.
 * @param {string}              props.pageActive       - Clé de la page pour l'aide.
 * @param {React.ReactNode}     props.children         - Contenu principal.
 * @param {Function|null}       [props.onLongPressStart] - Début appui long (student).
 * @param {Function|null}       [props.onLongPressEnd]   - Fin appui long   (student).
 */
function Layout({
    mode,
    pageActive,
    children,
    onLongPressStart = null,
    onLongPressEnd = null,
}) {
    const [aideOuverte, setAideOuverte] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ── Barre de navigation ───────────────────────────────────── */}
            <Navbar
                mode={mode}
                onHelp={() => setAideOuverte(true)}
                onLongPressStart={onLongPressStart}
                onLongPressEnd={onLongPressEnd}
            />

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
    mode: PropTypes.oneOf(["teacher", "student"]).isRequired,
    pageActive: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    onLongPressStart: PropTypes.func,
    onLongPressEnd: PropTypes.func,
};

Layout.defaultProps = {
    onLongPressStart: null,
    onLongPressEnd: null,
};

export default Layout;
