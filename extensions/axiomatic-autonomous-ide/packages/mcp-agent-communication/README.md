# MCP Agent Communication Package

A comprehensive Model Context Protocol (MCP) implementation for LLM agent-to-agent communication with geometric message routing and autonomous coordination.

## Features

- **MCP Protocol Support**: Full implementation of the Model Context Protocol for LLM agent communication
- **Geometric Communication**: Incidence-based relational geometry (IBRG) for structured agent interactions
- **Sacred Mathematics**: Golden ratio scaling and divine frequency (432 Hz) for optimal performance
- **Topological Consensus**: Geometric consensus mechanisms using Platonic solid structures
- **Multiple Transports**: WebSocket, HTTP, and stdio transport support
- **Autonomous Coordination**: Self-organizing agent groups with emergent behavior
- **Real-time Messaging**: Low-latency message routing with geometric metadata
- **Group Management**: Dynamic formation and management of geometric agent groups
- **Consensus Mechanisms**: Built-in consensus algorithms for group decision-making
- **Security**: Authentication, encryption, and access control
- **Monitoring**: Comprehensive statistics and health monitoring
- **TypeScript**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install @merkaba-god-complex/mcp-agent-communication
```

## Quick Start

### Server

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

await server.start();
```

### Client

```typescript
import { MCPClient } from '@merkaba-god-complex/mcp-agent-communication';

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

await client.connect();
```

## Architecture

### Core Components

- **MCPClient**: Client-side MCP implementation for agent communication
- **MCPServer**: Server-side MCP implementation for message routing and coordination
- **MCPTransport**: Transport layer abstraction for different communication protocols
- **MCPMessageRouter**: Message routing with geometric metadata and topological analysis
- **MCPGeometricManager**: Geometric group management and consensus mechanisms
- **MCPConsensusManager**: Consensus algorithms for group decision-making

### Geometric Communication

The package implements incidence-based relational geometry (IBRG) for structured agent interactions:

- **Platonic Solid Groups**: Agents organized in geometric groups (tetrahedron, cube, octahedron, etc.)
- **Face-Vertex Ratios**: Consensus thresholds based on geometric properties
- **Topological Invariants**: Betti numbers for structural analysis
- **Sacred Mathematics**: Golden ratio scaling and divine frequency optimization

### Message Types

- **MCP Messages**: Standard MCP protocol messages (requests, responses, notifications)
- **Geometric Messages**: Messages with geometric metadata and topological properties
- **Consensus Messages**: Messages for group consensus and decision-making
- **Identity Messages**: Agent registration and identity management

## Usage Examples

### Basic Agent Communication

```typescript
// Create agent identity
const agentIdentity = createAgentIdentity({
  name: 'my-agent',
  type: 'llm',
  capabilities: ['geometric_communication', 'mcp_protocol']
});

// Connect to server
await client.connect();

// Register agent
await client.registerAgent(agentIdentity);

// Send message
const messageId = await client.sendMessage('target-agent', 'process_data', {
  data: 'example data'
});

// Send geometric message
const geometricMessageId = await client.sendGeometricMessage('target-agent', 'Hello!', 'tetrahedron');
```

### Geometric Group Management

```typescript
// Create geometric group
const groupId = await client.createGeometricGroup('my-group', 'tetrahedron');

// Join group
await client.joinGeometricGroup(groupId);

// Send group message
const groupMessageId = await client.sendGeometricMessage(groupId, 'Group message!', 'tetrahedron');

// Leave group
await client.leaveGeometricGroup(groupId);
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

## Configuration

### Server Configuration

```typescript
interface MCPServerConfig {
  port: number;
  host: string;
  transport: {
    type: 'stdio' | 'websocket' | 'http';
    path?: string;
    heartbeatInterval?: number;
    maxConnections?: number;
  };
  capabilities: {
    tools: boolean;
    resources: boolean;
    prompts: boolean;
    logging: boolean;
  };
  geometric: {
    enableIBRG: boolean;
    enableSacredMath: boolean;
    enableTopologicalConsensus: boolean;
    defaultGroupSize: number;
    maxGroupSize: number;
  };
  security: {
    enableAuthentication: boolean;
    enableEncryption: boolean;
    allowedOrigins: string[];
  };
}
```

### Client Configuration

```typescript
interface MCPClientConfig {
  serverUrl: string;
  transport: {
    type: 'stdio' | 'websocket' | 'http';
    reconnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
  };
  capabilities: {
    tools: boolean;
    resources: boolean;
    prompts: boolean;
    logging: boolean;
  };
  geometric: {
    enableIBRG: boolean;
    enableSacredMath: boolean;
    enableTopologicalConsensus: boolean;
    defaultGroupSize: number;
  };
}
```

## Command Line Interface

### Server

```bash
# Start MCP server
npx mcp-server --port 3000 --host localhost

# With custom configuration
npx mcp-server --port 3000 --enable-ibrg true --enable-sacred-math true
```

### Client

```bash
# Connect to MCP server
npx mcp-client --server-url ws://localhost:3000/mcp

# With custom configuration
npx mcp-client --server-url ws://localhost:3000/mcp --enable-ibrg true
```

## API Reference

### MCPClient

- `connect()`: Connect to MCP server
- `disconnect()`: Disconnect from server
- `registerAgent(identity)`: Register agent identity
- `unregisterAgent()`: Unregister agent
- `sendMessage(to, method, params)`: Send MCP message
- `sendGeometricMessage(to, content, shape)`: Send geometric message
- `createGeometricGroup(name, shape)`: Create geometric group
- `joinGeometricGroup(groupId)`: Join geometric group
- `leaveGeometricGroup(groupId)`: Leave geometric group
- `checkGroupConsensus(groupId)`: Check group consensus
- `getAgents()`: Get registered agents
- `getGeometricGroups()`: Get geometric groups
- `getStatistics()`: Get communication statistics

### MCPServer

- `start()`: Start MCP server
- `stop()`: Stop MCP server
- `registerAgent(identity)`: Register agent identity
- `unregisterAgent(agentId)`: Unregister agent
- `sendMessage(to, method, params)`: Send MCP message
- `sendGeometricMessage(to, content, shape)`: Send geometric message
- `createGeometricGroup(name, shape)`: Create geometric group
- `disbandGeometricGroup(groupId)`: Disband geometric group
- `getAgents()`: Get registered agents
- `getGeometricGroups()`: Get geometric groups
- `getClients()`: Get connected clients
- `getStatistics()`: Get server statistics

## Events

### Client Events

- `connection:state`: Connection state changes
- `agent:registered`: Agent registration events
- `agent:unregistered`: Agent unregistration events
- `group:formed`: Geometric group formation
- `message:sent`: Message sent events
- `message:received`: Message received events
- `notification`: Server notifications
- `error`: Error events

### Server Events

- `server:started`: Server startup
- `server:stopped`: Server shutdown
- `client:connected`: Client connection
- `client:disconnected`: Client disconnection
- `agent:registered`: Agent registration
- `agent:unregistered`: Agent unregistration
- `group:formed`: Group formation
- `group:disbanded`: Group disbandment
- `message:routed`: Message routing
- `consensus:achieved`: Consensus achievement
- `error`: Error events

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test
npm test -- --grep "MCPClient"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub or contact the maintainers.

## Changelog

### 1.0.0

- Initial release
- Full MCP protocol support
- Geometric communication with IBRG
- Sacred mathematics integration
- Topological consensus mechanisms
- Multiple transport support
- Comprehensive TypeScript types
- Command line interface
- Full test coverage

