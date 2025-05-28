import React from 'react';
import Xarrow, { anchorType } from 'react-xarrows';
import { getFidelityColorRGB } from '../utils/fidelityColors';

interface EnhancedXarrowProps {
  start: string;
  end: string;
  fidelity: number;
  willBeDiscarded?: boolean;
  path?: 'straight' | 'grid' | 'smooth' | 'sine';
  strokeWidth?: number;
  showHead?: boolean;
  showTail?: boolean;
  curveness?: number;
  startAnchor?: anchorType;
  endAnchor?: anchorType;
  labels?: any;
  divContainerProps?: any;
  animated?: boolean;
  animationType?: 'flow' | 'pulse' | 'sine-wave';
  connectionType?: 'entanglement' | 'cnot' | 'measurement';
  measurementSuccess?: boolean;
}

const EnhancedXarrow: React.FC<EnhancedXarrowProps> = ({
  start,
  end,
  fidelity,
  willBeDiscarded = false,
  path = 'straight',
  strokeWidth = 3,
  showHead = false,
  showTail = false,
  curveness = 0.8,
  startAnchor = 'middle',
  endAnchor = 'middle',
  labels,
  divContainerProps = {},
  animated = true,
  animationType = 'flow',
  connectionType = 'entanglement',
  measurementSuccess
}) => {
  // Determine color based on connection type
  const getLineColor = () => {
    if (connectionType === 'cnot') {
      return 'black'; // Always black for CNOT operations
    }
    
    if (connectionType === 'measurement') {
      if (measurementSuccess === true) {
        return 'rgb(46, 204, 113)'; // Green for successful measurement
      } else if (measurementSuccess === false) {
        return 'rgb(231, 76, 60)'; // Red for failed measurement
      }
    }
    
    // Default: fidelity-based color for entanglement lines
    return willBeDiscarded ? 'rgb(180, 180, 180)' : getFidelityColorRGB(fidelity);
  };

  // Determine if animation should be disabled
  const shouldAnimate = () => {
    if (connectionType === 'cnot') {
      return false; // No animation for CNOT operations
    }
    return animated;
  };

  const lineColor = getLineColor();
  const isAnimated = shouldAnimate();

  const enhancedDivContainerProps = {
    ...divContainerProps,
    className: `${divContainerProps.className || ''} enhanced-xarrow ${isAnimated ? 'animated' : ''} ${animationType} ${connectionType}`,
    style: {
      ...divContainerProps.style,
      '--fidelity': fidelity,
      '--base-color': lineColor,
    }
  };

  return (
    <Xarrow
      start={start}
      end={end}
      path={path === 'sine' ? 'smooth' : path}
      lineColor={lineColor}
      strokeWidth={strokeWidth}
      showHead={showHead}
      showTail={showTail}
      curveness={curveness}
      startAnchor={startAnchor}
      endAnchor={endAnchor}
      labels={labels}
      divContainerProps={enhancedDivContainerProps}
    />
  );
};

export default EnhancedXarrow; 