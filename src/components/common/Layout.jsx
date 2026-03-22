import PropTypes from "prop-types";

/**
 * Layout
 *
 * Structure commune à toutes les pages.
 * Affiche un bandeau supérieur indiquant le mode courant
 * et encadre le contenu principal.
 *
 * @param {object}                  props
 * @param {'teacher'|'student'}     props.mode          - Mode d'interface courant.
 * @param {function}                props.onSwitchMode  - Callback de changement de mode.
 * @param {React.ReactNode}         props.children      - Contenu de la page.
 */
function Layout({ mode, children }) {
    const isStudent = mode === "student";

    return (
        <div
            className={`min-h-screen flex flex-col ${isStudent ? "mode-student" : "bg-slate-50"}`}
        >
            {/* ── Bandeau supérieur ─────────────────────────────────── */}
            <header
                className={`
        w-full px-4 py-2 flex items-center justify-between
        ${isStudent ? "bg-brand-600" : "bg-brand-800"}
      `}
            >
                <span className="font-display font-bold text-white tracking-wide">
                    Fraction Diagnostic
                </span>

                <span
                    className={`
          px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-widest
          ${isStudent ? "bg-white/20 text-white" : "bg-white/10 text-brand-200"}
        `}
                >
                    {isStudent ? "Mode élève" : "Mode enseignant"}
                </span>
            </header>

            {/* ── Contenu ───────────────────────────────────────────── */}
            <main className="flex-1 w-full">{children}</main>

            {/* ── Pied de page ──────────────────────────────────────── */}
            <footer className="w-full px-4 py-2 text-center text-xs text-slate-400 border-t border-slate-200">
                Données stockées localement sur cet ordinateur
            </footer>
        </div>
    );
}

Layout.propTypes = {
    mode: PropTypes.oneOf(["teacher", "student"]).isRequired,
    onSwitchMode: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

export default Layout;
