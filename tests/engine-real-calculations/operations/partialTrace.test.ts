import { describe, test, expect } from 'vitest';
import { partialTrace } from '../../../src/engine_real_calculations/operations/partialTrace';
import { DensityMatrix } from '../../../src/engine_real_calculations/matrix/densityMatrix';
import { ComplexNum } from '../../../src/engine_real_calculations/types/complex';

describe('Partial Trace Operations', () => {
  test('tracing out one qubit from a separable state', () => {
    // Create a separable 2-qubit state |0⟩⊗|0⟩
    const twoQubitZero = new DensityMatrix([
      [ComplexNum.one(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()]
    ]);
    
    // Trace out qubit 0 (lowest significance bit)
    const traced0 = partialTrace(twoQubitZero, [0]);
    
    // Result should be a 1-qubit |0⟩ state
    expect(traced0.rows).toBe(2);
    expect(traced0.get(0, 0).re).toBeCloseTo(1);
    expect(traced0.get(1, 1).re).toBeCloseTo(0);
    
    // Trace out qubit 1 (second bit)
    const traced1 = partialTrace(twoQubitZero, [1]);
    
    // Result should also be a 1-qubit |0⟩ state
    expect(traced1.rows).toBe(2);
    expect(traced1.get(0, 0).re).toBeCloseTo(1);
    expect(traced1.get(1, 1).re).toBeCloseTo(0);
  });
  
  test('tracing out one qubit from all Bell states', () => {
    // Helper function to check closeness with a custom error message
    const expectClose = (value: number, expected: number, precision: number, message: string): void => {
      if (Math.abs(value - expected) > Math.pow(10, -precision)) {
        throw new Error(message);
      }
      expect(value).toBeCloseTo(expected, precision);
    };

    const bellStates = [
      { name: 'bellPhiPlus', state: DensityMatrix.bellPhiPlus() },
      { name: 'bellPhiMinus', state: DensityMatrix.bellPhiMinus() },
      { name: 'bellPsiPlus', state: DensityMatrix.bellPsiPlus() },
      { name: 'bellPsiMinus', state: DensityMatrix.bellPsiMinus() }
    ];

    for (const { name, state } of bellStates) {
      // Test tracing out qubit 0
      const traced0 = partialTrace(state, [0]);
      expect(traced0.rows).toBe(2);
      expectClose(traced0.get(0, 0).re, 0.5, 5, `${name}: tracing out qubit 0, entry (0,0)`);
      expectClose(traced0.get(1, 1).re, 0.5, 5, `${name}: tracing out qubit 0, entry (1,1)`);
      expectClose(traced0.get(0, 1).re, 0, 5, `${name}: tracing out qubit 0, entry (0,1)`);
      expectClose(traced0.get(1, 0).re, 0, 5, `${name}: tracing out qubit 0, entry (1,0)`);

      // Test tracing out qubit 1
      const traced1 = partialTrace(state, [1]);
      expect(traced1.rows).toBe(2);
      expectClose(traced1.get(0, 0).re, 0.5, 5, `${name}: tracing out qubit 1, entry (0,0)`);
      expectClose(traced1.get(1, 1).re, 0.5, 5, `${name}: tracing out qubit 1, entry (1,1)`);
      expectClose(traced1.get(0, 1).re, 0, 5, `${name}: tracing out qubit 1, entry (0,1)`);
      expectClose(traced1.get(1, 0).re, 0, 5, `${name}: tracing out qubit 1, entry (1,0)`);
    }
  });
  
  test('tracing out two qubits from a 3-qubit system', () => {
    // Create a 3-qubit GHZ state (|000⟩ + |111⟩)/√2
    const stateVector = [];
    for (let i = 0; i < 8; i++) {
      stateVector.push(i === 0 || i === 7 ? { re: 1/Math.sqrt(2), im: 0 } : ComplexNum.zero());
    }
    const ghz = DensityMatrix.fromStateVector(stateVector);
    
    // Trace out qubits 0 and 1
    let traced = partialTrace(ghz, [0, 1]);
    
    // Result should be a 1-qubit mixed state
    expect(traced.rows).toBe(2);
    expect(traced.get(0, 0).re).toBeCloseTo(0.5);
    expect(traced.get(1, 1).re).toBeCloseTo(0.5);
    expect(traced.get(0, 1).re).toBeCloseTo(0);
    expect(traced.get(1, 0).re).toBeCloseTo(0);

    // verify tracing other qubits still gives the mixed state
    traced = partialTrace(ghz, [0, 2]);

    // Result should be a 1-qubit mixed state
    expect(traced.rows).toBe(2);
    expect(traced.get(0, 0).re).toBeCloseTo(0.5);
    expect(traced.get(1, 1).re).toBeCloseTo(0.5);
    expect(traced.get(0, 1).re).toBeCloseTo(0);
    expect(traced.get(1, 0).re).toBeCloseTo(0);
  });
  
  test('tracing out all qubits gives a scalar', () => {
    // Create any state, e.g., a Bell state
    const bell = DensityMatrix.bellPhiPlus();
    
    // Trace out all qubits
    const traced = partialTrace(bell, [0, 1]);
    
    // Result should be a 1x1 matrix with value 1
    expect(traced.rows).toBe(1);
    expect(traced.get(0, 0).re).toBeCloseTo(1);
  });
  
  test('tracing out part of a mixed state', () => {
    // Create a mixed state: 0.7|00⟩⟨00| + 0.3|11⟩⟨11|
    const data = [
      [{ re: 0.7, im: 0 }, ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), { re: 0.3, im: 0 }]
    ];
    const mixed = new DensityMatrix(data);
    
    // Trace out qubit 0
    const traced = partialTrace(mixed, [0]);
    
    // Result should be: 0.7|0⟩⟨0| + 0.3|1⟩⟨1|
    expect(traced.get(0, 0).re).toBeCloseTo(0.7);
    expect(traced.get(1, 1).re).toBeCloseTo(0.3);
  });

  test('tracing out no qubits returns the original density matrix', () => {
    const data = [
      [{ re: 0.7, im: 0 }, ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), { re: 0.3, im: 0 }]
    ];
    const mixed = new DensityMatrix(data);
    const traced = partialTrace(mixed, []);
    expect(traced.rows).toBe(4);
    expect(traced.get(0, 0).re).toBeCloseTo(0.7);
    expect(traced.get(3, 3).re).toBeCloseTo(0.3);
  });

  test('tracing out one qubit from a separable superposition retains coherence', () => {
    // |+>⊗|0> with |+> = (|0> + |1>)/√2 on qubit0
    const plus0State = [
      { re: 1/Math.sqrt(2), im: 0 },
      { re: 1/Math.sqrt(2), im: 0 },
      ComplexNum.zero(),
      ComplexNum.zero()
    ];
    const rho = DensityMatrix.fromStateVector(plus0State);
    // Trace out qubit1
    const traced = partialTrace(rho, [1]);
    expect(traced.rows).toBe(2);
    // resulting density = |+><+| = [[0.5,0.5],[0.5,0.5]]
    expect(traced.get(0, 0).re).toBeCloseTo(0.5);
    expect(traced.get(1, 1).re).toBeCloseTo(0.5);
    expect(traced.get(0, 1).re).toBeCloseTo(0.5);
    expect(traced.get(1, 0).re).toBeCloseTo(0.5);
  });
}); 