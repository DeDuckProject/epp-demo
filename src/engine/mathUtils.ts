import { ComplexNumber, DensityMatrix } from './types';

export const complex = (real: number, imag: number = 0): ComplexNumber => ({
  real,
  imag
});

export const add = (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({
  real: a.real + b.real,
  imag: a.imag + b.imag
});

export const multiply = (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({
  real: a.real * b.real - a.imag * b.imag,
  imag: a.real * b.imag + a.imag * b.real
});

export const conjugate = (c: ComplexNumber): ComplexNumber => ({
  real: c.real,
  imag: -c.imag
});

export const matrixMultiply = (a: DensityMatrix, b: DensityMatrix): DensityMatrix => {
  const size = a.length;
  const result: DensityMatrix = Array(size).fill(0).map(() => 
    Array(size).fill(0).map(() => complex(0))
  );

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      for (let k = 0; k < size; k++) {
        result[i][j] = add(result[i][j], multiply(a[i][k], b[k][j]));
      }
    }
  }
  
  return result;
};

export const tensorProduct = (a: DensityMatrix, b: DensityMatrix): DensityMatrix => {
  const sizeA = a.length;
  const sizeB = b.length;
  const size = sizeA * sizeB;
  
  const result: DensityMatrix = Array(size).fill(0).map(() => 
    Array(size).fill(0).map(() => complex(0))
  );
  
  for (let i1 = 0; i1 < sizeA; i1++) {
    for (let j1 = 0; j1 < sizeA; j1++) {
      for (let i2 = 0; i2 < sizeB; i2++) {
        for (let j2 = 0; j2 < sizeB; j2++) {
          const i = i1 * sizeB + i2;
          const j = j1 * sizeB + j2;
          result[i][j] = multiply(a[i1][j1], b[i2][j2]);
        }
      }
    }
  }
  
  return result;
};

export const partialTrace = (rho: DensityMatrix, subsystemSize: number, traceOutFirst: boolean): DensityMatrix => {
  const totalSize = rho.length;
  const resultSize = totalSize / subsystemSize;
  
  const result: DensityMatrix = Array(resultSize).fill(0).map(() => 
    Array(resultSize).fill(0).map(() => complex(0))
  );
  
  for (let i = 0; i < resultSize; i++) {
    for (let j = 0; j < resultSize; j++) {
      for (let k = 0; k < subsystemSize; k++) {
        const idx1 = traceOutFirst ? k * resultSize + i : i * subsystemSize + k;
        const idx2 = traceOutFirst ? k * resultSize + j : j * subsystemSize + k;
        result[i][j] = add(result[i][j], rho[idx1][idx2]);
      }
    }
  }
  
  return result;
};

export const calculateFidelity = (rho: DensityMatrix): number => {
  // Calculate fidelity with respect to perfect Bell state |Φ⁺⟩
  return rho[0][0].real + rho[3][3].real + rho[0][3].real + rho[3][0].real;
};

export const trace = (matrix: DensityMatrix): ComplexNumber => {
  let result = complex(0);
  for (let i = 0; i < matrix.length; i++) {
    result = add(result, matrix[i][i]);
  }
  return result;
};

// Bell basis transformation matrix (computational basis to Bell basis)
export const computationalToBellBasis = (): DensityMatrix => {
  const sqrt2 = Math.sqrt(2) / 2;
  return [
    [complex(sqrt2), complex(0), complex(0), complex(sqrt2)],  // |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
    [complex(sqrt2), complex(0), complex(0), complex(-sqrt2)], // |Φ⁻⟩ = (|00⟩ - |11⟩)/√2
    [complex(0), complex(sqrt2), complex(sqrt2), complex(0)],  // |Ψ⁺⟩ = (|01⟩ + |10⟩)/√2
    [complex(0), complex(sqrt2), complex(-sqrt2), complex(0)]  // |Ψ⁻⟩ = (|01⟩ - |10⟩)/√2
  ];
};

// Bell basis to computational basis transformation matrix
export const bellToComputationalBasis = (): DensityMatrix => {
  const sqrt2 = Math.sqrt(2) / 2;
  return [
    [complex(sqrt2), complex(sqrt2), complex(0), complex(0)],
    [complex(0), complex(0), complex(sqrt2), complex(sqrt2)],
    [complex(0), complex(0), complex(sqrt2), complex(-sqrt2)],
    [complex(sqrt2), complex(-sqrt2), complex(0), complex(0)]
  ];
};

// Transform a density matrix from computational basis to Bell basis
export const transformToBellBasis = (rho: DensityMatrix): DensityMatrix => {
  const U = computationalToBellBasis();
  const Udagger = U.map(row => row.map(element => conjugate(element)));
  
  // ρ_Bell = U ρ_Comp U†
  const temp = matrixMultiply(U, rho);
  return matrixMultiply(temp, Udagger);
};

// Transform a density matrix from Bell basis to computational basis
export const transformToComputationalBasis = (rho: DensityMatrix): DensityMatrix => {
  const U = bellToComputationalBasis();
  const Udagger = U.map(row => row.map(element => conjugate(element)));
  
  // ρ_Comp = U ρ_Bell U†
  const temp = matrixMultiply(U, rho);
  return matrixMultiply(temp, Udagger);
};

// Calculate fidelity in Bell basis - it's the element corresponding to our target state
export const calculateBellBasisFidelity = (rho: DensityMatrix): number => {
  // After exchange, our target state is |Φ⁺⟩ (index 0)
  // Before exchange, our target state is |Ψ⁻⟩ (index 3)
  return rho[0][0].real;
}; 