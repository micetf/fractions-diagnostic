import { createContext, useReducer, useEffect } from "react";
import PropTypes from "prop-types";
import { getItem, setItem, KEYS } from "@/hooks/useStorage";

// ─── État initial ─────────────────────────────────────────────────────────────

/**
 * Forme de l'état global.
 *
 * Le champ `_hydrated` est un marqueur interne :
 * la persistence vers localStorage ne s'active qu'une fois l'hydratation
 * depuis localStorage terminée, pour ne pas écraser des données existantes
 * avec l'état vide initial.
 */
const initialState = {
    /** @type {{ pin_hash: string, annee_scolaire: string } | null} */
    config: null,
    /** @type {Array} Classe[] */
    classes: [],
    /** @type {Array} Session[] */
    sessions: [],
    /** @type {Array} PassationEleve[] */
    passations: [],
    /** Marqueur interne — ne pas persister. */
    _hydrated: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

/**
 * Reducer principal de l'application.
 *
 * @param {typeof initialState} state
 * @param {{ type: string, payload?: any }} action
 * @returns {typeof initialState}
 */
function appReducer(state, action) {
    switch (action.type) {
        // ── Hydratation initiale depuis localStorage ───────────────────────────
        case "HYDRATE":
            return {
                ...state,
                config: action.payload.config ?? null,
                classes: action.payload.classes ?? [],
                sessions: action.payload.sessions ?? [],
                passations: action.payload.passations ?? [],
                _hydrated: true,
            };

        // ── Configuration (PIN + année scolaire) ──────────────────────────────
        /**
         * payload : { pin_hash: string, annee_scolaire: string }
         */
        case "SET_CONFIG":
            return { ...state, config: action.payload };

        // ── Classes ───────────────────────────────────────────────────────────
        /**
         * payload : { id, nom, niveau, annee_scolaire, archive: false, eleves: [] }
         */
        case "CREATE_CLASSE":
            return { ...state, classes: [...state.classes, action.payload] };

        /**
         * payload : Classe (objet complet mis à jour)
         */
        case "UPDATE_CLASSE":
            return {
                ...state,
                classes: state.classes.map((c) =>
                    c.id === action.payload.id ? action.payload : c
                ),
            };

        /**
         * payload : { id: string }
         * Suppression définitive — uniquement si aucune passation n'est liée
         * à un élève de cette classe (contrôle à faire côté appelant).
         */
        case "DELETE_CLASSE":
            return {
                ...state,
                classes: state.classes.filter(
                    (c) => c.id !== action.payload.id
                ),
            };

        // ── Sessions ──────────────────────────────────────────────────────────
        /**
         * payload : { id, classe_id, niveau, exercices_selectionnes, date_creation, statut: 'en_cours' }
         */
        case "CREATE_SESSION":
            return { ...state, sessions: [...state.sessions, action.payload] };

        /**
         * payload : { id: string }
         */
        case "CLOSE_SESSION":
            return {
                ...state,
                sessions: state.sessions.map((s) =>
                    s.id === action.payload.id
                        ? { ...s, statut: "terminee" }
                        : s
                ),
            };

        // ── Passations ────────────────────────────────────────────────────────
        /**
         * payload : { id, session_id, eleve_id, statut: 'en_cours', date_debut, date_fin: null, reponses: [] }
         */
        case "CREATE_PASSATION":
            return {
                ...state,
                passations: [...state.passations, action.payload],
            };

        /**
         * Enregistre ou remplace la réponse à un exercice dans une passation.
         * payload : { passation_id: string, reponse: ReponseExercice }
         */
        case "SAVE_REPONSE":
            return {
                ...state,
                passations: state.passations.map((p) => {
                    if (p.id !== action.payload.passation_id) return p;
                    const autresReponses = p.reponses.filter(
                        (r) =>
                            r.exercice_numero !==
                            action.payload.reponse.exercice_numero
                    );
                    return {
                        ...p,
                        reponses: [...autresReponses, action.payload.reponse],
                    };
                }),
            };

        /**
         * Marque une passation comme terminée.
         * payload : { id: string, date_fin: string }
         */
        case "FINISH_PASSATION":
            return {
                ...state,
                passations: state.passations.map((p) =>
                    p.id === action.payload.id
                        ? {
                              ...p,
                              statut: "terminee",
                              date_fin: action.payload.date_fin,
                          }
                        : p
                ),
            };

        /**
         * Attribue manuellement des codes biais à un item « à relire ».
         * payload : { passation_id: string, exercice_numero: number, biais_manuel: string[] }
         */
        case "VALIDER_ITEM":
            return {
                ...state,
                passations: state.passations.map((p) => {
                    if (p.id !== action.payload.passation_id) return p;
                    return {
                        ...p,
                        reponses: p.reponses.map((r) =>
                            r.exercice_numero === action.payload.exercice_numero
                                ? {
                                      ...r,
                                      biais_manuel: action.payload.biais_manuel,
                                      a_relire: false,
                                  }
                                : r
                        ),
                    };
                }),
            };

        /**
         * Ajoute ou remplace la note libre de l'enseignant sur une passation.
         * payload : { passation_id: string, note: string }
         */
        case "UPDATE_NOTE_ELEVE":
            return {
                ...state,
                passations: state.passations.map((p) =>
                    p.id === action.payload.passation_id
                        ? { ...p, note_enseignant: action.payload.note }
                        : p
                ),
            };

        /**
         * Remet l'application à l'état initial (début d'année scolaire).
         * Efface classes, sessions, passations et config.
         * Le rechargement de la page est géré côté composant.
         */
        case "RESET_ALL":
            return {
                ...initialState,
                _hydrated: true,
            };

        /**
         * Définit la session active (lancée par l'enseignant).
         * Persiste en localStorage via l'effet habituel.
         * payload : { session_id: string }
         */
        case "SET_SESSION_ACTIVE":
            return {
                ...state,
                config: {
                    ...state.config,
                    session_en_cours_id: action.payload.session_id,
                },
            };

        /**
         * Efface la session active (retour mode enseignant).
         */
        case "CLEAR_SESSION_ACTIVE":
            return {
                ...state,
                config: {
                    ...state.config,
                    session_en_cours_id: null,
                },
            };
        default:
            return state;
    }
}

// ─── Contexte ─────────────────────────────────────────────────────────────────

const AppContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * AppContextProvider
 *
 * Fournit l'état global et le dispatch à toute l'arborescence.
 * Gère :
 *   - l'hydratation initiale depuis localStorage (effet au montage)
 *   - la persistence vers localStorage à chaque changement d'état
 *     (uniquement après hydratation, pour ne pas écraser les données existantes)
 *
 * Seul point d'écriture dans le localStorage (SRS §6.2).
 *
 * @param {object}          props
 * @param {React.ReactNode} props.children
 */
export function AppContextProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // ── Hydratation au montage ───────────────────────────────────────────────
    useEffect(() => {
        dispatch({
            type: "HYDRATE",
            payload: {
                config: getItem(KEYS.config),
                classes: getItem(KEYS.classes),
                sessions: getItem(KEYS.sessions),
                passations: getItem(KEYS.passations),
            },
        });
    }, []);

    // ── Persistence à chaque changement (sauf avant hydratation) ────────────
    useEffect(() => {
        if (!state._hydrated) return;
        setItem(KEYS.config, state.config);
        setItem(KEYS.classes, state.classes);
        setItem(KEYS.sessions, state.sessions);
        setItem(KEYS.passations, state.passations);
    }, [state]);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
}

AppContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AppContext;
