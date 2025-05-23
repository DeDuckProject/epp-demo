import React from 'react';
import './Popup.css';
interface PopupProps {
    title: string;
    subtitle?: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}
declare const Popup: React.FC<PopupProps>;
export default Popup;
