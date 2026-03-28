/**
 * @fileoverview Point d'entrée React — Interface passation.
 *
 * URL : https://micetf.fr/fractions-diagnostic/passer/
 *
 * Cette application est entièrement dédiée à la passation des exercices.
 * Elle ne contient aucune logique d'authentification (PIN),
 * aucun accès aux données d'analyse, et aucun lien vers l'interface admin.
 * (SRS F-PAS-01, NF-SEC-06)
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>
);
