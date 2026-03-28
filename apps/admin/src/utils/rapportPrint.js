/**
 * @fileoverview rapportPrint — génération du rapport imprimable (Module 6).
 *
 * Produit une fiche de classe A4 contenant :
 *   1. Récapitulatif du diagnostic (en-tête)
 *   2. Tableau élèves × exercices avec scores
 *   3. Distribution des biais triée par fréquence
 *   4. Groupes de besoin suggérés (biais en alerte)
 *   5. Avertissement si items A_VALIDER en attente
 *
 * L'approche window.open() + HTML statique est choisie délibérément :
 * elle est plus fiable que les media queries @print dans une SPA
 * et ne nécessite pas de bibliothèque PDF tierce.
 *
 * @module utils/rapportPrint
 */

import {
    scoreReponse,
    scoreEleve,
    SCORE,
    construireDistribBiais,
    depasseSeuil,
    collecterItemsARelire,
} from "@/utils/analyseSession";
import { getBiais } from "@fractions-diagnostic/data/biais";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Échappe les caractères HTML spéciaux.
 * @param {any} s
 * @returns {string}
 */
function esc(s) {
    return String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/**
 * Formate une date ISO en date lisible fr-FR.
 * @param {string} iso
 * @returns {string}
 */
function fmtDate(iso) {
    return new Date(iso).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

// ─── Labels visuels par état ──────────────────────────────────────────────────

const CELL_STYLE = {
    [SCORE.REUSSI]: "background:#dcfce7;color:#15803d;font-weight:700",
    [SCORE.BIAIS]: "background:#fee2e2;color:#b91c1c;font-weight:700",
    [SCORE.ECHEC]: "background:#ffedd5;color:#c2410c;font-weight:700",
    [SCORE.A_VALIDER]: "background:#fef9c3;color:#92400e;font-weight:700",
    [SCORE.NON_FAIT]: "background:#f8fafc;color:#94a3b8;font-weight:400",
};

const CELL_LABEL = {
    [SCORE.REUSSI]: "✓",
    [SCORE.BIAIS]: "!",
    [SCORE.ECHEC]: "✗",
    [SCORE.A_VALIDER]: "◎",
    [SCORE.NON_FAIT]: "—",
};

// ─── Génération HTML ──────────────────────────────────────────────────────────

/**
 * Génère le HTML complet du rapport imprimable.
 *
 * @param {object}   diagnostic
 * @param {object}   classe
 * @param {object[]} eleves
 * @param {object[]} passations
 * @returns {string} Document HTML complet.
 */
function genererHTML(diagnostic, classe, eleves, passations) {
    const numeros = diagnostic.exercices_selectionnes;
    const passTerminees = passations.filter(
        (p) => p.diagnostic_id === diagnostic.id && p.statut === "terminee"
    );

    // ── Données ─────────────────────────────────────────────────────────────
    const distribBiais = construireDistribBiais(diagnostic, passations);
    const nbAValider = collecterItemsARelire(diagnostic, passations).length;

    // Élèves triés alphabétiquement par prénom
    const elevesTriés = [...eleves].sort((a, b) =>
        (a.prenom ?? "").localeCompare(b.prenom ?? "", "fr")
    );

    // Biais triés : alertes en tête, puis fréquence décroissante
    const entreesBiais = [...distribBiais.entries()]
        .map(([code, { eleveIds, exerciceNumeros }]) => ({
            code,
            eleveIds,
            exerciceNumeros,
            alerte: exerciceNumeros.some((n) =>
                depasseSeuil(code, n, diagnostic, passations)
            ),
        }))
        .sort((a, b) => {
            if (a.alerte !== b.alerte) return a.alerte ? -1 : 1;
            return b.eleveIds.length - a.eleveIds.length;
        });

    const alertes = entreesBiais.filter((e) => e.alerte);
    const nbPassations = passTerminees.length;

    // ── En-tête document ─────────────────────────────────────────────────────
    const titreDiag = [
        esc(classe?.nom ?? "—"),
        "·",
        esc(diagnostic.niveau),
        diagnostic.libelle ? `· ${esc(diagnostic.libelle)}` : "",
    ]
        .filter(Boolean)
        .join(" ");

    // ── Tableau élèves × exercices ───────────────────────────────────────────
    const lignesEleves = elevesTriés
        .map((eleve) => {
            const passation = passTerminees.find(
                (p) => p.eleve_id === eleve.id
            );
            const scores = scoreEleve(passation ?? null);

            const cellules = numeros
                .map((n) => {
                    const rep = passation?.reponses.find(
                        (r) => r.exercice_numero === n
                    );
                    const etat = rep ? scoreReponse(rep) : SCORE.NON_FAIT;
                    return `<td style="text-align:center;${CELL_STYLE[etat]}">${CELL_LABEL[etat]}</td>`;
                })
                .join("");

            const tauxTxt = scores
                ? scores.tauxReussite !== null
                    ? `${scores.aValiderPending ? "~" : ""}${Math.round(scores.tauxReussite * 100)} %`
                    : "—"
                : "—";
            const tauxColor =
                scores?.tauxReussite == null
                    ? "#94a3b8"
                    : scores.tauxReussite >= 0.7
                      ? "#15803d"
                      : scores.tauxReussite >= 0.4
                        ? "#b45309"
                        : "#b91c1c";

            return `
            <tr>
                <td style="padding:4px 8px;white-space:nowrap">
                    ${esc(eleve.prenom)}${eleve.nom ? ` <span style="color:#94a3b8">${esc(eleve.nom[0])}.</span>` : ""}
                </td>
                ${cellules}
                <td style="text-align:center;font-weight:700;color:${tauxColor}">
                    ${tauxTxt}
                </td>
            </tr>`;
        })
        .join("");

    // ── Ligne taux par exercice ──────────────────────────────────────────────
    const lignesTaux = numeros
        .map((n) => {
            const reps = passTerminees
                .map((p) => p.reponses.find((r) => r.exercice_numero === n))
                .filter(Boolean);
            const evalues = reps.filter(
                (r) =>
                    scoreReponse(r) !== SCORE.NON_FAIT &&
                    scoreReponse(r) !== SCORE.A_VALIDER
            ).length;
            const reussies = reps.filter(
                (r) => scoreReponse(r) === SCORE.REUSSI
            ).length;
            const taux =
                evalues > 0 ? Math.round((reussies / evalues) * 100) : null;
            const color =
                taux == null
                    ? "#94a3b8"
                    : taux >= 70
                      ? "#15803d"
                      : taux >= 40
                        ? "#b45309"
                        : "#b91c1c";
            return `<td style="text-align:center;font-weight:700;color:${color};background:#f1f5f9">
                    ${taux !== null ? `${taux} %` : "—"}
                </td>`;
        })
        .join("");

    // ── Section biais ────────────────────────────────────────────────────────
    const sectionBiais =
        entreesBiais.length === 0
            ? `<p style="color:#94a3b8;font-style:italic">Aucun biais détecté.</p>`
            : entreesBiais
                  .map(({ code, eleveIds, alerte }) => {
                      const def = getBiais(code);
                      const pct =
                          nbPassations > 0
                              ? Math.round(
                                    (eleveIds.length / nbPassations) * 100
                                )
                              : 0;
                      const prenoms = eleveIds
                          .map(
                              (id) =>
                                  elevesTriés.find((e) => e.id === id)
                                      ?.prenom ?? id
                          )
                          .join(", ");
                      const bg = alerte ? "#fef2f2" : "#f8fafc";
                      const border = alerte ? "#fca5a5" : "#e2e8f0";
                      const badge = alerte
                          ? `<span style="background:#fee2e2;color:#b91c1c;border-radius:4px;
                               padding:1px 6px;font-size:10px;font-weight:700;
                               margin-left:6px">⚠ Alerte classe</span>`
                          : "";
                      return `
                <div style="border:1px solid ${border};background:${bg};
                            border-radius:6px;padding:8px 10px;margin-bottom:6px">
                    <div style="display:flex;align-items:flex-start;
                                justify-content:space-between;gap:8px;margin-bottom:4px">
                        <div>
                            <strong style="font-size:11px">${esc(def?.intitule ?? code)}</strong>
                            ${badge}
                            <p style="color:#64748b;font-size:10px;margin:2px 0 0">
                                ${esc(def?.description ?? "")}
                            </p>
                        </div>
                        <span style="font-size:12px;font-weight:700;
                                     color:${alerte ? "#b91c1c" : "#475569"};
                                     white-space:nowrap">
                            ${pct} %
                        </span>
                    </div>
                    <p style="font-size:10px;color:#475569;margin:0">
                        Exercice${[].concat([]).length > 1 ? "s" : ""} —
                        Élèves : <em>${esc(prenoms)}</em>
                    </p>
                </div>`;
                  })
                  .join("");

    // ── Section groupes de besoin ────────────────────────────────────────────
    const sectionGroupes =
        alertes.length === 0
            ? `<p style="color:#94a3b8;font-style:italic">
               Aucun biais ne dépasse le seuil de 30 % sur cette classe.
           </p>`
            : alertes
                  .map(({ code, eleveIds }) => {
                      const def = getBiais(code);
                      const prenoms = eleveIds
                          .map(
                              (id) =>
                                  elevesTriés.find((e) => e.id === id)
                                      ?.prenom ?? id
                          )
                          .sort((a, b) => a.localeCompare(b, "fr"))
                          .join(", ");
                      return `
                <div style="border-left:3px solid #fca5a5;padding:4px 10px;
                            margin-bottom:6px;background:#fef2f2;border-radius:0 4px 4px 0">
                    <strong style="font-size:11px;color:#b91c1c">
                        ${esc(def?.intitule ?? code)}
                    </strong>
                    <p style="font-size:10px;color:#475569;margin:2px 0 0">
                        ${esc(prenoms)}
                    </p>
                </div>`;
                  })
                  .join("");

    // ── Avertissement A_VALIDER ──────────────────────────────────────────────
    const avertissement =
        nbAValider > 0
            ? `<div style="border:1px solid #fde68a;background:#fffbeb;border-radius:6px;
                        padding:8px 12px;margin-top:16px;font-size:10px;color:#92400e">
               ◎ <strong>${nbAValider} item${nbAValider > 1 ? "s" : ""} en attente
               de validation</strong> — les taux affichés sont provisoires.
           </div>`
            : "";

    // ── Colonnes en-tête tableau ──────────────────────────────────────────────
    const thExercices = numeros
        .map(
            (
                n
            ) => `<th style="text-align:center;padding:4px 6px;background:#f1f5f9;
                            font-size:10px;font-weight:600;color:#64748b">
                    Ex.${n}
                </th>`
        )
        .join("");

    // ── Assemblage final ─────────────────────────────────────────────────────
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Diagnostic Fractions — ${titreDiag}</title>
    <style>
        @page { size: A4 portrait; margin: 12mm 14mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 11px;
            color: #1e293b;
            line-height: 1.4;
        }
        h2 {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #475569;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
            margin: 14px 0 8px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
        }
        th, td {
            border: 1px solid #e2e8f0;
            padding: 3px 6px;
        }
        tr:nth-child(even) td { background: #f8fafc; }
        .no-print { display: none; }
        @media screen {
            body { max-width: 210mm; margin: 0 auto; padding: 16px; }
            .no-print { display: block; }
        }
    </style>
</head>
<body>
    <!-- Bouton impression (masqué en impression) -->
    <div class="no-print" style="display:flex;gap:8px;margin-bottom:16px">
        <button onclick="window.print()"
                style="padding:8px 16px;background:#3b82f6;color:#fff;
                       border:none;border-radius:6px;font-size:13px;
                       font-weight:600;cursor:pointer">
            🖨 Imprimer
        </button>
        <button onclick="window.close()"
                style="padding:8px 16px;background:#f1f5f9;color:#475569;
                       border:1px solid #e2e8f0;border-radius:6px;
                       font-size:13px;cursor:pointer">
            Fermer
        </button>
    </div>

    <!-- En-tête -->
    <div style="display:flex;justify-content:space-between;
                align-items:flex-start;margin-bottom:12px">
        <div>
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;
                        letter-spacing:0.08em;color:#94a3b8;margin-bottom:2px">
                Fractions Diagnostic
            </div>
            <div style="font-size:16px;font-weight:700;color:#1e293b">
                ${titreDiag}
            </div>
            <div style="font-size:10px;color:#64748b;margin-top:3px">
                ${nbPassations} passation${nbPassations !== 1 ? "s" : ""} terminée${nbPassations !== 1 ? "s" : ""}
                sur ${eleves.length} élève${eleves.length !== 1 ? "s" : ""}
                · Créé le ${fmtDate(diagnostic.date_creation)}
            </div>
        </div>
        <div style="font-size:9px;color:#94a3b8;text-align:right">
            Imprimé le ${fmtDate(new Date().toISOString())}
        </div>
    </div>

    <!-- Section 1 : Tableau élèves × exercices -->
    <h2>Résultats par élève</h2>
    <table>
        <thead>
            <tr>
                <th style="text-align:left;padding:4px 8px;background:#f1f5f9;
                            font-size:10px;font-weight:600;color:#64748b;
                            min-width:100px">
                    Élève
                </th>
                ${thExercices}
                <th style="text-align:center;padding:4px 6px;background:#f1f5f9;
                            font-size:10px;font-weight:600;color:#64748b;
                            min-width:50px">
                    Score
                </th>
            </tr>
        </thead>
        <tbody>
            ${lignesEleves}
            <!-- Ligne taux classe -->
            <tr style="background:#f1f5f9;border-top:2px solid #cbd5e1">
                <td style="font-size:10px;font-weight:600;color:#64748b;
                            text-transform:uppercase;letter-spacing:0.04em;
                            padding:4px 8px">
                    Taux classe
                </td>
                ${lignesTaux}
                <td></td>
            </tr>
        </tbody>
    </table>

    <!-- Légende -->
    <div style="display:flex;gap:12px;margin-top:4px;flex-wrap:wrap">
        ${Object.entries(CELL_LABEL)
            .map(
                ([etat, label]) => `
            <span style="display:inline-flex;align-items:center;gap:4px;
                         font-size:9px;color:#64748b">
                <span style="display:inline-flex;align-items:center;
                             justify-content:center;width:16px;height:16px;
                             border-radius:3px;${CELL_STYLE[etat]}">
                    ${label}
                </span>
                ${
                    {
                        [SCORE.REUSSI]: "Réussi",
                        [SCORE.BIAIS]: "Biais détecté",
                        [SCORE.ECHEC]: "Échec",
                        [SCORE.A_VALIDER]: "À valider",
                        [SCORE.NON_FAIT]: "Non fait",
                    }[etat]
                }
            </span>`
            )
            .join("")}
    </div>

    <!-- Section 2 : Biais détectés -->
    <h2>Biais détectés</h2>
    ${sectionBiais}

    <!-- Section 3 : Groupes de besoin -->
    <h2>Groupes de besoin suggérés</h2>
    <p style="font-size:10px;color:#64748b;margin-bottom:6px">
        Biais dépassant le seuil de 30 % de la classe.
    </p>
    ${sectionGroupes}

    ${avertissement}

    <!-- Pied de page -->
    <div style="margin-top:20px;padding-top:6px;border-top:1px solid #e2e8f0;
                font-size:9px;color:#94a3b8;text-align:center">
        Fractions Diagnostic · Données stockées localement ·
        ${fmtDate(new Date().toISOString())}
    </div>
</body>
</html>`;
}

// ─── Export principal ─────────────────────────────────────────────────────────

/**
 * Génère le rapport imprimable et l'ouvre dans un nouvel onglet.
 *
 * L'impression est déclenchée automatiquement après chargement.
 * Un bouton "Imprimer" est également disponible dans la page ouverte.
 *
 * @param {object}   diagnostic
 * @param {object}   classe
 * @param {object[]} eleves
 * @param {object[]} passations
 */
export function exporterRapportPrint(diagnostic, classe, eleves, passations) {
    const html = genererHTML(diagnostic, classe, eleves, passations);
    const fenetre = window.open("", "_blank");
    if (!fenetre) {
        alert(
            "L'ouverture du rapport a été bloquée par le navigateur.\n" +
                "Autorisez les popups pour ce site."
        );
        return;
    }
    fenetre.document.write(html);
    fenetre.document.close();
    fenetre.focus();
}
