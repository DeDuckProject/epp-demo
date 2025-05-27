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
              The protocol works by (in high-level, more detail below):
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
            <h3>Protocol Steps Explained</h3>
            <p>
              The BBPSSW entanglement purification protocol consists of several distinct steps that are repeated in rounds until the target fidelity is achieved:
            </p>
            
            <h4>0. Initialization (before protocol starts)</h4>
            <p>
              Create noisy entangled pairs (EPR pairs) by starting with perfect Bell states and applying noise channels to Bob's qubits. 
              The noise degrades the entanglement quality, reducing the fidelity below 1. These noisy pairs serve as the raw material for purification.
            </p>

            <h4>1. Depolarization/Twirling</h4>
            <p>
              Convert the noisy quantum states into Werner form through depolarizing operations. The twirling operation 
              keeps the |Ψ⁻⟩ component of the state, balances the components of the other three Bell states, 
              and removes all off-diagonal elements. This creates a diagonal density matrix in the Bell basis 
              that's easier to analyze mathematically. <br />
              Note that this explanation describes the average case;
              In the monte-carlo simulation the twirling is randomized, and will not look as perfect.
            </p>

            <h4>2. Exchange Operation</h4>
            <p>
              Perform a basis transformation that exchanges the |Ψ⁻⟩ and |Φ⁺⟩ Bell state components. This step prepares the states 
              for the bilateral CNOT operations by ensuring the correct computational basis alignment between pairs that will interact.
            </p>

            <h4>3. Bilateral CNOT</h4>
            <p>
              Apply controlled-NOT gates between pairs of entangled pairs (4 qubits total). Alice performs CNOT operations between 
              her qubits from two different pairs, and Bob does the same with his qubits. This creates correlations between 
              the two pairs such that the measurement results on one pair will determine the fate of the other pair.
            </p>

            <h4>4. Measurement & Post-Selection</h4>
            <p>
              Measure the "target" pairs in the computational basis to determine if the purification succeeded. The success event 
              occurs when Alice and Bob both get the same result from measuring their target qubits. Based on the 
              measurement outcomes, the "control" pairs are either kept (if measurements indicate success) or discarded (in the case of failure). 
              This post-selection step is crucial - it trades quantity for quality.
            </p>

            <h4>5. Round Completion</h4>
            <p>
              Evaluate remaining pairs and their fidelities. If the target fidelity is achieved or too few pairs remain to continue, 
              the protocol terminates. Otherwise, the remaining pairs become the input for the next purification round, 
              and the process repeats from step 1. <br />
              Note that in the real world, we don't *really* know the state of the qubits, since measuring them will destroy the state;
              We can only estimate it based on our knowledge of the initial state, as well the success rate of the last round (which is correlated with the fidelity).
            </p>

            <div className="protocol-note">
              <strong>Key Insight:</strong> Each round sacrifices at least half the pairs to increase the fidelity of the 
              remaining pairs. The protocol succeeds when the gain in fidelity outweighs the loss in quantity.
            </div>

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

            <h4>Noise Channels</h4>
            <p>The simulation supports different types of quantum noise that can be applied to the initial EPR pairs:</p>
            <ul>
              <li><strong>Depolarizing:</strong> Randomly applies X, Y, or Z Pauli gates with equal probability</li>
              <li><strong>Dephasing:</strong> Applies phase-flip (Z) errors, destroying phase coherence</li>
              <li><strong>Amplitude Damping:</strong> Models energy loss from excited states (spontaneous emission)</li>
              <li><strong>Uniform Noise:</strong> Applies random unitary transformations from the Haar measure</li>
            </ul>
            <p>For all channels, the strength of the channel is controlled by the noise parameter.</p>
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