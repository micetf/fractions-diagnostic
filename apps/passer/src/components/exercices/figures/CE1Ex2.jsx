/**
 * @fileoverview Figures SVG pour CE1 Ex.2 — Quelle fraction est coloriée ?
 *
 * Source : exercices diagnostiques CE1, exercice 2.
 *
 * A : bande partagée en 5 parts égales, 2 parts coloriées → attendu 2/5
 * B : disque partagé en 6 parts égales, 1 part coloriée  → attendu 1/6
 * C : bande partagée en 8 parts égales, 3 parts coloriées → attendu 3/8
 */

import BandeColoriee from "./BandeColoriee";
import DisqueCoupes from "./DisqueCoupes";
import TangramCarre from "./TangramCarre";

export const figuresCE1Ex2 = {
    A: <BandeColoriee n={5} k={2} />,
    B: <DisqueCoupes n={6} k={1} />,
    C: <TangramCarre n={8} k={3} />,
};
