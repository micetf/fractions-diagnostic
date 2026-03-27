/**
 * @fileoverview Hook useLongPress — gestion du geste d'appui long.
 *
 * Encapsule la logique `holdRef` + `LONG_PRESS_DELAY` observée dans
 * fractions-ce1-u1s6/src/App.jsx (FredM, micetf.fr), extraite ici en
 * hook réutilisable pour DiagFractions.
 *
 * Le geste remplace le code PIN comme mécanisme d'accès à l'espace
 * enseignant depuis le mode élève : aucune saisie, geste intentionnel
 * de 2 secondes, invisible pour un élève de primaire.
 *
 * Usage :
 * ```js
 * const handlers = useLongPress(onTrigger);
 * // handlers = { onPointerDown, onPointerUp, onPointerLeave }
 * // À déstructurer sur l'élément JSX cible :
 * <div {...handlers}>Zone d'appui long</div>
 * ```
 *
 * @module hooks/useLongPress
 */

import { useRef, useCallback } from "react";

// ─── Constante ─────────────────────────────────────────────────────────────────

/**
 * Durée en millisecondes avant déclenchement.
 * Valeur identique à fractions-ce1-u1s6 (LONG_PRESS_DELAY = 2000).
 * Exportée pour permettre des tests unitaires ou des affichages de progression.
 *
 * @type {number}
 */
export const LONG_PRESS_DELAY = 2000;

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Gère un geste d'appui long sur un élément DOM.
 *
 * Déclenche `onTrigger` après `delay` ms d'appui continu.
 * Tout relâchement (pointerUp ou pointerLeave) annule le timer
 * sans effet de bord.
 *
 * @param {Function} onTrigger - Callback déclenché après l'appui long.
 *   Appelé sans argument. Doit être stable (useCallback côté appelant
 *   si elle capture des variables réactives).
 * @param {number} [delay=LONG_PRESS_DELAY] - Durée en ms. Par défaut 2000.
 *
 * @returns {{
 *   onPointerDown:  Function,
 *   onPointerUp:    Function,
 *   onPointerLeave: Function
 * }} Gestionnaires à attacher à l'élément cible via spread ou props explicites.
 *
 * @example
 * // Composant appelant
 * const handlers = useLongPress(() => setShowConfirm(true));
 * return <div {...handlers}>Titre navbar</div>;
 */
export function useLongPress(onTrigger, delay = LONG_PRESS_DELAY) {
    /** @type {React.MutableRefObject<ReturnType<typeof setTimeout>|null>} */
    const holdRef = useRef(null);

    /**
     * Démarre le timer au premier contact.
     * Un deuxième pointerDown avant annulation écrase le timer précédent
     * sans fuite mémoire grâce au clearTimeout implicite de l'affectation.
     */
    const onPointerDown = useCallback(() => {
        clearTimeout(holdRef.current);
        holdRef.current = setTimeout(() => {
            onTrigger();
        }, delay);
    }, [onTrigger, delay]);

    /**
     * Annule le timer dès le relâchement du pointeur ou la sortie de zone.
     * Utilisé pour onPointerUp ET onPointerLeave.
     */
    const cancel = useCallback(() => {
        clearTimeout(holdRef.current);
        holdRef.current = null;
    }, []);

    return {
        onPointerDown,
        onPointerUp: cancel,
        onPointerLeave: cancel,
    };
}
