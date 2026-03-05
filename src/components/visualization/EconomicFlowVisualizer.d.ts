import React from 'react';
import type { RegenerativeNetwork } from '../../frameworks/RegenerativeSupplyChain';
import type { Web3Manager } from '../../services/Web3Manager';
import { Vector } from '../../math/hyperbolic-arithmetic';
/**
 * Economic Flow Visualizer
 *
 * Visualizes smart contract dependencies and economic flows in regenerative networks.
 * Uses hyperbolic geometry to represent complex financial relationships and value flows.
 *
 * Features:
 * - Smart contract dependency mapping
 * - Token flow visualization
 * - Economic risk analysis
 * - Regenerative value tracking
 * - Real-time transaction monitoring
 */
interface EconomicNode {
    id: string;
    type: 'wallet' | 'contract' | 'token' | 'dao' | 'pool' | 'validator';
    name: string;
    address: string;
    balance: number;
    currency: string;
    regenerativeScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    connections: string[];
    embedding: Vector;
    metadata: {
        totalVolume: number;
        transactionCount: number;
        lastActivity: Date;
        apr?: number;
        tvl?: number;
        impactMetrics?: {
            carbonCredits: number;
            biodiversityTokens: number;
            soilHealthRewards: number;
        };
    };
}
interface EconomicFlow {
    id: string;
    from: string;
    to: string;
    amount: number;
    currency: string;
    type: 'payment' | 'reward' | 'stake' | 'yield' | 'penalty' | 'incentive';
    timestamp: Date;
    regenerativeImpact: number;
    confidence: number;
    status: 'pending' | 'confirmed' | 'failed';
    gasUsed?: number;
    carbonOffset?: number;
}
interface Props {
    regenerativeNetwork?: RegenerativeNetwork;
    web3Manager: Web3Manager;
    onNodeSelect?: (node: EconomicNode) => void;
    onFlowSelect?: (flow: EconomicFlow) => void;
    className?: string;
}
export declare const EconomicFlowVisualizer: React.FC<Props>;
export {};
//# sourceMappingURL=EconomicFlowVisualizer.d.ts.map