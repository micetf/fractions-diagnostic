/**
 * @fileoverview Contenus d'aide contextualisée.
 *
 * Une entrée par page/mode. Chaque entrée contient :
 *   - titre    : nom de la section
 *   - intro    : phrase d'accroche (1 ligne)
 *   - sections : blocs question/réponse
 *
 * Mise à jour v2.0 (Sprint 3) :
 *   - `premier_lancement` : suppression de l'étape "Créez un code PIN"
 *   - `eleve` : suppression des références au code PIN,
 *     remplacement par la description du geste appui long
 *   - `export_import` : "Remise à zéro" ne mentionne plus le PIN
 */

export const AIDE = {
    // ── Premier lancement ───────────────────────────────────────────────────
    premier_lancement: {
        titre: "Premiers pas",
        intro: "Bienvenue dans Fraction Diagnostic. Voici les 3 étapes pour commencer.",
        sections: [
            {
                q: "1. Créez une classe",
                r: "Allez dans « Mes classes » et créez une classe avec son niveau (CE1, CE2, CM1 ou CM2). Ajoutez les prénoms de vos élèves.",
            },
            {
                q: "2. Lancez une session",
                r: "Cliquez sur « Nouvelle session », choisissez votre classe et sélectionnez les exercices. Le tableau de lecture rapide vous indique quels biais chaque exercice cible.",
            },
            {
                q: "3. Faites passer les exercices",
                r: "L'application bascule en mode élève. Chaque élève choisit son prénom et répond aux exercices. Aucune correction n'apparaît pendant la passation.",
            },
            {
                q: "Comment revenir au tableau de bord enseignant ?",
                r: "Maintenez appuyé pendant 2 secondes le badge « MODE ÉLÈVE » dans la barre de navigation. Un écran de confirmation s'affiche — cliquez sur « Oui, accéder » pour retrouver votre tableau de bord.",
            },
        ],
    },

    // ── Accueil enseignant ──────────────────────────────────────────────────
    accueil: {
        titre: "Tableau de bord",
        intro: "Point de départ de toutes vos actions.",
        sections: [
            {
                q: "Mes classes",
                r: "Créez et gérez vos classes et vos élèves. Une classe peut être archivée en fin d'année pour masquer les données passées sans les supprimer.",
            },
            {
                q: "Sessions",
                r: "Retrouvez l'historique de toutes vos sessions diagnostiques. Vous pouvez relancer une session en cours ou analyser une session clôturée.",
            },
            {
                q: "Nouvelle session",
                r: "Créez une session en choisissant la classe, le niveau et les exercices. La durée estimée s'affiche en temps réel selon votre sélection.",
            },
            {
                q: "Analyse des résultats",
                r: "Accédez au tableau de bord d'analyse de vos sessions. Redirige vers la liste des sessions pour choisir celle à analyser.",
            },
            {
                q: "Export / Import",
                r: "Exportez vos résultats en CSV ou sauvegardez toutes vos données en JSON. Indispensable avant une remise à zéro de fin d'année.",
            },
        ],
    },

    // ── Gestion des classes ─────────────────────────────────────────────────
    classes: {
        titre: "Mes classes",
        intro: "Gérez vos classes et vos listes d'élèves.",
        sections: [
            {
                q: "Créer une classe",
                r: "Cliquez sur « Nouvelle classe », saisissez un nom et choisissez le niveau (CE1 à CM2). La classe apparaît immédiatement dans la liste.",
            },
            {
                q: "Ajouter des élèves",
                r: "Ouvrez la classe et utilisez le champ d'ajout. Le prénom est obligatoire, le nom de famille est optionnel. Les élèves sont triés par prénom.",
            },
            {
                q: "Archiver une classe",
                r: "L'archivage masque la classe dans les listes de création de sessions, sans supprimer les données. Idéal en début d'année scolaire.",
            },
        ],
    },

    // ── Sessions ────────────────────────────────────────────────────────────
    sessions: {
        titre: "Sessions diagnostiques",
        intro: "Créez, gérez et analysez vos sessions.",
        sections: [
            {
                q: "Créer une session",
                r: "Choisissez une classe, sélectionnez les exercices et cliquez sur « Lancer ». L'application passe immédiatement en mode élève.",
            },
            {
                q: "Tableau de lecture rapide des biais",
                r: "Affiché lors de la sélection des exercices, il indique quels biais chaque exercice cible. Aidez-vous-en pour choisir les exercices les plus pertinents.",
            },
            {
                q: "Relancer une session",
                r: "Une session « en cours » peut être relancée depuis la liste des sessions. Les passations déjà effectuées sont conservées.",
            },
            {
                q: "Clôturer une session",
                r: "Depuis la liste des sessions ou via « Retour mode enseignant » en mode élève. La session passe au statut « terminée » et devient analysable.",
            },
        ],
    },

    // ── Analyse ─────────────────────────────────────────────────────────────
    analyse: {
        titre: "Analyse des résultats",
        intro: "Trois vues complémentaires pour exploiter les résultats.",
        sections: [
            {
                q: "Matrice résultats",
                r: "Un tableau élèves × exercices. Chaque cellule indique l'état : Réussi, Biais détecté, À relire, Non fait. Survolez une cellule pour voir le détail.",
            },
            {
                q: "Vue biais",
                r: "Distribution des 14 codes biais sur l'ensemble de la classe. Une alerte s'affiche si 30 % ou plus des élèves déclenchent le même biais.",
            },
            {
                q: "Profil élève",
                r: "Détail exercice par exercice pour un élève : réponse produite, biais détectés, durée. Vous pouvez y ajouter une note libre.",
            },
            {
                q: "Items à relire",
                r: "Regroupe les exercices nécessitant une validation manuelle (réponses ouvertes). Attribuez un code biais ou validez comme réussi.",
            },
        ],
    },

    // ── Export / Import ─────────────────────────────────────────────────────
    export_import: {
        titre: "Export / Import",
        intro: "Sauvegardez et restaurez vos données.",
        sections: [
            {
                q: "Export CSV — à quoi ça sert ?",
                r: "Produit un tableau des résultats d'une session exploitable dans un tableur (LibreOffice Calc, Excel). Une colonne par exercice, une ligne par élève, avec les états Réussi / Biais / À relire / Non fait.",
            },
            {
                q: "Export JSON — à quoi ça sert ?",
                r: "Sauvegarde complète de toutes vos données : classes, élèves, sessions, passations, notes. À télécharger avant une remise à zéro ou pour transférer les données sur un autre ordinateur.",
            },
            {
                q: "Import JSON — comment restaurer ?",
                r: "Sélectionnez un fichier de sauvegarde `.json` exporté depuis cette application. Toutes les données actuelles seront remplacées. L'application se rechargera automatiquement.",
            },
            {
                q: "Remise à zéro — quand l'utiliser ?",
                r: "En début d'année scolaire, après avoir exporté une sauvegarde JSON. Supprime toutes les classes, sessions et passations. L'application revient à son état initial.",
            },
        ],
    },

    // ── Mode élève ──────────────────────────────────────────────────────────
    eleve: {
        titre: "Mode élève",
        intro: "La session est prête. Les élèves peuvent passer leur tour en autonomie.",
        sections: [
            {
                q: "Comment l'élève démarre-t-il ?",
                r: "L'élève arrive sur le PC, voit l'écran « Qui es-tu ? » et choisit son prénom. Vous n'avez pas besoin d'être présent entre chaque élève.",
            },
            {
                q: "Que se passe-t-il après la passation ?",
                r: "L'écran « C'est terminé ! » s'affiche. Le bouton « Élève suivant » replace l'application sur le sélecteur de prénoms pour le prochain élève.",
            },
            {
                q: "Comment revenir en mode enseignant ?",
                r: "Maintenez appuyé pendant 2 secondes le badge « MODE ÉLÈVE » dans la barre de navigation. Un écran de confirmation apparaît — cliquez sur « Oui, accéder ». Vous pouvez aussi utiliser le lien discret « Retour mode enseignant » affiché en bas des écrans élève.",
            },
            {
                q: "L'élève a fermé la fenêtre par erreur",
                r: "Aucun problème. En rouvrant le navigateur, l'application retrouve la session active et revient directement sur le sélecteur de prénoms. Les réponses déjà soumises sont enregistrées.",
            },
        ],
    },
};

/**
 * Retourne le contenu d'aide pour une page donnée.
 * Retourne l'aide de l'accueil si la page n'est pas trouvée.
 *
 * @param {string} page
 * @returns {object}
 */
export function getAide(page) {
    return AIDE[page] ?? AIDE.accueil;
}
