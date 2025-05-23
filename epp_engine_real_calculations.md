# EPP Engine Real Calculations (`src/engine_real_calculations`)

This document provides an in-depth description of the `engine_real_calculations` module, which forms the core of the quantum simulation engine using density matrices.

## Table of Contents

-   [Overview](#overview)
-   [Core Types (`types/`)](#core-types-types)
    -   [`Complex`](#complex)
    -   [`ComplexNum`](#complexnum)
-   [Matrix Representations (`matrix/`)](#matrix-representations-matrix)
    -   [`Matrix`](#matrix)
    -   [`DensityMatrix`](#densitymatrix)
-   [Quantum Gates (`gates/`)](#quantum-gates-gates)
    -   [Pauli Gates (`pauli.ts`)](#pauli-gates-paulits)
    -   [CNOT Gate (`cnot.ts`)](#cnot-gate-cnots)
    -   [Rotation Gates (`rotations.ts`)](#rotation-gates-rotationsts)
-   [Quantum Operations (`operations/`)](#quantum-operations-operations)
    -   [Gate Application (`applyGate.ts`)](#gate-application-applygatets)
    -   [Partial Trace (`partialTrace.ts`)](#partial-trace-partialtracets)
-   [Noise Channels (`channels/`)](#noise-channels-channels)
    -   [Kraus Operator Application (`noise.ts`)](#kraus-operator-application-noisets)
    -   [Depolarizing Channel (`noise.ts`)](#depolarizing-channel-noisets)
    -   [Dephasing Channel (`noise.ts`)](#dephasing-channel-noisets)
    -   [Amplitude Damping Channel (`noise.ts`)](#amplitude-damping-channel-noisets)
    -   [Uniform Noise Channel (`noise.ts`)](#uniform-noise-channel-noisets)
-   [Measurement (`measurement/`)](#measurement-measurement)
    -   [Single Qubit Measurement (`measure.ts`)](#single-qubit-measurement-measurets)
-   [Bell Basis (`bell/`)](#bell-basis-bell)
    -   [Basis Transformation (`bell-basis.ts`)](#basis-transformation-bell-basists)
    -   [Fidelity Calculation (`bell-basis.ts`)](#fidelity-calculation-bell-basists)
-   [Utility Functions (`utils/`)](#utility-functions-utils)
    -   [Indexing (`indexing.ts`)](#indexing-indexingts)
    -   [Tensor Product (`tensor.ts`)](#tensor-product-tensorts)
    -   [Matrix Exponentials (`matrixExp.ts`)](#matrix-exponentials-matrixexpts)
    -   [Random Unitary Generation (`randomUnitary.ts`)](#random-unitary-generation-randomunitaryts)
-   [Main Exports (`index.ts`)](#main-exports-indexts)

## Overview

This module provides the fundamental tools and operations for simulating quantum systems using the density matrix formalism. It allows for the representation of mixed states and the application of quantum gates, noise channels, and measurements. The code is organized into subdirectories based on functionality.

## Core Types (`types/`)

### `Complex`

-   **File:** `src/engine_real_calculations/types/complex.ts`
-   **Description:** An interface defining the structure of a complex number.
-   **Interface:**
    ```typescript
    interface Complex {
      re: number; // Real part
      im: number; // Imaginary part
    }
    ```

### `ComplexNum`

-   **File:** `src/engine_real_calculations/types/complex.ts`
-   **Description:** A class implementing the `Complex` interface and providing static methods for complex number arithmetic. Handles normalization of `-0` to `0`.
-   **Key Static Methods:**
    -   `add(a: Complex, b: Complex): Complex`: Adds two complex numbers.
    -   `sub(a: Complex, b: Complex): Complex`: Subtracts complex number `b` from `a`.
    -   `mul(a: Complex, b: Complex): Complex`: Multiplies two complex numbers.
    -   `div(a: Complex, b: Complex): Complex`: Divides complex number `a` by `b`.
    -   `conj(a: Complex): Complex`: Computes the complex conjugate.
    -   `abs2(a: Complex): number`: Computes the squared absolute value (modulus squared).
    -   `zero(): Complex`: Returns the complex number 0 + 0i.
    -   `one(): Complex`: Returns the complex number 1 + 0i.
    -   `fromReal(r: number): Complex`: Creates a complex number from a real number (r + 0i).

## Matrix Representations (`matrix/`)

### `Matrix`

-   **File:** `src/engine_real_calculations/matrix/matrix.ts`
-   **Description:** A generic class for representing matrices with complex number entries.
-   **Properties:**
    -   `rows: number`: Number of rows.
    -   `cols: number`: Number of columns.
    -   `data: Complex[][]`: The 2D array storing matrix elements.
-   **Key Methods:**
    -   `constructor(data: Complex[][])`: Creates a matrix from a 2D array, ensuring rectangularity.
    -   `static zeros(rows: number, cols: number): Matrix`: Creates a matrix filled with zeros.
    -   `static identity(size: number): Matrix`: Creates an identity matrix of the given size.
    -   `get(i: number, j: number): Complex`: Retrieves the element at row `i`, column `j`.
    -   `set(i: number, j: number, v: Complex): void`: Sets the element at row `i`, column `j`.
    -   `add(other: Matrix): Matrix`: Adds another matrix (element-wise).
    -   `mul(other: Matrix): Matrix`: Performs matrix multiplication.
    -   `map(fn: (val: Complex, i: number, j: number) => Complex): Matrix`: Creates a new matrix by applying a function to each element.
    -   `zip(other: Matrix, fn: (a: Complex, b: Complex, i: number, j: number) => Complex): Matrix`: Creates a new matrix by applying a function element-wise to this matrix and another.
    -   `dagger(): Matrix`: Computes the conjugate transpose (Hermitian conjugate).
    -   `tensor(other: Matrix): Matrix`: Computes the Kronecker (tensor) product with another matrix.
    -   `trace(): Complex`: Computes the trace (sum of diagonal elements) for square matrices.
    -   `scale(s: Complex): Matrix`: Multiplies the matrix by a complex scalar.
    -   `equalsUpToGlobalPhase(other: Matrix, tolerance?: number): boolean`: Checks if two matrices are equal up to a global phase factor within a given tolerance.

### `DensityMatrix`

-   **File:** `src/engine_real_calculations/matrix/densityMatrix.ts`
-   **Description:** Extends the `Matrix` class specifically for density matrices representing quantum states. Ensures the matrix is square, has dimensions that are a power of 2, and is automatically normalized upon construction.
-   **Key Methods:**
    -   `constructor(data: Complex[][])`: Creates a density matrix, validating dimensions and normalizing.
    -   `normalize(): this`: Normalizes the density matrix so that its trace is 1.
    -   `validate(epsilon?: number): boolean`: Checks if the matrix satisfies the properties of a density matrix (Trace ≈ 1, Hermiticity) within a tolerance.
    -   `static fromStateVector(vec: Complex[]): DensityMatrix`: Creates a pure state density matrix (ρ = |ψ⟩⟨ψ|) from a state vector.
    -   `static bellPhiPlus()`, `bellPhiMinus()`, `bellPsiPlus()`, `bellPsiMinus()`: Static methods to create density matrices for the four standard Bell states.
    -   `static tensor(a: DensityMatrix, b: DensityMatrix): DensityMatrix`: Computes the tensor product of two density matrices.

## Quantum Gates (`gates/`)

### Pauli Gates (`pauli.ts`)

-   **File:** `src/engine_real_calculations/gates/pauli.ts`
-   **Functions:**
    -   `pauliMatrix(p: 'I'|'X'|'Y'|'Z'): Matrix`: Returns the 2x2 matrix for the specified single-qubit Pauli gate (I, X, Y, or Z).
    -   `pauliOperator(numQubits: number, targets: number[], paulis: ('I'|'X'|'Y'|'Z')[]): Matrix`: Constructs an n-qubit operator consisting of specified Pauli gates acting on target qubits and identity gates elsewhere. Uses a little-endian convention (qubit 0 is the least significant).

### CNOT Gate (`cnot.ts`)

-   **File:** `src/engine_real_calculations/gates/cnot.ts`
-   **Functions:**
    -   `cnotMatrix(numQubits: number, control: number, target: number): Matrix`: Constructs the (2^n x 2^n) unitary matrix for the CNOT gate acting on `numQubits`, with specified `control` and `target` qubit indices (little-endian convention).

### Rotation Gates (`rotations.ts`)

-   **File:** `src/engine_real_calculations/gates/rotations.ts`
-   **Description:** Provides functions to generate single-qubit rotation matrices.
-   **Functions:**
    -   `rx(theta: number): Matrix`: Returns the rotation matrix around the X-axis, R<sub>x</sub>(θ) = exp(-i θ/2 X).
    -   `ry(theta: number): Matrix`: Returns the rotation matrix around the Y-axis, R<sub>y</sub>(θ) = exp(-i θ/2 Y).
    -   `rz(theta: number): Matrix`: Returns the rotation matrix around the Z-axis, R<sub>z</sub>(θ) = exp(-i θ/2 Z).

## Quantum Operations (`operations/`)

### Gate Application (`applyGate.ts`)

-   **File:** `src/engine_real_calculations/operations/applyGate.ts`
-   **Functions:**
    -   `applyGate(rho: DensityMatrix, U: Matrix): DensityMatrix`: Applies a unitary gate `U` to a density matrix `rho` according to the evolution ρ → U ρ U<sup>†</sup>.

### Partial Trace (`partialTrace.ts`)

-   **File:** `src/engine_real_calculations/operations/partialTrace.ts`
-   **Functions:**
    -   `partialTrace(rho: DensityMatrix, traceOut: number[]): DensityMatrix`: Computes the reduced density matrix by tracing out the qubits specified in the `traceOut` array (using little-endian convention). Returns the density matrix for the remaining qubits.

## Noise Channels (`channels/`)

### Kraus Operator Application (`noise.ts`)

-   **File:** `src/engine_real_calculations/channels/noise.ts`
-   **Functions:**
    -   `applyKraus(rho: DensityMatrix, ks: Matrix[]): DensityMatrix`: Applies a quantum channel defined by a set of Kraus operators `{K_i}` to a density matrix `rho` according to the map ρ → Σ<sub>i</sub> K<sub>i</sub> ρ K<sub>i</sub><sup>†</sup>. (Internal helper function, exported for testing).

### Depolarizing Channel (`noise.ts`)

-   **File:** `src/engine_real_calculations/channels/noise.ts`
-   **Functions:**
    -   `applyDepolarizing(rho: DensityMatrix, qubit: number, p: number): DensityMatrix`: Applies a single-qubit depolarizing channel to the specified `qubit` with probability `p`. The map is (1-p)ρ + p/3 (XρX + YρY + ZρZ).

### Dephasing Channel (`noise.ts`)

-   **File:** `src/engine_real_calculations/channels/noise.ts`
-   **Functions:**
    -   `applyDephasing(rho: DensityMatrix, qubit: number, p: number): DensityMatrix`: Applies a single-qubit dephasing (phase-flip) channel to the specified `qubit` with probability `p`. The map can be represented using Kraus operators K<sub>0</sub> = sqrt(1 - p/2)I, K<sub>1</sub> = sqrt(p/2)Z.

### Amplitude Damping Channel (`noise.ts`)

-   **File:** `src/engine_real_calculations/channels/noise.ts`
-   **Functions:**
    -   `applyAmplitudeDamping(rho: DensityMatrix, qubit: number, gamma: number): DensityMatrix`: Applies a single-qubit amplitude damping channel to the specified `qubit` with decay rate `gamma`. This channel models energy loss from excited states, using Kraus operators that describe the spontaneous emission process.

### Uniform Noise Channel (`noise.ts`)

-   **File:** `src/engine_real_calculations/channels/noise.ts`
-   **Functions:**
    -   `applyUniformNoise(rho: DensityMatrix, qubit: number, noiseStrength: number): DensityMatrix`: Applies a uniform noise channel that transforms the specified qubit using fractional random unitaries. The `noiseStrength` parameter (0-1) controls the amount of noise: 0 leaves the state unchanged, 1 applies a full random unitary from the Haar measure to the target qubit. Uses matrix logarithm/exponential for smooth interpolation between identity and the random unitary.

## Measurement (`measurement/`)

### Single Qubit Measurement (`measure.ts`)

-   **File:** `src/engine_real_calculations/measurement/measure.ts`
-   **Functions:**
    -   `measureQubit(rho: DensityMatrix, qubit: number): { outcome: 0 | 1; probability: number; postState: DensityMatrix }`: Simulates a projective measurement of a single `qubit` in the computational basis ({|0⟩, |1⟩}). Uses a big-endian convention (qubit 0 is the most significant bit).
        -   Returns an object containing:
            -   `outcome`: The measurement result (0 or 1), chosen probabilistically based on `rho`.
            -   `probability`: The probability of obtaining that specific `outcome`.
            -   `postState`: The normalized density matrix after the measurement projection.

## Bell Basis (`bell/`)

### Basis Transformation (`bell-basis.ts`)

-   **File:** `src/engine_real_calculations/bell/bell-basis.ts`
-   **Functions:**
    -   `toBellBasis(rho: Matrix): Matrix`: Transforms a 4x4 density matrix `rho` (representing two qubits) from the computational basis to the Bell basis (|Φ⁺⟩, |Φ⁻⟩, |Ψ⁺⟩, |Ψ⁻⟩). Assumes the input `rho` is in the computational basis {00, 01, 10, 11}.

### Fidelity Calculation (`bell-basis.ts`)

-   **File:** `src/engine_real_calculations/bell/bell-basis.ts`
-   **Functions:**
    -   `fidelityBell(rhoBell: Matrix): number`: Calculates the fidelity of a 2-qubit state (represented by `rhoBell`, assumed to be already in the Bell basis) with respect to the Bell state |Φ⁺⟩. This is simply the real part of the top-left element (⟨Φ⁺|ρ|Φ⁺⟩).
    -   `fidelityFromComputationalBasis(rho: Matrix): number`: Calculates the fidelity with respect to |Φ⁺⟩ for a density matrix `rho` given in the computational basis by first transforming it to the Bell basis.

## Utility Functions (`utils/`)

### Indexing (`indexing.ts`)

-   **File:** `src/engine_real_calculations/utils/indexing.ts`
-   **Functions:**
    -   `bitstringToIndex(bitstring: string): number`: Converts a big-endian bitstring (e.g., "101") to its corresponding numerical index (e.g., 5). The least significant bit (LSB) is assumed to be at the rightmost position (index n-1).
    -   `indexToBitstring(index: number, numBits: number): string`: Converts a numerical index to its big-endian bitstring representation of a specified length, padding with leading zeros if necessary.

### Tensor Product (`tensor.ts`)

-   **File:** `src/engine_real_calculations/utils/tensor.ts`
-   **Functions:**
    -   `kroneckerMatrix(a: Complex[][], b: Complex[][]): Complex[][]`: Computes the Kronecker (tensor) product of two matrices represented as 2D arrays of `Complex` numbers. Used internally by `Matrix.tensor`.

### Matrix Exponentials (`matrixExp.ts`)

-   **File:** `src/engine_real_calculations/utils/matrixExp.ts`
-   **Functions:**
    -   `matrixExp(matrix: Matrix): Matrix`: Computes the matrix exponential using series expansion: exp(A) = I + A + A²/2! + A³/3! + ... Limited to 20 terms for numerical stability with convergence checking.
    -   `matrixLog(matrix: Matrix): Matrix`: Computes the matrix logarithm using element-wise logarithm. Note: This is an approximation for the true matrix logarithm which requires eigenvalue decomposition.
    -   `isUnitary(matrix: Matrix, tolerance?: number): boolean`: Checks if a matrix is unitary (U * U† = I) within the specified tolerance (default 1e-10).

### Random Unitary Generation (`randomUnitary.ts`)

-   **File:** `src/engine_real_calculations/utils/randomUnitary.ts`
-   **Functions:**
    -   `randomUnitary(size: number): Matrix`: Generates a random unitary matrix of the specified size using the Haar measure. Implementation uses QR decomposition of a random Ginibre matrix (complex Gaussian entries) to ensure uniform distribution over the unitary group.

## Main Exports (`index.ts`)

-   **File:** `src/engine_real_calculations/index.ts`
-   **Description:** This file serves as the main entry point for the module, re-exporting the primary types and functions from the subdirectories for convenient access.
-   **Key Re-exports:**
    -   Types: `Complex`, `Matrix`, `DensityMatrix`
    -   Classes: `ComplexNum`
    -   Functions: `bitstringToIndex`, `indexToBitstring`, `pauliMatrix`, `pauliOperator`, `cnotMatrix`, `applyDepolarizing`, `applyDephasing`, `measureQubit`, `applyGate`, `partialTrace`
-   **Additional Functions Defined:**
    -   `tensor(a: DensityMatrix, b: DensityMatrix): DensityMatrix`: Convenience wrapper for `DensityMatrix.tensor(a, b)`.
    -   `applyPauli(rho: DensityMatrix, targets: number[], paulis: ('I'|'X'|'Y'|'Z')[]): DensityMatrix`: Convenience wrapper to apply a multi-qubit Pauli operator using `pauliOperator` and `applyGate`.
    -   `applyCNOT(rho: DensityMatrix, control: number, target: number): DensityMatrix`: Convenience wrapper to apply a CNOT gate using `cnotMatrix` and `applyGate`.

---

*This documentation provides a detailed overview based on the code structure and comments as of the last review. For the absolute latest details and implementation specifics, always refer to the source code itself.* 