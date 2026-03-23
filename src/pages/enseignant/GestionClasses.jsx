import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";

const NIVEAUX = ["CE1", "CE2", "CM1", "CM2"];

// ─── Utilitaire ──────────────────────────────────────────────────────────────

/** Trie les élèves : nom de famille puis prénom, insensible à la casse. */
function trierEleves(eleves) {
    return [...eleves].sort((a, b) => {
        const na = `${a.nom ?? ""} ${a.prenom}`.trim().toLowerCase();
        const nb = `${b.nom ?? ""} ${b.prenom}`.trim().toLowerCase();
        return na.localeCompare(nb, "fr");
    });
}

/**
 * Parse une saisie multi-ligne en liste d'élèves.
 * Formats acceptés par ligne :
 *   "Prénom"
 *   "Prénom Nom"
 *   "Nom, Prénom"  (convention tableur français)
 *   "Prénom;Nom"
 * @param {string} texte
 * @returns {{ prenom: string, nom: string }[]}
 */
function parserListeEleves(texte) {
    return texte
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((ligne) => {
            // Format "Nom, Prénom"
            if (ligne.includes(",")) {
                const [nom, prenom] = ligne.split(",").map((s) => s.trim());
                return { prenom: prenom ?? "", nom: nom ?? "" };
            }
            // Format "Prénom;Nom"
            if (ligne.includes(";")) {
                const [prenom, nom] = ligne.split(";").map((s) => s.trim());
                return { prenom, nom: nom ?? "" };
            }
            // Format "Prénom Nom" ou "Prénom" seul
            const parts = ligne.split(" ");
            const prenom = parts[0] ?? "";
            const nom = parts.slice(1).join(" ");
            return { prenom, nom };
        })
        .filter((e) => e.prenom);
}

// ─── Modale de confirmation ───────────────────────────────────────────────────

/**
 * ConfirmModal
 * Modale légère pour confirmer une action destructrice.
 */
