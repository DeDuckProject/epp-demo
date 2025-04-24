import { describe, test, expect } from 'vitest';
import { pauliMatrix, pauliOperator } from './pauli';
import { ComplexNum } from '../types/complex';

describe('Pauli Operators', () => {
  test('pauliMatrix generates correct single-qubit operators', () => {
    // Identity matrix
    const I = pauliMatrix('I');
    expect(I.rows).toBe(2);
    expect(I.cols).toBe(2);
    expect(I.get(0, 0)).toEqual(ComplexNum.one());
    expect(I.get(1, 1)).toEqual(ComplexNum.one());
    expect(I.get(0, 1)).toEqual(ComplexNum.zero());
    expect(I.get(1, 0)).toEqual(ComplexNum.zero());
    
    // Pauli-X
    const X = pauliMatrix('X');
    expect(X.get(0, 0)).toEqual(ComplexNum.zero());
    expect(X.get(0, 1)).toEqual(ComplexNum.one());
    expect(X.get(1, 0)).toEqual(ComplexNum.one());
    expect(X.get(1, 1)).toEqual(ComplexNum.zero());
    
    // Pauli-Y
    const Y = pauliMatrix('Y');
    expect(Y.get(0, 0)).toEqual(ComplexNum.zero());
    expect(Y.get(0, 1)).toEqual({ re: 0, im: -1 });
    expect(Y.get(1, 0)).toEqual({ re: 0, im: 1 });
    expect(Y.get(1, 1)).toEqual(ComplexNum.zero());
    
    // Pauli-Z
    const Z = pauliMatrix('Z');
    expect(Z.get(0, 0)).toEqual(ComplexNum.one());
    expect(Z.get(0, 1)).toEqual(ComplexNum.zero());
    expect(Z.get(1, 0)).toEqual(ComplexNum.zero());
    expect(Z.get(1, 1)).toEqual({ re: -1, im: 0 });
  });

  test('pauliOperator creates correct multi-qubit operators simple - II', () => {
    // II - Identity on qubits 0 and 1
    const II = pauliOperator(2, [1], ['I']);
    expect(II.rows).toBe(4);
    expect(II.cols).toBe(4);

    // IX in 4x4 matrix form should be:
    // [1, 0, 0, 0]
    // [0, 1, 0, 0]
    // [0, 0, 1, 0]
    // [0, 0, 0, 1]
    expect(II.get(0, 0)).toEqual(ComplexNum.one());
    expect(II.get(1, 1)).toEqual(ComplexNum.one());
    expect(II.get(2, 2)).toEqual(ComplexNum.one());
    expect(II.get(3, 3)).toEqual(ComplexNum.one());
    for (let i=0;i<4; i++) {
      for (let j=0;i<4; i++) {
        if (i != j) {
          expect(II.get(i, j)).toEqual(ComplexNum.zero());
        }
      }
    }
  });

  test('pauliOperator creates correct multi-qubit operators - XI', () => {
    // XI - X on qubit 0, I on qubit 1
    const XI = pauliOperator(2, [0], ['X']);
    expect(XI.rows).toBe(4);
    expect(XI.cols).toBe(4);

    // IX in 4x4 matrix form should be:
    // [0, 0, 1, 0]
    // [0, 0, 0, 1]
    // [1, 0, 0, 0]
    // [0, 1, 0, 0]
    expect(XI.get(0, 2)).toEqual(ComplexNum.one());
    expect(XI.get(1, 3)).toEqual(ComplexNum.one());
    expect(XI.get(2, 0)).toEqual(ComplexNum.one());
    expect(XI.get(3, 1)).toEqual(ComplexNum.one());
  });
  
  test('pauliOperator creates correct multi-qubit operators - IX', () => {
    // IX - Identity on qubit 0, X on qubit 1
    const IX = pauliOperator(2, [1], ['X']);
    expect(IX.rows).toBe(4);
    expect(IX.cols).toBe(4);
    
    // IX in 4x4 matrix form should be:
    // [0, 1, 0, 0]
    // [1, 0, 0, 0]
    // [0, 0, 0, 1]
    // [0, 0, 1, 0]
    expect(IX.get(0, 1)).toEqual(ComplexNum.one());
    expect(IX.get(1, 0)).toEqual(ComplexNum.one());
    expect(IX.get(2, 3)).toEqual(ComplexNum.one());
    expect(IX.get(3, 2)).toEqual(ComplexNum.one());
  });

  test('pauliOperator creates correct multi-qubit operators - IIX', () => {
    // IIX - X on qubit 2, Identity on 0 and 1
    const IIX = pauliOperator(3, [2], ['X']);
    expect(IIX.rows).toBe(8);
    expect(IIX.cols).toBe(8);

    // Check a few elements
    expect(IIX.get(0, 1)).toEqual(ComplexNum.one());
    expect(IIX.get(1, 0)).toEqual(ComplexNum.one());
    expect(IIX.get(2, 3)).toEqual(ComplexNum.one());
    expect(IIX.get(3, 2)).toEqual(ComplexNum.one());
    expect(IIX.get(4, 5)).toEqual(ComplexNum.one());
    expect(IIX.get(5, 4)).toEqual(ComplexNum.one());
    expect(IIX.get(6, 7)).toEqual(ComplexNum.one());
    expect(IIX.get(7, 6)).toEqual(ComplexNum.one());

    // Verify diagonal is 0:
    for (let i=0;i<8; i++) {
      expect(IIX.get(i, i)).toEqual(ComplexNum.zero());
    }
  });
  
  test('pauliOperator with multiple targets - XY', () => {
    // XY - X on qubit 0, Y on qubit 1
    const XY = pauliOperator(2, [0, 1], ['X', 'Y']);
    expect(XY.rows).toBe(4);
    
    // Since it's X ⊗ Y, we should get:
    // X = [0 1; 1 0], Y = [0 -i; i 0]
    // XY = [0*0 0*-i 1*0 1*-i; 0*i 0*0 1*i 1*0; 1*0 1*-i 0*0 0*-i; 1*i 1*0 0*i 0*0]
    //    = [0 0 0 -i; 0 0 i 0; 0 -i 0 0; i 0 0 0]
    
    // Check some off-diagonal elements
    expect(XY.get(0, 3)).toEqual({ re: 0, im: -1 });
    expect(XY.get(1, 2)).toEqual({ re: 0, im: 1 });
    expect(XY.get(2, 1)).toEqual({ re: 0, im: -1 });
    expect(XY.get(3, 0)).toEqual({ re: 0, im: 1 });
  });

  test('pauliOperator with multiple targets - XZ', () => {
    // XZ - Identity on qubit 0, X on qubit 1
    const XZ = pauliOperator(2, [0,1], ['X', 'Z']);
    expect(XZ.rows).toBe(4);
    expect(XZ.cols).toBe(4);

    // XZ in 4x4 matrix form should be:
    // [0, 0, 1, 0]
    // [0, 0, 0, -1]
    // [1, 0, 0, 0]
    // [0, -1, 0, 0]
    expect(XZ.get(0, 2)).toEqual(ComplexNum.one());
    expect(XZ.get(1, 3)).toEqual({re: -1, im: 0});
    expect(XZ.get(2, 0)).toEqual(ComplexNum.one());
    expect(XZ.get(3, 1)).toEqual({re: -1, im: 0});
    // Verify diagonal is 0:
    for (let i=0;i<4; i++) {
      expect(XZ.get(i, i)).toEqual(ComplexNum.zero());
    }
  });
  
  test('pauliOperator handles identity operations correctly', () => {
    // III - Identity on all 3 qubits
    const III = pauliOperator(3, [0, 1, 2], ['I', 'I', 'I']);
    expect(III.rows).toBe(8);
    
    // Should be 8x8 identity matrix
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (i === j) {
          expect(III.get(i, j)).toEqual(ComplexNum.one());
        } else {
          expect(III.get(i, j)).toEqual(ComplexNum.zero());
        }
      }
    }
  });
}); 