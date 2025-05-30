import {vi} from 'vitest';
import {MonteCarloSimulationEngine} from '../../src/engine/monteCarloSimulationEngine';
import {Basis, SimulationParameters, NoiseChannel} from '../../src/engine/types';
import {DensityMatrix} from '../../src/engine_real_calculations/matrix/densityMatrix';
import * as PauliTwirling from '../../src/engine_real_calculations/operations/pauliTwirling';
import * as RealCalculations from '../../src/engine_real_calculations';
import * as PartialTrace from '../../src/engine_real_calculations/operations/partialTrace';
import {BellState, fidelityFromComputationalBasisMatrix} from '../../src/engine_real_calculations/bell/bell-basis';

function expectFidelityRange(fidelity: number, min: number, max: number, message?: string) {
  expect(fidelity).toBeGreaterThanOrEqual(min);
  expect(fidelity).toBeLessThanOrEqual(max);
  if (message) {
    expect(fidelity >= min && fidelity <= max).toBe(true);
  }
}

describe('MonteCarloSimulationEngine - Noise Channel Tests', () => {
  const testNoiseChannels = [
    NoiseChannel.AmplitudeDamping,
    NoiseChannel.Depolarizing,
    NoiseChannel.Dephasing,
    NoiseChannel.UniformNoise
  ];

  testNoiseChannels.forEach(noiseChannel => {
    test(`should initialize correctly with ${noiseChannel} noise channel`, () => {
      const params: SimulationParameters = {
        initialPairs: 4,
        noiseParameter: 0.2,
        targetFidelity: 0.95,
        noiseChannel
      };

      const engine = new MonteCarloSimulationEngine(params);
      const state = engine.getCurrentState();

      expect(state.pairs).toHaveLength(4);
      expect(state.round).toBe(0);
      expect(state.complete).toBe(false);
      expect(state.purificationStep).toBe('initial');

      // All pairs should be valid with proper fidelity
      state.pairs.forEach((pair, index) => {
        expect(pair.basis).toBe(Basis.Computational);
        expect(pair.id).toBe(index);
        expectFidelityRange(pair.fidelity, 0, 1, `Pair ${index} fidelity should be valid for ${noiseChannel}`);
        
        // With noise, fidelity should be less than perfect
        if (params.noiseParameter > 0) {
          expect(pair.fidelity).toBeLessThan(1);
        }

        // Density matrix should be valid (trace = 1)
        expect(pair.densityMatrix.trace().re).toBeCloseTo(1, 5);
      });
    });

    test(`should handle zero noise correctly with ${noiseChannel}`, () => {
      const params: SimulationParameters = {
        initialPairs: 2,
        noiseParameter: 0,
        targetFidelity: 0.95,
        noiseChannel
      };

      const engine = new MonteCarloSimulationEngine(params);
      const state = engine.getCurrentState();

      // With zero noise, all pairs should have perfect fidelity
      state.pairs.forEach(pair => {
        expect(pair.fidelity).toBeCloseTo(1, 5);
      });
    });
  });

  test('different noise channels should produce different fidelities', () => {
    const noiseParam = 0.4;
    const engines = testNoiseChannels.map(channel => {
      return new MonteCarloSimulationEngine({
        initialPairs: 2,
        noiseParameter: noiseParam,
        targetFidelity: 0.95,
        noiseChannel: channel
      });
    });

    const states = engines.map(engine => engine.getCurrentState());
    const fidelities = states.map(state => state.pairs[0].fidelity);

    // Check that at least some pairs of channels produce different fidelities
    let foundDifference = false;
    for (let i = 0; i < fidelities.length; i++) {
      for (let j = i + 1; j < fidelities.length; j++) {
        if (Math.abs(fidelities[i] - fidelities[j]) > 0.01) {
          foundDifference = true;
          break;
        }
      }
      if (foundDifference) break;
    }

    expect(foundDifference).toBe(true); // At least some noise channels should produce different results
  });

  test('should throw error for unknown noise channel', () => {
    const invalidParams = {
      initialPairs: 2,
      noiseParameter: 0.3,
      targetFidelity: 0.95,
      noiseChannel: 'invalid' as NoiseChannel
    };

    expect(() => {
      new MonteCarloSimulationEngine(invalidParams);
    }).toThrow('Unknown noise channel: invalid');
  });
});

