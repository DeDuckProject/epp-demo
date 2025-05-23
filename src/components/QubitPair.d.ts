import React from 'react';
import { QubitPair as QubitPairType, Basis } from '../engine/types';
import './QubitPair.css';
interface QubitPairProps {
    pair: QubitPairType;
    location: 'alice' | 'bob';
    willBeDiscarded?: boolean;
    pairRole?: 'control' | 'target';
    partnerId?: number;
    purificationStep: string;
    viewBasis: Basis;
}
declare const QubitPair: React.FC<QubitPairProps>;
export default QubitPair;
