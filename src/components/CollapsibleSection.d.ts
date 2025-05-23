import React from 'react';
import './CollapsibleSection.css';
interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    className?: string;
}
declare const CollapsibleSection: React.FC<CollapsibleSectionProps>;
export default CollapsibleSection;
