import { Matrix } from './matrix';
import { ComplexNum } from '../types/complex';

/**
 * DensityMatrix extends Matrix for quantum density operators (2^n x 2^n)
 */
export class DensityMatrix extends Matrix {
  constructor(data: ComplexNum[][]) {
    super(data);
    if (this.rows !== this.cols) {
      throw new Error('DensityMatrix must be square');
    }
    const n = Math.log2(this.rows);
    if (!Number.isInteger(n)) {
      throw new Error('DensityMatrix dimension must be a power of 2');
    }
    // ensure normalized
    this.normalize();
  }

  /** Normalize the density matrix so trace = 1 */
  normalize(): this {
    const tr = this.trace();
    const inv = 1 / tr.re;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const elt = this.get(i, j);
        this.set(i, j, ComplexNum.mul(elt, ComplexNum.fromReal(inv)));
      }
    }
    return this;
  }

  /** Validate trace≈1 and hermiticity */
  validate(epsilon = 1e-8): boolean {
    const tr = this.trace();
    if (Math.abs(tr.re - 1) > epsilon || Math.abs(tr.im) > epsilon) {
      return false;
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const a = this.get(i, j);
        const b = this.get(j, i);
        const conj = ComplexNum.conj(a);
        if (Math.abs(conj.re - b.re) > epsilon || Math.abs(conj.im - b.im) > epsilon) {
          return false;
        }
      }
    }
    return true;
  }

  /** Create a density matrix from a state vector | psi>< psi| */
  static fromStateVector(vec: ComplexNum[]): DensityMatrix {
    const N = vec.length;
    const n = Math.log2(N);
    if (!Number.isInteger(n)) {
      throw new Error('State vector length must be a power of 2');
    }
    const data: ComplexNum[][] = [];
    for (let i = 0; i < N; i++) {
      data[i] = [];
      for (let j = 0; j < N; j++) {
        data[i][j] = ComplexNum.mul(vec[i], ComplexNum.conj(vec[j]));
      }
    }
    return new DensityMatrix(data).normalize();
  }

  /** Bell state |\u03C6+> = (|00> + |11>)/√2 */
  static bellPhiPlus(): DensityMatrix {
    const s = 1 / Math.sqrt(2);
    const vec = [ComplexNum.fromReal(s), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.fromReal(s)];
    return DensityMatrix.fromStateVector(vec);
  }

  /** Bell state |\u03C6-> = (|00> - |11>)/√2 */
  static bellPhiMinus(): DensityMatrix {
    const s = 1 / Math.sqrt(2);
    // TODO verify that we can use this syntax instead of creating a new object
    const vec = [ComplexNum.fromReal(s), ComplexNum.zero(), ComplexNum.zero(), { re: -s, im: 0 }];
    return DensityMatrix.fromStateVector(vec);
  }

  /** Bell state |\u03C8+> = (|01> + |10>)/√2 */
  static bellPsiPlus(): DensityMatrix {
    const s = 1 / Math.sqrt(2);
    const vec = [ComplexNum.zero(), ComplexNum.fromReal(s), ComplexNum.fromReal(s), ComplexNum.zero()];
    return DensityMatrix.fromStateVector(vec);
  }

  /** Bell state |\u03C8-> = (|01> - |10>)/√2 */
  static bellPsiMinus(): DensityMatrix {
    const s = 1 / Math.sqrt(2);
    // TODO verify that we can use this syntax instead of creating a new object
    const vec = [ComplexNum.zero(), ComplexNum.fromReal(s), { re: -s, im: 0 }, ComplexNum.zero()];
    return DensityMatrix.fromStateVector(vec);
  }

  /** Tensor product of two density matrices */
  static tensor(a: DensityMatrix, b: DensityMatrix): DensityMatrix {
    const m = a.tensor(b);
    return new DensityMatrix(m.data);
  }
} 