describe('MonteCarloSimulationEngine', () => {
  let engine: MonteCarloSimulationEngine;
  const noiseParameter = 0.1;
  const initialParams: SimulationParameters = {
    initialPairs: 4,
    noiseParameter: noiseParameter,
    targetFidelity: 0.95,
    noiseChannel: NoiseChannel.AmplitudeDamping // Add default noise channel
  };

  beforeEach(() => {
    engine = new MonteCarloSimulationEngine(initialParams);
  });

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

    test('pairs are initialized with computational basis', () => {
      const state = engine.getCurrentState();
      
      state.pairs.forEach(pair => {
        // Verify each pair has the correct basis
        expect(pair.basis).toBe(Basis.Computational);
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

    test('average fidelity is always calculated in getCurrentState', () => {
        const engine = new MonteCarloSimulationEngine(initialParams);
        
        const state1 = engine.getCurrentState();
        expect(state1.averageFidelity).toBeGreaterThan(0);
        
        // Progress and check again
        engine.nextStep();
        const state2 = engine.getCurrentState();
        expect(state2.averageFidelity).toBeGreaterThan(0);
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

    test("exchange Ψ⁻↔Φ⁺ via Y gate on Alice's qubit", () => {
      const spy = vi.spyOn(RealCalculations, 'applyPauli');
      
      engine.nextStep(); // initial -> twirled
      const state = engine.nextStep(); // twirled -> exchanged
      
      // Verify applyPauli was called once per pair with correct params
      expect(spy).toHaveBeenCalledTimes(initialParams.initialPairs);
      expect(spy).toHaveBeenCalledWith(
        expect.any(DensityMatrix), 
        [0], // Alice's qubit
        ['Y'] // Y gate
      );
      
      // Verify the step updated correctly
      expect(state.purificationStep).toBe('exchanged');
      
      // Verify fidelity is now calculated with respect to PHI_PLUS
      state.pairs.forEach(pair => {
        const calculatedFidelity = fidelityFromComputationalBasisMatrix(
          pair.densityMatrix, 
          BellState.PHI_PLUS
        );
        expect(pair.fidelity).toBeCloseTo(calculatedFidelity);
      });
      
      spy.mockRestore();
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
    
    test('creates joint states with proper dimensions during bilateral CNOT', () => {
      engine.nextStep(); // initial -> twirled
      engine.nextStep(); // twirled -> exchanged
      const state = engine.nextStep(); // exchanged -> cnot
      
      // Verify joint states are created
      expect(state.pendingPairs?.jointStates).toBeDefined();
      expect(state.pendingPairs?.jointStates?.length).toBe(initialParams.initialPairs / 2);
      
      // Verify each joint state is a 16x16 density matrix (4 qubits)
      state.pendingPairs?.jointStates?.forEach(jointState => {
        expect(jointState.rows).toBe(16);
        expect(jointState.cols).toBe(16);
        
        // Verify it's a valid density matrix (trace = 1)
        const trace = jointState.trace();
        expect(trace.re).toBeCloseTo(1.0);
        expect(trace.im).toBeCloseTo(0.0);
        
        // Verify that matrices are Hermitian (ρ = ρ†)
        expect(jointState.validate()).toBe(true);
      });
    });
    
    test('applies correct bilateral CNOT operation', () => {
      // Mock the applyCNOT function to verify it's called properly
      const applyCNOTSpy = vi.spyOn(RealCalculations, 'applyCNOT');
      
      engine.nextStep(); // initial -> twirled
      engine.nextStep(); // twirled -> exchanged
      engine.nextStep(); // exchanged -> cnot
      
      // Verify applyCNOT was called twice per joint state (Alice's and Bob's CNOTs)
      const expectedCalls = initialParams.initialPairs; // 2 calls per joint state
      expect(applyCNOTSpy).toHaveBeenCalledTimes(expectedCalls);
      
      // Check specific calls - first Alice's CNOT with control=0, target=2
      expect(applyCNOTSpy).toHaveBeenCalledWith(
        expect.any(DensityMatrix),
        0, // Alice's control qubit
        2  // Alice's target qubit
      );
      
      // Then Bob's CNOT with control=1, target=3
      expect(applyCNOTSpy).toHaveBeenCalledWith(
        expect.any(DensityMatrix),
        1, // Bob's control qubit
        3  // Bob's target qubit
      );
      
      applyCNOTSpy.mockRestore();
    });
    
    test('updates individual pair density matrices using partial trace', () => {
      // Mock the partialTrace function
      const partialTraceSpy = vi.spyOn(PartialTrace, 'partialTrace');
      
      engine.nextStep(); // initial -> twirled
      engine.nextStep(); // twirled -> exchanged
      const beforeState = engine.getCurrentState();
      
      // Save references to the original density matrices before CNOT
      const originalControlMatrix = beforeState.pairs[0].densityMatrix;
      const originalTargetMatrix = beforeState.pairs[1].densityMatrix;
      
      // Apply bilateral CNOT
      const afterState = engine.nextStep(); // exchanged -> cnot
      
      // Verify partialTrace was called for each pair
      expect(partialTraceSpy).toHaveBeenCalledTimes(initialParams.initialPairs); // Called once for each control and target pair
      
      // Check control pairs were traced with [2,3] (target qubits)
      expect(partialTraceSpy).toHaveBeenCalledWith(
        expect.any(DensityMatrix), // Joint state
        [2, 3] // Trace out target qubits
      );
      
      // Check target pairs were traced with [0,1] (control qubits)
      expect(partialTraceSpy).toHaveBeenCalledWith(
        expect.any(DensityMatrix), // Joint state
        [0, 1] // Trace out control qubits
      );
      
      // Verify the pairs in pendingPairs have updated density matrices
      afterState.pendingPairs?.controlPairs.forEach(pair => {
        expect(pair.densityMatrix).not.toBe(originalControlMatrix);
      });
      
      afterState.pendingPairs?.targetPairs.forEach(pair => {
        expect(pair.densityMatrix).not.toBe(originalTargetMatrix);
      });
      
      // Verify the main pairs array is also updated
      const updatedControlPair = afterState.pairs.find(p => p.id === beforeState.pairs[0].id);
      const updatedTargetPair = afterState.pairs.find(p => p.id === beforeState.pairs[1].id);
      
      expect(updatedControlPair?.densityMatrix).not.toBe(originalControlMatrix);
      expect(updatedTargetPair?.densityMatrix).not.toBe(originalTargetMatrix);
      
      partialTraceSpy.mockRestore();
    });
    
    test('tensor product combines the correct pairs', () => {
      // Mock the tensor function to verify it's called with the right pairs
      const tensorSpy = vi.spyOn(RealCalculations, 'tensor');
      
      engine.nextStep(); // initial -> twirled
      engine.nextStep(); // twirled -> exchanged
      engine.nextStep(); // exchanged -> cnot
      
      // Verify tensor was called for each control-target pair
      expect(tensorSpy).toHaveBeenCalledTimes(initialParams.initialPairs / 2);
      
      // We can't easily check the exact matrices because they are modified
      // during the test execution, but we can verify that tensor was called
      // the expected number of times
      tensorSpy.mockRestore();
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

    test('completes post-measurement purification (measured -> discard -> initial)', () => {
      const noiseParameter = 0.30;
      const initialParams: SimulationParameters = {
        initialPairs: 64,
        noiseParameter: noiseParameter,
        targetFidelity: 0.99,
        noiseChannel: NoiseChannel.AmplitudeDamping
      };
      engine = new MonteCarloSimulationEngine(initialParams);

      // Mock Math.random for deterministic measurement outcomes
      const originalMathRandom = Math.random;
      const mockRandom = vi.fn(() => 0.1); // Assume 0.1 leads to success
      Math.random = mockRandom;
      
      try {
        engine.nextStep(); // initial -> twirled
        engine.nextStep(); // twirled -> exchanged
        engine.nextStep(); // exchanged -> cnot
        const measuredState = engine.nextStep(); // cnot -> measured
        
        // Verify we're in measured state with results
        expect(measuredState.purificationStep).toBe('measured');
        expect(measuredState.pendingPairs?.results).toBeDefined();
        
        // Apply discard step (just filters)
        const discardState = engine.nextStep(); // measured -> discard
        
        // Verify discard step behavior
        expect(discardState.purificationStep).toBe('discard');
        expect(discardState.pendingPairs).toBeUndefined();
        expect(discardState.round).toBe(0); // Round not incremented yet
        
        // Apply twirl+exchange step
        const finalState = engine.nextStep(); // discard -> initial
        
        // Verify final state after full sequence
        expect(finalState.round).toBe(1); // Round should have incremented
        expect(finalState.pendingPairs).toBeUndefined();
        expect(finalState.purificationStep).toBe('initial'); // Ready for next round
      } finally {
        // Restore original Math.random
        Math.random = originalMathRandom;
      }
    });

    test('reaches completion when target fidelity is met', () => {
      // Create engine with high-fidelity pairs
      const highFidEngine = new MonteCarloSimulationEngine({
        ...initialParams,
        targetFidelity: 0.9 // Lower target so we can easily exceed it
      });
      
      // Set up state to be at discard step, which will trigger twirlExchange
      // @ts-ignore: Accessing private property
      highFidEngine['state'].purificationStep = 'discard';
      // @ts-ignore: Accessing private property
      highFidEngine['state'].round = 0;
      
      // Set pairs to have very high fidelity
      // @ts-ignore: Accessing private property
      highFidEngine['state'].pairs.forEach(pair => {
        pair.fidelity = 0.95; // Higher than our target
      });
      
      // Run the step which should trigger twirlExchange and check for completion
      const nextState = highFidEngine.nextStep();
      
      // Verify completion
      expect(nextState.complete).toBe(true);
      expect(nextState.purificationStep).toBe('completed');
    });
  });
  
  describe('basis preservation during operations', () => {
    test('maintains computational basis through a complete step cycle', () => {
      // Run a full step and verify basis is preserved
      const afterStep = engine.step();
      
      // Check all pairs still have computational basis
      afterStep.pairs.forEach(pair => {
        expect(pair.basis).toBe(Basis.Computational);
      });
    });
    
    test('preserves basis during measurement and result processing', () => {
      // Set up to measurement stage
      engine.nextStep(); // initial -> twirled
      engine.nextStep(); // twirled -> exchanged
      engine.nextStep(); // exchanged -> cnot
      const measuredState = engine.nextStep(); // cnot -> measured
      
      // Check controlPairs in pending results have basis preserved
      measuredState.pendingPairs?.results?.forEach(result => {
        expect(result.control.basis).toBe(Basis.Computational);
      });
      
      // Process results through both discard and exchange steps
      const discardState = engine.nextStep(); // measured -> discard
      discardState.pairs.forEach(pair => {
        expect(pair.basis).toBe(Basis.Computational);
      });
      
      // Final state after complete purification
      const finalState = engine.nextStep(); // discard -> initial
      finalState.pairs.forEach(pair => {
        expect(pair.basis).toBe(Basis.Computational);
      });
    });
  });
  
  describe('step() method with new purification steps', () => {
    test('step() method executes the full sequence including new steps', () => {
      const noiseParameter = 0.30;
      const initialParams: SimulationParameters = {
        initialPairs: 64,
        noiseParameter: noiseParameter,
        targetFidelity: 0.99,
        noiseChannel: NoiseChannel.AmplitudeDamping
      };
      engine = new MonteCarloSimulationEngine(initialParams);

      // Mock Math.random for deterministic outcomes
      const originalMathRandom = Math.random;
      const mockRandom = vi.fn(() => 0.1); // Assume 0.1 leads to success
      Math.random = mockRandom;
      
      try {
        const initialState = engine.getCurrentState();
        expect(initialState.round).toBe(0);
        expect(initialState.purificationStep).toBe('initial');
        
        // Execute a full round with step()
        const afterState = engine.step();
        
        // Should have completed a full round
        expect(afterState.round).toBe(1);
        expect(afterState.purificationStep).toBe('initial');
      } finally {
        // Restore original Math.random
        Math.random = originalMathRandom;
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
        targetFidelity: 0.98,
        noiseChannel: NoiseChannel.AmplitudeDamping
      };
      
      engine.updateParams(newParams);
      const resetState = engine.reset();

      expect(resetState.pairs.length).toBe(newParams.initialPairs);
    });
  });

  describe('Pauli Twirling Step', () => {
    test('applies pauliTwirl to each pair during applyRandomTwirling', () => {
      // Spy on the pauliTwirl function
      const pauliTwirlSpy = vi.spyOn(PauliTwirling, 'pauliTwirl');
      
      // Call nextStep to trigger the applyRandomTwirling method
      engine.nextStep();
      
      // Verify pauliTwirl was called for each pair
      expect(pauliTwirlSpy).toHaveBeenCalledTimes(initialParams.initialPairs);
      
      // Verify all calls were with a DensityMatrix
      for (let i = 0; i < pauliTwirlSpy.mock.calls.length; i++) {
        expect(pauliTwirlSpy.mock.calls[i][0]).toBeInstanceOf(DensityMatrix);
      }
      
      // Clean up spy
      pauliTwirlSpy.mockRestore();
    });
    
    test('recalculates fidelity after twirling', () => {
      // Create a predictable twirling result
      const originalTwirl = PauliTwirling.pauliTwirl;
      
      // Mock pauliTwirl to return a known density matrix
      vi.spyOn(PauliTwirling, 'pauliTwirl').mockImplementation((rho) => {
        // For test simplicity, return a pure Bell state with known fidelity
        return DensityMatrix.bellPsiMinus();
      });
      
      // Get initial state for comparison
      const initialState = engine.getCurrentState();
      
      // Run twirling step
      const afterTwirlingState = engine.nextStep();
      
      // Check fidelity was recalculated
      afterTwirlingState.pairs.forEach(pair => {
        // Since we're returning a pure Bell state in our mock, fidelity should be 1.0
        expect(pair.fidelity).toBeCloseTo(1.0);
      });
      
      // Restore original implementation
      vi.mocked(PauliTwirling.pauliTwirl).mockRestore();
    });
    
    test('updates purificationStep to twirled', () => {
      // Get initial state
      const initialState = engine.getCurrentState();
      expect(initialState.purificationStep).toBe('initial');
      
      // Run twirling step
      const afterState = engine.nextStep();
      
      // Check state was updated correctly
      expect(afterState.purificationStep).toBe('twirled');
    });
    
    test('preserves the number of pairs', () => {
      // Get initial count
      const initialState = engine.getCurrentState();
      const initialCount = initialState.pairs.length;
      
      // Run twirling step
      const afterState = engine.nextStep();
      
      // Check number of pairs is preserved
      expect(afterState.pairs.length).toBe(initialCount);
    });
  });

  describe('Measurement', () => {
    test('returns success when Alice and Bob measure same outcomes', () => {
      // Create a specific state that will lead to matching measurements
      // Pure |00⟩ state: both Alice and Bob will measure 0
      const pureState = new DensityMatrix([
        [{ re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }]
      ]);
      
      // Create joint state with |0000⟩ - Both will measure 0
      const jointState = DensityMatrix.tensor(pureState, pureState);
      
      // Mock the measureQubit function to return deterministic results
      const measureSpy = vi.spyOn(RealCalculations, 'measureQubit');
      
      // First call (Alice's measurement) - return outcome 0
      measureSpy.mockReturnValueOnce({ 
        outcome: 0, 
        probability: 1.0, 
        postState: jointState 
      });
      
      // Second call (Bob's measurement) - return outcome 0 (same as Alice)
      measureSpy.mockReturnValueOnce({ 
        outcome: 0, 
        probability: 1.0, 
        postState: jointState 
      });
      
      // Setup the engine's state with our test data
      engine = new MonteCarloSimulationEngine(initialParams);
      
      // Mock internal state to simulate being at the CNOT step
      // @ts-ignore: Accessing private property
      engine['state'].purificationStep = 'cnot';
      // @ts-ignore: Accessing private property
      engine['state'].pendingPairs = {
        controlPairs: [{ id: 0, densityMatrix: pureState, fidelity: 1, basis: Basis.Computational }],
        targetPairs: [{ id: 1, densityMatrix: pureState, fidelity: 1, basis: Basis.Computational }],
        jointStates: [jointState]
      };
      
      // Call the measurement step
      // @ts-ignore: Accessing private method
      engine['performMeasurement']();
      
      // Get updated state
      const state = engine.getCurrentState();
      
      // Verify the measurement step succeeded
      expect(state.purificationStep).toBe('measured');
      expect(state.pendingPairs?.results).toBeDefined();
      expect(state.pendingPairs?.results?.length).toBe(1);
      expect(state.pendingPairs?.results?.[0].successful).toBe(true);
      
      // Cleanup
      measureSpy.mockRestore();
    });
    
    test('returns failure when Alice and Bob measure different outcomes', () => {
      // Create a pure state |01⟩ that will lead to different measurements
      const controlState = new DensityMatrix([
        [{ re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }]
      ]);
      
      // Target state |01⟩ - Alice gets 0, Bob gets 1
      const targetState = new DensityMatrix([
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }]
      ]);
      
      // Create joint state
      const jointState = DensityMatrix.tensor(controlState, targetState);
      
      // Mock the measureQubit function to return deterministic results
      const measureSpy = vi.spyOn(RealCalculations, 'measureQubit');
      
      // First call (Alice's measurement) - return outcome 0
      measureSpy.mockReturnValueOnce({ 
        outcome: 0, 
        probability: 1.0, 
        postState: jointState 
      });
      
      // Second call (Bob's measurement) - return outcome 1 (different from Alice)
      measureSpy.mockReturnValueOnce({ 
        outcome: 1, 
        probability: 1.0, 
        postState: jointState 
      });
      
      // Setup the engine's state with our test data
      engine = new MonteCarloSimulationEngine(initialParams);
      
      // Mock internal state to simulate being at the CNOT step
      // @ts-ignore: Accessing private property
      engine['state'].purificationStep = 'cnot';
      // @ts-ignore: Accessing private property
      engine['state'].pendingPairs = {
        controlPairs: [{ id: 0, densityMatrix: controlState, fidelity: 1, basis: Basis.Computational }],
        targetPairs: [{ id: 1, densityMatrix: targetState, fidelity: 1, basis: Basis.Computational }],
        jointStates: [jointState]
      };
      
      // Call the measurement step
      // @ts-ignore: Accessing private method
      engine['performMeasurement']();
      
      // Get updated state
      const state = engine.getCurrentState();
      
      // Verify the measurement step failed
      expect(state.purificationStep).toBe('measured');
      expect(state.pendingPairs?.results).toBeDefined();
      expect(state.pendingPairs?.results?.length).toBe(1);
      expect(state.pendingPairs?.results?.[0].successful).toBe(false);
      
      // Cleanup
      measureSpy.mockRestore();
    });
    
    test('correctly traces out measured qubits to update control pair state', () => {
      // Create simple states
      const controlState = new DensityMatrix([
        [{ re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }]
      ]);
      
      const targetState = new DensityMatrix([
        [{ re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }]
      ]);
      
      // Create joint state
      const jointState = DensityMatrix.tensor(controlState, targetState);
      
      // Mock the measureQubit function
      const measureSpy = vi.spyOn(RealCalculations, 'measureQubit');
      measureSpy.mockReturnValueOnce({ outcome: 0, probability: 1.0, postState: jointState });
      measureSpy.mockReturnValueOnce({ outcome: 0, probability: 1.0, postState: jointState });
      
      // Mock the partialTrace function
      const partialTraceSpy = vi.spyOn(PartialTrace, 'partialTrace');
      const tracedOutState = new DensityMatrix([
        [{ re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }]
      ]);
      partialTraceSpy.mockReturnValue(tracedOutState);
      
      // Setup the engine state
      engine = new MonteCarloSimulationEngine(initialParams);
      // @ts-ignore: Accessing private property
      engine['state'].purificationStep = 'cnot';
      // @ts-ignore: Accessing private property
      engine['state'].pendingPairs = {
        controlPairs: [{ id: 0, densityMatrix: controlState, fidelity: 1, basis: Basis.Computational }],
        targetPairs: [{ id: 1, densityMatrix: targetState, fidelity: 1, basis: Basis.Computational }],
        jointStates: [jointState]
      };
      
      // Call the measurement step
      // @ts-ignore: Accessing private method
      engine['performMeasurement']();
      
      // Verify that partialTrace was called correctly
      // TODO make sure this is correct and we don't the wrong qubits here. I think its ok
      expect(partialTraceSpy).toHaveBeenCalledWith(expect.any(DensityMatrix), [0, 1]);
      
      // Verify the control pair was updated with the traced out state
      const state = engine.getCurrentState();
      expect(state.pendingPairs?.results?.[0].control.densityMatrix).toBe(tracedOutState);
      
      // Cleanup
      measureSpy.mockRestore();
      partialTraceSpy.mockRestore();
    });
  });

  describe('twirlExchange step', () => {
    test('applies exchange followed by twirl when transitioning from discard to initial', () => {
      // Create an engine at the discard step
      const engine = new MonteCarloSimulationEngine(initialParams);
      
      // Set up the engine state to be at discard step
      // @ts-ignore: Accessing private property
      engine['state'].purificationStep = 'discard';
      // @ts-ignore: Accessing private property
      engine['state'].round = 0;

      // Spy on the Pauli operations and twirling
      const pauliSpy = vi.spyOn(RealCalculations, 'applyPauli');
      const twirlSpy = vi.spyOn(PauliTwirling, 'pauliTwirl');
      
      // Execute the step
      const state = engine.nextStep();
      
      // Verify the Y-gate was called for each pair (from exchangePsiPhiComponents)
      expect(pauliSpy).toHaveBeenCalledTimes(initialParams.initialPairs);
      expect(pauliSpy).toHaveBeenCalledWith(
        expect.any(DensityMatrix),
        [0], // Alice's qubit
        ['Y'] // Y gate
      );
      
      // Verify pauliTwirl was called for each pair (from applyRandomTwirling)
      expect(twirlSpy).toHaveBeenCalledTimes(initialParams.initialPairs);
      
      // Verify state updates
      expect(state.round).toBe(1); // Round incremented
      expect(state.purificationStep).toBe('initial'); // Ready for next round
      expect(state.pendingPairs).toBeUndefined(); // No pending pairs
      
      // Clean up spies
      pauliSpy.mockRestore();
      twirlSpy.mockRestore();
    });
  });
}); 