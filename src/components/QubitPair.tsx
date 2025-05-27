import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { QubitPair as QubitPairType, Basis } from '../engine/types';
import DensityMatrixView from './DensityMatrixView';
import { isWerner } from '../utils/matrixFormatting';
import { toBellBasis, toComputationalBasis } from '../engine_real_calculations/bell/bell-basis';
import { DensityMatrix } from '../engine_real_calculations';
import './QubitPair.css';

interface QubitPairProps {
  pair: QubitPairType;
  location: 'alice' | 'bob';
  willBeDiscarded?: boolean;
  pairRole?: 'control' | 'target'; // New prop to indicate pair role
  partnerId?: number; // New prop to indicate which pair it's connected to
  purificationStep: string; // Add this to show connection at the right steps
  viewBasis: Basis; // Add viewBasis prop to control basis display
}

const QubitPair: React.FC<QubitPairProps> = ({ 
  pair, 
  location, 
  willBeDiscarded = false,
  pairRole,
  partnerId,
  purificationStep,
  viewBasis
}) => {
  const [showMatrix, setShowMatrix] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const qubitRef = useRef<HTMLDivElement>(null);
  
  // Check if we're in mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Calculate popup position for desktop
  useEffect(() => {
    if (!isMobile && showMatrix && qubitRef.current) {
      const updatePosition = () => {
        const rect = qubitRef.current!.getBoundingClientRect();
        setPopupPosition({
          top: rect.bottom + 20, // 20px below the qubit
          left: rect.left + rect.width / 2 // Centered horizontally
        });
      };
      
      updatePosition();
      
      // Update position on scroll or resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showMatrix, isMobile]);
  
  // Create portal container for both mobile and desktop popups
  useEffect(() => {
    if (showMatrix) {
      // Create portal container if it doesn't exist
      let container = document.getElementById('matrix-popup-portal') as HTMLDivElement;
      if (!container) {
        container = document.createElement('div');
        container.id = 'matrix-popup-portal';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.zIndex = '2000';
        document.body.appendChild(container);
      }
      
      // Configure container based on mobile/desktop
      if (isMobile) {
        container.style.pointerEvents = 'auto';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      } else {
        container.style.pointerEvents = 'none';
        container.style.display = 'block';
        container.style.backgroundColor = 'transparent';
      }
      
      // Handle click outside for mobile
      const handleClickOutside = (e: MouseEvent) => {
        if (isMobile && e.target === container) {
          setShowMatrix(false);
        }
      };
      
      container.addEventListener('click', handleClickOutside);
      setPortalContainer(container);
      
      // Cleanup function
      return () => {
        container.removeEventListener('click', handleClickOutside);
        if (document.getElementById('matrix-popup-portal') === container) {
          document.body.removeChild(container);
        }
      };
    } else {
      // Clean up when not showing
      setPortalContainer(null);
    }
  }, [showMatrix, isMobile]);
  
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
  const werner = isWerner(pair.densityMatrix, pair.basis);
  
  // Transform the matrix if needed based on the viewBasis
  const displayMatrix = pair.basis === viewBasis
    ? pair.densityMatrix
    : viewBasis === Basis.Bell
      ? new DensityMatrix(toBellBasis(pair.densityMatrix))
      : new DensityMatrix(toComputationalBasis(pair.densityMatrix));
  
  // Desktop portal popup content
  const DesktopPopupContent = () => (
    <div 
      className="matrix-popup"
      style={{
        position: 'fixed',
        top: `${popupPosition.top}px`,
        left: `${popupPosition.left}px`,
        transform: 'translateX(-50%)',
        pointerEvents: 'auto'
      }}
      onMouseEnter={() => setShowMatrix(true)}
      onMouseLeave={() => setShowMatrix(false)}
    >
      <DensityMatrixView 
        matrix={displayMatrix} 
        isWerner={werner} 
        basis={viewBasis}
      />
    </div>
  );
  
  // Mobile portal popup content
  const MobilePopupContent = () => (
    <div 
      style={{
        position: 'relative',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        width: '90vw',
        maxWidth: '500px',  // Add max-width to prevent too wide on tablets
        maxHeight: '90vh',
        overflowY: 'auto',
        overflowX: 'hidden'  // Prevent horizontal scroll on the popup itself
      }}
      onClick={e => e.stopPropagation()}
    >
      <DensityMatrixView 
        matrix={displayMatrix} 
        isWerner={werner} 
        basis={viewBasis}
      />
    </div>
  );
  
  return (
    <div 
      ref={qubitRef}
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
      
      {/* Render popup in portal for both mobile and desktop */}
      {portalContainer && showMatrix && (
        isMobile 
          ? createPortal(<MobilePopupContent />, portalContainer)
          : createPortal(<DesktopPopupContent />, portalContainer)
      )}
    </div>
  );
};

export default QubitPair; 