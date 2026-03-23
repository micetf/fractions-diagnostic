/**
 * @fileoverview Export et import des données de l'application.
 *
 * F-EXP-01 : export CSV de la matrice de résultats d'une session.
 * F-EXP-02 : export JSON de la sauvegarde complète.
 * F-EXP-03 : import (restauration) depuis un fichier JSON.
 *
 * Toutes les fonctions déclenchent un téléchargement navigateur via
 * Blob + URL.createObjectURL — aucune donnée ne transite par un serveur
 * (SRS NF-SEC-03).
 */

import { KEYS, getItem, setItem } from "@/hooks/useStorage";
import { etatReponse, ETATS } from "@/utils/analyseSession";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Déclenche le téléchargement d'un Blob dans le navigateur.
 *
 * @param {Blob}   blob     - Contenu du fichier.
 * @param {string} filename - Nom suggéré pour l'enregistrement.
 */
function telecharger(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Formate une date ISO en chaîne lisible pour les noms de fichiers.
 * @param {string} iso
 * @returns {string} ex. : "2026-03-23"
 */
function dateLabel(iso) {
    return new Date(iso).toISOString().slice(0, 10);
}

// ─── Export CSV (F-EXP-01) ────────────────────────────────────────────────────

/**
 * Génère et télécharge la matrice de résultats d'une session au format CSV.
 *
 * Colonnes : Élève, Prénom, Ex.1, Ex.2, …, Ex.N, Biais détectés, Durée totale (s)
 * Valeurs des cellules : Réussi | Biais | À relire | Non fait
 *
 * @param {object}   session    - Session à exporter.
 * @param {object[]} eleves     - Élèves de la classe.
 * @param {object[]} passations - Toutes les passations.
 */
export function exporterCSV(session, eleves, passations) {
    const numeros = session.exercices_selectionnes;
    const sep = ";";

    // En-tête
    const entete = [
        "Nom",
        "Prénom",
        ...numeros.map((n) => `Ex.${n}`),
        "Biais détectés",
        "Durée totale (s)",
    ];

    // Lignes élèves
    const lignes = eleves.map((eleve) => {
        const passation = passations.find(
            (p) =>
                p.session_id === session.id &&
                p.eleve_id === eleve.id &&
                p.statut === "terminee"
        );

        const cellules = numeros.map((n) => {
            const rep = passation?.reponses.find(
                (r) => r.exercice_numero === n
            );
            const etat = etatReponse(rep);
            return {
                [ETATS.REUSSI]: "Réussi",
                [ETATS.BIAIS]: "Biais",
                [ETATS.RELIRE]: "À relire",
                [ETATS.NON_FAIT]: "Non fait",
            }[etat];
        });

        const tousLesBiais =
            passation?.reponses.flatMap((r) => [
                ...(r.biais_auto ?? []),
                ...(r.biais_manuel ?? []),
            ]) ?? [];
        const biaisUniques = [...new Set(tousLesBiais)].join(", ");

        const dureeTotaleS = passation
            ? Math.round(
                  passation.reponses.reduce(
                      (acc, r) => acc + (r.duree_ms ?? 0),
                      0
                  ) / 1000
              )
            : "";

        return [
            eleve.nom ?? "",
            eleve.prenom ?? "",
            ...cellules,
            biaisUniques,
            dureeTotaleS,
        ];
    });

    // Assemblage CSV
    const contenu = [entete, ...lignes]
        .map((ligne) =>
            ligne
                .map((cell) => {
                    const s = String(cell ?? "");
                    // Encapsuler si contient le séparateur, des guillemets ou des sauts de ligne
                    return s.includes(sep) ||
                        s.includes('"') ||
                        s.includes("\n")
                        ? `"${s.replace(/"/g, '""')}"`
                        : s;
                })
                .join(sep)
        )
        .join("\r\n");

    const blob = new Blob(["\uFEFF" + contenu], {
        type: "text/csv;charset=utf-8;",
    });
    const dateStr = dateLabel(session.date_creation);
    const filename = `fractions-diagnostic_${session.niveau}_${dateStr}.csv`;
    telecharger(blob, filename);
}

// ─── Export JSON (F-EXP-02) ───────────────────────────────────────────────────

/**
 * Génère et télécharge la sauvegarde complète du localStorage au format JSON.
 *
 * Structure exportée :
 * {
 *   version:    '1.0',
 *   exportedAt: ISO8601,
 *   config:     {...},
 *   classes:    [...],
 *   sessions:   [...],
 *   passations: [...],
 * }
 *
 * Le champ `version` permettra de gérer les migrations futures.
 * La clé `config` inclut le `pin_hash` — le PIN n'est jamais en clair.
 */
export function exporterJSON() {
    const sauvegarde = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        config: getItem(KEYS.config),
        classes: getItem(KEYS.classes) ?? [],
        sessions: getItem(KEYS.sessions) ?? [],
        passations: getItem(KEYS.passations) ?? [],
    };

    const blob = new Blob([JSON.stringify(sauvegarde, null, 2)], {
        type: "application/json",
    });
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `fractions-diagnostic_sauvegarde_${dateStr}.json`;
    telecharger(blob, filename);
}

