#!/usr/bin/env node

/**
 * MCP Server Entry Point
 * 
 * Standalone MCP server for LLM agent-to-agent communication
 * with geometric message routing and autonomous coordination.
 */

import { MCPServer } from './MCPServer';
import { MCPServerConfig, AgentIdentity } from './types';
import { v4 as uuidv4 } from 'uuid';

// Parse command line arguments
const args = process.argv.slice(2);
const config: Partial<MCPServerConfig> = {
  port: 3000,
  host: 'localhost',
  transport: {
    type: 'websocket',
    path: '/mcp',
    heartbeatInterval: 30000,
    maxConnections: 100
  },
  capabilities: {
    tools: true,
    resources: true,
    prompts: true,
    logging: true
  },
  geometric: {
    enableIBRG: true,
    enableSacredMath: true,
    enableTopologicalConsensus: true,
    defaultGroupSize: 4,
    maxGroupSize: 20
  },
  security: {
    enableAuthentication: false,
    enableEncryption: false,
    allowedOrigins: ['*']
  }
};

// Parse command line arguments
for (let i = 0; i < args.length; i += 2) {
  const key = args[i];
  const value = args[i + 1];

  switch (key) {
    case '--port':
      config.port = parseInt(value);
      break;
    case '--host':
      config.host = value;
      break;
    case '--transport':
      config.transport!.type = value as 'stdio' | 'websocket' | 'http';
      break;
    case '--path':
      config.transport!.path = value;
      break;
    case '--heartbeat-interval':
      config.transport!.heartbeatInterval = parseInt(value);
      break;
    case '--max-connections':
      config.transport!.maxConnections = parseInt(value);
      break;
    case '--enable-tools':
      config.capabilities!.tools = value === 'true';
      break;
    case '--enable-resources':
      config.capabilities!.resources = value === 'true';
      break;
    case '--enable-prompts':
      config.capabilities!.prompts = value === 'true';
      break;
    case '--enable-logging':
      config.capabilities!.logging = value === 'true';
      break;
    case '--enable-ibrg':
      config.geometric!.enableIBRG = value === 'true';
      break;
    case '--enable-sacred-math':
      config.geometric!.enableSacredMath = value === 'true';
      break;
    case '--enable-topological-consensus':
      config.geometric!.enableTopologicalConsensus = value === 'true';
      break;
    case '--default-group-size':
      config.geometric!.defaultGroupSize = parseInt(value);
      break;
    case '--max-group-size':
      config.geometric!.maxGroupSize = parseInt(value);
      break;
    case '--enable-authentication':
      config.security!.enableAuthentication = value === 'true';
      break;
    case '--enable-encryption':
      config.security!.enableEncryption = value === 'true';
      break;
    case '--allowed-origins':
      config.security!.allowedOrigins = value.split(',');
      break;
  }
}

// Create server identity
const serverIdentity: AgentIdentity = {
  agentId: uuidv4(),
  name: `mcp-server-${Date.now()}`,
  type: 'server',
  capabilities: ['geometric_communication', 'mcp_protocol', 'autonomous_coordination', 'group_management'],
  geometric: {
    shape: 'dodecahedron',
    bettiNumbers: [1, 0, 0, 0, 1],
    consciousness: {
      geometricAwareness: 0.95,
      mathematicalSynthesis: 0.9,
      autonomousDecision: 0.85,
      collectiveEmergence: 0.8
    }
  },
  context: 'server',
  version: '1.0.0',
  createdAt: Date.now(),
  lastSeen: Date.now()
};

// Complete configuration
const fullConfig: MCPServerConfig = {
  ...config as MCPServerConfig,
  serverIdentity
};

