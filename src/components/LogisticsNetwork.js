import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const mockNodes = [
    {
        id: 'supplier1',
        name: 'GreenTech Materials',
        type: 'supplier',
        location: { lat: 37.7749, lng: -122.4194, name: 'San Francisco, CA' },
        status: 'active',
        carbonFootprint: 120,
        efficiency: 85,
        regenerativeScore: 8.5,
        connections: ['manufacturer1']
    },
    {
        id: 'manufacturer1',
        name: 'EcoManufacturing Co',
        type: 'manufacturer',
        location: { lat: 37.7849, lng: -122.4094, name: 'Oakland, CA' },
        status: 'optimizing',
        carbonFootprint: 340,
        efficiency: 78,
        regenerativeScore: 7.2,
        connections: ['distributor1', 'distributor2']
    },
    {
        id: 'distributor1',
        name: 'Sustainable Logistics',
        type: 'distributor',
        location: { lat: 37.7649, lng: -122.4294, name: 'Berkeley, CA' },
        status: 'active',
        carbonFootprint: 180,
        efficiency: 92,
        regenerativeScore: 9.1,
        connections: ['retailer1', 'retailer2']
    },
    {
        id: 'distributor2',
        name: 'Green Distribution',
        type: 'distributor',
        location: { lat: 37.7549, lng: -122.4394, name: 'San Jose, CA' },
        status: 'active',
        carbonFootprint: 200,
        efficiency: 88,
        regenerativeScore: 8.8,
        connections: ['retailer3']
    },
    {
        id: 'retailer1',
        name: 'EcoStore SF',
        type: 'retailer',
        location: { lat: 37.7749, lng: -122.4194, name: 'San Francisco, CA' },
        status: 'active',
        carbonFootprint: 90,
        efficiency: 95,
        regenerativeScore: 9.5,
        connections: ['consumer1', 'consumer2']
    },
    {
        id: 'retailer2',
        name: 'GreenMarket Oakland',
        type: 'retailer',
        location: { lat: 37.7849, lng: -122.4094, name: 'Oakland, CA' },
        status: 'active',
        carbonFootprint: 85,
        efficiency: 93,
        regenerativeScore: 9.2,
        connections: ['consumer3']
    },
    {
        id: 'retailer3',
        name: 'Sustainable Shop',
        type: 'retailer',
        location: { lat: 37.7549, lng: -122.4394, name: 'San Jose, CA' },
        status: 'active',
        carbonFootprint: 95,
        efficiency: 90,
        regenerativeScore: 8.9,
        connections: ['consumer4']
    }
];
const mockEdges = [
    {
        id: 'edge1',
        from: 'supplier1',
        to: 'manufacturer1',
        distance: 15,
        carbonEmission: 45,
        transportType: 'truck',
        efficiency: 85,
        cost: 1200
    },
    {
        id: 'edge2',
        from: 'manufacturer1',
        to: 'distributor1',
        distance: 8,
        carbonEmission: 25,
        transportType: 'truck',
        efficiency: 92,
        cost: 800
    },
    {
        id: 'edge3',
        from: 'manufacturer1',
        to: 'distributor2',
        distance: 45,
        carbonEmission: 80,
        transportType: 'truck',
        efficiency: 78,
        cost: 1500
    },
    {
        id: 'edge4',
        from: 'distributor1',
        to: 'retailer1',
        distance: 5,
        carbonEmission: 15,
        transportType: 'truck',
        efficiency: 95,
        cost: 400
    },
    {
        id: 'edge5',
        from: 'distributor1',
        to: 'retailer2',
        distance: 12,
        carbonEmission: 30,
        transportType: 'truck',
        efficiency: 88,
        cost: 600
    },
    {
        id: 'edge6',
        from: 'distributor2',
        to: 'retailer3',
        distance: 3,
        carbonEmission: 10,
        transportType: 'truck',
        efficiency: 96,
        cost: 300
    }
];
export const LogisticsNetwork = () => {
    const [nodes, setNodes] = useState(mockNodes);
    const [edges, setEdges] = useState(mockEdges);
    const [selectedNode, setSelectedNode] = useState(null);
    const [optimizationResult, setOptimizationResult] = useState(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [viewMode, setViewMode] = useState('network');
    const getNodeColor = (node) => {
        switch (node.type) {
            case 'supplier': return 'bg-green';
            case 'manufacturer': return 'bg-blue';
            case 'distributor': return 'bg-yellow';
            case 'retailer': return 'bg-purple';
            case 'consumer': return 'bg-red';
            default: return 'bg-muted';
        }
    };
    const getNodeIcon = (node) => {
        switch (node.type) {
            case 'supplier': return '🌱';
            case 'manufacturer': return '🏭';
            case 'distributor': return '🚛';
            case 'retailer': return '🏪';
            case 'consumer': return '👤';
            default: return '📦';
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-green';
            case 'optimizing': return 'text-yellow';
            case 'inactive': return 'text-red';
            default: return 'text-muted';
        }
    };
    const runOptimization = async () => {
        setIsOptimizing(true);
        // Simulate optimization process
        setTimeout(() => {
            const result = {
                totalCarbonReduction: 23.5,
                costSavings: 15420,
                efficiencyGain: 12.3,
                recommendations: [
                    'Switch to electric vehicles for last-mile delivery',
                    'Consolidate shipments to reduce transport frequency',
                    'Implement circular economy loops for waste reduction',
                    'Add local suppliers to reduce transport distance',
                    'Optimize inventory levels to reduce storage emissions'
                ]
            };
            setOptimizationResult(result);
            setIsOptimizing(false);
        }, 3000);
    };
    const applyOptimization = () => {
        if (!optimizationResult)
            return;
        // Apply optimization to nodes and edges
        setNodes(prev => prev.map(node => ({
            ...node,
            efficiency: Math.min(100, node.efficiency + 5),
            regenerativeScore: Math.min(10, node.regenerativeScore + 0.5),
            status: node.status === 'optimizing' ? 'active' : node.status
        })));
        setEdges(prev => prev.map(edge => ({
            ...edge,
            efficiency: Math.min(100, edge.efficiency + 8),
            carbonEmission: Math.max(0, edge.carbonEmission - 10)
        })));
        setOptimizationResult(null);
    };
    const totalCarbonFootprint = nodes.reduce((sum, node) => sum + node.carbonFootprint, 0);
    const averageEfficiency = nodes.reduce((sum, node) => sum + node.efficiency, 0) / nodes.length;
    const averageRegenerativeScore = nodes.reduce((sum, node) => sum + node.regenerativeScore, 0) / nodes.length;
    return (_jsxs("div", { className: "h-full flex flex-col", children: [_jsxs("div", { className: "p-3 border-b border-border", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm font-medium", children: "\uD83D\uDE9B Logistics Network" }), _jsx("div", { className: "w-2 h-2 bg-green rounded-full animate-pulse" })] }), _jsxs("div", { className: "flex space-x-1", children: [_jsx("button", { onClick: () => setViewMode('network'), className: `btn btn-sm ${viewMode === 'network' ? 'btn-primary' : 'btn-ghost'}`, children: "Network" }), _jsx("button", { onClick: () => setViewMode('analytics'), className: `btn btn-sm ${viewMode === 'analytics' ? 'btn-primary' : 'btn-ghost'}`, children: "Analytics" }), _jsx("button", { onClick: () => setViewMode('optimization'), className: `btn btn-sm ${viewMode === 'optimization' ? 'btn-primary' : 'btn-ghost'}`, children: "Optimize" })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs", children: [_jsxs("div", { className: "card p-2 text-center", children: [_jsx("div", { className: "text-green font-bold", children: totalCarbonFootprint.toFixed(0) }), _jsx("div", { className: "text-muted-foreground", children: "CO2 (tons)" })] }), _jsxs("div", { className: "card p-2 text-center", children: [_jsxs("div", { className: "text-blue font-bold", children: [averageEfficiency.toFixed(1), "%"] }), _jsx("div", { className: "text-muted-foreground", children: "Efficiency" })] }), _jsxs("div", { className: "card p-2 text-center", children: [_jsx("div", { className: "text-yellow font-bold", children: averageRegenerativeScore.toFixed(1) }), _jsx("div", { className: "text-muted-foreground", children: "Regen Score" })] })] })] }), _jsxs("div", { className: "flex-1 overflow-auto p-3", children: [viewMode === 'network' && (_jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-sm font-medium", children: "Supply Chain Nodes" }), nodes.map(node => (_jsxs("div", { className: `card p-3 cursor-pointer transition-all hover:scale-105 ${selectedNode === node.id ? 'border-green' : ''}`, onClick: () => setSelectedNode(selectedNode === node.id ? null : node.id), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `w-8 h-8 rounded-full ${getNodeColor(node)} flex items-center justify-center text-white`, children: getNodeIcon(node) }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: node.name }), _jsx("div", { className: "text-xs text-muted-foreground", children: node.location.name })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${getStatusColor(node.status)}` }), _jsx("span", { className: "text-xs text-muted-foreground", children: node.status })] })] }), selectedNode === node.id && (_jsxs("div", { className: "mt-3 pt-3 border-t border-border space-y-2", children: [_jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Carbon Footprint:" }), _jsxs("span", { className: "ml-1 font-medium", children: [node.carbonFootprint, " tons"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Efficiency:" }), _jsxs("span", { className: "ml-1 font-medium", children: [node.efficiency, "%"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Regenerative Score:" }), _jsxs("span", { className: "ml-1 font-medium", children: [node.regenerativeScore, "/10"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Connections:" }), _jsx("span", { className: "ml-1 font-medium", children: node.connections.length })] })] }), node.currentTask && (_jsxs("div", { className: "text-xs text-yellow", children: ["\uD83D\uDD04 ", node.currentTask] }))] }))] }, node.id)))] })), viewMode === 'analytics' && (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-sm font-medium", children: "Network Analytics" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "card p-3", children: [_jsx("div", { className: "text-xs text-muted-foreground mb-2", children: "Carbon Emissions by Transport" }), _jsx("div", { className: "space-y-1", children: ['truck', 'ship', 'plane', 'train'].map(type => {
                                                    const totalEmission = edges
                                                        .filter(edge => edge.transportType === type)
                                                        .reduce((sum, edge) => sum + edge.carbonEmission, 0);
                                                    return (_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { className: "capitalize", children: type }), _jsxs("span", { className: "font-medium", children: [totalEmission, " tons"] })] }, type));
                                                }) })] }), _jsxs("div", { className: "card p-3", children: [_jsx("div", { className: "text-xs text-muted-foreground mb-2", children: "Efficiency by Node Type" }), _jsx("div", { className: "space-y-1", children: ['supplier', 'manufacturer', 'distributor', 'retailer'].map(type => {
                                                    const avgEfficiency = nodes
                                                        .filter(node => node.type === type)
                                                        .reduce((sum, node) => sum + node.efficiency, 0) /
                                                        nodes.filter(node => node.type === type).length;
                                                    return (_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { className: "capitalize", children: type }), _jsxs("span", { className: "font-medium", children: [avgEfficiency.toFixed(1), "%"] })] }, type));
                                                }) })] })] }), _jsxs("div", { className: "card p-3", children: [_jsx("div", { className: "text-xs text-muted-foreground mb-2", children: "Transport Routes" }), _jsx("div", { className: "space-y-2", children: edges.map(edge => {
                                            const fromNode = nodes.find(n => n.id === edge.from);
                                            const toNode = nodes.find(n => n.id === edge.to);
                                            return (_jsxs("div", { className: "flex justify-between items-center text-xs", children: [_jsxs("span", { children: [fromNode?.name, " \u2192 ", toNode?.name] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "text-muted-foreground", children: [edge.distance, "km"] }), _jsxs("span", { className: "text-green", children: [edge.carbonEmission, " tons"] })] })] }, edge.id));
                                        }) })] })] })), viewMode === 'optimization' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-sm font-medium", children: "Network Optimization" }), _jsx("button", { onClick: runOptimization, disabled: isOptimizing, className: "btn btn-primary btn-sm", children: isOptimizing ? '🔄 Optimizing...' : '🚀 Run Optimization' })] }), isOptimizing && (_jsxs("div", { className: "card p-4 text-center", children: [_jsx("div", { className: "animate-spin w-8 h-8 border-2 border-green border-t-transparent rounded-full mx-auto mb-2" }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Analyzing supply chain for optimization opportunities..." })] })), optimizationResult && (_jsx("div", { className: "space-y-3", children: _jsxs("div", { className: "card p-3", children: [_jsx("div", { className: "text-sm font-medium mb-3", children: "Optimization Results" }), _jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs mb-3", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-green font-bold", children: [optimizationResult.totalCarbonReduction, "%"] }), _jsx("div", { className: "text-muted-foreground", children: "CO2 Reduction" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-blue font-bold", children: ["$", optimizationResult.costSavings.toLocaleString()] }), _jsx("div", { className: "text-muted-foreground", children: "Cost Savings" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-yellow font-bold", children: [optimizationResult.efficiencyGain, "%"] }), _jsx("div", { className: "text-muted-foreground", children: "Efficiency Gain" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: "Recommendations:" }), optimizationResult.recommendations.map((rec, index) => (_jsxs("div", { className: "text-xs flex items-start space-x-2", children: [_jsx("span", { className: "text-green", children: "\u2022" }), _jsx("span", { children: rec })] }, index)))] }), _jsx("button", { onClick: applyOptimization, className: "btn btn-primary btn-sm w-full mt-3", children: "\u2705 Apply Optimization" })] }) }))] }))] })] }));
};
//# sourceMappingURL=LogisticsNetwork.js.map