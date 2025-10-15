/**
 * MCP Client
 * 
 * Implements the Model Context Protocol client for LLM agent-to-agent communication
 * with geometric message routing and autonomous coordination.
 */

import { EventEmitter } from 'events';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { WebSocketClientTransport } from '@modelcontextprotocol/sdk/client/websocket.js';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import {
  MCPClientConfig,
  MCPMessage,
  AgentIdentity,
  MCPConnectionState,
  MCPEvent
} from './types';

export class MCPClient extends EventEmitter {
  private config: MCPClientConfig;
  private client: Client;
  private transport: any;
  private connectionState: MCPConnectionState = 'disconnected';
  private reconnectAttempts: number = 0;
  private reconnectTimer?: NodeJS.Timeout;
  private messageQueue: MCPMessage[] = [];

  constructor(config: MCPClientConfig) {
    super();
    this.config = config;
    this.client = new Client(
      {
        name: this.config.agentIdentity.name,
        version: this.config.agentIdentity.version || '1.0.0'
      },
      {
        capabilities: this.config.capabilities
      }
    );

    this.setupClient();
  }

  /**
   * Setup MCP client with event handlers
   */
  private setupClient(): void {
    // Setup client event handlers
    this.client.on('notification', (notification) => {
      this.handleNotification(notification);
    });

    this.client.on('error', (error) => {
      this.handleError(error);
    });

    this.client.on('close', () => {
      this.handleDisconnect();
    });
  }

  /**
   * Connect to MCP server
   */
  public async connect(): Promise<void> {
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      console.log('MCP Client already connected or connecting');
      return;
    }

