import { describe, test, expect } from 'vitest';
import { toBellBasis, fidelityFromBellBasisMatrix, fidelityFromComputationalBasisMatrix, toComputationalBasis, BellState } from '../../../src/engine_real_calculations/bell/bell-basis';
import { DensityMatrix, ComplexNum, Matrix } from '../../../src/engine_real_calculations';

describe('Bell Basis Conversion and Fidelity', () => {
  test('phi+ state fidelity should be 1', () => {
    const phiPlusVec = [
      ComplexNum.fromReal(1/Math.sqrt(2)),
      ComplexNum.zero(),
      ComplexNum.zero(),
      ComplexNum.fromReal(1/Math.sqrt(2))
    ];
    const rho = DensityMatrix.fromStateVector(phiPlusVec);
    const rhoBell = toBellBasis(rho);
    const fidelity = fidelityFromBellBasisMatrix(rhoBell);
    expect(fidelity).toBeCloseTo(1, 5);
  });

  test('phi- state fidelity should be 0', () => {
    const phiMinusVec = [
      ComplexNum.fromReal(1/Math.sqrt(2)),
      ComplexNum.zero(),
      ComplexNum.zero(),
      ComplexNum.fromReal(-1/Math.sqrt(2))
    ];
    const rho = DensityMatrix.fromStateVector(phiMinusVec);
    const rhoBell = toBellBasis(rho);
    const fidelity = fidelityFromBellBasisMatrix(rhoBell);
    expect(fidelity).toBeCloseTo(0, 5);
  });

  test('|00> state fidelity should be 0.5', () => {
    const ket00Vec = [
      ComplexNum.fromReal(1),
      ComplexNum.zero(),
      ComplexNum.zero(),
      ComplexNum.zero()
    ];
    const rho = DensityMatrix.fromStateVector(ket00Vec);
    // Using the new function that combines toBellBasis and fidelityBell
    const fidelity = fidelityFromComputationalBasisMatrix(rho);
    expect(fidelity).toBeCloseTo(0.5, 5);
  });
});

