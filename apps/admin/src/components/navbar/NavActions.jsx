/**
 * @file NavActions.jsx — zone droite de la barre de navigation.
 *
 * @description
 * Adapté de fractions-ce1-u1s6/src/components/navbar/NavActions.jsx (FredM, micetf.fr).
 *
 * Boutons d'action alignés à droite. Comportement selon le mode :
 *
 * ── Mode élève (`isStudent` true) ────────────────────────────────────
 *   [? Aide]
 *
 * ── Mode enseignant (`isStudent` false) ──────────────────────────────
 *   [? Aide]  [♥ Don PayPal]  [✉ Email]
 *
 * Différences avec fractions-ce1-u1s6 :
 *   - Pas de bouton 📊 (pas de dashboard élève dans DiagFractions)
 *   - PayPal + Email affichés en mode enseignant (pas de mode visitor séparé)
 *   - `onHelp` déclenche HelpPanel (drawer) au lieu de HelpModal (overlay)
 *
 * @module navbar/NavActions
 */

import PropTypes from "prop-types";

// ─── SVG Icons ─────────────────────────────────────────────────────────────────

/** Icône cœur PayPal — identique à fractions-ce1-u1s6. */
const IconHeart = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className="h-4 w-4 inline"
        fill="#f8f9fa"
        aria-hidden="true"
    >
        <path d="M10 3.22l-.61-.6a5.5 5.5 0 00-7.78 7.77L10 18.78l8.39-8.4a5.5 5.5 0 00-7.78-7.77l-.61.61z" />
    </svg>
);

/** Icône enveloppe email — identique à fractions-ce1-u1s6. */
const IconMail = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className="h-4 w-4 inline"
        fill="#f8f9fa"
        aria-hidden="true"
    >
        <path d="M18 2a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V4c0-1.1.9-2 2-2h16zm-4.37 9.1L20 16v-2l-5.12-3.9L20 6V4l-10 8L0 4v2l5.12 4.1L0 14v2l6.37-4.9L10 14l3.63-2.9z" />
    </svg>
);

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Zone droite de la Navbar — boutons d'action.
 *
 * @param {boolean}  props.isStudent  - Vrai en mode élève (masque PayPal/email).
 * @param {Function} props.onHelp     - Ouvre le HelpPanel (drawer latéral).
 * @returns {JSX.Element}
 */
export default function NavActions({ isStudent, onHelp }) {
    const mailSubject = encodeURIComponent("À propos de /fractions-diagnostic");

    return (
        <ul className="flex items-center gap-1 shrink-0">
            {/* ? Aide — toujours présent, identique à fractions-ce1-u1s6 */}
            <li>
                <button
                    type="button"
                    onClick={onHelp}
                    className="w-10 h-10 bg-blue-600 text-white rounded-full
                               hover:bg-blue-700 transition font-bold text-lg
                               touch-manipulation"
                    title="Aide"
                    aria-label="Ouvrir l'aide"
                >
                    ?
                </button>
            </li>

            {/* ♥ Don PayPal — mode enseignant uniquement */}
            {!isStudent && (
                <li>
                    <form
                        action="https://www.paypal.com/cgi-bin/webscr"
                        method="post"
                        target="_top"
                        className="inline-block"
                    >
                        <input type="hidden" name="cmd" value="_s-xclick" />
                        <input
                            type="hidden"
                            name="hosted_button_id"
                            value="Q2XYVFP4EEX2J"
                        />
                        <button
                            type="submit"
                            className="px-3 py-2 bg-yellow-500 text-white rounded
                                       hover:bg-yellow-600 transition
                                       touch-manipulation"
                            title="Si vous pensez que ces outils le méritent… Merci !"
                        >
                            <IconHeart />
                        </button>
                    </form>
                </li>
            )}

            {/* ✉ Email — mode enseignant uniquement */}
            {!isStudent && (
                <li>
                    <a
                        href={`mailto:webmaster@micetf.fr?subject=${mailSubject}`}
                        className="px-3 py-2 bg-gray-600 text-white rounded
                                   hover:bg-gray-700 transition inline-block
                                   touch-manipulation"
                        title="Contacter le webmaster"
                    >
                        <IconMail />
                    </a>
                </li>
            )}
        </ul>
    );
}

NavActions.propTypes = {
    /** Vrai en mode élève — masque PayPal et email. */
    isStudent: PropTypes.bool.isRequired,
    /** Ouvre le HelpPanel contextuel (drawer depuis la droite). */
    onHelp: PropTypes.func.isRequired,
};
