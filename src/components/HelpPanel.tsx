import React from 'react';
import './HelpPanel.css';

interface ShortcutInfo {
  key: string;
  description: string;
}

const HelpPanel: React.FC = () => {
  const keyboardShortcuts: ShortcutInfo[] = [
    { key: 'N', description: 'Execute next step in the simulation' },
    { key: 'C', description: 'Complete the current round' },
    { key: 'A', description: 'Run all steps until completion' },
    { key: 'R', description: 'Reset the simulation' },
    { key: 'P', description: 'Apply parameter changes' },
    { key: '?', description: 'Toggle this help panel' },
  ];

  const qubitInteractions: ShortcutInfo[] = [
    { key: 'Hover', description: 'Hover on a qubit to view its density matrix' },
    { key: 'Click', description: 'Click on a qubit during CNOT stage to view the full 16x16 density matrix' },
  ];

  return (
    <div className="help-panel">
      <h3>Keyboard Shortcuts</h3>
      <div className="shortcuts-section">
        {keyboardShortcuts.map((shortcut, index) => (
          <div key={index} className="shortcut-item">
            <span className="key-badge">{shortcut.key}</span>
            <span className="key-description">{shortcut.description}</span>
          </div>
        ))}
      </div>

      <h3>Qubit Interactions</h3>
      <div className="shortcuts-section">
        {qubitInteractions.map((interaction, index) => (
          <div key={index} className="shortcut-item">
            <span className="action-badge">{interaction.key}</span>
            <span className="key-description">{interaction.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpPanel; 