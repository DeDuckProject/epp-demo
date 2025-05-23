import { Matrix } from '../matrix/matrix';
/**
 * Returns the rotation matrix around the X axis by angle theta.
 * Implements R_x(θ) = exp(-i θ/2 X) = cos(θ/2) I - i sin(θ/2) X.
 */
export declare function rx(theta: number): Matrix;
/**
 * Returns the rotation matrix around the Y axis by angle theta.
 * Implements R_y(θ) = exp(-i θ/2 Y) = cos(θ/2) I - i sin(θ/2) Y.
 * Given Y = [[0, -i], [i, 0]], the result is [[cos(θ/2), - sin(θ/2)], [ sin(θ/2), cos(θ/2)]].
 */
export declare function ry(theta: number): Matrix;
/**
 * Returns the rotation matrix around the Z axis by angle theta.
 * Implements R_z(θ) = exp(-i θ/2 Z) = cos(θ/2) I - i sin(θ/2) Z.
 * Given Z = [[1, 0], [0, -1]], the result is [[cos(θ/2) - i sin(θ/2), 0], [0, cos(θ/2) + i sin(θ/2)]].
 */
export declare function rz(theta: number): Matrix;
