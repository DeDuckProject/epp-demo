import React from 'react';
import { QubitPair as QubitPairType } from '../engine/types';
import QubitPair from './QubitPair';

interface EnsembleDisplayProps {
  pairs: QubitPairType[];
  pendingPairs?: {
    controlPairs: QubitPairType[];
    targetPairs: QubitPairType[];
    results?: {
      control: QubitPairType;
      successful: boolean;
    }[];
  };
  purificationStep: string;
}

const EnsembleDisplay: React.FC<EnsembleDisplayProps> = ({ pairs, pendingPairs, purificationStep }) => {
  // Determine which pairs will be discarded in the measured step
  const willBeDiscarded = (pair: QubitPairType): boolean => {
    if (purificationStep !== 'measured' || !pendingPairs || !pendingPairs.results) {
      return false;
    }
    
    // Target pairs are always discarded
    if (pendingPairs.targetPairs.some(p => p.id === pair.id)) {
      return true;
    }
    
    // Failed control pairs are discarded
    const matchingResult = pendingPairs.results.find(result => 
      result.control.id === pair.id
    );
    
    return matchingResult ? !matchingResult.successful : false;
  };
  
  return (
    <div className="ensemble-display">
      <div className="participant-section">
        <div className="participant-label alice-label">Alice</div>
        <div className="pair-row alice-row">
          {pairs.map(pair => (
            <QubitPair 
              key={pair.id} 
              pair={pair} 
              location="alice" 
              willBeDiscarded={willBeDiscarded(pair)}
            />
          ))}
        </div>
      </div>
      <div className="qubit-pair-connections"></div>
      <div className="participant-section">
        <div className="participant-label bob-label">Bob</div>
        <div className="pair-row bob-row">
          {pairs.map(pair => (
            <QubitPair 
              key={pair.id} 
              pair={pair} 
              location="bob" 
              willBeDiscarded={willBeDiscarded(pair)}
            />
          ))}
        </div>
      </div>
      
      {/* Update entanglement lines */}
      <div className="pair-connections">
        {pairs.map((pair, index) => (
          <div 
            key={`line-${pair.id}`} 
            className={`entanglement-line ${willBeDiscarded(pair) ? 'will-be-discarded' : ''}`}
            style={{ 
              left: `${117 + index * 76}px`,  // 25px offset to center on qubit + 70px spacing (50px width + 20px gap)
              top: '75px', // Position between the two rows
              height: '30px' // Connect the vertical space between rows
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default EnsembleDisplay; 