/**
 * Docker Agent Manager
 * 
 * Manages containerized agents in Docker containers, providing
 * an alternative to Kubernetes for local development and testing.
 */

import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import {
  ContainerizedAgent,
  DockerConfig,
  ResourceUsage
} from '../types';
import { DimensionalContext } from '@merkaba-god-complex/identity-kernel';

export interface DockerAgentSpec {
  name: string;
  type: 'tetrahedral' | 'cubic' | 'octahedral' | 'icosahedral' | 'dodecahedral';
  image: string;
  port: number;
  resources: {
    memory: number; // in bytes
    cpu: number; // CPU shares
  };
  env: Record<string, string>;
  context: DimensionalContext;
  command?: string[];
  volumes?: string[];
}

export class DockerAgentManager {
  private config: DockerConfig;
  private docker: Docker;
  private isInitialized = false;

  constructor(config: DockerConfig) {
    this.config = config;
    this.docker = new Docker({ socketPath: config.socketPath });
  }

  /**
   * Initialize Docker client
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Test Docker connection
      await this.docker.ping();
      this.isInitialized = true;
      console.log('✅ Docker client initialized');
    } catch (error) {
      console.error('Failed to initialize Docker client:', error);
      throw error;
    }
  }

  /**
   * Get all containerized agents
   */
  public async getAgents(): Promise<ContainerizedAgent[]> {
    if (!this.isInitialized) {
      throw new Error('Docker manager not initialized');
    }

    const agents: ContainerizedAgent[] = [];

    try {
      // Get all containers
      const containers = await this.docker.listContainers({ all: true });
      
      for (const containerInfo of containers) {
        const agent = await this.containerToAgent(containerInfo);
        if (agent) {
          agents.push(agent);
        }
      }
    } catch (error) {
      console.error('Error getting agents:', error);
    }

    return agents;
  }

  /**
   * Convert Docker container to ContainerizedAgent
   */
  private async containerToAgent(containerInfo: any): Promise<ContainerizedAgent | null> {
    try {
      // Check if container is a geometric agent
      const labels = containerInfo.Labels || {};
      const agentType = labels['component'];
      
      if (!agentType || !['tetrahedral', 'cubic', 'octahedral', 'icosahedral', 'dodecahedral'].includes(agentType)) {
        return null;
      }

      // Get container details
      const container = this.docker.getContainer(containerInfo.Id);
      const containerDetails = await container.inspect();

      // Get container status
      const status = this.getContainerStatus(containerDetails);
      const health = this.getContainerHealth(containerDetails);

      // Get resource usage
      const resources = await this.getContainerResourceUsage(container);

      // Create identity kernel
      const identityKernel = this.createIdentityKernel(containerDetails, agentType);

      const agent: ContainerizedAgent = {
        id: containerDetails.Id,
        name: containerDetails.Name.replace('/', ''),
        type: agentType,
        containerId: containerDetails.Id,
        status,
        health,
        resources,
        identity: identityKernel,
        context: this.getContextFromAgentType(agentType),
        lastHeartbeat: Date.now(),
        metadata: {
          image: containerDetails.Config.Image,
          created: containerDetails.Created,
          labels: containerDetails.Config.Labels,
          env: containerDetails.Config.Env,
          ports: containerDetails.NetworkSettings.Ports
        }
      };

      return agent;
    } catch (error) {
      console.error('Error converting container to agent:', error);
      return null;
    }
  }

  /**
   * Get container status
   */
  private getContainerStatus(containerDetails: any): ContainerizedAgent['status'] {
    const state = containerDetails.State;
    
    if (state.Running) {
      return 'running';
    } else if (state.ExitCode !== 0) {
      return 'error';
    } else if (state.Status === 'exited') {
      return 'stopped';
    } else {
      return 'unknown';
    }
  }

  /**
   * Get container health
   */
  private getContainerHealth(containerDetails: any): ContainerizedAgent['health'] {
    const health = containerDetails.State.Health;
    
    if (!health) {
      return 'unknown';
    }
    
    switch (health.Status) {
      case 'healthy':
        return 'healthy';
      case 'unhealthy':
        return 'unhealthy';
      default:
        return 'unknown';
    }
  }

