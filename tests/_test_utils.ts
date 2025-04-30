// Helper function for comparing complex numbers with tolerance
import {ComplexNum, DensityMatrix} from "../src/engine_real_calculations";

export const expectComplexClose = (a: ComplexNum, b: ComplexNum, tolerance = 1e-9) => {
    expect(a.re).toBeCloseTo(b.re, tolerance);
    expect(a.im).toBeCloseTo(b.im, tolerance);
};

// Updated helper function for comparing DensityMatrix objects
export const expectMatrixClose = (a: DensityMatrix, b: DensityMatrix, tolerance = 1e-9) => {
    expect(a.rows).toBe(b.rows);
    expect(a.cols).toBe(b.cols);
    for (let i = 0; i < a.rows; i++) {
        for (let j = 0; j < a.cols; j++) {
            expectComplexClose(a.get(i, j), b.get(i, j), tolerance);
        }
    }
};