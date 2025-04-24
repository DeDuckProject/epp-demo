import { describe, test, expect, vi, afterEach } from 'vitest';
import { measureQubit } from './measure';
import { DensityMatrix } from '../matrix/densityMatrix';
import { ComplexNum } from '../types/complex';

// Mock Math.random
vi.mock('Math', () => ({
  random: vi.fn()
}));

describe('Quantum Measurement', () => {
  test('measurement of |0⟩ state gives deterministic result', () => {
    // State |0⟩⟨0|
    const zero = new DensityMatrix([
      [ComplexNum.one(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero()]
    ]);
    
    // Set random to return 0.3 (should give outcome 0)
    vi.mocked(Math.random).mockReturnValue(0.3);
    
    const result = measureQubit(zero, 0);
    expect(result.outcome).toBe(0);
    expect(result.probability).toBeCloseTo(1.0);
  });
  
  test('measurement of |1⟩ state gives deterministic result', () => {
    // State |1⟩⟨1|
    const one = new DensityMatrix([
      [ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.one()]
    ]);
    
    // Set random to return 0.3 (should give outcome 1)
    vi.mocked(Math.random).mockReturnValue(0.3);
    
    const result = measureQubit(one, 0);
    expect(result.outcome).toBe(1);
    expect(result.probability).toBeCloseTo(1.0);
  });
  
  test('measurement of mixed state has correct probabilities', () => {
    // Mixed state 0.7|0⟩⟨0| + 0.3|1⟩⟨1|
    const mixed = new DensityMatrix([
      [{ re: 0.7, im: 0 }, ComplexNum.zero()],
      [ComplexNum.zero(), { re: 0.3, im: 0 }]
    ]);
    
    // Test outcome 0
    vi.mocked(Math.random).mockReturnValue(0.5);  // 0.5 < 0.7, so outcome is 0
    let result = measureQubit(mixed, 0);
    expect(result.outcome).toBe(0);
    expect(result.probability).toBeCloseTo(0.7);
    
    // Test outcome 1
    vi.mocked(Math.random).mockReturnValue(0.8);  // 0.8 > 0.7, so outcome is 1
    result = measureQubit(mixed, 0);
    expect(result.outcome).toBe(1);
    expect(result.probability).toBeCloseTo(0.3);
  });
  
  test('measurement of multi-qubit system', () => {
    // Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2
    const bell = DensityMatrix.bellPhiPlus();
    
    // Mock random
    vi.mocked(Math.random).mockReturnValue(0.4);
    
    // Measure qubit 0
    const result = measureQubit(bell, 0);
    
    // Should have 50% probability for each outcome
    expect(result.probability).toBeCloseTo(0.5);
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
    vi.mocked(Math.random).mockReturnValue(0.4);
    const result0 = measureQubit(state, 0);
    
    // Should have 50% probability for 0 or 1
    expect(result0.probability).toBeCloseTo(0.5);
    
    // Measure qubit 1 (the |0⟩ qubit)
    vi.mocked(Math.random).mockReturnValue(0.4);
    const result1 = measureQubit(state, 1);
    
    // Should have 100% probability for 0
    expect(result1.outcome).toBe(0);
    expect(result1.probability).toBeCloseTo(1.0);
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
}); 