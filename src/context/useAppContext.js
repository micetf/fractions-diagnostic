import { useContext } from "react";
import AppContext from "./AppContext";

/**
 * useAppContext
 *
 * Hook consommateur de l'état global.
 * À utiliser dans tout composant ayant besoin de l'état ou du dispatch.
 * Lance une erreur explicite si appelé hors du AppContextProvider.
 *
 * @returns {{ state: object, dispatch: function }}
 */
export function useAppContext() {
    const ctx = useContext(AppContext);
    if (!ctx) {
        throw new Error(
            "useAppContext doit être utilisé à l'intérieur de AppContextProvider"
        );
    }
    return ctx;
}
