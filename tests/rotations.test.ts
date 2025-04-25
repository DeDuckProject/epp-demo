import { describe, test, expect } from 'vitest';
import { rx, ry, rz } from '../src/engine_real_calculations/gates/rotations';
import { pauliMatrix } from '../src/engine_real_calculations/gates/pauli';
import { Matrix } from '../src/engine_real_calculations/matrix/matrix';

describe('Rotation Gates', () => {
  test('R_x(π) is equivalent to Pauli X up to global phase', () => {
    const rx_pi = rx(Math.PI);
    const X = pauliMatrix('X');
    expect(rx_pi.equalsUpToGlobalPhase(X)).toBe(true);
  });

  test('R_y(π) is equivalent to Pauli Y up to global phase', () => {
    const ry_pi = ry(Math.PI);
    const Y = pauliMatrix('Y');
    expect(ry_pi.equalsUpToGlobalPhase(Y)).toBe(true);
  });

  test('R_z(π) is equivalent to Pauli Z up to global phase', () => {
    const rz_pi = rz(Math.PI);
    const Z = pauliMatrix('Z');
    expect(rz_pi.equalsUpToGlobalPhase(Z)).toBe(true);
  });

  test('Applying R_x(π/2) twice equals R_x(π) which is equivalent to Pauli X up to global phase', () => {
    const rx_pi_over_2 = rx(Math.PI / 2);
    const product = rx_pi_over_2.mul(rx_pi_over_2);
    const X = pauliMatrix('X');
    expect(product.equalsUpToGlobalPhase(X)).toBe(true);
  });

  test('Rotation gate with non-π angle does not equal any Pauli matrix', () => {
    const rx_angle = rx(Math.PI / 4);
    const X = pauliMatrix('X');
    expect(rx_angle.equalsUpToGlobalPhase(X)).toBe(false);
  });
});

describe('Single-step rotation tests', () => {
  test('R_x(π/2) and R_x(-π/2) single application results', () => {
    const angle = Math.PI / 2;
    const negAngle = -Math.PI / 2;
    const cosPos = Math.cos(angle / 2);
    const sinPos = Math.sin(angle / 2);
    const cosNeg = Math.cos(negAngle / 2);
    const sinNeg = Math.sin(negAngle / 2);

    const expectedPos = new Matrix([
      [{ re: cosPos, im: 0 }, { re: 0, im: -sinPos }],
      [{ re: 0, im: -sinPos }, { re: cosPos, im: 0 }]
    ]);

    const expectedNeg = new Matrix([
      [{ re: cosNeg, im: 0 }, { re: 0, im: -sinNeg }],
      [{ re: 0, im: -sinNeg }, { re: cosNeg, im: 0 }]
    ]);

    const actualPos = rx(angle);
    const actualNeg = rx(negAngle);

    for (let i = 0; i < expectedPos.rows; i++) {
      for (let j = 0; j < expectedPos.cols; j++) {
        expect(actualPos.get(i, j).re).toBeCloseTo(expectedPos.get(i, j).re, 10);
        expect(actualPos.get(i, j).im).toBeCloseTo(expectedPos.get(i, j).im, 10);
        expect(actualNeg.get(i, j).re).toBeCloseTo(expectedNeg.get(i, j).re, 10);
        expect(actualNeg.get(i, j).im).toBeCloseTo(expectedNeg.get(i, j).im, 10);
      }
    }
  });

  test('R_y(π/2) and R_y(-π/2) single application results', () => {
    const angle = Math.PI / 2;
    const negAngle = -Math.PI / 2;
    const cosPos = Math.cos(angle / 2);
    const sinPos = Math.sin(angle / 2);
    const cosNeg = Math.cos(negAngle / 2);
    const sinNeg = Math.sin(negAngle / 2);

    const expectedPos = new Matrix([
      [{ re: cosPos, im: 0 }, { re: -sinPos, im: 0 }],
      [{ re: sinPos, im: 0 }, { re: cosPos, im: 0 }]
    ]);

    const expectedNeg = new Matrix([
      [{ re: cosNeg, im: 0 }, { re: -sinNeg, im: 0 }],
      [{ re: sinNeg, im: 0 }, { re: cosNeg, im: 0 }]
    ]);

    const actualPos = ry(angle);
    const actualNeg = ry(negAngle);

    for (let i = 0; i < expectedPos.rows; i++) {
      for (let j = 0; j < expectedPos.cols; j++) {
        expect(actualPos.get(i, j).re).toBeCloseTo(expectedPos.get(i, j).re, 10);
        expect(actualPos.get(i, j).im).toBeCloseTo(expectedPos.get(i, j).im, 10);
        expect(actualNeg.get(i, j).re).toBeCloseTo(expectedNeg.get(i, j).re, 10);
        expect(actualNeg.get(i, j).im).toBeCloseTo(expectedNeg.get(i, j).im, 10);
      }
    }
  });

  test('R_z(π/2) and R_z(-π/2) single application results', () => {
    const angle = Math.PI / 2;
    const negAngle = -Math.PI / 2;
    const cosPos = Math.cos(angle / 2);
    const sinPos = Math.sin(angle / 2);
    const cosNeg = Math.cos(negAngle / 2);
    const sinNeg = Math.sin(negAngle / 2);

    const expectedPos = new Matrix([
      [{ re: cosPos, im: -sinPos }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: cosPos, im: sinPos }]
    ]);

    const expectedNeg = new Matrix([
      [{ re: cosNeg, im: -sinNeg }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: cosNeg, im: sinNeg }]
    ]);

    const actualPos = rz(angle);
    const actualNeg = rz(negAngle);

    for (let i = 0; i < expectedPos.rows; i++) {
      for (let j = 0; j < expectedPos.cols; j++) {
        expect(actualPos.get(i, j).re).toBeCloseTo(expectedPos.get(i, j).re, 10);
        expect(actualPos.get(i, j).im).toBeCloseTo(expectedPos.get(i, j).im, 10);
        expect(actualNeg.get(i, j).re).toBeCloseTo(expectedNeg.get(i, j).re, 10);
        expect(actualNeg.get(i, j).im).toBeCloseTo(expectedNeg.get(i, j).im, 10);
      }
    }
  });
}); 