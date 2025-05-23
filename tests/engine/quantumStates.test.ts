import {createNoisyEPRWithChannel} from '../../src/engine/quantumStates';
import {fidelityFromBellBasisMatrix, BellState, fidelityFromComputationalBasisMatrix} from '../../src/engine_real_calculations/bell/bell-basis';
import { NoiseChannel } from '../../src/engine/types';

function expectFidelityRange(fidelity: number, min: number, max: number, message?: string) {
  expect(fidelity).toBeGreaterThanOrEqual(min);
  expect(fidelity).toBeLessThanOrEqual(max);
  if (message) {
    expect(fidelity >= min && fidelity <= max).toBe(true);
  }
}

describe('createNoisyEPRWithChannel', () => {
  const testParams = [0.1, 0.3, 0.5];
  
  test('should throw error for unknown noise channel', () => {
    expect(() => {
      createNoisyEPRWithChannel(0.3, 'unknown' as NoiseChannel);
    }).toThrow('Unknown noise channel: unknown');
  });

  describe('Amplitude Damping Channel', () => {
    testParams.forEach(param => {
      test(`should produce valid density matrix with parameter ${param}`, () => {
        const rho = createNoisyEPRWithChannel(param, NoiseChannel.AmplitudeDamping);
        
        // Check it's a valid density matrix (trace = 1, positive semidefinite)
        expect(rho.trace().re).toBeCloseTo(1, 5);
        
        // Calculate fidelity with respect to Psi-Minus
        const fidelity = fidelityFromComputationalBasisMatrix(rho, BellState.PSI_MINUS);
        expectFidelityRange(fidelity, 0, 1, `Fidelity should be between 0 and 1 for amplitude damping with param ${param}`);
        
        // Higher noise should generally decrease fidelity
        if (param > 0) {
          expect(fidelity).toBeLessThan(1);
        }
      });
    });
  });

  describe('Depolarizing Channel', () => {
    testParams.forEach(param => {
      test(`should produce valid density matrix with parameter ${param}`, () => {
        const rho = createNoisyEPRWithChannel(param, NoiseChannel.Depolarizing);
        
        expect(rho.trace().re).toBeCloseTo(1, 5);
        
        const fidelity = fidelityFromComputationalBasisMatrix(rho, BellState.PSI_MINUS);
        expectFidelityRange(fidelity, 0, 1, `Fidelity should be between 0 and 1 for depolarizing with param ${param}`);
        
        if (param > 0) {
          expect(fidelity).toBeLessThan(1);
        }
      });
    });
  });

  describe('Dephasing Channel', () => {
    testParams.forEach(param => {
      test(`should produce valid density matrix with parameter ${param}`, () => {
        const rho = createNoisyEPRWithChannel(param, NoiseChannel.Dephasing);
        
        expect(rho.trace().re).toBeCloseTo(1, 5);
        
        const fidelity = fidelityFromComputationalBasisMatrix(rho, BellState.PSI_MINUS);
        expectFidelityRange(fidelity, 0, 1, `Fidelity should be between 0 and 1 for dephasing with param ${param}`);
        
        if (param > 0) {
          expect(fidelity).toBeLessThan(1);
        }
      });
    });
  });

  describe('Uniform Noise Channel', () => {
    testParams.forEach(param => {
      test(`should produce valid density matrix with parameter ${param}`, () => {
        const rho = createNoisyEPRWithChannel(param, NoiseChannel.UniformNoise);
        
        expect(rho.trace().re).toBeCloseTo(1, 5);
        
        const fidelity = fidelityFromComputationalBasisMatrix(rho, BellState.PSI_MINUS);
        expectFidelityRange(fidelity, 0, 1, `Fidelity should be between 0 and 1 for uniform noise with param ${param}`);
        
        if (param > 0) {
          expect(fidelity).toBeLessThan(1);
        }
      });
    });
  });

  test('zero noise parameter should preserve Bell state for all channels', () => {
    const channels = [
      NoiseChannel.AmplitudeDamping,
      NoiseChannel.Depolarizing, 
      NoiseChannel.Dephasing,
      NoiseChannel.UniformNoise
    ];
    
    channels.forEach(channel => {
      const rho = createNoisyEPRWithChannel(0, channel);
      const fidelity = fidelityFromComputationalBasisMatrix(rho, BellState.PSI_MINUS);
      expect(fidelity).toBeCloseTo(1, 5); // Should be perfect for zero noise
    });
  });

  test('different noise channels should produce different results for same parameter', () => {
    const param = 0.3;
    const channels = [
      NoiseChannel.AmplitudeDamping,
      NoiseChannel.Depolarizing,
      NoiseChannel.Dephasing,
      NoiseChannel.UniformNoise
    ];
    
    const states = channels.map(channel => 
      createNoisyEPRWithChannel(param, channel)
    );
    
    // Check that at least some pairs produce different results
    // (allowing for possibility that some channels might produce similar results by coincidence)
    let foundDifference = false;
    for (let i = 0; i < states.length; i++) {
      for (let j = i + 1; j < states.length; j++) {
        // Compare a few matrix elements
        const diff1 = Math.abs(states[i].get(0, 0).re - states[j].get(0, 0).re);
        const diff2 = Math.abs(states[i].get(1, 1).re - states[j].get(1, 1).re);
        if (diff1 > 0.01 || diff2 > 0.01) {
          foundDifference = true;
          break;
        }
      }
      if (foundDifference) break;
    }
    
    expect(foundDifference).toBe(true); // At least some channels should produce different results
  });
}); 