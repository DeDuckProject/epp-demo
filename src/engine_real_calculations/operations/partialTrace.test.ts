import { describe, test, expect } from 'vitest';
import { partialTrace } from './partialTrace';
import { DensityMatrix } from '../matrix/densityMatrix';
import { ComplexNum } from '../types/complex';

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
  
  test('tracing out one qubit from a Bell state', () => {
    // Create a Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2
    const bell = DensityMatrix.bellPhiPlus();
    
    // Trace out either qubit
    const traced = partialTrace(bell, [0]);
    
    // Result should be a completely mixed state
    expect(traced.rows).toBe(2);
    expect(traced.get(0, 0).re).toBeCloseTo(0.5);
    expect(traced.get(1, 1).re).toBeCloseTo(0.5);
    expect(traced.get(0, 1).re).toBeCloseTo(0);
    expect(traced.get(1, 0).re).toBeCloseTo(0);
    
    // Tracing out the other qubit should give the same result
    const traced2 = partialTrace(bell, [1]);
    expect(traced2.get(0, 0).re).toBeCloseTo(0.5);
    expect(traced2.get(1, 1).re).toBeCloseTo(0.5);
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

    // verify tracing other qubits still gives the mixed state
    traced = partialTrace(ghz, [0, 2]);

    // Result should be a 1-qubit mixed state
    expect(traced.rows).toBe(2);
    expect(traced.get(0, 0).re).toBeCloseTo(0.5);
    expect(traced.get(1, 1).re).toBeCloseTo(0.5);
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
}); 