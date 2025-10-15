#!/usr/bin/env tsx

/**
 * Autonomous Coordination Example
 * 
 * Demonstrates autonomous agent coordination with emergent behavior,
 * self-organizing groups, and distributed decision-making.
 */

import { MCPClient, MCPServer, createAgentIdentity } from '../src';

async function runAutonomousCoordinationExample() {
  console.log('🚀 Starting Autonomous Coordination Example...\n');

  // 1. Start MCP Server
  console.log('1. Starting MCP Server...');
  const server = new MCPServer({
    port: 3000,
    host: 'localhost',
    transport: {
      type: 'websocket',
      path: '/mcp'
    },
    geometric: {
      enableIBRG: true,
      enableSacredMath: true,
      enableTopologicalConsensus: true,
      defaultGroupSize: 4,
      maxGroupSize: 20
    }
  });

  await server.start();
  console.log('✅ MCP Server started on ws://localhost:3000/mcp\n');

  // 2. Create Autonomous Agents
  console.log('2. Creating Autonomous Agents...');
  const agents = [];
  const clients = [];

  // Create different types of autonomous agents
  const agentTypes = [
    { name: 'coordinator', capabilities: ['coordination', 'consensus', 'group_management'] },
    { name: 'worker', capabilities: ['task_execution', 'data_processing'] },
    { name: 'observer', capabilities: ['monitoring', 'analysis', 'reporting'] },
    { name: 'communicator', capabilities: ['message_routing', 'protocol_handling'] }
  ];

  for (let i = 0; i < agentTypes.length; i++) {
    const agent = createAgentIdentity({
      name: `autonomous-${agentTypes[i].name}`,
      type: 'autonomous',
      capabilities: ['geometric_communication', 'mcp_protocol', ...agentTypes[i].capabilities]
    });

    const client = new MCPClient({
      serverUrl: 'ws://localhost:3000/mcp',
      transport: {
        type: 'websocket',
        reconnect: true
      },
      geometric: {
        enableIBRG: true,
        enableSacredMath: true,
        enableTopologicalConsensus: true
      }
    });

    agents.push(agent);
    clients.push(client);
    console.log(`✅ Created ${agentTypes[i].name} agent: ${agent.name} (${agent.agentId})`);
  }
  console.log('');

  // 3. Connect and Register Agents
  console.log('3. Connecting and Registering Agents...');
  for (let i = 0; i < clients.length; i++) {
    await clients[i].connect();
    await clients[i].registerAgent(agents[i]);
    console.log(`✅ Connected and registered ${agentTypes[i].name} agent`);
  }
  console.log('');

  // 4. Demonstrate Self-Organizing Groups
  console.log('4. Demonstrating Self-Organizing Groups...');
  
  // Create multiple groups for different tasks
  const taskGroups = [
    { name: 'data-processing', shape: 'tetrahedron' },
    { name: 'coordination', shape: 'cube' },
    { name: 'monitoring', shape: 'octahedron' }
  ];

  const groupIds = [];
  for (const taskGroup of taskGroups) {
    const groupId = await clients[0].createGeometricGroup(taskGroup.name, taskGroup.shape);
    groupIds.push(groupId);
    console.log(`✅ Created ${taskGroup.name} group: ${groupId} (${taskGroup.shape})`);
  }
  console.log('');

  // 5. Autonomous Group Formation
  console.log('5. Autonomous Group Formation...');
  
  // Agents autonomously join groups based on their capabilities
  for (let i = 0; i < clients.length; i++) {
    const agent = agents[i];
    const client = clients[i];
    
    // Determine which groups to join based on capabilities
    const groupsToJoin = [];
    if (agent.capabilities.includes('data_processing')) {
      groupsToJoin.push(groupIds[0]); // data-processing
    }
    if (agent.capabilities.includes('coordination')) {
      groupsToJoin.push(groupIds[1]); // coordination
    }
    if (agent.capabilities.includes('monitoring')) {
      groupsToJoin.push(groupIds[2]); // monitoring
    }
    
    // Join groups
    for (const groupId of groupsToJoin) {
      await client.joinGeometricGroup(groupId);
      console.log(`✅ ${agent.name} autonomously joined group: ${groupId}`);
    }
  }
  console.log('');

  // 6. Emergent Task Distribution
  console.log('6. Emergent Task Distribution...');
  
  // Simulate task distribution through emergent behavior
  const tasks = [
    { id: 'task-1', type: 'data-processing', priority: 1 },
    { id: 'task-2', type: 'coordination', priority: 2 },
    { id: 'task-3', type: 'monitoring', priority: 3 }
  ];

  for (const task of tasks) {
    // Find appropriate group for task
    let targetGroupId = null;
    if (task.type === 'data-processing') targetGroupId = groupIds[0];
    else if (task.type === 'coordination') targetGroupId = groupIds[1];
    else if (task.type === 'monitoring') targetGroupId = groupIds[2];
    
    if (targetGroupId) {
      const taskMessage = {
        taskId: task.id,
        type: task.type,
        priority: task.priority,
        timestamp: Date.now(),
        status: 'distributed'
      };
      
      const messageId = await clients[0].sendGeometricMessage(targetGroupId, JSON.stringify(taskMessage), 'tetrahedron');
      console.log(`✅ Task ${task.id} distributed to ${task.type} group: ${messageId}`);
    }
  }
  console.log('');

  // 7. Autonomous Decision Making
  console.log('7. Autonomous Decision Making...');
  
  // Simulate autonomous decision making within groups
  for (let i = 0; i < groupIds.length; i++) {
    const groupId = groupIds[i];
    const groupName = taskGroups[i].name;
    
    // Send decision proposals
    const decisionProposal = {
      type: 'autonomous_decision',
      group: groupName,
      proposal: `Optimize ${groupName} workflow`,
      alternatives: [
        `Current ${groupName} approach`,
        `Enhanced ${groupName} approach`,
        `Revolutionary ${groupName} approach`
      ],
      timestamp: Date.now()
    };
    
    const messageId = await clients[0].sendGeometricMessage(groupId, JSON.stringify(decisionProposal), 'tetrahedron');
    console.log(`✅ Decision proposal sent to ${groupName} group: ${messageId}`);
  }
  console.log('');

  // 8. Collective Intelligence
  console.log('8. Collective Intelligence...');
  
  // Demonstrate collective intelligence through group consensus
  for (let i = 0; i < groupIds.length; i++) {
    const groupId = groupIds[i];
    const groupName = taskGroups[i].name;
    
    // Check consensus for each group
    const consensus = await clients[0].checkGroupConsensus(groupId);
    console.log(`✅ ${groupName} group consensus: ${consensus.achieved ? 'Achieved' : 'Pending'}`);
    
    if (consensus.achieved) {
      console.log(`   Agreement: ${consensus.agreementPercentage * 100}%`);
      console.log(`   Decision: ${consensus.agreedValue}`);
    }
  }
  console.log('');

  // 9. Emergent Communication Patterns
  console.log('9. Emergent Communication Patterns...');
  
  // Demonstrate emergent communication patterns
  const communicationPatterns = [
    { pattern: 'broadcast', description: 'System-wide announcements' },
    { pattern: 'multicast', description: 'Group-specific messages' },
    { pattern: 'unicast', description: 'Direct agent communication' },
    { pattern: 'anycast', description: 'Any available agent' }
  ];

  for (const pattern of communicationPatterns) {
    const patternMessage = {
      type: 'communication_pattern',
      pattern: pattern.pattern,
      description: pattern.description,
      timestamp: Date.now()
    };
    
    const messageId = await clients[0].sendGeometricMessage(groupIds[0], JSON.stringify(patternMessage), 'tetrahedron');
    console.log(`✅ ${pattern.pattern} pattern demonstrated: ${messageId}`);
  }
  console.log('');

  // 10. Self-Organizing System Evolution
  console.log('10. Self-Organizing System Evolution...');
  
  // Simulate system evolution through self-organization
  const evolutionSteps = [
    { step: 1, description: 'Initial group formation' },
    { step: 2, description: 'Capability-based specialization' },
    { step: 3, description: 'Emergent task distribution' },
    { step: 4, description: 'Collective decision making' },
    { step: 5, description: 'System optimization' }
  ];

  for (const evolution of evolutionSteps) {
    const evolutionMessage = {
      type: 'system_evolution',
      step: evolution.step,
      description: evolution.description,
      timestamp: Date.now()
    };
    
    const messageId = await clients[0].sendGeometricMessage(groupIds[0], JSON.stringify(evolutionMessage), 'tetrahedron');
    console.log(`✅ Evolution step ${evolution.step}: ${evolution.description} - ${messageId}`);
  }
  console.log('');

  // 11. Final System State
  console.log('11. Final System State...');
  
  // Get final system statistics
  const finalStats = await clients[0].getStatistics();
  console.log('✅ Final system statistics:');
  console.log(`   Messages sent: ${finalStats.messagesSent}`);
  console.log(`   Messages received: ${finalStats.messagesReceived}`);
  console.log(`   Groups joined: ${finalStats.groupsJoined}`);
  console.log(`   Consensus achieved: ${finalStats.consensusAchieved}`);
  console.log('');

  // 12. Cleanup
  console.log('12. Cleaning up...');
  for (let i = 0; i < clients.length; i++) {
    // Leave all groups
    for (const groupId of groupIds) {
      await clients[i].leaveGeometricGroup(groupId);
    }
    await clients[i].disconnect();
    console.log(`✅ ${agentTypes[i].name} agent cleaned up`);
  }
  await server.stop();
  console.log('✅ Server stopped\n');

  console.log('🎉 Autonomous Coordination Example completed successfully!');
  console.log('   Key insights:');
  console.log('   - Agents autonomously form groups based on capabilities');
  console.log('   - Emergent task distribution optimizes system performance');
  console.log('   - Collective intelligence enables better decision making');
  console.log('   - Self-organizing systems evolve and adapt dynamically');
  console.log('   - Geometric structures provide stable coordination frameworks');
}

// Run the example
runAutonomousCoordinationExample().catch(console.error);

