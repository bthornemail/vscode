import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Settings,
  Maximize2,
  Search,
  Filter
} from 'lucide-react';

import type { KnowledgeGraph, KnowledgeGraphNode, KnowledgeGraphEdge } from '../../types/ide';
import type { HyperDevMCPClient } from '../../services/MCPClient';

interface Props {
  knowledgeGraph: KnowledgeGraph | null;
  mcpClient: HyperDevMCPClient;
  onNodeSelect?: (node: KnowledgeGraphNode) => void;
  className?: string;
}

interface HyperbolicCoordinate {
  x: number;
  y: number;
}

interface VisualizationSettings {
  layout: 'force' | 'hierarchical' | 'circular' | 'hyperbolic';
  renderMode: '2d' | '3d' | 'poincare';
  nodeSize: number;
  edgeOpacity: number;
  animationSpeed: number;
  showLabels: boolean;
  highlightClusters: boolean;
  filterByType: string[];
}

/**
 * Hyperbolic Knowledge Graph Visualizer
 * 
 * The crown jewel of HyperDev IDE - renders knowledge graphs in hyperbolic space
 * using Poincaré disk model for optimal hierarchical representation.
 */
export const KnowledgeGraphVisualizer: React.FC<Props> = ({
  knowledgeGraph,
  mcpClient,
  onNodeSelect,
  className = ''
}) => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState<VisualizationSettings>({
    layout: 'hyperbolic',
    renderMode: 'poincare',
    nodeSize: 5,
    edgeOpacity: 0.6,
    animationSpeed: 1,
    showLabels: true,
    highlightClusters: true,
    filterByType: []
  });

  // Node and edge meshes
  const nodesMeshRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const edgesMeshRef = useRef<Map<string, THREE.Line>>(new Map());
  const labelsMeshRef = useRef<Map<string, THREE.Sprite>>(new Map());
  
  // Interaction
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Initialize Three.js scene
  const initializeThreeJS = useCallback(() => {
    if (!containerRef.current || isInitialized) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f23);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
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

    // Add renderer to DOM
    container.appendChild(renderer.domElement);

    // Create Poincaré disk boundary
    createPoincareDisc(scene);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Controls setup would go here (OrbitControls, etc.)
    
    setIsInitialized(true);
  }, [isInitialized]);

  // Create Poincaré disk boundary
  const createPoincareDisc = (scene: THREE.Scene) => {
    const geometry = new THREE.RingGeometry(0.98, 1.02, 64);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x444444,
      transparent: true,
      opacity: 0.3
    });
    const disc = new THREE.Mesh(geometry, material);
    disc.rotation.x = -Math.PI / 2;
    scene.add(disc);

    // Add grid lines for hyperbolic geometry visualization
    createHyperbolicGrid(scene);
  };

  // Create hyperbolic grid lines
  const createHyperbolicGrid = (scene: THREE.Scene) => {
    const gridMaterial = new THREE.LineBasicMaterial({ 
      color: 0x333333,
      transparent: true,
      opacity: 0.2
    });

    // Radial lines
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const points = [];
      for (let r = 0; r < 1; r += 0.1) {
        points.push(new THREE.Vector3(
          r * Math.cos(angle),
          0,
          r * Math.sin(angle)
        ));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, gridMaterial);
      scene.add(line);
    }

    // Concentric circles
    for (let r = 0.2; r < 1; r += 0.2) {
      const points = [];
      for (let theta = 0; theta <= Math.PI * 2; theta += 0.1) {
        points.push(new THREE.Vector3(
          r * Math.cos(theta),
          0,
          r * Math.sin(theta)
        ));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, gridMaterial);
      scene.add(line);
    }
  };

  // Hyperbolic Mathematics
  const hyperbolicMath = {
    // Convert hyperbolic coordinates to Poincaré disk
    toPoincare: (h: HyperbolicCoordinate): THREE.Vector3 => {
      const norm = Math.sqrt(h.x * h.x + h.y * h.y);
      if (norm === 0) return new THREE.Vector3(0, 0, 0);
      
      const factor = Math.tanh(norm / 2);
      return new THREE.Vector3(
        factor * h.x / norm,
        0,
        factor * h.y / norm
      );
    },

    // Hyperbolic distance in Poincaré disk
    distance: (p1: THREE.Vector3, p2: THREE.Vector3): number => {
      const norm1 = p1.x * p1.x + p1.z * p1.z;
      const norm2 = p2.x * p2.x + p2.z * p2.z;
      const diff = new THREE.Vector3().subVectors(p2, p1);
      const diffNorm = diff.x * diff.x + diff.z * diff.z;
      
      return Math.acosh(1 + (2 * diffNorm) / ((1 - norm1) * (1 - norm2)));
    },

    // Möbius transformation for navigation
    mobiusTransform: (z: THREE.Vector3, center: THREE.Vector3): THREE.Vector3 => {
      const a = center.x;
      const b = center.z;
      const norm = a * a + b * b;
      
      if (norm >= 1) return z; // Invalid center
      
      const numeratorX = z.x - a;
      const numeratorZ = z.z - b;
      const denominator = 1 - a * z.x - b * z.z;
      
      return new THREE.Vector3(
        numeratorX / denominator,
        0,
        numeratorZ / denominator
      );
    },

    // Geodesic interpolation
    geodesic: (start: THREE.Vector3, end: THREE.Vector3, t: number): THREE.Vector3 => {
      const d = this.distance(start, end);
      if (d === 0) return start;
      
      const lambda = Math.sinh(t * d) / Math.sinh(d);
      
      return new THREE.Vector3(
        start.x + lambda * (end.x - start.x),
        0,
        start.z + lambda * (end.z - start.z)
      );
    }
  };

  // Update visualization when knowledge graph changes
  useEffect(() => {
    if (!knowledgeGraph || !isInitialized || !sceneRef.current) return;

    updateVisualization();
  }, [knowledgeGraph, isInitialized, settings]);

  // Update visualization
  const updateVisualization = () => {
    if (!knowledgeGraph || !sceneRef.current) return;

    clearVisualization();
    
    switch (settings.layout) {
      case 'hyperbolic':
        renderHyperbolicLayout();
        break;
      case 'force':
        renderForceLayout();
        break;
      case 'hierarchical':
        renderHierarchicalLayout();
        break;
      case 'circular':
        renderCircularLayout();
        break;
    }

    if (settings.showLabels) {
      renderLabels();
    }
  };

  // Clear existing visualization
  const clearVisualization = () => {
    if (!sceneRef.current) return;

    // Remove existing nodes, edges, and labels
    nodesMeshRef.current.forEach(mesh => sceneRef.current!.remove(mesh));
    edgesMeshRef.current.forEach(line => sceneRef.current!.remove(line));
    labelsMeshRef.current.forEach(sprite => sceneRef.current!.remove(sprite));

    nodesMeshRef.current.clear();
    edgesMeshRef.current.clear();
    labelsMeshRef.current.clear();
  };

  // Render hyperbolic layout (main feature)
  const renderHyperbolicLayout = () => {
    if (!knowledgeGraph || !sceneRef.current) return;

    const scene = sceneRef.current;
    const filteredNodes = filterNodes(knowledgeGraph.nodes);
    const filteredEdges = filterEdges(knowledgeGraph.edges, filteredNodes);

    // Calculate hyperbolic positions based on node embeddings
    const positions = calculateHyperbolicPositions(filteredNodes);

    // Render nodes
    filteredNodes.forEach((node, index) => {
      const position = positions[index];
      const mesh = createNodeMesh(node, position);
      scene.add(mesh);
      nodesMeshRef.current.set(node.id, mesh);
    });

    // Render edges
    filteredEdges.forEach(edge => {
      const sourceNode = nodesMeshRef.current.get(edge.source);
      const targetNode = nodesMeshRef.current.get(edge.target);
      
      if (sourceNode && targetNode) {
        const line = createEdgeLine(edge, sourceNode.position, targetNode.position);
        scene.add(line);
        edgesMeshRef.current.set(edge.id, line);
      }
    });
  };

  // Calculate hyperbolic positions from embeddings
  const calculateHyperbolicPositions = (nodes: KnowledgeGraphNode[]): THREE.Vector3[] => {
    return nodes.map(node => {
      if (node.embedding && node.embedding.vector.length >= 2) {
        // Use first two dimensions of embedding for hyperbolic coordinates
        const h: HyperbolicCoordinate = {
          x: node.embedding.vector[0],
          y: node.embedding.vector[1]
        };
        
        // Convert to Poincaré disk coordinates
        return hyperbolicMath.toPoincare(h);
      } else {
        // Random position for nodes without embeddings
        const r = Math.random() * 0.8;
        const theta = Math.random() * Math.PI * 2;
        return new THREE.Vector3(
          r * Math.cos(theta),
          0,
          r * Math.sin(theta)
        );
      }
    });
  };

  // Create node mesh
  const createNodeMesh = (node: KnowledgeGraphNode, position: THREE.Vector3): THREE.Mesh => {
    const geometry = new THREE.SphereGeometry(
      settings.nodeSize * getNodeSizeMultiplier(node), 
      16, 
      16
    );
    
    const material = new THREE.MeshLambertMaterial({
      color: getNodeColor(node),
      transparent: true,
      opacity: 0.9
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.userData = { nodeId: node.id, type: 'node' };
    
    // Add subtle animation
    if (isAnimating) {
      mesh.userData.animationPhase = Math.random() * Math.PI * 2;
    }

    return mesh;
  };

  // Create edge line (geodesic in hyperbolic space)
  const createEdgeLine = (edge: KnowledgeGraphEdge, start: THREE.Vector3, end: THREE.Vector3): THREE.Line => {
    const points: THREE.Vector3[] = [];
    const segments = 20;

    // Create geodesic path in hyperbolic space
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = hyperbolicMath.geodesic(start, end, t);
      points.push(point);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: getEdgeColor(edge),
      transparent: true,
      opacity: settings.edgeOpacity
    });

    const line = new THREE.Line(geometry, material);
    line.userData = { edgeId: edge.id, type: 'edge' };

    return line;
  };

  // Node styling
  const getNodeColor = (node: KnowledgeGraphNode): number => {
    const colorMap: Record<string, number> = {
      'file': 0x4FC3F7,
      'class': 0x81C784,
      'function': 0xFFB74D,
      'interface': 0xBA68C8,
      'variable': 0xFF8A65,
      'concept': 0x64B5F6
    };
    
    return colorMap[node.type] || 0x90A4AE;
  };

  const getNodeSizeMultiplier = (node: KnowledgeGraphNode): number => {
    // Size based on importance/complexity
    const baseSize = 1;
    const complexityMultiplier = (node.metadata?.complexity || 1) / 10;
    const connectionMultiplier = (node.connections?.length || 1) / 20;
    
    return baseSize + complexityMultiplier + connectionMultiplier;
  };

  // Edge styling
  const getEdgeColor = (edge: KnowledgeGraphEdge): number => {
    const colorMap: Record<string, number> = {
      'imports': 0x2196F3,
      'extends': 0x4CAF50,
      'implements': 0xFF9800,
      'calls': 0x9C27B0,
      'references': 0x607D8B
    };
    
    return colorMap[edge.type] || 0x616161;
  };

  // Filter functions
  const filterNodes = (nodes: KnowledgeGraphNode[]): KnowledgeGraphNode[] => {
    return nodes.filter(node => {
      // Filter by type
      if (settings.filterByType.length > 0 && !settings.filterByType.includes(node.type)) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  const filterEdges = (edges: KnowledgeGraphEdge[], nodes: KnowledgeGraphNode[]): KnowledgeGraphEdge[] => {
    const nodeIds = new Set(nodes.map(n => n.id));
    return edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));
  };

  // Other layout methods (simplified for brevity)
  const renderForceLayout = () => {
    // D3.js force simulation in 2D, then project to 3D
    console.log('Force layout not implemented in this demo');
  };

  const renderHierarchicalLayout = () => {
    // Tree-like hierarchical layout
    console.log('Hierarchical layout not implemented in this demo');
  };

  const renderCircularLayout = () => {
    // Circular layout
    console.log('Circular layout not implemented in this demo');
  };

  const renderLabels = () => {
    // Text sprites for node labels
    nodesMeshRef.current.forEach((mesh, nodeId) => {
      const node = knowledgeGraph?.nodes.find(n => n.id === nodeId);
      if (!node) return;

      const sprite = createTextSprite(node.name);
      sprite.position.copy(mesh.position);
      sprite.position.y += 0.3;
      
      sceneRef.current!.add(sprite);
      labelsMeshRef.current.set(nodeId, sprite);
    });
  };

  const createTextSprite = (text: string): THREE.Sprite => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = '#ffffff';
    context.font = '24px Arial';
    context.textAlign = 'center';
    context.fillText(text, 128, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    
    sprite.scale.set(1, 0.25, 1);
    
    return sprite;
  };

  // Animation loop
  const animate = useCallback(() => {
    if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;

    // Animate nodes
    if (isAnimating) {
      nodesMeshRef.current.forEach(mesh => {
        if (mesh.userData.animationPhase !== undefined) {
          mesh.userData.animationPhase += 0.02 * settings.animationSpeed;
          mesh.position.y = Math.sin(mesh.userData.animationPhase) * 0.1;
        }
      });
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    
    if (isAnimating) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [isAnimating, settings.animationSpeed]);

  // Mouse interaction
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycasting for hover detection
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(
      Array.from(nodesMeshRef.current.values())
    );

    if (intersects.length > 0) {
      const nodeId = intersects[0].object.userData.nodeId;
      if (nodeId !== hoveredNode) {
        setHoveredNode(nodeId);
      }
    } else if (hoveredNode) {
      setHoveredNode(null);
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    if (!cameraRef.current) return;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(
      Array.from(nodesMeshRef.current.values())
    );

    if (intersects.length > 0) {
      const nodeId = intersects[0].object.userData.nodeId;
      setSelectedNode(nodeId);
      
      const node = knowledgeGraph?.nodes.find(n => n.id === nodeId);
      if (node && onNodeSelect) {
        onNodeSelect(node);
      }
    }
  };

  // Initialize Three.js
  useEffect(() => {
    initializeThreeJS();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [initializeThreeJS]);

  // Start/stop animation
  useEffect(() => {
    if (isAnimating && isInitialized) {
      animate();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [isAnimating, isInitialized, animate]);

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
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-white">🕸️ Knowledge Graph</h3>
          {knowledgeGraph && (
            <span className="text-sm text-gray-400">
              {knowledgeGraph.nodes.length} nodes, {knowledgeGraph.edges.length} edges
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Layout Controls */}
          <select
            value={settings.layout}
            onChange={(e) => setSettings(prev => ({ ...prev, layout: e.target.value as any }))}
            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
          >
            <option value="hyperbolic">Hyperbolic</option>
            <option value="force">Force</option>
            <option value="hierarchical">Hierarchical</option>
            <option value="circular">Circular</option>
          </select>

          {/* Animation Toggle */}
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
          >
            {isAnimating ? (
              <Pause className="h-4 w-4 text-white" />
            ) : (
              <Play className="h-4 w-4 text-white" />
            )}
          </button>

          {/* Reset View */}
          <button
            onClick={() => {
              if (cameraRef.current) {
                cameraRef.current.position.set(0, 0, 5);
                cameraRef.current.lookAt(0, 0, 0);
              }
            }}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
          >
            <RotateCcw className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Main Visualization Container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />

      {/* Loading State */}
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Node Details Panel */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="absolute top-16 right-4 w-80 bg-gray-800 border border-gray-600 rounded-lg p-4 z-20"
        >
          <h4 className="text-lg font-semibold text-white mb-2">Node Details</h4>
          {/* Node details content would go here */}
          <button
            onClick={() => setSelectedNode(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            ×
          </button>
        </motion.div>
      )}

      {/* Status Bar */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-400">
        Layout: {settings.layout} | Render: {settings.renderMode} | 
        {hoveredNode && ` Hover: ${hoveredNode}`}
      </div>
    </div>
  );
};
