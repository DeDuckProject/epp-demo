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
    const epsilon = 1e-12; // Tolerance for checking zero/one

    // Validate the trace before proceeding
    if (isNaN(tr.re) || isNaN(tr.im) || !isFinite(tr.re) || !isFinite(tr.im)) {
      console.error('DensityMatrix.normalize: Trace calculation resulted in NaN or Infinity.', tr);
      throw new Error('Cannot normalize matrix with invalid (NaN/Infinity) trace.');
    }

    // Check if trace real part is effectively zero
    if (Math.abs(tr.re) < epsilon) {
       // Avoid division by zero. If the trace is zero, the matrix is likely invalid or zero itself.
       // If trace is purely imaginary and non-zero, it's also not a valid density matrix trace.
      if (Math.abs(tr.im) < epsilon) {
        // Trace is effectively zero (0 + 0i). Normalization is meaningless/impossible.
        // This often happens if the matrix itself is all zeros.
        // Depending on context, could return 'this' or throw.
        // Throwing is safer as trace=1 is expected.
        //  console.warn('DensityMatrix.normalize: Trace is zero. Matrix remains unnormalized.', this.data);
         // Or throw: throw new Error('Cannot normalize matrix with zero trace.');
         return this; // Keep it as is for now, but this might hide issues.
      } else {
         // Trace is purely imaginary (0 + yi, y!=0). Invalid for density matrix.
          throw new Error(`Cannot normalize matrix with purely imaginary trace: ${tr}`);
      }
    }
    
    // Optional: Check if trace imaginary part is non-zero (Density matrix trace should be real)
    if (Math.abs(tr.im) > epsilon) {
        console.warn(`DensityMatrix.normalize: Trace has non-zero imaginary part (${tr.im}). Proceeding with normalization based on real part only.`);
        // Depending on strictness, could throw: throw new Error(`Density matrix trace must be real, found ${tr}`);
    }

    // Check if already normalized to avoid unnecessary calculations and potential precision loss
    if (Math.abs(tr.re - 1) < epsilon && Math.abs(tr.im) < epsilon) {
      return this; // Already normalized
    }

    // Proceed with normalization using the real part of the trace
    const inv = 1 / tr.re;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const elt = this.get(i, j);
        const normalizedElt = ComplexNum.mul(elt, ComplexNum.fromReal(inv));
        // Add check for NaN/Infinity post-multiplication as an extra safeguard
        if (isNaN(normalizedElt.re) || isNaN(normalizedElt.im) || !isFinite(normalizedElt.re) || !isFinite(normalizedElt.im)) {
             console.error(`DensityMatrix.normalize: Normalization step resulted in NaN/Infinity at [${i},${j}]`, { elt, inv, tr });
             throw new Error(`Normalization resulted in NaN/Infinity at [${i},${j}] during multiplication.`);
        }
        this.set(i, j, normalizedElt);
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