# 🤖 AGENTS.md

## HyperDev IDE - Revolutionary Web-Based Development Environment

**🎯 INTEGRATION STATUS**: HIGH PRIORITY - Primary IDE interface for ecosystem  
**📊 LAYER**: 6 - Integration Ecosystem  
**🔗 DEPENDENCIES**: universal-life-protocol, hyperbolic-geometric-neural-network, speak-generate-templates  
**⚠️ INTEGRATION NEEDED**: MCP client standardization, visualization component consolidation  
**📈 COMPLEXITY**: Advanced - Multi-language IDE with geometric intelligence

---

## 📋 Project Overview

**HyperDev IDE** is a revolutionary web-based IDE that serves as the **primary development interface** for the entire devops ecosystem. It integrates **hyperbolic geometry**, **agentic workflows**, and **geometric intelligence** to provide unprecedented development capabilities.

### Key Features
- **🚀 Geometric Intelligence**: H²GNN integration for intelligent code analysis
- **🧠 Hyperbolic Visualization**: Advanced 3D visualization of code relationships
- **🤝 Agentic Workflows**: PocketFlow-powered collaborative development
- **🔧 Multi-Language Support**: TypeScript, JavaScript, Python, Racket integration
- **📡 MCP Integration**: Direct connection to universal-life-protocol MCP servers
- **🎨 Sacred Geometry**: Advanced visualization using merkaba geometric patterns
- **⚡ Real-time Collaboration**: Multi-agent development with persistent context

---

## 🏗️ Architecture Overview

### **Core Components**
- **Monaco Editor**: Advanced code editing with TypeScript support
- **Three.js Visualization**: 3D hyperbolic geometry rendering
- **H²GNN Client**: Direct connection to hyperbolic neural network
- **MCP Client**: Model Context Protocol integration
- **PocketFlow Integration**: Workflow orchestration engine
- **Geometric Engine**: Sacred geometry and hyperbolic space calculations

### **Integration Points**
```typescript
// H²GNN Integration
import { H2GNNClient } from './integrations/h2gnn-client';
const h2gnn = new H2GNNClient('ws://localhost:3000');

// MCP Integration
import { MCPClient } from './integrations/mcp-client';
const mcp = new MCPClient('universal-life-protocol');

// PocketFlow Integration
import { Flow } from './integrations/pocketflow';
const workflow = new Flow();
```

---

## 🚀 Setup & Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- TypeScript 5.0+
- Redis (for MCP communication)

### Initial Setup
```bash
# Clone and setup
git clone <repository-url>
cd hyperdev-ide
npm install

# Start development environment
npm run dev

# Start with Docker (recommended)
docker-compose up -d
```

### Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Configure MCP connections
export MCP_SERVER_URL=http://localhost:3000
export H2GNN_WS_URL=ws://localhost:3001
export REDIS_URL=redis://localhost:6379
```

---

## 🔧 Development Guidelines

### **Code Style Standards**
- **TypeScript**: Strict mode with comprehensive type definitions
- **Component Architecture**: Atomic design patterns
- **State Management**: Redux Toolkit with persistent state
- **Styling**: Styled-components with theme system

### **H²GNN Integration Requirements**
```typescript
// Always initialize H²GNN connection first
await h2gnn.initialize({
  embeddingDim: 64,
  curvature: -1,
  maxNodes: 10000
});

// Use H²GNN for code analysis
const analysis = await h2gnn.analyzeCode({
  code: sourceCode,
  language: 'typescript',
  includeContext: true
});

// Visualize in hyperbolic space
const visualization = await h2gnn.visualizeHyperbolic({
  nodes: analysis.nodes,
  edges: analysis.edges,
  curvature: -1
});
```

### **MCP Integration Patterns**
```typescript
// Connect to universal-life-protocol MCP servers
await mcp.connect('universal-life-protocol');

// Use enhanced H²GNN MCP server
const h2gnnResponse = await mcp.call('enhanced_h2gnn_analyze_code', {
  code: sourceCode,
  context: { project: 'hyperdev-ide' }
});

// Use geometric tools MCP server
const geometricInsights = await mcp.call('geometric_tools_analyze_structure', {
  structure: codeStructure,
  includeRecommendations: true
});
```

---

## 🎨 Visualization Components

### **Hyperbolic Geometry Visualization**
```typescript
// Create hyperbolic space visualization
const hyperbolicSpace = new HyperbolicVisualization({
  container: '#visualization',
  curvature: -1,
  embeddingDim: 3,
  nodes: codeNodes,
  edges: codeRelationships
});

// Add interactive features
hyperbolicSpace.addInteractions({
  onNodeClick: (node) => showCodeDetails(node),
  onEdgeHover: (edge) => showRelationship(edge),
  onSpaceNavigate: (position) => updateContext(position)
});
```

### **Sacred Geometry Integration**
```typescript
// Integrate merkaba sacred geometry patterns
import { MerkabaEngine } from './integrations/merkaba-engine';

const sacredGeometry = new MerkabaEngine({
  type: 'merkaba',
  complexity: 'advanced',
  integration: 'consciousness'
});

