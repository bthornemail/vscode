/**
 * Context Manager Core
 * 
 * Manages all 5 dimensional contexts with containerized agent support,
 * including Kubernetes and Docker integration.
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { Subject, Observable } from 'rxjs';
import {
  ContextManagerConfig,
  ContainerizedAgent,
  ContextState,
  CrossContextMessage,
  ContextManagerEvents,
  ResourceUsage
} from './types';
import { DimensionalContext } from '@merkaba-god-complex/identity-kernel';
import { VMContext } from './contexts/VMContext';
import { ServerContext } from './contexts/ServerContext';
import { BrowserContext } from './contexts/BrowserContext';
import { WorkerContext } from './contexts/WorkerContext';
import { NetworkContext } from './contexts/NetworkContext';
import { KubernetesAgentManager } from './containerized/KubernetesAgentManager';
import { DockerAgentManager } from './containerized/DockerAgentManager';

export class ContextManager extends EventEmitter {
  private config: ContextManagerConfig;
  private contexts!: {
    vm: VMContext;
    server: ServerContext;
    browser: BrowserContext;
    worker: WorkerContext;
    network: NetworkContext;
  };
  private contextStates: Map<DimensionalContext, ContextState> = new Map();
  private containerizedAgents: Map<string, ContainerizedAgent> = new Map();
  private kubernetesManager?: KubernetesAgentManager;
  private dockerManager?: DockerAgentManager;
  private messageSubject = new Subject<CrossContextMessage>();
  private isInitialized = false;

  constructor(config: Partial<ContextManagerConfig> = {}) {
    super();
    this.config = this.mergeConfig(config);
    this.initializeAllContexts();
  }

  /**
   * Initialize the context manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('🌌 Initializing Context Manager...');

    // Initialize containerized agent managers
    if (this.config.enableContainerizedAgents) {
      await this.initializeContainerizedAgents();
    }

    // Initialize all contexts
    await this.initializeAllContexts();

    // Start cross-context communication
    this.startCrossContextCommunication();

    // Start monitoring
    this.startMonitoring();

    this.isInitialized = true;
    console.log('✅ Context Manager initialized successfully');
  }


  /**
   * Initialize containerized agent managers
   */
  private async initializeContainerizedAgents(): Promise<void> {
    console.log('🐳 Initializing containerized agent managers...');

    if (this.config.kubernetes) {
      this.kubernetesManager = new KubernetesAgentManager(this.config.kubernetes);
      await this.kubernetesManager.initialize();
      console.log('☸️  Kubernetes agent manager initialized');
    }

    if (this.config.docker) {
      this.dockerManager = new DockerAgentManager(this.config.docker);
      await this.dockerManager.initialize();
      console.log('🐳 Docker agent manager initialized');
    }
  }

  /**
   * Initialize all contexts
   */
  private async initializeAllContexts(): Promise<void> {
    // Initialize context instances
    this.contexts = {
      vm: new VMContext(this.config.contexts.vm),
      server: new ServerContext(this.config.contexts.server),
      browser: new BrowserContext(this.config.contexts.browser),
      worker: new WorkerContext(this.config.contexts.worker),
      network: new NetworkContext(this.config.contexts.network)
    };

    // Initialize each context
    for (const [contextType, context] of Object.entries(this.contexts)) {
      await context.initialize();
    }
  }


  /**
   * Start cross-context communication
   */
  private startCrossContextCommunication(): void {
    if (!this.config.crossContextCommunication.enabled) {
      return;
    }

    console.log('📡 Starting cross-context communication...');

    // Subscribe to message routing
    this.messageSubject.subscribe(message => {
      this.routeMessage(message);
    });

    console.log('✅ Cross-context communication started');
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    console.log('📊 Starting monitoring...');

    // Monitor containerized agents
    if (this.config.enableContainerizedAgents) {
      setInterval(() => {
        this.monitorContainerizedAgents();
      }, 5000); // Every 5 seconds
    }

    // Monitor context states
    setInterval(() => {
      this.monitorContextStates();
    }, 10000); // Every 10 seconds

    console.log('✅ Monitoring started');
  }

  /**
   * Monitor containerized agents
   */
  private async monitorContainerizedAgents(): Promise<void> {
    if (!this.kubernetesManager && !this.dockerManager) {
      return;
    }

    try {
      // Get agents from Kubernetes
      if (this.kubernetesManager) {
        const k8sAgents = await this.kubernetesManager.getAgents();
        for (const agent of k8sAgents) {
          this.updateContainerizedAgent(agent);
        }
      }

      // Get agents from Docker
      if (this.dockerManager) {
        const dockerAgents = await this.dockerManager.getAgents();
        for (const agent of dockerAgents) {
          this.updateContainerizedAgent(agent);
        }
      }
    } catch (error) {
      console.error('Error monitoring containerized agents:', error);
    }
  }

  /**
   * Monitor context states
   */
  private async monitorContextStates(): Promise<void> {
    for (const [contextType, context] of Object.entries(this.contexts)) {
      try {
        const state = this.contextStates.get(contextType as DimensionalContext);
        if (!state) continue;

        // Update resource usage
        const resourceUsage = await context.getResourceUsage();
        state.resourceUsage = resourceUsage;
        state.lastUpdate = Date.now();

        // Check for resource limits
        this.checkResourceLimits(contextType as DimensionalContext, resourceUsage);

        this.contextStates.set(contextType as DimensionalContext, state);
      } catch (error) {
        console.error(`Error monitoring ${contextType} context:`, error);
      }
    }
  }

  /**
   * Check resource limits
   */
  private checkResourceLimits(contextType: DimensionalContext, resourceUsage: ResourceUsage): void {
    const config = this.config.resourceManagement;
    const contextConfig = this.config.contexts[contextType];

    // Check memory limit
    if (resourceUsage.memory > config.memory.limit) {
      this.emit('resource:limit', contextType, 'memory');
    }

    // Check CPU limit
    if (resourceUsage.cpu > config.cpu.limit) {
      this.emit('resource:limit', contextType, 'cpu');
    }
  }

  /**
   * Update containerized agent
   */
  private updateContainerizedAgent(agent: ContainerizedAgent): void {
    const existingAgent = this.containerizedAgents.get(agent.id);
    
    if (!existingAgent) {
      // New agent
      this.containerizedAgents.set(agent.id, agent);
      this.emit('agent:started', agent);
      
      // Update context state
      const state = this.contextStates.get(agent.context);
      if (state) {
        state.activeAgents.push(agent);
        this.contextStates.set(agent.context, state);
      }
    } else {
      // Update existing agent
      const updatedAgent = { ...existingAgent, ...agent };
      this.containerizedAgents.set(agent.id, updatedAgent);
      
      // Check for status changes
      if (existingAgent.status !== agent.status) {
        if (agent.status === 'stopped') {
          this.emit('agent:stopped', updatedAgent);
        } else if (agent.status === 'error') {
          this.emit('agent:error', updatedAgent, new Error('Agent error'));
        }
      }
    }
  }

  /**
   * Route cross-context message
   */
  private async routeMessage(message: CrossContextMessage): Promise<void> {
    try {
      const targetContext = this.contexts[message.targetContext];
      if (!targetContext) {
        console.error(`Target context not found: ${message.targetContext}`);
        return;
      }

      // For now, just emit the message since contexts don't have handleMessage method
      this.emit('message:routed', message);
    } catch (error) {
      console.error('Error routing message:', error);
    }
  }

  /**
   * Send cross-context message
   */
  public sendMessage(message: Omit<CrossContextMessage, 'id' | 'timestamp'>): void {
    const fullMessage: CrossContextMessage = {
      ...message,
      id: uuidv4(),
      timestamp: Date.now()
    };

    this.messageSubject.next(fullMessage);
  }

  /**
   * Get context
   */
  public getContext(contextType: DimensionalContext): any {
    return this.contexts[contextType];
  }

  /**
   * Get context state
   */
  public getContextState(contextType: DimensionalContext): ContextState | undefined {
    return this.contextStates.get(contextType);
  }

  /**
   * Get all context states
   */
  public getAllContextStates(): Map<DimensionalContext, ContextState> {
    return this.contextStates;
  }

  /**
   * Get containerized agents
   */
  public getContainerizedAgents(): ContainerizedAgent[] {
    return Array.from(this.containerizedAgents.values());
  }

  /**
   * Get agents by context
   */
  public getAgentsByContext(contextType: DimensionalContext): ContainerizedAgent[] {
    return this.getContainerizedAgents().filter(agent => agent.context === contextType);
  }

  /**
   * Get agents by type
   */
  public getAgentsByType(type: string): ContainerizedAgent[] {
    return this.getContainerizedAgents().filter(agent => agent.type === type);
  }

  /**
   * Deploy containerized agents
   */
  public async deployAgents(agentSpecs: any[]): Promise<void> {
    if (!this.config.enableContainerizedAgents) {
      throw new Error('Containerized agents not enabled');
    }

    console.log(`🚀 Deploying ${agentSpecs.length} containerized agents...`);

    for (const spec of agentSpecs) {
      try {
        if (this.kubernetesManager && spec.platform === 'kubernetes') {
          await this.kubernetesManager.deployAgent(spec);
        } else if (this.dockerManager && spec.platform === 'docker') {
          await this.dockerManager.deployAgent(spec);
        }
      } catch (error) {
        console.error(`Error deploying agent ${spec.name}:`, error);
      }
    }

    console.log('✅ Containerized agents deployed');
  }

  /**
   * Scale agents
   */
  public async scaleAgents(agentType: string, replicas: number): Promise<void> {
    if (!this.kubernetesManager) {
      throw new Error('Kubernetes manager not available');
    }

    await this.kubernetesManager.scaleAgents(agentType, replicas);
  }

  /**
   * Get message stream
   */
  public getMessageStream(): Observable<CrossContextMessage> {
    return this.messageSubject.asObservable();
  }

  /**
   * Shutdown context manager
   */
  public async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Context Manager...');

    // Shutdown all contexts
    for (const [contextType, context] of Object.entries(this.contexts)) {
      try {
        await context.shutdown();
        console.log(`✅ ${contextType} context shutdown`);
      } catch (error) {
        console.error(`Error shutting down ${contextType} context:`, error);
      }
    }

    // Shutdown containerized agent managers
    if (this.kubernetesManager) {
      await this.kubernetesManager.shutdown();
    }
    if (this.dockerManager) {
      await this.dockerManager.shutdown();
    }

    this.isInitialized = false;
    console.log('✅ Context Manager shutdown complete');
  }

  /**
   * Merge configuration
   */
  private mergeConfig(config: Partial<ContextManagerConfig>): ContextManagerConfig {
    const defaultConfig: ContextManagerConfig = {
      enableContainerizedAgents: true,
      contexts: {
        vm: {
          nodeVersion: '18.0.0',
          modulePaths: [],
          memoryLimit: 512 * 1024 * 1024, // 512MB
          cpuLimit: 1.0
        },
        server: {
          port: 3000,
          host: 'localhost',
          websocket: {
            port: 3001,
            heartbeatInterval: 30000,
            maxConnections: 1000
          },
          agentRegistry: {
            port: 3002,
            discoveryInterval: 10000,
            maxAgents: 100
          }
        },
        browser: {
          compatibility: {
            minChrome: '90',
            minFirefox: '88',
            minSafari: '14',
            minEdge: '90'
          },
          webgl: {
            version: '2.0',
            shaderPrecision: 'highp',
            maxTextureSize: 4096
          },
          visualization: {
            defaultRenderer: 'three',
            animation: {
              enabled: true,
              duration: 1000,
              easing: 'ease-in-out'
            },
            export: {
              formats: ['png', 'svg', 'pdf'],
              defaultFormat: 'png',
              quality: 0.9
            }
          }
        },
        worker: {
          workerType: 'web',
          poolSize: 4,
          messageQueue: {
            size: 1000,
            timeout: 30000,
            retryAttempts: 3
          }
        },
        network: {
          networkType: 'p2p',
          p2p: {
            bootstrapNodes: [],
            discoveryInterval: 30000,
            maxPeers: 50
          },
          webrtc: {
            stunServers: ['stun:stun.l.google.com:19302'],
            turnServers: [],
            iceTimeout: 10000
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
        messageRouting: {
          algorithm: 'geometric',
          maxHops: 3,
          timeout: 10000
        },
        identityPropagation: {
          enabled: true,
          interval: 5000,
          validationRequired: true
        }
      },
      resourceManagement: {
        memory: {
          limit: 1024 * 1024 * 1024, // 1GB
          gcInterval: 60000,
          monitoring: true
        },
        cpu: {
          limit: 2.0,
          monitoring: true,
          loadBalancing: true
        },
        network: {
          bandwidthLimit: 100 * 1024 * 1024, // 100MB/s
          connectionLimit: 1000,
          monitoring: true
        }
      }
    };

    return _.merge({}, defaultConfig, config);
  }
}
