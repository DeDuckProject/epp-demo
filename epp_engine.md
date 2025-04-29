# Engine

## Overview
This document defines the core engine of the EPP (Entanglement Purification Protocol) system, responsible for processing quantum data and implementing the quantum purification protocol. The engine simulates the process of increasing the fidelity of entangled quantum states through purification rounds.

## Engine Components

### SimulationEngine
**Purpose**: Main engine that implements the DEJMPS entanglement purification protocol simulation  
**Input Contract**: SimulationParameters (initialPairs, noiseParameter, targetFidelity)  
**Output Contract**: SimulationState (pairs, round, complete, purificationStep, pendingPairs)  
**Processing Steps**:
1. Initialization: Create initial noisy EPR pairs in Bell basis
2. Depolarization/Twirling: Convert all pairs to Werner form
3. Exchange Step: Exchange |Ψ⁻⟩ and |Φ⁺⟩ components
4. CNOT Operation: Apply bilateral CNOT between control and target pairs
5. Measurement: Measure target qubits and keep control pairs if measurement is successful
6. Results Processing: Discard failed pairs, prepare remaining pairs for next round

**Error Handling**:
- Invalid parameter values: Constrained through UI or validated before use
- Insufficient pairs for purification: Simulation marked as complete if pairs < 2
- Missing pendingPairs: Error logged, no action performed

### QuantumStates
**Purpose**: Generates initial quantum states used in simulation  
**Input Contract**: noiseParameter (number between 0 and 1)  
**Output Contract**: DensityMatrix representing quantum state  
**Processing Steps**:
1. Create ideal Bell state (Ψ⁻)
2. Apply depolarizing noise according to noise parameter
3. Return resulting density matrix in Bell basis

**Error Handling**:
- Invalid noise parameter: Clamped to valid range [0, 1]

### Operations
**Purpose**: Implements quantum operations for entanglement purification  
**Input Contract**: DensityMatrix for input states  
**Output Contract**: DensityMatrix or operation results with success indicators  
**Processing Functions**:
- `depolarize`: Converts any state to Werner state
- `exchangePsiMinusPhiPlus`: Exchanges |Ψ⁻⟩ and |Φ⁺⟩ components
- `bilateralCNOT`: Performs CNOT operation and simulated measurement

**Error Handling**:
- Invalid density matrices: Should be validated before operations

## Performance Requirements
- The simulation engine should efficiently handle up to 50 initial qubit pairs
- Computation of quantum operations should remain responsive for interactive use
- Memory usage should scale reasonably with the number of qubit pairs

## State Management
- The engine maintains the current simulation state internally
- State updates occur through the step-by-step protocol execution
- The engine provides public methods to retrieve the current state
- Parameters can be updated, triggering a simulation reset
- The complete simulation can be run through individual steps or all at once

## Integration Points
- `SimulationController`: Acts as intermediary between engine and UI components
- Engine instantiated by controller with initial parameters
- State changes propagated through callback passed to controller
- Controller methods map directly to engine public API
- UI components receive state updates from controller

## Testing Strategy
- Unit tests for quantum operations with known input/output pairs
- Integration tests for complete purification rounds
- Edge case tests for boundary conditions (min/max parameters, single pair cases)
- Performance tests to ensure scaling with increasing pair counts
- Validation against theoretical purification behavior for Werner states 