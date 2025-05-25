# Components

## Overview
This document defines all UI components used in the EPP (Entanglement Purification Protocol) system. Components are reusable UI elements that can be composed to build the application interface for quantum simulation.

## Component List

### ControlPanel
**Description**: Provides user interface controls for configuring and running the quantum entanglement purification simulation.  
**Props**:
- `onNextStep`: () => void - Handler for advancing to the next purification step
- `onCompleteRound`: () => void - Handler for completing the current purification round
- `onRunAll`: () => void - Handler for running the simulation to completion
- `onReset`: () => void - Handler for resetting the simulation
- `onParametersChanged`: (params: SimulationParameters) => void - Handler for updating simulation parameters
- `isComplete`: boolean - Whether the simulation has completed
- `currentRound`: number - The current purification round
- `currentStep`: PurificationStep - The current step within the purification process
- `pairsRemaining`: number - Number of qubit pairs remaining in the simulation
- `averageFidelity`: number - Average fidelity across all pairs (displayed to 3 decimal places)

**Example Usage**:
```tsx
<ControlPanel
  onNextStep={handleNextStep}
  onCompleteRound={handleCompleteRound}
  onRunAll={handleRunAll}
  onReset={handleReset}
  onParametersChanged={handleParametersChanged}
  isComplete={simulationComplete}
  currentRound={currentRound}
  currentStep={purificationStep}
  pairsRemaining={pairs.length}
  averageFidelity={averageFidelity}
/>
```

### EnsembleDisplay
**Description**: Visualizes the collection of qubit pairs and their connections during purification steps.  
**Props**:
- `pairs`: QubitPair[] - Array of qubit pairs to display
- `pendingPairs?`: { controlPairs: QubitPair[], targetPairs: QubitPair[], results?: {...}[] } - Pairs involved in current purification step
- `purificationStep`: string - Current step in the purification process

**Example Usage**:
```tsx
<EnsembleDisplay
  pairs={simulationState.pairs}
  pendingPairs={simulationState.pendingPairs}
  purificationStep={simulationState.purificationStep}
/>
```

### QubitPair
**Description**: Visualizes a single entangled qubit pair with both Alice and Bob's qubits.  
**Props**:
- `pair`: QubitPair - The qubit pair data to visualize
- `isControl`: boolean - Whether this pair is a control pair in CNOT operations
- `isTarget`: boolean - Whether this pair is a target pair in CNOT operations
- `willBeDiscarded`: boolean - Whether this pair will be discarded after measurement
- `partnerId?`: number - ID of the partner pair in CNOT operations

**Example Usage**:
```tsx
<QubitPair
  pair={qubitPair}
  isControl={isControlPair(qubitPair)}
  isTarget={isTargetPair(qubitPair)}
  willBeDiscarded={willBeDiscarded(qubitPair)}
  partnerId={getPartnerId(qubitPair)}
/>
```

### DensityMatrixView
**Description**: Visualizes the density matrix of a quantum state.  
**Props**:
- `matrix`: DensityMatrix - The density matrix to visualize
- `size`: number - The display size of the matrix

**Example Usage**:
```tsx
<DensityMatrixView
  matrix={qubitPair.densityMatrix}
  size={100}
/>
```

## Component Hierarchy
- App (Root component)
  - ControlPanel (Configures and controls simulation)
  - EnsembleDisplay (Shows collection of qubit pairs)
    - QubitPair (Individual qubit pair display)
      - DensityMatrixView (Visualizes quantum state)

## Styling Guidelines
- Components use CSS modules or inline styles for component-specific styling
- Color scheme:
  - Successful operations: Green (#2ecc71)
  - Failed operations: Red (#e74c3c)
  - CNOT operations: Black (#000000)
- Visual elements should follow quantum circuit diagram conventions where appropriate

## Accessibility Requirements
- All controls should have appropriate ARIA labels
- Color should not be the only indicator of state (use shapes, patterns, or text as well)
- Input elements should have associated labels
- Simulation steps should be clearly indicated with text descriptions 