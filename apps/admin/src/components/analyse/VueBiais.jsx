import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";
import { getBiais } from "@fractions-diagnostic/data/biais";
import { getMetadonnees } from "@fractions-diagnostic/data";
import { construireDistribBiais, depasseSeuil } from "@/utils/analyseSession";

/**
 * VueBiais
 *
 * Pour chaque biais détecté, affiche le nombre d'élèves concernés
 * et une alerte si le seuil de 30 % est dépassé (SRS F-ANA-04, F-ANA-05).
 * Les descriptions sont verbatim depuis les sources (SRS F-ANA-06).
 *
 * @param {object}   props
 * @param {object}   props.session
 * @param {object[]} props.eleves
 */
function VueBiais({ session, eleves }) {
    const { state } = useAppContext();

    const distribBiais = construireDistribBiais(session, state.passations);

    const meta = getMetadonnees(session.niveau);

    if (distribBiais.size === 0) {
        return (
            <p className="text-sm text-slate-400 text-center py-8">
                Aucun biais détecté automatiquement sur cette session.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {[...distribBiais.entries()].map(
                ([code, { eleveIds, exerciceNumeros }]) => {
                    const def = getBiais(code);
                    const alerte = exerciceNumeros.some((n) =>
                        depasseSeuil(code, n, session, state.passations)
                    );

                    // Recommandation source : issue des conseilsAnalyse du niveau (SRS F-ANA-05)
                    const recommandation = alerte
                        ? (meta?.conseilsAnalyse?.find(
                              (c) =>
                                  c
                                      .toLowerCase()
                                      .includes(code.toLowerCase()) ||
                                  exerciceNumeros.some((n) =>
                                      c.includes(`${n}`)
                                  )
                          ) ?? null)
                        : null;

                    const prenoms = eleveIds.map((id) => {
                        const el = eleves.find((e) => e.id === id);
                        return el ? el.prenom : id;
                    });

                    return (
                        <div
                            key={code}
                            className={`rounded-xl border p-4
                 ${
                     alerte
                         ? "border-danger-200 bg-danger-50"
                         : "border-slate-200 bg-white"
                 }`}
                        >
                            {/* En-tête biais */}
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <div>
                                    <p
                                        className={`font-semibold text-sm
                  ${alerte ? "text-danger-700" : "text-slate-800"}`}
                                    >
                                        {def?.intitule ?? code}
                                    </p>
                                    {/* Description verbatim source (SRS F-ANA-06) */}
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {def?.description}
                                    </p>
                                </div>
                                <span
                                    className={`shrink-0 text-xs font-semibold px-2.5 py-1
                                rounded-full whitespace-nowrap
                ${
                    alerte
                        ? "bg-danger-100 text-danger-700"
                        : "bg-slate-100 text-slate-600"
                }`}
                                >
                                    {eleveIds.length} élève
                                    {eleveIds.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            {/* Exercices concernés */}
                            <p className="text-xs text-slate-500 mb-2">
                                Exercice{exerciceNumeros.length > 1 ? "s" : ""}{" "}
                                {exerciceNumeros
                                    .sort((a, b) => a - b)
                                    .map((n) => `Ex.${n}`)
                                    .join(", ")}
                            </p>

                            {/* Liste des prénoms */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {prenoms.map((p) => (
                                    <span
                                        key={p}
                                        className={`text-xs px-2 py-0.5 rounded-full
                  ${
                      alerte
                          ? "bg-danger-100 text-danger-600"
                          : "bg-slate-100 text-slate-600"
                  }`}
                                    >
                                        {p}
                                    </span>
                                ))}
                            </div>

                            {/* Recommandation source si seuil dépassé (SRS F-ANA-05) */}
                            {alerte && recommandation && (
                                <div className="mt-2 pt-2 border-t border-danger-200">
                                    <p className="text-xs font-semibold text-danger-700 mb-0.5">
                                        Conseil de passation (source)
                                    </p>
                                    <p className="text-xs text-danger-600 italic">
                                        {recommandation}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                }
            )}
        </div>
    );
}

VueBiais.propTypes = {
    session: PropTypes.object.isRequired,
    eleves: PropTypes.array.isRequired,
};

export default VueBiais;
