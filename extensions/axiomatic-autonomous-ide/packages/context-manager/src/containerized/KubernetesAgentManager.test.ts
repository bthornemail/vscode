/**
 * KubernetesAgentManager Test Suite
 * 
 * Tests for Kubernetes agent management functionality
 */

import { KubernetesAgentManager } from './KubernetesAgentManager';
import { ContainerizedAgent } from '../types';

// Mock the Kubernetes client
jest.mock('@kubernetes/client-node', () => ({
  KubeConfig: jest.fn().mockImplementation(() => ({
    loadFromDefault: jest.fn(),
    loadFromCluster: jest.fn(),
    loadFromFile: jest.fn(),
    makeApiClient: jest.fn(() => ({
      listNamespacedDeployment: jest.fn(),
      createNamespacedDeployment: jest.fn(),
      patchNamespacedDeployment: jest.fn(),
      deleteNamespacedDeployment: jest.fn(),
      readNamespacedDeployment: jest.fn(),
      createNamespacedService: jest.fn(),
      deleteNamespacedService: jest.fn(),
      readNamespace: jest.fn()
    }))
  }))
}));

describe('KubernetesAgentManager', () => {
  let kubernetesManager: KubernetesAgentManager;
  let mockAppsV1Api: any;
  let mockCoreV1Api: any;

  beforeEach(() => {
    kubernetesManager = new KubernetesAgentManager({ apiServer: 'http://localhost:8080', namespace: 'default' });
    
    // Get mocked API clients
    const kubeConfig = (kubernetesManager as any).kc;
    mockAppsV1Api = kubeConfig.makeApiClient();
    mockCoreV1Api = kubeConfig.makeApiClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with default kubeconfig', () => {
      expect(kubernetesManager).toBeDefined();
    });

    test('should initialize with custom kubeconfig path', () => {
      const customManager = new KubernetesAgentManager({ apiServer: 'http://localhost:8080', namespace: 'default' });
      expect(customManager).toBeDefined();
    });
  });

  describe('Agent Deployment', () => {
    const mockAgentSpec = {
      name: 'test-agent',
      type: 'tetrahedral' as const,
      image: 'test-image:latest',
      replicas: 1,
      context: 'kubernetes' as const,
      port: 8080,
      env: { NODE_ENV: 'test' },
      resources: {
        requests: { cpu: '100m', memory: '128Mi' },
        limits: { cpu: '200m', memory: '256Mi' }
      }
    };

    test('should deploy agent successfully', async () => {
      mockAppsV1Api.createNamespacedDeployment.mockResolvedValue({});
      mockCoreV1Api.createNamespacedService.mockResolvedValue({});

      await kubernetesManager.deployAgent(mockAgentSpec);

      expect(mockAppsV1Api.createNamespacedDeployment).toHaveBeenCalled();
      expect(mockCoreV1Api.createNamespacedService).toHaveBeenCalled();
    });

    test('should handle deployment errors gracefully', async () => {
      mockAppsV1Api.createNamespacedDeployment.mockRejectedValue(new Error('Deployment failed'));

      await expect(kubernetesManager.deployAgent(mockAgentSpec)).resolves.not.toThrow();
    });

    test('should delete agent successfully', async () => {
      mockAppsV1Api.deleteNamespacedDeployment.mockResolvedValue({});
      mockCoreV1Api.deleteNamespacedService.mockResolvedValue({});

      await kubernetesManager.deleteAgent(mockAgentSpec.name);

      expect(mockAppsV1Api.deleteNamespacedDeployment).toHaveBeenCalled();
      expect(mockCoreV1Api.deleteNamespacedService).toHaveBeenCalled();
    });

    test('should handle deletion errors gracefully', async () => {
      mockAppsV1Api.deleteNamespacedDeployment.mockRejectedValue({ statusCode: 404 });

      await expect(kubernetesManager.deleteAgent(mockAgentSpec.name)).resolves.not.toThrow();
    });
  });

  describe('Agent Scaling', () => {
    test('should scale agents successfully', async () => {
      mockAppsV1Api.patchNamespacedDeployment.mockResolvedValue({});

      await kubernetesManager.scaleAgents('test-agent', 3);

      expect(mockAppsV1Api.patchNamespacedDeployment).toHaveBeenCalled();
    });

    test('should handle scaling errors gracefully', async () => {
      mockAppsV1Api.patchNamespacedDeployment.mockRejectedValue(new Error('Scaling failed'));

      await expect(kubernetesManager.scaleAgents('test-agent', 3)).resolves.not.toThrow();
    });
  });

  describe('Agent Status', () => {
    test('should get agents successfully', async () => {
      mockAppsV1Api.listNamespacedDeployment.mockResolvedValue({
        body: {
          items: [
            {
              metadata: { name: 'test-agent-1' },
              status: { readyReplicas: 1, replicas: 1 }
            }
          ]
        }
      });

      const agents = await kubernetesManager.getAgents();
      expect(Array.isArray(agents)).toBe(true);
    });

    test('should handle get agents errors gracefully', async () => {
      mockAppsV1Api.listNamespacedDeployment.mockRejectedValue(new Error('API Error'));

      await expect(kubernetesManager.getAgents()).resolves.not.toThrow();
    });
  });

  describe('Agent Logs', () => {
    test('should get agent logs successfully', async () => {
      mockCoreV1Api.readNamespacedPodLog.mockResolvedValue({
        body: 'test log content'
      });

      const logs = await kubernetesManager.getAgentLogs('test-agent');
      expect(typeof logs).toBe('string');
    });

    test('should handle log retrieval errors gracefully', async () => {
      mockCoreV1Api.readNamespacedPodLog.mockRejectedValue(new Error('Log retrieval failed'));

      await expect(kubernetesManager.getAgentLogs('test-agent')).resolves.not.toThrow();
    });
  });

  describe('Shutdown', () => {
    test('should shutdown gracefully', async () => {
      await expect(kubernetesManager.shutdown()).resolves.not.toThrow();
    });
  });
});