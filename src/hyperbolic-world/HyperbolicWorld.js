import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * H²GNN Hyperbolic World Component
 *
 * A React component that renders an A-Frame scene visualizing the hierarchical
 * structure of WordNet concepts and PocketFlow agent workflows in hyperbolic space.
 */
import { useEffect, useRef, useState } from 'react';
import { WordNetDataBridge } from './wordnet-data-bridge';
// Import A-Frame and register components
import 'aframe';
import 'aframe-extras';
import '../aframe-components/hyperbolic-transform';
const HyperbolicWorld = ({ mcpClient, showWordNet = true, showAgentPaths = false, maxNodes = 50, worldRadius = 10, enableVR = true }) => {
    const sceneRef = useRef(null);
    const [wordNetData, setWordNetData] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
        }
        catch (err) {
            setError(`Failed to load WordNet data: ${err.message}`);
            console.error('Error loading WordNet data:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const getNodeColor = (node) => {
        // Color coding based on hierarchy level
        const colors = [
            '#ff0000', // Level 0 - Red (root concepts)
            '#ff7f00', // Level 1 - Orange
            '#ffff00', // Level 2 - Yellow
            '#00ff00', // Level 3 - Green
            '#0000ff', // Level 4 - Blue
            '#4b0082', // Level 5 - Indigo
            '#9400d3' // Level 6+ - Violet
        ];
        return colors[Math.min(node.hierarchyLevel, colors.length - 1)];
    };
    const getNodeScale = (node) => {
        // Scale based on hierarchy level and norm
        const baseScale = 0.5 + (node.hierarchyLevel * 0.1);
        const normScale = 1 + node.norm;
        return Math.min(baseScale * normScale, 2.0);
    };
    const handleNodeClick = (node) => {
        setSelectedNode(node);
        console.log('Selected node:', node);
        // Emit event for other components
        const event = new CustomEvent('wordnet-node-selected', {
            detail: { node }
        });
        window.dispatchEvent(event);
    };
    const generateAFrameScene = () => {
        if (!wordNetData)
            return null;
        return (_jsxs("a-scene", { ref: sceneRef, "vr-mode-ui": enableVR ? "enabled: true" : "enabled: false", embedded: true, style: { height: '100%', width: '100%' }, background: "color: #000", fog: "type: exponential; density: 0.1; color: #000", children: [_jsxs("a-assets", { children: [_jsx("a-mixin", { id: "wordnet-node", geometry: "primitive: sphere", material: "shader: standard; metalness: 0.1; roughness: 0.7", animation__hover: "property: scale; to: 1.2 1.2 1.2; startEvents: mouseenter; pauseEvents: mouseleave", animation__unhover: "property: scale; to: 1 1 1; startEvents: mouseleave; pauseEvents: mouseenter" }), _jsx("a-mixin", { id: "wordnet-edge", geometry: "primitive: cylinder; radiusTop: 0.01; radiusBottom: 0.01", material: "color: #888; opacity: 0.6; transparent: true" })] }), _jsx("a-light", { type: "ambient", intensity: "0.5" }), _jsx("a-light", { type: "directional", position: "-1 1 1", intensity: "0.8" }), _jsx("a-light", { type: "point", position: "2 4 4", intensity: "0.3" }), _jsx("a-entity", { id: "cameraRig", "movement-controls": "fly: true; constrainToNavMesh: false", children: _jsx("a-camera", { "look-controls": "pointerLockEnabled: true", position: "0 1.6 5", cursor: "rayOrigin: mouse" }) }), _jsx("a-sphere", { radius: worldRadius, material: "color: #333; opacity: 0.1; transparent: true; side: back", wireframe: "true", "wireframe-linewidth": "0.02", position: "0 0 0" }), showWordNet && wordNetData.nodes.map((node) => (_jsxs("a-sphere", { mixin: "wordnet-node", radius: getNodeScale(node) * 0.2, color: getNodeColor(node), "hyperbolic-transform": `hyperbolic: ${node.hyperbolicCoords.join(' ')}; scale: ${getNodeScale(node)}; radius: ${worldRadius}; animateMovement: true`, position: "0 0 0", "data-node-id": node.id, class: "wordnet-node", onClick: () => handleNodeClick(node), children: [_jsx("a-text", { value: node.label, position: "0 0.3 0", align: "center", color: "#fff", scale: "0.5 0.5 0.5", billboard: "true" }), _jsx("a-text", { value: `d: ${node.norm.toFixed(2)}`, position: "0 -0.3 0", align: "center", color: "#aaa", scale: "0.3 0.3 0.3", billboard: "true" })] }, node.id))), showWordNet && wordNetData.edges.map((edge) => {
                    const sourceNode = wordNetData.nodes.find(n => n.id === edge.source);
                    const targetNode = wordNetData.nodes.find(n => n.id === edge.target);
                    if (!sourceNode || !targetNode)
                        return null;
                    // Calculate midpoint and rotation for cylinder
                    const sourcePos = sourceNode.hyperbolicCoords;
                    const targetPos = targetNode.hyperbolicCoords;
                    const midpoint = [
                        (sourcePos[0] + targetPos[0]) / 2,
                        (sourcePos[1] + targetPos[1]) / 2,
                        (sourcePos[2] + targetPos[2]) / 2
                    ];
                    const distance = Math.sqrt(Math.pow(targetPos[0] - sourcePos[0], 2) +
                        Math.pow(targetPos[1] - sourcePos[1], 2) +
                        Math.pow(targetPos[2] - sourcePos[2], 2));
                    return (_jsx("a-cylinder", { mixin: "wordnet-edge", height: distance * worldRadius, radius: "0.01", color: edge.relationshipType === 'hypernym' ? '#4CAF50' : '#FFC107', "hyperbolic-transform": `hyperbolic: ${midpoint.join(' ')}; radius: ${worldRadius}`, "look-at": `[data-node-id="${edge.target}"]` }, edge.id));
                }), showAgentPaths && (_jsx("a-sphere", { radius: "0.1", color: "#e91e63", "hyperbolic-transform": "hyperbolic: 0.2 0.3 0.1; animateMovement: true", animation: "property: hyperbolic-transform.hyperbolic; to: 0.5 0.2 0.3; dur: 3000; easing: easeInOutQuad; loop: true; dir: alternate", children: _jsx("a-text", { value: "Agent", position: "0 0.2 0", align: "center", color: "#fff", scale: "0.3 0.3 0.3" }) })), _jsxs("a-gui-flex-container", { "flex-direction": "column", "justify-content": "center", "align-items": "normal", "component-padding": "0.1", opacity: "0.8", width: "3", height: "2", position: "-4 2 -2", children: [_jsx("a-gui-button", { width: "2.5", height: "0.3", value: "H\u00B2GNN Hyperbolic World", "background-color": "#1976d2", "hover-color": "#1565c0" }), _jsx("a-text", { value: `Concepts: ${wordNetData?.nodes.length || 0}`, color: "#fff", scale: "0.5 0.5 0.5", position: "0 -0.4 0" }), _jsx("a-text", { value: `Relations: ${wordNetData?.edges.length || 0}`, color: "#fff", scale: "0.5 0.5 0.5", position: "0 -0.7 0" }), selectedNode && (_jsxs(_Fragment, { children: [_jsx("a-text", { value: `Selected: ${selectedNode.label}`, color: "#4CAF50", scale: "0.4 0.4 0.4", position: "0 -1.0 0" }), _jsx("a-text", { value: `Level: ${selectedNode.hierarchyLevel}`, color: "#fff", scale: "0.3 0.3 0.3", position: "0 -1.2 0" })] }))] })] }));
    };
    if (loading) {
        return (_jsx("div", { className: "h-full flex items-center justify-center bg-black text-white", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "w-16 h-16 mx-auto rounded-full border-4 border-blue-500 border-t-transparent animate-spin" }), _jsx("div", { children: "Loading Hyperbolic World..." }), _jsx("div", { className: "text-sm text-gray-400", children: "Initializing WordNet embeddings" })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "h-full flex items-center justify-center bg-black text-white", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "text-red-500 text-lg", children: "\u26A0\uFE0F Error" }), _jsx("div", { children: error }), _jsx("button", { onClick: loadWordNetData, className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded", children: "Retry" })] }) }));
    }
    return (_jsxs("div", { className: "h-full w-full relative bg-black", children: [generateAFrameScene(), _jsxs("div", { className: "absolute top-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded text-sm", children: [_jsx("div", { className: "font-semibold mb-2", children: "\uD83C\uDF0D Hyperbolic World Status" }), _jsxs("div", { children: ["Nodes: ", wordNetData?.nodes.length || 0] }), _jsxs("div", { children: ["Edges: ", wordNetData?.edges.length || 0] }), _jsxs("div", { children: ["Max Level: ", wordNetData?.metadata.maxHierarchyLevel || 0] }), _jsxs("div", { children: ["Avg Norm: ", wordNetData?.metadata.averageNorm.toFixed(3) || 'N/A'] }), selectedNode && (_jsxs("div", { className: "mt-2 pt-2 border-t border-gray-600", children: [_jsxs("div", { className: "text-green-400", children: ["Selected: ", selectedNode.label] }), _jsxs("div", { children: ["Level: ", selectedNode.hierarchyLevel] }), _jsxs("div", { children: ["Norm: ", selectedNode.norm.toFixed(3)] })] }))] }), _jsxs("div", { className: "absolute top-4 right-4 space-y-2", children: [_jsx("button", { onClick: () => window.location.reload(), className: "block w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm", children: "Reload World" }), _jsx("button", { onClick: () => setSelectedNode(null), className: "block w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm", disabled: !selectedNode, children: "Clear Selection" })] })] }));
};
export default HyperbolicWorld;
//# sourceMappingURL=HyperbolicWorld.js.map