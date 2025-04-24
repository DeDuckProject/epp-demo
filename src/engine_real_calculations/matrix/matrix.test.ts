import { describe, test, expect } from 'vitest';
import { Matrix } from './matrix';
import { ComplexNum } from '../types/complex';

describe('Matrix', () => {
  test('constructor and dimensions', () => {
    const data = [
      [ComplexNum.fromReal(1), ComplexNum.fromReal(2)],
      [ComplexNum.fromReal(3), ComplexNum.fromReal(4)]
    ];
    const m = new Matrix(data);
    expect(m.rows).toBe(2);
    expect(m.cols).toBe(2);
    expect(m.get(0, 0)).toEqual({ re: 1, im: 0 });
    expect(m.get(1, 1)).toEqual({ re: 4, im: 0 });
  });

  test('zeros and identity factories', () => {
    const zeros = Matrix.zeros(2, 3);
    expect(zeros.rows).toBe(2);
    expect(zeros.cols).toBe(3);
    expect(zeros.get(0, 0)).toEqual(ComplexNum.zero());
    expect(zeros.get(1, 2)).toEqual(ComplexNum.zero());

    const identity = Matrix.identity(2);
    expect(identity.get(0, 0)).toEqual(ComplexNum.one());
    expect(identity.get(1, 1)).toEqual(ComplexNum.one());
    expect(identity.get(0, 1)).toEqual(ComplexNum.zero());
    expect(identity.get(1, 0)).toEqual(ComplexNum.zero());
  });

  test('get and set', () => {
    const m = Matrix.zeros(2, 2);
    m.set(0, 1, { re: 5, im: 6 });
    expect(m.get(0, 1)).toEqual({ re: 5, im: 6 });
  });

  test('map', () => {
    const m = Matrix.identity(2);
    const doubled = m.map(val => ComplexNum.mul(val, ComplexNum.fromReal(2)));
    expect(doubled.get(0, 0)).toEqual({ re: 2, im: 0 });
    expect(doubled.get(1, 1)).toEqual({ re: 2, im: 0 });
    expect(doubled.get(0, 1)).toEqual({ re: 0, im: 0 });
  });

  test('zip and add', () => {
    const a = new Matrix([
      [ComplexNum.fromReal(1), ComplexNum.fromReal(2)],
      [ComplexNum.fromReal(3), ComplexNum.fromReal(4)]
    ]);
    const b = new Matrix([
      [ComplexNum.fromReal(5), ComplexNum.fromReal(6)],
      [ComplexNum.fromReal(7), ComplexNum.fromReal(8)]
    ]);
    const sum = a.add(b);
    expect(sum.get(0, 0)).toEqual({ re: 6, im: 0 });
    expect(sum.get(0, 1)).toEqual({ re: 8, im: 0 });
    expect(sum.get(1, 0)).toEqual({ re: 10, im: 0 });
    expect(sum.get(1, 1)).toEqual({ re: 12, im: 0 });
  });

  test('matrix multiplication', () => {
    const a = new Matrix([
      [ComplexNum.fromReal(1), ComplexNum.fromReal(2)],
      [ComplexNum.fromReal(3), ComplexNum.fromReal(4)]
    ]);
    const b = new Matrix([
      [ComplexNum.fromReal(5), ComplexNum.fromReal(6)],
      [ComplexNum.fromReal(7), ComplexNum.fromReal(8)]
    ]);
    const product = a.mul(b);
    expect(product.get(0, 0)).toEqual({ re: 19, im: 0 });
    expect(product.get(0, 1)).toEqual({ re: 22, im: 0 });
    expect(product.get(1, 0)).toEqual({ re: 43, im: 0 });
    expect(product.get(1, 1)).toEqual({ re: 50, im: 0 });
  });

  test('dagger (conjugate transpose)', () => {
    const m = new Matrix([
      [{ re: 1, im: 2 }, { re: 3, im: 4 }],
      [{ re: 5, im: 6 }, { re: 7, im: 8 }]
    ]);
    const mDagger = m.dagger();
    expect(mDagger.rows).toBe(2);
    expect(mDagger.cols).toBe(2);
    expect(mDagger.get(0, 0)).toEqual({ re: 1, im: -2 });
    expect(mDagger.get(0, 1)).toEqual({ re: 5, im: -6 });
    expect(mDagger.get(1, 0)).toEqual({ re: 3, im: -4 });
    expect(mDagger.get(1, 1)).toEqual({ re: 7, im: -8 });
  });

  test('tensor product', () => {
    const a = new Matrix([
      [ComplexNum.fromReal(1), ComplexNum.fromReal(2)],
      [ComplexNum.fromReal(3), ComplexNum.fromReal(4)]
    ]);
    const b = new Matrix([
      [ComplexNum.fromReal(0), ComplexNum.fromReal(5)],
      [ComplexNum.fromReal(6), ComplexNum.fromReal(7)]
    ]);
    const tensor = a.tensor(b);
    expect(tensor.rows).toBe(4);
    expect(tensor.cols).toBe(4);
    // Check a few elements
    expect(tensor.get(0, 0)).toEqual({ re: 0, im: 0 }); // 1*0
    expect(tensor.get(0, 1)).toEqual({ re: 5, im: 0 }); // 1*5
    expect(tensor.get(3, 3)).toEqual({ re: 28, im: 0 }); // 4*7
  });

  test('trace', () => {
    const m = new Matrix([
      [{ re: 1, im: 0 }, { re: 2, im: 0 }],
      [{ re: 3, im: 0 }, { re: 4, im: 0 }]
    ]);
    const tr = m.trace();
    expect(tr).toEqual({ re: 5, im: 0 });
  });

  test('scale', () => {
    const m = new Matrix([
      [ComplexNum.fromReal(1), ComplexNum.fromReal(2)],
      [ComplexNum.fromReal(3), ComplexNum.fromReal(4)]
    ]);
    const scaled = m.scale({ re: 2, im: 0 });
    expect(scaled.get(0, 0)).toEqual({ re: 2, im: 0 });
    expect(scaled.get(0, 1)).toEqual({ re: 4, im: 0 });
  });
}); 