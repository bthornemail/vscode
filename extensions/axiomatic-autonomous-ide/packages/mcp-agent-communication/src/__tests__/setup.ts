/**
 * Jest Test Setup
 * 
 * Global test setup and configuration for MCP Agent Communication tests.
 */

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock WebSocket for testing
global.WebSocket = jest.fn().mockImplementation(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1, // OPEN
}));

// Mock MQTT client for testing
jest.mock('mqtt', () => ({
  connect: jest.fn().mockReturnValue({
    on: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    publish: jest.fn(),
    end: jest.fn(),
    connected: true,
  }),
}));

// Mock Socket.IO for testing
jest.mock('socket.io', () => ({
  Server: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnectSockets: jest.fn(),
  })),
}));

// Mock simple-peer for testing
jest.mock('simple-peer', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    send: jest.fn(),
    signal: jest.fn(),
    destroy: jest.fn(),
    connected: true,
  }));
});

// Mock Express for testing
jest.mock('express', () => {
  const mockApp = {
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    listen: jest.fn(),
  };
  return jest.fn(() => mockApp);
});

// Mock HTTP server for testing
jest.mock('http', () => ({
  createServer: jest.fn().mockReturnValue({
    listen: jest.fn(),
    close: jest.fn(),
  }),
}));

// Mock readline for testing
jest.mock('readline', () => ({
  createInterface: jest.fn().mockReturnValue({
    prompt: jest.fn(),
    on: jest.fn(),
    close: jest.fn(),
  }),
}));

// Global test utilities
global.testUtils = {
  createMockAgent: (overrides = {}) => ({
    agentId: 'test-agent-id',
    name: 'test-agent',
    type: 'llm',
    capabilities: ['geometric_communication', 'mcp_protocol'],
    geometric: {
      shape: 'tetrahedron',
      bettiNumbers: [1, 0, 0, 1],
      consciousness: {
        geometricAwareness: 0.9,
        mathematicalSynthesis: 0.8,
        autonomousDecision: 0.7,
        collectiveEmergence: 0.6,
      },
    },
    context: 'vm',
    version: '1.0.0',
    createdAt: Date.now(),
    lastSeen: Date.now(),
    ...overrides,
  }),

  createMockGeometricGroup: (overrides = {}) => ({
    id: 'test-group-id',
    name: 'test-group',
    shape: 'tetrahedron',
    members: ['test-agent-1', 'test-agent-2'],
    consensusThreshold: 0.7,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }),

  createMockMessage: (overrides = {}) => ({
    id: 'test-message-id',
    method: 'test_method',
    params: {},
    timestamp: Date.now(),
    ...overrides,
  }),

  createMockGeometricMessage: (overrides = {}) => ({
    id: 'test-geometric-message-id',
    senderId: 'test-sender',
    receiverId: 'test-receiver',
    content: 'test content',
    shape: 'tetrahedron',
    timestamp: Date.now(),
    ...overrides,
  }),

  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  mockEventEmitter: () => ({
    on: jest.fn(),
    emit: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  }),
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

