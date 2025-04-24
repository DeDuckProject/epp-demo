import { describe, test, expect } from 'vitest';
import { DensityMatrix } from './densityMatrix';

describe('DensityMatrix', () => {
  test('constructor normalizes', () => {
    // Unnormalized pure state |0⟩
    const data = [
      [{ re: 2, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }]
    ];
    const rho = new DensityMatrix(data);
    expect(rho.trace().re).toBeCloseTo(1);
    expect(rho.get(0, 0).re).toBeCloseTo(1);
  });

  test('fromStateVector', () => {
    // |+⟩ = (|0⟩ + |1⟩)/√2
    const plus = [
      { re: 1/Math.sqrt(2), im: 0 },
      { re: 1/Math.sqrt(2), im: 0 }
    ];
    const rho = DensityMatrix.fromStateVector(plus);
    
    // Should have all elements equal to 0.5
    expect(rho.get(0, 0).re).toBeCloseTo(0.5);
    expect(rho.get(0, 1).re).toBeCloseTo(0.5);
    expect(rho.get(1, 0).re).toBeCloseTo(0.5);
    expect(rho.get(1, 1).re).toBeCloseTo(0.5);
    expect(rho.trace().re).toBeCloseTo(1);
  });

  test('validate hermitian and trace=1', () => {
    // Valid density matrix
    const valid = new DensityMatrix([
      [{ re: 0.5, im: 0 }, { re: 0, im: 0.5 }],
      [{ re: 0, im: -0.5 }, { re: 0.5, im: 0 }]
    ]);
    expect(valid.validate()).toBe(true);
    
    // Invalid trace (shouldn't happen with constructor but test validate)
    const invalidData = [
      [{ re: 0.5, im: 0 }, { re: 0, im: 0.5 }],
      [{ re: 0, im: -0.5 }, { re: 0.5, im: 0 }]
    ];
    const invalid = new DensityMatrix(invalidData);
    // Manually modify the matrix to make the trace not equal to 1
    invalid.set(1, 1, { re: 0.4, im: 0 });
    expect(invalid.validate()).toBe(false);
  });

  test('validate non-hermitian matrix', () => {
    // Non-hermitian matrix
    const nonHermitianData = [
      [{ re: 0.5, im: 0 }, { re: 0.3, im: 0.5 }],
      [{ re: 0.3, im: -0.4 }, { re: 0.5, im: 0 }]
    ];
    const nonHermitian = new DensityMatrix(nonHermitianData);
    expect(nonHermitian.validate()).toBe(false);
  });

  test('Bell states have correct properties', () => {
    const phiPlus = DensityMatrix.bellPhiPlus();
    const phiMinus = DensityMatrix.bellPhiMinus();
    const psiPlus = DensityMatrix.bellPsiPlus();
    const psiMinus = DensityMatrix.bellPsiMinus();
    
    // All should be 4x4 matrices
    expect(phiPlus.rows).toBe(4);
    expect(phiPlus.cols).toBe(4);
    
    // All should be normalized
    expect(phiPlus.trace().re).toBeCloseTo(1);
    expect(phiMinus.trace().re).toBeCloseTo(1);
    expect(psiPlus.trace().re).toBeCloseTo(1);
    expect(psiMinus.trace().re).toBeCloseTo(1);
    
    // Check diagonal elements of |Φ+⟩
    expect(phiPlus.get(0, 0).re).toBeCloseTo(0.5);
    expect(phiPlus.get(3, 3).re).toBeCloseTo(0.5);
    
    // Check off-diagonal coherence terms of |Φ+⟩
    expect(phiPlus.get(0, 3).re).toBeCloseTo(0.5);
    expect(phiPlus.get(3, 0).re).toBeCloseTo(0.5);
    
    // Verify Φ- has negative coherence
    expect(phiMinus.get(0, 3).re).toBeCloseTo(-0.5);
  });

  test('tensor product of density matrices', () => {
    // |0⟩⟨0| ⊗ |0⟩⟨0| should be |00⟩⟨00|
    const zero = new DensityMatrix([
      [{ re: 1, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }]
    ]);
    
    const tensor = DensityMatrix.tensor(zero, zero);
    
    // Should be 4x4 with only [0,0] element = 1
    expect(tensor.rows).toBe(4);
    expect(tensor.cols).toBe(4);
    expect(tensor.get(0, 0).re).toBeCloseTo(1);
    
    // Check rest are zero
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i === 0 && j === 0) continue;
        expect(tensor.get(i, j).re).toBeCloseTo(0);
        expect(tensor.get(i, j).im).toBeCloseTo(0);
      }
    }
    
    // Test normalizing another product
    const result = DensityMatrix.tensor(
      DensityMatrix.bellPhiPlus(), 
      DensityMatrix.bellPhiPlus()
    );
    
    expect(result.trace().re).toBeCloseTo(1);
    expect(result.rows).toBe(16);
  });
}); 