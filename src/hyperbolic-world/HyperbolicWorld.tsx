/**
 * H²GNN Hyperbolic World Component
 * 
 * A React component that renders an A-Frame scene visualizing the hierarchical
 * structure of WordNet concepts and PocketFlow agent workflows in hyperbolic space.
 */

import React, { useEffect, useRef, useState } from 'react';
import { WordNetDataBridge, WordNetHyperbolicData, WordNetNode } from './wordnet-data-bridge';

// Import A-Frame and register components
import 'aframe';
import 'aframe-extras';
import '../aframe-components/hyperbolic-transform';

interface HyperbolicWorldProps {
  mcpClient?: any;
  showWordNet?: boolean;
  showAgentPaths?: boolean;
  maxNodes?: number;
  worldRadius?: number;
  enableVR?: boolean;
}

const HyperbolicWorld: React.FC<HyperbolicWorldProps> = ({
  mcpClient,
  showWordNet = true,
  showAgentPaths = false,
  maxNodes = 50,
  worldRadius = 10,
  enableVR = true
}) => {
  const sceneRef = useRef<any>(null);
  const [wordNetData, setWordNetData] = useState<WordNetHyperbolicData | null>(null);
  const [selectedNode, setSelectedNode] = useState<WordNetNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWordNetData();
  }, [mcpClient, maxNodes]);

  const loadWordNetData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dataBridge = new WordNetDataBridge(mcpClient);
      const data = await dataBridge.exportWordNetSubset(maxNodes, 'entity', true);
      
      setWordNetData(data);
      console.log('Loaded WordNet data for Hyperbolic World:', data);
    } catch (err: any) {
      setError(`Failed to load WordNet data: ${err.message}`);
      console.error('Error loading WordNet data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNodeColor = (node: WordNetNode): string => {
    // Color coding based on hierarchy level
    const colors = [
      '#ff0000', // Level 0 - Red (root concepts)
      '#ff7f00', // Level 1 - Orange
      '#ffff00', // Level 2 - Yellow
      '#00ff00', // Level 3 - Green
      '#0000ff', // Level 4 - Blue
      '#4b0082', // Level 5 - Indigo
      '#9400d3'  // Level 6+ - Violet
    ];
    
    return colors[Math.min(node.hierarchyLevel, colors.length - 1)];
  };

  const getNodeScale = (node: WordNetNode): number => {
    // Scale based on hierarchy level and norm
    const baseScale = 0.5 + (node.hierarchyLevel * 0.1);
    const normScale = 1 + node.norm;
    return Math.min(baseScale * normScale, 2.0);
  };

  const handleNodeClick = (node: WordNetNode) => {
    setSelectedNode(node);
    console.log('Selected node:', node);
    
    // Emit event for other components
    const event = new CustomEvent('wordnet-node-selected', {
      detail: { node }
    });
    window.dispatchEvent(event);
  };

  const generateAFrameScene = () => {
    if (!wordNetData) return null;

    return (
      <a-scene
        ref={sceneRef}
        vr-mode-ui={enableVR ? "enabled: true" : "enabled: false"}
        embedded
        style={{ height: '100%', width: '100%' }}
        background="color: #000"
        fog="type: exponential; density: 0.1; color: #000"
      >
        {/* Assets */}
        <a-assets>
          <a-mixin
            id="wordnet-node"
            geometry="primitive: sphere"
            material="shader: standard; metalness: 0.1; roughness: 0.7"
            animation__hover="property: scale; to: 1.2 1.2 1.2; startEvents: mouseenter; pauseEvents: mouseleave"
            animation__unhover="property: scale; to: 1 1 1; startEvents: mouseleave; pauseEvents: mouseenter"
          />
          <a-mixin
            id="wordnet-edge"
            geometry="primitive: cylinder; radiusTop: 0.01; radiusBottom: 0.01"
            material="color: #888; opacity: 0.6; transparent: true"
          />
        </a-assets>

        {/* Lighting */}
        <a-light type="ambient" intensity="0.5" />
        <a-light type="directional" position="-1 1 1" intensity="0.8" />
        <a-light type="point" position="2 4 4" intensity="0.3" />

        {/* Camera with controls */}
        <a-entity
          id="cameraRig"
          movement-controls="fly: true; constrainToNavMesh: false"
        >
          <a-camera
            look-controls="pointerLockEnabled: true"
            position="0 1.6 5"
            cursor="rayOrigin: mouse"
          />
        </a-entity>

        {/* Poincaré Ball Boundary */}
        <a-sphere
          radius={worldRadius}
          material="color: #333; opacity: 0.1; transparent: true; side: back"
          wireframe="true"
          wireframe-linewidth="0.02"
          position="0 0 0"
        />

        {/* WordNet Nodes */}
        {showWordNet && wordNetData.nodes.map((node) => (
          <a-sphere
            key={node.id}
            mixin="wordnet-node"
            radius={getNodeScale(node) * 0.2}
            color={getNodeColor(node)}
            hyperbolic-transform={`hyperbolic: ${node.hyperbolicCoords.join(' ')}; scale: ${getNodeScale(node)}; radius: ${worldRadius}; animateMovement: true`}
            position="0 0 0"
            data-node-id={node.id}
            class="wordnet-node"
            onClick={() => handleNodeClick(node)}
          >
            {/* Node label */}
            <a-text
              value={node.label}
              position="0 0.3 0"
              align="center"
              color="#fff"
              scale="0.5 0.5 0.5"
              billboard="true"
            />
            
            {/* Distance indicator */}
            <a-text
              value={`d: ${node.norm.toFixed(2)}`}
              position="0 -0.3 0"
              align="center"
              color="#aaa"
              scale="0.3 0.3 0.3"
              billboard="true"
            />
          </a-sphere>
        ))}

        {/* WordNet Edges (Hierarchical Relationships) */}
        {showWordNet && wordNetData.edges.map((edge) => {
          const sourceNode = wordNetData.nodes.find(n => n.id === edge.source);
          const targetNode = wordNetData.nodes.find(n => n.id === edge.target);
          
          if (!sourceNode || !targetNode) return null;

          // Calculate midpoint and rotation for cylinder
          const sourcePos = sourceNode.hyperbolicCoords;
          const targetPos = targetNode.hyperbolicCoords;
          const midpoint = [
            (sourcePos[0] + targetPos[0]) / 2,
            (sourcePos[1] + targetPos[1]) / 2,
            (sourcePos[2] + targetPos[2]) / 2
          ];

          const distance = Math.sqrt(
            Math.pow(targetPos[0] - sourcePos[0], 2) +
            Math.pow(targetPos[1] - sourcePos[1], 2) +
            Math.pow(targetPos[2] - sourcePos[2], 2)
          );

          return (
            <a-cylinder
              key={edge.id}
              mixin="wordnet-edge"
              height={distance * worldRadius}
              radius="0.01"
              color={edge.relationshipType === 'hypernym' ? '#4CAF50' : '#FFC107'}
              hyperbolic-transform={`hyperbolic: ${midpoint.join(' ')}; radius: ${worldRadius}`}
              look-at={`[data-node-id="${edge.target}"]`}
            />
          );
        })}

        {/* Agent Path Visualization (placeholder for Phase 2) */}
        {showAgentPaths && (
          <a-sphere
            radius="0.1"
            color="#e91e63"
            hyperbolic-transform="hyperbolic: 0.2 0.3 0.1; animateMovement: true"
            animation="property: hyperbolic-transform.hyperbolic; to: 0.5 0.2 0.3; dur: 3000; easing: easeInOutQuad; loop: true; dir: alternate"
          >
            <a-text
              value="Agent"
              position="0 0.2 0"
              align="center"
              color="#fff"
              scale="0.3 0.3 0.3"
            />
          </a-sphere>
        )}

        {/* UI Info Panel */}
        <a-gui-flex-container
          flex-direction="column"
          justify-content="center"
          align-items="normal"
          component-padding="0.1"
          opacity="0.8"
          width="3"
          height="2"
          position="-4 2 -2"
        >
          <a-gui-button
            width="2.5"
            height="0.3"
            value="H²GNN Hyperbolic World"
            background-color="#1976d2"
            hover-color="#1565c0"
          />
          
          <a-text
            value={`Concepts: ${wordNetData?.nodes.length || 0}`}
            color="#fff"
            scale="0.5 0.5 0.5"
            position="0 -0.4 0"
          />
          
          <a-text
            value={`Relations: ${wordNetData?.edges.length || 0}`}
            color="#fff"
            scale="0.5 0.5 0.5"
            position="0 -0.7 0"
          />

          {selectedNode && (
            <>
              <a-text
                value={`Selected: ${selectedNode.label}`}
                color="#4CAF50"
                scale="0.4 0.4 0.4"
                position="0 -1.0 0"
              />
              <a-text
                value={`Level: ${selectedNode.hierarchyLevel}`}
                color="#fff"
                scale="0.3 0.3 0.3"
                position="0 -1.2 0"
              />
            </>
          )}
        </a-gui-flex-container>
      </a-scene>
    );
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <div>Loading Hyperbolic World...</div>
          <div className="text-sm text-gray-400">Initializing WordNet embeddings</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg">⚠️ Error</div>
          <div>{error}</div>
          <button
            onClick={loadWordNetData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative bg-black">
      {generateAFrameScene()}
      
      {/* Debug Info Overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded text-sm">
        <div className="font-semibold mb-2">🌍 Hyperbolic World Status</div>
        <div>Nodes: {wordNetData?.nodes.length || 0}</div>
        <div>Edges: {wordNetData?.edges.length || 0}</div>
        <div>Max Level: {wordNetData?.metadata.maxHierarchyLevel || 0}</div>
        <div>Avg Norm: {wordNetData?.metadata.averageNorm.toFixed(3) || 'N/A'}</div>
        {selectedNode && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-green-400">Selected: {selectedNode.label}</div>
            <div>Level: {selectedNode.hierarchyLevel}</div>
            <div>Norm: {selectedNode.norm.toFixed(3)}</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <button
          onClick={() => window.location.reload()}
          className="block w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
        >
          Reload World
        </button>
        
        <button
          onClick={() => setSelectedNode(null)}
          className="block w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
          disabled={!selectedNode}
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
};

export default HyperbolicWorld;
