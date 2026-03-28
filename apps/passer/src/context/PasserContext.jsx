/**
 * @fileoverview PasserContext — état global de l'interface passation.
 *
 * Stocke :
 *   - Le diagnostic actif (chargé depuis un fichier config ou depuis
 *     le localStorage admin si mono-appareil)
 *   - Les passations de cet appareil
 *
 * Préfixe localStorage : fractions-passer_ (SRS §6.2)
 *
 * @module context/PasserContext
 */

import { createContext, useReducer, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { getItem, setItem, KEYS } from "@/hooks/useStorage";

// ─── Clés admin (lecture seule en mono-appareil) ──────────────────────────────

const ADMIN_DIAG_KEY = "fractions-admin_diagnostics";
const ADMIN_CLASSES_KEY = "fractions-admin_classes";

// ─── État initial ─────────────────────────────────────────────────────────────

const initialState = {
    /** @type {import('@fractions-diagnostic/shared/types').FichierConfig|null} */
    diagnostic: null,
    /** @type {import('@fractions-diagnostic/shared/types').PassationEleve[]} */
    passations: [],
    _hydrated: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function passerReducer(state, action) {
    switch (action.type) {

        case "HYDRATE":
            return {
                ...state,
                diagnostic: action.payload.diagnostic ?? null,
                passations: action.payload.passations ?? [],
                _hydrated: true,
            };

        /**
         * Charge la configuration depuis un fichier importé (Phase 1).
         * payload : FichierConfig
         */
        case "CHARGER_CONFIG":
            return {
                ...state,
                diagnostic: action.payload,
                passations: [],
            };

        /**
         * Crée une nouvelle passation pour un élève.
         * payload : PassationEleve
         */
        case "CREATE_PASSATION":
            return {
                ...state,
                passations: [...state.passations, action.payload],
            };

        /**
         * Enregistre ou remplace la réponse à un exercice.
         * payload : { passation_id: string, reponse: ReponseExercice }
         */
        case "SAVE_REPONSE":
            return {
                ...state,
                passations: state.passations.map((p) => {
                    if (p.id !== action.payload.passation_id) return p;
                    const autres = p.reponses.filter(
                        (r) => r.exercice_numero !== action.payload.reponse.exercice_numero
                    );
                    return { ...p, reponses: [...autres, action.payload.reponse] };
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
         * Efface les données locales après export (RGPD, SRS NF-SEC-05).
         */
        case "EFFACER_LOCAL":
            return { ...state, diagnostic: null, passations: [] };

        default:
            return state;
    }
}

// ─── Contexte ─────────────────────────────────────────────────────────────────

const PasserContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * @param {object}          props
 * @param {React.ReactNode} props.children
 */
export function PasserContextProvider({ children }) {
    const [state, dispatch] = useReducer(passerReducer, initialState);

    // ── Hydratation ───────────────────────────────────────────────────────────
    useEffect(() => {
        let diagnostic = getItem(KEYS.diagnostic);

        // Mono-appareil : si pas de config passer, chercher dans l'admin
        if (!diagnostic) {
            const adminDiags = getItem(ADMIN_DIAG_KEY);
            const adminClasses = getItem(ADMIN_CLASSES_KEY);
            if (Array.isArray(adminDiags) && adminDiags.length > 0) {
                // Prendre le diagnostic le plus récent
                const diag = [...adminDiags].sort(
                    (a, b) => new Date(b.date_creation) - new Date(a.date_creation)
                )[0];
                const classe = adminClasses?.find((c) => c.id === diag.classe_id);
                if (classe) {
                    diagnostic = {
                        type: "fractions-config",
                        version: "2.0",
                        exported_at: diag.date_creation,
                        diagnostic_id: diag.id,
                        niveau: diag.niveau,
                        exercices_selectionnes: diag.exercices_selectionnes,
                        eleves: classe.eleves.map((e) => ({
                            id: e.id,
                            prenom: e.prenom,
                        })),
                    };
                }
            }
        }

        dispatch({
            type: "HYDRATE",
            payload: {
                diagnostic,
                passations: getItem(KEYS.passations),
            },
        });
    }, []);

    // ── Persistence ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (!state._hydrated) return;
        setItem(KEYS.diagnostic, state.diagnostic);
        setItem(KEYS.passations, state.passations);
    }, [state]);

    return (
        <PasserContext.Provider value={{ state, dispatch }}>
            {children}
        </PasserContext.Provider>
    );
}

PasserContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

// ─── Hook consommateur ────────────────────────────────────────────────────────

/**
 * @returns {{ state: object, dispatch: function }}
 */
export function usePasserContext() {
    const ctx = useContext(PasserContext);
    if (!ctx) {
        throw new Error(
            "usePasserContext doit être utilisé à l'intérieur de PasserContextProvider"
        );
    }
    return ctx;
}

export default PasserContext;
