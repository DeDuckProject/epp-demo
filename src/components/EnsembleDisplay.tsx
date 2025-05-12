// Polyfill getTotalLength for test environments (jsdom)
// @ts-ignore - For testing purposes only
if (typeof SVGElement !== 'undefined' && typeof SVGElement.prototype.getTotalLength !== 'function') {
  // @ts-ignore - SVGElement may not have getTotalLength in TypeScript definitions but we need it for react-xarrows
  SVGElement.prototype.getTotalLength = () => 0;
}

import React, { useState } from 'react';
import Xarrow, { Xwrapper } from 'react-xarrows';
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

  const hasJointStates = purificationStep === 'cnot' && pendingPairs?.jointStates && pendingPairs.jointStates.length > 0;
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
  const closeJointStateView = () => {
    setSelectedJointState(null);
  };

  const xWrapperKey = `${purificationStep}-${pairs.map(p => p.id).join(',')}-${pendingPairs ? pendingPairs.controlPairs.map(p => p.id).join(',') : ''}-${pendingPairs ? pendingPairs.targetPairs.map(p => p.id).join(',') : ''}`;

  return (
    <Xwrapper key={xWrapperKey}>
      <div className="ensemble-display">
        <div className="participant-section">
          <div className="participant-label alice-label">Alice</div>
          <div className="pair-row alice-row">
            {pairs.map(pair => (
              <div key={pair.id} id={`alice-${pair.id}`} onClick={() => handlePairClick(pair)}>
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
        <svg className="pair-connections-svg"></svg>
        <div className="participant-section">
          <div className="participant-label bob-label">Bob</div>
          <div className="pair-row bob-row">
            {pairs.map(pair => (
              <div key={pair.id} id={`bob-${pair.id}`} onClick={() => handlePairClick(pair)}>
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
        {/* CNOT connections */}
        {pendingPairs && ['cnot','measured'].includes(purificationStep) && pendingPairs.controlPairs.map((control, idx) => {
          const target = pendingPairs.targetPairs[idx];
          // Skip if target is undefined 
          if (!target) return null;
          
          return (
            <React.Fragment key={`cnot-${control.id}`}>
              <Xarrow
                start={`alice-${control.id}`}
                end={`alice-${target.id}`}
                path="grid"
                lineColor="#000"
                strokeWidth={1}
                startAnchor="middle"
                endAnchor="middle"
                showHead={false}
                showTail={true}
                // tailShape="circle"
                tailSize={6}
                tailColor="#000"
                curveness={0.8}
                headSize={10}
                divContainerProps={{ className: "xarrow entanglement-line" }}
                labels={{ end: <span style={{fontWeight:'bold',fontSize:16, fontFamily: 'math', position: 'absolute', transform: 'translate(-50%, -75%)'}}>⊕</span>,
                  start: <span style={{fontWeight:'bold',fontSize:16, fontFamily: 'math', position: 'absolute', transform: 'translate(-50%, -25%)'}}>●</span>
                }}
              />
              <Xarrow
                start={`bob-${control.id}`}
                end={`bob-${target.id}`}
                path="grid"
                lineColor="#000"
                strokeWidth={1}
                startAnchor="middle"
                endAnchor="middle"
                showHead={false}
                showTail={true}
                // tailShape="circle"
                tailSize={6}
                tailColor="#000"
                curveness={0.8}
                headSize={10}
                divContainerProps={{ className: "xarrow entanglement-line" }}
                labels={{ end: <span style={{fontWeight:'bold',fontSize:16, fontFamily: 'math', position: 'absolute', transform: 'translate(-50%, -75%)'}}>⊕</span>,
                  start: <span style={{fontWeight:'bold',fontSize:16, fontFamily: 'math', position: 'absolute', transform: 'translate(-50%, -25%)'}}>●</span>
                }}
              />
            </React.Fragment>
          );
        })}
        {/* Entanglement lines */}
        {pairs.map(pair => (
          <Xarrow 
            key={`entangle-${pair.id}`} 
            start={`alice-${pair.id}`} 
            end={`bob-${pair.id}`} 
            path="straight" 
            lineColor={willBeDiscarded(pair) ? '#cccccc' : '#3B82F6'} 
            strokeWidth={2} 
            showHead={false}
            divContainerProps={{ 
              className: `xarrow entanglement-line${willBeDiscarded(pair) ? ' will-be-discarded' : ''}`
            }}
          />
        ))}
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
    </Xwrapper>
  );
};

export default EnsembleDisplay; 