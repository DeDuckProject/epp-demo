import React from 'react';
import { createPortal } from 'react-dom';
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

  const portalContent = (
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

  // Use portal to render outside the normal component hierarchy
  return createPortal(
    portalContent,
    document.getElementById('portal-root') || document.body
  );
};

export default Popup;
