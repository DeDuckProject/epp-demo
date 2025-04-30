// Generic ComplexNum matrix class
import { ComplexNum } from '../types/complex';
import { kroneckerMatrix } from '../utils/tensor';

export class Matrix {
  readonly rows: number;
  readonly cols: number;
  readonly data: ComplexNum[][];

  constructor(data: ComplexNum[][]) {
    if (data.length === 0 || data[0].length === 0) {
      throw new Error('Matrix cannot have zero dimensions');
    }
    this.rows = data.length;
    this.cols = data[0].length;
    // ensure rectangular
    for (const row of data) {
      if (row.length !== this.cols) {
        throw new Error('All rows must have the same length');
      }
    }
    this.data = data.map(row => row.map(val => ({ re: val.re, im: val.im })));
  }

  static zeros(rows: number, cols: number): Matrix {
    const z = ComplexNum.zero();
    const data: ComplexNum[][] = [];
    for (let i = 0; i < rows; i++) {
      data[i] = Array(cols).fill(z);
    }
    return new Matrix(data);
  }

  static identity(size: number): Matrix {
    const data: ComplexNum[][] = [];
    for (let i = 0; i < size; i++) {
      data[i] = [];
      for (let j = 0; j < size; j++) {
        data[i][j] = ComplexNum.fromReal(i === j ? 1 : 0);
      }
    }
    return new Matrix(data);
  }

  get(i: number, j: number): ComplexNum {
    return this.data[i][j];
  }

  set(i: number, j: number, v: ComplexNum): void {
    this.data[i][j] = { re: v.re, im: v.im };
  }

  add(other: Matrix): Matrix {
    return this.zip(other, (a, b) => ComplexNum.add(a, b));
  }

  map(fn: (val: ComplexNum, i: number, j: number) => ComplexNum): Matrix {
    const data: ComplexNum[][] = [];
    for (let i = 0; i < this.rows; i++) {
      data[i] = [];
      for (let j = 0; j < this.cols; j++) {
        data[i][j] = fn(this.data[i][j], i, j);
      }
    }
    return new Matrix(data);
  }

  zip(other: Matrix, fn: (a: ComplexNum, b: ComplexNum, i: number, j: number) => ComplexNum): Matrix {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error('Matrix dimensions must match for zip');
    }
    const data: ComplexNum[][] = [];
    for (let i = 0; i < this.rows; i++) {
      data[i] = [];
      for (let j = 0; j < this.cols; j++) {
        data[i][j] = fn(this.data[i][j], other.data[i][j], i, j);
      }
    }
    return new Matrix(data);
  }

  mul(other: Matrix): Matrix {
    if (this.cols !== other.rows) {
      throw new Error('Matrix dimensions do not align for multiplication');
    }
    const result = Matrix.zeros(this.rows, other.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < other.cols; j++) {
        let sum = ComplexNum.zero();
        for (let k = 0; k < this.cols; k++) {
          const prod = ComplexNum.mul(this.get(i, k), other.get(k, j));
          sum = ComplexNum.add(sum, prod);
        }
        result.set(i, j, sum);
      }
    }
    return result;
  }

  dagger(): Matrix {
    const result = Matrix.zeros(this.cols, this.rows);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.set(j, i, ComplexNum.conj(this.get(i, j)));
      }
    }
    return result;
  }

  tensor(other: Matrix): Matrix {
    const data = kroneckerMatrix(this.data, other.data);
    return new Matrix(data);
  }

  trace(): ComplexNum {
    if (this.rows !== this.cols) {
      throw new Error('Matrix must be square to compute trace');
    }
    let sum = ComplexNum.zero();
    for (let i = 0; i < this.rows; i++) {
      sum = ComplexNum.add(sum, this.get(i, i));
    }
    return sum;
  }

  scale(s: ComplexNum): Matrix {
    return this.map(val => ComplexNum.mul(val, s));
  }

  // Added method to compare matrices up to a global phase
  equalsUpToGlobalPhase(other: Matrix, tolerance: number = 1e-10): boolean {
    if (this.rows !== other.rows || this.cols !== other.cols) return false;

    let factor: { re: number, im: number } | null = null;
    // First, find a non-negligible element in 'other' to compute the global phase factor
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const b = other.get(i, j);
        if (Math.abs(b.re) > tolerance || Math.abs(b.im) > tolerance) {
          const a = this.get(i, j);
          const denom = b.re * b.re + b.im * b.im;
          factor = { 
            re: (a.re * b.re + a.im * b.im) / denom, 
            im: (a.im * b.re - a.re * b.im) / denom 
          };
          break;
        }
      }
      if (factor) break;
    }

    // If 'other' is the zero matrix (within tolerance), then 'this' must also be zero
    if (!factor) return true;

    // Check that for every element, this.get(i,j) ≈ factor * other.get(i,j)
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const a = this.get(i, j);
        const b = other.get(i, j);
        const fb = { 
          re: factor.re * b.re - factor.im * b.im, 
          im: factor.re * b.im + factor.im * b.re 
        };
        if (Math.abs(a.re - fb.re) > tolerance || Math.abs(a.im - fb.im) > tolerance) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Checks if this matrix is equal to another matrix within a specified tolerance.
   * @param other The matrix to compare with.
   * @param tolerance The maximum allowed difference between corresponding elements.
   * @returns True if matrices are equal within tolerance, false otherwise.
   */
  equals(other: Matrix, tolerance: number = 1e-10): boolean {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      return false;
    }
    
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const a = this.get(i, j);
        const b = other.get(i, j);
        if (Math.abs(a.re - b.re) > tolerance || Math.abs(a.im - b.im) > tolerance) {
          return false;
        }
      }
    }
    return true;
  }
} 