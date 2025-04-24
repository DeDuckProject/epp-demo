import { describe, test, expect } from 'vitest';
import { cnotMatrix } from './cnot';
import { ComplexNum } from '../types/complex';

describe('CNOT Gates', () => {
  test('2-qubit CNOT matrix with control=0, target=1', () => {
    const cnot = cnotMatrix(2, 0, 1);
    expect(cnot.rows).toBe(4);
    expect(cnot.cols).toBe(4);
    
    // CNOT(0->1) should be:
    // [1, 0, 0, 0]
    // [0, 1, 0, 0]
    // [0, 0, 0, 1]
    // [0, 0, 1, 0]
    
    // Check the diagonal
    expect(cnot.get(0, 0)).toEqual(ComplexNum.one());
    expect(cnot.get(1, 1)).toEqual(ComplexNum.one());
    
    // Check the flipped elements in lower right
    expect(cnot.get(2, 3)).toEqual(ComplexNum.one());
    expect(cnot.get(3, 2)).toEqual(ComplexNum.one());
    
    // Check some zeroes
    expect(cnot.get(0, 2)).toEqual(ComplexNum.zero());
    expect(cnot.get(1, 3)).toEqual(ComplexNum.zero());
  });
  
  test('2-qubit CNOT matrix with control=1, target=0', () => {
    const cnot = cnotMatrix(2, 1, 0);
    expect(cnot.rows).toBe(4);
    
    // CNOT(1->0) should be:
    // [1, 0, 0, 0]
    // [0, 0, 0, 1]
    // [0, 0, 1, 0]
    // [0, 1, 0, 0]
    
    // Check the diagonal
    expect(cnot.get(0, 0)).toEqual(ComplexNum.one());
    expect(cnot.get(2, 2)).toEqual(ComplexNum.one());
    
    // Check the flipped elements
    expect(cnot.get(1, 3)).toEqual(ComplexNum.one());
    expect(cnot.get(3, 1)).toEqual(ComplexNum.one());
  });
  
  test('3-qubit CNOT with control=0, target=2', () => {
    const cnot = cnotMatrix(3, 0, 2);
    expect(cnot.rows).toBe(8);
    
    // In binary: |000⟩ → |000⟩, |001⟩ → |001⟩, |010⟩ → |010⟩, |011⟩ → |011⟩,
    //            |100⟩ → |101⟩, |101⟩ → |100⟩, |110⟩ → |111⟩, |111⟩ → |110⟩
    
    // Check unchanged states (control bit = 0)
    expect(cnot.get(0, 0)).toEqual(ComplexNum.one());
    expect(cnot.get(1, 1)).toEqual(ComplexNum.one());
    expect(cnot.get(2, 2)).toEqual(ComplexNum.one());
    expect(cnot.get(3, 3)).toEqual(ComplexNum.one());
    
    // Check flipped states (control bit = 1)
    expect(cnot.get(5, 4)).toEqual(ComplexNum.one()); // |100⟩ → |101⟩
    expect(cnot.get(4, 5)).toEqual(ComplexNum.one()); // |101⟩ → |100⟩
    expect(cnot.get(7, 6)).toEqual(ComplexNum.one()); // |110⟩ → |111⟩
    expect(cnot.get(6, 7)).toEqual(ComplexNum.one()); // |111⟩ → |110⟩
    
    // Verify other elements are zero
    expect(cnot.get(0, 4)).toEqual(ComplexNum.zero());
    expect(cnot.get(1, 5)).toEqual(ComplexNum.zero());
  });
  
  test('unitarity of CNOT matrix', () => {
    // U U^† = I
    const cnot = cnotMatrix(2, 0, 1);
    const cnotDagger = cnot.dagger();
    const product = cnot.mul(cnotDagger);
    
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const expected = i === j ? 1 : 0;
        expect(product.get(i, j).re).toBeCloseTo(expected);
        expect(product.get(i, j).im).toBeCloseTo(0);
      }
    }
  });
}); 