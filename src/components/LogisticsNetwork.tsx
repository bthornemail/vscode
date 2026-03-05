import { useState, useEffect } from 'react';

interface SupplyChainNode {
  id: string;
  name: string;
  type: 'supplier' | 'manufacturer' | 'distributor' | 'retailer' | 'consumer';
  location: { lat: number; lng: number; name: string };
  status: 'active' | 'inactive' | 'optimizing';
  carbonFootprint: number;
  efficiency: number;
  regenerativeScore: number;
  connections: string[];
}

interface SupplyChainEdge {
  id: string;
  from: string;
  to: string;
  distance: number;
  carbonEmission: number;
  transportType: 'truck' | 'ship' | 'plane' | 'train';
  efficiency: number;
  cost: number;
}

interface OptimizationResult {
  totalCarbonReduction: number;
  costSavings: number;
  efficiencyGain: number;
  recommendations: string[];
}

const mockNodes: SupplyChainNode[] = [
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

const mockEdges: SupplyChainEdge[] = [
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
  const [nodes, setNodes] = useState<SupplyChainNode[]>(mockNodes);
  const [edges, setEdges] = useState<SupplyChainEdge[]>(mockEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [viewMode, setViewMode] = useState<'network' | 'analytics' | 'optimization'>('network');

  const getNodeColor = (node: SupplyChainNode) => {
    switch (node.type) {
      case 'supplier': return 'bg-green';
      case 'manufacturer': return 'bg-blue';
      case 'distributor': return 'bg-yellow';
      case 'retailer': return 'bg-purple';
      case 'consumer': return 'bg-red';
      default: return 'bg-muted';
    }
  };

  const getNodeIcon = (node: SupplyChainNode) => {
    switch (node.type) {
      case 'supplier': return '🌱';
      case 'manufacturer': return '🏭';
      case 'distributor': return '🚛';
      case 'retailer': return '🏪';
      case 'consumer': return '👤';
      default: return '📦';
    }
  };

  const getStatusColor = (status: string) => {
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
      const result: OptimizationResult = {
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
    if (!optimizationResult) return;
    
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">🚛 Logistics Network</span>
            <div className="w-2 h-2 bg-green rounded-full animate-pulse"></div>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setViewMode('network')}
              className={`btn btn-sm ${viewMode === 'network' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Network
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`btn btn-sm ${viewMode === 'analytics' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Analytics
            </button>
            <button
              onClick={() => setViewMode('optimization')}
              className={`btn btn-sm ${viewMode === 'optimization' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Optimize
            </button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="card p-2 text-center">
            <div className="text-green font-bold">{totalCarbonFootprint.toFixed(0)}</div>
            <div className="text-muted-foreground">CO2 (tons)</div>
          </div>
          <div className="card p-2 text-center">
            <div className="text-blue font-bold">{averageEfficiency.toFixed(1)}%</div>
            <div className="text-muted-foreground">Efficiency</div>
          </div>
          <div className="card p-2 text-center">
            <div className="text-yellow font-bold">{averageRegenerativeScore.toFixed(1)}</div>
            <div className="text-muted-foreground">Regen Score</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        {viewMode === 'network' && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Supply Chain Nodes</h3>
            {nodes.map(node => (
              <div
                key={node.id}
                className={`card p-3 cursor-pointer transition-all hover:scale-105 ${
                  selectedNode === node.id ? 'border-green' : ''
                }`}
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full ${getNodeColor(node)} flex items-center justify-center text-white`}>
                      {getNodeIcon(node)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{node.name}</div>
                      <div className="text-xs text-muted-foreground">{node.location.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(node.status)}`}></div>
                    <span className="text-xs text-muted-foreground">{node.status}</span>
                  </div>
                </div>
                
                {selectedNode === node.id && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Carbon Footprint:</span>
                        <span className="ml-1 font-medium">{node.carbonFootprint} tons</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Efficiency:</span>
                        <span className="ml-1 font-medium">{node.efficiency}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Regenerative Score:</span>
                        <span className="ml-1 font-medium">{node.regenerativeScore}/10</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Connections:</span>
                        <span className="ml-1 font-medium">{node.connections.length}</span>
                      </div>
                    </div>
                    {node.currentTask && (
                      <div className="text-xs text-yellow">
                        🔄 {node.currentTask}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Network Analytics</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="card p-3">
                <div className="text-xs text-muted-foreground mb-2">Carbon Emissions by Transport</div>
                <div className="space-y-1">
                  {['truck', 'ship', 'plane', 'train'].map(type => {
                    const totalEmission = edges
                      .filter(edge => edge.transportType === type)
                      .reduce((sum, edge) => sum + edge.carbonEmission, 0);
                    return (
                      <div key={type} className="flex justify-between text-xs">
                        <span className="capitalize">{type}</span>
                        <span className="font-medium">{totalEmission} tons</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="card p-3">
                <div className="text-xs text-muted-foreground mb-2">Efficiency by Node Type</div>
                <div className="space-y-1">
                  {['supplier', 'manufacturer', 'distributor', 'retailer'].map(type => {
                    const avgEfficiency = nodes
                      .filter(node => node.type === type)
                      .reduce((sum, node) => sum + node.efficiency, 0) / 
                      nodes.filter(node => node.type === type).length;
                    return (
                      <div key={type} className="flex justify-between text-xs">
                        <span className="capitalize">{type}</span>
                        <span className="font-medium">{avgEfficiency.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="card p-3">
              <div className="text-xs text-muted-foreground mb-2">Transport Routes</div>
              <div className="space-y-2">
                {edges.map(edge => {
                  const fromNode = nodes.find(n => n.id === edge.from);
                  const toNode = nodes.find(n => n.id === edge.to);
                  return (
                    <div key={edge.id} className="flex justify-between items-center text-xs">
                      <span>{fromNode?.name} → {toNode?.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">{edge.distance}km</span>
                        <span className="text-green">{edge.carbonEmission} tons</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'optimization' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Network Optimization</h3>
              <button
                onClick={runOptimization}
                disabled={isOptimizing}
                className="btn btn-primary btn-sm"
              >
                {isOptimizing ? '🔄 Optimizing...' : '🚀 Run Optimization'}
              </button>
            </div>
            
            {isOptimizing && (
              <div className="card p-4 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-green border-t-transparent rounded-full mx-auto mb-2"></div>
                <div className="text-sm text-muted-foreground">Analyzing supply chain for optimization opportunities...</div>
              </div>
            )}
            
            {optimizationResult && (
              <div className="space-y-3">
                <div className="card p-3">
                  <div className="text-sm font-medium mb-3">Optimization Results</div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div className="text-center">
                      <div className="text-green font-bold">{optimizationResult.totalCarbonReduction}%</div>
                      <div className="text-muted-foreground">CO2 Reduction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue font-bold">${optimizationResult.costSavings.toLocaleString()}</div>
                      <div className="text-muted-foreground">Cost Savings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow font-bold">{optimizationResult.efficiencyGain}%</div>
                      <div className="text-muted-foreground">Efficiency Gain</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Recommendations:</div>
                    {optimizationResult.recommendations.map((rec, index) => (
                      <div key={index} className="text-xs flex items-start space-x-2">
                        <span className="text-green">•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={applyOptimization}
                    className="btn btn-primary btn-sm w-full mt-3"
                  >
                    ✅ Apply Optimization
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
