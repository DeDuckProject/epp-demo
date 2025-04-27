import React from 'react';
import { DensityMatrix } from '../engine_real_calculations/matrix/densityMatrix';

interface DensityMatrixViewProps {
  matrix: DensityMatrix;
}

const DensityMatrixView: React.FC<DensityMatrixViewProps> = ({ matrix }) => {
  // Helper to format complex numbers
  const formatComplex = (c: { re: number, im: number }) => {
    if (Math.abs(c.re) < 0.001 && Math.abs(c.im) < 0.001) {
      return '0';
    }
    
    let result = '';
    
    if (Math.abs(c.re) >= 0.001) {
      result += c.re.toFixed(3);
    }
    
    if (Math.abs(c.im) >= 0.001) {
      if (c.im > 0 && result.length > 0) {
        result += '+';
      }
      result += `${c.im.toFixed(3)}i`;
    }
    
    return result || '0';
  };
  
  // Bell basis state labels
  const bellLabels = ['|Φ⁺⟩', '|Φ⁻⟩', '|Ψ⁺⟩', '|Ψ⁻⟩'];
  
  // Determine if off-diagonal elements are present using class methods
  let hasOffDiagonals = false;
  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.cols; j++) {
      if (i !== j) {
        const cell = matrix.get(i, j);
        if (Math.abs(cell.re) > 0.001 || Math.abs(cell.im) > 0.001) {
          hasOffDiagonals = true;
          break;
        }
      }
    }
    if (hasOffDiagonals) break;
  }
  
  return (
    <div className="density-matrix">
      <div className="matrix-title">
        Density Matrix (Bell Basis)
        {hasOffDiagonals && <span className="non-werner-indicator"> (Non-Werner)</span>}
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