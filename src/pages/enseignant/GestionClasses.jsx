import { useState } from "react";
import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";

const NIVEAUX = ["CE1", "CE2", "CM1", "CM2"];

/**
 * GestionClasses
 *
 * Gestion complète des classes et de leurs élèves (SRS F-CLS-01 à F-CLS-04).
 *
 * Navigation interne :
 *   - vue 'liste'  : toutes les classes actives + formulaire de création
 *   - vue 'detail' : élèves d'une classe + formulaire d'ajout/suppression
 *
 * @param {object}   props
 * @param {function} props.onNavigate - Retour vers une autre page enseignant.
 */
function GestionClasses({ onNavigate }) {
    /** @type {[string|null, function]} identifiant de la classe en cours d'édition */
    const [classeActiveId, setClasseActiveId] = useState(null);

    const { state } = useAppContext();

    const classeActive =
        state.classes.find((c) => c.id === classeActiveId) ?? null;

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            {/* ── En-tête avec fil d'Ariane ──────────────────────────── */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <button
                    onClick={() => onNavigate("accueil")}
                    className="hover:text-brand-600 transition-colors cursor-pointer"
                >
                    Tableau de bord
                </button>
                <span>/</span>
                <button
                    onClick={() => setClasseActiveId(null)}
                    className={`transition-colors cursor-pointer ${
                        classeActive
                            ? "hover:text-brand-600"
                            : "text-slate-800 font-medium pointer-events-none"
                    }`}
                >
                    Mes classes
                </button>
                {classeActive && (
                    <>
                        <span>/</span>
                        <span className="text-slate-800 font-medium">
                            {classeActive.nom}
                        </span>
                    </>
                )}
            </nav>

            {/* ── Vues ───────────────────────────────────────────────── */}
            {classeActive ? (
                <VueDetailClasse
                    classe={classeActive}
                    onRetour={() => setClasseActiveId(null)}
                />
            ) : (
                <VueListeClasses onOuvrirClasse={setClasseActiveId} />
            )}
        </div>
    );
}

GestionClasses.propTypes = {
    onNavigate: PropTypes.func.isRequired,
};

/* ══════════════════════════════════════════════════════════════════
   VUE LISTE DES CLASSES
   ══════════════════════════════════════════════════════════════════ */

/**
 * VueListeClasses
 *
 * Affiche les classes actives, les classes archivées (repliées),
 * et le formulaire de création d'une nouvelle classe.
 *
 * @param {object}   props
 * @param {function} props.onOuvrirClasse - Ouvre la vue détail d'une classe.
 */
