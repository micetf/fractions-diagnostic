import { useState } from "react";
import PropTypes from "prop-types";
import ColoringFigure from "@/components/exercices/ColoringFigure";
import {
    segmentsCE1Ex3BandeC,
    segmentsCE1Ex5,
    segmentsCE1Ex3RectA,
    segmentsCE1Ex3TriangleD,
} from "@/components/exercices/figures/segmentsCE1";
import {
    segmentsCM1Ex2a,
    segmentsCM1Ex2c,
    segmentsCM1Ex6,
} from "@/components/exercices/figures/segmentsCM1";

/**
 * SpikeS9
 *
 * Page de démonstration temporaire pour S9.
 * À supprimer après validation.
 *
 * @param {object}   props
 * @param {function} props.onNavigate
 */
function SpikeS9({ onNavigate }) {
    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-semibold text-slate-800">
                    S9 — ColoringFigure
                </h1>
                <button
                    onClick={() => onNavigate("accueil")}
                    className="text-sm text-slate-400 hover:text-brand-600
                     transition-colors cursor-pointer"
                >
                    ← Retour
                </button>
            </div>
            <p
                className="text-xs text-amber-700 bg-amber-50 border border-amber-200
                    rounded-lg px-3 py-2 mb-8"
            >
                Fichier temporaire — à supprimer après validation.
            </p>

            <div className="space-y-8">
                <CasDeTest
                    titre="CE1 Ex.3C — Bande de 6 cases (colorier 3 = 1/2)"
                    description="Biais documenté : colorier 1 case sur 6 → confusion fraction unitaire / non unitaire."
                    segments={segmentsCE1Ex3BandeC}
                    partiesAttendues={3}
                    viewBoxW={300}
                    viewBoxH={80}
                />

                <CasDeTest
                    titre="CE1 Ex.3A — Rectangle en 2 (colorier 1 = 1/2)"
                    description="Figure classique. Attendu : 1 part sur 2."
                    segments={segmentsCE1Ex3RectA}
                    partiesAttendues={1}
                    viewBoxW={300}
                    viewBoxH={80}
                />

                <CasDeTest
                    titre="CE1 Ex.3D — Triangle équilatéral (colorier 1 moitié = 1/2)"
                    description="Figure non standard. Biais : ne pas savoir traiter D → répertoire limité."
                    segments={segmentsCE1Ex3TriangleD}
                    partiesAttendues={1}
                    viewBoxW={80}
                    viewBoxH={80}
                />

                <CasDeTest
                    titre="CE1 Ex.5 — Bande de 5 parts (colorier 3 = 3/5)"
                    description="Biais INVERSION_NUM_DENOM si l'élève écrit ensuite 5/3. Biais ABSENCE_COMPLEMENT si NON à la vérification."
                    segments={segmentsCE1Ex5}
                    partiesAttendues={3}
                    viewBoxW={300}
                    viewBoxH={80}
                />

                <CasDeTest
                    titre="CM1 Ex.2a — 7/4 : bande de 8 cases (colorier 7)"
                    description="Deux unités de 4 parts. Colorier 7 parts sur 8 pour représenter 7/4."
                    segments={segmentsCM1Ex2a}
                    partiesAttendues={7}
                    viewBoxW={300}
                    viewBoxH={80}
                />

                <CasDeTest
                    titre="CM1 Ex.2c — 11/4 : bande de 12 cases (colorier 11)"
                    description="Trois unités de 4 parts. Colorier 11 parts sur 12 pour représenter 11/4."
                    segments={segmentsCM1Ex2c}
                    partiesAttendues={11}
                    viewBoxW={300}
                    viewBoxH={80}
                />

                <CasDeTest
                    titre="CM1 Ex.6 — Bande en quarts (support calcul)"
                    description="4 parts. Colorier 3 parts pour 3/4, puis 2 pour vérifier 1/2 = 2/4."
                    segments={segmentsCM1Ex6}
                    partiesAttendues={3}
                    viewBoxW={300}
                    viewBoxH={80}
                />
            </div>
        </div>
    );
}

SpikeS9.propTypes = {
    onNavigate: PropTypes.func.isRequired,
};

/* ── Cas de test ───────────────────────────────────────────────────────────── */

/**
 * CasDeTest
 *
 * @param {object} props
 * @param {string} props.titre
 * @param {string} props.description
 * @param {Array}  props.segments
 * @param {number} props.partiesAttendues
 * @param {number} props.viewBoxW
 * @param {number} props.viewBoxH
 */
function CasDeTest({
    titre,
    description,
    segments,
    partiesAttendues,
    viewBoxW,
    viewBoxH,
}) {
    const [valeur, setValeur] = useState(Array(segments.length).fill(false));

    const nbColoris = valeur.filter(Boolean).length;
    const correct = nbColoris === partiesAttendues;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-1">{titre}</h2>
            <p className="text-sm text-slate-500 mb-5">{description}</p>

            <ColoringFigure
                segments={segments}
                value={valeur}
                onChange={setValeur}
                viewBoxW={viewBoxW}
                viewBoxH={viewBoxH}
            />

            {/* Résultat */}
            <div
                className={`mt-4 px-3 py-2 rounded-lg text-sm font-medium
        ${
            nbColoris === 0
                ? "bg-slate-50 text-slate-400"
                : correct
                  ? "bg-success-100 text-success-700"
                  : "bg-review-100 text-review-700"
        }`}
            >
                {nbColoris === 0
                    ? "Aucune part coloriée."
                    : correct
                      ? `✓ ${nbColoris} part${nbColoris > 1 ? "s" : ""} — correct.`
                      : `${nbColoris} part${nbColoris > 1 ? "s" : ""} coloriée${nbColoris > 1 ? "s" : ""} (attendu : ${partiesAttendues}).`}
            </div>

            {/* Valeur brute */}
            <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs font-mono text-slate-400 break-all">
                    valeur_brute →{" "}
                    <span className="text-slate-600">
                        [{valeur.map((v) => String(v)).join(", ")}]
                    </span>
                </p>
            </div>

            <button
                onClick={() => setValeur(Array(segments.length).fill(false))}
                className="mt-2 text-xs text-slate-400 hover:text-slate-600
                   transition-colors cursor-pointer underline underline-offset-2"
            >
                Réinitialiser
            </button>
        </div>
    );
}

CasDeTest.propTypes = {
    titre: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    segments: PropTypes.array.isRequired,
    partiesAttendues: PropTypes.number.isRequired,
    viewBoxW: PropTypes.number.isRequired,
    viewBoxH: PropTypes.number.isRequired,
};

export default SpikeS9;
