import { describe, test, expect } from 'vitest';
import { kroneckerMatrix } from './tensor';
import { ComplexNum } from '../types/complex';

describe('Tensor Product Utils', () => {
  test('kroneckerMatrix with 2x2 matrices', () => {
    // Create 2x2 matrices
    const a = [
      [ComplexNum.fromReal(1), ComplexNum.fromReal(2)],
      [ComplexNum.fromReal(3), ComplexNum.fromReal(4)]
    ];
    
    const b = [
      [ComplexNum.fromReal(0), ComplexNum.fromReal(5)],
      [ComplexNum.fromReal(6), ComplexNum.fromReal(7)]
    ];
    
    const result = kroneckerMatrix(a, b);
    
    // Result should be 4x4
    expect(result.length).toBe(4);
    expect(result[0].length).toBe(4);
    
    // Check specific elements
    // a[0,0] * b = [ [0, 5], [6, 7] ] (scaled by 1)
    expect(result[0][0]).toEqual({ re: 0, im: 0 });
    expect(result[0][1]).toEqual({ re: 5, im: 0 });
    expect(result[1][0]).toEqual({ re: 6, im: 0 });
    expect(result[1][1]).toEqual({ re: 7, im: 0 });
    
    // a[0,1] * b = [ [0, 5], [6, 7] ] (scaled by 2)
    expect(result[0][2]).toEqual({ re: 0, im: 0 });
    expect(result[0][3]).toEqual({ re: 10, im: 0 });
    expect(result[1][2]).toEqual({ re: 12, im: 0 });
    expect(result[1][3]).toEqual({ re: 14, im: 0 });
    
    // a[1,0] * b = [ [0, 5], [6, 7] ] (scaled by 3)
    expect(result[2][0]).toEqual({ re: 0, im: 0 });
    expect(result[2][1]).toEqual({ re: 15, im: 0 });
    expect(result[3][0]).toEqual({ re: 18, im: 0 });
    expect(result[3][1]).toEqual({ re: 21, im: 0 });
    
    // a[1,1] * b = [ [0, 5], [6, 7] ] (scaled by 4)
    expect(result[2][2]).toEqual({ re: 0, im: 0 });
    expect(result[2][3]).toEqual({ re: 20, im: 0 });
    expect(result[3][2]).toEqual({ re: 24, im: 0 });
    expect(result[3][3]).toEqual({ re: 28, im: 0 });
  });
  
  test('kroneckerMatrix with complex values', () => {
    const a = [
      [{ re: 0, im: 1 }]
    ];
    
    const b = [
      [{ re: 1, im: 0 }, { re: 0, im: 1 }],
      [{ re: 0, im: -1 }, { re: 1, im: 0 }]
    ];
    
    const result = kroneckerMatrix(a, b);
    
    // Result should be 2x2
    expect(result.length).toBe(2);
    expect(result[0].length).toBe(2);
    
    // Calculate i * [ [1, i], [−i, 1] ]
    expect(result[0][0]).toEqual({ re: 0, im: 1 });
    expect(result[0][1]).toEqual({ re: -1, im: 0 });
    expect(result[1][0]).toEqual({ re: 1, im: 0 });
    expect(result[1][1]).toEqual({ re: 0, im: 1 });
  });
  
  test('kroneckerMatrix with different dimensions', () => {
    // 1x2 ⊗ 2x1 = 2x2
    const a = [
      [ComplexNum.fromReal(1), ComplexNum.fromReal(2)]
    ];
    
    const b = [
      [ComplexNum.fromReal(3)],
      [ComplexNum.fromReal(4)]
    ];
    
    const result = kroneckerMatrix(a, b);
    
    expect(result.length).toBe(2);
    expect(result[0].length).toBe(2);
    
    expect(result[0][0]).toEqual({ re: 3, im: 0 });
    expect(result[0][1]).toEqual({ re: 6, im: 0 });
    expect(result[1][0]).toEqual({ re: 4, im: 0 });
    expect(result[1][1]).toEqual({ re: 8, im: 0 });
  });
}); 