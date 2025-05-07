import React from 'react';
import './Popup.css';

interface PopupProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ 
  title, 
  subtitle, 
  isOpen, 
  onClose, 
  children 
}) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay" data-testid="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h3>{title}</h3>
          {subtitle && <span className="popup-subtitle">{subtitle}</span>}
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="popup-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Popup;
