/**
 * Context Manager Package
 * 
 * Main exports for the context manager system
 */

export { ContextManager } from './ContextManager';
export { KubernetesAgentManager, DockerAgentManager } from './containerized';
export type {
  ContextType,
  ContextStatus,
  ContextConfig,
  AgentStatus,
  AgentConfig,
  ContainerizedAgentConfig,
  KubernetesAgentConfig,
  DockerAgentConfig,
  AgentManifest,
  AgentRuntimeInfo,
  ContextManagerConfig,
  ContextState
} from './types';
