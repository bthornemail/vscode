import { ethers } from 'ethers';
import { BehaviorSubject, Subject } from 'rxjs';
// ============================================================================
// Web3 Manager Class
// ============================================================================
export class Web3Manager {
    constructor() {
        Object.defineProperty(this, "provider", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "signer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "peerConnection", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Reactive state
        Object.defineProperty(this, "identity$", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new BehaviorSubject(null)
        });
        Object.defineProperty(this, "connectionState$", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new BehaviorSubject({ wallet: false, webauthn: false, webrtc: false })
        });
        Object.defineProperty(this, "p2pSessions$", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new BehaviorSubject([])
        });
        Object.defineProperty(this, "bounties$", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new BehaviorSubject([])
        });
        // Events
        Object.defineProperty(this, "contractInteraction$", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Subject()
        });
        Object.defineProperty(this, "p2pMessage$", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Subject()
        });
        Object.defineProperty(this, "regenerativeUpdate$", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Subject()
        });
        this.initializeWebRTC();
    }
    // ============================================================================
    // WebAuthn Integration
    // ============================================================================
    async authenticateWithWebAuthn(challenge) {
        if (!navigator.credentials || !window.PublicKeyCredential) {
            throw new Error('WebAuthn not supported in this browser');
        }
        try {
            const challengeBuffer = challenge
                ? new TextEncoder().encode(challenge)
                : crypto.getRandomValues(new Uint8Array(32));
            // Create credential options
            const createOptions = {
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
            const credential = await navigator.credentials.create(createOptions);
            if (!credential) {
                throw new Error('Failed to create WebAuthn credential');
            }
            const response = credential.response;
            this.updateConnectionState('webauthn', true);
            return {
                credentialId: credential.id,
                signature: response.attestationObject,
                publicKey: response.getPublicKey()
            };
        }
        catch (error) {
            console.error('WebAuthn authentication failed:', error);
            this.updateConnectionState('webauthn', false);
            throw error;
        }
    }
    async signWithWebAuthn(data, credentialId) {
        if (!navigator.credentials) {
            throw new Error('WebAuthn not supported');
        }
        const challenge = new TextEncoder().encode(data);
        const getOptions = {
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
        const credential = await navigator.credentials.get(getOptions);
        if (!credential) {
            throw new Error('Failed to get WebAuthn credential');
        }
        const response = credential.response;
        return response.signature;
    }
    // ============================================================================
    // Ethereum/Ethers Integration
    // ============================================================================
    async connectWallet() {
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
            let ensName;
            try {
                ensName = await this.provider.resolveName(address) || undefined;
            }
            catch (error) {
                console.log('No ENS name found for address');
            }
            // Load or create reputation data
            const reputation = await this.loadReputation(address);
            const identity = {
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
        }
        catch (error) {
            console.error('Wallet connection failed:', error);
            this.updateConnectionState('wallet', false);
            throw error;
        }
    }
    async signCommit(commitData) {
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
        }
        catch (error) {
            console.error('Commit signing failed:', error);
            throw error;
        }
    }
    async deployRegenerativeContract(contractData) {
        if (!this.signer) {
            throw new Error('Wallet not connected');
        }
        // This would be the actual contract bytecode and ABI
        // For demo purposes, using a placeholder
        const contractFactory = new ethers.ContractFactory([], // ABI would go here
        '0x', // Bytecode would go here
        this.signer);
        try {
            const contract = await contractFactory.deploy(contractData.name, contractData.symbol, contractData.initialMetrics);
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
        }
        catch (error) {
            console.error('Contract deployment failed:', error);
            throw error;
        }
    }
    async sendRegenerativePayment(recipient, amount, currency, impactData) {
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
            }
            else {
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
                txHash: receipt.hash,
                impact: impactData
            };
        }
        catch (error) {
            console.error('Regenerative payment failed:', error);
            throw error;
        }
    }
    // ============================================================================
    // WebRTC P2P Communication
    // ============================================================================
    initializeWebRTC() {
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
    async createP2PSession(type, participantAddress) {
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
        const session = {
            id: sessionId,
            type,
            participants: [
                this.identity$.value,
                { address: participantAddress }
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
    async shareResource(sessionId, resource) {
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
    async requestResourceP2P(sessionId, request) {
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
    handleP2PMessage(data) {
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
        }
        catch (error) {
            console.error('Failed to parse P2P message:', error);
        }
    }
    // ============================================================================
    // Bounty & Economic System
    // ============================================================================
    async createBounty(bountyData) {
        const bounty = {
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
    async applyForBounty(bountyId) {
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
    async completeBounty(bountyId, deliverables) {
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
        const payment = await this.sendRegenerativePayment(this.identity$.value.address, bounty.amount, bounty.currency, {
            type: 'bounty_completion',
            metrics: deliverables,
            verification: 'code_review'
        });
        // Update bounty status
        bounty.status = 'completed';
        bounty.winner = this.identity$.value.address;
        console.log('🎉 Bounty completed and paid:', bounty.title);
        return {
            txHash: payment.txHash,
            reward: bounty.amount
        };
    }
    validateBountyDeliverables(bounty, deliverables) {
        // Simplified validation logic
        return deliverables.codeHash &&
            deliverables.testResults &&
            deliverables.documentation &&
            deliverables.regenerativeImpact >= 0;
    }
    // ============================================================================
    // Reputation & Impact Tracking
    // ============================================================================
    async loadReputation(address) {
        // In real implementation, this would query on-chain data or IPFS
        return {
            score: 750,
            contributions: 23,
            regenerativeImpact: 156.7,
            trustScore: 8.5
        };
    }
    async loadCertifications(address) {
        // Load certifications from decentralized storage
        return ['Regenerative Agriculture Verified', 'Carbon Neutral Developer', 'Open Source Contributor'];
    }
    async loadRoles(address) {
        // Determine roles based on on-chain activity and reputation
        return ['developer', 'validator'];
    }
    async updateRegenerativeReputation(impactData) {
        const identity = this.identity$.value;
        if (!identity)
            return;
        // Update reputation based on regenerative impact
        identity.reputation.regenerativeImpact += impactData.metrics?.value || 0;
        identity.reputation.score += Math.floor((impactData.metrics?.value || 0) / 10);
        this.identity$.next(identity);
        this.regenerativeUpdate$.next({
            type: 'reputation_update',
            data: { address: identity.address, impact: impactData }
        });
    }
    async storeCommitSignature(hash, signature) {
        // Store commit signature for future verification
        console.log('📝 Storing commit signature:', hash);
    }
    updateConnectionState(service, connected) {
        const current = this.connectionState$.value;
        this.connectionState$.next({ ...current, [service]: connected });
    }
    // ============================================================================
    // Observables & Getters
    // ============================================================================
    get identity() {
        return this.identity$.asObservable();
    }
    get connectionState() {
        return this.connectionState$.asObservable();
    }
    get p2pSessions() {
        return this.p2pSessions$.asObservable();
    }
    get bounties() {
        return this.bounties$.asObservable();
    }
    get contractInteractions() {
        return this.contractInteraction$.asObservable();
    }
    get p2pMessages() {
        return this.p2pMessage$.asObservable();
    }
    get regenerativeUpdates() {
        return this.regenerativeUpdate$.asObservable();
    }
    get currentIdentity() {
        return this.identity$.value;
    }
    get isConnected() {
        const state = this.connectionState$.value;
        return state.wallet || state.webauthn;
    }
    // ============================================================================
    // Cleanup
    // ============================================================================
    async cleanup() {
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
//# sourceMappingURL=Web3Manager.js.map