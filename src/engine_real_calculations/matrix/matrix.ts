// Generic Complex matrix class
import { Complex, ComplexNum } from '../types/complex';
import { kroneckerMatrix } from '../utils/tensor';

export class Matrix {
  readonly rows: number;
  readonly cols: number;
  readonly data: Complex[][];

  constructor(data: Complex[][]) {
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
    const data: Complex[][] = [];
    for (let i = 0; i < rows; i++) {
      data[i] = Array(cols).fill(z);
    }
    return new Matrix(data);
  }

  static identity(size: number): Matrix {
    const data: Complex[][] = [];
    for (let i = 0; i < size; i++) {
      data[i] = [];
      for (let j = 0; j < size; j++) {
        data[i][j] = ComplexNum.fromReal(i === j ? 1 : 0);
      }
    }
    return new Matrix(data);
  }

  get(i: number, j: number): Complex {
    return this.data[i][j];
  }

  set(i: number, j: number, v: Complex): void {
    this.data[i][j] = { re: v.re, im: v.im };
  }

  add(other: Matrix): Matrix {
    return this.zip(other, (a, b) => ComplexNum.add(a, b));
  }

  map(fn: (val: Complex, i: number, j: number) => Complex): Matrix {
    const data: Complex[][] = [];
    for (let i = 0; i < this.rows; i++) {
      data[i] = [];
      for (let j = 0; j < this.cols; j++) {
        data[i][j] = fn(this.data[i][j], i, j);
      }
    }
    return new Matrix(data);
  }

  zip(other: Matrix, fn: (a: Complex, b: Complex, i: number, j: number) => Complex): Matrix {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error('Matrix dimensions must match for zip');
    }
    const data: Complex[][] = [];
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

  trace(): Complex {
    if (this.rows !== this.cols) {
      throw new Error('Matrix must be square to compute trace');
    }
    let sum = ComplexNum.zero();
    for (let i = 0; i < this.rows; i++) {
      sum = ComplexNum.add(sum, this.get(i, i));
    }
    return sum;
  }

  scale(s: Complex): Matrix {
    return this.map(val => ComplexNum.mul(val, s));
  }
} 