/**
 * @fileoverview Export et import des données de l'application.
 *
 * F-EXP-01 : export CSV de la matrice de résultats d'un diagnostic.
 * F-EXP-02 : export JSON de la sauvegarde complète.
 * F-EXP-03 : import (restauration) depuis un fichier JSON.
 *
 * v2.0 :
 *   - session_id → diagnostic_id dans exporterCSV
 *   - KEYS.sessions → KEYS.diagnostics
 *   - importerJSON : compatibilité ascendante v1.x (sessions → diagnostics)
 *   - pin_hash conservé dans la sauvegarde (géré au Sprint 2)
 *
 * @module utils/exportData
 */

import { KEYS, getItem, setItem } from "@/hooks/useStorage";
import { etatReponse, ETATS } from "@/utils/analyseSession";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Déclenche le téléchargement d'un Blob dans le navigateur.
 *
 * @param {Blob}   blob
 * @param {string} filename
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
 * @param {string} iso
 * @returns {string} ex. : "2026-03-23"
 */
function dateLabel(iso) {
    return new Date(iso).toISOString().slice(0, 10);
}

// ─── Export CSV (F-EXP-01) ────────────────────────────────────────────────────

/**
 * Génère et télécharge la matrice de résultats d'un diagnostic au format CSV.
 *
 * @param {import('@fractions-diagnostic/shared/types').Diagnostic} diagnostic
 * @param {import('@fractions-diagnostic/shared/types').Eleve[]}    eleves
 * @param {import('@fractions-diagnostic/shared/types').PassationEleve[]} passations
 */
export function exporterCSV(diagnostic, eleves, passations) {
    const numeros = diagnostic.exercices_selectionnes;
    const sep = ";";

    const entete = [
        "Nom",
        "Prénom",
        ...numeros.map((n) => `Ex.${n}`),
        "Biais détectés",
        "Durée totale (s)",
    ];

    const lignes = eleves.map((eleve) => {
        // v2.0 : diagnostic_id (remplace session_id)
        const passation = passations.find(
            (p) =>
                p.diagnostic_id === diagnostic.id &&
                p.eleve_id === eleve.id &&
                p.statut === "terminee"
        );

        const cellules = numeros.map((n) => {
            const rep = passation?.reponses.find(
                (r) => r.exercice_numero === n
            );
            const etat = etatReponse(rep);
            return {
                [ETATS.REUSSI]:   "Réussi",
                [ETATS.BIAIS]:    "Biais",
                [ETATS.RELIRE]:   "À relire",
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

    const contenu = [entete, ...lignes]
        .map((ligne) =>
            ligne
                .map((cell) => {
                    const s = String(cell ?? "");
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
    const libelle = diagnostic.libelle ? `_${diagnostic.libelle}` : "";
    const filename = `fractions-diagnostic_${diagnostic.niveau}${libelle}_${dateLabel(diagnostic.date_creation)}.csv`;
    telecharger(blob, filename);
}

// ─── Export JSON (F-EXP-02) ───────────────────────────────────────────────────

/**
 * Génère et télécharge la sauvegarde complète du localStorage au format JSON.
 *
 * Structure exportée (v2.0) :
 * {
 *   version:     "2.0",
 *   exportedAt:  ISO8601,
 *   config:      { pin_hash, pin_hint?, annee_scolaire },
 *   classes:     [...],
 *   diagnostics: [...],
 *   passations:  [...]
 * }
 */
export function exporterJSON() {
    const sauvegarde = {
        version:     "2.0",
        exportedAt:  new Date().toISOString(),
        config:      getItem(KEYS.config),
        classes:     getItem(KEYS.classes)     ?? [],
        diagnostics: getItem(KEYS.diagnostics) ?? [],
        passations:  getItem(KEYS.passations)  ?? [],
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
 * Compatible v1.x (sessions) et v2.0 (diagnostics).
 *
 * @param {any} data
 * @returns {{ ok: boolean, erreur?: string }}
 */
function validerSauvegarde(data) {
    if (!data || typeof data !== "object") {
        return { ok: false, erreur: "Le fichier n'est pas un objet JSON valide." };
    }
    if (!data.version) {
        return { ok: false, erreur: 'Champ "version" manquant — fichier non reconnu.' };
    }
    if (!Array.isArray(data.classes)) {
        return { ok: false, erreur: 'Champ "classes" manquant ou invalide.' };
    }
    if (!Array.isArray(data.passations)) {
        return { ok: false, erreur: 'Champ "passations" manquant ou invalide.' };
    }
    // Accepte "sessions" (v1.x) ou "diagnostics" (v2.0)
    const hasDiagnostics = Array.isArray(data.diagnostics);
    const hasSessions    = Array.isArray(data.sessions);
    if (!hasDiagnostics && !hasSessions) {
        return { ok: false, erreur: 'Champ "diagnostics" (ou "sessions") manquant.' };
    }
    return { ok: true };
}

/**
 * Importe une sauvegarde JSON et écrase le localStorage admin.
 *
 * Compatibilité ascendante v1.x → v2.0 :
 *   - `data.sessions` est migré vers KEYS.diagnostics si `data.diagnostics` absent.
 *   - Les passations v1.x ont `session_id` — conservé tel quel pour l'instant,
 *     la migration session_id → diagnostic_id sera traitée au Sprint 2.
 *
 * @param {File} fichier
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
                resolve({ ok: false, erreur: "Le fichier n'est pas du JSON valide." });
                return;
            }

            const validation = validerSauvegarde(data);
            if (!validation.ok) {
                resolve(validation);
                return;
            }

            // Migration v1 → v2 : sessions devient diagnostics
            const diagnostics = data.diagnostics ?? data.sessions ?? [];

            setItem(KEYS.config,      data.config      ?? null);
            setItem(KEYS.classes,     data.classes      ?? []);
            setItem(KEYS.diagnostics, diagnostics);
            setItem(KEYS.passations,  data.passations   ?? []);

            resolve({ ok: true });
        };

        reader.onerror = () => {
            resolve({ ok: false, erreur: "Impossible de lire le fichier." });
        };

        reader.readAsText(fichier, "utf-8");
    });
}

// ─── Remise à zéro ────────────────────────────────────────────────────────────

/**
 * Efface toutes les données admin du localStorage.
 * Le composant appelant doit recharger la page après cet appel.
 */
export function reinitialiser() {
    Object.values(KEYS).forEach((key) => {
        try { localStorage.removeItem(key); } catch { /* silencieux */ }
    });
}
