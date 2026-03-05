import { Observable } from 'rxjs';
/**
 * Web3 Manager for HyperDev IDE
 *
 * Integrates Web3 technologies for decentralized identity, payments, and collaboration:
 * - WebAuthn: Secure biometric/hardware authentication
 * - Ethers.js: Ethereum wallet and contract interactions
 * - WebRTC: P2P data transfer and real-time collaboration
 *
 * Enables regenerative economy features and decentralized governance
 */
export interface Web3Identity {
    address: string;
    ensName?: string;
    webAuthnCredential?: {
        id: string;
        publicKey: ArrayBuffer;
        algorithm: string;
    };
    reputation: {
        score: number;
        contributions: number;
        regenerativeImpact: number;
        trustScore: number;
    };
    certifications: string[];
    roles: ('developer' | 'auditor' | 'validator' | 'producer' | 'consumer')[];
}
export interface RegenerativeContract {
    address: string;
    type: 'carbon_credit' | 'biodiversity_token' | 'water_rights' | 'soil_health' | 'renewable_energy';
    name: string;
    symbol: string;
    totalSupply: string;
    verificationMethod: string;
    impactMetrics: {
        baselineValue: number;
        currentValue: number;
        improvementRate: number;
        lastVerified: Date;
    };
}
export interface P2PSession {
    id: string;
    type: 'code_collaboration' | 'knowledge_sharing' | 'resource_exchange' | 'mentoring';
    participants: Web3Identity[];
    dataChannel?: RTCDataChannel;
    mediaStream?: MediaStream;
    status: 'connecting' | 'connected' | 'disconnected';
    metadata: {
        startTime: Date;
        endTime?: Date;
        dataTransferred: number;
        economicValue?: number;
    };
}
export interface SmartContractInteraction {
    contractAddress: string;
    functionName: string;
    parameters: any[];
    gasEstimate: string;
    valueSent?: string;
    regenerativeImpact?: {
        type: string;
        estimatedValue: number;
        verification: string;
    };
}
export interface DecentralizedBounty {
    id: string;
    title: string;
    description: string;
    creator: string;
    amount: string;
    currency: 'ETH' | 'USDC' | 'RGN' | string;
    deadline: Date;
    requirements: {
        codeQuality: number;
        testCoverage: number;
        documentation: boolean;
        regenerativeAlignment: boolean;
    };
    status: 'open' | 'in_progress' | 'completed' | 'cancelled';
    applicants: string[];
    winner?: string;
}
export declare class Web3Manager {
    private provider?;
    private signer?;
    private peerConnection?;
    private identity$;
    private connectionState$;
    private p2pSessions$;
    private bounties$;
    private contractInteraction$;
    private p2pMessage$;
    private regenerativeUpdate$;
    constructor();
    authenticateWithWebAuthn(challenge?: string): Promise<{
        credentialId: string;
        signature: ArrayBuffer;
        publicKey: ArrayBuffer;
    }>;
    signWithWebAuthn(data: string, credentialId: string): Promise<ArrayBuffer>;
    connectWallet(): Promise<Web3Identity>;
    signCommit(commitData: {
        hash: string;
        message: string;
        files: string[];
        regenerativeImpact?: number;
    }): Promise<{
        signature: string;
        timestamp: number;
    }>;
    deployRegenerativeContract(contractData: {
        type: RegenerativeContract['type'];
        name: string;
        symbol: string;
        initialMetrics: any;
    }): Promise<{
        address: string;
        txHash: string;
    }>;
    sendRegenerativePayment(recipient: string, amount: string, currency: 'ETH' | 'USDC' | 'RGN', impactData?: {
        type: string;
        metrics: any;
        verification: string;
    }): Promise<{
        txHash: string;
        impact?: any;
    }>;
    private initializeWebRTC;
    createP2PSession(type: P2PSession['type'], participantAddress: string): Promise<P2PSession>;
    shareResource(sessionId: string, resource: {
        type: 'code' | 'knowledge_graph' | 'agent_model' | 'dataset';
        data: any;
        metadata: any;
    }): Promise<void>;
    requestResourceP2P(sessionId: string, request: {
        type: string;
        description: string;
        value?: number;
    }): Promise<void>;
    private handleP2PMessage;
    createBounty(bountyData: Omit<DecentralizedBounty, 'id' | 'status' | 'applicants'>): Promise<DecentralizedBounty>;
    applyForBounty(bountyId: string): Promise<void>;
    completeBounty(bountyId: string, deliverables: {
        codeHash: string;
        testResults: any;
        documentation: string;
        regenerativeImpact: number;
    }): Promise<{
        txHash: string;
        reward: string;
    }>;
    private validateBountyDeliverables;
    private loadReputation;
    private loadCertifications;
    private loadRoles;
    private updateRegenerativeReputation;
    private storeCommitSignature;
    private updateConnectionState;
    get identity(): Observable<Web3Identity | null>;
    get connectionState(): Observable<{
        wallet: boolean;
        webauthn: boolean;
        webrtc: boolean;
    }>;
    get p2pSessions(): Observable<P2PSession[]>;
    get bounties(): Observable<DecentralizedBounty[]>;
    get contractInteractions(): Observable<SmartContractInteraction>;
    get p2pMessages(): Observable<{
        sessionId: string;
        data: any;
    }>;
    get regenerativeUpdates(): Observable<{
        type: string;
        data: any;
    }>;
    get currentIdentity(): Web3Identity | null;
    get isConnected(): boolean;
    cleanup(): Promise<void>;
}
export declare const web3Manager: Web3Manager;
declare global {
    interface Window {
        ethereum?: any;
    }
}
//# sourceMappingURL=Web3Manager.d.ts.map