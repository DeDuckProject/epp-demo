import { describe, test, expect } from 'vitest';
import { ComplexNum, Complex } from '../../../src/engine_real_calculations/types/complex';

describe('ComplexNum operations', () => {
  test('add and sub', () => {
    const a: Complex = { re: 1, im: 2 };
    const b: Complex = { re: 3, im: 4 };
    expect(ComplexNum.add(a, b)).toEqual({ re: 4, im: 6 });
    expect(ComplexNum.sub(a, b)).toEqual({ re: -2, im: -2 });
  });

  test('mul and div', () => {
    const a: Complex = { re: 1, im: 2 };
    const b: Complex = { re: 3, im: 4 };
    expect(ComplexNum.mul(a, b)).toEqual({ re: -5, im: 10 });
    const d = ComplexNum.div(a, b);
    const denom = b.re * b.re + b.im * b.im;
    expect(d.re).toBeCloseTo((a.re * b.re + a.im * b.im) / denom);
    expect(d.im).toBeCloseTo((a.im * b.re - a.re * b.im) / denom);
  });

  test('conj and abs2', () => {
    const a: Complex = { re: 5, im: -6 };
    expect(ComplexNum.conj(a)).toEqual({ re: 5, im: 6 });
    expect(ComplexNum.abs2(a)).toBeCloseTo(5 * 5 + 6 * 6,2);
  });

  test('zero, one, and fromReal', () => {
    expect(ComplexNum.zero()).toEqual({ re: 0, im: 0 });
    expect(ComplexNum.one()).toEqual({ re: 1, im: 0 });
    expect(ComplexNum.fromReal(7)).toEqual({ re: 7, im: 0 });
  });
}); 