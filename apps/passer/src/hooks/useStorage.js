/**
 * @fileoverview Abstraction du localStorage — Interface passation.
 *
 * Wrapper vers @fractions-diagnostic/shared/storage.
 * Expose les clés PASSER_KEYS préfixées `fractions-passer_` (SRS §6.2).
 *
 * @module hooks/useStorage
 */
export {
    getItem,
    setItem,
    removeItem,
    clearPrefix,
    PASSER_KEYS as KEYS,
    PASSER_PREFIX as KEY_PREFIX,
} from "@fractions-diagnostic/shared/storage";
