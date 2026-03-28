/**
 * @fileoverview useBiaisDetector — hook de détection des biais.
 *
 * Délègue au moteur partagé @fractions-diagnostic/engine.
 *
 * @module hooks/useBiaisDetector
 */
import { detecterBiais } from "@fractions-diagnostic/engine/biaisDetector";

/**
 * @returns {{ detecter: function }}
 */
export function useBiaisDetector() {
    return { detecter: detecterBiais };
}