// Apply sacred geometry to code structure
const geometricAnalysis = await sacredGeometry.analyzeCode({
  code: sourceCode,
  patterns: ['merkaba', 'flower_of_life', 'metatron_cube']
});
```

---

## 🤝 Collaboration Features

### **Multi-Agent Development**
```typescript
// Enable collaborative development
const collaboration = new CollaborativeDevelopment({
  mcpClient: mcp,
  h2gnnClient: h2gnn,
  pocketflow: workflow
});

// Start collaborative session
await collaboration.startSession({
  agents: ['ai-assistant', 'code-reviewer', 'architect'],
  context: { project: 'hyperdev-ide', task: 'feature-development' }
});
```

### **Real-time Communication**
```typescript
// Real-time agent communication
collaboration.on('message', (message) => {
  console.log('Agent message:', message);
  updateIDEContext(message);
});

// Shared context management
collaboration.on('context-update', (context) => {
  updateAllAgents(context);
  persistContext(context);
});
```

---

## 🧪 Testing & Quality Assurance

### **Test Categories**
- **Unit Tests**: Component-level testing with Jest
- **Integration Tests**: H²GNN and MCP integration testing
- **Visual Tests**: Snapshot testing for visualizations
- **Performance Tests**: Rendering and interaction performance

### **Test Commands**
```bash
# Run all tests
npm test

# Integration testing
npm run test:integration

# Visual regression testing
npm run test:visual

# Performance testing
npm run test:performance
```

### **Quality Gates**
- **Code Coverage**: >85% for all components
- **Type Coverage**: >95% TypeScript type coverage
- **Performance**: <16ms render time for 1000 nodes
- **Accessibility**: WCAG 2.1 AA compliance

---

## 📊 Monitoring & Analytics

### **Performance Monitoring**
```typescript
// Monitor IDE performance
const performance = new IDEPerformanceMonitor({
  metrics: ['render-time', 'memory-usage', 'interaction-latency'],
  thresholds: { renderTime: 16, memoryUsage: 512, latency: 100 }
});

// H²GNN performance monitoring
const h2gnnMetrics = await h2gnn.getMetrics({
  include: ['analysis-time', 'embedding-quality', 'visualization-performance']
});
```

### **User Analytics**
```typescript
// Track user interactions
const analytics = new IDEAnalytics({
  events: ['code-edit', 'visualization-interact', 'collaboration'],
  privacy: 'anonymous',
  consent: true
});
```

---

## 🚀 Deployment

### **Development Deployment**
```bash
# Start development server
npm run dev

# Start with hot reload
npm run dev:watch

# Debug mode
npm run dev:debug
```

### **Production Deployment**
```bash
# Build for production
npm run build:prod

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:prod
```

### **Docker Deployment**
```bash
# Build Docker image
docker build -t hyperdev-ide .

# Run with Docker Compose
docker-compose up -d

# Scale horizontally
docker-compose up -d --scale ide=3
```

---

## 🔗 Integration with Ecosystem

### **Required Integrations**
1. **Universal Life Protocol**: MCP server connections
2. **Hyperbolic Geometric Neural Network**: H²GNN client integration
3. **Speak Generate Templates**: Language server protocol
4. **Mind-Git**: CanvasL compilation integration
5. **Epistemic Observability Engine**: Monitoring and metrics

### **Integration Status**
- ✅ **MCP Client**: Basic connection established
- 🚧 **H²GNN Integration**: Advanced features in development
- 🚧 **Visualization Components**: Sacred geometry integration needed
- ⏳ **PocketFlow Integration**: Workflow orchestration pending
- ⏳ **Multi-language Support**: Python and Racket support planned

---

## 🎯 Success Criteria

A task is considered complete when:
1. ✅ IDE successfully connects to universal-life-protocol MCP servers
2. ✅ H²GNN integration provides intelligent code analysis
3. ✅ Hyperbolic geometry visualization renders complex code structures
4. ✅ Multi-agent collaboration workflows function correctly
5. ✅ Sacred geometry patterns enhance code understanding
6. ✅ Real-time collaboration maintains context across agents
7. ✅ Performance meets <16ms render time requirements
8. ✅ All integration tests pass with >85% coverage
9. ✅ Deployment automation works across environments
10. ✅ User experience demonstrates clear productivity improvements

---

## ⚠️ Critical Integration Requirements

### **Immediate Actions Needed**
1. **MCP Standardization**: Implement unified MCP client interface
2. **H²GNN Advanced Features**: Complete geometric analysis integration
3. **Visualization Library**: Consolidate Three.js components with ecosystem
4. **Performance Optimization**: Optimize for large codebase visualization
5. **Security Hardening**: Implement secure agent communication

### **Dependencies for Success**
- Universal Life Protocol MCP server stability
- Hyperbolic Geometric Neural Network performance
- Consistent mathematical foundation across ecosystem
- Standardized agent communication protocols

---

*This AGENTS.md file guides development of HyperDev IDE as the primary interface for the devops ecosystem, emphasizing integration with geometric intelligence and autonomous AI systems.*