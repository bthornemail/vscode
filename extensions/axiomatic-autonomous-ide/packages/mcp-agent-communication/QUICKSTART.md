# MCP Agent Communication - Quick Start Guide

Get up and running with MCP agent communication in minutes!

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Basic understanding of TypeScript/JavaScript

## Installation

```bash
# Install the package
npm install @merkaba-god-complex/mcp-agent-communication

# Or clone and build from source
git clone <repository-url>
cd packages/mcp-agent-communication
npm install
npm run build
```

## 1. Start the MCP Server

```bash
# Start server with default configuration
npx mcp-server

# Or with custom port
npx mcp-server --port 3001

# Or with full configuration
npx mcp-server --port 3000 --enable-ibrg true --enable-sacred-math true
```

The server will start on `ws://localhost:3000/mcp` by default.

## 2. Connect a Client

```bash
# Connect to the server
npx mcp-client --server-url ws://localhost:3000/mcp

# Or with custom configuration
npx mcp-client --server-url ws://localhost:3000/mcp --enable-ibrg true
```

## 3. Basic Usage

Once connected, you can use these commands in the client:

```bash
# List registered agents
list agents

# List geometric groups
list groups

# Create a geometric group
create group my-group tetrahedron

# Join a group
join group <groupId>

# Send a message
send message <agentId> hello_world {"message": "Hello!"}

# Send a geometric message
send geometric <agentId> "Hello from geometry!" tetrahedron

# Get server statistics
get statistics

# Quit
quit
```

## 4. Programmatic Usage

### Server Setup

```typescript
import { MCPServer } from '@merkaba-god-complex/mcp-agent-communication';

const server = new MCPServer({
  port: 3000,
  host: 'localhost',
  transport: {
    type: 'websocket',
    path: '/mcp'
  },
  geometric: {
    enableIBRG: true,
    enableSacredMath: true,
    enableTopologicalConsensus: true
  }
});

// Start the server
await server.start();
console.log('MCP Server started on ws://localhost:3000/mcp');
```

### Client Setup

```typescript
import { MCPClient, createAgentIdentity } from '@merkaba-god-complex/mcp-agent-communication';

// Create agent identity
const agentIdentity = createAgentIdentity({
  name: 'my-agent',
  type: 'llm',
  capabilities: ['geometric_communication', 'mcp_protocol']
});

// Create client
const client = new MCPClient({
  serverUrl: 'ws://localhost:3000/mcp',
  transport: {
    type: 'websocket',
    reconnect: true
  },
  geometric: {
    enableIBRG: true,
    enableSacredMath: true,
    enableTopologicalConsensus: true
  }
});

// Connect and register
await client.connect();
await client.registerAgent(agentIdentity);

// Send a message
const messageId = await client.sendMessage('target-agent', 'process_data', {
  data: 'example data'
});

// Create and join a geometric group
const groupId = await client.createGeometricGroup('my-group', 'tetrahedron');
await client.joinGeometricGroup(groupId);

// Send geometric message
const geometricMessageId = await client.sendGeometricMessage(groupId, 'Hello group!', 'tetrahedron');
```

## 5. Event Handling

### Client Events

```typescript
// Listen for connection state changes
client.on('connection:state', (state) => {
  console.log(`Connection state: ${state}`);
});

// Listen for agent registration
client.on('agent:registered', (agent) => {
  console.log(`Agent registered: ${agent.name}`);
});

// Listen for messages
client.on('message:received', (message) => {
  console.log(`Message received: ${message.method}`);
});

// Listen for group events
client.on('group:formed', (group) => {
  console.log(`Group formed: ${group.name}`);
});
```

### Server Events

```typescript
// Listen for client connections
server.on('client:connected', (clientId) => {
  console.log(`Client connected: ${clientId}`);
});

// Listen for agent registration
server.on('agent:registered', (agent) => {
  console.log(`Agent registered: ${agent.name}`);
});

// Listen for consensus achievement
server.on('consensus:achieved', (result) => {
  console.log(`Consensus achieved: ${result.groupId}`);
});
```

## 6. Geometric Communication

### Creating Geometric Groups

```typescript
// Create different types of geometric groups
const tetrahedronGroup = await client.createGeometricGroup('tetra-group', 'tetrahedron');
const cubeGroup = await client.createGeometricGroup('cube-group', 'cube');
const octahedronGroup = await client.createGeometricGroup('octa-group', 'octahedron');
```

### Sending Geometric Messages

```typescript
// Send message with geometric metadata
const messageId = await client.sendGeometricMessage(
  'target-agent',
  'Hello from geometry!',
  'tetrahedron'
);
```

### Consensus Mechanisms

```typescript
// Check group consensus
const consensus = await client.checkGroupConsensus(groupId);

if (consensus.achieved) {
  console.log(`Consensus achieved: ${consensus.agreementPercentage * 100}%`);
  console.log(`Agreed value: ${consensus.agreedValue}`);
}
```

## 7. Advanced Configuration

### Server Configuration

```typescript
const server = new MCPServer({
  port: 3000,
  host: 'localhost',
  transport: {
    type: 'websocket',
    path: '/mcp',
    heartbeatInterval: 30000,
    maxConnections: 100
  },
  capabilities: {
    tools: true,
    resources: true,
    prompts: true,
    logging: true
  },
  geometric: {
    enableIBRG: true,
    enableSacredMath: true,
    enableTopologicalConsensus: true,
    defaultGroupSize: 4,
    maxGroupSize: 20
  },
  security: {
    enableAuthentication: false,
    enableEncryption: false,
    allowedOrigins: ['*']
  }
});
```

### Client Configuration

```typescript
const client = new MCPClient({
  serverUrl: 'ws://localhost:3000/mcp',
  transport: {
    type: 'websocket',
    reconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  },
  capabilities: {
    tools: true,
    resources: true,
    prompts: true,
    logging: false
  },
  geometric: {
    enableIBRG: true,
    enableSacredMath: true,
    enableTopologicalConsensus: true,
    defaultGroupSize: 4
  }
});
```

## 8. Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test
npm test -- --grep "MCPClient"
```

## 9. Troubleshooting

### Common Issues

1. **Connection refused**: Make sure the server is running and accessible
2. **Authentication failed**: Check server security configuration
3. **Message routing failed**: Verify agent IDs and group memberships
4. **Consensus not achieved**: Check group size and consensus thresholds

### Debug Mode

```bash
# Enable debug logging
npx mcp-client --server-url ws://localhost:3000/mcp --enable-logging true
```

### Health Check

```bash
# Check server health
curl http://localhost:3000/health

# Get server statistics
curl http://localhost:3000/stats
```

## 10. Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the [API Reference](README.md#api-reference) for all available methods
- Check out the [examples](examples/) directory for more complex usage patterns
- Join the community for support and discussions

## Support

For help and questions:
- Open an issue on GitHub
- Check the documentation
- Join the community discussions

Happy communicating! 🚀

