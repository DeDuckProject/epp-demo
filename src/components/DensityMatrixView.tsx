import React from 'react';
import { DensityMatrix } from '../engine_real_calculations';
import { formatComplex } from '../utils/matrixFormatting';
import { getDiagonalColor, getOffDiagonalColor, calculateComplexAbsValue } from '../utils/colorUtils';
import './DensityMatrixView.css';
import { Basis } from '../engine/types';

interface DensityMatrixViewProps {
  /** The raw density matrix to render */
  matrix: DensityMatrix;
  /** Which basis to label: 'bell' (default) or 'computational' */
  basis?: Basis;
  /** True if this is a Werner state (i.e. no significant off-diagonals) */
  isWerner: boolean;
}

/**
 * Generates Bell state labels for n-qubit systems using tensor product notation
 * @param numQubits Number of qubits (derived from matrix dimension)
 * @returns Array of Bell state labels
 */
const generateBellLabels = (numQubits: number): string[] => {
  if (numQubits === 1) {
    // Single qubit Bell-like states (not standard, but for completeness)
    return ['|+⟩', '|-⟩'];
  }
  
  if (numQubits === 2) {
    // Standard 2-qubit Bell states
    return ['|Φ⁺⟩', '|Φ⁻⟩', '|Ψ⁺⟩', '|Ψ⁻⟩'];
  }
  
  // For multi-qubit systems, use tensor product notation
  const baseBellStates = ['Φ⁺', 'Φ⁻', 'Ψ⁺', 'Ψ⁻'];
  const numPairs = numQubits / 2;
  
  if (!Number.isInteger(numPairs)) {
    // Odd number of qubits - use simplified notation
    return Array.from({ length: 2 ** numQubits }, (_, idx) => `|B${idx}⟩`);
  }
  
  // Generate all combinations for pairs of qubits
  const labels: string[] = [];
  const totalStates = 2 ** numQubits;
  
  for (let i = 0; i < totalStates; i++) {
    const stateComponents: string[] = [];
    let remaining = i;
    
    for (let pair = 0; pair < numPairs; pair++) {
      const stateIndex = remaining % 4;
      stateComponents.unshift(baseBellStates[stateIndex]);
      remaining = Math.floor(remaining / 4);
    }
    
    labels.push(`|${stateComponents.join('')}⟩`);
  }
  
  return labels;
};

const DensityMatrixView: React.FC<DensityMatrixViewProps> = ({ 
  matrix, 
  basis = Basis.Bell,
  isWerner 
}) => {
  // Calculate number of qubits from matrix dimension
  const n = Math.log2(matrix.rows);
  if (!Number.isInteger(n)) {
    console.error('Matrix dimension is not a power of 2');
    return <div>Error: Invalid matrix dimension</div>;
  }
  
  // Generate Bell basis state labels dynamically
  const bellLabels = generateBellLabels(n);
  
  // Computational basis state labels
  const computationalLabels = Array.from({ length: matrix.rows }, (_, idx) => {
    // Convert index to binary string and pad with leading zeros
    const binaryStr = idx.toString(2).padStart(n, '0');
    return `|${binaryStr}⟩`;
  });
  
  // Select the labels based on the basis prop
  const labels = basis === Basis.Computational ? computationalLabels : bellLabels;
  
  // Title based on the basis
  const title = `Density Matrix (${basis === Basis.Computational ? 'Computational' : 'Bell'} Basis)`;
  
  return (
    <div className="density-matrix">
      <div className="matrix-title">
        {title}
        {isWerner && <span className="werner-indicator"> (Werner)</span>}
        {!isWerner && <span className="non-werner-indicator"> (Non-Werner)</span>}
      </div>
      <table>
        <thead>
          <tr>
            <th></th>
            {labels.map(label => <th key={label}>{label}</th>)}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: matrix.rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              <th>{labels[rowIdx]}</th>
              {Array.from({ length: matrix.cols }).map((_, cellIdx) => {
                const cell = matrix.get(rowIdx, cellIdx);
                const absValue = calculateComplexAbsValue(cell.re, cell.im);
                const isDiagonal = rowIdx === cellIdx;
                const backgroundColor = isDiagonal 
                  ? getDiagonalColor(absValue)
                  : getOffDiagonalColor(absValue);
                
                return (
                  <td 
                    key={cellIdx}
                    className={isDiagonal ? 'diagonal' : 'off-diagonal'}
                    style={{ backgroundColor }}
                  >
                    {formatComplex(cell)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DensityMatrixView; 