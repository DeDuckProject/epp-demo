import {vi} from 'vitest';
import {MonteCarloSimulationEngine} from '../../src/engine/monteCarloSimulationEngine';
import {SimulationParameters} from '../../src/engine/types';
import {DensityMatrix} from '../../src/engine_real_calculations/matrix/densityMatrix';
import {ComplexNum} from '../../src/engine_real_calculations/types/complex';
import {fidelityFromComputationalBasisMatrix, BellState} from '../../src/engine_real_calculations/bell/bell-basis';

describe('MonteCarloSimulationEngine', () => {
  let engine: MonteCarloSimulationEngine;
  const noiseParameter = 0.1;
  const initialParams: SimulationParameters = {
    initialPairs: 4,
    noiseParameter: noiseParameter,
    targetFidelity: 0.95
  };

  beforeEach(() => {
    engine = new MonteCarloSimulationEngine(initialParams);
  });

  // Helper function to create a basic density matrix for testing
  function createTestMatrix(): DensityMatrix {
    const complexData = Array(4).fill(0).map(() => 
      Array(4).fill(0).map(() => ComplexNum.zero())
    );
    complexData[0][0] = ComplexNum.fromReal(1);
    return new DensityMatrix(complexData);
  }

  describe('Initialization', () => {
    test('initializes with the correct number of pairs', () => {
      const state = engine.getCurrentState();
      expect(state.pairs.length).toBe(initialParams.initialPairs);
      expect(state.round).toBe(0);
      expect(state.complete).toBe(false);
      expect(state.purificationStep).toBe('initial');
    });

    test('pairs are initialized with valid density matrices', () => {
      const state = engine.getCurrentState();
      
      state.pairs.forEach(pair => {
        // Verify each pair has a valid density matrix (trace = 1)
        expect(pair.densityMatrix).toBeInstanceOf(DensityMatrix);
        const trace = pair.densityMatrix.trace();
        expect(trace.re).toBeCloseTo(1.0);
        expect(trace.im).toBeCloseTo(0.0);
        
        // Verify that matrices are Hermitian (ρ = ρ†)
        expect(pair.densityMatrix.validate()).toBe(true);
      });
    });

    test('with zero noise, pairs initialize as perfect Bell Psi-Minus states', () => {
      // Create engine with zero noise
      const perfectEngine = new MonteCarloSimulationEngine({
        ...initialParams,
        noiseParameter: 0
      });
      
      const state = perfectEngine.getCurrentState();
      const perfectBellPsiMinus = DensityMatrix.bellPsiMinus();
      
      state.pairs.forEach(pair => {
        // Check that matrix matches the expected Bell state
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            const actual = pair.densityMatrix.get(i, j);
            const expected = perfectBellPsiMinus.get(i, j);
            expect(actual.re).toBeCloseTo(expected.re);
            expect(actual.im).toBeCloseTo(expected.im);
          }
        }
        
        // Verify fidelity is 1.0 for perfect bell state
        expect(pair.fidelity).toBeCloseTo(1.0);
      });
    });
    
    test('with high noise, fidelity is reduced but matrices remain valid', () => {
      // Create engine with maximum noise
      const noisyEngine = new MonteCarloSimulationEngine({
        ...initialParams,
        noiseParameter: 1.0
      });
      
      const state = noisyEngine.getCurrentState();
      const perfectBellPsiMinus = DensityMatrix.bellPsiMinus();
      
      state.pairs.forEach(pair => {
        // Matrices should still be valid density matrices
        expect(pair.densityMatrix.validate()).toBe(true);
        
        // Fidelity should be reduced with high noise
        expect(pair.fidelity).toBeLessThan(1.0);
        
        // The matrix should be different from a perfect Bell state
        let isDifferent = false;
        for (let i = 0; i < 4 && !isDifferent; i++) {
          for (let j = 0; j < 4 && !isDifferent; j++) {
            const actual = pair.densityMatrix.get(i, j);
            const expected = perfectBellPsiMinus.get(i, j);
            if (Math.abs(actual.re - expected.re) > 1e-5 || 
                Math.abs(actual.im - expected.im) > 1e-5) {
              isDifferent = true;
            }
          }
        }
        expect(isDifferent).toBe(true);
      });
    });
    
    test('noise parameter correctly affects fidelity', () => {
      // Test with different noise levels
      const noiseValues = [0, 0.25, 0.5, 0.75, 1.0];
      const fidelities: number[] = [];
      
      // Collect fidelities for different noise levels
      for (const noise of noiseValues) {
        const testEngine = new MonteCarloSimulationEngine({
          ...initialParams,
          noiseParameter: noise
        });
        const state = testEngine.getCurrentState();
        fidelities.push(state.pairs[0].fidelity);
      }
      
      // Fidelity should monotonically decrease with increasing noise
      for (let i = 1; i < fidelities.length; i++) {
        expect(fidelities[i]).toBeLessThanOrEqual(fidelities[i-1]);
      }
      
      // First value (no noise) should be 1.0, last value (max noise) should be significantly less
      expect(fidelities[0]).toBeCloseTo(1.0);
      expect(fidelities[fidelities.length-1]).toBeLessThan(0.9);
    });

    test('getCurrentState returns the current state', () => {
      const state1 = engine.getCurrentState();
      const state2 = engine.getCurrentState();
      expect(state1).toEqual(state2);
    });
  });

  describe('Step Progression via nextStep()', () => {
    test('progresses through purification steps: initial -> twirled', () => {
      let state = engine.getCurrentState();
      expect(state.purificationStep).toBe('initial');
      
      state = engine.nextStep();
      expect(state.purificationStep).toBe('twirled');
    });

    test('progresses through purification steps: twirled -> exchanged', () => {
      engine.nextStep(); // initial -> twirled
      const state = engine.nextStep(); // twirled -> exchanged
      expect(state.purificationStep).toBe('exchanged');
    });

    test('progresses through purification steps: exchanged -> cnot', () => {
      engine.nextStep(); // initial -> twirled
      engine.nextStep(); // twirled -> exchanged
      const state = engine.nextStep(); // exchanged -> cnot
      expect(state.purificationStep).toBe('cnot');
      expect(state.pendingPairs).toBeDefined();
      expect(state.pendingPairs?.controlPairs.length).toBe(initialParams.initialPairs / 2);
      expect(state.pendingPairs?.targetPairs.length).toBe(initialParams.initialPairs / 2);
    });
    
    test('handles odd number of pairs correctly during CNOT setup', () => {
      const oddParams = { ...initialParams, initialPairs: 3 };
      const oddEngine = new MonteCarloSimulationEngine(oddParams);
      oddEngine.nextStep(); // -> twirled
      oddEngine.nextStep(); // -> exchanged
      const state = oddEngine.nextStep(); // -> cnot
      expect(state.pendingPairs?.controlPairs.length).toBe(1);
      expect(state.pendingPairs?.targetPairs.length).toBe(1);
      // The 3rd pair is held back, will be added later if kept
    });

    test('progresses through purification steps: cnot -> measured', () => {
      engine.nextStep(); // -> twirled
      engine.nextStep(); // -> exchanged
      engine.nextStep(); // -> cnot
      const state = engine.nextStep(); // cnot -> measured
      expect(state.purificationStep).toBe('measured');
      expect(state.pendingPairs?.results).toBeDefined();
      expect(state.pendingPairs?.results?.length).toBe(initialParams.initialPairs / 2);
    });

    test('progresses through purification steps: measured -> completed (next round or finished)', () => {
      // Mock Math.random for deterministic measurement outcomes
      const originalMathRandom = Math.random;
      const mockRandom = vi.fn(() => 0.1); // Assume 0.1 leads to success
      Math.random = mockRandom;
      
      try {
        engine.nextStep(); // initial -> twirled
        engine.nextStep(); // twirled -> exchanged
        engine.nextStep(); // exchanged -> cnot
        engine.nextStep(); // cnot -> measured
        const state = engine.nextStep(); // measured -> completed
        
        // Assertions based on mocked success
        expect(state.round).toBe(1);
        expect(state.pendingPairs).toBeUndefined();
      } finally {
        // Restore original Math.random
        Math.random = originalMathRandom;
      }
    });

    test.skip('reaches completion when target fidelity is met', () => {
      // Override state to make a pair have high fidelity
      const highFidEngine = new MonteCarloSimulationEngine(initialParams);
      const state = highFidEngine.getCurrentState();
      state.pairs = state.pairs.map(pair => ({
        ...pair,
        fidelity: 0.96 // Above target fidelity
      }));
      
      // Apply CNOT to reach the point where we check for completion
      state.purificationStep = 'measured';
      state.pendingPairs = {
        controlPairs: [state.pairs[0]],
        targetPairs: [state.pairs[1]],
        results: [{
          control: state.pairs[0],
          successful: true
        }]
      };
      
      // Run the discard step which checks for completion
      const nextState = highFidEngine.nextStep();
      expect(nextState.complete).toBe(true);
    });
  });
  
  describe('step() method', () => {
    test('executes a full purification round with step()', () => {
      let state = engine.getCurrentState();
      expect(state.round).toBe(0);
      
      state = engine.step(); // Executes one full round
      expect(state.round).toBe(1);
      
      // Check step completed a full round
      const successfulPairs = state.pairs.length;
      if (successfulPairs < 2) {
        expect(state.complete).toBe(true);
      } else {
        expect(state.purificationStep).toBe('initial');
      }
    });
  });

  describe('Reset & Update Params', () => {
    test('reset() returns the engine to the initial state', () => {
      engine.nextStep(); // Move state forward
      engine.nextStep();
      
      const initialState = engine.getCurrentState();
      for (let i = 0; i < 3; i++) {
        engine.nextStep(); // Move forward a few more steps
      }
      
      const resetState = engine.reset();
      
      expect(resetState.round).toBe(0);
      expect(resetState.complete).toBe(false);
      expect(resetState.purificationStep).toBe('initial');
      expect(resetState.pairs.length).toBe(initialParams.initialPairs);
    });

    test('updateParams() changes parameters for subsequent reset', () => {
      const newParams: SimulationParameters = {
        initialPairs: 6,
        noiseParameter: 0.05,
        targetFidelity: 0.98
      };
      
      engine.updateParams(newParams);
      const resetState = engine.reset();

      expect(resetState.pairs.length).toBe(newParams.initialPairs);
    });
  });
}); 