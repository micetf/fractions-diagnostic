/**
 * @file AppContext.jsx — contexte global et persistence localStorage.
 *
 * @description
 * État global de l'application via useReducer.
 * Seul point d'écriture dans le localStorage (SRS §6.2).
 *
 * Migration Sprint 3 :
 *   Le cas `HYDRATE` retire silencieusement `pin_hash` de la config si
 *   présent (données issues d'une version antérieure à v2.0).
 *   La migration est idempotente — un localStorage déjà migré n'est pas
 *   affecté. Aucune donnée métier (classes, sessions, passations) n'est
 *   touchée.
 *
 * @module context/AppContext
 */

import { createContext, useReducer, useEffect } from "react";
import PropTypes from "prop-types";
import { getItem, setItem, KEYS } from "@/hooks/useStorage";

// ─── État initial ─────────────────────────────────────────────────────────────

/**
 * Forme de l'état global.
 *
 * `_hydrated` est un marqueur interne : la persistence vers localStorage
 * ne s'active qu'une fois l'hydratation terminée.
 *
 * `config` contient désormais uniquement `annee_scolaire` et
 * `session_en_cours_id`. Le champ `pin_hash` a été retiré en v2.0.
 */
const initialState = {
    /**
     * @type {{ annee_scolaire?: string, session_en_cours_id?: string } | null}
     */
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Retire `pin_hash` de la config si présent (migration v1 → v2).
 * Retourne `null` si la config nettoyée est vide ou absente.
 *
 * @param {object|null} configBrute - Config lue depuis localStorage.
 * @returns {object|null}
 */
function migrerConfig(configBrute) {
    if (!configBrute || typeof configBrute !== "object") return null;

    // eslint-disable-next-line no-unused-vars
    const { pin_hash, ...configSansPIN } = configBrute;

    // Si la config ne contenait que pin_hash → on retourne null
    // (l'application démarrera comme si c'était un premier lancement)
    return Object.keys(configSansPIN).length > 0 ? configSansPIN : null;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

/**
 * @param {typeof initialState} state
 * @param {{ type: string, payload?: any }} action
 * @returns {typeof initialState}
 */
function appReducer(state, action) {
    switch (action.type) {
        // ── Hydratation initiale depuis localStorage ───────────────────────
        case "HYDRATE":
            return {
                ...state,
                config: migrerConfig(action.payload.config),
                classes: action.payload.classes ?? [],
                sessions: action.payload.sessions ?? [],
                passations: action.payload.passations ?? [],
                _hydrated: true,
            };

        // ── Configuration (année scolaire) ────────────────────────────────
        /**
         * payload : { annee_scolaire: string }
         * Note v2.0 : `pin_hash` n'est plus accepté dans ce payload.
         */
        case "SET_CONFIG": {
            // Garde défensive : ne jamais persister pin_hash
            // eslint-disable-next-line no-unused-vars
            const { pin_hash, ...configPropre } = action.payload ?? {};
            return { ...state, config: configPropre };
        }

        // ── Classes ───────────────────────────────────────────────────────
        case "CREATE_CLASSE":
            return { ...state, classes: [...state.classes, action.payload] };

        case "UPDATE_CLASSE":
            return {
                ...state,
                classes: state.classes.map((c) =>
                    c.id === action.payload.id ? action.payload : c
                ),
            };

        case "DELETE_CLASSE":
            return {
                ...state,
                classes: state.classes.filter(
                    (c) => c.id !== action.payload.id
                ),
            };

        // ── Sessions ──────────────────────────────────────────────────────
        case "CREATE_SESSION":
            return {
                ...state,
                sessions: [...state.sessions, action.payload],
            };

        case "UPDATE_SESSION":
            return {
                ...state,
                sessions: state.sessions.map((s) =>
                    s.id === action.payload.id ? action.payload : s
                ),
            };

        // ── Passations ────────────────────────────────────────────────────
        case "CREATE_PASSATION":
            return {
                ...state,
                passations: [...state.passations, action.payload],
            };

        case "ADD_REPONSE":
            return {
                ...state,
                passations: state.passations.map((p) =>
                    p.id === action.payload.passation_id
                        ? {
                              ...p,
                              reponses: [...p.reponses, action.payload.reponse],
                          }
                        : p
                ),
            };

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

        case "UPDATE_NOTE_ELEVE":
            return {
                ...state,
                passations: state.passations.map((p) =>
                    p.id === action.payload.passation_id
                        ? { ...p, note_enseignant: action.payload.note }
                        : p
                ),
            };

        // ── Session active ────────────────────────────────────────────────
        /**
         * Lance la session : persiste l'id dans config.
         * payload : { session_id: string }
         */
        case "SET_SESSION_ACTIVE":
            return {
                ...state,
                config: {
                    ...(state.config ?? {}),
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
                    ...(state.config ?? {}),
                    session_en_cours_id: null,
                },
            };

        // ── Reset ─────────────────────────────────────────────────────────
        /**
         * Remet l'application à l'état initial (début d'année scolaire).
         * Efface classes, sessions, passations et config.
         */
        case "RESET_ALL":
            return {
                ...initialState,
                _hydrated: true,
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
 *
 * @param {object}          props
 * @param {React.ReactNode} props.children
 */
export function AppContextProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // ── Hydratation au montage ─────────────────────────────────────────────
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

    // ── Persistence à chaque changement (sauf avant hydratation) ──────────
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