    try {
      this.connectionState = 'connecting';
      this.emit('connection:state', this.connectionState);

      // Setup transport based on configuration
      if (this.config.transport.type === 'stdio') {
        this.transport = new StdioClientTransport();
      } else if (this.config.transport.type === 'websocket') {
        this.transport = new WebSocketClientTransport({
          url: this.config.serverUrl
        });
      } else {
        throw new Error(`Unsupported transport type: ${this.config.transport.type}`);
      }

      // Connect client to transport
      await this.client.connect(this.transport);

      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      this.emit('connection:state', this.connectionState);

      // Register this agent with the server
      await this.registerAgent();

      // Process queued messages
      await this.processMessageQueue();

      console.log(`🔗 MCP Client connected: ${this.config.agentIdentity.name}`);
      console.log(`   Server: ${this.config.serverUrl}`);
      console.log(`   Transport: ${this.config.transport.type}`);

    } catch (error) {
      this.connectionState = 'error';
      this.emit('connection:state', this.connectionState);
      this.emit('error', error);
      
      if (this.config.transport.reconnect) {
        this.scheduleReconnect();
      }
      
      throw error;
    }
  }

  /**
   * Disconnect from MCP server
   */
  public async disconnect(): Promise<void> {
    if (this.connectionState === 'disconnected') {
      return;
    }

    try {
      // Clear reconnect timer
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = undefined;
      }

      // Unregister this agent
      await this.unregisterAgent();

      // Close transport
      if (this.transport) {
        await this.transport.close();
      }

      this.connectionState = 'disconnected';
      this.emit('connection:state', this.connectionState);

      console.log(`🔌 MCP Client disconnected: ${this.config.agentIdentity.name}`);
    } catch (error) {
      console.error('❌ Error disconnecting MCP Client:', error);
      throw error;
    }
  }

  /**
   * Register this agent with the server
   */
  private async registerAgent(): Promise<void> {
    try {
      const result = await this.client.request({
        method: 'tools/call',
        params: {
          name: 'agent.register',
          arguments: {
            agent: this.config.agentIdentity
          }
        }
      });

      console.log(`🤖 Agent registered: ${this.config.agentIdentity.name}`);
    } catch (error) {
      console.warn('⚠️ Failed to register agent:', error);
    }
  }

  /**
   * Unregister this agent from the server
   */
  private async unregisterAgent(): Promise<void> {
    try {
      await this.client.request({
        method: 'tools/call',
        params: {
          name: 'agent.unregister',
          arguments: {
            agentId: this.config.agentIdentity.agentId
          }
        }
      });

      console.log(`🤖 Agent unregistered: ${this.config.agentIdentity.name}`);
    } catch (error) {
      console.warn('⚠️ Failed to unregister agent:', error);
    }
  }

  /**
   * Send message to another agent
   */
  public async sendMessage(
    to: string | string[],
    method: string,
    params?: any,
    options?: {
      type?: 'request' | 'response' | 'notification' | 'geometric';
      priority?: 'low' | 'normal' | 'high' | 'critical';
      ttl?: number;
      geometric?: any;
    }
  ): Promise<string> {
    const message: MCPMessage = {
      id: uuidv4(),
      from: this.config.agentIdentity.agentId,
      to,
      type: options?.type || 'request',
      method,
      params,
      timestamp: Date.now(),
      ttl: options?.ttl || 30000,
      priority: options?.priority || 'normal',
      geometric: options?.geometric
    };

    try {
      if (this.connectionState === 'connected') {
        // Send message directly
        await this.client.request({
          method: 'tools/call',
          params: {
            name: 'message.send',
            arguments: {
              from: message.from,
              to: message.to,
              type: message.type,
              method: message.method,
              params: message.params,
              ttl: message.ttl,
              priority: message.priority,
              geometric: message.geometric
            }
          }
        });

        this.emit('message:sent', {
          type: 'message:sent',
          agentId: this.config.agentIdentity.agentId,
          data: message,
          timestamp: Date.now()
        } as MCPEvent);

        console.log(`📤 Message sent: ${method} to ${Array.isArray(to) ? to.join(', ') : to}`);
      } else {
        // Queue message for later
        this.messageQueue.push(message);
        console.log(`📝 Message queued: ${method} to ${Array.isArray(to) ? to.join(', ') : to}`);
      }

      return message.id;
    } catch (error) {
      console.error(`❌ Failed to send message: ${method}`, error);
      throw error;
    }
  }

  /**
   * Send geometric message
   */
  public async sendGeometricMessage(
    to: string | string[],
    content: string,
    shape: 'tetrahedron' | 'cube' | 'octahedron' | 'icosahedron' | 'dodecahedron',
    group?: string
  ): Promise<string> {
    const geometric = {
      shape,
      parents: [],
      group: group || 'default',
      incidence_relations: Array.isArray(to) ? to : [to],
      topological_properties: {
        betti_0: 1,
        betti_1: 0,
        betti_2: 0
      },
      sacred_math: {
        golden_ratio: 1.618,
        fibonacci: 1,
        frequency_432: true
      }
    };

    return await this.sendMessage(to, 'geometric.message', { content }, {
      type: 'geometric',
      priority: 'normal',
      geometric
    });
  }

  /**
   * Join a geometric group
   */
  public async joinGeometricGroup(groupId: string): Promise<boolean> {
    try {
      const result = await this.client.request({
        method: 'tools/call',
        params: {
          name: 'group.join',
          arguments: {
            agentId: this.config.agentIdentity.agentId,
            groupId
          }
        }
      });

      console.log(`🔗 Joined geometric group: ${groupId}`);
      return result.success;
    } catch (error) {
      console.error(`❌ Failed to join group ${groupId}:`, error);
      return false;
    }
  }

  /**
   * Leave a geometric group
   */
  public async leaveGeometricGroup(groupId: string): Promise<boolean> {
    try {
      const result = await this.client.request({
        method: 'tools/call',
        params: {
          name: 'group.leave',
          arguments: {
            agentId: this.config.agentIdentity.agentId,
            groupId
          }
        }
      });

      console.log(`🔗 Left geometric group: ${groupId}`);
      return result.success;
    } catch (error) {
      console.error(`❌ Failed to leave group ${groupId}:`, error);
      return false;
    }
  }

  /**
   * Create a geometric group
   */
  public async createGeometricGroup(
    name: string,
    shape: 'tetrahedron' | 'cube' | 'octahedron' | 'icosahedron' | 'dodecahedron'
  ): Promise<string> {
    try {
      const result = await this.client.request({
        method: 'tools/call',
        params: {
          name: 'group.create',
          arguments: {
            creatorId: this.config.agentIdentity.agentId,
            name,
            shape
          }
        }
      });

      console.log(`🔷 Created geometric group: ${name} (${shape})`);
      return result.groupId;
    } catch (error) {
      console.error(`❌ Failed to create group ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get list of agents
   */
  public async getAgents(): Promise<AgentIdentity[]> {
    try {
      const result = await this.client.request({
        method: 'tools/call',
        params: {
          name: 'agent.list',
          arguments: {}
        }
      });

      return result.agents;
    } catch (error) {
      console.error('❌ Failed to get agents:', error);
      return [];
    }
  }

  /**
   * Get list of geometric groups
   */
  public async getGeometricGroups(): Promise<any[]> {
    try {
      const result = await this.client.request({
        method: 'tools/call',
        params: {
          name: 'group.list',
          arguments: {}
        }
      });

      return result.groups;
    } catch (error) {
      console.error('❌ Failed to get groups:', error);
      return [];
    }
  }

  /**
   * Get server statistics
   */
  public async getStatistics(): Promise<any> {
    try {
      const result = await this.client.request({
        method: 'tools/call',
        params: {
          name: 'statistics.get',
          arguments: {}
        }
      });

      return result.statistics;
    } catch (error) {
      console.error('❌ Failed to get statistics:', error);
      return null;
    }
  }

  /**
   * Handle server notifications
   */
  private handleNotification(notification: any): void {
    try {
      console.log(`📨 Notification received: ${notification.method}`);

      // Emit notification event
      this.emit('notification', {
        type: 'notification',
        data: notification,
        timestamp: Date.now()
      } as MCPEvent);

      // Handle specific notification types
      switch (notification.method) {
        case 'agent.registered':
          this.emit('agent:registered', notification.params.agent);
          break;
        
        case 'agent.unregistered':
          this.emit('agent:unregistered', notification.params.agentId);
          break;
        
        case 'group.formed':
          this.emit('group:formed', notification.params.group);
          break;
        
        case 'message.received':
          this.emit('message:received', notification.params.message);
          break;
      }
    } catch (error) {
      console.error('❌ Error handling notification:', error);
    }
  }

  /**
   * Handle client errors
   */
  private handleError(error: any): void {
    console.error('❌ MCP Client error:', error);
    this.emit('error', error);
  }

  /**
   * Handle disconnection
   */
  private handleDisconnect(): void {
    console.log('🔌 MCP Client disconnected');
    this.connectionState = 'disconnected';
    this.emit('connection:state', this.connectionState);

    if (this.config.transport.reconnect) {
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.transport.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.transport.reconnectInterval * this.reconnectAttempts;

    console.log(`🔄 Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('❌ Reconnection failed:', error);
      }
    }, delay);
  }

  /**
   * Process queued messages
   */
  private async processMessageQueue(): Promise<void> {
    if (this.messageQueue.length === 0) {
      return;
    }

    console.log(`📝 Processing ${this.messageQueue.length} queued messages`);

    const messages = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of messages) {
      try {
        await this.client.request({
          method: 'tools/call',
          params: {
            name: 'message.send',
            arguments: {
              from: message.from,
              to: message.to,
              type: message.type,
              method: message.method,
              params: message.params,
              ttl: message.ttl,
              priority: message.priority,
              geometric: message.geometric
            }
          }
        });

        console.log(`📤 Queued message sent: ${message.method}`);
      } catch (error) {
        console.error(`❌ Failed to send queued message: ${message.method}`, error);
        // Re-queue failed message
        this.messageQueue.push(message);
      }
    }
  }

  /**
   * Get connection state
   */
  public getConnectionState(): MCPConnectionState {
    return this.connectionState;
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  /**
   * Get agent identity
   */
  public getAgentIdentity(): AgentIdentity {
    return this.config.agentIdentity;
  }

  /**
   * Get queued message count
   */
  public getQueuedMessageCount(): number {
    return this.messageQueue.length;
  }
}

