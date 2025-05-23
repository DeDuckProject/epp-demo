export declare class ComplexNum {
    re: number;
    im: number;
    constructor(re: number, im: number);
    static add(a: ComplexNum, b: ComplexNum): ComplexNum;
    static sub(a: ComplexNum, b: ComplexNum): ComplexNum;
    static mul(a: ComplexNum, b: ComplexNum): ComplexNum;
    static div(a: ComplexNum, b: ComplexNum): ComplexNum;
    static conj(a: ComplexNum): ComplexNum;
    static abs2(a: ComplexNum): number;
    static zero(): ComplexNum;
    static one(): ComplexNum;
    static fromReal(r: number): ComplexNum;
    toString(): string;
}
export type Complex = ComplexNum;
