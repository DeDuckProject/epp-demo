import React from 'react';
import { DensityMatrix } from '../engine_real_calculations/matrix/densityMatrix';
import { formatComplex, hasOffDiagonalElements } from '../utils/matrixFormatting';
import './DensityMatrixView.css';

interface DensityMatrixViewProps {
  matrix: DensityMatrix;
}

const DensityMatrixView: React.FC<DensityMatrixViewProps> = ({ matrix }) => {
  // Bell basis state labels
  const bellLabels = ['|Φ⁺⟩', '|Φ⁻⟩', '|Ψ⁺⟩', '|Ψ⁻⟩'];
  
  // Determine if off-diagonal elements are present
  const hasOffDiagonals = hasOffDiagonalElements(matrix);
  
  return (
    <div className="density-matrix">
      <div className="matrix-title">
        Density Matrix (Bell Basis)
        {hasOffDiagonals && <span className="non-werner-indicator"> (Non-Werner)</span>}
        {!hasOffDiagonals && <span className="werner-indicator"> (Werner)</span>}
      </div>
      <table>
        <thead>
          <tr>
            <th></th>
            {bellLabels.map(label => <th key={label}>{label}</th>)}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: matrix.rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              <th>{bellLabels[rowIdx]}</th>
              {Array.from({ length: matrix.cols }).map((_, cellIdx) => {
                const cell = matrix.get(rowIdx, cellIdx);
                return (
                  <td 
                    key={cellIdx}
                    className={rowIdx !== cellIdx ? 'off-diagonal' : 'diagonal'}
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