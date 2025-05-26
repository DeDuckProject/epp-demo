import React, { useEffect } from 'react';
import { InfoWindowProps } from './InfoWindow.d';
import './InfoWindow.css';

const InfoWindow: React.FC<InfoWindowProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-window-title"
      data-testid="info-window"
    >
      <div 
        className="modal-content info-window"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="info-window-title">Quantum Entanglement Purification</h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Close information window"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <section className="info-section">
            <h3>What is Entanglement Purification?</h3>
            <p>
              Entanglement purification is a protocol that improves the quality (or: fidelity) of noisy entangled quantum states (or: EPR pairs).
              When quantum systems, such as qubits, or EPR pairs, interact with their environment, they lose their perfect entanglement and become "noisy".
              Quantum communication, the process of transmitting quantum information between remote parties, can use "good" entangled pairs as a resource for faithfully sending qubits to long distances, when combines with quantum teleportation.
            </p>
            <p>
              This simulator implements the BBPSSW (Bennett-Brassard-Popescu-Schumacher-Smolin-Wootters) protocol, 
              which uses multiple noisy entangled pairs to create fewer, but higher-fidelity entangled pairs through 
              quantum operations, measurements and classical communication (between both side)s.
            </p>
            <p>
              The protocol works by:
            </p>
            <ul>
              <li>Starting with multiple noisy entangled pairs</li>
              <li>Applying quantum operations (twirling, CNOT gates)</li>
              <li>Performing measurements to test entanglement quality</li>
              <li>Keeping only the pairs that pass the test</li>
              <li>Repeating until target fidelity is achieved</li>
            </ul>
          </section>

          <section className="info-section">
            <h3>How to Use This Application</h3>
            
            <h4>Control Panel</h4>
            <ul>
              <li><strong>Next Step (N):</strong> Execute the next step in the purification protocol</li>
              <li><strong>Complete Round (C):</strong> Complete the current purification round</li>
              <li><strong>Run All (A):</strong> Run the simulation until completion or target fidelity is reached</li>
              <li><strong>Reset (R):</strong> Reset the simulation to initial conditions</li>
            </ul>

            <h4>Parameters</h4>
            <ul>
              <li><strong>Initial Pairs:</strong> Number of entangled pairs to start with</li>
              <li><strong>Target Fidelity:</strong> Desired fidelity level to achieve through purification</li>
              <li><strong>Noise Channel:</strong> Type of noise affecting the initial quantum states. The channel is applied on Bob's qubits, while Alice's qubits remain perfect</li>
              <li><strong>Noise Parameter:</strong> Amount of noise in the initial pairs (0 = perfect, 1 = maximal noise - depending on the noise channel)</li>
            </ul>

            <h4>Visualization</h4>
            <ul>
              <li><strong>Qubit Pairs:</strong> Each pair shows Alice's and Bob's qubits with their quantum states</li>
              <li><strong>Colors:</strong> For qubits: green indicates higher fidelity, red indicates low fidelity. For connections between qubits: green indicates successful operation, red indicates a failure (discarded pair)</li>
              <li><strong>Density Matrices:</strong> Hover (or touch) over qubits to see their quantum state representation. While in the CNOT step, clicking a pair will show the joint density matrix or the 4 qubit state (2 pairs)</li>
              <li><strong>CNOT Operations:</strong> Black connections show which pairs are being operated on</li>
            </ul>

            <h4>Simulation Engines</h4>
            <ul>
              <li><strong>Monte Carlo Engine:</strong> Performs randomized operations in computational basis for realistic simulation.</li>
              <li><strong>Average Engine:</strong> Calculates expected outcomes using Bell basis operations. No randomness is at play except for the initial channel application.</li>
            </ul>
          </section>

          <section className="info-section">
            <h3>Credits & References</h3>
            <p>
              This implementation is based on the entanglement purification protocol described in:
            </p>
            <p>
              <strong>Bennett, C. H., Brassard, G., Popescu, S., Schumacher, B., Smolin, J. A., & Wootters, W. K.</strong> (1996). 
              "Purification of noisy entanglement and faithful teleportation via noisy channels." 
              <em>Physical Review Letters</em>, 76(5), 722-725.
            </p>
            <p>
              We acknowledge and credit <a href="https://github.com/a-auer/qiskit" target="_blank" rel="noopener noreferrer">
              https://github.com/a-auer/qiskit</a> for explaining and implementing the protocol, 
              which served as a reference for our implementation. It also contains a much deeper explanation then this application provides.
            </p>
            <p>
              This simulator provides both theoretical (average) and realistic (Monte Carlo) approaches 
              to understanding quantum entanglement purification protocols.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default InfoWindow; 