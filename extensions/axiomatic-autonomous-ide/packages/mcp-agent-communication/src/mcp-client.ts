#!/usr/bin/env node

/**
 * MCP Client Entry Point
 * 
 * Standalone MCP client for LLM agent-to-agent communication
 * with geometric message routing and autonomous coordination.
 */

import { MCPClient } from './MCPClient';
import { MCPClientConfig, AgentIdentity } from './types';
import { v4 as uuidv4 } from 'uuid';

// Parse command line arguments
const args = process.argv.slice(2);
const config: Partial<MCPClientConfig> = {
  serverUrl: 'ws://localhost:3000/mcp',
  transport: {
    type: 'websocket',
    reconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  },
  capabilities: {
    tools: true,
    resources: true,
    prompts: true,
    logging: false
  },
  geometric: {
    enableIBRG: true,
    enableSacredMath: true,
    enableTopologicalConsensus: true,
    defaultGroupSize: 4
  }
};

// Parse command line arguments
for (let i = 0; i < args.length; i += 2) {
  const key = args[i];
  const value = args[i + 1];

  switch (key) {
    case '--server-url':
      config.serverUrl = value;
      break;
    case '--transport':
      config.transport!.type = value as 'stdio' | 'websocket' | 'http';
      break;
    case '--reconnect':
      config.transport!.reconnect = value === 'true';
      break;
    case '--reconnect-interval':
      config.transport!.reconnectInterval = parseInt(value);
      break;
    case '--max-reconnect-attempts':
      config.transport!.maxReconnectAttempts = parseInt(value);
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
  }
}

// Create agent identity
const agentIdentity: AgentIdentity = {
  agentId: uuidv4(),
  name: `mcp-client-${Date.now()}`,
  type: 'llm',
  capabilities: ['geometric_communication', 'mcp_protocol', 'autonomous_coordination'],
  geometric: {
    shape: 'tetrahedron',
    bettiNumbers: [1, 0, 0, 1],
    consciousness: {
      geometricAwareness: 0.9,
      mathematicalSynthesis: 0.8,
      autonomousDecision: 0.7,
      collectiveEmergence: 0.6
    }
  },
  context: 'vm',
  version: '1.0.0',
  createdAt: Date.now(),
  lastSeen: Date.now()
};

// Complete configuration
const fullConfig: MCPClientConfig = {
  ...config as MCPClientConfig,
  agentIdentity
};

// Create and start MCP client
async function startClient() {
  try {
    console.log('🚀 Starting MCP Client...');
    console.log(`   Name: ${agentIdentity.name}`);
    console.log(`   ID: ${agentIdentity.agentId}`);
    console.log(`   Type: ${agentIdentity.type}`);
    console.log(`   Server: ${fullConfig.serverUrl}`);
    console.log(`   Transport: ${fullConfig.transport.type}`);

    const client = new MCPClient(fullConfig);

    // Setup client event handlers
    client.on('connection:state', (state) => {
      console.log(`🔗 Connection state: ${state}`);
    });

    client.on('agent:registered', (agent) => {
      console.log(`🤖 Agent registered: ${agent.name} (${agent.agentId})`);
    });

    client.on('agent:unregistered', (agentId) => {
      console.log(`🤖 Agent unregistered: ${agentId}`);
    });

    client.on('group:formed', (group) => {
      console.log(`🔷 Group formed: ${group.name} (${group.shape})`);
    });

    client.on('message:sent', (event) => {
      console.log(`📤 Message sent: ${event.data.method}`);
    });

    client.on('message:received', (message) => {
      console.log(`📨 Message received: ${message.method}`);
    });

    client.on('notification', (notification) => {
      console.log(`📢 Notification: ${notification.data.method}`);
    });

    client.on('error', (error) => {
      console.error('❌ Client error:', error);
    });

    // Connect to server
    await client.connect();

    // Example usage
    console.log('✅ MCP Client connected successfully');
    console.log('   Available commands:');
    console.log('   - list agents');
    console.log('   - list groups');
    console.log('   - create group <name> <shape>');
    console.log('   - join group <groupId>');
    console.log('   - leave group <groupId>');
    console.log('   - send message <to> <method> <params>');
    console.log('   - send geometric <to> <content> <shape>');
    console.log('   - get statistics');
    console.log('   - quit');

    // Interactive command loop
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'mcp> '
    });

    rl.prompt();

    rl.on('line', async (line) => {
      const [command, ...args] = line.trim().split(' ');

      try {
        switch (command) {
          case 'list':
            if (args[0] === 'agents') {
              const agents = await client.getAgents();
              console.log('🤖 Registered agents:');
              agents.forEach(agent => {
                console.log(`   - ${agent.name} (${agent.agentId}) [${agent.type}]`);
              });
            } else if (args[0] === 'groups') {
              const groups = await client.getGeometricGroups();
              console.log('🔷 Geometric groups:');
              groups.forEach(group => {
                console.log(`   - ${group.name} (${group.shape}) [${group.members.length} members]`);
              });
            } else {
              console.log('Usage: list agents|groups');
            }
            break;

          case 'create':
            if (args[0] === 'group' && args[1] && args[2]) {
              const groupId = await client.createGeometricGroup(args[1], args[2] as any);
              console.log(`🔷 Created group: ${args[1]} (${args[2]}) with ID: ${groupId}`);
            } else {
              console.log('Usage: create group <name> <shape>');
            }
            break;

          case 'join':
            if (args[0] === 'group' && args[1]) {
              const success = await client.joinGeometricGroup(args[1]);
              console.log(success ? `🔗 Joined group: ${args[1]}` : `❌ Failed to join group: ${args[1]}`);
            } else {
              console.log('Usage: join group <groupId>');
            }
            break;

          case 'leave':
            if (args[0] === 'group' && args[1]) {
              const success = await client.leaveGeometricGroup(args[1]);
              console.log(success ? `🔗 Left group: ${args[1]}` : `❌ Failed to leave group: ${args[1]}`);
            } else {
              console.log('Usage: leave group <groupId>');
            }
            break;

          case 'send':
            if (args[0] === 'message' && args[1] && args[2]) {
              const params = args[3] ? JSON.parse(args[3]) : {};
              const messageId = await client.sendMessage(args[1], args[2], params);
              console.log(`📤 Message sent with ID: ${messageId}`);
            } else if (args[0] === 'geometric' && args[1] && args[2] && args[3]) {
              const messageId = await client.sendGeometricMessage(args[1], args[2], args[3] as any);
              console.log(`📤 Geometric message sent with ID: ${messageId}`);
            } else {
              console.log('Usage: send message <to> <method> [params]');
              console.log('       send geometric <to> <content> <shape>');
            }
            break;

          case 'get':
            if (args[0] === 'statistics') {
              const stats = await client.getStatistics();
              console.log('📊 Server statistics:');
              console.log(JSON.stringify(stats, null, 2));
            } else {
              console.log('Usage: get statistics');
            }
            break;

          case 'quit':
          case 'exit':
            console.log('👋 Goodbye!');
            await client.disconnect();
            process.exit(0);
            break;

          case 'help':
            console.log('Available commands:');
            console.log('  list agents|groups');
            console.log('  create group <name> <shape>');
            console.log('  join group <groupId>');
            console.log('  leave group <groupId>');
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
      await client.disconnect();
      process.exit(0);
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down MCP Client...');
      await client.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Shutting down MCP Client...');
      await client.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start MCP Client:', error);
    process.exit(1);
  }
}

// Start the client
startClient();

