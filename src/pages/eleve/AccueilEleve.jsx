import PropTypes from "prop-types";
import PinGate from "@/components/common/PinGate";
import { useState } from "react";

/**
 * AccueilEleve
 *
 * Page d'accueil du mode élève.
 * Sprint 0 : squelette.
 * Sprint 3 : bouton "Appelle ton enseignant(e)" → PinGate vérification.
 *
 * Le sélecteur d'élève et PassationRunner arrivent en S11–S12.
 *
 * Contrainte SRS NF-UX-01 : police ≥ 16 px.
 *
 * @param {object}   props
 * @param {function} props.onCallTeacher - Succès du PIN → retour mode enseignant.
 */
function AccueilEleve({ onCallTeacher }) {
    const [showPin, setShowPin] = useState(false);

    if (showPin) {
        return <PinGate mode="verify" onSuccess={onCallTeacher} />;
    }

    return (
        <div className="min-h-[calc(100vh-88px)] flex flex-col items-center justify-center px-4 py-10">
            <div
                className="w-full max-w-sm bg-white rounded-2xl shadow-sm
                      border border-brand-100 p-8 flex flex-col items-center gap-6 text-center"
            >
                {/* Symbole décoratif */}
                <div
                    className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center
                     font-display font-bold text-4xl text-brand-600 select-none"
                    aria-hidden="true"
                >
                    ½
                </div>

                <div>
                    <h1 className="font-display font-bold text-2xl text-slate-800 leading-snug">
                        Exercices sur les fractions
                    </h1>
                    <p className="mt-2 text-base text-slate-500">
                        Ton enseignant(e) va préparer les exercices pour toi.
                    </p>
                </div>

                {/* Placeholder passation — activé en S11 */}
                <button
                    disabled
                    className="w-full py-3 rounded-xl text-base font-semibold
                     bg-brand-200 text-brand-400 cursor-not-allowed"
                >
                    En attente de la session…
                </button>
            </div>

            {/* Bouton retour enseignant — visible en bas de page */}
            <div className="mt-10 text-center">
                <p className="text-sm text-slate-400 mb-3">Tu as terminé ?</p>
                <button
                    onClick={() => setShowPin(true)}
                    className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600
                     text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                    Appelle ton enseignant(e)
                </button>
            </div>
        </div>
    );
}

AccueilEleve.propTypes = {
    onCallTeacher: PropTypes.func.isRequired,
};

export default AccueilEleve;
