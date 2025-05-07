import React, { useEffect, useRef, useState } from 'react';
import { QubitPair as QubitPairType, Basis } from '../engine/types';
import QubitPair from './QubitPair';
import DensityMatrixView from './DensityMatrixView';
import './EnsembleDisplay.css';
import { DensityMatrix } from '../engine_real_calculations';
import Popup from './Popup';

interface EnsembleDisplayProps {
  pairs: QubitPairType[];
  pendingPairs?: {
    controlPairs: QubitPairType[];
    targetPairs: QubitPairType[];
    jointStates?: DensityMatrix[];
    results?: {
      control: QubitPairType;
      successful: boolean;
    }[];
  };
  purificationStep: string;
  viewBasis: Basis;
}

const EnsembleDisplay: React.FC<EnsembleDisplayProps> = ({ pairs, pendingPairs, purificationStep, viewBasis }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedJointState, setSelectedJointState] = useState<{
    jointState: DensityMatrix;
    controlId: number;
    targetId: number;
  } | null>(null);

  // Determine which pairs will be discarded in the measured step
  const willBeDiscarded = (pair: QubitPairType): boolean => {
    if (purificationStep !== 'measured' || !pendingPairs) {
      return false;
    }
    
    // Target pairs are always discarded regardless of results
    if (pendingPairs.targetPairs.some(p => p.id === pair.id)) {
      return true;
    }
    
    // For control pairs, we need measurement results
    if (!pendingPairs.results) {
      return false;
    }
    
    // Failed control pairs are discarded
    const matchingResult = pendingPairs.results.find(result => 
      result.control.id === pair.id
    );
    
    return matchingResult ? !matchingResult.successful : false;
  };
  
  // Determine if a pair is a control pair
  const isControlPair = (pair: QubitPairType): boolean => {
    return pendingPairs?.controlPairs.some(p => p.id === pair.id) || false;
  };
  
  // Determine if a pair is a target pair
  const isTargetPair = (pair: QubitPairType): boolean => {
    return pendingPairs?.targetPairs.some(p => p.id === pair.id) || false;
  };
  
  // Find partner ID for a pair
  const getPartnerId = (pair: QubitPairType): number | undefined => {
    if (!pendingPairs) return undefined;
    
    if (isControlPair(pair)) {
      const index = pendingPairs.controlPairs.findIndex(p => p.id === pair.id);
      return index >= 0 && index < pendingPairs.targetPairs.length 
        ? pendingPairs.targetPairs[index].id 
        : undefined;
    }
    
    if (isTargetPair(pair)) {
      const index = pendingPairs.targetPairs.findIndex(p => p.id === pair.id);
      return index >= 0 && index < pendingPairs.controlPairs.length 
        ? pendingPairs.controlPairs[index].id 
        : undefined;
    }
    
    return undefined;
  };

  // Draw connection lines between paired qubits
  useEffect(() => {
    // Always clear lines first
    if (svgRef.current) {
      while (svgRef.current.firstChild) {
        svgRef.current.removeChild(svgRef.current.firstChild);
      }
    }
    
    // Only draw new lines if in the right step
    if (!svgRef.current || !pendingPairs || !['cnot', 'measured'].includes(purificationStep)) {
      return;
    }
    
    // Draw new connection lines
    const container = document.querySelector('.ensemble-display');
    if (!container) return;
    
    pendingPairs.controlPairs.forEach((controlPair, index) => {
      if (index >= pendingPairs.targetPairs.length) return;
      
      const targetPair = pendingPairs.targetPairs[index];
      
      // Get elements for Alice's side
      const aliceControlElements = container.querySelectorAll(`.alice-row [data-pair-id="${controlPair.id}"]`);
      const aliceTargetElements = container.querySelectorAll(`.alice-row [data-pair-id="${targetPair.id}"]`);
      
      // Get elements for Bob's side
      const bobControlElements = container.querySelectorAll(`.bob-row [data-pair-id="${controlPair.id}"]`);
      const bobTargetElements = container.querySelectorAll(`.bob-row [data-pair-id="${targetPair.id}"]`);
      
      // Draw Alice's connections
      aliceControlElements.forEach(controlEl => {
        aliceTargetElements.forEach(targetEl => {
          drawConnection(controlEl, targetEl, controlPair, purificationStep, pendingPairs);
        });
      });
      
      // Draw Bob's connections
      bobControlElements.forEach(controlEl => {
        bobTargetElements.forEach(targetEl => {
          drawConnection(controlEl, targetEl, controlPair, purificationStep, pendingPairs);
        });
      });
    });
    
    // Helper function to draw a connection between two elements
    function drawConnection(controlEl: Element, targetEl: Element, controlPair: QubitPairType, 
                           step: string, pendingPairs: EnsembleDisplayProps['pendingPairs']) {
      if (controlEl instanceof HTMLElement && targetEl instanceof HTMLElement && container) {
        const controlRect = controlEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        const controlX = controlRect.left + controlRect.width/2 - containerRect.left;
        const controlY = controlRect.top + controlRect.height/2 - containerRect.top;
        const targetX = targetRect.left + targetRect.width/2 - containerRect.left;
        const targetY = targetRect.top + targetRect.height/2 - containerRect.top;
        
        // Create line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', controlX.toString());
        line.setAttribute('y1', controlY.toString());
        line.setAttribute('x2', targetX.toString());
        line.setAttribute('y2', targetY.toString());
        
        // Style the line according to purification status
        const isSuccessful = step === 'measured' && pendingPairs?.results?.find(
          r => r.control.id === controlPair.id
        )?.successful;
        
        if (step === 'cnot') {
          // CNOT gate representation
          line.setAttribute('class', 'pair-connection cnot-line');
          line.setAttribute('stroke', '#000000');
          line.setAttribute('stroke-width', '2');
          
          // Add control point (filled circle)
          const controlPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          controlPoint.setAttribute('cx', controlX.toString());
          controlPoint.setAttribute('cy', controlY.toString());
          controlPoint.setAttribute('r', '5');
          controlPoint.setAttribute('fill', '#000');
          
          // Add target point (⊕ symbol)
          const targetCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          targetCircle.setAttribute('cx', targetX.toString());
          targetCircle.setAttribute('cy', targetY.toString());
          targetCircle.setAttribute('r', '8');
          targetCircle.setAttribute('stroke', '#000');
          targetCircle.setAttribute('stroke-width', '2');
          targetCircle.setAttribute('fill', 'none');
          
          // Add horizontal line through target circle
          const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          horizontalLine.setAttribute('x1', (targetX - 8).toString());
          horizontalLine.setAttribute('y1', targetY.toString());
          horizontalLine.setAttribute('x2', (targetX + 8).toString());
          horizontalLine.setAttribute('y2', targetY.toString());
          horizontalLine.setAttribute('stroke', '#000');
          horizontalLine.setAttribute('stroke-width', '2');
          
          // Add vertical line through target circle
          const verticalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          verticalLine.setAttribute('x1', targetX.toString());
          verticalLine.setAttribute('y1', (targetY - 8).toString());
          verticalLine.setAttribute('x2', targetX.toString());
          verticalLine.setAttribute('y2', (targetY + 8).toString());
          verticalLine.setAttribute('stroke', '#000');
          verticalLine.setAttribute('stroke-width', '2');
          
          svgRef.current?.appendChild(line);
          svgRef.current?.appendChild(controlPoint);
          svgRef.current?.appendChild(targetCircle);
          svgRef.current?.appendChild(horizontalLine);
          svgRef.current?.appendChild(verticalLine);
        } else {
          // Normal connection lines for other steps
          line.setAttribute('class', `pair-connection ${isSuccessful ? 'successful' : ''}`);
          line.setAttribute('stroke', isSuccessful ? '#2ecc71' : '#e74c3c');
          line.setAttribute('stroke-width', '2');
          
          svgRef.current?.appendChild(line);
        }
      }
    }
  }, [pairs, pendingPairs, purificationStep]);
  
  // Determine if we should display a 4-qubit joint state when clicking on a pair
  const hasJointStates = purificationStep === 'cnot' && pendingPairs?.jointStates && pendingPairs.jointStates.length > 0;

  // Get a joint state for a specific pair during CNOT step
  const getJointStateForPair = (pairId: number) => {
    if (!hasJointStates) return null;

    // Find if this is a control pair
    const controlIndex = pendingPairs!.controlPairs.findIndex(p => p.id === pairId);
    if (controlIndex >= 0 && controlIndex < pendingPairs!.jointStates!.length) {
      return {
        jointState: pendingPairs!.jointStates![controlIndex],
        controlId: pairId,
        targetId: pendingPairs!.targetPairs[controlIndex].id
      };
    }

    // Find if this is a target pair
    const targetIndex = pendingPairs!.targetPairs.findIndex(p => p.id === pairId);
    if (targetIndex >= 0 && targetIndex < pendingPairs!.jointStates!.length) {
      return {
        jointState: pendingPairs!.jointStates![targetIndex],
        controlId: pendingPairs!.controlPairs[targetIndex].id,
        targetId: pairId
      };
    }

    return null;
  };

  // Handle click on a qubit pair to display joint state
  const handlePairClick = (pair: QubitPairType) => {
    if (hasJointStates) {
      const jointStateInfo = getJointStateForPair(pair.id);
      setSelectedJointState(jointStateInfo);
    } else {
      setSelectedJointState(null);
    }
  };

  // Close the joint state view
  const closeJointStateView = () => {
    setSelectedJointState(null);
  };

  return (
    <div className="ensemble-display">
      <div className="participant-section">
        <div className="participant-label alice-label">Alice</div>
        <div className="pair-row alice-row">
          {pairs.map(pair => (
            <div key={pair.id} onClick={() => handlePairClick(pair)}>
              <QubitPair 
                pair={pair} 
                location="alice" 
                willBeDiscarded={willBeDiscarded(pair)}
                pairRole={isControlPair(pair) ? 'control' : isTargetPair(pair) ? 'target' : undefined}
                partnerId={getPartnerId(pair)}
                purificationStep={purificationStep}
                viewBasis={viewBasis}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="qubit-pair-connections"></div>
      <div className="participant-section">
        <div className="participant-label bob-label">Bob</div>
        <div className="pair-row bob-row">
          {pairs.map(pair => (
            <div key={pair.id} onClick={() => handlePairClick(pair)}>
              <QubitPair 
                pair={pair} 
                location="bob" 
                willBeDiscarded={willBeDiscarded(pair)}
                pairRole={isControlPair(pair) ? 'control' : isTargetPair(pair) ? 'target' : undefined}
                partnerId={getPartnerId(pair)}
                purificationStep={purificationStep}
                viewBasis={viewBasis}
              />
            </div>
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
      
      {/* SVG for drawing pair connections */}
      <svg 
        ref={svgRef} 
        className="pair-connections-svg" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      ></svg>

      {/* Joint state popup using the new Popup component */}
      <Popup
        isOpen={selectedJointState !== null}
        onClose={closeJointStateView}
        title="4-Qubit Joint State"
        subtitle={selectedJointState ? `Between Control Pair ${selectedJointState.controlId} and Target Pair ${selectedJointState.targetId}` : ''}
      >
        {selectedJointState && (
          <DensityMatrixView 
            matrix={selectedJointState.jointState} 
            isWerner={false} 
            basis={viewBasis}
          />
        )}
      </Popup>
    </div>
  );
};

export default EnsembleDisplay; 