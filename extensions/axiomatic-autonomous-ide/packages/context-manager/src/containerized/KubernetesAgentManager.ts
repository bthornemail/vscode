/**
 * Kubernetes Agent Manager
 * 
 * Manages containerized agents in Kubernetes clusters
 */

import { KubeConfig, CoreV1Api, AppsV1Api, NetworkingV1Api } from '@kubernetes/client-node';
import { ContainerizedAgent, AgentSpec, KubernetesConfig } from '../types';

export class KubernetesAgentManager {
  private config: KubernetesConfig;
  private kubeConfig: KubeConfig;
  private coreApi: CoreV1Api;
  private appsApi: AppsV1Api;
  private networkingApi: NetworkingV1Api;
  private isInitialized = false;

  constructor(config: KubernetesConfig) {
    this.config = config;
    this.kubeConfig = new KubeConfig();
    // Initialize APIs after kubeconfig is loaded
    this.coreApi = null as any;
    this.appsApi = null as any;
    this.networkingApi = null as any;
  }

  /**
   * Initialize Kubernetes client
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load kubeconfig
      this.kubeConfig.loadFromDefault();
      
      // Create API clients with configuration
      this.coreApi = this.kubeConfig.makeApiClient(CoreV1Api);
      this.appsApi = this.kubeConfig.makeApiClient(AppsV1Api);
      this.networkingApi = this.kubeConfig.makeApiClient(NetworkingV1Api);
      
      console.log('✅ Kubernetes client initialized');
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize Kubernetes client:', error);
      throw error;
    }
  }

  /**
   * Get all containerized agents from Kubernetes
   */
  public async getAgents(): Promise<ContainerizedAgent[]> {
    if (!this.isInitialized) {
      throw new Error('Kubernetes client not initialized');
    }

    try {
      const pods = await this.coreApi.listNamespacedPod(this.config.namespace);
      const agents: ContainerizedAgent[] = [];

      for (const pod of pods.items) {
        const labels = pod.metadata?.labels || {};
        
        // Check if this is a geometric agent
        if (labels['merkaba.agent.type'] && labels['merkaba.agent.context']) {
          const agent: ContainerizedAgent = {
            id: pod.metadata?.uid || '',
            name: labels['merkaba.agent.name'] || pod.metadata?.name || '',
            type: labels['merkaba.agent.type'] as any,
            image: pod.spec?.containers?.[0]?.image || '',
            context: labels['merkaba.agent.context'] as any,
            status: pod.status?.phase?.toLowerCase() as any || 'unknown',
            createdAt: new Date(pod.metadata?.creationTimestamp || '').getTime(),
            updatedAt: Date.now(),
            replicas: 1,
            port: parseInt(labels['merkaba.agent.port'] || '8080'),
            env: {},
            resources: {
              requests: { cpu: '100m', memory: '128Mi' },
              limits: { cpu: '200m', memory: '256Mi' }
            }
          };
          agents.push(agent);
        }
      }

      return agents;
    } catch (error) {
      console.error('Error getting agents from Kubernetes:', error);
      throw error;
    }
  }

