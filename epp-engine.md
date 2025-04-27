# Engine Module Documentation

This document provides a detailed overview of the `engine` module, which implements quantum entanglement purification protocols.

## Overview

The engine module simulates the quantum mechanical process of entanglement purification. It provides the core functionality for:

1. Creating noisy entangled quantum states
2. Implementing the BBPSSW purification protocol
3. Tracking the state of quantum pairs through multiple purification rounds
4. Calculating fidelities and measuring success rates

## Files Structure

The module consists of four main files:

- `simulationEngine.ts` - Main simulation controller
- `operations.ts` - Quantum operations for purification
- `quantumStates.ts` - Quantum state creation and manipulation
- `types.ts` - Type definitions for the simulation

## Types (`types.ts`)

### Core Types

```typescript
// Represents a single entangled qubit pair
export type QubitPair = {
  id: number;
  densityMatrix: DensityMatrix;
  fidelity: number;
};

// Parameters controlling the simulation
export type SimulationParameters = {
  initialPairs: number;
  noiseParameter: number;  // Controls the amount of noise in initial pairs
  targetFidelity: number;  // Purification target
};

// Tracks which step of the purification protocol is active
export type PurificationStep = 'initial' | 'twirled' | 'exchanged' | 'cnot' | 'measured' | 'completed';

// Complete state of the simulation
export interface SimulationState {
  pairs: QubitPair[];
  round: number;
  complete: boolean;
  purificationStep: PurificationStep;
  pendingPairs?: {
    controlPairs: QubitPair[];
    targetPairs: QubitPair[];
    results?: {
      control: QubitPair;
      successful: boolean;
    }[];
  };
}
```

## Quantum States (`quantumStates.ts`)

This file provides functions for creating and manipulating quantum states.

### Key Functions

#### `createNoisyEPR(noiseParam: number): DensityMatrix`

Creates a noisy EPR pair in the Bell basis with the specified noise parameter.

```typescript
// Usage
const noisyState = createNoisyEPR(0.2);  // Creates a state with 20% noise
```

The function:
- Creates a Bell state |Ψ⁻⟩ in the Bell basis
- Adds noise proportional to the noiseParam
- Returns a density matrix representing the noisy state

## Quantum Operations (`operations.ts`)

This file implements the quantum operations needed for entanglement purification.

### Key Functions

#### `depolarize(rho: DensityMatrix): DensityMatrix`

Converts a quantum state to Werner form by depolarizing/twirling the pair.

```typescript
// Usage
const wernerState = depolarize(initialState);
```

#### `exchangePsiMinusPhiPlus(rho: DensityMatrix): DensityMatrix`

Exchanges the |Ψ⁻⟩ and |Φ⁺⟩ components (Step 2 of BBPSSW protocol).

```typescript
// Usage
const exchangedState = exchangePsiMinusPhiPlus(wernerState);
```

#### `bilateralCNOT(control: DensityMatrix, target: DensityMatrix)`

Performs a bilateral CNOT operation between two entangled pairs and simulates measurement.

```typescript
// Usage
const result = bilateralCNOT(controlPair, targetPair);
// Result includes:
// - resultAfterCNOT: The joint state after CNOT
// - afterMeasurement.controlPair: The resulting control pair
// - afterMeasurement.successful: Whether purification succeeded
```

## Simulation Engine (`simulationEngine.ts`)

The main controller for the entanglement purification simulation.

### Class: `SimulationEngine`

#### Constructor

```typescript
constructor(params: SimulationParameters)
```

Initializes the simulation with the specified parameters.

#### Key Methods

##### `nextStep(): SimulationState`

Advances the simulation by one step in the purification protocol.

##### `step(): SimulationState`

Completes a full round of purification.

##### `reset(): SimulationState`

Resets the simulation to its initial state.

##### `getCurrentState(): SimulationState`

Returns the current state of the simulation.

##### `updateParams(params: SimulationParameters): void`

Updates the simulation parameters and resets the simulation.

#### Purification Protocol Steps

The engine implements the BBPSSW protocol through these steps:

1. **Initialization**: Create initial noisy EPR pairs
2. **Depolarize/Twirl**: Convert pairs to Werner form
3. **Exchange**: Swap |Ψ⁻⟩ and |Φ⁺⟩ components
4. **Bilateral CNOT**: Apply CNOT gates between control and target pairs
5. **Measurement**: Measure target pairs and update control pairs
6. **Discard**: Discard failed pairs and prepare for next round

The simulation continues rounds until either:
- The target fidelity is reached
- There are fewer than 2 pairs remaining (cannot continue purification)

## Integration with Real Calculations

The engine module relies on calculations from the `engine_real_calculations` module for:
- Complex number arithmetic
- Density matrix operations
- Bell basis calculations
- Fidelity measurements

This separation ensures that the engine module can focus on the protocol implementation while delegating mathematical calculations to specialized components. 