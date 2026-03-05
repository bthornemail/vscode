import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, Share, Download, Upload, Code, Globe, ChevronDown, ChevronUp, Square, Monitor } from 'lucide-react';
export const P2PCollaborationHub = ({ web3Manager, regenerativeNetwork, currentIdentity, onSessionStart, onSessionEnd, onResourceShared, className = '' }) => {
    // State
    const [currentSession, setCurrentSession] = useState(null);
    const [availablePeers, setAvailablePeers] = useState([]);
    const [isConnecting, setIsConnecting] = useState(false);
    const [sharedResources, setSharedResources] = useState([]);
    const [economicAgreements, setEconomicAgreements] = useState([]);
    const [selectedPeer, setSelectedPeer] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    // Refs
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const fileInputRef = useRef(null);
    const localStreamRef = useRef(null);
    const peerConnectionsRef = useRef(new Map());
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
        const p2pSub = web3Manager.p2pMessages.subscribe((message) => handleP2PMessage(message));
        const sessionSub = web3Manager.p2pSessions.subscribe((sessions) => handleSessionUpdate(sessions));
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
            const mockPeers = [
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
        }
        catch (error) {
            console.error('Failed to discover peers:', error);
        }
    };
    // Start a new collaboration session
    const startCollaborationSession = async (type, peerAddress, withVideo = false, withAudio = true) => {
        if (!currentIdentity) {
            throw new Error('Identity not established');
        }
        setIsConnecting(true);
        try {
            // Get user media if requested
            let localStream;
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
            const session = {
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
        }
        catch (error) {
            console.error('Failed to start collaboration session:', error);
            setIsConnecting(false);
        }
    };
    // Handle incoming P2P messages
    const handleP2PMessage = (message) => {
        const { sessionId, data } = message;
        if (currentSession?.id !== sessionId)
            return;
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
    const handleSessionUpdate = (sessions) => {
        // Update session state based on Web3Manager updates
        console.log('📡 Session update received:', sessions);
    };
    const handleResourceShare = (resource) => {
        setSharedResources(prev => [...prev, resource]);
        if (onResourceShared) {
            onResourceShared(resource);
        }
        console.log('📤 Resource shared:', resource.name);
    };
    const handleEconomicProposal = (proposal) => {
        setEconomicAgreements(prev => [...prev, proposal]);
        console.log('💰 Economic proposal received:', proposal);
    };
    const handleCollaborationUpdate = (update) => {
        if (currentSession) {
            // Update session state
            console.log('🔄 Collaboration update:', update);
        }
    };
    const handleRegenerativeMeasurement = (measurement) => {
        if (currentSession) {
            currentSession.regenerativeGoals = {
                ...currentSession.regenerativeGoals,
                ...measurement
            };
            setCurrentSession({ ...currentSession });
        }
    };
    // Share a resource with peers
    const shareResource = async (file, economicValue) => {
        if (!currentSession || currentSession.sharedResources.length >= 10) {
            throw new Error('Cannot share resource: session limit reached');
        }
        const resource = {
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
        }
        catch (error) {
            console.error('❌ Failed to share resource:', error);
            resource.status = 'failed';
            setCurrentSession({ ...currentSession });
        }
    };
    // Request a specific resource from peers
    const requestResource = async (resourceType, description, offerValue) => {
        if (!currentSession)
            return;
        try {
            await web3Manager.requestResourceP2P(currentSession.id, {
                type: resourceType,
                description,
                value: offerValue
            });
            console.log('📥 Resource requested:', resourceType);
        }
        catch (error) {
            console.error('Failed to request resource:', error);
        }
    };
    // Create an economic agreement
    const proposeEconomicAgreement = async (type, amount, currency, conditions) => {
        if (!currentSession || !currentIdentity)
            return;
        const agreement = {
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
        if (!currentSession || !localStreamRef.current)
            return;
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
        if (!currentSession || !localStreamRef.current)
            return;
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
        if (!currentSession)
            return;
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
        }
        catch (error) {
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
    const determineResourceType = (file) => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (['js', 'ts', 'tsx', 'py', 'sol', 'rs'].includes(extension || '')) {
            return 'code';
        }
        else if (['json', 'csv', 'parquet', 'sql'].includes(extension || '')) {
            return 'dataset';
        }
        else if (['md', 'txt', 'doc', 'pdf'].includes(extension || '')) {
            return 'document';
        }
        else if (['pkl', 'h5', 'onnx', 'pb'].includes(extension || '')) {
            return 'model';
        }
        return 'document';
    };
    const calculateChecksum = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };
    const calculateRegenerativeImpact = (type, amount) => {
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
    return (_jsxs("div", { className: `bg-gray-900 border border-gray-700 rounded-lg ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-700", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Globe, { className: "h-5 w-5 text-blue-400" }), _jsx("h3", { className: "text-lg font-semibold text-white", children: "P2P Collaboration Hub" }), currentSession && (_jsx("span", { className: "px-2 py-1 bg-green-600 text-white text-xs rounded-full", children: "Live Session" }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [currentSession && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: toggleVideo, className: `p-2 rounded ${currentSession.mediaState.video
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300'}`, children: currentSession.mediaState.video ? _jsx(Video, { className: "h-4 w-4" }) : _jsx(VideoOff, { className: "h-4 w-4" }) }), _jsx("button", { onClick: toggleAudio, className: `p-2 rounded ${currentSession.mediaState.audio
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300'}`, children: currentSession.mediaState.audio ? _jsx(Mic, { className: "h-4 w-4" }) : _jsx(MicOff, { className: "h-4 w-4" }) }), _jsx("button", { onClick: startScreenShare, className: `p-2 rounded ${currentSession.mediaState.screen
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300'}`, children: _jsx(Monitor, { className: "h-4 w-4" }) }), _jsx("button", { onClick: endSession, className: "p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors", children: _jsx(Square, { className: "h-4 w-4" }) })] })), _jsx("button", { onClick: () => setIsExpanded(!isExpanded), className: "p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors", children: isExpanded ? _jsx(ChevronUp, { className: "h-4 w-4" }) : _jsx(ChevronDown, { className: "h-4 w-4" }) })] })] }), _jsx(AnimatePresence, { children: isExpanded && (_jsx(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: 'auto', opacity: 1 }, exit: { height: 0, opacity: 0 }, className: "overflow-hidden", children: _jsx("div", { className: "p-4 space-y-4", children: currentSession ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx("video", { ref: localVideoRef, autoPlay: true, muted: true, playsInline: true, className: "w-full h-32 bg-gray-800 rounded object-cover" }), _jsx("span", { className: "absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded", children: "You" })] }), _jsxs("div", { className: "relative", children: [_jsx("video", { ref: remoteVideoRef, autoPlay: true, playsInline: true, className: "w-full h-32 bg-gray-800 rounded object-cover" }), _jsx("span", { className: "absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded", children: currentSession.participants.find(p => p.address !== currentIdentity?.address)?.ensName || 'Peer' })] })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("span", { className: "text-sm font-medium text-white capitalize", children: [currentSession.type.replace('_', ' '), " Session"] }), _jsxs("span", { className: "text-xs text-gray-400", children: [currentSession.participants.length, " participant", currentSession.participants.length !== 1 ? 's' : ''] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-green-400 font-mono", children: currentSession.regenerativeGoals.carbonReduction.toFixed(1) }), _jsx("div", { className: "text-gray-400", children: "Carbon Reduced" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-blue-400 font-mono", children: ["$", currentSession.regenerativeGoals.valueCreation.toFixed(0)] }), _jsx("div", { className: "text-gray-400", children: "Value Created" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-purple-400 font-mono", children: currentSession.regenerativeGoals.knowledgeSharing.toFixed(1) }), _jsx("div", { className: "text-gray-400", children: "Knowledge Shared" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "text-sm font-medium text-white", children: "Resource Sharing" }), _jsxs("div", { className: "flex space-x-1", children: [_jsx("button", { onClick: () => fileInputRef.current?.click(), className: "p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors", children: _jsx(Upload, { className: "h-3 w-3" }) }), _jsx("button", { onClick: () => requestResource('code', 'Need help with smart contract implementation', 50), className: "p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors", children: _jsx(Download, { className: "h-3 w-3" }) })] })] }), _jsx("div", { className: "max-h-32 overflow-y-auto space-y-1", children: currentSession.sharedResources.map(resource => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-800 rounded text-xs", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Code, { className: "h-3 w-3 text-blue-400" }), _jsx("span", { className: "text-white", children: resource.name }), _jsxs("span", { className: "text-gray-400", children: ["(", (resource.size / 1024).toFixed(1), " KB)"] })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [resource.economicValue && (_jsxs("span", { className: "text-green-400", children: [resource.economicValue.price, " ", resource.economicValue.currency] })), _jsx("div", { className: `w-2 h-2 rounded-full ${resource.status === 'completed' ? 'bg-green-400' :
                                                                    resource.status === 'failed' ? 'bg-red-400' :
                                                                        'bg-yellow-400'}` })] })] }, resource.id))) }), _jsx("input", { ref: fileInputRef, type: "file", multiple: true, className: "hidden", onChange: (e) => {
                                                const files = Array.from(e.target.files || []);
                                                files.forEach(file => shareResource(file));
                                            } })] }), economicAgreements.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-sm font-medium text-white", children: "Economic Agreements" }), _jsx("div", { className: "max-h-24 overflow-y-auto space-y-1", children: economicAgreements.map(agreement => (_jsxs("div", { className: "p-2 bg-gray-800 rounded text-xs", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-white capitalize", children: agreement.type.replace('_', ' ') }), _jsxs("span", { className: "text-green-400", children: [agreement.terms.amount, " ", agreement.terms.currency] })] }), _jsxs("div", { className: "text-gray-400 mt-1", children: ["Impact: +", agreement.regenerativeImpact.toFixed(1), " regenerative value"] })] }, agreement.id))) })] }))] })) : (
                        /* Available Peers */
                        _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "text-sm font-medium text-white", children: "Available Peers" }), isConnecting ? (_jsxs("div", { className: "flex items-center justify-center py-8", children: [_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity, ease: "linear" }, className: "w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" }), _jsx("span", { className: "ml-3 text-gray-400", children: "Connecting..." })] })) : (_jsx("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: availablePeers.map(peer => (_jsx("div", { className: "p-3 bg-gray-800 rounded-lg", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-white font-medium", children: peer.ensName || `${peer.address.slice(0, 6)}...${peer.address.slice(-4)}` }), _jsx("span", { className: "px-2 py-1 bg-green-600 text-white text-xs rounded", children: peer.reputation.score })] }), _jsxs("div", { className: "flex items-center space-x-3 mt-1 text-xs text-gray-400", children: [_jsxs("span", { children: [peer.reputation.contributions, " contributions"] }), _jsxs("span", { children: [peer.reputation.regenerativeImpact.toFixed(1), " regen impact"] }), _jsxs("span", { children: ["Trust: ", peer.reputation.trustScore.toFixed(1)] })] }), _jsx("div", { className: "flex flex-wrap gap-1 mt-2", children: peer.roles.map(role => (_jsx("span", { className: "px-2 py-1 bg-blue-600 text-white text-xs rounded", children: role }, role))) })] }), _jsxs("div", { className: "flex flex-col space-y-1", children: [_jsx("button", { onClick: () => startCollaborationSession('code_review', peer.address, false, true), className: "p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors", title: "Start Audio Collaboration", children: _jsx(Mic, { className: "h-3 w-3" }) }), _jsx("button", { onClick: () => startCollaborationSession('pair_programming', peer.address, true, true), className: "p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors", title: "Start Video Collaboration", children: _jsx(Video, { className: "h-3 w-3" }) }), _jsx("button", { onClick: () => startCollaborationSession('knowledge_sharing', peer.address, false, false), className: "p-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors", title: "Share Resources", children: _jsx(Share, { className: "h-3 w-3" }) })] })] }) }, peer.address))) }))] })) }) })) })] }));
};
//# sourceMappingURL=P2PCollaborationHub.js.map