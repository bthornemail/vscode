/**
 * MCP Agent Communication Package
 * 
 * Exports all MCP agent communication functionality for LLM agent-to-agent
 * communication with geometric message routing and autonomous coordination.
 */

// Core MCP classes
export { MCPClient } from './MCPClient';
export { MCPServer } from './MCPServer';
export { MCPTransport } from './MCPTransport';
export { MCPMessageRouter } from './MCPMessageRouter';
export { MCPGeometricManager } from './MCPGeometricManager';
export { MCPConsensusManager } from './MCPConsensusManager';

// Types and interfaces
export * from './types';

// Utility functions
export { createAgentIdentity } from './utils/agent-identity';
export { validateGeometricMessage } from './utils/geometric-validation';
export { calculateGeometricDistance } from './utils/geometric-math';
export { generateGroupId } from './utils/group-utils';

// Constants
export * from './constants';

// Version information
export const VERSION = '1.0.0';
export const PACKAGE_NAME = '@merkaba-god-complex/mcp-agent-communication';