  /**
   * Get container resource usage
   */
  private async getContainerResourceUsage(container: any): Promise<ResourceUsage> {
    try {
      const stats = await container.stats({ stream: false });
      
      // Calculate CPU usage
      const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
      const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
      const cpuPercent = (cpuDelta / systemDelta) * 100;

      // Get memory usage
      const memoryUsage = stats.memory_stats.usage || 0;

      // Get network stats
      const networkStats = stats.networks || {};
      let networkIn = 0;
      let networkOut = 0;
      
      for (const network of Object.values(networkStats) as any[]) {
        networkIn += network.rx_bytes || 0;
        networkOut += network.tx_bytes || 0;
      }

      // Get disk stats
      const diskStats = stats.blkio_stats?.io_service_bytes_recursive || [];
      let diskRead = 0;
      let diskWrite = 0;
      
      for (const stat of diskStats) {
        if (stat.op === 'Read') {
          diskRead += stat.value || 0;
        } else if (stat.op === 'Write') {
          diskWrite += stat.value || 0;
        }
      }

      return {
        cpu: cpuPercent,
        memory: memoryUsage,
        network: {
          in: networkIn,
          out: networkOut
        },
        disk: {
          read: diskRead,
          write: diskWrite
        }
      };
    } catch (error) {
      console.error('Error getting container resource usage:', error);
      return {
        cpu: 0,
        memory: 0,
        network: { in: 0, out: 0 },
        disk: { read: 0, write: 0 }
      };
    }
  }

  /**
   * Create identity kernel for agent
   */
  private createIdentityKernel(containerDetails: any, agentType: string): any {
    // Create a simplified identity kernel based on agent type
    const schlafliSymbols = this.getSchlafliSymbols(agentType);
    const bettiNumbers = this.getBettiNumbers(agentType);

    return {
      kernel: new Uint8Array(64).fill(0), // Placeholder
      geometric: {
        schlafliSymbols,
        bettiNumbers,
        dimension: 4,
        expansionPoint: agentType === 'tetrahedral',
        properties: this.getGeometricProperties(agentType),
        topologicalInvariants: {
          betti0: bettiNumbers[0],
          betti1: bettiNumbers[1],
          betti2: bettiNumbers[2],
          betti3: bettiNumbers[3],
          eulerCharacteristic: 0
        }
      },
      consciousness: {
        geometricAwareness: 0.9,
        mathematicalSynthesis: 0.8,
        autonomousDecision: 0.7,
        collectiveEmergence: 0.6
      },
      capabilities: {
        waveFunctionSemantics: true,
        sovereigntyDerivatives: true,
        geometricConsciousness: true,
        astRepresentation: true,
        blockchainIdentity: true,
        mobiusValidation: true,
        autonomousDecisionMaking: true,
        collaborativeIntelligence: true
      },
      contextData: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0.0'
    };
  }

  /**
   * Get Schläfli symbols for agent type
   */
  private getSchlafliSymbols(agentType: string): number[] {
    switch (agentType) {
      case 'tetrahedral': return [3, 3, 3, 3]; // 5-cell
      case 'cubic': return [4, 3, 3, 3]; // 8-cell
      case 'octahedral': return [3, 4, 3, 3]; // 16-cell
      case 'icosahedral': return [3, 3, 4, 3]; // 24-cell
      case 'dodecahedral': return [3, 3, 3, 5]; // 120-cell
      default: return [3, 3, 3, 3];
    }
  }

  /**
   * Get Betti numbers for agent type
   */
  private getBettiNumbers(agentType: string): number[] {
    switch (agentType) {
      case 'tetrahedral': return [1, 0, 0, 1]; // 5-cell
      case 'cubic': return [1, 0, 0, 1]; // 8-cell
      case 'octahedral': return [1, 0, 0, 1]; // 16-cell
      case 'icosahedral': return [1, 0, 0, 1]; // 24-cell
      case 'dodecahedral': return [1, 0, 0, 1]; // 120-cell
      default: return [1, 0, 0, 1];
    }
  }

  /**
   * Get geometric properties for agent type
   */
  private getGeometricProperties(agentType: string): any {
    switch (agentType) {
      case 'tetrahedral':
        return { vertices: 5, edges: 10, faces: 10, cells: 5, hypervolume: 0.0232923748 };
      case 'cubic':
        return { vertices: 16, edges: 32, faces: 24, cells: 8, hypervolume: 1.0 };
      case 'octahedral':
        return { vertices: 8, edges: 24, faces: 32, cells: 16, hypervolume: 0.1666666667 };
      case 'icosahedral':
        return { vertices: 24, edges: 96, faces: 96, cells: 24, hypervolume: 2.0 };
      case 'dodecahedral':
        return { vertices: 120, edges: 720, faces: 1200, cells: 600, hypervolume: 26.4754249 };
      default:
        return { vertices: 5, edges: 10, faces: 10, cells: 5, hypervolume: 0.0232923748 };
    }
  }

