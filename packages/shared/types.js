/**
 * @fileoverview Types JSDoc partagés entre l'interface admin et l'interface passation.
 *
 * Source de vérité des structures de données (SRS §6.3).
 * Ne contient aucune logique exécutable — uniquement des @typedef.
 *
 * @module @fractions-diagnostic/shared/types
 */

/**
 * @typedef {'CE1'|'CE2'|'CM1'|'CM2'} Niveau
 */

/**
 * @typedef {object} Config
 * @property {string}      pin_hash       - SHA-256 du PIN. Jamais le PIN en clair (SRS NF-SEC-01).
 * @property {string|null} pin_hint       - Indice textuel optionnel. Stocké en clair.
 * @property {string}      annee_scolaire - Ex. : "2025-2026".
 */

/**
 * @typedef {object} Eleve
 * @property {string}      id     - crypto.randomUUID()
 * @property {string}      prenom - Prénom (requis).
 * @property {string|null} nom    - Nom de famille (optionnel).
 */

/**
 * @typedef {object} Classe
 * @property {string}  id             - crypto.randomUUID()
 * @property {string}  nom            - Nom de la classe (ex. : "CM1 A").
 * @property {Niveau}  niveau         - Niveau scolaire.
 * @property {string}  annee_scolaire - Hérité de la config à la création.
 * @property {Eleve[]} eleves         - Liste des élèves de la classe.
 */

/**
 * Diagnostic — unité de travail créée par l'enseignant.
 * Remplace la notion de "Session" de la v1.0.
 * Pas de cycle de vie : disponible indéfiniment (SRS F-DIA-06).
 *
 * @typedef {object} Diagnostic
 * @property {string}      id                     - crypto.randomUUID()
 * @property {string}      classe_id              - Référence à Classe.id
 * @property {Niveau}      niveau                 - Peut différer du niveau de la classe.
 * @property {number[]}    exercices_selectionnes - Numéros des exercices retenus (1 à 8).
 * @property {string|null} libelle                - Étiquette libre (ex. : "Octobre"). Optionnel.
 * @property {string}      date_creation          - ISO 8601.
 */

/**
 * @typedef {object} ReponseExercice
 * @property {number}        exercice_numero
 * @property {string}        type          - selection|fraction_input|number_line|binary_choice|coloring|text
 * @property {any}           valeur_brute
 * @property {string[]}      biais_auto
 * @property {string[]|null} biais_manuel
 * @property {number}        duree_ms
 * @property {boolean}       a_relire
 */

/**
 * @typedef {object} PassationEleve
 * @property {string}                   id
 * @property {string}                   diagnostic_id  - Remplace session_id de la v1.0.
 * @property {string}                   eleve_id
 * @property {'en_cours'|'terminee'}    statut
 * @property {string}                   date_debut
 * @property {string|null}              date_fin
 * @property {string}                   note_enseignant
 * @property {ReponseExercice[]}        reponses
 */

/**
 * Fichier exporté par l'admin (Phase 1). Ne contient aucun résultat (SRS F-CFG-02).
 *
 * @typedef {object} FichierConfig
 * @property {'fractions-config'} type
 * @property {'2.0'}              version
 * @property {string}             exported_at
 * @property {string}             diagnostic_id
 * @property {Niveau}             niveau
 * @property {number[]}           exercices_selectionnes
 * @property {Pick<Eleve,'id'|'prenom'>[]} eleves
 */

/**
 * Fichier exporté par l'app passer (Phase 3).
 *
 * @typedef {object} FichierResultats
 * @property {'fractions-resultats'} type
 * @property {'2.0'}                 version
 * @property {string}                exported_at
 * @property {string}                diagnostic_id
 * @property {PassationEleve[]}      passations
 */

/**
 * Sauvegarde complète exportée depuis l'admin (SRS F-EXP-02).
 *
 * @typedef {object} FichierSauvegarde
 * @property {'fractions-sauvegarde'} type
 * @property {'2.0'}                  version
 * @property {string}                 exported_at
 * @property {Config}                 config
 * @property {Classe[]}               classes
 * @property {Diagnostic[]}           diagnostics
 * @property {PassationEleve[]}       passations
 */

// Ce fichier n'exporte aucune valeur — uniquement des types JSDoc.
export {};
