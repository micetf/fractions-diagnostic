/**
 * @fileoverview Contenus d'aide contextualisée.
 *
 * Une entrée par page/mode. Chaque entrée contient :
 *   - titre    : nom de la section
 *   - intro    : phrase d'accroche (1 ligne)
 *   - sections : blocs question/réponse
 */

export const AIDE = {
    // ── Premier lancement ───────────────────────────────────────────────────
    premier_lancement: {
        titre: "Premiers pas",
        intro: "Bienvenue dans Fraction Diagnostic. Voici les 4 étapes pour commencer.",
        sections: [
            {
                q: "1. Créez un code PIN",
                r: "Ce code à 4 chiffres protège l'accès au mode enseignant. Choisissez un code mémorisable — il sera demandé à chaque retour depuis le mode élève.",
            },
            {
                q: "2. Créez une classe",
                r: "Allez dans « Mes classes » et créez une classe avec son niveau (CE1, CE2, CM1 ou CM2). Ajoutez les prénoms de vos élèves.",
            },
            {
                q: "3. Lancez une session",
                r: "Cliquez sur « Nouvelle session », choisissez votre classe et sélectionnez les exercices. Le tableau de lecture rapide vous indique quels biais chaque exercice cible.",
            },
            {
                q: "4. Faites passer les exercices",
                r: "L'application bascule en mode élève. Chaque élève choisit son prénom et répond aux exercices. Aucune correction n'apparaît pendant la passation.",
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
        titre: "Gestion des classes",
        intro: "Organisez vos classes et vos listes d'élèves.",
        sections: [
            {
                q: "Créer une classe",
                r: "Donnez un nom libre (ex. : « CM1 B ») et choisissez le niveau. Le niveau peut être différent de celui de la classe réelle — il détermine les exercices proposés.",
            },
            {
                q: "Ajouter des élèves",
                r: "Cliquez sur le nom de la classe pour accéder à la liste. Le prénom est obligatoire, le nom de famille est optionnel. Les élèves sont triés alphabétiquement.",
            },
            {
                q: "Modifier ou supprimer un élève",
                r: "Vous pouvez modifier le prénom à tout moment. La suppression est bloquée si l'élève a déjà passé une session — ses résultats seraient perdus.",
            },
            {
                q: "Archiver une classe",
                r: "L'archivage masque la classe de la liste principale sans effacer les données. Utile en fin d'année. Les classes archivées sont visibles dans un menu déroulant.",
            },
            {
                q: "Pourquoi ne peut-on pas supprimer une classe ?",
                r: "Supprimer une classe effacerait aussi toutes ses sessions et passations. L'archivage est préféré pour éviter les pertes accidentelles. Une remise à zéro complète est disponible dans Export / Import.",
            },
        ],
    },

    // ── Créer une session ───────────────────────────────────────────────────
    "creer-session": {
        titre: "Créer une session",
        intro: "Paramétrez votre diagnostic en deux étapes.",
        sections: [
            {
                q: "Étape 1 — Classe et niveau",
                r: "Choisissez la classe concernée. Le niveau est automatiquement rempli d'après le niveau de la classe, mais vous pouvez l'ajuster (ex. : pour un diagnostic de positionnement en début de cycle).",
            },
            {
                q: "Étape 2 — Sélection des exercices",
                r: "Cochez les exercices que vous souhaitez proposer. Le tableau de lecture rapide affiche la compétence ciblée et les biais détectables pour chaque exercice. La durée estimée se met à jour en temps réel.",
            },
            {
                q: "Conseil de sélection",
                r: "Le bandeau bleu affiche les recommandations issues des documents sources (ex. : « En début d'année de CM1, commencer par les exercices 1, 2 et 7 »). Ces recommandations sont verbatim depuis les conseilsde passation.",
            },
            {
                q: "Qu'est-ce qu'un biais détectable automatiquement ?",
                r: "Certaines erreurs produisent une réponse numérique précise (ex. : 3/10 pour 1/5 + 2/5 → biais « Addition des dénominateurs »). Ces biais sont codés automatiquement. Les réponses textuelles sont marquées « À relire » pour une lecture enseignant.",
            },
        ],
    },

    // ── Liste des sessions ──────────────────────────────────────────────────
    sessions: {
        titre: "Sessions diagnostiques",
        intro: "Gérez et suivez vos sessions.",
        sections: [
            {
                q: "Lancer une passation",
                r: "Cliquez sur « Lancer passation » pour basculer en mode élève. L'application bascule immédiatement — donnez le contrôle à vos élèves. Votre PIN sera demandé au retour.",
            },
            {
                q: "Clôturer une session",
                r: "Une session clôturée n'accepte plus de nouvelles passations. Elle reste analysable. La clôture est irréversible mais ne supprime aucune donnée.",
            },
            {
                q: "Analyser une session",
                r: "Le bouton « Analyser » est disponible sur toutes les sessions, en cours ou clôturées. Il ouvre le tableau de bord avec la matrice de résultats, la vue biais et les items à relire.",
            },
            {
                q: "Un élève a quitté en cours de passation",
                r: "Sa passation reste « en cours ». Il peut reprendre depuis le sélecteur de prénom — l'application reprend à l'exercice suivant celui déjà soumis. Vous pouvez aussi la laisser en l'état et analyser les réponses partielles.",
            },
        ],
    },

    // ── Analyse ─────────────────────────────────────────────────────────────
    analyse: {
        titre: "Analyse des résultats",
        intro: "Trois vues complémentaires pour interpréter les passations.",
        sections: [
            {
                q: "Matrice — lire les états",
                r: "✓ Réussi (vert) : aucun biais détecté. ! Biais (rouge) : un ou plusieurs biais détectés automatiquement. ? À relire (orange) : réponse ouverte à lire manuellement. — Non fait : élève absent ou passation incomplète.",
            },
            {
                q: "Matrice — voir le détail d'une cellule",
                r: "Cliquez sur une cellule pour afficher la réponse exacte de l'élève, les biais détectés avec leur description source, et la durée passée sur l'exercice.",
            },
            {
                q: "Matrice — taux de réussite",
                r: "La ligne du bas affiche le taux de réussite par exercice. En rouge < 40 %, en orange < 70 %, en vert ≥ 70 %.",
            },
            {
                q: "Vue Biais — alerte 30 %",
                r: "Quand un biais touche 30 % ou plus des élèves ayant passé l'exercice, un bandeau rouge apparaît avec la recommandation pédagogique issue des documents sources.",
            },
            {
                q: "Onglet À relire",
                r: "Regroupe toutes les réponses ouvertes (justifications, textes libres). Pour chaque item, vous pouvez attribuer manuellement un ou plusieurs codes biais — ils seront pris en compte dans la vue Biais.",
            },
            {
                q: "Profil élève",
                r: "Cliquez sur le prénom d'un élève dans la matrice pour accéder à son profil individuel : résultat par exercice, durée, biais, et une zone de notes libres pour consigner vos observations orales.",
            },
        ],
    },

    // ── Export / Import ─────────────────────────────────────────────────────
    "export-import": {
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
                r: "En début d'année scolaire, après avoir exporté une sauvegarde JSON. Supprime toutes les classes, sessions, passations et le code PIN. L'application revient à l'état du premier lancement.",
            },
        ],
    },

    // ── Mode élève ──────────────────────────────────────────────────────────
    eleve: {
        titre: "Mode élève",
        intro: "L'application est maintenant en mode élève.",
        sections: [
            {
                q: "Que doit faire l'élève ?",
                r: "L'élève choisit son prénom dans la liste, puis répond aux exercices un par un. Il ne peut pas revenir en arrière. Aucune correction ne lui est affichée.",
            },
            {
                q: "Comment revenir en mode enseignant ?",
                r: "Une fois la passation terminée, l'élève clique sur « Appelle ton enseignant(e) ». Votre code PIN sera demandé pour déverrouiller le mode enseignant.",
            },
            {
                q: "L'élève a fermé la fenêtre par erreur",
                r: "Ses réponses déjà soumises sont enregistrées. Il peut reprendre depuis le sélecteur de prénom — la passation continue à l'exercice suivant.",
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