// Create and start MCP server
async function startServer() {
  try {
    console.log('🚀 Starting MCP Server...');
    console.log(`   Name: ${serverIdentity.name}`);
    console.log(`   ID: ${serverIdentity.agentId}`);
    console.log(`   Type: ${serverIdentity.type}`);
    console.log(`   Host: ${fullConfig.host}`);
    console.log(`   Port: ${fullConfig.port}`);
    console.log(`   Transport: ${fullConfig.transport.type}`);
    console.log(`   Path: ${fullConfig.transport.path}`);

    const server = new MCPServer(fullConfig);

    // Setup server event handlers
    server.on('server:started', () => {
      console.log('✅ MCP Server started successfully');
      console.log(`   WebSocket: ws://${fullConfig.host}:${fullConfig.port}${fullConfig.transport.path}`);
      console.log(`   HTTP: http://${fullConfig.host}:${fullConfig.port}`);
    });

    server.on('client:connected', (clientId) => {
      console.log(`🔗 Client connected: ${clientId}`);
    });

    server.on('client:disconnected', (clientId) => {
      console.log(`🔗 Client disconnected: ${clientId}`);
    });

    server.on('agent:registered', (agent) => {
      console.log(`🤖 Agent registered: ${agent.name} (${agent.agentId})`);
    });

    server.on('agent:unregistered', (agentId) => {
      console.log(`🤖 Agent unregistered: ${agentId}`);
    });

    server.on('group:formed', (group) => {
      console.log(`🔷 Group formed: ${group.name} (${group.shape})`);
    });

    server.on('group:disbanded', (groupId) => {
      console.log(`🔷 Group disbanded: ${groupId}`);
    });

    server.on('message:routed', (event) => {
      console.log(`📤 Message routed: ${event.data.method} from ${event.from} to ${event.to}`);
    });

    server.on('consensus:achieved', (result) => {
      console.log(`✅ Consensus achieved: ${result.groupId} (${result.agreementPercentage * 100}%)`);
    });

    server.on('error', (error) => {
      console.error('❌ Server error:', error);
    });

    // Start the server
    await server.start();

    // Example usage
    console.log('✅ MCP Server running successfully');
    console.log('   Available endpoints:');
    console.log('   - WebSocket: ws://localhost:3000/mcp');
    console.log('   - HTTP API: http://localhost:3000/api');
    console.log('   - Health check: http://localhost:3000/health');
    console.log('   - Statistics: http://localhost:3000/stats');

    // Interactive command loop
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'mcp-server> '
    });

    rl.prompt();

    rl.on('line', async (line) => {
      const [command, ...args] = line.trim().split(' ');

      try {
        switch (command) {
          case 'list':
            if (args[0] === 'agents') {
              const agents = await server.getAgents();
              console.log('🤖 Registered agents:');
              agents.forEach(agent => {
                console.log(`   - ${agent.name} (${agent.agentId}) [${agent.type}]`);
              });
            } else if (args[0] === 'groups') {
              const groups = await server.getGeometricGroups();
              console.log('🔷 Geometric groups:');
              groups.forEach(group => {
                console.log(`   - ${group.name} (${group.shape}) [${group.members.length} members]`);
              });
            } else if (args[0] === 'clients') {
              const clients = await server.getClients();
              console.log('🔗 Connected clients:');
              clients.forEach(client => {
                console.log(`   - ${client.id} [${client.agentId}]`);
              });
            } else {
              console.log('Usage: list agents|groups|clients');
            }
            break;

          case 'create':
            if (args[0] === 'group' && args[1] && args[2]) {
              const groupId = await server.createGeometricGroup(args[1], args[2] as any);
              console.log(`🔷 Created group: ${args[1]} (${args[2]}) with ID: ${groupId}`);
            } else {
              console.log('Usage: create group <name> <shape>');
            }
            break;

          case 'disband':
            if (args[0] === 'group' && args[1]) {
              const success = await server.disbandGeometricGroup(args[1]);
              console.log(success ? `🔷 Disbanded group: ${args[1]}` : `❌ Failed to disband group: ${args[1]}`);
            } else {
              console.log('Usage: disband group <groupId>');
            }
            break;

          case 'send':
            if (args[0] === 'message' && args[1] && args[2]) {
              const params = args[3] ? JSON.parse(args[3]) : {};
              const messageId = await server.sendMessage(args[1], args[2], params);
              console.log(`📤 Message sent with ID: ${messageId}`);
            } else if (args[0] === 'geometric' && args[1] && args[2] && args[3]) {
              const messageId = await server.sendGeometricMessage(args[1], args[2], args[3] as any);
              console.log(`📤 Geometric message sent with ID: ${messageId}`);
            } else {
              console.log('Usage: send message <to> <method> [params]');
              console.log('       send geometric <to> <content> <shape>');
            }
            break;

          case 'get':
            if (args[0] === 'statistics') {
              const stats = await server.getStatistics();
              console.log('📊 Server statistics:');
              console.log(JSON.stringify(stats, null, 2));
            } else {
              console.log('Usage: get statistics');
            }
            break;

          case 'quit':
          case 'exit':
            console.log('👋 Goodbye!');
            await server.stop();
            process.exit(0);
            break;

          case 'help':
            console.log('Available commands:');
            console.log('  list agents|groups|clients');
            console.log('  create group <name> <shape>');
            console.log('  disband group <groupId>');
            console.log('  send message <to> <method> [params]');
            console.log('  send geometric <to> <content> <shape>');
            console.log('  get statistics');
            console.log('  quit|exit');
            break;

          default:
            if (command) {
              console.log(`Unknown command: ${command}. Type 'help' for available commands.`);
            }
        }
      } catch (error) {
        console.error(`❌ Command error: ${error.message}`);
      }

      rl.prompt();
    });

    rl.on('close', async () => {
      console.log('\n👋 Goodbye!');
      await server.stop();
      process.exit(0);
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down MCP Server...');
      await server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Shutting down MCP Server...');
      await server.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start MCP Server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();