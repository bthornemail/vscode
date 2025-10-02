import { ethers } from 'ethers';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

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

// ============================================================================
// Types & Interfaces
// ============================================================================

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

// ============================================================================
// Web3 Manager Class
// ============================================================================

export class Web3Manager {
  private provider?: ethers.BrowserProvider;
  private signer?: ethers.Signer;
  private peerConnection?: RTCPeerConnection;
  
  // Reactive state
  private identity$ = new BehaviorSubject<Web3Identity | null>(null);
  private connectionState$ = new BehaviorSubject<{
    wallet: boolean;
    webauthn: boolean;
    webrtc: boolean;
  }>({ wallet: false, webauthn: false, webrtc: false });
  private p2pSessions$ = new BehaviorSubject<P2PSession[]>([]);
  private bounties$ = new BehaviorSubject<DecentralizedBounty[]>([]);
  
  // Events
  private contractInteraction$ = new Subject<SmartContractInteraction>();
  private p2pMessage$ = new Subject<{ sessionId: string; data: any }>();
  private regenerativeUpdate$ = new Subject<{ type: string; data: any }>();

  constructor() {
    this.initializeWebRTC();
  }

  // ============================================================================
  // WebAuthn Integration
  // ============================================================================

  async authenticateWithWebAuthn(challenge?: string): Promise<{
    credentialId: string;
    signature: ArrayBuffer;
    publicKey: ArrayBuffer;
  }> {
    if (!navigator.credentials || !window.PublicKeyCredential) {
      throw new Error('WebAuthn not supported in this browser');
    }

    try {
      const challengeBuffer = challenge 
        ? new TextEncoder().encode(challenge)
        : crypto.getRandomValues(new Uint8Array(32));

      // Create credential options
      const createOptions: CredentialCreationOptions = {
        publicKey: {
          challenge: challengeBuffer,
          rp: {
            name: 'HyperDev IDE',
            id: window.location.hostname
          },
          user: {
            id: crypto.getRandomValues(new Uint8Array(64)),
            name: 'hyperdev-user',
            displayName: 'HyperDev User'
          },
          pubKeyCredParams: [
            {
              type: 'public-key',
              alg: -7 // ES256
            },
            {
              type: 'public-key', 
              alg: -257 // RS256
            }
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred'
          },
          timeout: 60000,
          attestation: 'direct'
        }
      };

      // Create new credential
      const credential = await navigator.credentials.create(createOptions) as PublicKeyCredential;
      
      if (!credential) {
        throw new Error('Failed to create WebAuthn credential');
      }

      const response = credential.response as AuthenticatorAttestationResponse;
      
      this.updateConnectionState('webauthn', true);
      
      return {
        credentialId: credential.id,
        signature: response.attestationObject,
        publicKey: response.getPublicKey()!
      };

    } catch (error) {
      console.error('WebAuthn authentication failed:', error);
      this.updateConnectionState('webauthn', false);
      throw error;
    }
  }

  async signWithWebAuthn(data: string, credentialId: string): Promise<ArrayBuffer> {
    if (!navigator.credentials) {
      throw new Error('WebAuthn not supported');
    }

    const challenge = new TextEncoder().encode(data);

    const getOptions: CredentialRequestOptions = {
      publicKey: {
        challenge,
        allowCredentials: [{
          type: 'public-key',
          id: new TextEncoder().encode(credentialId)
        }],
        userVerification: 'required',
        timeout: 60000
      }
    };

    const credential = await navigator.credentials.get(getOptions) as PublicKeyCredential;
    
    if (!credential) {
      throw new Error('Failed to get WebAuthn credential');
    }

    const response = credential.response as AuthenticatorAssertionResponse;
    return response.signature;
  }

  // ============================================================================
  // Ethereum/Ethers Integration
  // ============================================================================

