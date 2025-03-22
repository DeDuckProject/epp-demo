import React, { useState } from 'react';
import { QubitPair as QubitPairType } from '../engine/types';
import DensityMatrixView from './DensityMatrixView';

interface QubitPairProps {
  pair: QubitPairType;
  location: 'alice' | 'bob';
}

const QubitPair: React.FC<QubitPairProps> = ({ pair, location }) => {
  const [showMatrix, setShowMatrix] = useState(false);
  
  // Map fidelity to a more vibrant color gradient
  const getFidelityColor = () => {
    const hue = Math.floor(120 * pair.fidelity); // 0 is red, 120 is green
    return `hsla(${hue}, 80%, 60%, 0.8)`;
  };
  
  // Calculate an opacity/glow based on fidelity
  const getBorderGlow = () => {
    return `0 0 ${Math.floor(pair.fidelity * 15)}px rgba(46, 204, 113, ${pair.fidelity.toFixed(1)})`;
  };
  
  return (
    <div 
      className={`qubit-pair ${location}`}
      style={{ 
        boxShadow: getBorderGlow(),
        border: `3px solid ${getFidelityColor()}`
      }}
      onMouseEnter={() => setShowMatrix(true)}
      onMouseLeave={() => setShowMatrix(false)}
    >
      <div className="qubit-info">
        <div className="qubit-id">Q{pair.id}</div>
        <div className="qubit-fidelity">{pair.fidelity.toFixed(3)}</div>
      </div>
      
      {showMatrix && (
        <div className="matrix-popup">
          <DensityMatrixView matrix={pair.densityMatrix} />
        </div>
      )}
    </div>
  );
};

export default QubitPair; 