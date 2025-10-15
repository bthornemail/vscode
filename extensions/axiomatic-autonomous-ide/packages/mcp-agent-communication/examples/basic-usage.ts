/**
 * Basic Usage Example
 * 
 * Demonstrates basic usage of the MCP Agent Communication system
 * with geometric groups, message routing, and consensus.
 */

import { MCPAgentCommunication } from '../src/MCPAgentCommunication';
import { MCPAgentCommunicationConfig } from '../src/types';

async function basicUsageExample() {
  console.log('🚀 Starting MCP Agent Communication Basic Usage Example');

  // Configuration for the MCP Agent Communication system
  const config: MCPAgentCommunicationConfig = {
    server: {
      port: 3000,
      host: 'localhost',
      cors: {
        origin: ['http://localhost:3000'],
        credentials: true,
      },
    },
    geometric: {
      validation: true,
      constraints: {
        maxDistance: 1000,
        minSimilarity: 0.7,
      },
    },
    consensus: {
      timeout: 30000,
      threshold: 0.8,
      retryAttempts: 3,
    },
    message: {
      validation: true,
      encryption: false,
      compression: false,
    },
    logging: {
      level: 'info',
      format: 'json',
    },
  };

  // Create the MCP Agent Communication instance
  const mcpCommunication = new MCPAgentCommunication(config);

  try {
    // Initialize the system
    await mcpCommunication.initialize();
    console.log('✅ MCP Agent Communication system initialized');

    // Create a geometric group
    const groupData = {
      id: 'example-group',
      name: 'Example Group',
      shape: 'tetrahedron' as const,
      members: ['agent-1', 'agent-2', 'agent-3'],
      consensusThreshold: 0.8,
    };

    const group = await mcpCommunication.createGeometricGroup(groupData);
    console.log(`✅ Created geometric group: ${group.getName()}`);

    // Add a member to the group
    const addResult = await mcpCommunication.addMemberToGroup('example-group', 'agent-4');
    if (addResult) {
      console.log('✅ Added agent-4 to the group');
    }

    // Create a geometric message
    const message = {
      id: 'example-message',
      senderId: 'agent-1',
      receiverId: 'agent-2',
      groupId: 'example-group',
      type: 'geometric_message',
      payload: {
        action: 'move',
        position: { x: 10, y: 20, z: 30 },
        orientation: { x: 0, y: 0, z: 0, w: 1 },
      },
      geometricProperties: {
        position: { x: 0, y: 0, z: 0 },
        orientation: { x: 0, y: 0, z: 0, w: 1 },
        topology: { vertices: 4, edges: 6, faces: 4 },
      },
      timestamp: Date.now(),
    };

    // Send the message
    const sendResult = await mcpCommunication.sendMessage(message);
    if (sendResult) {
      console.log('✅ Message sent successfully');
    }

    // Check consensus status
    const consensusStatus = await mcpCommunication.checkConsensusStatus('example-group');
    console.log(`📊 Consensus status: ${JSON.stringify(consensusStatus, null, 2)}`);

    // Get group information
    const groupInfo = mcpCommunication.getGeometricGroup('example-group');
    if (groupInfo) {
      console.log(`📋 Group info: ${JSON.stringify({
        id: groupInfo.getId(),
        name: groupInfo.getName(),
        shape: groupInfo.getShape(),
        members: groupInfo.getMembers(),
        memberCount: groupInfo.getMemberCount(),
      }, null, 2)}`);
    }

    // List all groups
    const allGroups = mcpCommunication.listGeometricGroups();
    console.log(`📋 All groups: ${allGroups.length} groups found`);

    // Get communication statistics
    const stats = mcpCommunication.getCommunicationStats();
    console.log(`📊 Communication stats: ${JSON.stringify(stats, null, 2)}`);

    console.log('✅ Basic usage example completed successfully');

  } catch (error) {
    console.error('❌ Error in basic usage example:', error);
  } finally {
    // Shutdown the system
    await mcpCommunication.shutdown();
    console.log('🛑 MCP Agent Communication system shutdown');
  }
}

// Run the example
if (require.main === module) {
  basicUsageExample().catch(console.error);
}

export { basicUsageExample };