function VueListeClasses({ onOuvrirClasse }) {
    const { state, dispatch } = useAppContext();

    const classesActives = state.classes.filter((c) => !c.archive);
    const classesArchivees = state.classes.filter((c) => c.archive);

    const [showArchivees, setShowArchivees] = useState(false);
    const [showForm, setShowForm] = useState(false);

    function handleArchiver(classeId) {
        const classe = state.classes.find((c) => c.id === classeId);
        if (!classe) return;
        dispatch({
            type: "UPDATE_CLASSE",
            payload: { ...classe, archive: true },
        });
    }

    function handleDesarchiver(classeId) {
        const classe = state.classes.find((c) => c.id === classeId);
        if (!classe) return;
        dispatch({
            type: "UPDATE_CLASSE",
            payload: { ...classe, archive: false },
        });
    }

    return (
        <div>
            {/* ── En-tête ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-slate-800">
                    Mes classes
                </h1>
                <button
                    onClick={() => setShowForm((v) => !v)}
                    className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                     text-white text-sm font-medium transition-colors cursor-pointer"
                >
                    {showForm ? "Annuler" : "+ Nouvelle classe"}
                </button>
            </div>

            {/* ── Formulaire de création ───────────────────────────── */}
            {showForm && (
                <FormulaireClasse onCreer={() => setShowForm(false)} />
            )}

            {/* ── Classes actives ─────────────────────────────────── */}
            {classesActives.length === 0 && !showForm && (
                <p className="text-sm text-slate-400 text-center py-10">
                    Aucune classe. Créez-en une pour commencer.
                </p>
            )}

            <ul className="space-y-3">
                {classesActives.map((classe) => (
                    <CarteClasse
                        key={classe.id}
                        classe={classe}
                        nbEleves={classe.eleves.length}
                        onOuvrir={() => onOuvrirClasse(classe.id)}
                        onArchiver={() => handleArchiver(classe.id)}
                        archive={false}
                    />
                ))}
            </ul>

            {/* ── Classes archivées ────────────────────────────────── */}
            {classesArchivees.length > 0 && (
                <div className="mt-8">
                    <button
                        onClick={() => setShowArchivees((v) => !v)}
                        className="text-sm text-slate-400 hover:text-slate-600
                       transition-colors cursor-pointer flex items-center gap-1"
                    >
                        <span>{showArchivees ? "▾" : "▸"}</span>
                        Classes archivées ({classesArchivees.length})
                    </button>

                    {showArchivees && (
                        <ul className="mt-3 space-y-3">
                            {classesArchivees.map((classe) => (
                                <CarteClasse
                                    key={classe.id}
                                    classe={classe}
                                    nbEleves={classe.eleves.length}
                                    onOuvrir={() => onOuvrirClasse(classe.id)}
                                    onArchiver={() =>
                                        handleDesarchiver(classe.id)
                                    }
                                    archive={true}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

VueListeClasses.propTypes = {
    onOuvrirClasse: PropTypes.func.isRequired,
};

/* ══════════════════════════════════════════════════════════════════
   VUE DÉTAIL D'UNE CLASSE
   ══════════════════════════════════════════════════════════════════ */

/**
 * VueDetailClasse
 *
 * Liste les élèves d'une classe et permet d'en ajouter, modifier ou supprimer.
 * La suppression est désactivée si une passation terminée existe pour l'élève
 * (SRS F-CLS-03).
 *
 * @param {object}   props
 * @param {object}   props.classe   - Objet Classe.
 * @param {function} props.onRetour - Retour à la liste.
 */
function VueDetailClasse({ classe }) {
    const { state, dispatch } = useAppContext();

    const [showFormEleve, setShowFormEleve] = useState(false);
    const [eleveEnEdition, setEleveEnEdition] = useState(null);

    /**
     * Vérifie si un élève a au moins une passation terminée (SRS F-CLS-03).
     * @param {string} eleveId
     * @returns {boolean}
     */
    function aPassationTerminee(eleveId) {
        return state.passations.some(
            (p) => p.eleve_id === eleveId && p.statut === "terminee"
        );
    }

    function handleSupprimerEleve(eleveId) {
        if (aPassationTerminee(eleveId)) return;
        const updated = {
            ...classe,
            eleves: classe.eleves.filter((e) => e.id !== eleveId),
        };
        dispatch({ type: "UPDATE_CLASSE", payload: updated });
    }

    function handleEditerEleve(eleve) {
        setEleveEnEdition(eleve);
        setShowFormEleve(true);
    }

    function handleFermerForm() {
        setShowFormEleve(false);
        setEleveEnEdition(null);
    }

    return (
        <div>
            {/* ── En-tête ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-semibold text-slate-800">
                    {classe.nom}
                </h1>
                <button
                    onClick={() => {
                        setEleveEnEdition(null);
                        setShowFormEleve((v) => !v);
                    }}
                    className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                     text-white text-sm font-medium transition-colors cursor-pointer"
                >
                    {showFormEleve && !eleveEnEdition
                        ? "Annuler"
                        : "+ Ajouter un élève"}
                </button>
            </div>

            <p className="text-sm text-slate-400 mb-6">
                {classe.niveau} — {classe.eleves.length} élève
                {classe.eleves.length !== 1 ? "s" : ""}
            </p>

            {/* ── Formulaire ajout / édition ───────────────────────── */}
            {showFormEleve && (
                <FormulaireEleve
                    classe={classe}
                    eleveInitial={eleveEnEdition}
                    onFermer={handleFermerForm}
                />
            )}

            {/* ── Liste des élèves ─────────────────────────────────── */}
            {classe.eleves.length === 0 && !showFormEleve && (
                <p className="text-sm text-slate-400 text-center py-10">
                    Aucun élève dans cette classe.
                </p>
            )}

            <ul className="divide-y divide-slate-100">
                {[...classe.eleves]
                    .sort((a, b) => a.prenom.localeCompare(b.prenom, "fr"))
                    .map((eleve) => {
                        const protege = aPassationTerminee(eleve.id);
                        return (
                            <li
                                key={eleve.id}
                                className="flex items-center justify-between py-3"
                            >
                                <span className="text-slate-800 font-medium">
                                    {eleve.prenom}
                                    {eleve.nom ? (
                                        <span className="font-normal text-slate-500">
                                            {" "}
                                            {eleve.nom}
                                        </span>
                                    ) : null}
                                </span>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditerEleve(eleve)}
                                        className="text-xs px-3 py-1 rounded-lg border border-slate-200
                               hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleSupprimerEleve(eleve.id)
                                        }
                                        disabled={protege}
                                        title={
                                            protege
                                                ? "Cet élève a une passation enregistrée"
                                                : ""
                                        }
                                        className="text-xs px-3 py-1 rounded-lg border border-danger-200
                               text-danger-600 hover:bg-danger-50 transition-colors cursor-pointer
                               disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </li>
                        );
                    })}
            </ul>
        </div>
    );
}

VueDetailClasse.propTypes = {
    classe: PropTypes.object.isRequired,
    onRetour: PropTypes.func.isRequired,
};

/* ══════════════════════════════════════════════════════════════════
   FORMULAIRES
   ══════════════════════════════════════════════════════════════════ */

/**
 * FormulaireClasse
 *
 * Création d'une nouvelle classe (SRS F-CLS-01).
 *
 * @param {object}   props
 * @param {function} props.onCreer - Appelé après création réussie.
 */
function FormulaireClasse({ onCreer }) {
    const { dispatch } = useAppContext();

    const [nom, setNom] = useState("");
    const [niveau, setNiveau] = useState("CE1");
    const [erreur, setErreur] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        const nomTrimmed = nom.trim();
        if (!nomTrimmed) {
            setErreur("Le nom de la classe est obligatoire.");
            return;
        }
        dispatch({
            type: "CREATE_CLASSE",
            payload: {
                id: crypto.randomUUID(),
                nom: nomTrimmed,
                niveau,
                annee_scolaire:
                    new Date().getFullYear() +
                    "-" +
                    (new Date().getFullYear() + 1),
                archive: false,
                eleves: [],
            },
        });
        onCreer();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mb-6 p-5 rounded-xl border border-brand-200 bg-brand-50"
        >
            <p className="text-sm font-semibold text-brand-800 mb-4">
                Nouvelle classe
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <div className="flex-1">
                    <label
                        className="block text-xs font-medium text-slate-600 mb-1"
                        htmlFor="nom-classe"
                    >
                        Nom de la classe{" "}
                        <span className="text-danger-500">*</span>
                    </label>
                    <input
                        id="nom-classe"
                        type="text"
                        value={nom}
                        onChange={(e) => {
                            setNom(e.target.value);
                            setErreur("");
                        }}
                        placeholder="ex. : CM2 B"
                        autoFocus
                        autoComplete="off"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-400
                       focus:border-transparent bg-white"
                    />
                </div>

                <div>
                    <label
                        className="block text-xs font-medium text-slate-600 mb-1"
                        htmlFor="niveau-classe"
                    >
                        Niveau
                    </label>
                    <select
                        id="niveau-classe"
                        value={niveau}
                        onChange={(e) => setNiveau(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-400
                       focus:border-transparent bg-white cursor-pointer"
                    >
                        {NIVEAUX.map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {erreur && (
                <p className="text-xs text-danger-600 mb-3" role="alert">
                    {erreur}
                </p>
            )}

            <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                   text-white text-sm font-medium transition-colors cursor-pointer"
            >
                Créer la classe
            </button>
        </form>
    );
}

FormulaireClasse.propTypes = {
    onCreer: PropTypes.func.isRequired,
};

/**
 * FormulaireEleve
 *
 * Ajout ou modification d'un élève dans une classe (SRS F-CLS-02, F-CLS-03).
 * Le prénom est obligatoire, le nom est optionnel.
 *
 * @param {object}      props
 * @param {object}      props.classe        - Classe parente.
 * @param {object|null} props.eleveInitial  - Élève à modifier, ou null pour un ajout.
 * @param {function}    props.onFermer      - Ferme le formulaire.
 */
function FormulaireEleve({ classe, eleveInitial = null, onFermer }) {
    const { dispatch } = useAppContext();

    const [prenom, setPrenom] = useState(eleveInitial?.prenom ?? "");
    const [nom, setNom] = useState(eleveInitial?.nom ?? "");
    const [erreur, setErreur] = useState("");

    const isEdition = eleveInitial !== null;

    function handleSubmit(e) {
        e.preventDefault();
        const prenomTrimmed = prenom.trim();
        if (!prenomTrimmed) {
            setErreur("Le prénom est obligatoire.");
            return;
        }

        let nouvellesEleves;

        if (isEdition) {
            nouvellesEleves = classe.eleves.map((el) =>
                el.id === eleveInitial.id
                    ? { ...el, prenom: prenomTrimmed, nom: nom.trim() }
                    : el
            );
        } else {
            nouvellesEleves = [
                ...classe.eleves,
                {
                    id: crypto.randomUUID(),
                    prenom: prenomTrimmed,
                    nom: nom.trim(),
                },
            ];
        }

        dispatch({
            type: "UPDATE_CLASSE",
            payload: { ...classe, eleves: nouvellesEleves },
        });
        onFermer();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mb-6 p-5 rounded-xl border border-brand-200 bg-brand-50"
        >
            <p className="text-sm font-semibold text-brand-800 mb-4">
                {isEdition ? "Modifier l'élève" : "Ajouter un élève"}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <div className="flex-1">
                    <label
                        className="block text-xs font-medium text-slate-600 mb-1"
                        htmlFor="prenom-eleve"
                    >
                        Prénom <span className="text-danger-500">*</span>
                    </label>
                    <input
                        id="prenom-eleve"
                        type="text"
                        value={prenom}
                        onChange={(e) => {
                            setPrenom(e.target.value);
                            setErreur("");
                        }}
                        placeholder="Prénom"
                        autoFocus
                        autoComplete="off"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-400
                       focus:border-transparent bg-white"
                    />
                </div>

                <div className="flex-1">
                    <label
                        className="block text-xs font-medium text-slate-600 mb-1"
                        htmlFor="nom-eleve"
                    >
                        Nom <span className="text-slate-400">(optionnel)</span>
                    </label>
                    <input
                        id="nom-eleve"
                        type="text"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        placeholder="Nom de famille"
                        autoComplete="off"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-400
                       focus:border-transparent bg-white"
                    />
                </div>
            </div>

            {erreur && (
                <p className="text-xs text-danger-600 mb-3" role="alert">
                    {erreur}
                </p>
            )}

            <div className="flex gap-2">
                <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                     text-white text-sm font-medium transition-colors cursor-pointer"
                >
                    {isEdition ? "Enregistrer" : "Ajouter"}
                </button>
                <button
                    type="button"
                    onClick={onFermer}
                    className="px-5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50
                     text-slate-600 text-sm font-medium transition-colors cursor-pointer"
                >
                    Annuler
                </button>
            </div>
        </form>
    );
}

FormulaireEleve.propTypes = {
    classe: PropTypes.object.isRequired,
    eleveInitial: PropTypes.object,
    onFermer: PropTypes.func.isRequired,
};

/* ══════════════════════════════════════════════════════════════════
   CARTE CLASSE
   ══════════════════════════════════════════════════════════════════ */

/**
 * CarteClasse
 *
 * @param {object}   props
 * @param {object}   props.classe
 * @param {number}   props.nbEleves
 * @param {function} props.onOuvrir
 * @param {function} props.onArchiver
 * @param {boolean}  props.archive     - true = classe archivée.
 */
function CarteClasse({ classe, nbEleves, onOuvrir, onArchiver, archive }) {
    return (
        <li
            className="flex items-center justify-between rounded-xl border border-slate-200
                   bg-white px-5 py-4 gap-4"
        >
            <button
                onClick={onOuvrir}
                className="flex-1 text-left group cursor-pointer"
            >
                <p className="font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
                    {classe.nom}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                    {classe.niveau} — {nbEleves} élève
                    {nbEleves !== 1 ? "s" : ""}
                </p>
            </button>

            <button
                onClick={onArchiver}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200
                   hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer shrink-0"
            >
                {archive ? "Désarchiver" : "Archiver"}
            </button>
        </li>
    );
}

CarteClasse.propTypes = {
    classe: PropTypes.object.isRequired,
    nbEleves: PropTypes.number.isRequired,
    onOuvrir: PropTypes.func.isRequired,
    onArchiver: PropTypes.func.isRequired,
    archive: PropTypes.bool.isRequired,
};

export default GestionClasses;
