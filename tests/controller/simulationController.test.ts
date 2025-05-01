import { vi, describe, it, expect, beforeEach, afterEach, test } from 'vitest';
import { SimulationController } from '../../src/controller/simulationController';
import { SimulationParameters, SimulationState, ISimulationEngine, EngineType, createEngine } from '../../src/engine/types';

// Create a mock for the createEngine function
vi.mock('../../src/engine/types', async () => {
  const actual = await import('../../src/engine/types');
  return {
    ...actual,
    createEngine: vi.fn()
  };
});

describe('SimulationController', () => {
  let controller: SimulationController;
  let onStateChange: ReturnType<typeof vi.fn>;
  let mockEngine: ISimulationEngine;
  
  const mockInitialParams: SimulationParameters = {
    initialPairs: 4,
    noiseParameter: 0.1,
    targetFidelity: 0.9
  };
  
  const mockInitialState: SimulationState = {
    pairs: [],
    round: 0,
    complete: false,
    purificationStep: 'initial'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup the mock engine WITHOUT implementation
    mockEngine = {
      getCurrentState: vi.fn(),
      nextStep: vi.fn(),
      step: vi.fn(),
      reset: vi.fn(),
      updateParams: vi.fn()
    };

    // Set default return value for getCurrentState
    vi.mocked(mockEngine.getCurrentState).mockReturnValue({ ...mockInitialState });
    
    // Mock the createEngine function to return our mock engine
    vi.mocked(createEngine).mockReturnValue(mockEngine);
    
    // Create a spy for the state change callback
    onStateChange = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initialization', () => {
    test('should create engine with initial params and notify with initial state', () => {
      controller = new SimulationController(mockInitialParams, onStateChange);
      
      // The engine factory should be called with our params
      expect(createEngine).toHaveBeenCalledWith(EngineType.Average, mockInitialParams);
      
      // The controller should read initial state and notify
      expect(mockEngine.getCurrentState).toHaveBeenCalledTimes(1);
      expect(onStateChange).toHaveBeenCalledTimes(1);
      expect(onStateChange).toHaveBeenCalledWith(mockInitialState);
    });
    
    test('should create average engine when specified', () => {
      controller = new SimulationController(mockInitialParams, onStateChange, EngineType.Average);
      
      expect(createEngine).toHaveBeenCalledWith(EngineType.Average, mockInitialParams);
    });
    
    test('should create monte carlo engine when specified', () => {
      controller = new SimulationController(mockInitialParams, onStateChange, EngineType.MonteCarlo);
      
      expect(createEngine).toHaveBeenCalledWith(EngineType.MonteCarlo, mockInitialParams);
    });
  });

  describe('State progression methods', () => {
    beforeEach(() => {
      controller = new SimulationController(mockInitialParams, onStateChange);
    });
    
    test('should advance a single step with nextStep()', () => {
      const nextState: SimulationState = {
        ...mockInitialState,
        purificationStep: 'twirled'
      };
      
      vi.mocked(mockEngine.nextStep).mockReturnValue(nextState);
      
      controller.nextStep();
      
      expect(mockEngine.nextStep).toHaveBeenCalledTimes(1);
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(onStateChange).toHaveBeenLastCalledWith(nextState);
    });
    
    test('should complete a full round when completeRound() is called', () => {
      // Setup a sequence of states to simulate progression through a round
      const initialState: SimulationState = {
        ...mockInitialState,
        purificationStep: 'initial'
      };
      
      const twirledState: SimulationState = {
        ...mockInitialState,
        purificationStep: 'twirled'
      };
      
      const exchangedState: SimulationState = {
        ...mockInitialState,
        purificationStep: 'exchanged'
      };
      
      const completedState: SimulationState = {
        ...mockInitialState,
        purificationStep: 'completed',
        round: 1
      };
      
      // Initial getCurrentState call returns initial state
      vi.mocked(mockEngine.getCurrentState).mockReturnValueOnce(initialState);
      
      // Setup nextStep to return states in sequence
      vi.mocked(mockEngine.nextStep)
        .mockReturnValueOnce(twirledState)
        .mockReturnValueOnce(exchangedState)
        .mockReturnValueOnce(completedState);
      
      // Call the method under test
      controller.completeRound();
      
      // Verify interactions
      expect(mockEngine.getCurrentState).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(mockEngine.nextStep).toHaveBeenCalledTimes(3); // Called until 'completed'
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once at end
      expect(onStateChange).toHaveBeenLastCalledWith(completedState);
    });
    
    test('should not call nextStep if already at completed step during completeRound', () => {
      // Setup the initial state to be already completed
      const completedState: SimulationState = {
        ...mockInitialState,
        purificationStep: 'completed'
      };
      
      vi.mocked(mockEngine.getCurrentState).mockReturnValue(completedState);
      
      // Call the method under test
      controller.completeRound();
      
      // Verify interactions - should not call nextStep
      expect(mockEngine.getCurrentState).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(mockEngine.nextStep).not.toHaveBeenCalled();
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(onStateChange).toHaveBeenLastCalledWith(completedState);
    });
    
    test('should not call nextStep if simulation is already complete during completeRound', () => {
      // Setup the initial state to be already complete
      const completeState: SimulationState = {
        ...mockInitialState,
        complete: true,
        purificationStep: 'initial'
      };
      
      vi.mocked(mockEngine.getCurrentState).mockReturnValue(completeState);
      
      // Call the method under test
      controller.completeRound();
      
      // Verify interactions - should not call nextStep
      expect(mockEngine.getCurrentState).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(mockEngine.nextStep).not.toHaveBeenCalled();
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(onStateChange).toHaveBeenLastCalledWith(completeState);
    });
    
    test('should execute a single full round step when step() is called', () => {
      const stepState: SimulationState = {
        ...mockInitialState,
        round: 1,
        purificationStep: 'initial'
      };
      
      vi.mocked(mockEngine.step).mockReturnValue(stepState);
      
      controller.step();
      
      expect(mockEngine.step).toHaveBeenCalledTimes(1);
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(onStateChange).toHaveBeenLastCalledWith(stepState);
    });
    
    test('should reset the simulation state when reset() is called', () => {
      const resetState: SimulationState = {
        ...mockInitialState,
        pairs: [],
        round: 0
      };
      
      vi.mocked(mockEngine.reset).mockReturnValue(resetState);
      
      controller.reset();
      
      expect(mockEngine.reset).toHaveBeenCalledTimes(1);
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(onStateChange).toHaveBeenLastCalledWith(resetState);
    });
    
    test('should update parameters and reset when updateParameters() is called', () => {
      const newParams: SimulationParameters = {
        initialPairs: 8,
        noiseParameter: 0.2,
        targetFidelity: 0.95
      };
      
      const updatedState: SimulationState = {
        ...mockInitialState,
        pairs: new Array(8)
      };
      
      vi.mocked(mockEngine.getCurrentState).mockReturnValue(updatedState);
      
      controller.updateParameters(newParams);
      
      expect(mockEngine.updateParams).toHaveBeenCalledTimes(1);
      expect(mockEngine.updateParams).toHaveBeenCalledWith(newParams);
      expect(mockEngine.getCurrentState).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(onStateChange).toHaveBeenLastCalledWith(updatedState);
    });
  });
  
  describe('runUntilComplete()', () => {
    beforeEach(() => {
      controller = new SimulationController(mockInitialParams, onStateChange);
    });

    test('should run until complete when state becomes complete', () => {
      // Setup sequence of states with the last one being complete
      const initialState: SimulationState = {
        ...mockInitialState,
        complete: false,
        round: 0
      };
      
      const step1State: SimulationState = {
        ...mockInitialState,
        complete: false,
        round: 1
      };
      
      const step2State: SimulationState = {
        ...mockInitialState,
        complete: false,
        round: 2
      };
      
      const completeState: SimulationState = {
        ...mockInitialState,
        complete: true,
        round: 3
      };
      
      // Initial state check
      vi.mocked(mockEngine.getCurrentState).mockReturnValueOnce(initialState);
      
      // Step progression
      vi.mocked(mockEngine.step)
        .mockReturnValueOnce(step1State)
        .mockReturnValueOnce(step2State)
        .mockReturnValueOnce(completeState);
      
      controller.runUntilComplete();
      
      expect(mockEngine.getCurrentState).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(mockEngine.step).toHaveBeenCalledTimes(3);
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once at end
      expect(onStateChange).toHaveBeenLastCalledWith(completeState);
    });
    
    test('should stop after maxRounds (100) even if not complete', () => {
      // Setup to never complete
      const notCompleteState: SimulationState = {
        ...mockInitialState,
        complete: false
      };
      
      vi.mocked(mockEngine.getCurrentState).mockReturnValue(notCompleteState);
      vi.mocked(mockEngine.step).mockReturnValue(notCompleteState);
      
      controller.runUntilComplete();
      
      expect(mockEngine.getCurrentState).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(mockEngine.step).toHaveBeenCalledTimes(100); // Should cap at 100 calls
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once at end
      expect(onStateChange).toHaveBeenLastCalledWith(notCompleteState);
    });
    
    test('should not run any steps if already complete', () => {
      // Setup the initial state to be already complete
      const completeState: SimulationState = {
        ...mockInitialState,
        complete: true
      };
      
      vi.mocked(mockEngine.getCurrentState).mockReturnValue(completeState);
      
      controller.runUntilComplete();
      
      expect(mockEngine.getCurrentState).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(mockEngine.step).not.toHaveBeenCalled();
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(onStateChange).toHaveBeenLastCalledWith(completeState);
    });
  });
  
  describe('Engine Switching', () => {
    test('should be able to switch engine types by recreating controller', () => {
      // Create controller with Average engine
      new SimulationController(
        mockInitialParams, 
        onStateChange, 
        EngineType.Average
      );
      
      // Verify average engine was created
      expect(createEngine).toHaveBeenCalledWith(EngineType.Average, mockInitialParams);
      
      // Clear the call history but keep the mock implementation
      vi.mocked(createEngine).mockClear();
      
      // Create a second mock engine for the Monte Carlo case
      const monteMockEngine: ISimulationEngine = {
        getCurrentState: vi.fn().mockReturnValue({ ...mockInitialState }),
        nextStep: vi.fn(),
        step: vi.fn(),
        reset: vi.fn(),
        updateParams: vi.fn()
      };
      
      // Update the createEngine mock to return the new engine
      vi.mocked(createEngine).mockReturnValue(monteMockEngine);
      
      // Create a new controller with Monte Carlo engine
      new SimulationController(
        mockInitialParams, 
        onStateChange, 
        EngineType.MonteCarlo
      );
      
      // Verify monte carlo engine was created
      expect(createEngine).toHaveBeenCalledWith(EngineType.MonteCarlo, mockInitialParams);
    });
  });
}); 