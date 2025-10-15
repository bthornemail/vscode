/**
 * Context Manager Types
 * 
 * Defines types for dimensional context management with containerized agent support.
 */

import { IdentityKernel, DimensionalContext } from '@merkaba-god-complex/identity-kernel';

export interface ContextManagerConfig {
  /** Enable containerized agent support */
  enableContainerizedAgents: boolean;
  /** Kubernetes configuration */
  kubernetes?: KubernetesConfig;
  /** Docker configuration */
  docker?: DockerConfig;
  /** Context-specific configurations */
  contexts: ContextConfigs;
  /** Cross-context communication settings */
  crossContextCommunication: CrossContextConfig;
  /** Resource management settings */
  resourceManagement: ResourceManagementConfig;
}

export interface KubernetesConfig {
  /** Kubernetes API server URL */
  apiServer: string;
  /** Namespace for deployments */
  namespace: string;
  /** Authentication token */
  token?: string;
  /** CA certificate */
  caCert?: string;
  /** Insecure TLS */
  insecure?: boolean;
}

export interface DockerConfig {
  /** Docker daemon socket */
  socketPath: string;
  /** Docker registry */
  registry?: string;
  /** Image prefix */
  imagePrefix: string;
}

export interface ContextConfigs {
  vm: VMContextConfig;
  server: ServerContextConfig;
  browser: BrowserContextConfig;
  worker: WorkerContextConfig;
  network: NetworkContextConfig;
}

export interface VMContextConfig {
  /** Node.js runtime version */
  nodeVersion: string;
  /** Module resolution paths */
  modulePaths: string[];
  /** Memory limits */
  memoryLimit: number;
  /** CPU limits */
  cpuLimit: number;
}

export interface ServerContextConfig {
  /** Server port */
  port: number;
  /** Server host */
  host: string;
  /** WebSocket settings */
  websocket: WebSocketConfig;
  /** Agent registry settings */
  agentRegistry: AgentRegistryConfig;
}

export interface BrowserContextConfig {
  /** Browser compatibility */
  compatibility: BrowserCompatibility;
  /** WebGL settings */
  webgl: WebGLConfig;
  /** Visualization settings */
  visualization: VisualizationConfig;
}

export interface WorkerContextConfig {
  /** Worker type */
  workerType: 'web' | 'node' | 'service';
  /** Worker pool size */
  poolSize: number;
  /** Message queue settings */
  messageQueue: MessageQueueConfig;
}

export interface NetworkContextConfig {
  /** Network type */
  networkType: 'p2p' | 'client-server' | 'mesh';
  /** P2P settings */
  p2p: P2PConfig;
  /** WebRTC settings */
  webrtc: WebRTCConfig;
  /** Consensus settings */
  consensus: ConsensusConfig;
}

export interface WebSocketConfig {
  /** WebSocket port */
  port: number;
  /** Heartbeat interval */
  heartbeatInterval: number;
  /** Max connections */
  maxConnections: number;
}

export interface AgentRegistryConfig {
  /** Registry port */
  port: number;
  /** Agent discovery interval */
  discoveryInterval: number;
  /** Max agents */
  maxAgents: number;
}

export interface BrowserCompatibility {
  /** Minimum Chrome version */
  minChrome: string;
  /** Minimum Firefox version */
  minFirefox: string;
  /** Minimum Safari version */
  minSafari: string;
  /** Minimum Edge version */
  minEdge: string;
}

export interface WebGLConfig {
  /** WebGL version */
  version: '1.0' | '2.0';
  /** Shader precision */
  shaderPrecision: 'highp' | 'mediump' | 'lowp';
  /** Max texture size */
  maxTextureSize: number;
}

export interface VisualizationConfig {
  /** Default renderer */
  defaultRenderer: 'd3' | 'three' | 'mermaid' | 'svg';
  /** Animation settings */
  animation: AnimationConfig;
  /** Export settings */
  export: ExportConfig;
}

export interface AnimationConfig {
  /** Enable animations */
  enabled: boolean;
  /** Animation duration */
  duration: number;
  /** Easing function */
  easing: string;
}

export interface ExportConfig {
  /** Supported formats */
  formats: string[];
  /** Default format */
  defaultFormat: string;
  /** Quality settings */
  quality: number;
}

export interface MessageQueueConfig {
  /** Queue size */
  size: number;
  /** Processing timeout */
  timeout: number;
  /** Retry attempts */
  retryAttempts: number;
}

export interface P2PConfig {
  /** Bootstrap nodes */
  bootstrapNodes: string[];
  /** Discovery interval */
  discoveryInterval: number;
  /** Max peers */
  maxPeers: number;
}

