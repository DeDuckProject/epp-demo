import { ComplexNum } from '../types/complex';
export declare class Matrix {
    readonly rows: number;
    readonly cols: number;
    readonly data: ComplexNum[][];
    constructor(data: ComplexNum[][]);
    static zeros(rows: number, cols: number): Matrix;
    static identity(size: number): Matrix;
    get(i: number, j: number): ComplexNum;
    set(i: number, j: number, v: ComplexNum): void;
    add(other: Matrix): Matrix;
    map(fn: (val: ComplexNum, i: number, j: number) => ComplexNum): Matrix;
    zip(other: Matrix, fn: (a: ComplexNum, b: ComplexNum, i: number, j: number) => ComplexNum): Matrix;
    mul(other: Matrix): Matrix;
    dagger(): Matrix;
    tensor(other: Matrix): Matrix;
    trace(): ComplexNum;
    scale(s: ComplexNum): Matrix;
    equalsUpToGlobalPhase(other: Matrix, tolerance?: number): boolean;
    /**
     * Checks if this matrix is equal to another matrix within a specified tolerance.
     * @param other The matrix to compare with.
     * @param tolerance The maximum allowed difference between corresponding elements.
     * @returns True if matrices are equal within tolerance, false otherwise.
     */
    equals(other: Matrix, tolerance?: number): boolean;
    toString(): string;
}
