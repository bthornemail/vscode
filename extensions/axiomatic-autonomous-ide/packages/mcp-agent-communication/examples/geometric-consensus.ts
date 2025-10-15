#!/usr/bin/env tsx

/**
 * Geometric Consensus Example
 * 
 * Demonstrates geometric consensus mechanisms using Platonic solid structures
 * and topological invariants for group decision-making.
 */

import { MCPClient, MCPServer, createAgentIdentity } from '../src';

async function runGeometricConsensusExample() {
  console.log('🚀 Starting Geometric Consensus Example...\n');

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

  // 2. Create Multiple Agents
  console.log('2. Creating Multiple Agents...');
  const agents = [];
  const clients = [];

  for (let i = 1; i <= 4; i++) {
    const agent = createAgentIdentity({
      name: `agent-${i}`,
      type: 'llm',
      capabilities: ['geometric_communication', 'mcp_protocol', 'consensus_participation']
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
    console.log(`✅ Created agent ${i}: ${agent.name} (${agent.agentId})`);
  }
  console.log('');

  // 3. Connect and Register Agents
  console.log('3. Connecting and Registering Agents...');
  for (let i = 0; i < clients.length; i++) {
    await clients[i].connect();
    await clients[i].registerAgent(agents[i]);
    console.log(`✅ Connected and registered agent ${i + 1}`);
  }
  console.log('');

  // 4. Create Different Geometric Groups
  console.log('4. Creating Different Geometric Groups...');
  
  // Tetrahedron group (4 agents)
  const tetraGroupId = await clients[0].createGeometricGroup('tetrahedron-group', 'tetrahedron');
  console.log(`✅ Created tetrahedron group: ${tetraGroupId}`);

  // Cube group (8 agents - will be limited by available agents)
  const cubeGroupId = await clients[0].createGeometricGroup('cube-group', 'cube');
  console.log(`✅ Created cube group: ${cubeGroupId}`);

  // Octahedron group (6 agents - will be limited by available agents)
  const octaGroupId = await clients[0].createGeometricGroup('octahedron-group', 'octahedron');
  console.log(`✅ Created octahedron group: ${octaGroupId}`);
  console.log('');

  // 5. Join Tetrahedron Group
  console.log('5. Joining Tetrahedron Group...');
  for (let i = 0; i < clients.length; i++) {
    await clients[i].joinGeometricGroup(tetraGroupId);
    console.log(`✅ Agent ${i + 1} joined tetrahedron group`);
  }
  console.log('');

  // 6. Demonstrate Consensus Process
  console.log('6. Demonstrating Consensus Process...');
  
  // Send consensus proposals
  console.log('   Sending consensus proposals...');
  for (let i = 0; i < clients.length; i++) {
    const proposal = {
      value: `proposal-${i + 1}`,
      priority: i + 1,
      timestamp: Date.now()
    };
    
    const messageId = await clients[i].sendGeometricMessage(tetraGroupId, JSON.stringify(proposal), 'tetrahedron');
    console.log(`   ✅ Agent ${i + 1} sent proposal: ${messageId}`);
  }
  console.log('');

  // 7. Check Consensus
  console.log('7. Checking Consensus...');
  const consensus = await clients[0].checkGroupConsensus(tetraGroupId);
  console.log(`✅ Consensus status: ${consensus.achieved ? 'Achieved' : 'Pending'}`);
  if (consensus.achieved) {
    console.log(`   Agreement: ${consensus.agreementPercentage * 100}%`);
    console.log(`   Value: ${consensus.agreedValue}`);
    console.log(`   Participants: ${consensus.participants.join(', ')}`);
  } else {
    console.log(`   Reason: ${consensus.reason || 'Insufficient agreement'}`);
  }
  console.log('');

  // 8. Demonstrate Sacred Mathematics
  console.log('8. Demonstrating Sacred Mathematics...');
  
  // Send messages with golden ratio scaling
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  console.log(`   Golden ratio: ${goldenRatio.toFixed(6)}`);
  
  for (let i = 0; i < clients.length; i++) {
    const sacredMessage = {
      content: `Sacred message from agent ${i + 1}`,
      goldenRatio: goldenRatio,
      divineFrequency: 432,
      timestamp: Date.now()
    };
    
    const messageId = await clients[i].sendGeometricMessage(tetraGroupId, JSON.stringify(sacredMessage), 'tetrahedron');
    console.log(`   ✅ Agent ${i + 1} sent sacred message: ${messageId}`);
  }
  console.log('');

  // 9. Demonstrate Topological Analysis
  console.log('9. Demonstrating Topological Analysis...');
  
  // Send messages with topological metadata
  for (let i = 0; i < clients.length; i++) {
    const topologicalMessage = {
      content: `Topological message from agent ${i + 1}`,
      bettiNumbers: [1, 0, 0, 1], // Tetrahedron Betti numbers
      eulerCharacteristic: 2,
      topologicalInvariants: {
        connectedComponents: 1,
        cycles: 0,
        voids: 0,
        boundaries: 1
      },
      timestamp: Date.now()
    };
    
    const messageId = await clients[i].sendGeometricMessage(tetraGroupId, JSON.stringify(topologicalMessage), 'tetrahedron');
    console.log(`   ✅ Agent ${i + 1} sent topological message: ${messageId}`);
  }
  console.log('');

  // 10. Final Consensus Check
  console.log('10. Final Consensus Check...');
  const finalConsensus = await clients[0].checkGroupConsensus(tetraGroupId);
  console.log(`✅ Final consensus status: ${finalConsensus.achieved ? 'Achieved' : 'Pending'}`);
  if (finalConsensus.achieved) {
    console.log(`   Agreement: ${finalConsensus.agreementPercentage * 100}%`);
    console.log(`   Value: ${finalConsensus.agreedValue}`);
    console.log(`   Participants: ${finalConsensus.participants.join(', ')}`);
  }
  console.log('');

  // 11. Get Group Statistics
  console.log('11. Getting Group Statistics...');
  const groups = await clients[0].getGeometricGroups();
  console.log('✅ Geometric groups:');
  groups.forEach(group => {
    console.log(`   - ${group.name} (${group.shape})`);
    console.log(`     Members: ${group.members.length}`);
    console.log(`     Consensus threshold: ${group.consensusThreshold * 100}%`);
    console.log(`     Created: ${new Date(group.createdAt).toISOString()}`);
  });
  console.log('');

  // 12. Cleanup
  console.log('12. Cleaning up...');
  for (let i = 0; i < clients.length; i++) {
    await clients[i].leaveGeometricGroup(tetraGroupId);
    await clients[i].disconnect();
    console.log(`✅ Agent ${i + 1} cleaned up`);
  }
  await server.stop();
  console.log('✅ Server stopped\n');

  console.log('🎉 Geometric Consensus Example completed successfully!');
  console.log('   Key insights:');
  console.log('   - Geometric groups enable structured consensus');
  console.log('   - Sacred mathematics optimizes communication');
  console.log('   - Topological invariants ensure structural integrity');
  console.log('   - Face-vertex ratios determine consensus thresholds');
}

// Run the example
runGeometricConsensusExample().catch(console.error);

