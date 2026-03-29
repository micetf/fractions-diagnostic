/**
 * @fileoverview Figures SVG pour CE1 Ex.2 — Quelle fraction est coloriée ?
 *
 * A : bande partagée en 5 parts égales, 2 parts coloriées → attendu 2/5
 * B : disque partagé en 6 parts égales, 1 part coloriée  → attendu 1/6
 * C : carré partagé en 8 triangles égaux, 3 coloriés     → attendu 3/8
 */

import BandeColoriee from "./BandeColoriee";
import DisqueColorie from "./DisqueColorie";
import CarreColorie from "./CarreColorie";

export const figuresCE1Ex2 = {
    A: <BandeColoriee n={5} k={2} />,
    B: <DisqueColorie n={6} k={1} />,
    C: <CarreColorie n={8} k={3} />,
};
