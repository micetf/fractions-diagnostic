/**
 * @fileoverview Point d'entrée unifié des données de l'application.
 *
 * Expose les fonctions utilisées par AppContext, PassationRunner et
 * les composants d'analyse.
 */

import {
    exercices as exercicesCE1,
    metadonnees as metaCE1,
} from "./exercices/CE1.js";
import {
    exercices as exercicesCE2,
    metadonnees as metaCE2,
} from "./exercices/CE2.js";
import {
    exercices as exercicesCM1,
    metadonnees as metaCM1,
} from "./exercices/CM1.js";
import {
    exercices as exercicesCM2,
    metadonnees as metaCM2,
} from "./exercices/CM2.js";
import { BIAIS, getBiais } from "./biais.js";

const NIVEAUX = {
    CE1: { exercices: exercicesCE1, metadonnees: metaCE1 },
    CE2: { exercices: exercicesCE2, metadonnees: metaCE2 },
    CM1: { exercices: exercicesCM1, metadonnees: metaCM1 },
    CM2: { exercices: exercicesCM2, metadonnees: metaCM2 },
};

/**
 * Retourne les exercices d'un niveau.
 * @param {'CE1'|'CE2'|'CM1'|'CM2'} niveau
 * @returns {Array}
 */
export function getExercices(niveau) {
    return NIVEAUX[niveau]?.exercices ?? [];
}

/**
 * Retourne les métadonnées de passation d'un niveau.
 * @param {'CE1'|'CE2'|'CM1'|'CM2'} niveau
 * @returns {object}
 */
export function getMetadonnees(niveau) {
    return NIVEAUX[niveau]?.metadonnees ?? null;
}

/**
 * Retourne un exercice spécifique.
 * @param {'CE1'|'CE2'|'CM1'|'CM2'} niveau
 * @param {number} numero - Numéro de l'exercice (1 à 8)
 * @returns {object | undefined}
 */
export function getExercice(niveau, numero) {
    return getExercices(niveau).find((ex) => ex.numero === numero);
}

/**
 * Retourne les niveaux disponibles.
 * @returns {string[]}
 */
export function getNiveaux() {
    return Object.keys(NIVEAUX);
}

export { BIAIS, getBiais };
