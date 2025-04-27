import {
  complex as mathjsComplex,
  add,
  subtract,
  multiply,
  divide,
  conj as mathjsConj,
  abs,
  isComplex,
} from 'mathjs';

function normalize(n: number): number {
  return Object.is(n, -0) ? 0 : n;
}

// ComplexNum uses mathjs internally for calculations
// Removed 'implements Complex' as it's not fully implemented
export class ComplexNum {
  public re: number;
  public im: number;

  constructor(re: number, im: number) {
    // Normalize inputs
    this.re = normalize(re);
    this.im = normalize(im);
  }

  // Static methods return new instances of *our* ComplexNum
  // Changed parameter types from Complex to ComplexNum
  static add(a: ComplexNum, b: ComplexNum): ComplexNum {
    const result = add(mathjsComplex(a.re, a.im), mathjsComplex(b.re, b.im));
    return new ComplexNum(result.re, result.im);
  }
  static sub(a: ComplexNum, b: ComplexNum): ComplexNum {
    const result = subtract(mathjsComplex(a.re, a.im), mathjsComplex(b.re, b.im));
    return new ComplexNum(result.re, result.im);
  }
  static mul(a: ComplexNum, b: ComplexNum): ComplexNum {
    const result = multiply(mathjsComplex(a.re, a.im), mathjsComplex(b.re, b.im));
    if (!isComplex(result)) throw new Error('Expected complex result from multiply');
    return new ComplexNum(result.re, result.im);
  }
  static div(a: ComplexNum, b: ComplexNum): ComplexNum {
    const result = divide(mathjsComplex(a.re, a.im), mathjsComplex(b.re, b.im));
    if (!isComplex(result)) throw new Error('Expected complex result from divide');
    return new ComplexNum(result.re, result.im);
  }
  static conj(a: ComplexNum): ComplexNum {
    const result = mathjsConj(mathjsComplex(a.re, a.im));
    return new ComplexNum(result.re, result.im);
  }
  // abs2 returns a number, so we calculate it directly or use mathjs abs
  static abs2(a: ComplexNum): number {
     // return a.re * a.re + a.im * a.im; // Original direct calculation
     const complexA = mathjsComplex(a.re, a.im);
     const absVal = abs(complexA);
     // abs returns a number or BigNumber, ensure it's a number for squaring
     if (typeof absVal !== 'number') throw new Error('Expected number result from abs');
     return absVal * absVal; // Square the absolute value
  }
  static zero(): ComplexNum {
    return new ComplexNum(0, 0);
  }
  static one(): ComplexNum {
    return new ComplexNum(1, 0);
  }
  static fromReal(r: number): ComplexNum {
    return new ComplexNum(r, 0);
  }

  toString(): string {
    return `${this.re} + ${this.im}i`;
  }
} 