  async connectWallet(): Promise<Web3Identity> {
    try {
      if (!window.ethereum) {
        throw new Error('No Ethereum wallet detected. Please install MetaMask or another Web3 wallet.');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      const address = await this.signer.getAddress();
      
      // Try to resolve ENS name
      let ensName: string | undefined;
      try {
        ensName = await this.provider.resolveName(address) || undefined;
      } catch (error) {
        console.log('No ENS name found for address');
      }

      // Load or create reputation data
      const reputation = await this.loadReputation(address);
      
      const identity: Web3Identity = {
        address,
        ensName,
        reputation,
        certifications: await this.loadCertifications(address),
        roles: await this.loadRoles(address)
      };

      this.identity$.next(identity);
      this.updateConnectionState('wallet', true);
      
      console.log('✅ Wallet connected:', address);
      return identity;

    } catch (error) {
      console.error('Wallet connection failed:', error);
      this.updateConnectionState('wallet', false);
      throw error;
    }
  }

  async signCommit(commitData: {
    hash: string;
    message: string;
    files: string[];
    regenerativeImpact?: number;
  }): Promise<{ signature: string; timestamp: number }> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    const timestamp = Date.now();
    const message = `HyperDev Commit Signature
    
Hash: ${commitData.hash}
Message: ${commitData.message}
Files: ${commitData.files.join(', ')}
Regenerative Impact: ${commitData.regenerativeImpact || 0}
Timestamp: ${timestamp}`;

    try {
      const signature = await this.signer.signMessage(message);
      
      // Store commit signature for verification
      await this.storeCommitSignature(commitData.hash, {
        signature,
        timestamp,
        signer: await this.signer.getAddress(),
        regenerativeImpact: commitData.regenerativeImpact || 0
      });

      return { signature, timestamp };
    } catch (error) {
      console.error('Commit signing failed:', error);
      throw error;
    }
  }

  async deployRegenerativeContract(
    contractData: {
      type: RegenerativeContract['type'];
      name: string;
      symbol: string;
      initialMetrics: any;
    }
  ): Promise<{ address: string; txHash: string }> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    // This would be the actual contract bytecode and ABI
    // For demo purposes, using a placeholder
    const contractFactory = new ethers.ContractFactory(
      [], // ABI would go here
      '0x', // Bytecode would go here
      this.signer
    );

