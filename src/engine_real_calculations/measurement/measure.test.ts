import { describe, test, expect, vi, afterEach } from 'vitest';
import { measureQubit } from './measure';
import { DensityMatrix } from '../matrix/densityMatrix';
import { ComplexNum } from '../types/complex';

describe('Quantum Measurement', () => {
  test('measurement of |0⟩ state gives deterministic result', () => {
    // State |0⟩⟨0|
    const zero = new DensityMatrix([
      [ComplexNum.one(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero()]
    ]);
    
    // Set random to return 0.3 (should give outcome 0)
    vi.spyOn(Math, 'random').mockReturnValue(0.3);
    
    const result = measureQubit(zero, 0);
    expect(result.outcome).toBe(0);
    expect(result.probability).toBeCloseTo(1.0);
    // Verify postState: should be collapsed onto |0⟩ state
    expect(result.postState.get(0, 0).re).toBeCloseTo(1.0);
    expect(result.postState.get(1, 1).re).toBeCloseTo(0.0);
  });
  
  test('measurement of |1⟩ state gives deterministic result', () => {
    // State |1⟩⟨1|
    const one = new DensityMatrix([
      [ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.one()]
    ]);
    
    // Set random to return 0.3 (should give outcome 1)
    vi.spyOn(Math, 'random').mockReturnValue(0.3);
    
    const result = measureQubit(one, 0);
    expect(result.outcome).toBe(1);
    expect(result.probability).toBeCloseTo(1.0);
    // Verify postState: should be collapsed onto |1⟩ state
    expect(result.postState.get(1, 1).re).toBeCloseTo(1.0);
    expect(result.postState.get(0, 0).re).toBeCloseTo(0.0);
  });
  
  test('measurement of mixed state has correct probabilities', () => {
    // Mixed state 0.7|0⟩⟨0| + 0.3|1⟩⟨1|
    const mixed = new DensityMatrix([
      [{ re: 0.7, im: 0 }, ComplexNum.zero()],
      [ComplexNum.zero(), { re: 0.3, im: 0 }]
    ]);
    
    // Test outcome 0
    vi.spyOn(Math, 'random').mockReturnValue(0.5);  // 0.5 < 0.7, so outcome is 0
    let result = measureQubit(mixed, 0);
    expect(result.outcome).toBe(0);
    expect(result.probability).toBeCloseTo(0.7);
    // Verify postState for outcome 0: element (0,0) becomes 1 and (1,1) is 0
    expect(result.postState.get(0, 0).re).toBeCloseTo(1.0);
    expect(result.postState.get(1, 1).re).toBeCloseTo(0.0);
    
    // Test outcome 1
    vi.spyOn(Math, 'random').mockReturnValue(0.8);  // 0.8 > 0.7, so outcome is 1
    result = measureQubit(mixed, 0);
    expect(result.outcome).toBe(1);
    expect(result.probability).toBeCloseTo(0.3);
    // Verify postState for outcome 1: element (1,1) becomes 1 and (0,0) is 0
    expect(result.postState.get(1, 1).re).toBeCloseTo(1.0);
    expect(result.postState.get(0, 0).re).toBeCloseTo(0.0);
  });
  
  test('measurement of multi-qubit system', () => {
    // Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2
    const bell = DensityMatrix.bellPhiPlus();
    
    // Mock random
    vi.spyOn(Math, 'random').mockReturnValue(0.4);
    
    // Measure qubit 0
    const result = measureQubit(bell, 0);
    
    // Should have 50% probability for each outcome
    expect(result.probability).toBeCloseTo(0.5);
    // Verify postState: for 2-qubit Bell state using big-endian, bitIndex = 1 for qubit0
      expect(result.postState.get(0, 0).re).toBeCloseTo(1.0);
  });
  
  test('measuring different qubits in a system', () => {
    // 2-qubit state |+⟩⊗|0⟩ = (|00⟩ + |10⟩)/√2
    const vec = [
      { re: 1/Math.sqrt(2), im: 0 },
      ComplexNum.zero(),
      { re: 1/Math.sqrt(2), im: 0 },
      ComplexNum.zero()
    ];
    const state = DensityMatrix.fromStateVector(vec);
    
    // Measure qubit 0 (the |+⟩ qubit)
    vi.spyOn(Math, 'random').mockReturnValue(0.4);
    const result0 = measureQubit(state, 0);
    
    // Should have 50% probability for 0 or 1
    expect(result0.probability).toBeCloseTo(0.5);
    // Verify postState for measurement on qubit 0; for outcome 0, expect index 0 to be 1
    expect(result0.postState.get(0, 0).re).toBeCloseTo(1.0);
    
    // Measure qubit 1 (the |0⟩ qubit)
    vi.spyOn(Math, 'random').mockReturnValue(0.4);
    const result1 = measureQubit(result0.postState, 1);
    
    // Should have 100% probability for 0
    expect(result1.outcome).toBe(0);
    expect(result1.probability).toBeCloseTo(1.0);
    // Verify postState for measurement on qubit 1; for outcome 0 with qubit1 (bitIndex = 0), index 0 should be 1
    expect(result1.postState.get(0, 0).re).toBeCloseTo(1.0);
  });
  
  test('Bell state measurements yield correlated outcomes without mocking random', () => {
    for (let i = 0; i < 100; i++) { // 20 times to make sure it's not just luck
      // Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2
      const bell = DensityMatrix.bellPhiPlus();

      // Do not mock Math.random; measurements are independent and may not always correlate
      const result0 = measureQubit(bell, 0);
      const result1 = measureQubit(result0.postState, 1);

      // This test expects both measurements to yield the same outcome
      expect(result0.outcome).toBe(result1.outcome);
      // Additionally verify the postState of the second measurement
      if (result1.outcome === 0) {
        expect(result1.postState.get(0, 0).re).toBeCloseTo(1.0);
      } else {
        expect(result1.postState.get(3, 3).re).toBeCloseTo(1.0);
      }
    }
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
}); 