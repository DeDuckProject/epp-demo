// import { jest } from '@jest/globals';
import {vi} from 'vitest';
import {SimulationEngine} from '../../src/engine/simulationEngine';
import {SimulationParameters} from '../../src/engine/types';
import {createNoisyEPR} from '../../src/engine/quantumStates';
import {fidelityFromBellBasisMatrix} from "../../src/engine_real_calculations/bell/bell-basis.ts";
import {expectMatrixClose} from "../_test_utils.ts";

// Helper function to calculate fidelity wrt |Φ⁺⟩ directly from Bell basis rho
describe('SimulationEngine', () => {
    let engine: SimulationEngine;
    const noiseParameter = 0.1;
    const initialParams: SimulationParameters = {
        initialPairs: 4,
        noiseParameter: noiseParameter, // p = 0.8
        targetFidelity: 0.95
    };

    beforeEach(() => {
        engine = new SimulationEngine(initialParams);
    });

    describe('Initialization', () => {
        test('initializes with the correct number of pairs', () => {
            const state = engine.getCurrentState();
            expect(state.pairs.length).toBe(initialParams.initialPairs);
            expect(state.round).toBe(0);
            expect(state.complete).toBe(false);
            expect(state.purificationStep).toBe('initial');
        });

        test('initializes pairs with expected noise level', () => {
            const state = engine.getCurrentState();
            const expectedInitialMatrix = createNoisyEPR(initialParams.noiseParameter); // Returns DensityMatrix
            const expectedInitialFidelity = fidelityFromBellBasisMatrix(expectedInitialMatrix); // Helper uses get()
            
            state.pairs.forEach(pair => {
                expectMatrixClose(pair.densityMatrix, expectedInitialMatrix); // Helper uses get()
                expect(pair.fidelity).toBeCloseTo(expectedInitialFidelity);
            });
        });

        test('getCurrentState returns the current state', () => {
            const state1 = engine.getCurrentState();
            const state2 = engine.getCurrentState();
            expect(state1).toEqual(state2); // Should be the same object or deeply equal
        });
    });

    describe('Step Progression via nextStep()', () => {
        test('progresses through purification steps: initial -> twirled', () => {
            let state = engine.getCurrentState();
            expect(state.purificationStep).toBe('initial');
            
            state = engine.nextStep();
            expect(state.purificationStep).toBe('twirled');
            // Check that pairs were actually depolarized (fidelities might change)
            state.pairs.forEach(pair => {
                // The fidelity stored should now be the result *after* the depolarize operation
                // We need to recalculate the expected fidelity after depolarize, should be noiseParameter/3
                const expectedFidelity = noiseParameter/3;
                expect(pair.fidelity).toBeCloseTo(expectedFidelity);
            });
        });

        test('progresses through purification steps: twirled -> exchanged', () => {
            engine.nextStep(); // initial -> twirled
            const state = engine.nextStep(); // twirled -> exchanged
            expect(state.purificationStep).toBe('exchanged');
             // Check fidelity again after exchange, should be 1- noiseParameter
             const expectedFidelity = 1-noiseParameter;
             expect(state.pairs[0].fidelity).toBeCloseTo(expectedFidelity);
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
            const oddEngine = new SimulationEngine(oddParams);
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
            // Mock Math.random for deterministic measurement outcomes in this test
            const originalMathRandom = Math.random;
            const mockRandom = vi.fn(() => 0.1); // Assume 0.1 leads to success
            Math.random = mockRandom;
            
            try {
                engine.nextStep(); // initial -> twirled
                engine.nextStep(); // twirled -> exchanged
                engine.nextStep(); // exchanged -> cnot
                engine.nextStep(); // cnot -> measured (uses mocked Math.random)
                const state = engine.nextStep(); // measured -> completed
                
                // Assertions based on mocked success (expecting 2 pairs remaining)
                expect(state.round).toBe(1);
                expect(state.pendingPairs).toBeUndefined();
                expect(state.pairs.length).toBe(initialParams.initialPairs / 2); // Should be 2 if all succeeded
                expect(state.complete).toBe(false); // Should not be complete yet
                expect(state.purificationStep).toBe('initial'); // Ready for round 1

            } finally {
                // Restore original Math.random
                Math.random = originalMathRandom;
            }
        });

        test('reaches completion when target fidelity is met', () => {
            const highFidelityParams: SimulationParameters = { initialPairs: 16, noiseParameter: 0.01, targetFidelity: 0.99 };
            const fastEngine = new SimulationEngine(highFidelityParams);
            let state = fastEngine.getCurrentState();
            while (!state.complete) {
                state = fastEngine.nextStep();
                 // Add a safeguard against infinite loops in test
                if (state.round > 10) throw new Error('Test exceeded max rounds');
            }
            expect(state.complete).toBe(true);
            expect(state.pairs.length).toBeGreaterThanOrEqual(1);
            // After completion the final state is depolarized wrt |Ψ⁻⟩
            // Check fidelity wrt |Ψ⁻⟩ which is the [3][3] element
            expect(state.pairs[0].densityMatrix.get(3, 3).re).toBeGreaterThanOrEqual(highFidelityParams.targetFidelity); // Use get()
        });

        test('reaches completion when fewer than 2 pairs remain', () => {
            const lowPairParams: SimulationParameters = { initialPairs: 2, noiseParameter: 0.4, targetFidelity: 0.99 }; // High noise likely leads to failures
            const lowPairEngine = new SimulationEngine(lowPairParams);
            let state = lowPairEngine.getCurrentState();
             while (!state.complete) {
                state = lowPairEngine.nextStep();
                 if (state.round > 10) break; // Exit if it takes too long
            }
            expect(state.complete).toBe(true);
            expect(state.pairs.length).toBeLessThan(2);
        });
    });
    
    describe('step() method', () => {
        test('executes a full purification round with step()', () => {
             let state = engine.getCurrentState();
             expect(state.round).toBe(0);
             state = engine.step(); // Executes one full round (depolarize -> exchange -> cnot -> measure -> discard)
             expect(state.round).toBe(1);
             // Check step is back to initial or complete
              const successfulPairs = state.pairs.length;
              const highestFidelity = successfulPairs > 0 ? state.pairs.reduce((max, p) => Math.max(max, p.fidelity), 0) : 0;
              if (successfulPairs < 2 || highestFidelity >= initialParams.targetFidelity) {
                  expect(state.complete).toBe(true);
              } else {
                   expect(state.complete).toBe(false);
                   expect(state.purificationStep).toBe('initial');
              }
        });
    });

    describe('Reset & Update Params', () => {
        test('reset() returns the engine to the initial state', () => {
            engine.nextStep(); // Move state forward
            engine.nextStep();
            const initialEngine = new SimulationEngine(initialParams); // Create clean engine for comparison
            const initialState = initialEngine.getCurrentState();
            const resetState = engine.reset();
            
            // Compare density matrices carefully
            expect(resetState.round).toBe(initialState.round);
            expect(resetState.complete).toBe(initialState.complete);
            expect(resetState.purificationStep).toBe(initialState.purificationStep);
            expect(resetState.pairs.length).toBe(initialState.pairs.length);
            resetState.pairs.forEach((pair) => {
                const initialPair = initialState.pairs.find(p => p.id === pair.id);
                expect(initialPair).toBeDefined();
                if(initialPair) {
                    expectMatrixClose(pair.densityMatrix, initialPair.densityMatrix); // Helper uses get()
                    expect(pair.fidelity).toBeCloseTo(initialPair.fidelity);
                }
            });
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
            // Check fidelity reflects new noise parameter
            const expectedMatrix = createNoisyEPR(newParams.noiseParameter); // Returns DensityMatrix
            const expectedFidelity = fidelityFromBellBasisMatrix(expectedMatrix); // Helper uses get()
            resetState.pairs.forEach(pair => {
                expect(pair.fidelity).toBeCloseTo(expectedFidelity);
            });
        });
    });
}); 