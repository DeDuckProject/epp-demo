# Quantum Entanglement Purification Simulator

[![DOI](https://zenodo.org/badge/973380431.svg)](https://doi.org/10.5281/zenodo.15799912)

A web-based interactive simulator for the BBPSSW (Bennett-Brassard-Popescu-Schumacher-Smolin-Wootters) quantum entanglement purification protocol. This application demonstrates how noisy entangled quantum states can be purified to achieve higher fidelity through quantum operations, measurements, and post-selection.

## What is Entanglement Purification?

[Entanglement purification](https://en.wikipedia.org/wiki/Entanglement_distillation) is a protocol that improves the quality (fidelity) of noisy entangled quantum states (EPR pairs). When quantum systems interact with their environment, they lose their perfect entanglement and become "noisy". This simulator implements the BBPSSW protocol, which uses multiple noisy entangled pairs to create fewer, but higher-fidelity entangled pairs through quantum operations, measurements and classical communication.

The protocol works by:
- Starting with multiple noisy entangled pairs
- Applying quantum operations (twirling, CNOT gates)
- Performing measurements to test entanglement quality
- Keeping only the pairs that pass the test
- Repeating until target fidelity is achieved

## Technologies Used

- **React 18** - Frontend framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and development server
- **Vitest** - Testing framework
- **ESLint** - Code linting
- **CSS3** - Styling with custom CSS modules

## Development Setup

### Prerequisites
- Node.js 18.x or 20.x
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd epp-demo

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production

# Testing
npm test            # Run all tests
npm test -- --reporter=verbose  # Run tests with verbose output

# Code Quality
npm run lint        # Run ESLint
```

## Project Structure

```
src/
├── components/           # React UI components
│   ├── ControlPanel.tsx     # Simulation controls
│   ├── EnsembleDisplay.tsx  # Qubit pair visualization
│   ├── QubitPair.tsx        # Individual pair display
│   ├── DensityMatrixView.tsx # Quantum state visualization
│   ├── InfoWindow.tsx       # Educational modal
│   └── Attribution.tsx      # Creator credits
├── controller/          # Application state management
├── engine/             # Simulation engine interface
├── engine_real_calculations/ # Quantum mechanics implementation
│   ├── types/              # Complex numbers, basic types
│   ├── matrix/             # Matrix and density matrix classes
│   ├── gates/              # Quantum gates (Pauli, CNOT, rotations)
│   ├── operations/         # Gate application, partial trace
│   ├── channels/           # Noise channels (depolarizing, dephasing, etc.)
│   ├── measurement/        # Quantum measurement operations
│   ├── bell/               # Bell basis transformations
│   └── utils/              # Utility functions
├── styles/             # CSS styling
└── utils/              # General utilities

tests/                  # Test files mirroring src structure
```

## High-Level Architecture

The application follows a modular architecture:

1. **Components Layer** (`src/components/`) - React UI components for visualization and interaction
2. **Controller Layer** (`src/controller/`) - Application state management and simulation orchestration
3. **Engine Layer** (`src/engine/`) - Abstract interface for simulation engines
4. **Real Calculations Engine** (`src/engine_real_calculations/`) - Quantum mechanics implementation using density matrices

### Key Features

- **Dual Simulation Engines**: Monte Carlo (realistic) and Average (theoretical) approaches
- **Multiple Noise Channels**: Depolarizing, dephasing, amplitude damping, and uniform noise
- **Interactive Visualization**: Real-time display of quantum states and operations
- **Educational Content**: Built-in explanations of quantum concepts and protocol steps
- **Responsive Design**: Works on desktop and mobile devices

## Testing

The project uses Vitest for testing with comprehensive test coverage:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/components/InfoWindow.test.ts
```

## Continuous Integration

The project uses GitHub Actions for CI/CD:
- Runs on Node.js 18.x and 20.x
- Executes all tests using Vitest
- Validates code quality with ESLint
- Builds the application for production

## Usage

1. **Configure Parameters**: Set initial pairs, target fidelity, noise type, and noise strength
2. **Choose Engine**: Select Monte Carlo (realistic) or Average (theoretical) simulation
3. **Run Simulation**: Use step-by-step execution or run to completion
4. **Visualize Results**: Observe quantum states, operations, and fidelity improvements
5. **Learn**: Access educational content through the info window

## Credits & References

This implementation is based on the entanglement purification protocol described in:

**Bennett, C. H., Brassard, G., Popescu, S., Schumacher, B., Smolin, J. A., & Wootters, W. K.** (1996). 
["Purification of noisy entanglement and faithful teleportation via noisy channels"](https://arxiv.org/abs/quant-ph/9511027) *Physical Review Letters*, 76(5), 722-725.

We acknowledge and credit [https://github.com/a-auer/qiskit](https://github.com/a-auer/qiskit) for explaining and implementing the protocol, which served as a reference for our implementation. It also contains a much deeper explanation than this application provides.

The application was built as a project at the Hebrew University of Jerusalem under the supervision of Michael Ben-Or.

This simulator provides both theoretical (average) and realistic (Monte Carlo) approaches to understanding quantum entanglement purification protocols.

## License

This project is open source and available under the MIT License.
