import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";

/**
 * ChoixEleve
 *
 * Affiche la liste des élèves disponibles pour la session en cours.
 * Les élèves ayant déjà une passation terminée sont exclus (SRS F-PAS-02).
 *
 * @param {object}   props
 * @param {object}   props.session  - Session active.
 * @param {function} props.onChoix  - Appelé avec l'id de l'élève sélectionné.
 */
function ChoixEleve({ session, onChoix }) {
    const { state } = useAppContext();

    const classe =
        state.classes.find((c) => c.id === session.classe_id) ?? null;

    const elevesDisponibles = (classe?.eleves ?? []).filter((el) => {
        return !state.passations.some(
            (p) =>
                p.session_id === session.id &&
                p.eleve_id === el.id &&
                p.statut === "terminee"
        );
    });

    const elevesTriees = [...elevesDisponibles].sort((a, b) =>
        a.prenom.localeCompare(b.prenom, "fr")
    );

    return (
        <div
            className="min-h-[calc(100vh-88px)] flex flex-col items-center
                    justify-center px-4 py-10"
        >
            <div
                className="w-full max-w-sm bg-white rounded-2xl shadow-sm
                      border border-brand-100 p-8"
            >
                <h1
                    className="font-display font-bold text-2xl text-slate-800
                       text-center mb-2"
                >
                    Qui es-tu ?
                </h1>
                <p className="text-sm text-slate-400 text-center mb-6">
                    {session.niveau} — {elevesTriees.length} élève
                    {elevesTriees.length !== 1 ? "s" : ""} disponible
                    {elevesTriees.length !== 1 ? "s" : ""}
                </p>

                {elevesTriees.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-4">
                        Tous les élèves ont déjà passé cette session.
                    </p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {elevesTriees.map((el) => (
                            <li key={el.id}>
                                <button
                                    onClick={() => onChoix(el.id)}
                                    className="w-full py-3 px-5 rounded-xl border border-slate-200
                             hover:bg-brand-50 hover:border-brand-300
                             text-slate-800 text-base font-medium text-left
                             transition-colors cursor-pointer"
                                >
                                    {el.prenom}
                                    {el.nom ? (
                                        <span className="text-slate-400 font-normal">
                                            {" "}
                                            {el.nom}
                                        </span>
                                    ) : null}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

ChoixEleve.propTypes = {
    session: PropTypes.object.isRequired,
    onChoix: PropTypes.func.isRequired,
};

export default ChoixEleve;
