/**
 * DockerAgentManager Test Suite
 * 
 * Tests for Docker agent management functionality
 */

import Docker from 'dockerode';
import { DockerAgentManager } from './DockerAgentManager';
import { ContainerizedAgent, DockerConfig, AgentSpec } from '../types';
import { DimensionalContext } from '@merkaba-god-complex/identity-kernel';

// Mock Dockerode
const mockContainer = {
  id: 'mock-container-id',
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn().mockResolvedValue(undefined),
  logs: jest.fn(() => ({
    pipe: jest.fn(),
  })),
  exec: jest.fn(() => ({
    start: jest.fn().mockResolvedValue(undefined),
    resize: jest.fn(),
    demuxStream: jest.fn(),
  })),
};

const mockDocker = {
  ping: jest.fn().mockResolvedValue('OK'),
  listContainers: jest.fn().mockResolvedValue([]),
  createContainer: jest.fn().mockResolvedValue(mockContainer),
  getContainer: jest.fn().mockReturnValue(mockContainer),
};

jest.mock('dockerode', () => {
  return jest.fn(() => mockDocker);
});

describe('DockerAgentManager', () => {
  let dockerManager: DockerAgentManager;
  let mockDockerInstance: jest.Mocked<Docker>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDockerInstance = new (require('dockerode'))() as jest.Mocked<Docker>;
    mockDockerInstance.ping.mockResolvedValue('OK');
    mockDockerInstance.listContainers.mockResolvedValue([]);
    mockDockerInstance.createContainer.mockResolvedValue(mockContainer as any);
    mockDockerInstance.getContainer.mockReturnValue(mockContainer as any);

    dockerManager = new DockerAgentManager({ socketPath: '/var/run/docker.sock', imagePrefix: 'test' });
  });

  describe('Initialization', () => {
    test('should initialize Docker client', async () => {
      await dockerManager.initialize();
      expect(mockDockerInstance.ping).toHaveBeenCalled();
    });

    test('should handle initialization errors', async () => {
      mockDockerInstance.ping.mockRejectedValue(new Error('Docker connection failed'));

      await expect(dockerManager.initialize()).rejects.toThrow('Docker connection failed');
    });
  });

  describe('Agent Discovery', () => {
    test('should get all containerized agents', async () => {
      mockDockerInstance.listContainers.mockResolvedValue([
        {
          Id: 'container1',
          Names: ['/test-tetrahedral-agent'],
          Image: 'test-image',
          State: 'running',
          Labels: {
            'merkaba.agent.type': 'tetrahedral',
            'merkaba.agent.context': 'vm',
            'merkaba.agent.port': '8080',
          },
          Created: Date.now() / 1000,
        },
        {
          Id: 'container2',
          Names: ['/test-cubic-agent'],
          Image: 'test-image',
          State: 'running',
          Labels: {
            'merkaba.agent.type': 'cubic',
            'merkaba.agent.context': 'server',
            'merkaba.agent.port': '8081',
          },
          Created: Date.now() / 1000,
        },
      ] as any[]);

      const agents = await dockerManager.getAgents();

      expect(agents).toHaveLength(2);
      expect(agents[0].type).toBe('tetrahedral');
      expect(agents[1].type).toBe('cubic');
    });

    test('should filter out non-geometric containers', async () => {
      mockDockerInstance.listContainers.mockResolvedValue([
        {
          Id: 'container1',
          Names: ['/test-tetrahedral-agent'],
          Image: 'test-image',
          State: 'running',
          Labels: {
            'merkaba.agent.type': 'tetrahedral',
            'merkaba.agent.context': 'vm',
            'merkaba.agent.port': '8080',
          },
          Created: Date.now() / 1000,
        },
        {
          Id: 'container3',
          Names: ['/non-agent-container'],
          Image: 'ubuntu',
          State: 'running',
          Labels: {}, // No merkaba labels
          Created: Date.now() / 1000,
        },
      ] as any[]);

      const agents = await dockerManager.getAgents();

      expect(agents).toHaveLength(1);
      expect(agents[0].type).toBe('tetrahedral');
    });
  });

  describe('Agent Deployment', () => {
    const mockAgentSpec: AgentSpec = {
      name: 'deploy-test-agent',
      type: 'tetrahedral' as const,
      image: 'test-image:latest',
      replicas: 1,
      context: 'docker',
      port: 8080,
      env: { TEST_ENV: 'true' },
      resources: {
        requests: { cpu: '100m', memory: '128Mi' },
        limits: { cpu: '200m', memory: '256Mi' },
      },
    };

    test('should deploy agent successfully', async () => {
      const mockContainer = {
        id: 'new-container-id',
        start: jest.fn().mockResolvedValue(undefined),
      };
      mockDockerInstance.createContainer.mockResolvedValue(mockContainer as any);

      await dockerManager.deployAgent(mockAgentSpec);

      expect(mockDockerInstance.createContainer).toHaveBeenCalledWith(
        expect.objectContaining({
          Image: mockAgentSpec.image,
          name: mockAgentSpec.name,
          Env: ['TEST_ENV=true'],
          Labels: expect.objectContaining({
            'merkaba.agent.name': mockAgentSpec.name,
            'merkaba.agent.type': mockAgentSpec.type,
            'merkaba.agent.context': mockAgentSpec.context,
            'merkaba.agent.port': mockAgentSpec.port?.toString() || '',
          }),
        })
      );
      expect(mockContainer.start).toHaveBeenCalled();
    });

    test('should handle deployment errors', async () => {
      mockDockerInstance.createContainer.mockRejectedValue(new Error('Container creation failed'));

      await expect(dockerManager.deployAgent(mockAgentSpec)).rejects.toThrow('Container creation failed');
    });
  });

  describe('Agent Management', () => {
    const agentId = 'mock-agent-id';

    test('should start agent', async () => {
      await dockerManager.startAgent(agentId);
      expect(mockDockerInstance.getContainer(agentId).start).toHaveBeenCalled();
    });

    test('should stop agent', async () => {
      await dockerManager.stopAgent(agentId);
      expect(mockDockerInstance.getContainer(agentId).stop).toHaveBeenCalled();
    });

    test('should remove agent', async () => {
      await dockerManager.deleteAgent(agentId);
      expect(mockDockerInstance.getContainer(agentId).remove).toHaveBeenCalledWith({ force: true });
    });

    test('should scale agents (not supported by Docker, logs warning)', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      await dockerManager.scaleAgents(agentId, 3);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        `DockerAgentManager: Scaling agents is not directly supported for individual Docker containers. Please manage replicas externally.`
      );
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Agent Operations', () => {
    const agentId = 'mock-agent-id';

    test('should get agent logs', async () => {
      const mockLogsStream = { pipe: jest.fn() };
      (mockDockerInstance.getContainer(agentId).logs as jest.Mock).mockReturnValue(mockLogsStream);

      const logsStream = await dockerManager.getAgentLogs(agentId);
      expect(mockDockerInstance.getContainer(agentId).logs).toHaveBeenCalledWith({
        stdout: true,
        stderr: true,
        timestamps: true,
      });
      expect(logsStream).toBe(mockLogsStream);
    });

    test('should execute command in agent', async () => {
      const mockExec = {
        start: jest.fn().mockResolvedValue(undefined),
        resize: jest.fn(),
        demuxStream: jest.fn(),
      };
      (mockDockerInstance.getContainer(agentId).exec as jest.Mock).mockResolvedValue(mockExec);

      const command = ['echo', 'hello'];
      const result = await dockerManager.executeCommand(agentId, command);

      expect(mockDockerInstance.getContainer(agentId).exec).toHaveBeenCalledWith({
        Cmd: command,
        AttachStdout: true,
        AttachStderr: true,
      });
      expect(mockExec.start).toHaveBeenCalled();
      expect(result).toEqual({ stdout: '', stderr: '' }); // Mocks don't return actual output
    });
  });
});