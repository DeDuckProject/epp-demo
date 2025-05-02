import React, { useState } from 'react';
import { QubitPair as QubitPairType } from '../engine/types';
import DensityMatrixView from './DensityMatrixView';
import { isWerner } from '../utils/matrixFormatting';
import './QubitPair.css';

interface QubitPairProps {
  pair: QubitPairType;
  location: 'alice' | 'bob';
  willBeDiscarded?: boolean;
  pairRole?: 'control' | 'target'; // New prop to indicate pair role
  partnerId?: number; // New prop to indicate which pair it's connected to
  purificationStep: string; // Add this to show connection at the right steps
  basis?: 'bell' | 'computational'; // Add basis prop
}

const QubitPair: React.FC<QubitPairProps> = ({ 
  pair, 
  location, 
  willBeDiscarded = false,
  pairRole,
  partnerId,
  purificationStep,
  basis = 'bell' // Default to bell basis
}) => {
  const [showMatrix, setShowMatrix] = useState(false);
  
  // Map fidelity to a more vibrant color gradient
  // TODO consider making use of css styles here instead
  const getFidelityColor = () => {
    if (willBeDiscarded) {
      return 'rgba(180, 180, 180, 0.5)'; // Grey color for pairs to be discarded
    }
    const hue = Math.floor(120 * pair.fidelity); // 0 is red, 120 is green
    return `hsla(${hue}, 80%, 60%, 0.8)`;
  };
  
  // Calculate an opacity/glow based on fidelity
  const getBorderGlow = () => {
    if (willBeDiscarded) {
      return 'none'; // No glow for pairs to be discarded
    }
    return `0 0 ${Math.floor(pair.fidelity * 15)}px rgba(46, 204, 113, ${pair.fidelity.toFixed(1)})`;
  };

  // Determine if this pair should show connection
  const showConnection = ['cnot', 'measured', 'completed'].includes(purificationStep) && pairRole;
  
  // Get class for role-based styling
  const getRoleClass = () => {
    if (!pairRole) return '';
    return pairRole === 'control' ? 'control-pair' : 'target-pair';
  };
  
  // Determine if the matrix is in Werner form (diagonal in Bell basis)
  // TODO add a tests for this
  const werner = isWerner(pair.densityMatrix, basis);
  
  return (
    <div 
      className={`qubit-pair ${location} ${willBeDiscarded ? 'will-be-discarded' : ''} ${showConnection ? getRoleClass() : ''}`}
      style={{ 
        boxShadow: getBorderGlow(),
        border: `3px solid ${getFidelityColor()}`
      }}
      onMouseEnter={() => setShowMatrix(true)}
      onMouseLeave={() => setShowMatrix(false)}
      data-pair-id={pair.id}
      data-partner-id={partnerId}
    >
      <div className="qubit-info">
        {/* <div className="qubit-id">Q{pair.id}</div> */}
        <div className="qubit-fidelity">{pair.fidelity.toFixed(3)}</div>
        {pairRole && showConnection && (
          <div className={`pair-role ${pairRole}`}/>
        )}
      </div>
      
      {showMatrix && (
        <div className="matrix-popup">
          <DensityMatrixView 
            matrix={pair.densityMatrix} 
            isWerner={werner} 
            basis={basis}
          />
        </div>
      )}
    </div>
  );
};

export default QubitPair; 