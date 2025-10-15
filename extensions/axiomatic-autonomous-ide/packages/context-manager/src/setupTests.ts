/**
 * Test Setup for Context Manager
 * 
 * Global test configuration and utilities
 */

// Mock console methods to avoid noise in tests
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress console.log in tests unless explicitly needed
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  // Restore original console
  Object.assign(console, originalConsole);
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidContext(): R;
      toBeValidAgent(): R;
    }
  }
}

// Custom matcher for context validation
expect.extend({
  toBeValidContext(received: any) {
    const pass = 
      received &&
      typeof received === 'object' &&
      typeof received.id === 'string' &&
      typeof received.type === 'string' &&
      ['4D_VM', '3D_SERVER', '2D_BROWSER', '1D_WORKER', '0D_NETWORK'].includes(received.type) &&
      typeof received.name === 'string' &&
      typeof received.status === 'string' &&
      ['initializing', 'active', 'paused', 'error', 'disconnected'].includes(received.status) &&
      typeof received.lastHeartbeat === 'string' &&
      received.identityKernel;

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid context`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid context`,
        pass: false,
      };
    }
  },

  toBeValidAgent(received: any) {
    const pass = 
      received &&
      typeof received === 'object' &&
      typeof received.id === 'string' &&
      typeof received.name === 'string' &&
      typeof received.type === 'string' &&
      typeof received.runtime === 'string' &&
      ['kubernetes', 'docker', 'nodejs', 'webworker', 'browser'].includes(received.runtime) &&
      typeof received.contextType === 'string' &&
      ['4D_VM', '3D_SERVER', '2D_BROWSER', '1D_WORKER', '0D_NETWORK'].includes(received.contextType) &&
      typeof received.status === 'string' &&
      ['pending', 'running', 'stopped', 'failed', 'scaling'].includes(received.status) &&
      received.identityKernel;

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid agent`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid agent`,
        pass: false,
      };
    }
  },
});

export {};
