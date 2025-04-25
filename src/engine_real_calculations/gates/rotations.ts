import { Matrix } from '../matrix/matrix';

/**
 * Returns the rotation matrix around the X axis by angle theta.
 * Implements R_x(θ) = exp(-i θ/2 X) = cos(θ/2) I - i sin(θ/2) X.
 */
export function rx(theta: number): Matrix {
  const a = Math.cos(theta / 2);
  const b = Math.sin(theta / 2);
  return new Matrix([
    [{ re: a, im: 0 }, { re: 0, im: -b }],
    [{ re: 0, im: -b }, { re: a, im: 0 }]
  ]);
}

/**
 * Returns the rotation matrix around the Y axis by angle theta.
 * Implements R_y(θ) = exp(-i θ/2 Y) = cos(θ/2) I - i sin(θ/2) Y.
 * Given Y = [[0, -i], [i, 0]], the result is [[cos(θ/2), - sin(θ/2)], [ sin(θ/2), cos(θ/2)]].
 */
export function ry(theta: number): Matrix {
  const a = Math.cos(theta / 2);
  const b = Math.sin(theta / 2);
  return new Matrix([
    [{ re: a, im: 0 }, { re: -b, im: 0 }],
    [{ re: b, im: 0 }, { re: a, im: 0 }]
  ]);
}

/**
 * Returns the rotation matrix around the Z axis by angle theta.
 * Implements R_z(θ) = exp(-i θ/2 Z) = cos(θ/2) I - i sin(θ/2) Z.
 * Given Z = [[1, 0], [0, -1]], the result is [[cos(θ/2) - i sin(θ/2), 0], [0, cos(θ/2) + i sin(θ/2)]].
 */
export function rz(theta: number): Matrix {
  const a = Math.cos(theta / 2);
  const b = Math.sin(theta / 2);
  return new Matrix([
    [{ re: a, im: -b }, { re: 0, im: 0 }],
    [{ re: 0, im: 0 }, { re: a, im: b }]
  ]);
} 