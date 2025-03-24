import React from 'react';
import { DensityMatrix } from '../engine/types';

interface DensityMatrixViewProps {
  matrix: DensityMatrix;
}

const DensityMatrixView: React.FC<DensityMatrixViewProps> = ({ matrix }) => {
  // Helper to format complex numbers
  const formatComplex = (c: { real: number, imag: number }) => {
    if (Math.abs(c.real) < 0.001 && Math.abs(c.imag) < 0.001) {
      return '0';
    }
    
    let result = '';
    
    if (Math.abs(c.real) >= 0.001) {
      result += c.real.toFixed(3);
    }
    
    if (Math.abs(c.imag) >= 0.001) {
      if (c.imag > 0 && result.length > 0) {
        result += '+';
      }
      result += `${c.imag.toFixed(3)}i`;
    }
    
    return result || '0';
  };
  
  // Bell basis state labels
  const bellLabels = ['|Φ⁺⟩', '|Φ⁻⟩', '|Ψ⁺⟩', '|Ψ⁻⟩'];
  
  // Determine if off-diagonal elements are present (non-Werner state)
  const hasOffDiagonals = matrix.some((row, i) => 
    row.some((cell, j) => 
      i !== j && (Math.abs(cell.real) > 0.001 || Math.abs(cell.imag) > 0.001)
    )
  );
  
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
          {matrix.map((row, rowIdx) => (
            <tr key={rowIdx}>
              <th>{bellLabels[rowIdx]}</th>
              {row.map((cell, cellIdx) => (
                <td 
                  key={cellIdx}
                  className={rowIdx !== cellIdx ? 'off-diagonal' : 'diagonal'}
                >
                  {formatComplex(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DensityMatrixView; 