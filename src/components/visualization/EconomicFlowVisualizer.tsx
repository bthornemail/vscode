import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Shield, 
  AlertTriangle,
  Play,
  Pause,
  Settings,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';

import type { RegenerativeFlow, RegenerativeNetwork, SupplyChainNode } from '../../frameworks/RegenerativeSupplyChain';
import type { Web3Manager, RegenerativeContract, SmartContractInteraction } from '../../services/Web3Manager';
import { HyperbolicArithmetic, Vector, createVector } from '../../math/hyperbolic-arithmetic';

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

interface VisualizationConfig {
  showRiskLevels: boolean;
  showRegenerativeFlows: boolean;
  showSmartContracts: boolean;
  showTokenFlows: boolean;
  animateFlows: boolean;
  nodeSize: number;
  flowOpacity: number;
  timeRange: 'hour' | 'day' | 'week' | 'month';
  filterByValue: number;
}

interface Props {
  regenerativeNetwork?: RegenerativeNetwork;
  web3Manager: Web3Manager;
  onNodeSelect?: (node: EconomicNode) => void;
  onFlowSelect?: (flow: EconomicFlow) => void;
  className?: string;
}

export const EconomicFlowVisualizer: React.FC<Props> = ({
  regenerativeNetwork,
  web3Manager,
  onNodeSelect,
  onFlowSelect,
  className = ''
}) => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [economicNodes, setEconomicNodes] = useState<Map<string, EconomicNode>>(new Map());
  const [economicFlows, setEconomicFlows] = useState<EconomicFlow[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [config, setConfig] = useState<VisualizationConfig>({
    showRiskLevels: true,
    showRegenerativeFlows: true,
    showSmartContracts: true,
    showTokenFlows: true,
    animateFlows: true,
    nodeSize: 1.0,
    flowOpacity: 0.7,
    timeRange: 'day',
    filterByValue: 0
  });
  const [analytics, setAnalytics] = useState({
    totalValue: 0,
    totalFlows: 0,
    regenerativeValue: 0,
    riskExposure: 0,
    averageGas: 0
  });

  // Mesh references
  const nodesMeshRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const flowsMeshRef = useRef<Map<string, THREE.Line>>(new Map());
  const riskIndicatorsRef = useRef<Map<string, THREE.Mesh>>(new Map());

  // Interaction
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Hyperbolic math
  const hyperbolicMath = new HyperbolicArithmetic();

  // Initialize Three.js scene
  const initializeScene = useCallback(() => {
    if (!containerRef.current || isInitialized) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 10);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Lighting for economic visualization
    const ambientLight = new THREE.AmbientLight(0x1a1a3a, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x4a9eff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add economic grid background
    createEconomicGrid(scene);

    setIsInitialized(true);
  }, [isInitialized]);

  // Create economic grid background
  const createEconomicGrid = (scene: THREE.Scene) => {
    const gridMaterial = new THREE.LineBasicMaterial({ 
      color: 0x1a4a6a,
      transparent: true,
      opacity: 0.3
    });

    // Create concentric circles representing economic zones
    for (let radius = 2; radius <= 10; radius += 2) {
      const points = [];
      for (let theta = 0; theta <= Math.PI * 2; theta += 0.2) {
        points.push(new THREE.Vector3(
          radius * Math.cos(theta),
          radius * Math.sin(theta),
          0
        ));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const circle = new THREE.Line(geometry, gridMaterial);
      scene.add(circle);
    }

    // Add radial lines for economic sectors
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(
          10 * Math.cos(angle),
          10 * Math.sin(angle),
          0
        )
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, gridMaterial);
      scene.add(line);
    }
  };

  // Load economic data
  useEffect(() => {
    loadEconomicData();
    
    // Subscribe to Web3 updates
    const contractSub = web3Manager.contractInteractions.subscribe(
      (interaction) => handleContractInteraction(interaction)
    );

    const regenSub = web3Manager.regenerativeUpdates.subscribe(
      (update) => handleRegenerativeUpdate(update)
    );

    return () => {
      contractSub.unsubscribe();
      regenSub.unsubscribe();
    };
  }, [regenerativeNetwork]);

  const loadEconomicData = async () => {
    console.log('📊 Loading economic data...');

    // Mock economic nodes data
    const mockNodes = new Map<string, EconomicNode>([
      ['carbon_credit_contract', {
        id: 'carbon_credit_contract',
        type: 'contract',
        name: 'Carbon Credit Token',
        address: '0x1234...abcd',
        balance: 150000,
        currency: 'CCT',
        regenerativeScore: 95,
        riskLevel: 'low',
        connections: ['soil_health_dao', 'validator_pool'],
        embedding: createVector([0.3, 0.7, ...new Array(62).fill(0).map(() => Math.random() * 0.1)]),
        metadata: {
          totalVolume: 2500000,
          transactionCount: 1247,
          lastActivity: new Date(),
          apr: 12.5,
          tvl: 5500000,
          impactMetrics: {
            carbonCredits: 150000,
            biodiversityTokens: 0,
            soilHealthRewards: 0
          }
        }
      }],
      ['soil_health_dao', {
        id: 'soil_health_dao',
        type: 'dao',
        name: 'Soil Health DAO',
        address: '0x5678...efgh',
        balance: 89000,
        currency: 'SHT',
        regenerativeScore: 88,
        riskLevel: 'low',
        connections: ['carbon_credit_contract', 'farmer_wallet'],
        embedding: createVector([0.1, 0.4, ...new Array(62).fill(0).map(() => Math.random() * 0.1)]),
        metadata: {
          totalVolume: 890000,
          transactionCount: 456,
          lastActivity: new Date(),
          apr: 8.3,
          tvl: 1200000,
          impactMetrics: {
            carbonCredits: 0,
            biodiversityTokens: 0,
            soilHealthRewards: 89000
          }
        }
      }],
      ['farmer_wallet', {
        id: 'farmer_wallet',
        type: 'wallet',
        name: 'Regenerative Farm Collective',
        address: '0x9abc...ijkl',
        balance: 45000,
        currency: 'USDC',
        regenerativeScore: 76,
        riskLevel: 'medium',
        connections: ['soil_health_dao', 'biodiversity_pool'],
        embedding: createVector([-0.2, 0.1, ...new Array(62).fill(0).map(() => Math.random() * 0.1)]),
        metadata: {
          totalVolume: 450000,
          transactionCount: 234,
          lastActivity: new Date(),
          impactMetrics: {
            carbonCredits: 12000,
            biodiversityTokens: 8500,
            soilHealthRewards: 34000
          }
        }
      }],
      ['biodiversity_pool', {
        id: 'biodiversity_pool',
        type: 'pool',
        name: 'Biodiversity Incentive Pool',
        address: '0xdefg...mnop',
        balance: 120000,
        currency: 'BDT',
        regenerativeScore: 92,
        riskLevel: 'low',
        connections: ['farmer_wallet', 'validator_pool'],
        embedding: createVector([-0.4, -0.3, ...new Array(62).fill(0).map(() => Math.random() * 0.1)]),
        metadata: {
          totalVolume: 1800000,
          transactionCount: 678,
          lastActivity: new Date(),
          apr: 15.2,
          tvl: 2100000,
          impactMetrics: {
            carbonCredits: 0,
            biodiversityTokens: 120000,
            soilHealthRewards: 0
          }
        }
      }],
      ['validator_pool', {
        id: 'validator_pool',
        type: 'validator',
        name: 'Impact Validation Network',
        address: '0xqrst...uvwx',
        balance: 78000,
        currency: 'IVN',
        regenerativeScore: 85,
        riskLevel: 'low',
        connections: ['carbon_credit_contract', 'biodiversity_pool'],
        embedding: createVector([0.5, -0.1, ...new Array(62).fill(0).map(() => Math.random() * 0.1)]),
        metadata: {
          totalVolume: 780000,
          transactionCount: 892,
          lastActivity: new Date(),
          apr: 6.8,
          tvl: 950000
        }
      }]
    ]);

    // Mock economic flows
    const mockFlows: EconomicFlow[] = [
      {
        id: 'flow_1',
        from: 'carbon_credit_contract',
        to: 'farmer_wallet',
        amount: 2500,
        currency: 'USDC',
        type: 'reward',
        timestamp: new Date(Date.now() - 3600000),
        regenerativeImpact: 45.2,
        confidence: 0.95,
        status: 'confirmed',
        gasUsed: 21000,
        carbonOffset: 12.3
      },
      {
        id: 'flow_2',
        from: 'soil_health_dao',
        to: 'farmer_wallet',
        amount: 1800,
        currency: 'SHT',
        type: 'incentive',
        timestamp: new Date(Date.now() - 7200000),
        regenerativeImpact: 32.7,
        confidence: 0.92,
        status: 'confirmed',
        gasUsed: 18500,
        carbonOffset: 8.9
      },
      {
        id: 'flow_3',
        from: 'farmer_wallet',
        to: 'biodiversity_pool',
        amount: 850,
        currency: 'USDC',
        type: 'stake',
        timestamp: new Date(Date.now() - 1800000),
        regenerativeImpact: 28.4,
        confidence: 0.88,
        status: 'pending',
        gasUsed: 35000,
        carbonOffset: 5.2
      }
    ];

    setEconomicNodes(mockNodes);
    setEconomicFlows(mockFlows);

    // Calculate analytics
    const totalValue = Array.from(mockNodes.values()).reduce((sum, node) => sum + node.balance, 0);
    const regenerativeValue = Array.from(mockNodes.values()).reduce((sum, node) => 
      sum + (node.balance * node.regenerativeScore / 100), 0
    );
    const averageGas = mockFlows.reduce((sum, flow) => sum + (flow.gasUsed || 0), 0) / mockFlows.length;

    setAnalytics({
      totalValue,
      totalFlows: mockFlows.length,
      regenerativeValue,
      riskExposure: 15.2,
      averageGas
    });
  };

  const handleContractInteraction = (interaction: SmartContractInteraction) => {
    console.log('📤 Contract interaction:', interaction);
    
    // Add new flow for the interaction
    const newFlow: EconomicFlow = {
      id: `flow_${Date.now()}`,
      from: 'user_wallet',
      to: interaction.contractAddress,
      amount: parseFloat(interaction.valueSent || '0'),
      currency: 'ETH',
      type: 'payment',
      timestamp: new Date(),
      regenerativeImpact: interaction.regenerativeImpact?.estimatedValue || 0,
      confidence: 0.9,
      status: 'pending',
      gasUsed: parseInt(interaction.gasEstimate)
    };

    setEconomicFlows(prev => [...prev, newFlow]);
  };

  const handleRegenerativeUpdate = (update: any) => {
    console.log('🌱 Regenerative update:', update);
    
    if (update.type === 'reputation_update') {
      const nodeId = update.data.address;
      setEconomicNodes(prev => {
        const updated = new Map(prev);
        const node = updated.get(nodeId);
        if (node) {
          node.regenerativeScore = Math.min(100, node.regenerativeScore + update.data.impact.metrics?.value || 0);
          updated.set(nodeId, node);
        }
        return updated;
      });
    }
  };

  // Render the visualization
  useEffect(() => {
    if (!isInitialized || !sceneRef.current) return;
    
    renderEconomicVisualization();
  }, [isInitialized, economicNodes, economicFlows, config]);

  const renderEconomicVisualization = () => {
    if (!sceneRef.current) return;

    clearVisualization();
    renderNodes();
    renderFlows();
    
    if (config.showRiskLevels) {
      renderRiskIndicators();
    }
  };

  const clearVisualization = () => {
    if (!sceneRef.current) return;

    // Remove existing meshes
    nodesMeshRef.current.forEach(mesh => sceneRef.current!.remove(mesh));
    flowsMeshRef.current.forEach(line => sceneRef.current!.remove(line));
    riskIndicatorsRef.current.forEach(mesh => sceneRef.current!.remove(mesh));

    nodesMeshRef.current.clear();
    flowsMeshRef.current.clear();
    riskIndicatorsRef.current.clear();
  };

  const renderNodes = () => {
    economicNodes.forEach((node, nodeId) => {
      const position = hyperbolicToEuclidean(node.embedding);
      const mesh = createNodeMesh(node, position);
      
      sceneRef.current!.add(mesh);
      nodesMeshRef.current.set(nodeId, mesh);
    });
  };

  const renderFlows = () => {
    economicFlows.forEach(flow => {
      const sourceNode = economicNodes.get(flow.from);
      const targetNode = economicNodes.get(flow.to);
      
      if (sourceNode && targetNode) {
        const sourceMesh = nodesMeshRef.current.get(flow.from);
        const targetMesh = nodesMeshRef.current.get(flow.to);
        
        if (sourceMesh && targetMesh) {
          const line = createFlowLine(flow, sourceMesh.position, targetMesh.position);
          sceneRef.current!.add(line);
          flowsMeshRef.current.set(flow.id, line);
        }
      }
    });
  };

  const renderRiskIndicators = () => {
    economicNodes.forEach((node, nodeId) => {
      if (node.riskLevel === 'high' || node.riskLevel === 'critical') {
        const nodeMesh = nodesMeshRef.current.get(nodeId);
        if (nodeMesh) {
          const indicator = createRiskIndicator(node, nodeMesh.position);
          sceneRef.current!.add(indicator);
          riskIndicatorsRef.current.set(nodeId, indicator);
        }
      }
    });
  };

  const hyperbolicToEuclidean = (embedding: Vector): THREE.Vector3 => {
    // Convert hyperbolic embedding to 3D position
    const norm = Math.sqrt(embedding.data[0] ** 2 + embedding.data[1] ** 2);
    const factor = Math.tanh(norm) * 8; // Scale to visible range
    
    const angle = Math.atan2(embedding.data[1], embedding.data[0]);
    
    return new THREE.Vector3(
      factor * Math.cos(angle),
      factor * Math.sin(angle),
      (embedding.data[2] || 0) * 2 // Z component for layering
    );
  };

  const createNodeMesh = (node: EconomicNode, position: THREE.Vector3): THREE.Mesh => {
    const size = 0.5 + (node.balance / 100000) * config.nodeSize;
    
    let geometry: THREE.BufferGeometry;
    switch (node.type) {
      case 'contract':
        geometry = new THREE.OctahedronGeometry(size);
        break;
      case 'dao':
        geometry = new THREE.DodecahedronGeometry(size);
        break;
      case 'wallet':
        geometry = new THREE.SphereGeometry(size, 16, 16);
        break;
      case 'pool':
        geometry = new THREE.CylinderGeometry(size, size, size * 0.5, 8);
        break;
      case 'validator':
        geometry = new THREE.TetrahedronGeometry(size);
        break;
      default:
        geometry = new THREE.BoxGeometry(size, size, size);
    }

    const material = new THREE.MeshLambertMaterial({
      color: getNodeColor(node),
      transparent: true,
      opacity: 0.9
    });

    // Add regenerative glow effect
    if (node.regenerativeScore > 75) {
      material.emissive = new THREE.Color(0x00ff44);
      material.emissiveIntensity = (node.regenerativeScore - 75) / 100;
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.userData = { nodeId: node.id, type: 'economic_node' };

    return mesh;
  };

  const createFlowLine = (flow: EconomicFlow, start: THREE.Vector3, end: THREE.Vector3): THREE.Line => {
    const points = [start, end];
    
    // Create curved flow for large amounts
    if (flow.amount > 1000) {
      const midPoint = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5)
        .add(new THREE.Vector3(0, 0, 1)); // Curve upward
      
      // Create bezier curve
      const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
      const curvePoints = curve.getPoints(20);
      points.splice(0, points.length, ...curvePoints);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: getFlowColor(flow),
      transparent: true,
      opacity: config.flowOpacity * (flow.confidence || 1),
      linewidth: Math.max(1, flow.amount / 5000)
    });

    const line = new THREE.Line(geometry, material);
    line.userData = { flowId: flow.id, type: 'economic_flow' };

    return line;
  };

  const createRiskIndicator = (node: EconomicNode, position: THREE.Vector3): THREE.Mesh => {
    const geometry = new THREE.SphereGeometry(0.2, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: node.riskLevel === 'critical' ? 0xff0000 : 0xff8800,
      transparent: true,
      opacity: 0.8
    });

    const indicator = new THREE.Mesh(geometry, material);
    indicator.position.copy(position);
    indicator.position.z += 1;
    indicator.userData = { nodeId: node.id, type: 'risk_indicator' };

    return indicator;
  };

  const getNodeColor = (node: EconomicNode): number => {
    const baseColors = {
      wallet: 0x4FC3F7,
      contract: 0x81C784,
      token: 0xFFB74D,
      dao: 0xBA68C8,
      pool: 0xFF8A65,
      validator: 0x64B5F6
    };

    let color = baseColors[node.type] || 0x90A4AE;

    // Adjust color based on regenerative score
    if (node.regenerativeScore > 80) {
      color = 0x4CAF50; // Green for high regenerative score
    } else if (node.regenerativeScore < 40) {
      color = 0xFF5722; // Red for low regenerative score
    }

    return color;
  };

  const getFlowColor = (flow: EconomicFlow): number => {
    const typeColors = {
      payment: 0x2196F3,
      reward: 0x4CAF50,
      stake: 0xFF9800,
      yield: 0x9C27B0,
      penalty: 0xF44336,
      incentive: 0x00BCD4
    };

    let color = typeColors[flow.type] || 0x607D8B;

    // Highlight regenerative flows
    if (flow.regenerativeImpact > 30) {
      color = 0x4CAF50;
    }

    return color;
  };

  // Animation loop
  const animate = useCallback(() => {
    if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;

    // Animate flows
    if (config.animateFlows) {
      flowsMeshRef.current.forEach((line, flowId) => {
        const flow = economicFlows.find(f => f.id === flowId);
        if (flow && flow.status === 'pending') {
          line.material.opacity = 0.3 + 0.4 * Math.sin(Date.now() * 0.005);
        }
      });
    }

    // Animate regenerative nodes
    nodesMeshRef.current.forEach((mesh, nodeId) => {
      const node = economicNodes.get(nodeId);
      if (node && node.regenerativeScore > 75) {
        mesh.rotation.y += 0.01;
        mesh.rotation.x += 0.005;
      }
    });

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [config.animateFlows, economicFlows, economicNodes]);

  // Mouse interaction
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(
      Array.from(nodesMeshRef.current.values())
    );

    // Reset all node materials
    nodesMeshRef.current.forEach(mesh => {
      (mesh.material as THREE.MeshLambertMaterial).emissiveIntensity *= 0.5;
    });

    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      (mesh.material as THREE.MeshLambertMaterial).emissiveIntensity = 0.3;
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    if (!cameraRef.current) return;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects([
      ...Array.from(nodesMeshRef.current.values()),
      ...Array.from(flowsMeshRef.current.values())
    ]);

    if (intersects.length > 0) {
      const object = intersects[0].object;
      const userData = object.userData;

      if (userData.type === 'economic_node') {
        setSelectedNode(userData.nodeId);
        const node = economicNodes.get(userData.nodeId);
        if (node && onNodeSelect) {
          onNodeSelect(node);
        }
      } else if (userData.type === 'economic_flow') {
        setSelectedFlow(userData.flowId);
        const flow = economicFlows.find(f => f.id === userData.flowId);
        if (flow && onFlowSelect) {
          onFlowSelect(flow);
        }
      }
    }
  };

  // Initialize scene
  useEffect(() => {
    initializeScene();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [initializeScene]);

  // Start animation
  useEffect(() => {
    if (isInitialized) {
      animate();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized, animate]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`relative h-full bg-gray-950 ${className}`}>
      {/* Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-400" />
            Economic Flow Analysis
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-300">
            <span className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-1 text-green-400" />
              ${analytics.totalValue.toLocaleString()}
            </span>
            <span className="flex items-center">
              <Zap className="h-4 w-4 mr-1 text-blue-400" />
              {analytics.totalFlows} flows
            </span>
            <span className="flex items-center">
              <Shield className="h-4 w-4 mr-1 text-yellow-400" />
              {analytics.riskExposure.toFixed(1)}% risk
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Time Range Selector */}
          <select
            value={config.timeRange}
            onChange={(e) => setConfig(prev => ({ ...prev, timeRange: e.target.value as any }))}
            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
          >
            <option value="hour">Last Hour</option>
            <option value="day">Last Day</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>

          {/* Filter Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setConfig(prev => ({ ...prev, showRiskLevels: !prev.showRiskLevels }))}
              className={`p-2 rounded transition-colors ${
                config.showRiskLevels ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
              title="Show Risk Levels"
            >
              <AlertTriangle className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setConfig(prev => ({ ...prev, showRegenerativeFlows: !prev.showRegenerativeFlows }))}
              className={`p-2 rounded transition-colors ${
                config.showRegenerativeFlows ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
              title="Show Regenerative Flows"
            >
              <Eye className="h-4 w-4" />
            </button>

            <button
              onClick={() => setConfig(prev => ({ ...prev, animateFlows: !prev.animateFlows }))}
              className={`p-2 rounded transition-colors ${
                config.animateFlows ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
              title="Animate Flows"
            >
              {config.animateFlows ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Visualization Container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />

      {/* Economic Metrics Panel */}
      <div className="absolute bottom-4 left-4 bg-gray-800/90 border border-gray-600 rounded-lg p-4 min-w-72">
        <h4 className="text-sm font-semibold text-white mb-3">Economic Metrics</h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Total Value:</span>
              <span className="text-white font-mono">${analytics.totalValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Regenerative Value:</span>
              <span className="text-green-400 font-mono">${analytics.regenerativeValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Active Flows:</span>
              <span className="text-blue-400 font-mono">{analytics.totalFlows}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Risk Exposure:</span>
              <span className="text-yellow-400 font-mono">{analytics.riskExposure.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Avg Gas:</span>
              <span className="text-purple-400 font-mono">{analytics.averageGas.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Carbon Offset:</span>
              <span className="text-green-400 font-mono">45.2 tCO2e</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-16 right-4 w-80 bg-gray-800 border border-gray-600 rounded-lg p-4 z-20"
          >
            {(() => {
              const node = economicNodes.get(selectedNode);
              if (!node) return null;

              return (
                <>
                  <h4 className="text-lg font-semibold text-white mb-2 flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      node.riskLevel === 'low' ? 'bg-green-400' :
                      node.riskLevel === 'medium' ? 'bg-yellow-400' :
                      node.riskLevel === 'high' ? 'bg-orange-400' : 'bg-red-400'
                    }`} />
                    {node.name}
                  </h4>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Type:</span>
                      <span className="text-white capitalize">{node.type}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-300">Balance:</span>
                      <span className="text-white font-mono">
                        {node.balance.toLocaleString()} {node.currency}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-300">Regenerative Score:</span>
                      <span className={`font-mono ${
                        node.regenerativeScore > 75 ? 'text-green-400' :
                        node.regenerativeScore > 50 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {node.regenerativeScore}%
                      </span>
                    </div>

                    {node.metadata.impactMetrics && (
                      <div className="border-t border-gray-600 pt-3">
                        <h5 className="text-gray-300 font-medium mb-2">Impact Metrics</h5>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Carbon Credits:</span>
                            <span className="text-green-400">{node.metadata.impactMetrics.carbonCredits}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Biodiversity Tokens:</span>
                            <span className="text-blue-400">{node.metadata.impactMetrics.biodiversityTokens}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Soil Health Rewards:</span>
                            <span className="text-yellow-400">{node.metadata.impactMetrics.soilHealthRewards}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </>
              );
            })()}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Loading State */}
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full"
          />
        </div>
      )}
    </div>
  );
};
