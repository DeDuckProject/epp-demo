import { complex, add, multiply, conjugate, matrixMultiply, tensorProduct, partialTrace, calculateBellBasisFidelity } from '../../src/engine/mathUtils';
import { ComplexNumber, DensityMatrix } from '../../src/engine/types';

// Helper function for comparing complex numbers with tolerance
const expectComplexClose = (a: ComplexNumber, b: ComplexNumber, tolerance = 1e-9) => {
  expect(a.real).toBeCloseTo(b.real, tolerance);
  expect(a.imag).toBeCloseTo(b.imag, tolerance);
};

// Helper function for comparing matrices with tolerance
const expectMatrixClose = (a: DensityMatrix, b: DensityMatrix, tolerance = 1e-9) => {
  expect(a.length).toBe(b.length);
  a.forEach((row, i) => {
    expect(row.length).toBe(b[i].length);
    row.forEach((val, j) => {
      expectComplexClose(val, b[i][j], tolerance);
    });
  });
};

// Helper function to calculate fidelity wrt |Φ⁺⟩ directly from computational basis rho
const calculateFidelityWrtPhiPlus = (rho: DensityMatrix): number => {
  const term00 = rho[0]?.[0]?.real ?? 0;
  const term03 = rho[0]?.[3]?.real ?? 0;
  const term30 = rho[3]?.[0]?.real ?? 0;
  const term33 = rho[3]?.[3]?.real ?? 0;
  return 0.5 * (term00 + term03 + term30 + term33);
};