describe('Fidelity calculations with different Bell states', () => {
  test('Bell states should have fidelity=1 with respect to themselves', () => {
    // Test Phi+ state
    const phiPlus = DensityMatrix.bellPhiPlus();
    expect(fidelityFromComputationalBasisMatrix(phiPlus, BellState.PHI_PLUS)).toBeCloseTo(1, 5);
    
    // Test Phi- state
    const phiMinus = DensityMatrix.bellPhiMinus();
    expect(fidelityFromComputationalBasisMatrix(phiMinus, BellState.PHI_MINUS)).toBeCloseTo(1, 5);
    
    // Test Psi+ state
    const psiPlus = DensityMatrix.bellPsiPlus();
    expect(fidelityFromComputationalBasisMatrix(psiPlus, BellState.PSI_PLUS)).toBeCloseTo(1, 5);
    
    // Test Psi- state
    const psiMinus = DensityMatrix.bellPsiMinus();
    expect(fidelityFromComputationalBasisMatrix(psiMinus, BellState.PSI_MINUS)).toBeCloseTo(1, 5);
  });
  
  test('Bell states should have fidelity=0 with respect to orthogonal Bell states', () => {
    // Each Bell state should have zero fidelity with the other three
    
    // Test Phi+ state against others
    const phiPlus = DensityMatrix.bellPhiPlus();
    expect(fidelityFromComputationalBasisMatrix(phiPlus, BellState.PHI_MINUS)).toBeCloseTo(0, 5);
    expect(fidelityFromComputationalBasisMatrix(phiPlus, BellState.PSI_PLUS)).toBeCloseTo(0, 5);
    expect(fidelityFromComputationalBasisMatrix(phiPlus, BellState.PSI_MINUS)).toBeCloseTo(0, 5);
    
    // Test Phi- state against others
    const phiMinus = DensityMatrix.bellPhiMinus();
    expect(fidelityFromComputationalBasisMatrix(phiMinus, BellState.PHI_PLUS)).toBeCloseTo(0, 5);
    expect(fidelityFromComputationalBasisMatrix(phiMinus, BellState.PSI_PLUS)).toBeCloseTo(0, 5);
    expect(fidelityFromComputationalBasisMatrix(phiMinus, BellState.PSI_MINUS)).toBeCloseTo(0, 5);
    
    // Test Psi+ state against others
    const psiPlus = DensityMatrix.bellPsiPlus();
    expect(fidelityFromComputationalBasisMatrix(psiPlus, BellState.PHI_PLUS)).toBeCloseTo(0, 5);
    expect(fidelityFromComputationalBasisMatrix(psiPlus, BellState.PHI_MINUS)).toBeCloseTo(0, 5);
    expect(fidelityFromComputationalBasisMatrix(psiPlus, BellState.PSI_MINUS)).toBeCloseTo(0, 5);
    
    // Test Psi- state against others
    const psiMinus = DensityMatrix.bellPsiMinus();
    expect(fidelityFromComputationalBasisMatrix(psiMinus, BellState.PHI_PLUS)).toBeCloseTo(0, 5);
    expect(fidelityFromComputationalBasisMatrix(psiMinus, BellState.PHI_MINUS)).toBeCloseTo(0, 5);
    expect(fidelityFromComputationalBasisMatrix(psiMinus, BellState.PSI_PLUS)).toBeCloseTo(0, 5);
  });
  
  test('Maximally mixed state should have fidelity=0.25 with respect to any Bell state', () => {
    // Create a maximally mixed state (I/4)
    const mixedState = Matrix.identity(4).scale(ComplexNum.fromReal(0.25));
    const mixedDensity = new DensityMatrix(mixedState.data);
    
    // Test against all four Bell states
    expect(fidelityFromComputationalBasisMatrix(mixedDensity, BellState.PHI_PLUS)).toBeCloseTo(0.25, 5);
    expect(fidelityFromComputationalBasisMatrix(mixedDensity, BellState.PHI_MINUS)).toBeCloseTo(0.25, 5);
    expect(fidelityFromComputationalBasisMatrix(mixedDensity, BellState.PSI_PLUS)).toBeCloseTo(0.25, 5);
    expect(fidelityFromComputationalBasisMatrix(mixedDensity, BellState.PSI_MINUS)).toBeCloseTo(0.25, 5);
  });
  
  test('Werner states with different target Bell states', () => {
    const p = 0.8;  // Weight parameter for Werner state
    
    // Create Werner states with different target Bell states
    // Werner state is: p * |bell⟩⟨bell| + (1-p) * I/4
    
    // Werner state targeting Phi+
    const phiPlus = DensityMatrix.bellPhiPlus();
    const identityMatrix = Matrix.identity(4).scale(ComplexNum.fromReal(0.25)); // I/4
    const wernerPhiPlus = phiPlus.scale(ComplexNum.fromReal(p))
      .add(new DensityMatrix(identityMatrix.data).scale(ComplexNum.fromReal(1-p)));
    
    // Werner state targeting Psi-
    const psiMinus = DensityMatrix.bellPsiMinus();
    const wernerPsiMinus = psiMinus.scale(ComplexNum.fromReal(p))
      .add(new DensityMatrix(identityMatrix.data).scale(ComplexNum.fromReal(1-p)));
    
    // Check fidelities
    expect(fidelityFromComputationalBasisMatrix(wernerPhiPlus, BellState.PHI_PLUS)).toBeCloseTo(p * 1 + (1-p) * 0.25, 5);
    expect(fidelityFromComputationalBasisMatrix(wernerPsiMinus, BellState.PSI_MINUS)).toBeCloseTo(p * 1 + (1-p) * 0.25, 5);
    
    // Cross-fidelities should be lower
    expect(fidelityFromComputationalBasisMatrix(wernerPhiPlus, BellState.PSI_MINUS)).toBeCloseTo((1-p) * 0.25, 5);
    expect(fidelityFromComputationalBasisMatrix(wernerPsiMinus, BellState.PHI_PLUS)).toBeCloseTo((1-p) * 0.25, 5);
  });
});

