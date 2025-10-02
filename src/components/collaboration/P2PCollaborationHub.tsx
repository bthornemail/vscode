import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Share, 
  Download, 
  Upload, 
  Users, 
  MessageCircle,
  FileText,
  Code,
  Database,
  Cpu,
  Zap,
  Shield,
  Globe,
  ChevronDown,
  ChevronUp,
  X,
  Play,
  Pause,
  Square,
  Monitor
} from 'lucide-react';

import type { Web3Manager, P2PSession, Web3Identity } from '../../services/Web3Manager';
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

export const P2PCollaborationHub: React.FC<Props> = ({
  web3Manager,
  regenerativeNetwork,
  currentIdentity,
  onSessionStart,
  onSessionEnd,
  onResourceShared,
  className = ''
}) => {
  // State
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [availablePeers, setAvailablePeers] = useState<Web3Identity[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sharedResources, setSharedResources] = useState<ResourceShare[]>([]);
  const [economicAgreements, setEconomicAgreements] = useState<EconomicAgreement[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  // WebRTC Configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      // In production, would include TURN servers for NAT traversal
    ]
  };

  useEffect(() => {
    // Initialize P2P discovery
    discoverPeers();
    
    // Subscribe to Web3 P2P events
    const p2pSub = web3Manager.p2pMessages.subscribe(
      (message) => handleP2PMessage(message)
    );

    const sessionSub = web3Manager.p2pSessions.subscribe(
      (sessions) => handleSessionUpdate(sessions)
    );

    return () => {
      p2pSub.unsubscribe();
      sessionSub.unsubscribe();
      cleanup();
    };
  }, []);

  // Discover available peers for collaboration
  const discoverPeers = async () => {
    try {
      // In a real implementation, this would:
      // 1. Query the regenerative network for active nodes
      // 2. Check peer availability via WebRTC signaling
      // 3. Filter by collaboration preferences and reputation

      const mockPeers: Web3Identity[] = [
        {
          address: '0x1234...abcd',
          ensName: 'alice.eth',
          reputation: {
            score: 850,
            contributions: 45,
            regenerativeImpact: 234.5,
            trustScore: 9.2
          },
          certifications: ['Regenerative Dev Certified', 'Carbon Neutral Coder'],
          roles: ['developer', 'validator']
        },
        {
          address: '0x5678...efgh',
          ensName: 'bob.regenerative',
          reputation: {
            score: 720,
            contributions: 32,
            regenerativeImpact: 156.8,
            trustScore: 8.7
          },
          certifications: ['Sustainable Agriculture Expert'],
          roles: ['producer', 'validator']
        },
        {
          address: '0x9abc...ijkl',
          ensName: 'carol.dao',
          reputation: {
            score: 920,
            contributions: 78,
            regenerativeImpact: 445.2,
            trustScore: 9.8
          },
          certifications: ['Supply Chain Expert', 'DeFi Specialist'],
          roles: ['developer', 'auditor']
        }
      ];

      setAvailablePeers(mockPeers);
    } catch (error) {
      console.error('Failed to discover peers:', error);
    }
  };

  // Start a new collaboration session
  const startCollaborationSession = async (
    type: CollaborationSession['type'], 
    peerAddress: string,
    withVideo: boolean = false,
    withAudio: boolean = true
  ) => {
    if (!currentIdentity) {
      throw new Error('Identity not established');
    }

    setIsConnecting(true);

    try {
      // Get user media if requested
      let localStream: MediaStream | undefined;
      if (withVideo || withAudio) {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: withVideo,
          audio: withAudio
        });
        
        if (localVideoRef.current && localStream) {
          localVideoRef.current.srcObject = localStream;
          localStreamRef.current = localStream;
        }
      }

      // Create P2P session via Web3Manager
      const p2pSession = await web3Manager.createP2PSession(type, peerAddress);
      
      const session: CollaborationSession = {
        id: p2pSession.id,
        type,
        participants: [currentIdentity],
        isHost: true,
        mediaState: {
          video: withVideo,
          audio: withAudio,
          screen: false
        },
        p2pConnections: new Map(),
        dataChannels: new Map(),
        mediaStreams: new Map(),
        sharedResources: [],
        economicAgreements: [],
        regenerativeGoals: {
          carbonReduction: 0,
          valueCreation: 0,
          knowledgeSharing: 0
        }
      };

      if (localStream) {
        session.mediaStreams.set('local', localStream);
      }

      setCurrentSession(session);
      setIsConnecting(false);

      console.log(`🤝 Started ${type} session with ${peerAddress}`);
      
      if (onSessionStart) {
        onSessionStart(session);
      }

    } catch (error) {
      console.error('Failed to start collaboration session:', error);
      setIsConnecting(false);
    }
  };

  // Handle incoming P2P messages
  const handleP2PMessage = (message: { sessionId: string; data: any }) => {
    const { sessionId, data } = message;
    
    if (currentSession?.id !== sessionId) return;

    switch (data.type) {
      case 'resource_share':
        handleResourceShare(data.resource);
        break;
      case 'economic_proposal':
        handleEconomicProposal(data.proposal);
        break;
      case 'collaboration_update':
        handleCollaborationUpdate(data.update);
        break;
      case 'regenerative_measurement':
        handleRegenerativeMeasurement(data.measurement);
        break;
    }
  };

  const handleSessionUpdate = (sessions: any[]) => {
    // Update session state based on Web3Manager updates
    console.log('📡 Session update received:', sessions);
  };

  const handleResourceShare = (resource: ResourceShare) => {
    setSharedResources(prev => [...prev, resource]);
    
    if (onResourceShared) {
      onResourceShared(resource);
    }

    console.log('📤 Resource shared:', resource.name);
  };

  const handleEconomicProposal = (proposal: EconomicAgreement) => {
    setEconomicAgreements(prev => [...prev, proposal]);
    console.log('💰 Economic proposal received:', proposal);
  };

  const handleCollaborationUpdate = (update: any) => {
    if (currentSession) {
      // Update session state
      console.log('🔄 Collaboration update:', update);
    }
  };

  const handleRegenerativeMeasurement = (measurement: any) => {
    if (currentSession) {
      currentSession.regenerativeGoals = {
        ...currentSession.regenerativeGoals,
        ...measurement
      };
      setCurrentSession({ ...currentSession });
    }
  };

  // Share a resource with peers
  const shareResource = async (file: File, economicValue?: { price: number; currency: string }) => {
    if (!currentSession || currentSession.sharedResources.length >= 10) {
      throw new Error('Cannot share resource: session limit reached');
    }

    const resource: ResourceShare = {
      id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: determineResourceType(file),
      name: file.name,
      size: file.size,
      mimeType: file.type,
      metadata: {
        description: `Shared resource: ${file.name}`,
        tags: [],
        version: '1.0.0',
        checksum: await calculateChecksum(file)
      },
      progress: 0,
      status: 'uploading',
      timestamp: new Date(),
      sharedBy: currentIdentity?.address || 'unknown',
      economicValue
    };

    // Add to session resources
    currentSession.sharedResources.push(resource);
    setCurrentSession({ ...currentSession });

    try {
      // Share via WebRTC data channel
      await web3Manager.shareResource(currentSession.id, {
        type: resource.type,
        data: await file.arrayBuffer(),
        metadata: resource.metadata
      });

      // Update resource status
      resource.status = 'completed';
      resource.progress = 100;
      setCurrentSession({ ...currentSession });

      console.log('✅ Resource shared successfully:', resource.name);

    } catch (error) {
      console.error('❌ Failed to share resource:', error);
      resource.status = 'failed';
      setCurrentSession({ ...currentSession });
    }
  };

  // Request a specific resource from peers
  const requestResource = async (
    resourceType: string, 
    description: string,
    offerValue?: number
  ) => {
    if (!currentSession) return;

    try {
      await web3Manager.requestResourceP2P(currentSession.id, {
        type: resourceType,
        description,
        value: offerValue
      });

      console.log('📥 Resource requested:', resourceType);
    } catch (error) {
      console.error('Failed to request resource:', error);
    }
  };

  // Create an economic agreement
  const proposeEconomicAgreement = async (
    type: EconomicAgreement['type'],
    amount: number,
    currency: string,
    conditions: string[]
  ) => {
    if (!currentSession || !currentIdentity) return;

    const agreement: EconomicAgreement = {
      id: `agreement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      parties: [currentIdentity.address, ...currentSession.participants.map(p => p.address)],
      terms: {
        amount,
        currency,
        conditions,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      },
      status: 'proposed',
      regenerativeImpact: calculateRegenerativeImpact(type, amount)
    };

    setEconomicAgreements(prev => [...prev, agreement]);

    // Send proposal to peers
    for (const participant of currentSession.participants) {
      if (participant.address !== currentIdentity.address) {
        // Send via P2P message
        console.log(`💰 Sending economic proposal to ${participant.address}`);
      }
    }
  };

  // Toggle media states
  const toggleVideo = async () => {
    if (!currentSession || !localStreamRef.current) return;

    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCurrentSession({
        ...currentSession,
        mediaState: {
          ...currentSession.mediaState,
          video: videoTrack.enabled
        }
      });
    }
  };

  const toggleAudio = async () => {
    if (!currentSession || !localStreamRef.current) return;

    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setCurrentSession({
        ...currentSession,
        mediaState: {
          ...currentSession.mediaState,
          audio: audioTrack.enabled
        }
      });
    }
  };

  const startScreenShare = async () => {
    if (!currentSession) return;

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      currentSession.mediaStreams.set('screen', screenStream);
      setCurrentSession({
        ...currentSession,
        mediaState: {
          ...currentSession.mediaState,
          screen: true
        }
      });

      console.log('🖥️ Screen sharing started');
    } catch (error) {
      console.error('Failed to start screen sharing:', error);
    }
  };

  // End collaboration session
  const endSession = () => {
    if (currentSession) {
      // Stop all media streams
      currentSession.mediaStreams.forEach(stream => {
        stream.getTracks().forEach(track => track.stop());
      });

      // Close peer connections
      currentSession.p2pConnections.forEach(connection => {
        connection.close();
      });

      if (onSessionEnd) {
        onSessionEnd(currentSession.id);
      }

      setCurrentSession(null);
      console.log('🔚 Collaboration session ended');
    }
  };

  // Helper functions
  const determineResourceType = (file: File): ResourceShare['type'] => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (['js', 'ts', 'tsx', 'py', 'sol', 'rs'].includes(extension || '')) {
      return 'code';
    } else if (['json', 'csv', 'parquet', 'sql'].includes(extension || '')) {
      return 'dataset';
    } else if (['md', 'txt', 'doc', 'pdf'].includes(extension || '')) {
      return 'document';
    } else if (['pkl', 'h5', 'onnx', 'pb'].includes(extension || '')) {
      return 'model';
    }
    
    return 'document';
  };

  const calculateChecksum = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const calculateRegenerativeImpact = (type: EconomicAgreement['type'], amount: number): number => {
    const baseImpact = amount * 0.1; // 10% of economic value as regenerative impact
    const typeMultiplier = {
      'payment': 1.0,
      'revenue_share': 1.2,
      'bounty_split': 1.5,
      'resource_trade': 1.1
    };
    
    return baseImpact * typeMultiplier[type];
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    peerConnectionsRef.current.forEach(connection => {
      connection.close();
    });
    
    peerConnectionsRef.current.clear();
  };

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <Globe className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">P2P Collaboration Hub</h3>
          {currentSession && (
            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
              Live Session
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {currentSession && (
            <>
              <button
                onClick={toggleVideo}
                className={`p-2 rounded ${
                  currentSession.mediaState.video 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {currentSession.mediaState.video ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </button>
              
              <button
                onClick={toggleAudio}
                className={`p-2 rounded ${
                  currentSession.mediaState.audio 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {currentSession.mediaState.audio ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>
              
              <button
                onClick={startScreenShare}
                className={`p-2 rounded ${
                  currentSession.mediaState.screen 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <Monitor className="h-4 w-4" />
              </button>
              
              <button
                onClick={endSession}
                className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                <Square className="h-4 w-4" />
              </button>
            </>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              
              {/* Current Session */}
              {currentSession ? (
                <div className="space-y-4">
                  {/* Video Area */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <video 
                        ref={localVideoRef} 
                        autoPlay 
                        muted 
                        playsInline
                        className="w-full h-32 bg-gray-800 rounded object-cover"
                      />
                      <span className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                        You
                      </span>
                    </div>
                    
                    <div className="relative">
                      <video 
                        ref={remoteVideoRef} 
                        autoPlay 
                        playsInline
                        className="w-full h-32 bg-gray-800 rounded object-cover"
                      />
                      <span className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                        {currentSession.participants.find(p => p.address !== currentIdentity?.address)?.ensName || 'Peer'}
                      </span>
                    </div>
                  </div>

                  {/* Session Info */}
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white capitalize">
                        {currentSession.type.replace('_', ' ')} Session
                      </span>
                      <span className="text-xs text-gray-400">
                        {currentSession.participants.length} participant{currentSession.participants.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {/* Regenerative Goals */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-green-400 font-mono">
                          {currentSession.regenerativeGoals.carbonReduction.toFixed(1)}
                        </div>
                        <div className="text-gray-400">Carbon Reduced</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-400 font-mono">
                          ${currentSession.regenerativeGoals.valueCreation.toFixed(0)}
                        </div>
                        <div className="text-gray-400">Value Created</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-400 font-mono">
                          {currentSession.regenerativeGoals.knowledgeSharing.toFixed(1)}
                        </div>
                        <div className="text-gray-400">Knowledge Shared</div>
                      </div>
                    </div>
                  </div>

                  {/* Resource Sharing */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-white">Resource Sharing</h4>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <Upload className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => requestResource('code', 'Need help with smart contract implementation', 50)}
                          className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          <Download className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {currentSession.sharedResources.map(resource => (
                        <div key={resource.id} className="flex items-center justify-between p-2 bg-gray-800 rounded text-xs">
                          <div className="flex items-center space-x-2">
                            <Code className="h-3 w-3 text-blue-400" />
                            <span className="text-white">{resource.name}</span>
                            <span className="text-gray-400">({(resource.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {resource.economicValue && (
                              <span className="text-green-400">
                                {resource.economicValue.price} {resource.economicValue.currency}
                              </span>
                            )}
                            <div className={`w-2 h-2 rounded-full ${
                              resource.status === 'completed' ? 'bg-green-400' :
                              resource.status === 'failed' ? 'bg-red-400' :
                              'bg-yellow-400'
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => shareResource(file));
                      }}
                    />
                  </div>

                  {/* Economic Agreements */}
                  {economicAgreements.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-white">Economic Agreements</h4>
                      <div className="max-h-24 overflow-y-auto space-y-1">
                        {economicAgreements.map(agreement => (
                          <div key={agreement.id} className="p-2 bg-gray-800 rounded text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-white capitalize">{agreement.type.replace('_', ' ')}</span>
                              <span className="text-green-400">
                                {agreement.terms.amount} {agreement.terms.currency}
                              </span>
                            </div>
                            <div className="text-gray-400 mt-1">
                              Impact: +{agreement.regenerativeImpact.toFixed(1)} regenerative value
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Available Peers */
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-white">Available Peers</h4>
                  
                  {isConnecting ? (
                    <div className="flex items-center justify-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                      />
                      <span className="ml-3 text-gray-400">Connecting...</span>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availablePeers.map(peer => (
                        <div key={peer.address} className="p-3 bg-gray-800 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-white font-medium">
                                  {peer.ensName || `${peer.address.slice(0, 6)}...${peer.address.slice(-4)}`}
                                </span>
                                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                                  {peer.reputation.score}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
                                <span>{peer.reputation.contributions} contributions</span>
                                <span>{peer.reputation.regenerativeImpact.toFixed(1)} regen impact</span>
                                <span>Trust: {peer.reputation.trustScore.toFixed(1)}</span>
                              </div>
                              
                              <div className="flex flex-wrap gap-1 mt-2">
                                {peer.roles.map(role => (
                                  <span key={role} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                                    {role}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex flex-col space-y-1">
                              <button
                                onClick={() => startCollaborationSession('code_review', peer.address, false, true)}
                                className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                title="Start Audio Collaboration"
                              >
                                <Mic className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => startCollaborationSession('pair_programming', peer.address, true, true)}
                                className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                title="Start Video Collaboration"
                              >
                                <Video className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => startCollaborationSession('knowledge_sharing', peer.address, false, false)}
                                className="p-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                                title="Share Resources"
                              >
                                <Share className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