function ConfirmModal({ message, onConfirm, onCancel }) {
    // Fermeture sur Échap
    useEffect(() => {
        function onKey(e) {
            if (e.key === "Escape") onCancel();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onCancel]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/30 backdrop-blur-sm"
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <p className="text-slate-800 text-base mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600
                       text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        autoFocus
                        className="px-4 py-2 rounded-lg bg-danger-500 hover:bg-danger-600
                       text-white text-sm font-medium transition-colors cursor-pointer"
                    >
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    );
}

ConfirmModal.propTypes = {
    message: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

// ─── GestionClasses ───────────────────────────────────────────────────────────

/**
 * GestionClasses
 * Gestion complète des classes et de leurs élèves (SRS F-CLS-01 à F-CLS-04).
 *
 * @param {object}   props
 * @param {function} props.onNavigate
 */
function GestionClasses({ onNavigate }) {
    const [classeActiveId, setClasseActiveId] = useState(null);
    const { state } = useAppContext();
    const classeActive =
        state.classes.find((c) => c.id === classeActiveId) ?? null;

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
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

GestionClasses.propTypes = { onNavigate: PropTypes.func.isRequired };

// ─── VueListeClasses ──────────────────────────────────────────────────────────

function VueListeClasses({ onOuvrirClasse }) {
    const { state, dispatch } = useAppContext();
    const [showForm, setShowForm] = useState(false);
    const [showArchivees, setShowArchivees] = useState(false);
    const [confirm, setConfirm] = useState(null); // { classeId }

    const classesActives = state.classes.filter((c) => !c.archivee);
    const classesArchivees = state.classes.filter((c) => c.archivee);

    function handleArchiver(id) {
        setConfirm({ classeId: id });
    }

    function doArchiver() {
        const classe = state.classes.find((c) => c.id === confirm.classeId);
        if (!classe) return;
        dispatch({
            type: "UPDATE_CLASSE",
            payload: { ...classe, archivee: true },
        });
        setConfirm(null);
    }

    function handleDesarchiver(id) {
        const classe = state.classes.find((c) => c.id === id);
        if (!classe) return;
        dispatch({
            type: "UPDATE_CLASSE",
            payload: { ...classe, archivee: false },
        });
    }

    return (
        <div className="space-y-4">
            {confirm && (
                <ConfirmModal
                    message="Archiver cette classe ? Elle n'apparaîtra plus dans la liste principale."
                    onConfirm={doArchiver}
                    onCancel={() => setConfirm(null)}
                />
            )}

            <div className="flex items-center justify-between mb-2">
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

            {showForm && (
                <FormulaireClasse onCreer={() => setShowForm(false)} />
            )}

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

VueListeClasses.propTypes = { onOuvrirClasse: PropTypes.func.isRequired };

// ─── VueDetailClasse ──────────────────────────────────────────────────────────

function VueDetailClasse({ classe, onRetour }) {
    const { state, dispatch } = useAppContext();

    // Mode d'ajout : 'simple' | 'multiple' | null
    const [modeAjout, setModeAjout] = useState(null);
    // Élève en édition inline (id)
    const [editId, setEditId] = useState(null);
    // Édition du titre de la classe
    const [editClasse, setEditClasse] = useState(false);
    // Confirmation de suppression
    const [confirmSuppr, setConfirmSuppr] = useState(null); // { eleveId }

    const elevesTriees = trierEleves(classe.eleves);

    function aPassationTerminee(eleveId) {
        return state.passations.some(
            (p) => p.eleve_id === eleveId && p.statut === "terminee"
        );
    }

    function handleSupprimerEleve(eleveId) {
        const updated = {
            ...classe,
            eleves: classe.eleves.filter((e) => e.id !== eleveId),
        };
        dispatch({ type: "UPDATE_CLASSE", payload: updated });
        setConfirmSuppr(null);
    }

    function handleUpdateEleve(eleveModifie) {
        const updated = {
            ...classe,
            eleves: classe.eleves.map((e) =>
                e.id === eleveModifie.id ? eleveModifie : e
            ),
        };
        dispatch({ type: "UPDATE_CLASSE", payload: updated });
        setEditId(null);
    }

    function handleAjouterEleves(nouveaux) {
        const updated = {
            ...classe,
            eleves: [
                ...classe.eleves,
                ...nouveaux.map((e) => ({ ...e, id: crypto.randomUUID() })),
            ],
        };
        dispatch({ type: "UPDATE_CLASSE", payload: updated });
        setModeAjout(null);
    }

    return (
        <div>
            {confirmSuppr && (
                <ConfirmModal
                    message="Supprimer cet élève définitivement ?"
                    onConfirm={() => handleSupprimerEleve(confirmSuppr.eleveId)}
                    onCancel={() => setConfirmSuppr(null)}
                />
            )}

            {/* ── En-tête éditable ─────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                    {editClasse ? (
                        <FormEditClasse
                            classe={classe}
                            onSauvegarder={(updated) => {
                                dispatch({
                                    type: "UPDATE_CLASSE",
                                    payload: updated,
                                });
                                setEditClasse(false);
                            }}
                            onAnnuler={() => setEditClasse(false)}
                        />
                    ) : (
                        <div className="flex items-center gap-3">
                            <div>
                                <h1 className="text-2xl font-semibold text-slate-800">
                                    {classe.nom}
                                </h1>
                                <p className="text-sm text-slate-400 mt-0.5">
                                    {classe.niveau} — {classe.eleves.length}{" "}
                                    élève
                                    {classe.eleves.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                            <button
                                onClick={() => setEditClasse(true)}
                                title="Modifier le nom ou le niveau"
                                className="text-slate-400 hover:text-brand-600 transition-colors
                           cursor-pointer text-sm"
                            >
                                ✎
                            </button>
                        </div>
                    )}
                </div>

                {/* Boutons ajout */}
                {!editClasse && (
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={() =>
                                setModeAjout((v) =>
                                    v === "simple" ? null : "simple"
                                )
                            }
                            className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                         text-white text-sm font-medium transition-colors cursor-pointer"
                        >
                            + Ajouter
                        </button>
                        <button
                            onClick={() =>
                                setModeAjout((v) =>
                                    v === "multiple" ? null : "multiple"
                                )
                            }
                            title="Coller une liste depuis un tableur ou l'ENT"
                            className="px-4 py-2 rounded-lg border border-brand-300 hover:bg-brand-50
                         text-brand-600 text-sm font-medium transition-colors cursor-pointer"
                        >
                            Importer liste
                        </button>
                    </div>
                )}
            </div>

            {/* ── Formulaires d'ajout ───────────────────────────────────── */}
            {modeAjout === "simple" && (
                <FormulaireEleveSimple
                    onAjouter={(e) => handleAjouterEleves([e])}
                    onFermer={() => setModeAjout(null)}
                />
            )}
            {modeAjout === "multiple" && (
                <FormulaireEleveMultiple
                    onAjouter={handleAjouterEleves}
                    onFermer={() => setModeAjout(null)}
                />
            )}

            {/* ── Liste des élèves ──────────────────────────────────────── */}
            {elevesTriees.length === 0 && !modeAjout && (
                <p className="text-sm text-slate-400 text-center py-10">
                    Aucun élève dans cette classe.
                </p>
            )}

            <ul className="space-y-2 mt-2">
                {elevesTriees.map((eleve) => (
                    <LigneEleve
                        key={eleve.id}
                        eleve={eleve}
                        enEdition={editId === eleve.id}
                        protege={aPassationTerminee(eleve.id)}
                        onEditer={() => setEditId(eleve.id)}
                        onSauvegarder={handleUpdateEleve}
                        onAnnuler={() => setEditId(null)}
                        onSupprimer={() =>
                            setConfirmSuppr({ eleveId: eleve.id })
                        }
                    />
                ))}
            </ul>
        </div>
    );
}

VueDetailClasse.propTypes = {
    classe: PropTypes.object.isRequired,
    onRetour: PropTypes.func.isRequired,
};

// ─── FormEditClasse ────────────────────────────────────────────────────────────

/**
 * FormEditClasse
 * Édition in-place du nom et du niveau d'une classe existante.
 */
function FormEditClasse({ classe, onSauvegarder, onAnnuler }) {
    const [nom, setNom] = useState(classe.nom);
    const [niveau, setNiveau] = useState(classe.niveau);

    function handleKey(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            soumettre();
        }
        if (e.key === "Escape") onAnnuler();
    }

    function soumettre() {
        const n = nom.trim();
        if (!n) return;
        onSauvegarder({ ...classe, nom: n, niveau });
    }

    return (
        <div className="flex items-center gap-3 flex-wrap">
            <input
                autoFocus
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Nom de la classe"
                className="flex-1 min-w-40 px-3 py-1.5 rounded-lg border-2 border-brand-300
                   text-slate-800 text-base focus:outline-none focus:ring-2
                   focus:ring-brand-400"
            />
            <select
                value={niveau}
                onChange={(e) => setNiveau(e.target.value)}
                className="px-3 py-1.5 rounded-lg border-2 border-slate-200 text-slate-700
                   text-sm focus:outline-none focus:ring-2 focus:ring-brand-400
                   cursor-pointer"
            >
                {NIVEAUX.map((n) => (
                    <option key={n} value={n}>
                        {n}
                    </option>
                ))}
            </select>
            <button
                onClick={soumettre}
                className="px-4 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600
                   text-white text-sm font-medium cursor-pointer"
            >
                Enregistrer
            </button>
            <button
                onClick={onAnnuler}
                className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600
                   text-sm hover:bg-slate-50 cursor-pointer"
            >
                Annuler
            </button>
        </div>
    );
}

FormEditClasse.propTypes = {
    classe: PropTypes.object.isRequired,
    onSauvegarder: PropTypes.func.isRequired,
    onAnnuler: PropTypes.func.isRequired,
};

// ─── LigneEleve ───────────────────────────────────────────────────────────────

/**
 * LigneEleve
 * Affiche un élève. En mode édition, les champs deviennent des inputs inline.
 */
function LigneEleve({
    eleve,
    enEdition,
    protege,
    onEditer,
    onSauvegarder,
    onAnnuler,
    onSupprimer,
}) {
    const [prenom, setPrenom] = useState(eleve.prenom);
    const [nom, setNom] = useState(eleve.nom ?? "");

    // Resync si un autre élève passe en édition
    useEffect(() => {
        if (!enEdition) {
            setPrenom(eleve.prenom);
            setNom(eleve.nom ?? "");
        }
    }, [enEdition, eleve]);

    function handleKey(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            soumettre();
        }
        if (e.key === "Escape") onAnnuler();
    }

    function soumettre() {
        const p = prenom.trim();
        if (!p) return;
        onSauvegarder({ ...eleve, prenom: p, nom: nom.trim() });
    }

    const affichage = [eleve.nom, eleve.prenom].filter(Boolean).join(" ");

    if (enEdition) {
        return (
            <li
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                     border-2 border-brand-300 bg-brand-50"
            >
                <input
                    autoFocus
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Prénom *"
                    className="flex-1 min-w-0 px-2 py-1 rounded-lg border border-slate-300
                     text-slate-800 text-sm focus:outline-none focus:ring-2
                     focus:ring-brand-400"
                />
                <input
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Nom"
                    className="flex-1 min-w-0 px-2 py-1 rounded-lg border border-slate-300
                     text-slate-800 text-sm focus:outline-none focus:ring-2
                     focus:ring-brand-400"
                />
                <button
                    onClick={soumettre}
                    className="px-3 py-1 rounded-lg bg-brand-500 hover:bg-brand-600
                     text-white text-xs font-medium cursor-pointer shrink-0"
                >
                    ✓
                </button>
                <button
                    onClick={onAnnuler}
                    className="px-3 py-1 rounded-lg border border-slate-200 text-slate-500
                     text-xs hover:bg-slate-50 cursor-pointer shrink-0"
                >
                    ✕
                </button>
            </li>
        );
    }

    return (
        <li
            className="flex items-center justify-between px-4 py-3 rounded-xl
                   border border-slate-200 bg-white hover:border-slate-300
                   transition-colors gap-3"
        >
            <span className="text-sm text-slate-800 flex-1">{affichage}</span>
            <div className="flex gap-2 shrink-0">
                <button
                    onClick={onEditer}
                    className="text-xs px-3 py-1 rounded-lg border border-slate-200
                     text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                    Modifier
                </button>
                <button
                    onClick={onSupprimer}
                    disabled={protege}
                    title={
                        protege ? "Cet élève a une passation enregistrée" : ""
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
}

LigneEleve.propTypes = {
    eleve: PropTypes.object.isRequired,
    enEdition: PropTypes.bool.isRequired,
    protege: PropTypes.bool.isRequired,
    onEditer: PropTypes.func.isRequired,
    onSauvegarder: PropTypes.func.isRequired,
    onAnnuler: PropTypes.func.isRequired,
    onSupprimer: PropTypes.func.isRequired,
};

// ─── FormulaireEleveSimple ────────────────────────────────────────────────────

/**
 * FormulaireEleveSimple
 * Ajoute un seul élève. Entrée valide avec Entrée, annule avec Échap.
 */
function FormulaireEleveSimple({ onAjouter, onFermer }) {
    const [prenom, setPrenom] = useState("");
    const [nom, setNom] = useState("");
    const [erreur, setErreur] = useState("");

    function handleKey(e) {
        if (e.key === "Escape") onFermer();
    }

    function soumettre(e) {
        e.preventDefault();
        const p = prenom.trim();
        if (!p) {
            setErreur("Le prénom est obligatoire.");
            return;
        }
        onAjouter({ prenom: p, nom: nom.trim() });
        setPrenom("");
        setNom("");
        setErreur("");
    }

    return (
        <form
            onSubmit={soumettre}
            className="flex items-start gap-3 flex-wrap p-4 rounded-xl
                 bg-brand-50 border border-brand-200 mb-4"
        >
            <div className="flex flex-col gap-1 flex-1 min-w-32">
                <input
                    autoFocus
                    value={prenom}
                    onChange={(e) => {
                        setPrenom(e.target.value);
                        setErreur("");
                    }}
                    onKeyDown={handleKey}
                    placeholder="Prénom *"
                    className="px-3 py-2 rounded-lg border border-slate-300 text-slate-800
                     text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                {erreur && <p className="text-xs text-danger-600">{erreur}</p>}
            </div>
            <input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Nom (optionnel)"
                className="flex-1 min-w-32 px-3 py-2 rounded-lg border border-slate-300
                   text-slate-800 text-sm focus:outline-none focus:ring-2
                   focus:ring-brand-400"
            />
            <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                   text-white text-sm font-medium cursor-pointer shrink-0"
            >
                Ajouter
            </button>
            <button
                type="button"
                onClick={onFermer}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600
                   text-sm hover:bg-slate-50 cursor-pointer shrink-0"
            >
                Annuler
            </button>
        </form>
    );
}

FormulaireEleveSimple.propTypes = {
    onAjouter: PropTypes.func.isRequired,
    onFermer: PropTypes.func.isRequired,
};

// ─── FormulaireEleveMultiple ──────────────────────────────────────────────────

/**
 * FormulaireEleveMultiple
 *
 * Coller / taper plusieurs élèves d'un coup.
 * Formats acceptés (une ligne = un élève) :
 *   Prénom
 *   Prénom Nom
 *   Nom, Prénom   (tableur français)
 *   Prénom;Nom
 *
 * Affiche un aperçu en temps réel avant validation.
 */
function FormulaireEleveMultiple({ onAjouter, onFermer }) {
    const [texte, setTexte] = useState("");
    const [erreur, setErreur] = useState("");
    const parsed = parserListeEleves(texte);

    function soumettre(e) {
        e.preventDefault();
        if (parsed.length === 0) {
            setErreur("Aucun élève détecté. Vérifiez le format.");
            return;
        }
        onAjouter(parsed);
    }

    return (
        <form
            onSubmit={soumettre}
            className="p-4 rounded-xl bg-brand-50 border border-brand-200 mb-4 space-y-3"
        >
            <p className="text-xs text-slate-500">
                Collez la liste depuis un tableur ou un ENT. Un élève par ligne.
                Formats : <span className="font-mono">Prénom Nom</span>,{" "}
                <span className="font-mono">Nom, Prénom</span> ou{" "}
                <span className="font-mono">Prénom;Nom</span>
            </p>

            <textarea
                autoFocus
                value={texte}
                onChange={(e) => {
                    setTexte(e.target.value);
                    setErreur("");
                }}
                rows={6}
                placeholder={"Dupont Marie\nMartin Paul\nBernard, Louise"}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800
                   text-sm font-mono focus:outline-none focus:ring-2
                   focus:ring-brand-400 resize-y"
            />

            {erreur && <p className="text-xs text-danger-600">{erreur}</p>}

            {/* Aperçu */}
            {parsed.length > 0 && (
                <div className="rounded-lg bg-white border border-slate-200 p-3">
                    <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                        Aperçu — {parsed.length} élève
                        {parsed.length > 1 ? "s" : ""} détecté
                        {parsed.length > 1 ? "s" : ""}
                    </p>
                    <ul className="space-y-1 max-h-40 overflow-y-auto">
                        {parsed.map((e, i) => (
                            <li
                                key={i}
                                className="text-sm text-slate-700 flex gap-2"
                            >
                                <span className="text-slate-300 font-mono w-5 text-right shrink-0">
                                    {i + 1}
                                </span>
                                <span className="font-medium">{e.prenom}</span>
                                {e.nom && (
                                    <span className="text-slate-500">
                                        {e.nom}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={parsed.length === 0}
                    className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                     text-white text-sm font-medium cursor-pointer
                     disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Ajouter{" "}
                    {parsed.length > 0
                        ? `${parsed.length} élève${parsed.length > 1 ? "s" : ""}`
                        : ""}
                </button>
                <button
                    type="button"
                    onClick={onFermer}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600
                     text-sm hover:bg-slate-50 cursor-pointer"
                >
                    Annuler
                </button>
            </div>
        </form>
    );
}

FormulaireEleveMultiple.propTypes = {
    onAjouter: PropTypes.func.isRequired,
    onFermer: PropTypes.func.isRequired,
};

// ─── FormulaireClasse ─────────────────────────────────────────────────────────

/**
 * FormulaireClasse — création d'une nouvelle classe.
 */
function FormulaireClasse({ onCreer }) {
    const { dispatch } = useAppContext();
    const [nom, setNom] = useState("");
    const [niveau, setNiveau] = useState("CE1");
    const [erreur, setErreur] = useState("");

    function soumettre(e) {
        e.preventDefault();
        const n = nom.trim();
        if (!n) {
            setErreur("Le nom est obligatoire.");
            return;
        }
        dispatch({
            type: "CREATE_CLASSE",
            payload: {
                id: crypto.randomUUID(),
                nom: n,
                niveau,
                eleves: [],
                archivee: false,
                creee_le: new Date().toISOString(),
            },
        });
        onCreer();
    }

    function handleKey(e) {
        if (e.key === "Escape") onCreer();
    }

    return (
        <form
            onSubmit={soumettre}
            className="flex items-start gap-3 flex-wrap p-4 rounded-xl
                 bg-brand-50 border border-brand-200 mb-4"
        >
            <div className="flex flex-col gap-1 flex-1 min-w-40">
                <input
                    autoFocus
                    value={nom}
                    onChange={(e) => {
                        setNom(e.target.value);
                        setErreur("");
                    }}
                    onKeyDown={handleKey}
                    placeholder="Nom de la classe (ex. : CM1 B)"
                    className="px-3 py-2 rounded-lg border border-slate-300 text-slate-800
                     text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                {erreur && <p className="text-xs text-danger-600">{erreur}</p>}
            </div>
            <select
                value={niveau}
                onChange={(e) => setNiveau(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700
                   text-sm focus:outline-none focus:ring-2 focus:ring-brand-400
                   cursor-pointer"
            >
                {NIVEAUX.map((n) => (
                    <option key={n} value={n}>
                        {n}
                    </option>
                ))}
            </select>
            <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600
                   text-white text-sm font-medium cursor-pointer shrink-0"
            >
                Créer
            </button>
            <button
                type="button"
                onClick={onCreer}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600
                   text-sm hover:bg-slate-50 cursor-pointer shrink-0"
            >
                Annuler
            </button>
        </form>
    );
}

FormulaireClasse.propTypes = { onCreer: PropTypes.func.isRequired };

// ─── CarteClasse ──────────────────────────────────────────────────────────────

function CarteClasse({ classe, nbEleves, onOuvrir, onArchiver, archive }) {
    return (
        <li
            className="flex items-center justify-between rounded-xl border
                   border-slate-200 bg-white px-5 py-4 gap-4"
        >
            <button
                onClick={onOuvrir}
                className="flex-1 text-left group cursor-pointer"
            >
                <p
                    className="font-semibold text-slate-800 group-hover:text-brand-600
                      transition-colors"
                >
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
                   hover:bg-slate-50 text-slate-500 transition-colors
                   cursor-pointer shrink-0"
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
