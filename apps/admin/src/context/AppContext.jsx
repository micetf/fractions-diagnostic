/**
 * @fileoverview AppContext — contexte global et persistence localStorage.
 *
 * État global de l'interface admin via useReducer.
 * Seul point d'écriture dans le localStorage admin (SRS §6.1).
 *
 * Changements v2.0 par rapport à v1.0 :
 *   - Session → Diagnostic (SRS F-DIA-06 : pas de cycle de vie)
 *   - Suppression de SET_SESSION_ACTIVE / CLEAR_SESSION_ACTIVE
 *   - Clés localStorage : fractions-admin_* (via ADMIN_KEYS)
 *   - Config : pin_hash + pin_hint (gérés au Sprint 2)
 *
 * @module context/AppContext
 */

import { createContext, useReducer, useEffect } from "react";
import PropTypes from "prop-types";
import { getItem, setItem, KEYS } from "@/hooks/useStorage";

// ─── État initial ─────────────────────────────────────────────────────────────

/**
 * @typedef {import('@fractions-diagnostic/shared/types').Config} Config
 * @typedef {import('@fractions-diagnostic/shared/types').Classe} Classe
 * @typedef {import('@fractions-diagnostic/shared/types').Diagnostic} Diagnostic
 * @typedef {import('@fractions-diagnostic/shared/types').PassationEleve} PassationEleve
 */

const initialState = {
    /** @type {Config|null} */
    config: null,
    /** @type {Classe[]} */
    classes: [],
    /** @type {Diagnostic[]} */
    diagnostics: [],
    /** @type {PassationEleve[]} */
    passations: [],
    /** Marqueur interne — ne pas persister. */
    _hydrated: false,
};

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
                config:      action.payload.config      ?? null,
                classes:     action.payload.classes     ?? [],
                diagnostics: action.payload.diagnostics ?? [],
                passations:  action.payload.passations  ?? [],
                _hydrated: true,
            };

        // ── Configuration (PIN + année scolaire) ──────────────────────────
        /**
         * payload : { pin_hash: string, pin_hint?: string, annee_scolaire: string }
         * Le pin_hash est haché SHA-256 avant d'arriver ici (SRS NF-SEC-01).
         */
        case "SET_CONFIG":
            return { ...state, config: action.payload };

        /**
         * Met à jour uniquement l'indice PIN sans toucher au hash.
         * payload : { pin_hint: string }
         */
        case "SET_PIN_HINT":
            return {
                ...state,
                config: { ...(state.config ?? {}), pin_hint: action.payload.pin_hint },
            };

        // ── Classes ───────────────────────────────────────────────────────
        /**
         * payload : Classe
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
         * Suppression définitive — vérifier l'absence de passations côté appelant.
         */
        case "DELETE_CLASSE":
            return {
                ...state,
                classes: state.classes.filter((c) => c.id !== action.payload.id),
            };

        // ── Diagnostics ───────────────────────────────────────────────────
        /**
         * payload : Diagnostic
         * Pas de statut, pas de cycle de vie (SRS F-DIA-06).
         */
        case "CREATE_DIAGNOSTIC":
            return {
                ...state,
                diagnostics: [...state.diagnostics, action.payload],
            };

        /**
         * payload : Diagnostic (objet complet mis à jour)
         */
        case "UPDATE_DIAGNOSTIC":
            return {
                ...state,
                diagnostics: state.diagnostics.map((d) =>
                    d.id === action.payload.id ? action.payload : d
                ),
            };

        /**
         * payload : { id: string }
         */
        case "DELETE_DIAGNOSTIC":
            return {
                ...state,
                diagnostics: state.diagnostics.filter(
                    (d) => d.id !== action.payload.id
                ),
            };

        // ── Passations ────────────────────────────────────────────────────
        /**
         * payload : PassationEleve
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
                        (r) => r.exercice_numero !== action.payload.reponse.exercice_numero
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
                        ? { ...p, statut: "terminee", date_fin: action.payload.date_fin }
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
                                ? { ...r, biais_manuel: action.payload.biais_manuel, a_relire: false }
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
         * Fusionne des passations importées depuis un appareil élève (Phase 3).
         * Règle : passation la plus complète gagne ; à égalité, la plus récente.
         * payload : { passations: PassationEleve[] }
         */
        case "FUSIONNER_PASSATIONS": {
            const existantes = [...state.passations];
            for (const importee of action.payload.passations) {
                const idx = existantes.findIndex(
                    (p) =>
                        p.eleve_id === importee.eleve_id &&
                        p.diagnostic_id === importee.diagnostic_id
                );
                if (idx === -1) {
                    existantes.push(importee);
                } else {
                    const existante = existantes[idx];
                    const garderImportee =
                        importee.reponses.length > existante.reponses.length ||
                        (importee.reponses.length === existante.reponses.length &&
                            importee.date_fin > existante.date_fin);
                    if (garderImportee) existantes[idx] = importee;
                }
            }
            return { ...state, passations: existantes };
        }

        // ── Reset annuel ──────────────────────────────────────────────────
        /**
         * Remet l'application à l'état initial (début d'année scolaire).
         * Toujours précédé d'un export JSON (SRS F-EXP-04).
         */
        case "RESET_ALL":
            return { ...initialState, _hydrated: true };

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
                config:      getItem(KEYS.config),
                classes:     getItem(KEYS.classes),
                diagnostics: getItem(KEYS.diagnostics),
                passations:  getItem(KEYS.passations),
            },
        });
    }, []);

    // ── Persistence à chaque changement (sauf avant hydratation) ──────────
    useEffect(() => {
        if (!state._hydrated) return;
        setItem(KEYS.config,      state.config);
        setItem(KEYS.classes,     state.classes);
        setItem(KEYS.diagnostics, state.diagnostics);
        setItem(KEYS.passations,  state.passations);
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
