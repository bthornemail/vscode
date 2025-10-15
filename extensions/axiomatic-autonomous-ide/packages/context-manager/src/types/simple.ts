/**
 * Simplified Context Manager Types
 * 
 * Basic types for context management without external dependencies
 */

export type ContextType = '4D_VM' | '3D_SERVER' | '2D_BROWSER' | '1D_WORKER' | '0D_NETWORK';
export type ContextStatus = 'initializing' | 'active' | 'paused' | 'error' | 'disconnected';
export type AgentStatus = 'pending' | 'running' | 'stopped' | 'failed' | 'scaling';
export type AgentRuntime = 'docker' | 'kubernetes' | 'nodejs' | 'webworker' | 'browser';

export interface IdentityKernelData {
  id: string;
  name: string;
  version: string;
  timestamp: string;
  geometricMetadata: {
    schlafliSymbols: number[];
    bettiNumbers: number[];
    dimension: number;
    expansionPoint: boolean;
    colorHex?: string;
  };
  consciousnessLevels: {
    geometricAwareness: number;
    mathematicalSynthesis: number;
    autonomousDecision: number;
    collectiveEmergence: number;
  };
  capabilityFlags: {
    canCommunicate: boolean;
    canCompute: boolean;
    canPerceive: boolean;
    canAct: boolean;
    canLearn: boolean;
    canSelfModify: boolean;
  };
  contextAdapters: string[];
  publicKey?: string;
}

export interface ContextConfig {
  type: ContextType;
  id: string;
  name: string;
  endpoint?: string;
  status: ContextStatus;
  identityKernel?: IdentityKernelData;
  lastHeartbeat: string;
  metadata?: Record<string, any>;
}

export interface AgentConfig {
  id: string;
  name: string;
  type: string;
  runtime: AgentRuntime;
  status: AgentStatus;
  contextType: ContextType;
  identityKernel: IdentityKernelData;
  desiredReplicas?: number;
  currentReplicas?: number;
  resources?: {
    cpu: string;
    memory: string;
  };
  metadata?: Record<string, any>;
}

export interface ContainerizedAgentConfig extends AgentConfig {
  image: string;
  tag: string;
  env?: Record<string, string>;
  ports?: { containerPort: number; hostPort?: number; name?: string }[];
  volumes?: { hostPath: string; containerPath: string }[];
  command?: string[];
  args?: string[];
}

export interface KubernetesAgentConfig extends ContainerizedAgentConfig {
  deploymentName: string;
  namespace: string;
  serviceAccount?: string;
  labels?: Record<string, string>;
  nodeSelector?: Record<string, string>;
  tolerations?: any[];
  affinity?: any;
}

export interface DockerAgentConfig extends ContainerizedAgentConfig {
  containerName: string;
  networkMode?: string;
  restartPolicy?: 'no' | 'on-failure' | 'always' | 'unless-stopped';
}

export interface AgentManifest {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace?: string;
    labels?: Record<string, string>;
  };
  spec: any;
}

export interface AgentRuntimeInfo {
  agentId: string;
  containerId?: string;
  podName?: string;
  ipAddress?: string;
  port?: number;
  startTime: string;
  logs?: string[];
}

export interface ContextManagerConfig {
  enableAutoDiscovery: boolean;
  heartbeatInterval: number;
  agentPollingInterval: number;
  kubernetesConfigPath?: string;
  dockerSocketPath?: string;
}

export interface ContextState {
  contexts: Map<string, ContextConfig>;
  agents: Map<string, AgentConfig>;
  agentRuntimes: Map<string, AgentRuntimeInfo>;
}