// ─── Import JSON (F-EXP-03) ───────────────────────────────────────────────────

/**
 * Valide la structure minimale d'une sauvegarde JSON.
 *
 * @param {any} data - Données parsées.
 * @returns {{ ok: boolean, erreur?: string }}
 */
function validerSauvegarde(data) {
    if (!data || typeof data !== "object") {
        return {
            ok: false,
            erreur: "Le fichier n'est pas un objet JSON valide.",
        };
    }
    if (!data.version) {
        return {
            ok: false,
            erreur: 'Champ "version" manquant — fichier non reconnu.',
        };
    }
    if (!Array.isArray(data.classes)) {
        return { ok: false, erreur: 'Champ "classes" manquant ou invalide.' };
    }
    if (!Array.isArray(data.sessions)) {
        return { ok: false, erreur: 'Champ "sessions" manquant ou invalide.' };
    }
    if (!Array.isArray(data.passations)) {
        return {
            ok: false,
            erreur: 'Champ "passations" manquant ou invalide.',
        };
    }
    return { ok: true };
}

/**
 * Importe une sauvegarde JSON et écrase le localStorage.
 *
 * Appelé après confirmation explicite de l'utilisateur
 * (la confirmation est gérée dans le composant appelant).
 *
 * @param {File} fichier - Fichier sélectionné par l'utilisateur.
 * @returns {Promise<{ ok: boolean, erreur?: string }>}
 */
export async function importerJSON(fichier) {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            let data;
            try {
                data = JSON.parse(e.target.result);
            } catch {
                resolve({
                    ok: false,
                    erreur: "Le fichier n'est pas du JSON valide.",
                });
                return;
            }

            const validation = validerSauvegarde(data);
            if (!validation.ok) {
                resolve(validation);
                return;
            }

            // Écriture atomique dans le localStorage
            setItem(KEYS.config, data.config ?? null);
            setItem(KEYS.classes, data.classes ?? []);
            setItem(KEYS.sessions, data.sessions ?? []);
            setItem(KEYS.passations, data.passations ?? []);

            resolve({ ok: true });
        };

        reader.onerror = () => {
            resolve({ ok: false, erreur: "Impossible de lire le fichier." });
        };

        reader.readAsText(fichier, "utf-8");
    });
}

/**
 * Efface toutes les données de l'application dans le localStorage.
 * À appeler après confirmation explicite de l'utilisateur.
 * Le composant appelant doit recharger la page après cet appel.
 */
export function reinitialiser() {
    Object.values(KEYS).forEach((key) => {
        try {
            localStorage.removeItem(key);
        } catch {
            /* silencieux */
        }
    });
}
