# Engine Module Documentation

This document provides a detailed overview of the `engine` module, which implements quantum entanglement purification protocols.

## Overview

The engine module simulates the quantum mechanical process of entanglement purification. It provides two different simulation approaches:

1. **Average Simulation** - Calculates the average outcome of quantum operations
2. **Monte Carlo Simulation** - Performs true randomized operations in the computational basis

The module provides the core functionality for:

1. Creating noisy entangled quantum states
2. Implementing the BBPSSW purification protocol
3. Tracking the state of quantum pairs through multiple purification rounds
4. Calculating fidelities and measuring success rates

## Files Structure

The module consists of these main files:

- `types.ts` - Type definitions for the simulation and engine interface
- `averageSimulationEngine.ts` - Implements simulation using average outcomes in the Bell basis
- `monteCarloSimulationEngine.ts` - Implements simulation using randomized operations in the computational basis
- `operations.ts` - Quantum operations for purification (Bell basis)
- `quantumStates.ts` - Quantum state creation and manipulation (Bell basis)

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

// Engine interface and types
export interface ISimulationEngine {
  nextStep(): SimulationState;
  step(): SimulationState;
  reset(): SimulationState;
  getCurrentState(): SimulationState;
  updateParams(params: SimulationParameters): void;
}

export enum EngineType {
  // Calculates the average outcome of quantum operations in Bell basis
  Average = 'average',
  
  // Performs true randomized operations in computational basis
  MonteCarlo = 'monte-carlo',
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

## Average Simulation Engine (`averageSimulationEngine.ts`)

The Bell-basis controller for the entanglement purification simulation. This engine calculates the average outcome of quantum operations, rather than performing true randomized operations.

### Class: `AverageSimulationEngine`

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

## Monte Carlo Simulation Engine (`monteCarloSimulationEngine.ts`)

The computational-basis controller for entanglement purification simulation. This engine performs true randomized operations in the computational basis, providing a more physically realistic simulation.

### Class: `MonteCarloSimulationEngine`

#### Constructor

```typescript
constructor(params: SimulationParameters)
```

Initializes the simulation with the specified parameters.

#### Key Methods

The Monte Carlo engine implements the same interface as the Average engine:

```typescript
nextStep(): SimulationState
step(): SimulationState
reset(): SimulationState
getCurrentState(): SimulationState
updateParams(params: SimulationParameters): void
```

#### Purification Protocol Steps

The engine implements the BBPSSW protocol with these Monte Carlo-specific steps:

1. **Initialization**: Create initial noisy EPR pairs in computational basis
2. **Random Twirling**: Apply randomized twirling operations instead of calculating the average
3. **Preparation**: Prepare for bilateral CNOT in computational basis
4. **Bilateral CNOT**: Apply CNOT gates between control and target pairs
5. **Monte Carlo Measurement**: Perform randomized measurements with probabilities based on the quantum state
6. **Discard**: Discard failed pairs and prepare for next round

## Integration with Real Calculations

The engine module relies on calculations from the `engine_real_calculations` module for:
- Complex number arithmetic
- Density matrix operations
- Bell basis calculations
- Fidelity measurements

This separation ensures that the engine module can focus on the protocol implementation while delegating mathematical calculations to specialized components.

The Monte Carlo engine in particular makes extensive use of the computational basis operators in the real calculations module.

## Engine Selection

The simulation controller allows selecting between the two engine types:

```typescript
// Usage
const controller = new SimulationController(
  simulationParameters, 
  stateChangeCallback, 
  EngineType.MonteCarlo // or EngineType.Average
);
```

This enables comparison between the average-based approach and the more physically realistic Monte Carlo simulation. 