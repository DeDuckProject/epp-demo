import { describe, test, expect } from 'vitest';
import { applyDephasing, applyDepolarizing } from '../../../src/engine_real_calculations/channels/noise';
import { DensityMatrix } from '../../../src/engine_real_calculations/matrix/densityMatrix';
import { ComplexNum } from '../../../src/engine_real_calculations/types/complex';


describe('Multi-qubit noise channels', () => {
  test('applyDephasing on a 2-qubit |++> state (p=1) dephases qubit 0 correctly', () => {
    // |+> = (1/sqrt2)[1, 1]. For two qubits, |++> = (|+> ⊗ |+>)
    // The state vector for |++> is 1/2 [1, 1, 1, 1] in the order |00>, |01>, |10>, |11>.
    const twoQubitStateVector = [
      { re: 1/2, im: 0 },
      { re: 1/2, im: 0 },
      { re: 1/2, im: 0 },
      { re: 1/2, im: 0 }
    ];
    const state = DensityMatrix.fromStateVector(twoQubitStateVector);

    // Apply dephasing channel on qubit 0 with p = 1 (full dephasing)
    const newState = applyDephasing(state, 0, 1);

    // The basis order is assumed as |00>, |01>, |10>, |11>.
    // Qubit 0 = 0 for indices 0 and 1; and qubit 0 = 1 for indices 2 and 3.
    // Off-diagonals connecting these blocks should vanish.
    expect(newState.get(0, 2).re).toBeCloseTo(0);
    expect(newState.get(0, 3).re).toBeCloseTo(0);
    expect(newState.get(1, 2).re).toBeCloseTo(0);
    expect(newState.get(1, 3).re).toBeCloseTo(0);

    // The diagonal elements in each block should equal the marginal probabilities.
    // Original state is pure with all outcomes equally likely, so marginal probability for qubit 0 = 0 is 0.5, and similarly for qubit 0 = 1.
    const probQubit0_0 = newState.get(0, 0).re + newState.get(1, 1).re;
    const probQubit0_1 = newState.get(2, 2).re + newState.get(3, 3).re;
    expect(probQubit0_0).toBeCloseTo(0.5);
    expect(probQubit0_1).toBeCloseTo(0.5);
  });

  test('applyDepolarizing on a 2-qubit |00> state (on qubit 1) produces a mixed state', () => {
    // Create a 2-qubit |00> density matrix. Dimension is 4x4.
    const state = new DensityMatrix([
      [ComplexNum.one(),    ComplexNum.zero(),   ComplexNum.zero(),   ComplexNum.zero()],
      [ComplexNum.zero(),   ComplexNum.zero(),   ComplexNum.zero(),   ComplexNum.zero()],
      [ComplexNum.zero(),   ComplexNum.zero(),   ComplexNum.zero(),   ComplexNum.zero()],
      [ComplexNum.zero(),   ComplexNum.zero(),   ComplexNum.zero(),   ComplexNum.zero()]
    ]);

    // Apply depolarizing channel on qubit 1 with probability p = 0.5
    const newState = applyDepolarizing(state, 1, 0.5);

    // Verify that the trace is preserved
    expect(newState.trace().re).toBeCloseTo(1);

    // For a |00> state, applying depolarizing on qubit 1
    // should mix the state so that both |00> and |01> get some probability.
    // We expect newState[0,0] < 1 and newState[1,1] > 0. 
    expect(newState.get(0, 0).re).toBeLessThan(1);
    expect(newState.get(1, 1).re).toBeGreaterThan(0);
  });
}); 