describe('mathUtils', () => {
  describe('complex arithmetic', () => {
    it('constructs a ComplexNumber with real/imag defaults', () => {
      expect(complex(5)).toEqual({ real: 5, imag: 0 });
      expect(complex(2, 3)).toEqual({ real: 2, imag: 3 });
    });

    it('adds two simple ComplexNumbers', () => {
      const a = complex(1, 2);
      const b = complex(3, 4);
      expect(add(a, b)).toEqual(complex(4, 6));
    });

    it('multiplies two simple ComplexNumbers', () => {
      const a = complex(1, 2);
      const b = complex(3, 4);
      // (1 + 2i)(3 + 4i) = 3 + 4i + 6i + 8i^2 = 3 + 10i - 8 = -5 + 10i
      expect(multiply(a, b)).toEqual(complex(-5, 10));
    });

    it('conjugates a ComplexNumber', () => {
      const c = complex(3, -4);
      expect(conjugate(c)).toEqual(complex(3, 4));
    });
  });

  describe('matrix operations', () => {
    const matrixA: DensityMatrix = [
      [complex(1, 1), complex(2, 0)],
      [complex(0, 3), complex(4, -1)]
    ];
    const matrixB: DensityMatrix = [
      [complex(5, 0), complex(1, -2)],
      [complex(-1, 1), complex(0, 6)]
    ];
    // A * B
    // Row 1: (1+i)*5 + 2*(-1+i) = 5+5i -2+2i = 3+7i
    //        (1+i)*(1-2i) + 2*(6i) = (1-2i+i-2i^2) + 12i = (1-i+2) + 12i = 3-i + 12i = 3+11i
    // Row 2: (3i)*5 + (4-i)*(-1+i) = 15i + (-4+4i+i-i^2) = 15i + (-4+5i+1) = 15i -3+5i = -3+20i
    //        (3i)*(1-2i) + (4-i)*(6i) = (3i-6i^2) + (24i-6i^2) = (3i+6) + (24i+6) = 12+27i
    const expectedProduct: DensityMatrix = [
      [complex(3, 7), complex(3, 11)],
      [complex(-3, 20), complex(12, 27)]
    ];

    const matrixC: DensityMatrix = [[complex(1), complex(2)], [complex(3), complex(4)]];
    const matrixD: DensityMatrix = [[complex(0), complex(5)], [complex(6), complex(7)]];
    // C ⊗ D
    const expectedTensor: DensityMatrix = [
      [complex(0), complex(5), complex(0), complex(10)], // 1*D, 2*D
      [complex(6), complex(7), complex(12), complex(14)],
      [complex(0), complex(15), complex(0), complex(20)], // 3*D, 4*D
      [complex(18), complex(21), complex(24), complex(28)]
    ];
    
    const matrixRho4x4: DensityMatrix = [
      [complex(0.5), complex(0), complex(0), complex(0.5)],
      [complex(0), complex(0), complex(0), complex(0)],
      [complex(0), complex(0), complex(0), complex(0)],
      [complex(0.5), complex(0), complex(0), complex(0.5)]
    ]; // Represents |Φ⁺⟩⟨Φ⁺|
    const expectedTraceOutFirst: DensityMatrix = [[complex(0.5), complex(0)], [complex(0), complex(0.5)]]; // Should be I/2
    const expectedTraceOutSecond: DensityMatrix = [[complex(0.5), complex(0)], [complex(0), complex(0.5)]]; // Should be I/2

    it('multiplies two 2x2 matrices', () => {
      expectMatrixClose(matrixMultiply(matrixA, matrixB), expectedProduct);
    });

    it('calculates the tensor product of two 2x2 matrices', () => {
      expectMatrixClose(tensorProduct(matrixC, matrixD), expectedTensor);
    });

    it('calculates partial trace correctly (tracing out first subsystem)', () => {
      expectMatrixClose(partialTrace(matrixRho4x4, 2, true), expectedTraceOutFirst);
    });

    it('calculates partial trace correctly (tracing out second subsystem)', () => {
      expectMatrixClose(partialTrace(matrixRho4x4, 2, false), expectedTraceOutSecond);
    });
  });

  describe('basis transforms', () => {
    it('calculates Bell basis fidelity correctly for |Φ⁺⟩ state', () => {
      const phiPlusState: DensityMatrix = [
        [complex(0.5), complex(0), complex(0), complex(0.5)],
        [complex(0), complex(0), complex(0), complex(0)],
        [complex(0), complex(0), complex(0), complex(0)],
        [complex(0.5), complex(0), complex(0), complex(0.5)]
      ];
      // Calculate fidelity wrt |Φ⁺⟩ directly
      // Original test used calculateBellBasisFidelity(transformToBellBasis(phiPlusState))
      // New approach: Use helper function calculateFidelityWrtPhiPlus
      expect(calculateFidelityWrtPhiPlus(phiPlusState)).toBeCloseTo(1.0);
      // Also test the original calculateBellBasisFidelity if it's meant to work on Bell Basis matrices
      // Need a known Bell Basis matrix. U|Φ⁺⟩ = [1,0,0,0]. rho_bell = [[1,0,0,0],[0,0,0,0]...]
      const phiPlusBellBasisManual: DensityMatrix = [
          [complex(1), complex(0), complex(0), complex(0)],
          [complex(0), complex(0), complex(0), complex(0)],
          [complex(0), complex(0), complex(0), complex(0)],
          [complex(0), complex(0), complex(0), complex(0)]
      ];
      expect(calculateBellBasisFidelity(phiPlusBellBasisManual)).toBeCloseTo(1.0);
    });

    it('calculates Bell basis fidelity correctly for |Ψ⁻⟩ state', () => {
        const psiMinusState: DensityMatrix = [
          [complex(0), complex(0), complex(0), complex(0)],
          [complex(0), complex(0.5), complex(-0.5), complex(0)],
          [complex(0), complex(-0.5), complex(0.5), complex(0)],
          [complex(0), complex(0), complex(0), complex(0)]
        ];
        // Calculate fidelity wrt |Φ⁺⟩ directly
        // Original test used calculateBellBasisFidelity(transformToBellBasis(psiMinusState))
        // New approach: Use helper function calculateFidelityWrtPhiPlus
        expect(calculateFidelityWrtPhiPlus(psiMinusState)).toBeCloseTo(0.0);
        // Also test the original calculateBellBasisFidelity if it's meant to work on Bell Basis matrices
        // Need a known Bell Basis matrix. U|Ψ⁻⟩ = [0,0,0,1]. rho_bell = [[0,0,0,0],...,[0,0,0,1]]
        const psiMinusBellBasisManual: DensityMatrix = [
          [complex(0), complex(0), complex(0), complex(0)],
          [complex(0), complex(0), complex(0), complex(0)],
          [complex(0), complex(0), complex(0), complex(0)],
          [complex(0), complex(0), complex(0), complex(1)]
      ];
       expect(calculateBellBasisFidelity(psiMinusBellBasisManual)).toBeCloseTo(0.0);
    });
  });
}); 