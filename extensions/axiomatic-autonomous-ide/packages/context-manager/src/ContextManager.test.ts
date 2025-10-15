/**
 * ContextManager Test Suite
 * 
 * Tests for the dimensional context manager functionality
 */

import { ContextManager } from './ContextManager';
import { KubernetesAgentManager } from './containerized/KubernetesAgentManager';
import { DockerAgentManager } from './containerized/DockerAgentManager';
import { IdentityKernelCore, DimensionalContext } from '@merkaba-god-complex/identity-kernel';
import { ContextState, ContainerizedAgent } from './types';

// Mock the containerized managers
jest.mock('./containerized/KubernetesAgentManager');
jest.mock('./containerized/DockerAgentManager');

describe('ContextManager', () => {
  let contextManager: ContextManager;
  let identityKernelCore: IdentityKernelCore;
  let mockKubernetesManager: jest.Mocked<KubernetesAgentManager>;
  let mockDockerManager: jest.Mocked<DockerAgentManager>;

  beforeEach(() => {
    // Create identity kernel core
    identityKernelCore = new IdentityKernelCore();
    const identityKernel = identityKernelCore.createIdentityKernel('test-context-manager');

    // Mock the containerized managers
    mockKubernetesManager = new KubernetesAgentManager({ apiServer: 'http://localhost:8080', namespace: 'default' }) as jest.Mocked<KubernetesAgentManager>;
    mockDockerManager = new DockerAgentManager({ socketPath: '/var/run/docker.sock', imagePrefix: 'test' }) as jest.Mocked<DockerAgentManager>;

    // Create context manager
    contextManager = new ContextManager({
      enableContainerizedAgents: true,
      kubernetes: { apiServer: 'http://localhost:8080', namespace: 'default' },
      docker: { socketPath: '/var/run/docker.sock', imagePrefix: 'test' },
      contexts: {
        vm: { nodeVersion: '18', modulePaths: [], memoryLimit: 1024, cpuLimit: 1 },
        server: { 
          port: 3000, 
          host: 'localhost', 
          websocket: { port: 8080, heartbeatInterval: 1000, maxConnections: 100 }, 
          agentRegistry: { port: 8081, discoveryInterval: 5000, maxAgents: 50 } 
        },
        browser: { 
          compatibility: { minChrome: '90', minFirefox: '88', minSafari: '14', minEdge: '90' }, 
          webgl: { version: '2.0', shaderPrecision: 'highp', maxTextureSize: 4096 }, 
          visualization: { 
            defaultRenderer: 'three', 
            animation: { enabled: true, duration: 1000, easing: 'ease-in-out' },
            export: { formats: ['png', 'svg'], defaultFormat: 'png', quality: 0.9 }
          } 
        },
        worker: { 
          workerType: 'web', 
          poolSize: 4, 
          messageQueue: { 
            size: 1000, 
            timeout: 5000, 
            retryAttempts: 3
          } 
        },
        network: { 
          networkType: 'p2p', 
          p2p: { 
            discoveryInterval: 10000, 
            maxPeers: 50, 
            bootstrapNodes: [] 
          }, 
          webrtc: { 
            stunServers: [], 
            turnServers: [], 
            iceTimeout: 30000
          },
          consensus: {
            algorithm: 'geometric',
            threshold: 0.75,
            timeout: 30000
          }
        }
      },
      crossContextCommunication: { 
        enabled: true,
        messageRouting: { algorithm: 'geometric', maxHops: 5, timeout: 10000 },
        identityPropagation: { enabled: true, interval: 5000, validationRequired: true }
      },
      resourceManagement: { 
        memory: { limit: 1024, gcInterval: 30000, monitoring: true },
        cpu: { limit: 100, monitoring: true, loadBalancing: true },
        network: { bandwidthLimit: 1000, connectionLimit: 100, monitoring: true }
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with configuration', async () => {
      await contextManager.initialize();
      expect(contextManager).toBeDefined();
    });

    test('should start with empty contexts and agents', () => {
      expect(contextManager.getAllContextStates().size).toBe(0);
      expect(contextManager.getContainerizedAgents()).toHaveLength(0);
    });

    test('should set up event handlers', () => {
      const eventSpy = jest.spyOn(contextManager, 'emit');
      contextManager.emit('test-event');
      expect(eventSpy).toHaveBeenCalledWith('test-event');
    });
  });

  describe('Context Management', () => {
    test('should get context by type', () => {
      const vmContext = contextManager.getContext('vm');
      expect(vmContext).toBeDefined();
    });

    test('should get context state', () => {
      const contextState = contextManager.getContextState('vm');
      expect(contextState).toBeDefined();
    });

    test('should get all context states', () => {
      const allStates = contextManager.getAllContextStates();
      expect(allStates).toBeInstanceOf(Map);
    });

    test('should handle multiple context types', () => {
      const vmContext = contextManager.getContext('vm');
      const serverContext = contextManager.getContext('server');
      const browserContext = contextManager.getContext('browser');
      const workerContext = contextManager.getContext('worker');
      const networkContext = contextManager.getContext('network');

      expect(vmContext).toBeDefined();
      expect(serverContext).toBeDefined();
      expect(browserContext).toBeDefined();
      expect(workerContext).toBeDefined();
      expect(networkContext).toBeDefined();
    });
  });

  describe('Cross-Context Communication', () => {
    test('should send messages between contexts', () => {
      const message = {
        sourceContext: 'vm' as DimensionalContext,
        targetContext: 'server' as DimensionalContext,
        payload: {
          from: 'vm',
          to: 'server',
          content: 'test message'
        },
        type: 'data',
        ttl: 30000,
        priority: 'normal' as const
      };

      expect(() => contextManager.sendMessage(message)).not.toThrow();
    });

    test('should get message stream', () => {
      const messageStream = contextManager.getMessageStream();
      expect(messageStream).toBeDefined();
    });
  });

  describe('Containerized Agents', () => {
    test('should get containerized agents', () => {
      const agents = contextManager.getContainerizedAgents();
      expect(Array.isArray(agents)).toBe(true);
    });

    test('should get agents by context', () => {
      const vmAgents = contextManager.getAgentsByContext('vm');
      const serverAgents = contextManager.getAgentsByContext('server');
      
      expect(Array.isArray(vmAgents)).toBe(true);
      expect(Array.isArray(serverAgents)).toBe(true);
    });

    test('should get agents by type', () => {
      const testAgents = contextManager.getAgentsByType('test-agent');
      expect(Array.isArray(testAgents)).toBe(true);
    });

    test('should deploy agents', async () => {
      const agentSpecs = [
        {
          id: 'test-agent-1',
          name: 'Test Agent 1',
          type: 'test-agent',
          context: 'vm' as DimensionalContext,
          image: 'test-image:latest',
          replicas: 1
        }
      ];

      await expect(contextManager.deployAgents(agentSpecs)).resolves.not.toThrow();
    });

    test('should scale agents', async () => {
      await expect(contextManager.scaleAgents('test-agent', 3)).resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid context types gracefully', () => {
      expect(() => contextManager.getContext('invalid' as DimensionalContext)).not.toThrow();
    });

    test('should handle missing context states gracefully', () => {
      const state = contextManager.getContextState('vm');
      expect(state).toBeDefined();
    });
  });

  describe('Shutdown', () => {
    test('should shutdown gracefully', async () => {
      await expect(contextManager.shutdown()).resolves.not.toThrow();
    });
  });
});