import React from 'react';
import { QubitPair as QubitPairType } from '../engine/types';
import QubitPair from './QubitPair';

interface EnsembleDisplayProps {
  pairs: QubitPairType[];
}

const EnsembleDisplay: React.FC<EnsembleDisplayProps> = ({ pairs }) => {
  return (
    <div className="ensemble-display">
      <div className="participant-section">
        <div className="participant-label alice-label">Alice</div>
        <div className="pair-row alice-row">
          {pairs.map(pair => (
            <QubitPair key={pair.id} pair={pair} location="alice" />
          ))}
        </div>
      </div>
      
      <div className="participant-section">
        <div className="participant-label bob-label">Bob</div>
        <div className="pair-row bob-row">
          {pairs.map(pair => (
            <QubitPair key={pair.id} pair={pair} location="bob" />
          ))}
        </div>
      </div>
      
      {/* Add entanglement lines */}
      <div className="pair-connections">
        {pairs.map((pair, index) => (
          <div 
            key={`line-${pair.id}`} 
            className="entanglement-line"
            style={{ 
              left: `${50 + index * 100}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default EnsembleDisplay; 