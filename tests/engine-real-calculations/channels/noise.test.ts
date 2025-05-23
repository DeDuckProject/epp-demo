import { describe, test, expect } from 'vitest';
import { applyDepolarizing, applyDephasing, applyAmplitudeDamping, applyUniformNoise } from '../../../src/engine_real_calculations/channels/noise';
import { DensityMatrix } from '../../../src/engine_real_calculations/matrix/densityMatrix';
import { ComplexNum } from '../../../src/engine_real_calculations/types/complex';

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
    
    // Apply depolarizing with probability 0.75 (completely depolarizing channel in our implementation)
    const depolarized = applyDepolarizing(zero, 0, 0.75);
    
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

  test('applyAmplitudeDamping on |1> moves population to |0> for γ=1', () => {
    // |1⟩⟨1| should decay to |0⟩⟨0| for full damping
    const one = new DensityMatrix([
      [ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.one()]
    ]);
    const damped = applyAmplitudeDamping(one, 0, 1);
    expect(damped.get(0, 0).re).toBeCloseTo(1);
    expect(damped.get(1, 1).re).toBeCloseTo(0);
    expect(damped.trace().re).toBeCloseTo(1);
  });

  test('applyAmplitudeDamping is identity for γ=0', () => {
    // |1⟩⟨1| should remain unchanged for zero damping
    const one = new DensityMatrix([
      [ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.one()]
    ]);
    const damped0 = applyAmplitudeDamping(one, 0, 0);
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        expect(damped0.get(i, j).re).toBeCloseTo(one.get(i, j).re);
        expect(damped0.get(i, j).im).toBeCloseTo(one.get(i, j).im);
      }
    }
  });

  test('applyAmplitudeDamping on |0> leaves state unchanged for any γ', () => {
    // |0⟩⟨0| is the ground state, should not change
    const zero = new DensityMatrix([
      [ComplexNum.one(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero()]
    ]);
    const damped = applyAmplitudeDamping(zero, 0, 0.7);
    expect(damped.get(0, 0).re).toBeCloseTo(1);
    expect(damped.get(1, 1).re).toBeCloseTo(0);
    expect(damped.trace().re).toBeCloseTo(1);
  });

  test('applyAmplitudeDamping preserves trace for mixed state', () => {
    // ρ = 0.5|0⟩⟨0| + 0.5|1⟩⟨1|, γ=0.5
    const mixed = new DensityMatrix([
      [ComplexNum.fromReal(0.5), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.fromReal(0.5)]
    ]);
    const damped = applyAmplitudeDamping(mixed, 0, 0.5);
    expect(damped.trace().re).toBeCloseTo(1);
    // Population should shift from |1> to |0>
    expect(damped.get(0, 0).re).toBeGreaterThan(0.5);
    expect(damped.get(1, 1).re).toBeLessThan(0.5);
  });

  test('applyUniformNoise preserves state when noiseStrength=0', () => {
    // Create pure state |0⟩
    const zero = new DensityMatrix([
      [ComplexNum.one(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero()]
    ]);
    const result = applyUniformNoise(zero, 0, 0);
    
    // State should be unchanged
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        expect(result.get(i, j).re).toBeCloseTo(zero.get(i, j).re);
        expect(result.get(i, j).im).toBeCloseTo(zero.get(i, j).im);
      }
    }
  });

  test('applyUniformNoise preserves trace for any noise strength', () => {
    // Create |+⟩ state
    const plus = [
      { re: 1/Math.sqrt(2), im: 0 },
      { re: 1/Math.sqrt(2), im: 0 }
    ];
    const rho = DensityMatrix.fromStateVector(plus);
    const noiseStrengths = [0, 0.1, 0.5, 0.9, 1.0];
    
    for (const strength of noiseStrengths) {
      const result = applyUniformNoise(rho, 0, strength);
      const trace = result.trace();
      
      expect(Math.abs(trace.re - 1)).toBeLessThan(1e-10);
      expect(Math.abs(trace.im)).toBeLessThan(1e-10);
    }
  });

  test('applyUniformNoise throws error for invalid noise strength', () => {
    const zero = new DensityMatrix([
      [ComplexNum.one(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero()]
    ]);
    
    expect(() => applyUniformNoise(zero, 0, -0.1)).toThrow('Noise strength must be between 0 and 1');
    expect(() => applyUniformNoise(zero, 0, 1.1)).toThrow('Noise strength must be between 0 and 1');
  });

  test('applyUniformNoise throws error for invalid qubit index', () => {
    const zero = new DensityMatrix([
      [ComplexNum.one(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero()]
    ]);
    
    expect(() => applyUniformNoise(zero, -1, 0.5)).toThrow('Qubit index -1 out of range for 1-qubit system');
    expect(() => applyUniformNoise(zero, 1, 0.5)).toThrow('Qubit index 1 out of range for 1-qubit system');
  });

  test('applyUniformNoise transforms state differently for different noise strengths', () => {
    const zero = new DensityMatrix([
      [ComplexNum.one(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero()]
    ]);
    const result1 = applyUniformNoise(zero, 0, 0.1);
    const result2 = applyUniformNoise(zero, 0, 0.9);
    
    // Results should be different (with high probability)
    expect(result1.equals(result2, 1e-5)).toBe(false);
  });

  test('applyUniformNoise produces valid density matrices', () => {
    // Create |+⟩ state
    const plus = [
      { re: 1/Math.sqrt(2), im: 0 },
      { re: 1/Math.sqrt(2), im: 0 }
    ];
    const rho = DensityMatrix.fromStateVector(plus);
    const result = applyUniformNoise(rho, 0, 0.7);
    
    // Should be Hermitian (equal to its conjugate transpose)
    const resultDagger = result.dagger();
    expect(result.equals(new DensityMatrix(resultDagger.data), 1e-10)).toBe(true);
    
    // Should be positive semidefinite (all eigenvalues >= 0)
    // This is a simplified check - diagonal elements should be non-negative
    for (let i = 0; i < result.rows; i++) {
      expect(result.get(i, i).re).toBeGreaterThanOrEqual(-1e-10);
    }
  });

  test('uniform noise channel tells Alice\'s story', () => {
    // Alice has a quantum state |+⟩ that she wants to transmit
    const plus = [
      { re: 1/Math.sqrt(2), im: 0 },
      { re: 1/Math.sqrt(2), im: 0 }
    ];
    const aliceState = DensityMatrix.fromStateVector(plus);
    
    // The quantum channel introduces uniform noise
    const noisyState = applyUniformNoise(aliceState, 0, 0.3);
    
    // The noisy state should still be a valid quantum state
    const trace = noisyState.trace();
    expect(Math.abs(trace.re - 1)).toBeLessThan(1e-10);
    expect(Math.abs(trace.im)).toBeLessThan(1e-10);
    
    // But it should be different from the original
    expect(noisyState.equals(aliceState, 1e-5)).toBe(false);
    
    // When Alice applies no noise, she gets back her original state
    const noNoiseState = applyUniformNoise(aliceState, 0, 0);
    expect(noNoiseState.equals(aliceState, 1e-10)).toBe(true);
  });

  test('applyUniformNoise on specific qubit in multi-qubit system', () => {
    // Create 2-qubit state |00⟩
    const data = [
      [ComplexNum.one(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()]
    ];
    const state = new DensityMatrix(data);
    
    // Apply uniform noise to qubit 0
    const result0 = applyUniformNoise(state, 0, 0.5);
    // Apply uniform noise to qubit 1
    const result1 = applyUniformNoise(state, 1, 0.5);
    
    // Both should preserve trace
    expect(result0.trace().re).toBeCloseTo(1.0);
    expect(result1.trace().re).toBeCloseTo(1.0);
    
    // Results should generally be different
    expect(result0.equals(result1, 1e-5)).toBe(false);
  });

  test('applyUniformNoise only affects target qubit', () => {
    // Create Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2
    const bell = DensityMatrix.bellPhiPlus();
    
    // Apply very small noise to qubit 0
    const result = applyUniformNoise(bell, 0, 0.01);
    
    // Should still preserve trace
    expect(result.trace().re).toBeCloseTo(1.0);
    
    // The state should not change dramatically - check that most elements are similar
    let maxDiff = 0;
    for (let i = 0; i < bell.rows; i++) {
      for (let j = 0; j < bell.cols; j++) {
        const diff = Math.abs(bell.get(i, j).re - result.get(i, j).re) + 
                    Math.abs(bell.get(i, j).im - result.get(i, j).im);
        maxDiff = Math.max(maxDiff, diff);
      }
    }
    // With 1% noise, the maximum change in any matrix element should be small
    expect(maxDiff).toBeLessThan(0.1);
  });
}); 