/**
 * @fileoverview RapportFusion — affiche le résultat d'un import de résultats.
 *
 * Affiché après chaque import de fichier fractions-resultats.json (SRS F-RES-04).
 *
 * @module components/common/RapportFusion
 */
import PropTypes from "prop-types";

/**
 * @param {object}   props
 * @param {object}   props.rapport         - Résultat de fusionnerPassations().
 * @param {object[]} props.eleves          - Élèves du diagnostic (pour afficher les prénoms).
 * @param {function} props.onFermer
 */
function RapportFusion({ rapport, eleves, onFermer }) {
    const { ajoutees, remplacees, ignorees, elevesAjoutes, elevesRemplaces } = rapport;

    function prenomEleve(eleveId) {
        return eleves.find((e) => e.id === eleveId)?.prenom ?? eleveId.slice(0, 8);
    }

    const total = ajoutees + remplacees + ignorees;

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-full bg-green-100 flex items-center
                               justify-center text-xl shrink-0"
                    aria-hidden="true"
                >
                    ✓
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800">Import réussi</h3>
                    <p className="text-sm text-slate-500">
                        {total} passation{total > 1 ? "s" : ""} traitée{total > 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
                <Stat
                    valeur={ajoutees}
                    label="ajoutée{s}"
                    couleur="success"
                />
                <Stat
                    valeur={remplacees}
                    label="remplacée{s}"
                    couleur="warning"
                />
                <Stat
                    valeur={ignorees}
                    label="ignorée{s}"
                    couleur="neutral"
                />
            </div>

            {elevesAjoutes.length > 0 && (
                <div className="mb-3">
                    <p className="text-xs font-semibold text-slate-500 mb-1">
                        Élèves ajoutés
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {elevesAjoutes.map((id) => (
                            <span
                                key={id}
                                className="text-xs px-2 py-0.5 rounded-full
                                           bg-green-100 text-green-700 font-medium"
                            >
                                {prenomEleve(id)}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {elevesRemplaces.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 mb-1">
                        Passations mises à jour
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {elevesRemplaces.map((id) => (
                            <span
                                key={id}
                                className="text-xs px-2 py-0.5 rounded-full
                                           bg-amber-100 text-amber-700 font-medium"
                            >
                                {prenomEleve(id)}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={onFermer}
                className="w-full py-2 rounded-lg border border-slate-200
                           hover:bg-slate-50 text-slate-600 text-sm font-medium
                           transition-colors cursor-pointer"
            >
                Fermer
            </button>
        </div>
    );
}

RapportFusion.propTypes = {
    rapport: PropTypes.shape({
        ajoutees:        PropTypes.number.isRequired,
        remplacees:      PropTypes.number.isRequired,
        ignorees:        PropTypes.number.isRequired,
        elevesAjoutes:   PropTypes.arrayOf(PropTypes.string).isRequired,
        elevesRemplaces: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
    eleves:   PropTypes.arrayOf(PropTypes.shape({
        id:     PropTypes.string.isRequired,
        prenom: PropTypes.string.isRequired,
    })).isRequired,
    onFermer: PropTypes.func.isRequired,
};

/* ── Sous-composant ─────────────────────────────────────────────── */

function Stat({ valeur, label, couleur }) {
    const styles = {
        success: "bg-green-50 border-green-200 text-green-700",
        warning: "bg-amber-50 border-amber-200 text-amber-700",
        neutral: "bg-slate-50 border-slate-200 text-slate-500",
    };

    return (
        <div className={`rounded-lg border p-3 text-center ${styles[couleur]}`}>
            <p className="text-2xl font-bold">{valeur}</p>
            <p className="text-xs mt-0.5">
                {label.replace("{s}", valeur > 1 ? "s" : "")}
            </p>
        </div>
    );
}

Stat.propTypes = {
    valeur:  PropTypes.number.isRequired,
    label:   PropTypes.string.isRequired,
    couleur: PropTypes.oneOf(["success", "warning", "neutral"]).isRequired,
};

export default RapportFusion;
