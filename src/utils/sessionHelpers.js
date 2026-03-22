/**
 * @fileoverview Utilitaires pour la création et l'affichage des sessions.
 */

import { getBiais } from "@/data/biais";

/**
 * Durées de référence issues des conseils de passation des documents sources.
 * nbRef : nombre d'exercices de référence pour la fourchette de durée.
 *
 * CE1/CE2 : "exercices 1 à 8" → 8 exercices.
 * CM1/CM2 : "en sélectionnant 5 à 6 exercices" → moyenne 5,5.
 */
const DUREES_REF = {
    CE1: { min: 25, max: 30, nbRef: 8 },
    CE2: { min: 30, max: 35, nbRef: 8 },
    CM1: { min: 35, max: 40, nbRef: 5.5 },
    CM2: { min: 40, max: 45, nbRef: 5.5 },
};

/**
 * Calcule une durée estimée en minutes pour un niveau et un nombre
 * d'exercices donnés, par proportionnalité avec les données sources.
 *
 * @param {'CE1'|'CE2'|'CM1'|'CM2'} niveau
 * @param {number} nbExercices - Nombre d'exercices sélectionnés.
 * @returns {number} Durée estimée en minutes (arrondie).
 */
export function calculerDureeEstimee(niveau, nbExercices) {
    const ref = DUREES_REF[niveau];
    const moyenne = (ref.min + ref.max) / 2;
    return Math.round((moyenne / ref.nbRef) * nbExercices);
}

/**
 * Collecte tous les codes biais détectables d'un exercice,
 * y compris ceux définis dans les sous-questions (récursif).
 *
 * @param {object} exercice - Objet exercice issu des fichiers data.
 * @returns {string[]} Tableau de codes biais uniques.
 */
export function collecterBiaisExercice(exercice) {
    const codes = new Set();

    function parcourir(node) {
        node.biaisDetectables?.forEach((b) => codes.add(b.code));
        node.sousQuestions?.forEach((sq) => parcourir(sq));
    }

    parcourir(exercice);
    return [...codes];
}

/**
 * Retourne les intitulés des biais d'un exercice, depuis le dictionnaire.
 * Si un code n'est pas dans le dictionnaire, il est ignoré.
 *
 * @param {object} exercice
 * @returns {string[]} Intitulés lisibles.
 */
export function intitulerBiaisExercice(exercice) {
    return collecterBiaisExercice(exercice)
        .map((code) => getBiais(code)?.intitule)
        .filter(Boolean);
}
