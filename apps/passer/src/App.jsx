/**
 * @fileoverview App — Interface passation (squelette Sprint 0).
 *
 * Ce composant sera entièrement développé au Sprint 3.
 * Il sert uniquement à valider que l'application se charge
 * correctement sur /fractions-diagnostic/passer/.
 *
 * @module App
 */

/**
 * Composant racine de l'interface passation.
 * Squelette — sera remplacé au Sprint 3.
 *
 * @returns {JSX.Element}
 */
export default function App() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center p-8">
                <div
                    className="w-20 h-20 rounded-full bg-emerald-100 flex items-center
                               justify-center text-3xl font-bold text-emerald-700
                               mx-auto mb-6 select-none"
                    aria-hidden="true"
                >
                    ½
                </div>
                <h1 className="text-xl font-semibold text-slate-800 mb-2">
                    Interface passation
                </h1>
                <p className="text-sm text-slate-500">
                    Sprint 0 — Structure vérifiée. Développement au Sprint 3.
                </p>
            </div>
        </div>
    );
}
