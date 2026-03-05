import React from 'react';
import type { Web3Manager, Web3Identity } from '../../services/Web3Manager';
import type { RegenerativeNetwork } from '../../frameworks/RegenerativeSupplyChain';
/**
 * P2P Collaboration Hub
 *
 * Enables real-time peer-to-peer collaboration using WebRTC for:
 * - Direct resource sharing (files, datasets, models)
 * - Real-time code collaboration and pair programming
 * - Knowledge graph synchronization
 * - Regenerative impact validation
 * - Decentralized bounty collaboration
 *
 * Features:
 * - Video/audio communication
 * - Screen sharing for code review
 * - File transfer with progress tracking
 * - Real-time document collaboration
 * - Agent sharing and coordination
 * - Economic microtransactions
 */
interface ResourceShare {
    id: string;
    type: 'code' | 'dataset' | 'model' | 'knowledge_graph' | 'document' | 'agent_output';
    name: string;
    size: number;
    mimeType: string;
    metadata: {
        description: string;
        tags: string[];
        regenerativeValue?: number;
        carbonFootprint?: number;
        version: string;
        checksum: string;
    };
    progress: number;
    status: 'uploading' | 'sharing' | 'downloading' | 'completed' | 'failed';
    timestamp: Date;
    sharedBy: string;
    economicValue?: {
        price: number;
        currency: string;
        bountyId?: string;
    };
}
interface CollaborationSession {
    id: string;
    type: 'code_review' | 'pair_programming' | 'knowledge_sharing' | 'bounty_work' | 'validation';
    participants: Web3Identity[];
    isHost: boolean;
    mediaState: {
        video: boolean;
        audio: boolean;
        screen: boolean;
    };
    p2pConnections: Map<string, RTCPeerConnection>;
    dataChannels: Map<string, RTCDataChannel>;
    mediaStreams: Map<string, MediaStream>;
    sharedResources: ResourceShare[];
    economicAgreements: EconomicAgreement[];
    regenerativeGoals: {
        carbonReduction: number;
        valueCreation: number;
        knowledgeSharing: number;
    };
}
interface EconomicAgreement {
    id: string;
    type: 'payment' | 'revenue_share' | 'bounty_split' | 'resource_trade';
    parties: string[];
    terms: {
        amount: number;
        currency: string;
        conditions: string[];
        deadline?: Date;
    };
    status: 'proposed' | 'agreed' | 'executed' | 'disputed';
    smartContractAddress?: string;
    regenerativeImpact: number;
}
interface Props {
    web3Manager: Web3Manager;
    regenerativeNetwork?: RegenerativeNetwork;
    currentIdentity?: Web3Identity;
    onSessionStart?: (session: CollaborationSession) => void;
    onSessionEnd?: (sessionId: string) => void;
    onResourceShared?: (resource: ResourceShare) => void;
    className?: string;
}
export declare const P2PCollaborationHub: React.FC<Props>;
export {};
//# sourceMappingURL=P2PCollaborationHub.d.ts.map