    try {
      const contract = await contractFactory.deploy(
        contractData.name,
        contractData.symbol,
        contractData.initialMetrics
      );

      await contract.waitForDeployment();
      const address = await contract.getAddress();
      const txHash = contract.deploymentTransaction()?.hash || '';

      console.log(`✅ Regenerative contract deployed: ${address}`);
      
      // Emit interaction event
      this.contractInteraction$.next({
        contractAddress: address,
        functionName: 'constructor',
        parameters: [contractData.name, contractData.symbol, contractData.initialMetrics],
        gasEstimate: '0',
        regenerativeImpact: {
          type: contractData.type,
          estimatedValue: 0,
          verification: 'deployment'
        }
      });

      return { address, txHash };
    } catch (error) {
      console.error('Contract deployment failed:', error);
      throw error;
    }
  }

  async sendRegenerativePayment(
    recipient: string,
    amount: string,
    currency: 'ETH' | 'USDC' | 'RGN',
    impactData?: {
      type: string;
      metrics: any;
      verification: string;
    }
  ): Promise<{ txHash: string; impact?: any }> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      let tx;
      
      if (currency === 'ETH') {
        tx = await this.signer.sendTransaction({
          to: recipient,
          value: ethers.parseEther(amount)
        });
      } else {
        // For ERC-20 tokens, would need contract interaction
        throw new Error(`${currency} payments not implemented yet`);
      }

      const receipt = await tx.wait();
      
      console.log(`✅ Regenerative payment sent: ${amount} ${currency} to ${recipient}`);
      
      // Update reputation for regenerative activity
      if (impactData) {
        await this.updateRegenerativeReputation(impactData);
      }

      return { 
        txHash: receipt!.hash,
        impact: impactData
      };
    } catch (error) {
      console.error('Regenerative payment failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // WebRTC P2P Communication
  // ============================================================================

  private initializeWebRTC(): void {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      this.updateConnectionState('webrtc', state === 'connected');
      console.log('WebRTC connection state:', state);
    };

    this.peerConnection.ondatachannel = (event) => {
      const channel = event.channel;
      channel.onmessage = (messageEvent) => {
        this.handleP2PMessage(messageEvent.data);
      };
    };
  }

  async createP2PSession(
    type: P2PSession['type'],
    participantAddress: string
  ): Promise<P2PSession> {
    if (!this.peerConnection) {
      throw new Error('WebRTC not initialized');
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create data channel
    const dataChannel = this.peerConnection.createDataChannel(`hyperdev_${type}`, {
      ordered: true
    });

    dataChannel.onopen = () => {
      console.log('✅ P2P data channel opened');
    };

    dataChannel.onmessage = (event) => {
      this.p2pMessage$.next({
        sessionId,
        data: JSON.parse(event.data)
      });
    };

    // Create offer
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    const session: P2PSession = {
      id: sessionId,
      type,
      participants: [
        this.identity$.value!,
        { address: participantAddress } as Web3Identity
      ],
      dataChannel,
      status: 'connecting',
      metadata: {
        startTime: new Date(),
        dataTransferred: 0
      }
    };

    // Add to active sessions
    const sessions = this.p2pSessions$.value;
    this.p2pSessions$.next([...sessions, session]);

    return session;
  }

  async shareResource(
    sessionId: string,
    resource: {
      type: 'code' | 'knowledge_graph' | 'agent_model' | 'dataset';
      data: any;
      metadata: any;
    }
  ): Promise<void> {
    const session = this.p2pSessions$.value.find(s => s.id === sessionId);
    
    if (!session?.dataChannel || session.dataChannel.readyState !== 'open') {
      throw new Error('P2P session not available');
    }

    const message = {
      type: 'resource_share',
      timestamp: Date.now(),
      resource
    };

    session.dataChannel.send(JSON.stringify(message));
    session.metadata.dataTransferred += new Blob([JSON.stringify(message)]).size;
    
    console.log(`📤 Shared ${resource.type} via P2P`);
  }

  async requestResourceP2P(
    sessionId: string,
    request: {
      type: string;
      description: string;
      value?: number;
    }
  ): Promise<void> {
    const session = this.p2pSessions$.value.find(s => s.id === sessionId);
    
    if (!session?.dataChannel) {
      throw new Error('P2P session not available');
    }

    const message = {
      type: 'resource_request',
      timestamp: Date.now(),
      request
    };

    session.dataChannel.send(JSON.stringify(message));
    console.log('📥 Requested resource via P2P:', request.type);
  }

  private handleP2PMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'resource_share':
          console.log('📥 Received resource:', message.resource.type);
          // Handle incoming resource
          break;
        case 'resource_request':
          console.log('📨 Received resource request:', message.request.type);
          // Handle resource request
          break;
        case 'collaboration_update':
          console.log('🔄 Received collaboration update');
          // Handle real-time collaboration
          break;
      }
    } catch (error) {
      console.error('Failed to parse P2P message:', error);
    }
  }

  // ============================================================================
  // Bounty & Economic System
  // ============================================================================

  async createBounty(bountyData: Omit<DecentralizedBounty, 'id' | 'status' | 'applicants'>): Promise<DecentralizedBounty> {
    const bounty: DecentralizedBounty = {
      ...bountyData,
      id: `bounty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'open',
      applicants: []
    };

    // Store bounty (in real implementation, this would go to smart contract)
    const bounties = this.bounties$.value;
    this.bounties$.next([...bounties, bounty]);

    console.log('💰 Bounty created:', bounty.title);
    return bounty;
  }

  async applyForBounty(bountyId: string): Promise<void> {
    if (!this.identity$.value) {
      throw new Error('Identity not established');
    }

    const bounties = this.bounties$.value;
    const bountyIndex = bounties.findIndex(b => b.id === bountyId);
    
    if (bountyIndex === -1) {
      throw new Error('Bounty not found');
    }

    const bounty = bounties[bountyIndex];
    if (!bounty.applicants.includes(this.identity$.value.address)) {
      bounty.applicants.push(this.identity$.value.address);
      this.bounties$.next([...bounties]);
    }

    console.log('✋ Applied for bounty:', bounty.title);
  }

  async completeBounty(bountyId: string, deliverables: {
    codeHash: string;
    testResults: any;
    documentation: string;
    regenerativeImpact: number;
  }): Promise<{ txHash: string; reward: string }> {
    const bounty = this.bounties$.value.find(b => b.id === bountyId);
    
    if (!bounty) {
      throw new Error('Bounty not found');
    }

    // Verify deliverables meet requirements
    const meetsRequirements = this.validateBountyDeliverables(bounty, deliverables);
    
    if (!meetsRequirements) {
      throw new Error('Deliverables do not meet bounty requirements');
    }

    // Process payment (in real implementation, this would be a smart contract call)
    const payment = await this.sendRegenerativePayment(
      this.identity$.value!.address,
      bounty.amount,
      bounty.currency as any,
      {
        type: 'bounty_completion',
        metrics: deliverables,
        verification: 'code_review'
      }
    );

    // Update bounty status
    bounty.status = 'completed';
    bounty.winner = this.identity$.value!.address;

    console.log('🎉 Bounty completed and paid:', bounty.title);

    return {
      txHash: payment.txHash,
      reward: bounty.amount
    };
  }

  private validateBountyDeliverables(bounty: DecentralizedBounty, deliverables: any): boolean {
    // Simplified validation logic
    return deliverables.codeHash && 
           deliverables.testResults && 
           deliverables.documentation &&
           deliverables.regenerativeImpact >= 0;
  }

  // ============================================================================
  // Reputation & Impact Tracking
  // ============================================================================

  private async loadReputation(address: string): Promise<Web3Identity['reputation']> {
    // In real implementation, this would query on-chain data or IPFS
    return {
      score: 750,
      contributions: 23,
      regenerativeImpact: 156.7,
      trustScore: 8.5
    };
  }

  private async loadCertifications(address: string): Promise<string[]> {
    // Load certifications from decentralized storage
    return ['Regenerative Agriculture Verified', 'Carbon Neutral Developer', 'Open Source Contributor'];
  }

  private async loadRoles(address: string): Promise<Web3Identity['roles']> {
    // Determine roles based on on-chain activity and reputation
    return ['developer', 'validator'];
  }

  private async updateRegenerativeReputation(impactData: any): Promise<void> {
    const identity = this.identity$.value;
    if (!identity) return;

    // Update reputation based on regenerative impact
    identity.reputation.regenerativeImpact += impactData.metrics?.value || 0;
    identity.reputation.score += Math.floor((impactData.metrics?.value || 0) / 10);

    this.identity$.next(identity);
    
    this.regenerativeUpdate$.next({
      type: 'reputation_update',
      data: { address: identity.address, impact: impactData }
    });
  }

  private async storeCommitSignature(hash: string, signature: any): Promise<void> {
    // Store commit signature for future verification
    console.log('📝 Storing commit signature:', hash);
  }

  private updateConnectionState(service: keyof typeof this.connectionState$.value, connected: boolean): void {
    const current = this.connectionState$.value;
    this.connectionState$.next({ ...current, [service]: connected });
  }

  // ============================================================================
  // Observables & Getters
  // ============================================================================

  get identity(): Observable<Web3Identity | null> {
    return this.identity$.asObservable();
  }

  get connectionState(): Observable<{ wallet: boolean; webauthn: boolean; webrtc: boolean }> {
    return this.connectionState$.asObservable();
  }

  get p2pSessions(): Observable<P2PSession[]> {
    return this.p2pSessions$.asObservable();
  }

  get bounties(): Observable<DecentralizedBounty[]> {
    return this.bounties$.asObservable();
  }

  get contractInteractions(): Observable<SmartContractInteraction> {
    return this.contractInteraction$.asObservable();
  }

  get p2pMessages(): Observable<{ sessionId: string; data: any }> {
    return this.p2pMessage$.asObservable();
  }

  get regenerativeUpdates(): Observable<{ type: string; data: any }> {
    return this.regenerativeUpdate$.asObservable();
  }

  get currentIdentity(): Web3Identity | null {
    return this.identity$.value;
  }

  get isConnected(): boolean {
    const state = this.connectionState$.value;
    return state.wallet || state.webauthn;
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  async cleanup(): Promise<void> {
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    
    this.identity$.complete();
    this.connectionState$.complete();
    this.p2pSessions$.complete();
    this.bounties$.complete();
    this.contractInteraction$.complete();
    this.p2pMessage$.complete();
    this.regenerativeUpdate$.complete();
  }
}

// Global Web3 instance
export const web3Manager = new Web3Manager();

// Type declarations for global objects
declare global {
  interface Window {
    ethereum?: any;
  }
}