  /**
   * Deploy an agent to Kubernetes
   */
  public async deployAgent(spec: AgentSpec): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Kubernetes client not initialized');
    }

    try {
      // Create deployment
      const deployment = {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
          name: `${spec.name}-deployment`,
          namespace: this.config.namespace,
          labels: {
            'app': spec.name,
            'merkaba.agent.name': spec.name,
            'merkaba.agent.type': spec.type,
            'merkaba.agent.context': spec.context
          }
        },
        spec: {
          replicas: spec.replicas,
          selector: {
            matchLabels: {
              'app': spec.name
            }
          },
          template: {
            metadata: {
              labels: {
                'app': spec.name,
                'merkaba.agent.name': spec.name,
                'merkaba.agent.type': spec.type,
                'merkaba.agent.context': spec.context,
                'merkaba.agent.port': spec.port.toString()
              }
            },
            spec: {
              containers: [{
                name: spec.name,
                image: spec.image,
                ports: [{
                  containerPort: spec.port
                }],
                env: Object.entries(spec.env || {}).map(([key, value]) => ({
                  name: key,
                  value: value
                })),
                resources: spec.resources
              }]
            }
          }
        }
      };

      await this.appsApi.createNamespacedDeployment(this.config.namespace, deployment);

      // Create service
      const service = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: `${spec.name}-service`,
          namespace: this.config.namespace,
          labels: {
            'app': spec.name
          }
        },
        spec: {
          selector: {
            'app': spec.name
          },
          ports: [{
            port: spec.port,
            targetPort: spec.port
          }],
          type: 'ClusterIP'
        }
      };

      await this.coreApi.createNamespacedService(this.config.namespace, service);

      console.log(`✅ Deployed ${spec.name} agent to Kubernetes`);
    } catch (error) {
      console.error(`Error deploying agent ${spec.name}:`, error);
      throw error;
    }
  }

  /**
   * Scale agents in Kubernetes
   */
  public async scaleAgents(agentName: string, replicas: number): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Kubernetes client not initialized');
    }

    try {
      const deploymentName = `${agentName}-deployment`;
      const deployment = await this.appsApi.readNamespacedDeployment(deploymentName, this.config.namespace);
      
      if (deployment.spec) {
        deployment.spec.replicas = replicas;
        await this.appsApi.replaceNamespacedDeployment(deploymentName, this.config.namespace, deployment);
        console.log(`✅ Scaled ${agentName} to ${replicas} replicas`);
      }
    } catch (error) {
      console.error(`Error scaling agent ${agentName}:`, error);
      throw error;
    }
  }

  /**
   * Delete an agent from Kubernetes
   */
  public async deleteAgent(agentName: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Kubernetes client not initialized');
    }

    try {
      // Delete deployment
      await this.appsApi.deleteNamespacedDeployment(`${agentName}-deployment`, this.config.namespace);
      
      // Delete service
      await this.coreApi.deleteNamespacedService(`${agentName}-service`, this.config.namespace);
      
      console.log(`✅ Deleted ${agentName} agent from Kubernetes`);
    } catch (error) {
      console.error(`Error deleting agent ${agentName}:`, error);
      throw error;
    }
  }

  /**
   * Get agent logs from Kubernetes
   */
  public async getAgentLogs(agentName: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Kubernetes client not initialized');
    }

    try {
      // Find the pod for this agent
      const pods = await this.coreApi.listNamespacedPod(
        this.config.namespace,
        undefined,
        undefined,
        undefined,
        undefined,
        `app=${agentName}`
      );

      if (pods.items.length === 0) {
        throw new Error(`No pods found for agent ${agentName}`);
      }

      const pod = pods.items[0];
      const container = pod.spec?.containers?.[0];
      
      if (!container) {
        throw new Error(`No containers found in pod ${pod.metadata?.name}`);
      }

      const logs = await this.coreApi.readNamespacedPodLog(
        pod.metadata?.name || '',
        this.config.namespace,
        container.name
      );

      return logs;
    } catch (error) {
      console.error(`Error getting logs for agent ${agentName}:`, error);
      throw error;
    }
  }

  /**
   * Get resource usage for an agent
   */
  public async getAgentResourceUsage(agentName: string): Promise<{ cpu: number; memory: number }> {
    if (!this.isInitialized) {
      throw new Error('Kubernetes client not initialized');
    }

    try {
      // This would require metrics server to be installed
      // For now, return placeholder values
      return {
        cpu: Math.random() * 100,
        memory: Math.random() * 1000
      };
    } catch (error) {
      console.error(`Error getting resource usage for agent ${agentName}:`, error);
      throw error;
    }
  }

  /**
   * Shutdown the Kubernetes client
   */
  public async shutdown(): Promise<void> {
    this.isInitialized = false;
    console.log('✅ Kubernetes client shutdown');
  }
}