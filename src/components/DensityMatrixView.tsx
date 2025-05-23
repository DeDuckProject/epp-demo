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

const DensityMatrixView: React.FC<DensityMatrixViewProps> = ({ 
  matrix, 
  basis = Basis.Bell,
  isWerner 
}) => {
  // Bell basis state labels
  const bellLabels = ['|Φ⁺⟩', '|Φ⁻⟩', '|Ψ⁺⟩', '|Ψ⁻⟩'];
  
  // Computational basis state labels
  const computationalLabels = (() => {
    const n = Math.log2(matrix.rows);
    if (!Number.isInteger(n)) {
      console.error('Matrix dimension is not a power of 2');
      return Array(matrix.rows).fill('|?⟩');
    }
    
    return Array.from({ length: matrix.rows }, (_, idx) => {
      // Convert index to binary string and pad with leading zeros
      const binaryStr = idx.toString(2).padStart(n, '0');
      return `|${binaryStr}⟩`;
    });
  })();
  
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