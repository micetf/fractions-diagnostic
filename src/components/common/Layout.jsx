import { useState } from 'react'
import PropTypes from 'prop-types'
import HelpPanel from './HelpPanel'

/**
 * Layout
 *
 * Navbar micetf.fr + panneau d'aide contextuelle.
 *
 * @param {object}          props
 * @param {'teacher'|'student'} props.mode
 * @param {function}        props.onSwitchMode
 * @param {string}          props.pageActive   - Page courante pour l'aide.
 * @param {React.ReactNode} props.children
 */
function Layout({ mode, pageActive, children }) {
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [aideOuverte, setAideOuverte] = useState(false)

  const modeLabel = mode === 'teacher' ? 'MODE ENSEIGNANT' : 'MODE ÉLÈVE'
  const modeCls   = mode === 'teacher'
    ? 'bg-slate-600 text-white'
    : 'bg-brand-600 text-white'

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Navbar micetf.fr ──────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 bg-gray-800 shadow-lg z-50"
        aria-label="Barre de navigation principale"
      >
        <div className="max-w-full px-4">
          <div className="flex items-center justify-between h-14">
<a
            
              href="https://micetf.fr"
              className="text-white font-semibold text-lg hover:text-gray-300
                         transition shrink-0"
            >
              MiCetF
            </a>

            <button
              type="button"
              onClick={() => setMenuOuvert(v => !v)}
              className="md:hidden inline-flex items-center justify-center p-2
                         text-gray-400 hover:text-white hover:bg-gray-700
                         rounded transition"
              aria-controls="navbarMenu"
              aria-expanded={menuOuvert}
              aria-label="Ouvrir le menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div
              id="navbarMenu"
              className={`
                ${menuOuvert ? 'flex' : 'hidden'} md:flex md:items-center md:flex-1
                flex-col md:flex-row absolute md:static top-14 left-0 right-0
                bg-gray-800 md:bg-transparent px-4 md:px-0 pb-3 md:pb-0
              `}
            >
              <div className="flex items-center ml-0 md:ml-4 py-2 md:py-0">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                       className="h-4 w-4 shrink-0" fill="#f8f9fa">
                    <path d="M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z" />
                  </svg>
                  <span className="text-white font-semibold text-lg"
                        style={{ fontFamily: 'Fredoka, sans-serif' }}>
                    Fraction Diagnostic
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full
                                    tracking-wide ml-1 ${modeCls}`}>
                    {modeLabel}
                  </span>
                </div>
              </div>

              <div className="flex-1" />

              <ul className="flex items-center space-x-1 mt-2 md:mt-0">

                {/* Bouton aide — ouvre HelpPanel */}
                <li>
                  <button
                    type="button"
                    onClick={() => setAideOuverte(v => !v)}
                    className={`w-10 h-10 rounded-full font-bold text-lg
                                transition cursor-pointer
                                ${aideOuverte
                                  ? 'bg-blue-400 text-white'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                    title="Aide"
                    aria-label="Ouvrir l'aide"
                    aria-expanded={aideOuverte}
                  >
                    ?
                  </button>
                </li>

                {/* Don PayPal */}
                <li>
                  <form
                    action="https://www.paypal.com/cgi-bin/webscr"
                    method="post"
                    target="_top"
                    className="inline-block"
                  >
                    <button
                      type="submit"
                      className="px-3 py-2 bg-yellow-500 text-white rounded
                                 hover:bg-yellow-600 transition my-1 mx-1 cursor-pointer"
                      title="Si vous pensez que ces outils le méritent... Merci !"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                           className="h-4 w-4 inline" fill="#f8f9fa">
                        <path d="M10 3.22l-.61-.6a5.5 5.5 0 00-7.78 7.77L10 18.78l8.39-8.4a5.5 5.5 0 00-7.78-7.77l-.61.61z" />
                      </svg>
                    </button>
                    <input type="hidden" name="cmd" value="_s-xclick" />
                    <input type="hidden" name="hosted_button_id" value="Q2XYVFP4EEX2J" />
                  </form>
                </li>

                {/* Contact */}
                <li>
                  <a
                    href="mailto:webmaster@micetf.fr?subject=À propos de /fractions-diagnostic"
                    className="px-3 py-2 bg-gray-600 text-white rounded
                               hover:bg-gray-700 transition my-1 mx-1 inline-block"
                    title="Pour contacter le webmaster..."
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                         className="h-4 w-4 inline" fill="#f8f9fa">
                      <path d="M18 2a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V4c0-1.1.9-2 2-2h16zm-4.37 9.1L20 16v-2l-5.12-3.9L20 6V4l-10 8L0 4v2l5.12 4.1L0 14v2l6.37-4.9L10 14l3.63-2.9z" />
                    </svg>
                  </a>
                </li>

              </ul>
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
      <main className="pt-14">
        {children}
      </main>

      {/* ── Pied de page ─────────────────────────────────────────── */}
      <footer className="text-center text-xs text-slate-400 py-4 mt-8">
        Données stockées localement sur cet ordinateur
      </footer>

    </div>
  )
}

Layout.propTypes = {
  mode:         PropTypes.oneOf(['teacher', 'student']).isRequired,
  onSwitchMode: PropTypes.func.isRequired,
  pageActive:   PropTypes.string.isRequired,
  children:     PropTypes.node.isRequired,
}

export default Layout