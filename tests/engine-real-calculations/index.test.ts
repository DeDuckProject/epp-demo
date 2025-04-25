import { describe, test, expect } from 'vitest';
import { 
  DensityMatrix, 
  tensor, 
  applyPauli, 
  applyCNOT, 
  partialTrace,
  applyDepolarizing
} from '../../src/engine_real_calculations';

describe('Quantum Engine API', () => {
  test('tensor product of DensityMatrix', () => {
    // Create |0⟩ and |1⟩ states
    const zero = new DensityMatrix([
      [{ re: 1, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }]
    ]);
    
    const one = new DensityMatrix([
      [{ re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 1, im: 0 }]
    ]);
    
    // |0⟩⊗|1⟩ should be |01⟩
    const result = tensor(zero, one);
    expect(result.rows).toBe(4);
    
    // Check that only the |01⟩ element is 1, others are 0
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i === 1 && j === 1) {
          expect(result.get(i, j).re).toBeCloseTo(1);
        } else {
          expect(result.get(i, j).re).toBeCloseTo(0);
        }
      }
    }
  });
  
  test('applyPauli on single qubit', () => {
    // Create |0⟩ state
    const zero = new DensityMatrix([
      [{ re: 1, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }]
    ]);
    
    // Apply X to get |1⟩
    const flipped = applyPauli(zero, [0], ['X']);
    expect(flipped.get(0, 0).re).toBeCloseTo(0);
    expect(flipped.get(1, 1).re).toBeCloseTo(1);
    
    // Apply Z to |+⟩ to get |−⟩
    const plus = DensityMatrix.fromStateVector([
      { re: 1/Math.sqrt(2), im: 0 },
      { re: 1/Math.sqrt(2), im: 0 }
    ]);
    
    const result = applyPauli(plus, [0], ['Z']);
    
    // Diagonal elements unchanged
    expect(result.get(0, 0).re).toBeCloseTo(0.5);
    expect(result.get(1, 1).re).toBeCloseTo(0.5);
    
    // Off-diagonal elements should flip sign
    expect(result.get(0, 1).re).toBeCloseTo(-0.5);
    expect(result.get(1, 0).re).toBeCloseTo(-0.5);
  });
  
  test('applyCNOT between two qubits', () => {
    // Create |10⟩ state
    const state = tensor(
      new DensityMatrix([
        [{ re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 1, im: 0 }]
      ]),
      new DensityMatrix([
        [{ re: 1, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }]
      ])
    );
    
    // Apply CNOT with control=0, target=1
    // Should flip target qubit because control is in |1⟩, becoming |11⟩
    const result = applyCNOT(state, 0, 1);
    
    // Check result is |11⟩
    // In 4x4 matrix, index 3 corresponds to |11⟩
    expect(result.get(3, 3).re).toBeCloseTo(1);
    
    // Other elements should be zero
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i !== 3 || j !== 3) {
          expect(result.get(i, j).re).toBeCloseTo(0);
        }
      }
    }
  });

  test('applyCNOT between two qubits - 2', () => {
    // Create |00⟩ state
    const state = tensor(
        new DensityMatrix([
          [{ re: 1, im: 0 }, { re: 0, im: 0 }],
          [{ re: 0, im: 0 }, { re: 0, im: 0 }]
        ]),
        new DensityMatrix([
          [{ re: 1, im: 0 }, { re: 0, im: 0 }],
          [{ re: 0, im: 0 }, { re: 0, im: 0 }]
        ])
    );

    // Apply CNOT with control=0, target=1
    // Should flip target qubit because control is in |1⟩, becoming |11⟩
    const result = applyCNOT(state, 0, 1);

    // Check result is |00⟩
    // In 4x4 matrix, index 0 corresponds to |00⟩
    expect(result.get(0, 0).re).toBeCloseTo(1);

    // Other elements should be zero
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i !== 0 || j !== 0) {
          expect(result.get(i, j).re).toBeCloseTo(0);
        }
      }
    }
  });

  test('applyCNOT between two qubits - 3', () => {
    // Create |11⟩ state
    const state = tensor(
        new DensityMatrix([
          [{ re: 0, im: 0 }, { re: 0, im: 0 }],
          [{ re: 0, im: 0 }, { re: 1, im: 0 }]
        ]),
        new DensityMatrix([
          [{ re: 0, im: 0 }, { re: 0, im: 0 }],
          [{ re: 0, im: 0 }, { re: 1, im: 0 }]
        ])
    );

    // Apply CNOT with control=0, target=1
    // Should flip target qubit because control is in |1⟩, becoming |11⟩
    const result = applyCNOT(state, 0, 1);

    // Check result is |10⟩
    // In 4x4 matrix, index 2 corresponds to |10⟩
    expect(result.get(2, 2).re).toBeCloseTo(1);

    // Other elements should be zero
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i !== 2 || j !== 2) {
          expect(result.get(i, j).re).toBeCloseTo(0);
        }
      }
    }
  });
  
  test('create bell state using Hadamard and CNOT', () => {
    // Create |+0⟩ state
    const plus = DensityMatrix.fromStateVector([
      { re: 1/Math.sqrt(2), im: 0 },
      { re: 1/Math.sqrt(2), im: 0 }
    ]);
    const state = tensor(
        plus,
      new DensityMatrix([
        [{ re: 1, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }]
      ])
    );
    
    // Then apply CNOT with control=0, target=1
    const bell = applyCNOT(state, 0, 1);
    
    // Result should be Bell state (|00⟩ + |11⟩)/√2
    // Check diagonal and off-diagonal elements
    expect(bell.get(0, 0).re).toBeCloseTo(0.5);
    expect(bell.get(3, 3).re).toBeCloseTo(0.5);
    expect(bell.get(0, 3).re).toBeCloseTo(0.5);
    expect(bell.get(3, 0).re).toBeCloseTo(0.5);
  });
  
  test('integration of multiple operations', () => {
    // Start with Bell state
    const bell = DensityMatrix.bellPhiPlus();
    
    // Apply noise to the first qubit
    const noisy = applyDepolarizing(bell, 0, 0.5);
    
    // Trace out the second qubit
    const reduced = partialTrace(noisy, [1]);
    
    // Result should be a mixed state for the first qubit
    expect(reduced.rows).toBe(2);
    expect(reduced.trace().re).toBeCloseTo(1);
    
    // Apply X gate to the remaining qubit
    const flipped = applyPauli(reduced, [0], ['X']);
    
    // Diagonal elements should swap
    const p0 = reduced.get(0, 0).re;
    const p1 = reduced.get(1, 1).re;
    expect(flipped.get(0, 0).re).toBeCloseTo(p1);
    expect(flipped.get(1, 1).re).toBeCloseTo(p0);
  });
}); 