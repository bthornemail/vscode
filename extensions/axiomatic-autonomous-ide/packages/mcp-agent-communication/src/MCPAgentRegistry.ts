/**
 * MCP Agent Registry
 * 
 * Manages agent registration, discovery, and coordination
 * with geometric group formation and consensus mechanisms.
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import {
  AgentIdentity,
  MCPMessage,
  MCPAgentRegistry as MCPAgentRegistryType,
  MCPEvent,
  MCPStatistics
} from './types';

export class MCPAgentRegistry extends EventEmitter {
  private agents: Map<string, AgentIdentity> = new Map();
  private groups: Map<string, any> = new Map();
  private messages: Map<string, MCPMessage> = new Map();
  private statistics: MCPStatistics = {
    server: {
      uptime: 0,
      connections: 0,
      messages_processed: 0,
      errors: 0
    },
    agents: {
      total: 0,
      active: 0,
      by_type: {},
      by_context: {}
    },
    messages: {
      total: 0,
      by_type: {},
      by_priority: {},
      per_second: 0
    },
    geometric: {
      groups_active: 0,
      consensus_achieved: 0,
      topological_validations: 0,
      sacred_math_operations: 0
    },
    performance: {
      avg_response_time: 0,
      max_response_time: 0,
      memory_usage: 0,
      cpu_usage: 0
    }
  };

  private startTime: number = Date.now();
  private messageCount: number = 0;
  private lastMessageTime: number = Date.now();

  constructor() {
    super();
    this.startStatisticsTracking();
  }

  /**
   * Register a new agent
   */
  public registerAgent(identity: AgentIdentity): boolean {
    try {
      // Validate agent identity
      if (!identity.agentId || !identity.name || !identity.type) {
        throw new Error('Invalid agent identity: missing required fields');
      }

      // Check if agent already exists
      if (this.agents.has(identity.agentId)) {
        console.warn(`Agent ${identity.agentId} already registered. Updating.`);
      }

      // Update last seen timestamp
      identity.lastSeen = Date.now();

      // Register agent
      this.agents.set(identity.agentId, identity);

      // Update statistics
      this.updateAgentStatistics();

      // Emit registration event
      this.emit('agent:registered', {
        type: 'agent:registered',
        agentId: identity.agentId,
        data: identity,
        timestamp: Date.now()
      } as MCPEvent);

      console.log(`🤖 Agent registered: ${identity.name} (${identity.agentId})`);
      return true;
    } catch (error) {
      this.statistics.server.errors++;
      this.emit('error', {
        type: 'error',
        data: { error: error.message, context: 'agent_registration' },
        timestamp: Date.now()
      } as MCPEvent);
      return false;
    }
  }

  /**
   * Unregister an agent
   */
  public unregisterAgent(agentId: string): boolean {
    try {
      const agent = this.agents.get(agentId);
      if (!agent) {
        console.warn(`Agent ${agentId} not found for unregistration`);
        return false;
      }

      // Remove from all groups
      this.removeAgentFromAllGroups(agentId);

      // Remove agent
      this.agents.delete(agentId);

      // Update statistics
      this.updateAgentStatistics();

      // Emit unregistration event
      this.emit('agent:unregistered', {
        type: 'agent:unregistered',
        agentId,
        data: agent,
        timestamp: Date.now()
      } as MCPEvent);

      console.log(`🤖 Agent unregistered: ${agent.name} (${agentId})`);
      return true;
    } catch (error) {
      this.statistics.server.errors++;
      this.emit('error', {
        type: 'error',
        data: { error: error.message, context: 'agent_unregistration' },
        timestamp: Date.now()
      } as MCPEvent);
      return false;
    }
  }

  /**
   * Get agent by ID
   */
  public getAgent(agentId: string): AgentIdentity | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents
   */
  public getAllAgents(): AgentIdentity[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents by type
   */
  public getAgentsByType(type: string): AgentIdentity[] {
    return Array.from(this.agents.values()).filter(agent => agent.type === type);
  }

  /**
   * Get agents by context
   */
  public getAgentsByContext(context: string): AgentIdentity[] {
    return Array.from(this.agents.values()).filter(agent => agent.context === context);
  }

  /**
   * Update agent last seen timestamp
   */
  public updateAgentActivity(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return false;
    }

    agent.lastSeen = Date.now();
    this.agents.set(agentId, agent);
    return true;
  }

  /**
   * Create a geometric group
   */
  public createGeometricGroup(
    creatorId: string,
    name: string,
    shape: 'tetrahedron' | 'cube' | 'octahedron' | 'icosahedron' | 'dodecahedron'
  ): string {
    const groupId = uuidv4();
    const creator = this.agents.get(creatorId);
    
    if (!creator) {
      throw new Error(`Creator agent ${creatorId} not found`);
    }

    // Get group size based on shape
    const groupSizes = {
      tetrahedron: 4,
      cube: 8,
      octahedron: 6,
      icosahedron: 12,
      dodecahedron: 20
    };

    const group = {
      id: groupId,
      name,
      shape,
      members: [creatorId],
      consensus_threshold: this.calculateConsensusThreshold(shape),
      status: 'forming' as const,
      created_at: Date.now(),
      last_activity: Date.now()
    };

    this.groups.set(groupId, group);
    this.updateGeometricStatistics();

    // Emit group formation event
    this.emit('group:formed', {
      type: 'group:formed',
      agentId: creatorId,
      data: group,
      timestamp: Date.now()
    } as MCPEvent);

    console.log(`🔷 Geometric group created: ${name} (${shape}) by ${creator.name}`);
    return groupId;
  }

  /**
   * Join a geometric group
   */
  public joinGeometricGroup(agentId: string, groupId: string): boolean {
    const group = this.groups.get(groupId);
    const agent = this.agents.get(agentId);
    
    if (!group || !agent) {
      return false;
    }

    if (group.members.includes(agentId)) {
      console.warn(`Agent ${agentId} already member of group ${groupId}`);
      return false;
    }

    // Check if group is full
    const maxSizes = {
      tetrahedron: 4,
      cube: 8,
      octahedron: 6,
      icosahedron: 12,
      dodecahedron: 20
    };

    if (group.members.length >= maxSizes[group.shape]) {
      console.warn(`Group ${groupId} is full`);
      return false;
    }

    // Add member to group
    group.members.push(agentId);
    group.last_activity = Date.now();

    // Update group status
    if (group.members.length === maxSizes[group.shape]) {
      group.status = 'active';
    }

    this.groups.set(groupId, group);
    this.updateGeometricStatistics();

    console.log(`🔗 Agent ${agent.name} joined group ${group.name}`);
    return true;
  }

  /**
   * Leave a geometric group
   */
  public leaveGeometricGroup(agentId: string, groupId: string): boolean {
    const group = this.groups.get(groupId);
    
    if (!group || !group.members.includes(agentId)) {
      return false;
    }

    // Remove member from group
    group.members = group.members.filter(id => id !== agentId);
    group.last_activity = Date.now();

    // Update group status
    if (group.members.length === 0) {
      group.status = 'disbanded';
      this.groups.delete(groupId);
    } else {
      group.status = 'forming';
    }

    this.updateGeometricStatistics();

    console.log(`🔗 Agent ${agentId} left group ${group.name}`);
    return true;
  }

  /**
   * Get geometric group by ID
   */
  public getGeometricGroup(groupId: string): any {
    return this.groups.get(groupId);
  }

  /**
   * Get all geometric groups
   */
  public getAllGeometricGroups(): any[] {
    return Array.from(this.groups.values());
  }

  /**
   * Store a message
   */
  public storeMessage(message: MCPMessage): void {
    this.messages.set(message.id, message);
    this.messageCount++;
    this.updateMessageStatistics(message);
  }

  /**
   * Get message by ID
   */
  public getMessage(messageId: string): MCPMessage | undefined {
    return this.messages.get(messageId);
  }

  /**
   * Get messages by agent
   */
  public getMessagesByAgent(agentId: string): MCPMessage[] {
    return Array.from(this.messages.values()).filter(
      msg => msg.from === agentId || (Array.isArray(msg.to) ? msg.to.includes(agentId) : msg.to === agentId)
    );
  }

  /**
   * Get messages by type
   */
  public getMessagesByType(type: string): MCPMessage[] {
    return Array.from(this.messages.values()).filter(msg => msg.type === type);
  }

  /**
   * Calculate consensus threshold based on shape
   */
  private calculateConsensusThreshold(shape: string): number {
    const thresholds = {
      tetrahedron: 0.75, // 3 of 4
      cube: 0.5,         // 4 of 8
      octahedron: 0.5,   // 3 of 6
      icosahedron: 0.42, // 5 of 12
      dodecahedron: 0.6  // 12 of 20
    };
    return thresholds[shape as keyof typeof thresholds] || 0.5;
  }

  /**
   * Remove agent from all groups
   */
  private removeAgentFromAllGroups(agentId: string): void {
    for (const [groupId, group] of this.groups.entries()) {
      if (group.members.includes(agentId)) {
        this.leaveGeometricGroup(agentId, groupId);
      }
    }
  }

  /**
   * Update agent statistics
   */
  private updateAgentStatistics(): void {
    const agents = Array.from(this.agents.values());
    const now = Date.now();
    const activeThreshold = 30000; // 30 seconds

    this.statistics.agents.total = agents.length;
    this.statistics.agents.active = agents.filter(agent => now - agent.lastSeen < activeThreshold).length;

    // Count by type
    this.statistics.agents.by_type = {};
    agents.forEach(agent => {
      this.statistics.agents.by_type[agent.type] = (this.statistics.agents.by_type[agent.type] || 0) + 1;
    });

    // Count by context
    this.statistics.agents.by_context = {};
    agents.forEach(agent => {
      this.statistics.agents.by_context[agent.context] = (this.statistics.agents.by_context[agent.context] || 0) + 1;
    });
  }

  /**
   * Update message statistics
   */
  private updateMessageStatistics(message: MCPMessage): void {
    this.statistics.messages.total = this.messageCount;

    // Count by type
    this.statistics.messages.by_type[message.type] = (this.statistics.messages.by_type[message.type] || 0) + 1;

    // Count by priority
    this.statistics.messages.by_priority[message.priority] = (this.statistics.messages.by_priority[message.priority] || 0) + 1;

    // Calculate messages per second
    const now = Date.now();
    const timeDiff = (now - this.lastMessageTime) / 1000;
    if (timeDiff > 0) {
      this.statistics.messages.per_second = 1 / timeDiff;
    }
    this.lastMessageTime = now;
  }

  /**
   * Update geometric statistics
   */
  private updateGeometricStatistics(): void {
    this.statistics.geometric.groups_active = this.groups.size;
  }

  /**
   * Start statistics tracking
   */
  private startStatisticsTracking(): void {
    setInterval(() => {
      this.statistics.server.uptime = Date.now() - this.startTime;
      this.statistics.server.connections = this.agents.size;
      this.statistics.server.messages_processed = this.messageCount;

      // Update performance statistics
      const memUsage = process.memoryUsage();
      this.statistics.performance.memory_usage = memUsage.heapUsed / 1024 / 1024; // MB

      // Emit statistics update
      this.emit('statistics:updated', this.statistics);
    }, 5000); // Update every 5 seconds
  }

  /**
   * Get current statistics
   */
  public getStatistics(): MCPStatistics {
    return _.cloneDeep(this.statistics);
  }

  /**
   * Get registry state
   */
  public getRegistryState(): MCPAgentRegistryType {
    return {
      agents: Object.fromEntries(this.agents),
      groups: Object.fromEntries(this.groups),
      messages: Object.fromEntries(this.messages),
      statistics: this.statistics
    };
  }

  /**
   * Clear all data
   */
  public clear(): void {
    this.agents.clear();
    this.groups.clear();
    this.messages.clear();
    this.messageCount = 0;
    this.updateAgentStatistics();
    this.updateGeometricStatistics();
  }
}

