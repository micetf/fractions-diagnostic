/**
 * @fileoverview ChoixEleve — grille de sélection du prénom.
 *
 * Affiche les élèves du diagnostic actif sous forme de tuiles.
 * Les élèves ayant déjà une passation terminée sont grisés avec une coche.
 * Les élèves restants apparaissent en premier.
 *
 * Cibles tactiles ≥ 44px (SRS NF-UX-04).
 *
 * @module pages/ChoixEleve
 */
import PropTypes from "prop-types";
import { usePasserContext } from "@/context/PasserContext";

/**
 * @param {object}   props
 * @param {function} props.onChoisir - Appelé avec l'id de l'élève choisi.
 */
function ChoixEleve({ onChoisir, onExporter }) {
    const { state } = usePasserContext();
    const { diagnostic, passations } = state;

    if (!diagnostic) return null;

    // Élèves ayant une passation terminée sur cet appareil
    const idsTermines = new Set(
        passations
            .filter(
                (p) =>
                    p.diagnostic_id === diagnostic.diagnostic_id &&
                    p.statut === "terminee"
            )
            .map((p) => p.eleve_id)
    );

    // Tri : élèves restants en premier, terminés en fin
    const elevesTriés = [...diagnostic.eleves].sort((a, b) => {
        const aTermine = idsTermines.has(a.id);
        const bTermine = idsTermines.has(b.id);
        if (aTermine === bTermine) return 0;
        return aTermine ? 1 : -1;
    });

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8">
            <div className="max-w-2xl mx-auto">
                {/* En-tête */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">
                        À qui le tour ?
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        {diagnostic.niveau} —{" "}
                        {diagnostic.exercices_selectionnes.length} exercice
                        {diagnostic.exercices_selectionnes.length > 1
                            ? "s"
                            : ""}
                    </p>
                </div>

                {/* Grille des prénoms */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {elevesTriés.map((eleve) => {
                        const termine = idsTermines.has(eleve.id);
                        return (
                            <button
                                key={eleve.id}
                                type="button"
                                disabled={termine}
                                onClick={() => !termine && onChoisir(eleve.id)}
                                className={[
                                    "relative rounded-2xl p-4 min-h-18 flex items-center",
                                    "justify-center text-center font-semibold text-lg",
                                    "transition-all touch-manipulation border-2",
                                    termine
                                        ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                                        : "bg-white border-brand-200 text-slate-800 " +
                                          "hover:border-brand-400 hover:bg-brand-50 " +
                                          "active:scale-95 cursor-pointer shadow-sm",
                                ].join(" ")}
                                aria-label={
                                    termine
                                        ? `${eleve.prenom} — déjà passé`
                                        : `Choisir ${eleve.prenom}`
                                }
                            >
                                {eleve.prenom}
                                {termine && (
                                    <span
                                        className="absolute top-2 right-2 w-5 h-5 rounded-full
                                                   bg-green-500 flex items-center justify-center
                                                   text-white text-xs font-bold"
                                        aria-hidden="true"
                                    >
                                        ✓
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Compteur */}
                <p className="text-center text-xs text-slate-400 mt-6">
                    {idsTermines.size} / {diagnostic.eleves.length} élève
                    {diagnostic.eleves.length > 1 ? "s" : ""} terminé
                    {idsTermines.size > 1 ? "s" : ""}
                </p>

                {/* Lien discret enseignant — SRS F-PAS-18 */}
                <div className="text-center pb-6">
                    <button
                        type="button"
                        onClick={onExporter}
                        className="text-xs text-slate-400 hover:text-slate-600
                               transition-colors py-2"
                    >
                        Exporter les résultats →
                    </button>
                </div>
            </div>
        </div>
    );
}

ChoixEleve.propTypes = {
    onChoisir: PropTypes.func.isRequired,
};

export default ChoixEleve;
