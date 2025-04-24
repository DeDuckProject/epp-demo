import { describe, test, expect } from 'vitest';
import { _testing } from './noise';
import { DensityMatrix } from '../matrix/densityMatrix';
import { Matrix } from '../matrix/matrix';
import { ComplexNum } from '../types/complex';


describe('applyKraus function', () => {
  test('applyKraus with identity operator returns scaled density matrix', () => {
    // Create a simple density matrix |0><0|
    const rho = new DensityMatrix([
      [ComplexNum.one(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero()]
    ]);
    
    // Use a Kraus operator: identity scaled by alpha
    const alpha = 0.8;
    const I = Matrix.identity(2).scale(ComplexNum.fromReal(alpha));
    
    // Applying the Kraus operator should give alpha^2 * rho
    const newRho = _testing.applyKraus(rho, [I]);
    
    expect(newRho.get(0, 0).re).toBeCloseTo(1);
    expect(newRho.get(1, 1).re).toBeCloseTo(0);
  });

  test('applyKraus with two Kraus operators adds their contributions', () => {
    // Create a simple density matrix |0><0|
    const rho = new DensityMatrix([
      [ComplexNum.one(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero()]
    ]);
    
    // Define two Kraus operators: identity scaled by different factors
    const alpha = 0.6;
    const beta = 0.3;
    const I_alpha = Matrix.identity(2).scale(ComplexNum.fromReal(alpha));
    const I_beta = Matrix.identity(2).scale(ComplexNum.fromReal(beta));
    
    // Expected: (alpha^2 + beta^2) * rho
    const newRho = _testing.applyKraus(rho, [I_alpha, I_beta]);
    
    expect(newRho.get(0, 0).re).toBeCloseTo(1);
    expect(newRho.get(1, 1).re).toBeCloseTo(0);
  });
});

// Advanced applyKraus test cases

describe('Advanced applyKraus tests', () => {
  test('applyKraus with a projection operator collapses the state', () => {
    // Create |+> state using a state vector
    const plus = [
      { re: 1/Math.sqrt(2), im: 0 },
      { re: 1/Math.sqrt(2), im: 0 }
    ];
    const rho = DensityMatrix.fromStateVector(plus);

    // Define a projection Kraus operator that projects onto |0>
    // Matrix representation: [[1, 0], [0, 0]]
    const proj = new Matrix([
      [ComplexNum.one(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero()]
    ]);

    const newRho = _testing.applyKraus(rho, [proj]);
    // After applying the projection, the resulting state should collapse to |0><0|
    expect(newRho.get(0, 0).re).toBeCloseTo(1);
    expect(newRho.get(1, 1).re).toBeCloseTo(0);
    expect(newRho.get(0, 1).re).toBeCloseTo(0);
    expect(newRho.get(1, 0).re).toBeCloseTo(0);
  });

  test('applyKraus with Pauli X operator flips state', () => {
    // Create |0> state density matrix
    const rho = new DensityMatrix([
      [ComplexNum.one(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero()]
    ]);

    // Define Pauli X operator: [[0, 1], [1, 0]]
    const pauliX = new Matrix([
      [ComplexNum.zero(), ComplexNum.one()],
      [ComplexNum.one(), ComplexNum.zero()]
    ]);

    const newRho = _testing.applyKraus(rho, [pauliX]);
    // Expected result: applying Pauli X on |0><0| gives |1><1|
    expect(newRho.get(0, 0).re).toBeCloseTo(0);
    expect(newRho.get(1, 1).re).toBeCloseTo(1);
    expect(newRho.get(0, 1).re).toBeCloseTo(0);
    expect(newRho.get(1, 0).re).toBeCloseTo(0);
  });
}); 