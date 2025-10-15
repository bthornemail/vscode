# Context Manager

Manages dimensional contexts (4D VM, 3D Server, 2D Browser, 1D Web Worker, 0D Network) and containerized agents for Merkaba God Complex.

## Features

- **Dimensional Context Management**: Manages all 5 dimensional contexts with proper separation
- **Containerized Agent Support**: Supports both Kubernetes and Docker agents
- **Identity Propagation**: Propagates identity kernels across contexts
- **Cross-Context Communication**: Enables communication between different dimensional contexts
- **Resource Monitoring**: Monitors resource usage and health of containerized agents
- **Auto-Discovery**: Automatically discovers and manages existing containerized agents

## Architecture

### Dimensional Contexts

- **4D VM**: Node.js virtual machine context for module execution
- **3D Server**: Server context for autonomous universe management
- **2D Browser**: Browser context for autonomous observer
- **1D Web Worker**: Web worker context for autonomous model
- **0D Network**: Network context for P2P communication

### Containerized Agents

- **Kubernetes Agents**: Managed via Kubernetes API
- **Docker Agents**: Managed via Docker API
- **Geometric Agents**: Tetrahedral, cubic, octahedral, icosahedral, dodecahedral nodes

## Usage

### Basic Setup

```typescript
import { ContextManager } from '@merkaba-god-complex/context-manager';
import { IdentityKernel } from '@merkaba-god-complex/identity-kernel';

// Create identity kernel
const identityKernel = new IdentityKernel({
  name: 'context-manager',
  geometricMetadata: {
    schlafliSymbols: [3, 3, 3, 3],
    bettiNumbers: [1, 0, 0, 1],
    dimension: 4,
    expansionPoint: true
  }
});

// Create context manager
const contextManager = new ContextManager(identityKernel, {
  enableAutoDiscovery: true,
  heartbeatInterval: 5000,
  agentPollingInterval: 10000
});
```

### Register Contexts

```typescript
// Register VM context
const vmContext = contextManager.registerContext({
  type: '4D_VM',
  name: 'node-vm',
  endpoint: 'node://localhost:3000'
});

// Register server context
const serverContext = contextManager.registerContext({
  type: '3D_SERVER',
  name: 'autonomous-universe',
  endpoint: 'http://localhost:4000'
});

// Register browser context
const browserContext = contextManager.registerContext({
  type: '2D_BROWSER',
  name: 'autonomous-observer',
  endpoint: 'http://localhost:3001'
});
```

### Deploy Containerized Agents

```typescript
// Deploy Kubernetes agent
const k8sAgent = await contextManager.registerAndDeployAgent({
  name: 'tetrahedral-node',
  type: 'tetrahedral',
  runtime: 'kubernetes',
  contextType: '4D_VM',
  desiredReplicas: 4,
  resources: {
    cpu: '100m',
    memory: '128Mi'
  },
  manifest: {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: 'tetrahedral-nodes',
      namespace: 'merkaba-god-complex'
    },
    spec: {
      replicas: 4,
      selector: {
        matchLabels: {
          app: 'tetrahedral-nodes'
        }
      },
      template: {
        metadata: {
          labels: {
            app: 'tetrahedral-nodes'
          }
        },
        spec: {
          containers: [{
            name: 'tetrahedral-node',
            image: 'geometric-demo:latest',
            command: ['npm', 'run', 'demo:tetrahedral'],
            ports: [{
              containerPort: 4000
            }],
            env: [
              { name: 'NODE_TYPE', value: 'tetrahedral' },
              { name: 'NAMESPACE', value: 'merkaba-god-complex' }
            ]
          }]
        }
      }
    }
  }
});

// Deploy Docker agent
const dockerAgent = await contextManager.registerAndDeployAgent({
  name: 'cubic-node',
  type: 'cubic',
  runtime: 'docker',
  contextType: '3D_SERVER',
  image: 'geometric-demo:latest',
  tag: 'latest',
  env: {
    NODE_TYPE: 'cubic',
    NAMESPACE: 'merkaba-god-complex'
  },
  ports: [{
    containerPort: 4001,
    hostPort: 4001
  }]
});
```

### Cross-Context Communication

```typescript
// Send message between contexts
await contextManager.sendMessage(
  vmContext.id,
  serverContext.id,
  {
    type: 'geometric-computation',
    data: {
      operation: 'compute-5-cell-expansion',
      parameters: { consciousness: 0.9 }
    }
  }
);

// Propagate identity to context
contextManager.propagateIdentity(
  browserContext.id,
  identityKernel.getData()
);
```

### Monitor Agents

```typescript
// Get all agents
const agents = contextManager.getAllAgents();

// Get agent status
const agent = contextManager.getAgent(agentId);
console.log(`Agent ${agent.name} status: ${agent.status}`);

// Get agent runtime info
const runtimeInfo = contextManager.getAgentRuntimeInfo(agentId);
console.log(`Agent running on: ${runtimeInfo.ipAddress}:${runtimeInfo.port}`);
```

## Configuration

### Context Manager Config

```typescript
interface ContextManagerConfig {
  enableAutoDiscovery: boolean;        // Auto-discover existing agents
  heartbeatInterval: number;          // Heartbeat interval in ms
  agentPollingInterval: number;       // Agent polling interval in ms
  kubernetesConfigPath?: string;      // Path to kubeconfig file
  dockerSocketPath?: string;          // Path to Docker socket
}
```

### Agent Config

```typescript
interface AgentConfig {
  id: string;
  name: string;
  type: string;                       // Agent type
  runtime: 'kubernetes' | 'docker' | 'nodejs' | 'webworker' | 'browser';
  contextType: ContextType;           // Dimensional context
  identityKernel: IdentityKernelData; // Agent identity
  desiredReplicas?: number;           // For containerized agents
  currentReplicas?: number;
  resources?: {
    cpu: string;
    memory: string;
  };
  metadata?: Record<string, any>;
}
```

## Events

The ContextManager emits the following events:

- `contextRegistered`: When a new context is registered
- `contextUpdated`: When a context is updated
- `agentRegistered`: When a new agent is registered
- `agentDeployed`: When an agent is deployed
- `agentStatusUpdated`: When an agent status changes
- `agentStopped`: When an agent is stopped
- `agentRemoved`: When an agent is removed
- `messageSent`: When a message is sent between contexts
- `identityPropagated`: When identity is propagated to a context

## Integration with Existing Agents

The ContextManager can manage existing containerized agents from the headless demo:

### Kubernetes Agents

```bash
# Deploy existing agents
cd demos/headless-demo/k8s
./deploy.sh

# The ContextManager will automatically discover and manage these agents
```

### Docker Agents

```bash
# Run existing agents
cd demos/headless-demo
docker-compose up -d

# The ContextManager will automatically discover and manage these agents
```

## Development

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

### Watch Mode

```bash
pnpm dev
```

## Dependencies

- `@merkaba-god-complex/identity-kernel`: Identity kernel system
- `@kubernetes/client-node`: Kubernetes API client
- `dockerode`: Docker API client
- `ws`: WebSocket support
- `express`: HTTP server
- `cors`: CORS middleware
- `axios`: HTTP client
- `uuid`: UUID generation
- `lodash`: Utility functions

## License

MIT