export interface WebRTCConfig {
  /** STUN servers */
  stunServers: string[];
  /** TURN servers */
  turnServers: string[];
  /** ICE candidate timeout */
  iceTimeout: number;
}

export interface ConsensusConfig {
  /** Consensus algorithm */
  algorithm: 'geometric' | 'mobius' | 'topological';
  /** Consensus threshold */
  threshold: number;
  /** Timeout */
  timeout: number;
}

export interface CrossContextConfig {
  /** Enable cross-context communication */
  enabled: boolean;
  /** Message routing */
  messageRouting: MessageRoutingConfig;
  /** Identity propagation */
  identityPropagation: IdentityPropagationConfig;
}

export interface MessageRoutingConfig {
  /** Routing algorithm */
  algorithm: 'geometric' | 'topological' | 'consensus';
  /** Max hops */
  maxHops: number;
  /** Timeout */
  timeout: number;
}

export interface IdentityPropagationConfig {
  /** Propagate identity changes */
  enabled: boolean;
  /** Propagation interval */
  interval: number;
  /** Validation required */
  validationRequired: boolean;
}

export interface ResourceManagementConfig {
  /** Memory management */
  memory: MemoryConfig;
  /** CPU management */
  cpu: CPUConfig;
  /** Network management */
  network: NetworkResourceConfig;
}

export interface MemoryConfig {
  /** Memory limit per context */
  limit: number;
  /** Garbage collection interval */
  gcInterval: number;
  /** Memory monitoring */
  monitoring: boolean;
}

export interface CPUConfig {
  /** CPU limit per context */
  limit: number;
  /** CPU monitoring */
  monitoring: boolean;
  /** Load balancing */
  loadBalancing: boolean;
}

export interface NetworkResourceConfig {
  /** Bandwidth limit */
  bandwidthLimit: number;
  /** Connection limit */
  connectionLimit: number;
  /** Network monitoring */
  monitoring: boolean;
}

export interface AgentSpec {
  /** Agent name */
  name: string;
  /** Agent type */
  type: string;
  /** Container image */
  image: string;
  /** Number of replicas */
  replicas: number;
  /** Deployment context */
  context: 'kubernetes' | 'docker';
  /** Port mapping */
  port?: number;
  /** Environment variables */
  env?: { [key: string]: string };
  /** Resource requirements */
  resources?: {
    requests?: { cpu: string; memory: string };
    limits?: { cpu: string; memory: string };
  };
}

export interface ContainerizedAgent {
  /** Agent ID */
  id: string;
  /** Agent name */
  name: string;
  /** Agent type */
  type: string;
  /** Container image */
  image: string;
  /** Context */
  context: DimensionalContext;
  /** Status */
  status: 'running' | 'stopped' | 'error' | 'pending';
  /** Created timestamp */
  createdAt: number;
  /** Updated timestamp */
  updatedAt: number;
  /** Number of replicas */
  replicas: number;
  /** Port mapping */
  port?: number;
  /** Environment variables */
  env?: { [key: string]: string };
  /** Resource requirements */
  resources: {
    requests?: { cpu: string; memory: string };
    limits?: { cpu: string; memory: string };
  };
}

export interface ResourceUsage {
  /** CPU usage percentage */
  cpu: number;
  /** Memory usage in bytes */
  memory: number;
  /** Network I/O in bytes */
  network: {
    in: number;
    out: number;
  };
  /** Disk I/O in bytes */
  disk: {
    read: number;
    write: number;
  };
}

export interface ContextState {
  /** Context type */
  contextType: DimensionalContext;
  /** Status */
  status: 'initializing' | 'running' | 'stopped' | 'error';
  /** Resource usage */
  resourceUsage: ResourceUsage;
  /** Last update */
  lastUpdate: number;
  /** Active agents */
  activeAgents: ContainerizedAgent[];
}

export interface CrossContextMessage {
  /** Message ID */
  id: string;
  /** Source context */
  sourceContext: DimensionalContext;
  /** Target context */
  targetContext: DimensionalContext;
  /** Message type */
  type: string;
  /** Message payload */
  payload: any;
  /** Timestamp */
  timestamp: number;
  /** TTL */
  ttl: number;
  /** Priority */
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export interface ContextManagerEvents {
  'agent:started': (agent: ContainerizedAgent) => void;
  'agent:stopped': (agent: ContainerizedAgent) => void;
  'agent:error': (agent: ContainerizedAgent, error: Error) => void;
  'context:activated': (context: DimensionalContext) => void;
  'context:deactivated': (context: DimensionalContext) => void;
  'message:routed': (message: CrossContextMessage) => void;
  'resource:limit': (context: DimensionalContext, resource: string) => void;
}
