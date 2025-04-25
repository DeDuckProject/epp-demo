import { describe, test, expect } from 'vitest';
import { applyGate } from '../../../src/engine_real_calculations/operations/applyGate';
import { DensityMatrix } from '../../../src/engine_real_calculations/matrix/densityMatrix';
import { Matrix } from '../../../src/engine_real_calculations/matrix/matrix';
import { ComplexNum } from '../../../src/engine_real_calculations/types/complex';

describe('Apply Gate Operations', () => {
  test('applying Pauli-X gate to |0⟩ state', () => {
    // Create |0⟩ state
    const zeroState = new DensityMatrix([
      [ComplexNum.one(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero()]
    ]);
    
    // Create Pauli-X gate
    const X = new Matrix([
      [ComplexNum.zero(), ComplexNum.one()],
      [ComplexNum.one(), ComplexNum.zero()]
    ]);
    
    // Apply X to |0⟩, should get |1⟩
    const result = applyGate(zeroState, X);
    
    // Check result is |1⟩⟨1|
    expect(result.get(0, 0).re).toBeCloseTo(0);
    expect(result.get(1, 1).re).toBeCloseTo(1);
    
    // Trace should be preserved
    expect(result.trace().re).toBeCloseTo(1);
  });
  
  test('applying Hadamard gate to |0⟩ state', () => {
    // Create |0⟩ state
    const zeroState = new DensityMatrix([
      [ComplexNum.one(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero()]
    ]);
    
    // Create Hadamard gate = 1/√2 * [1 1; 1 -1]
    const s = 1 / Math.sqrt(2);
    const H = new Matrix([
      [{ re: s, im: 0 }, { re: s, im: 0 }],
      [{ re: s, im: 0 }, { re: -s, im: 0 }]
    ]);
    
    // Apply H to |0⟩, should get |+⟩ = (|0⟩ + |1⟩)/√2
    const result = applyGate(zeroState, H);
    
    // Check result is |+⟩⟨+|
    expect(result.get(0, 0).re).toBeCloseTo(0.5);
    expect(result.get(0, 1).re).toBeCloseTo(0.5);
    expect(result.get(1, 0).re).toBeCloseTo(0.5);
    expect(result.get(1, 1).re).toBeCloseTo(0.5);
  });
  
  test('applying identity gate preserves state', () => {
    // Create a Bell state
    const bell = DensityMatrix.bellPhiPlus();
    
    // Apply identity to the bell state
    const I = Matrix.identity(4);
    const result = applyGate(bell, I);
    
    // State should be unchanged
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        expect(result.get(i, j).re).toBeCloseTo(bell.get(i, j).re);
        expect(result.get(i, j).im).toBeCloseTo(bell.get(i, j).im);
      }
    }
  });
  
  test('applying phase gate to superposition', () => {
    // Create |+⟩ state = (|0⟩ + |1⟩)/√2
    const plus = DensityMatrix.fromStateVector([
      { re: 1/Math.sqrt(2), im: 0 }, 
      { re: 1/Math.sqrt(2), im: 0 }
    ]);
    
    // Create phase gate S = [1 0; 0 i]
    const S = new Matrix([
      [ComplexNum.one(), ComplexNum.zero()],
      [ComplexNum.zero(), { re: 0, im: 1 }]
    ]);
    
    // Apply S to |+⟩, should get (|0⟩ + i|1⟩)/√2
    const result = applyGate(plus, S);
    
    // Check diagonal elements remain unchanged
    expect(result.get(0, 0).re).toBeCloseTo(0.5);
    expect(result.get(1, 1).re).toBeCloseTo(0.5);
    
    // Check off-diagonal coherence terms get a phase change - Verified correctness with quirk
    expect(result.get(0, 1).im).toBeCloseTo(-0.5);
    expect(result.get(1, 0).im).toBeCloseTo(0.5);
  });
}); 