describe('Additional tests: Mixtures and Werner States', () => {
  test('Mixture of phi+ and phi- with weights (0.3, 0.7) should yield fidelity 0.3', () => {
    const phiPlus = DensityMatrix.bellPhiPlus();
    const phiMinus = DensityMatrix.bellPhiMinus();
    // Create a weighted mixture: 0.3 * phi+ + 0.7 * phi-
    const mixed = phiPlus.scale(ComplexNum.fromReal(0.3)).add(phiMinus.scale(ComplexNum.fromReal(0.7)));
    const fidelity = fidelityFromComputationalBasisMatrix(mixed);
    expect(fidelity).toBeCloseTo(0.3, 5);
  });

  test('Mixture of all four Bell states equally should yield fidelity 0.25', () => {
    const phiPlus = DensityMatrix.bellPhiPlus();
    const phiMinus = DensityMatrix.bellPhiMinus();
    const psiPlus = DensityMatrix.bellPsiPlus();
    const psiMinus = DensityMatrix.bellPsiMinus();
    // Equal mixture of all four Bell states
    const mixed = phiPlus.scale(ComplexNum.fromReal(0.25))
      .add(phiMinus.scale(ComplexNum.fromReal(0.25)))
      .add(psiPlus.scale(ComplexNum.fromReal(0.25)))
      .add(psiMinus.scale(ComplexNum.fromReal(0.25)));
    const fidelity = fidelityFromComputationalBasisMatrix(mixed);
    expect(fidelity).toBeCloseTo(0.25, 5);
  });

  test('Werner state with p=0 should yield fidelity 0.25', () => {
    const p = 0;
    const phiPlus = DensityMatrix.bellPhiPlus();
    const identity = Matrix.identity(4);
    // Werner state: p * |phi+><phi+| + (1-p) * I/4
    const werner = phiPlus.scale(ComplexNum.fromReal(p)).add(identity.scale(ComplexNum.fromReal((1 - p) / 4)));
    const fidelity = fidelityFromComputationalBasisMatrix(werner);
    expect(fidelity).toBeCloseTo(0.25, 5);
  });

  test('Werner state with p=0.5 should yield fidelity 0.625', () => {
    const p = 0.5;
    const phiPlus = DensityMatrix.bellPhiPlus();
    const identity = Matrix.identity(4);
    const werner = phiPlus.scale(ComplexNum.fromReal(p)).add(identity.scale(ComplexNum.fromReal((1 - p) / 4)));
    const fidelity = fidelityFromComputationalBasisMatrix(werner);
    expect(fidelity).toBeCloseTo(0.625, 5);
  });

  test('Werner state with p=1 should yield fidelity 1', () => {
    const p = 1;
    const phiPlus = DensityMatrix.bellPhiPlus();
    const identity = Matrix.identity(4);
    const werner = phiPlus.scale(ComplexNum.fromReal(p)).add(identity.scale(ComplexNum.fromReal((1 - p) / 4)));
    const fidelity = fidelityFromComputationalBasisMatrix(werner);
    expect(fidelity).toBeCloseTo(1, 5);
  });
});

describe('Bell Basis to Computational Basis Conversion', () => {
  test('Converting phi+ from computational to Bell and back should yield the original matrix', () => {
    // Create phi+ state in computational basis
    const phiPlusVec = [
      ComplexNum.fromReal(1/Math.sqrt(2)),
      ComplexNum.zero(),
      ComplexNum.zero(),
      ComplexNum.fromReal(1/Math.sqrt(2))
    ];
    const rhoOriginal = DensityMatrix.fromStateVector(phiPlusVec);
    
    // Convert to Bell basis
    const rhoBell = toBellBasis(rhoOriginal);
    
    // Convert back to computational basis
    const rhoComputed = toComputationalBasis(rhoBell);
    
    // Check if the original and computed matrices are equal
    expect(rhoOriginal.equals(rhoComputed, 1e-10)).toBe(true);
  });

  test('Conversion should preserve matrix properties: trace and hermiticity', () => {
    // Create a mixed state
    const phiPlus = DensityMatrix.bellPhiPlus();
    const phiMinus = DensityMatrix.bellPhiMinus();
    const mixedState = phiPlus.scale(ComplexNum.fromReal(0.7)).add(phiMinus.scale(ComplexNum.fromReal(0.3)));
    
    // Convert to Bell basis
    const bellState = toBellBasis(mixedState);
    
    // Convert back to computational basis
    const computationalState = toComputationalBasis(bellState);
    
    // Check if trace is preserved (should be 1 for density matrices)
    expect(computationalState.trace().re).toBeCloseTo(1, 10);
    
    // Check if hermiticity is preserved (matrix = matrix.dagger())
    expect(computationalState.equals(computationalState.dagger(), 1e-10)).toBe(true);
  });

  test('The two transformations should be inverses of each other', () => {
    // Test with a Werner state
    const p = 0.8;
    const phiPlus = DensityMatrix.bellPhiPlus();
    const identity = Matrix.identity(4);
    const wernerState = phiPlus.scale(ComplexNum.fromReal(p)).add(identity.scale(ComplexNum.fromReal((1 - p) / 4)));
    
    // First approach: computational -> Bell -> computational
    const bellBasis = toBellBasis(wernerState);
    const backToComputational = toComputationalBasis(bellBasis);
    
    // Second approach: Bell -> computational -> Bell
    const computationalBasis = toComputationalBasis(bellBasis);
    const backToBell = toBellBasis(computationalBasis);
    
    // Both approaches should return to the original matrix
    expect(wernerState.equals(backToComputational, 1e-10)).toBe(true);
    expect(bellBasis.equals(backToBell, 1e-10)).toBe(true);
  });
}); 