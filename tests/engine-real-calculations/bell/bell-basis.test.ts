import { describe, test, expect } from 'vitest';
import { toBellBasis, fidelityFromBellBasisMatrix, fidelityFromComputationalBasisMatrix } from '../../../src/engine_real_calculations/bell/bell-basis';
import { DensityMatrix } from '../../../src/engine_real_calculations/matrix/densityMatrix';
import { ComplexNum } from '../../../src/engine_real_calculations/types/complex';
import { Matrix } from '../../../src/engine_real_calculations/matrix/matrix';

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