import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SimulationController } from '../../src/controller/simulationController';
import { SimulationEngine } from '../../src/engine/simulationEngine';
import { SimulationParameters, SimulationState } from '../../src/engine/types';

// Create a mock engine factory
const mockEngineFactory = {
  getCurrentState: vi.fn(),
  nextStep: vi.fn(),
  step: vi.fn(),
  reset: vi.fn(),
  updateParams: vi.fn()
};

// Mock the SimulationEngine module
vi.mock('../../src/engine/simulationEngine', () => {
  return {
    SimulationEngine: vi.fn(() => mockEngineFactory)
  };
});

describe('SimulationController', () => {
  let controller: SimulationController;
  let onStateChange: ReturnType<typeof vi.fn>;
  
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
    
    // Reset the mock engine
    vi.mocked(SimulationEngine).mockClear();
    
    // Setup the mock engine's behavior for initial state
    mockEngineFactory.getCurrentState.mockReturnValue({ ...mockInitialState });
    
    // Create a spy for the state change callback
    onStateChange = vi.fn();
    
    // Create a new controller with mocked dependencies
    controller = new SimulationController(mockInitialParams, onStateChange);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initialization', () => {
    it('should create engine with initial params and notify with initial state', () => {
      // The engine constructor should be called with our params
      expect(SimulationEngine).toHaveBeenCalledWith(mockInitialParams);
      
      // The controller should read initial state and notify
      expect(mockEngineFactory.getCurrentState).toHaveBeenCalledTimes(1);
      expect(onStateChange).toHaveBeenCalledTimes(1);
      expect(onStateChange).toHaveBeenCalledWith(mockInitialState);
    });
  });

  describe('State progression methods', () => {
    it('should advance a single step with nextStep()', () => {
      const nextState: SimulationState = {
        ...mockInitialState,
        purificationStep: 'twirled'
      };
      
      mockEngineFactory.nextStep.mockReturnValue(nextState);
      
      controller.nextStep();
      
      expect(mockEngineFactory.nextStep).toHaveBeenCalledTimes(1);
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(onStateChange).toHaveBeenLastCalledWith(nextState);
    });
    
    it('should complete a full round when completeRound() is called', () => {
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
      mockEngineFactory.getCurrentState.mockReturnValueOnce(initialState);
      
      // Setup nextStep to return states in sequence
      mockEngineFactory.nextStep
        .mockReturnValueOnce(twirledState)
        .mockReturnValueOnce(exchangedState)
        .mockReturnValueOnce(completedState);
      
      // Call the method under test
      controller.completeRound();
      
      // Verify interactions
      expect(mockEngineFactory.getCurrentState).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(mockEngineFactory.nextStep).toHaveBeenCalledTimes(3); // Called until 'completed'
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once at end
      expect(onStateChange).toHaveBeenLastCalledWith(completedState);
    });
    
    it('should not call nextStep if already at completed step during completeRound', () => {
      // Setup the initial state to be already completed
      const completedState: SimulationState = {
        ...mockInitialState,
        purificationStep: 'completed'
      };
      
      mockEngineFactory.getCurrentState.mockReturnValue(completedState);
      
      // Call the method under test
      controller.completeRound();
      
      // Verify interactions - should not call nextStep
      expect(mockEngineFactory.getCurrentState).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(mockEngineFactory.nextStep).not.toHaveBeenCalled();
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(onStateChange).toHaveBeenLastCalledWith(completedState);
    });
    
    it('should not call nextStep if simulation is already complete during completeRound', () => {
      // Setup the initial state to be already complete
      const completeState: SimulationState = {
        ...mockInitialState,
        complete: true,
        purificationStep: 'initial'
      };
      
      mockEngineFactory.getCurrentState.mockReturnValue(completeState);
      
      // Call the method under test
      controller.completeRound();
      
      // Verify interactions - should not call nextStep
      expect(mockEngineFactory.getCurrentState).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(mockEngineFactory.nextStep).not.toHaveBeenCalled();
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(onStateChange).toHaveBeenLastCalledWith(completeState);
    });
    
    it('should execute a single full round step when step() is called', () => {
      const stepState: SimulationState = {
        ...mockInitialState,
        round: 1,
        purificationStep: 'initial'
      };
      
      mockEngineFactory.step.mockReturnValue(stepState);
      
      controller.step();
      
      expect(mockEngineFactory.step).toHaveBeenCalledTimes(1);
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(onStateChange).toHaveBeenLastCalledWith(stepState);
    });
    
    it('should reset the simulation state when reset() is called', () => {
      const resetState: SimulationState = {
        ...mockInitialState,
        pairs: [],
        round: 0
      };
      
      mockEngineFactory.reset.mockReturnValue(resetState);
      
      controller.reset();
      
      expect(mockEngineFactory.reset).toHaveBeenCalledTimes(1);
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(onStateChange).toHaveBeenLastCalledWith(resetState);
    });
    
    it('should update parameters and reset when updateParameters() is called', () => {
      const newParams: SimulationParameters = {
        initialPairs: 8,
        noiseParameter: 0.2,
        targetFidelity: 0.95
      };
      
      const updatedState: SimulationState = {
        ...mockInitialState,
        pairs: new Array(8)
      };
      
      mockEngineFactory.getCurrentState.mockReturnValue(updatedState);
      
      controller.updateParameters(newParams);
      
      expect(mockEngineFactory.updateParams).toHaveBeenCalledTimes(1);
      expect(mockEngineFactory.updateParams).toHaveBeenCalledWith(newParams);
      expect(mockEngineFactory.getCurrentState).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(onStateChange).toHaveBeenLastCalledWith(updatedState);
    });
  });
  
  describe('runUntilComplete()', () => {
    it('should run until complete when state becomes complete', () => {
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
      mockEngineFactory.getCurrentState.mockReturnValueOnce(initialState);
      
      // Step progression
      mockEngineFactory.step
        .mockReturnValueOnce(step1State)
        .mockReturnValueOnce(step2State)
        .mockReturnValueOnce(completeState);
      
      controller.runUntilComplete();
      
      expect(mockEngineFactory.getCurrentState).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(mockEngineFactory.step).toHaveBeenCalledTimes(3);
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once at end
      expect(onStateChange).toHaveBeenLastCalledWith(completeState);
    });
    
    it('should stop after maxRounds (100) even if not complete', () => {
      // Setup to never complete
      const notCompleteState: SimulationState = {
        ...mockInitialState,
        complete: false
      };
      
      mockEngineFactory.getCurrentState.mockReturnValue(notCompleteState);
      mockEngineFactory.step.mockReturnValue(notCompleteState);
      
      controller.runUntilComplete();
      
      expect(mockEngineFactory.getCurrentState).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(mockEngineFactory.step).toHaveBeenCalledTimes(100); // Should cap at 100 calls
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once at end
      expect(onStateChange).toHaveBeenLastCalledWith(notCompleteState);
    });
    
    it('should not run any steps if already complete', () => {
      // Setup the initial state to be already complete
      const completeState: SimulationState = {
        ...mockInitialState,
        complete: true
      };
      
      mockEngineFactory.getCurrentState.mockReturnValue(completeState);
      
      controller.runUntilComplete();
      
      expect(mockEngineFactory.getCurrentState).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(mockEngineFactory.step).not.toHaveBeenCalled();
      expect(onStateChange).toHaveBeenCalledTimes(2); // Once in constructor, once now
      expect(onStateChange).toHaveBeenLastCalledWith(completeState);
    });
  });
}); 