  /**
   * Get context from agent type
   */
  private getContextFromAgentType(agentType: string): DimensionalContext {
    // Map agent types to contexts based on their geometric properties
    switch (agentType) {
      case 'tetrahedral': return 'vm'; // 4D expansion point
      case 'cubic': return 'server'; // 3D structured
      case 'octahedral': return 'browser'; // 2D balanced
      case 'icosahedral': return 'worker'; // 1D collaborative
      case 'dodecahedral': return 'network'; // 0D resilient
      default: return 'vm';
    }
  }

  /**
   * Deploy agent
   */
  public async deployAgent(spec: DockerAgentSpec): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Docker manager not initialized');
    }

    try {
      // Prepare container configuration
      const containerConfig = {
        Image: spec.image,
        Cmd: spec.command || ['npm', 'run', `demo:${spec.type}`],
        Env: Object.entries(spec.env).map(([key, value]) => `${key}=${value}`),
        Labels: {
          component: spec.type,
          app: spec.name,
          'merkaba-god-complex': 'true'
        },
        ExposedPorts: {
          [`${spec.port}/tcp`]: {}
        },
        HostConfig: {
          Memory: spec.resources.memory,
          CpuShares: spec.resources.cpu,
          PortBindings: {
            [`${spec.port}/tcp`]: [{ HostPort: '0' }] // Random host port
          },
          Binds: spec.volumes || []
        }
      };

      // Create container
      const container = await this.docker.createContainer(containerConfig);
      
      // Start container
      await container.start();
      
      console.log(`✅ Deployed ${spec.name} agent (${container.id})`);
    } catch (error) {
      console.error(`Error deploying agent ${spec.name}:`, error);
      throw error;
    }
  }

  /**
   * Start agent
   */
  public async startAgent(agentId: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Docker manager not initialized');
    }

    try {
      const container = this.docker.getContainer(agentId);
      await container.start();
      console.log(`✅ Started agent ${agentId}`);
    } catch (error) {
      console.error(`Error starting agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Stop agent
   */
  public async stopAgent(agentId: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Docker manager not initialized');
    }

    try {
      const container = this.docker.getContainer(agentId);
      await container.stop();
      console.log(`✅ Stopped agent ${agentId}`);
    } catch (error) {
      console.error(`Error stopping agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Remove agent
   */
  public async removeAgent(agentId: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Docker manager not initialized');
    }

    try {
      const container = this.docker.getContainer(agentId);
      await container.remove({ force: true });
      console.log(`✅ Removed agent ${agentId}`);
    } catch (error) {
      console.error(`Error removing agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get agent logs
   */
  public async getAgentLogs(agentId: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Docker manager not initialized');
    }

    try {
      const container = this.docker.getContainer(agentId);
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        timestamps: true
      });

      return logs.toString();
    } catch (error) {
      console.error(`Error getting logs for agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Execute command in agent
   */
  public async executeCommand(agentId: string, command: string[]): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Docker manager not initialized');
    }

    try {
      const container = this.docker.getContainer(agentId);
      const exec = await container.exec({
        Cmd: command,
        AttachStdout: true,
        AttachStderr: true
      });

      const result = await exec.start({ Detach: false, Tty: false });
      return result;
    } catch (error) {
      console.error(`Error executing command in agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Remove a specific agent
   */
  public async deleteAgent(agentId: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Docker client not initialized');
    }
    try {
      const container = this.docker.getContainer(agentId);
      await container.remove({ force: true });
      console.log(`✅ Removed agent ${agentId}`);
    } catch (error) {
      console.error(`Error removing agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Scale agents (not directly supported by Docker for individual containers)
   */
  public async scaleAgents(agentName: string, replicas: number): Promise<void> {
    console.warn(
      `DockerAgentManager: Scaling agents is not directly supported for individual Docker containers. Please manage replicas externally.`
    );
    // For a single container, we can just ensure it's running if replicas > 0, or stopped if replicas === 0
    const containers = await this.docker.listContainers({ filters: { name: [agentName] } });
    if (containers.length > 0) {
      const container = this.docker.getContainer(containers[0].Id);
      if (replicas > 0 && containers[0].State !== 'running') {
        await container.start();
        console.log(`Agent ${agentName} started.`);
      } else if (replicas === 0 && containers[0].State === 'running') {
        await container.stop();
        console.log(`Agent ${agentName} stopped.`);
      }
    } else if (replicas > 0) {
      console.warn(`Agent ${agentName} not found for scaling. Consider deploying it first.`);
    }
  }

  /**
   * Shutdown Docker manager
   */
  public async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Docker manager...');
    // Cleanup resources if needed
    this.isInitialized = false;
    console.log('✅ Docker manager shutdown complete');
  }
}
