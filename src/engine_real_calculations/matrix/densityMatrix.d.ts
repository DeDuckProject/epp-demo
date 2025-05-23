import { Matrix } from './matrix';
import { ComplexNum } from '../types/complex';
/**
 * DensityMatrix extends Matrix for quantum density operators (2^n x 2^n)
 */
export declare class DensityMatrix extends Matrix {
    constructor(data: ComplexNum[][] | Matrix);
    /** Normalize the density matrix so trace = 1 */
    normalize(): this;
    /** Validate trace≈1 and hermiticity */
    validate(epsilon?: number): boolean;
    /** Create a density matrix from a state vector | psi>< psi| */
    static fromStateVector(vec: ComplexNum[]): DensityMatrix;
    /** Bell state |\u03C6+> = (|00> + |11>)/√2 */
    static bellPhiPlus(): DensityMatrix;
    /** Bell state |\u03C6-> = (|00> - |11>)/√2 */
    static bellPhiMinus(): DensityMatrix;
    /** Bell state |\u03C8+> = (|01> + |10>)/√2 */
    static bellPsiPlus(): DensityMatrix;
    /** Bell state |\u03C8-> = (|01> - |10>)/√2 */
    static bellPsiMinus(): DensityMatrix;
    /** Tensor product of two density matrices */
    static tensor(a: DensityMatrix, b: DensityMatrix): DensityMatrix;
}
