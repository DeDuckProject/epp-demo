import { describe, test, expect } from 'vitest';
import { applyDepolarizing, applyDephasing } from './noise';
import { DensityMatrix } from '../matrix/densityMatrix';
import { ComplexNum } from '../types/complex';

describe('Quantum Noise Channels', () => {
  test('applyDephasing preserves traces', () => {
    // Create a pure state |+⟩
    const plus = [
      { re: 1/Math.sqrt(2), im: 0 },
      { re: 1/Math.sqrt(2), im: 0 }
    ];
    const rho = DensityMatrix.fromStateVector(plus);
    
    // Apply dephasing with different probabilities
    const dephased1 = applyDephasing(rho, 0, 0.5);
    const dephased2 = applyDephasing(rho, 0, 1.0);
    
    // Trace should be preserved
    expect(dephased1.trace().re).toBeCloseTo(1.0);
    expect(dephased2.trace().re).toBeCloseTo(1.0);
    
    // For p=1, dephasing should produce a completely mixed state
    // |+⟩⟨+| -> 0.5|0⟩⟨0| + 0.5|1⟩⟨1|
    expect(dephased2.get(0, 0).re).toBeCloseTo(0.5);
    expect(dephased2.get(1, 1).re).toBeCloseTo(0.5);
    expect(dephased2.get(0, 1).re).toBeCloseTo(0);
    expect(dephased2.get(1, 0).re).toBeCloseTo(0);
  });
  
  test('applyDepolarizing produces correct mixed state', () => {
    // Create pure state |0⟩
    const zero = new DensityMatrix([
      [ComplexNum.one(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero()]
    ]);
    
    // Apply depolarizing with probability 1.0
    const depolarized = applyDepolarizing(zero, 0, 1.0);
    
    // Should be completely mixed state with diagonal = 0.5
    expect(depolarized.get(0, 0).re).toBeCloseTo(0.5);
    expect(depolarized.get(1, 1).re).toBeCloseTo(0.5);
    expect(depolarized.get(0, 1).re).toBeCloseTo(0);
    expect(depolarized.get(1, 0).re).toBeCloseTo(0);
    
    // Trace should be preserved
    expect(depolarized.trace().re).toBeCloseTo(1.0);
  });
  
  test('applyDepolarizing with p=0 preserves state', () => {
    // Create Bell state
    const bell = DensityMatrix.bellPhiPlus();
    
    // Apply depolarizing with probability 0
    const result = applyDepolarizing(bell, 0, 0);
    
    // State should be unchanged
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        expect(result.get(i, j).re).toBeCloseTo(bell.get(i, j).re);
        expect(result.get(i, j).im).toBeCloseTo(bell.get(i, j).im);
      }
    }
  });
  
  test('noise channels on multi-qubit systems', () => {
    // Create a 2-qubit state |00⟩
    const data = [
      [ComplexNum.one(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()]
    ];
    const state = new DensityMatrix(data);
    
    // Apply dephasing to qubit 1
    const dephased = applyDephasing(state, 1, 0.5);
    
    // Since |00⟩ is already an eigenstate of Z on qubit 1, it should be unchanged
    expect(dephased.get(0, 0).re).toBeCloseTo(1.0);
    
    // Apply depolarizing to qubit 0
    const depolarized = applyDepolarizing(state, 0, 0.5);
    
    // Trace should be preserved
    expect(depolarized.trace().re).toBeCloseTo(1.0);
    
    // State should be mixed, but not completely
    expect(depolarized.get(0, 0).re).toBeGreaterThan(0.5);
    expect(depolarized.get(2, 2).re).toBeGreaterThan(0);
  });
}); 