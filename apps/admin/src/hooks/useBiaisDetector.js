import { detecterBiais } from "@/utils/biaisDetector";

/**
 * useBiaisDetector
 *
 * Hook exposant la fonction de détection des biais.
 * Encapsule l'import pour faciliter un futur remplacement
 * ou une extension (mémorisation, asynchronisme, etc.).
 *
 * Utilisation dans PassationRunner :
 *   const { detecter } = useBiaisDetector()
 *   const codes = detecter(exercice, valeurBrute)
 *
 * @returns {{ detecter: function }}
 */
export function useBiaisDetector() {
    return { detecter: detecterBiais };
}
