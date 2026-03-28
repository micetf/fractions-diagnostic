import PropTypes from "prop-types";
import { useAppContext } from "@/context/useAppContext";

/**
 * AccueilEnseignant
 *
 * Tableau de bord principal de l'interface admin.
 * Adapté au modèle v2.0 : Diagnostic sans cycle de vie (SRS F-DIA-06).
 *
 * @param {object}   props
 * @param {function} props.onNavigate - Navigation interne enseignant.
 */
function AccueilEnseignant({ onNavigate }) {
    const { state } = useAppContext();

    const nbDiagnostics = state.diagnostics.length;

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-semibold text-slate-800 mb-1">
                Tableau de bord
            </h1>
            <p className="text-sm text-slate-500 mb-8">
                Gérez vos classes, créez des diagnostics et analysez les
                résultats.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NavCard
                    titre="Mes classes"
                    description="Créer et gérer les classes et les élèves."
                    onClick={() => onNavigate("classes")}
                    actif
                />

                <NavCard
                    titre="Diagnostics"
                    description="Historique et gestion des diagnostics."
                    onClick={() => onNavigate("diagnostics")}
                    actif
                    badge={
                        nbDiagnostics > 0
                            ? `${nbDiagnostics} diagnostic${nbDiagnostics > 1 ? "s" : ""}`
                            : null
                    }
                />

                <NavCard
                    titre="Nouveau diagnostic"
                    description="Sélectionner les exercices et préparer la passation."
                    onClick={() => onNavigate("creer-diagnostic")}
                    actif
                    accent
                />

                <NavCard
                    titre="Analyse des résultats"
                    description="Matrice de résultats, profils élèves, biais détectés."
                    onClick={() => onNavigate("diagnostics")}
                    actif
                />

                <NavCard
                    titre="Export / Import"
                    description="Sauvegarder, partager et restaurer les données."
                    onClick={() => onNavigate("export-import")}
                    actif
                />
            </div>
        </div>
    );
}

AccueilEnseignant.propTypes = {
    onNavigate: PropTypes.func.isRequired,
};

/* ── Sous-composant ─────────────────────────────────────────────────── */

/**
 * NavCard
 *
 * @param {object}      props
 * @param {string}      props.titre
 * @param {string}      props.description
 * @param {boolean}     [props.actif=false]
 * @param {boolean}     [props.accent=false]
 * @param {function}    [props.onClick]
 * @param {string|null} [props.badge]
 */
function NavCard({
    titre,
    description,
    actif = false,
    accent = false,
    onClick = undefined,
    badge = undefined,
}) {
    const base =
        "rounded-xl border p-5 flex flex-col gap-2 transition-colors text-left";

    if (actif) {
        const color = accent
            ? "bg-brand-500 border-brand-600 hover:bg-brand-600 text-white"
            : "bg-white border-brand-200 hover:bg-brand-50 hover:border-brand-300";
        return (
            <button
                onClick={onClick}
                className={`${base} ${color} cursor-pointer w-full`}
            >
                <div className="flex items-start justify-between gap-2">
                    <span
                        className={`font-semibold ${accent ? "text-white" : "text-slate-800"}`}
                    >
                        {titre}
                    </span>
                    {badge && (
                        <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0
                            ${
                                accent
                                    ? "bg-white/20 text-white"
                                    : "bg-brand-100 text-brand-700"
                            }`}
                        >
                            {badge}
                        </span>
                    )}
                </div>
                <span
                    className={`text-sm ${accent ? "text-white/80" : "text-slate-500"}`}
                >
                    {description}
                </span>
            </button>
        );
    }

    return (
        <div
            className={`${base} bg-white border-slate-200 opacity-50 cursor-not-allowed select-none`}
        >
            <span className="font-semibold text-slate-700">{titre}</span>
            <span className="text-sm text-slate-500">{description}</span>
        </div>
    );
}

NavCard.propTypes = {
    titre: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    actif: PropTypes.bool,
    accent: PropTypes.bool,
    onClick: PropTypes.func,
    badge: PropTypes.string,
};

export default AccueilEnseignant;
