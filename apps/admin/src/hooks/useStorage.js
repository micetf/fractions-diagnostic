/**
 * @fileoverview Abstraction du localStorage — Interface admin.
 *
 * Wrapper vers @fractions-diagnostic/shared/storage.
 * Ré-exporte les helpers universels (getItem, setItem, removeItem)
 * et expose les clés ADMIN_KEYS préfixées `fractions-admin_` (SRS §6.1).
 *
 * AppContext est le seul appelant légitime de setItem et removeItem.
 *
 * @module hooks/useStorage
 */
export {
    getItem,
    setItem,
    removeItem,
    clearPrefix,
    ADMIN_KEYS as KEYS,
    ADMIN_PREFIX as KEY_PREFIX,
} from "@fractions-diagnostic/shared/storage";
