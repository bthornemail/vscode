/**
 * MCP Server
 * 
 * Implements the Model Context Protocol server for LLM agent-to-agent communication
 * with geometric message routing and autonomous coordination.
 */

import { EventEmitter } from 'events';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { WebSocketServerTransport } from '@modelcontextprotocol/sdk/server/websocket.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { MCPAgentRegistry } from './MCPAgentRegistry';
import {
  MCPServerConfig,
  MCPMessage,
  MCPTool,
  MCPResource,
  MCPPrompt,
  AgentIdentity,
  MCPEvent,
  MCPStatistics
} from './types';

export class MCPServer extends EventEmitter {
  private config: MCPServerConfig;
  private server: Server;
  private transport: any;
  private registry: MCPAgentRegistry;
  private isRunning: boolean = false;

  constructor(config: MCPServerConfig) {
    super();
    this.config = config;
    this.registry = new MCPAgentRegistry();
    this.server = new Server(
      {
        name: this.config.name,
        version: this.config.version
      },
      {
        capabilities: {
          tools: this.config.capabilities.tools,
          resources: this.config.capabilities.resources,
          prompts: this.config.capabilities.prompts,
          logging: this.config.capabilities.logging
        }
      }
    );

    this.setupServer();
    this.setupRegistryEvents();
  }

  /**
   * Setup MCP server with tools, resources, and prompts
   */
  private setupServer(): void {
    // Setup tools
    if (this.config.capabilities.tools) {
      this.server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
          tools: this.config.tools.map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema
          }))
        };
      });

      this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
        return await this.handleToolCall(request.params.name, request.params.arguments);
      });
    }

    // Setup resources
    if (this.config.capabilities.resources) {
      this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
        return {
          resources: this.config.resources.map(resource => ({
            uri: resource.uri,
            name: resource.name,
            description: resource.description,
            mimeType: resource.mimeType
          }))
        };
      });

      this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        return await this.handleResourceRead(request.params.uri);
      });
    }

    // Setup prompts
    if (this.config.capabilities.prompts) {
      this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
        return {
          prompts: this.config.prompts.map(prompt => ({
            name: prompt.name,
            description: prompt.description,
            arguments: prompt.arguments
          }))
        };
      });

      this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
        return await this.handlePromptGet(request.params.name, request.params.arguments);
      });
    }
  }

  /**
   * Setup registry event handlers
   */
  private setupRegistryEvents(): void {
    this.registry.on('agent:registered', (event: MCPEvent) => {
      this.emit('agent:registered', event);
      this.broadcastMessage({
        id: uuidv4(),
        from: 'server',
        to: 'broadcast',
        type: 'notification',
        method: 'agent.registered',
        params: { agent: event.data },
        timestamp: Date.now(),
        ttl: 30000,
        priority: 'normal'
      });
    });

    this.registry.on('agent:unregistered', (event: MCPEvent) => {
      this.emit('agent:unregistered', event);
      this.broadcastMessage({
        id: uuidv4(),
        from: 'server',
        to: 'broadcast',
        type: 'notification',
        method: 'agent.unregistered',
        params: { agentId: event.agentId },
        timestamp: Date.now(),
        ttl: 30000,
        priority: 'normal'
      });
    });

    this.registry.on('group:formed', (event: MCPEvent) => {
      this.emit('group:formed', event);
      this.broadcastMessage({
        id: uuidv4(),
        from: 'server',
        to: 'broadcast',
        type: 'notification',
        method: 'group.formed',
        params: { group: event.data },
        timestamp: Date.now(),
        ttl: 30000,
        priority: 'normal'
      });
    });
  }

  /**
   * Start the MCP server
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log('MCP Server already running');
      return;
    }

    try {
      // Setup transport based on configuration
      if (this.config.transport.type === 'stdio') {
        this.transport = new StdioServerTransport();
      } else if (this.config.transport.type === 'websocket') {
        this.transport = new WebSocketServerTransport({
          host: this.config.transport.host || 'localhost',
          port: this.config.transport.port || 3000,
          path: this.config.transport.path || '/mcp'
        });
      } else {
        throw new Error(`Unsupported transport type: ${this.config.transport.type}`);
      }

      // Connect server to transport
      await this.server.connect(this.transport);

      this.isRunning = true;
      console.log(`🚀 MCP Server started: ${this.config.name} v${this.config.version}`);
      console.log(`   Transport: ${this.config.transport.type}`);
      if (this.config.transport.type === 'websocket') {
        console.log(`   URL: ws://${this.config.transport.host}:${this.config.transport.port}${this.config.transport.path}`);
      }

      // Register initial agents
      for (const agent of this.config.agents) {
        this.registry.registerAgent(agent);
      }

    } catch (error) {
      console.error('❌ Failed to start MCP Server:', error);
      throw error;
    }
  }

  /**
   * Stop the MCP server
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      if (this.transport) {
        await this.transport.close();
      }
      
      this.isRunning = false;
      console.log('🛑 MCP Server stopped');
    } catch (error) {
      console.error('❌ Error stopping MCP Server:', error);
      throw error;
    }
  }

  /**
   * Register an agent
   */
  public registerAgent(identity: AgentIdentity): boolean {
    return this.registry.registerAgent(identity);
  }

  /**
   * Unregister an agent
   */
  public unregisterAgent(agentId: string): boolean {
    return this.registry.unregisterAgent(agentId);
  }

  /**
   * Get agent by ID
   */
  public getAgent(agentId: string): AgentIdentity | undefined {
    return this.registry.getAgent(agentId);
  }

  /**
   * Get all agents
   */
  public getAllAgents(): AgentIdentity[] {
    return this.registry.getAllAgents();
  }

  /**
   * Send message to specific agent
   */
  public sendMessageToAgent(agentId: string, message: MCPMessage): boolean {
    try {
      // Store message in registry
      this.registry.storeMessage(message);

      // Emit message sent event
      this.emit('message:sent', {
        type: 'message:sent',
        agentId: message.from,
        data: message,
        timestamp: Date.now()
      } as MCPEvent);

      console.log(`📤 Message sent to agent ${agentId}: ${message.method}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send message to agent ${agentId}:`, error);
      return false;
    }
  }

  /**
   * Broadcast message to all agents
   */
  public broadcastMessage(message: MCPMessage): void {
    try {
      // Store message in registry
      this.registry.storeMessage(message);

      // Emit broadcast event
      this.emit('message:broadcast', {
        type: 'message:broadcast',
        data: message,
        timestamp: Date.now()
      } as MCPEvent);

      console.log(`📢 Message broadcasted: ${message.method}`);
    } catch (error) {
      console.error('❌ Failed to broadcast message:', error);
    }
  }

  /**
   * Create geometric group
   */
  public createGeometricGroup(
    creatorId: string,
    name: string,
    shape: 'tetrahedron' | 'cube' | 'octahedron' | 'icosahedron' | 'dodecahedron'
  ): string {
    return this.registry.createGeometricGroup(creatorId, name, shape);
  }

  /**
   * Join geometric group
   */
  public joinGeometricGroup(agentId: string, groupId: string): boolean {
    return this.registry.joinGeometricGroup(agentId, groupId);
  }

  /**
   * Leave geometric group
   */
  public leaveGeometricGroup(agentId: string, groupId: string): boolean {
    return this.registry.leaveGeometricGroup(agentId, groupId);
  }

  /**
   * Get geometric group
   */
  public getGeometricGroup(groupId: string): any {
    return this.registry.getGeometricGroup(groupId);
  }

  /**
   * Get all geometric groups
   */
  public getAllGeometricGroups(): any[] {
    return this.registry.getAllGeometricGroups();
  }

  /**
   * Handle tool call
   */
  private async handleToolCall(toolName: string, args: any): Promise<any> {
    try {
      const tool = this.config.tools.find(t => t.name === toolName);
      if (!tool) {
        throw new Error(`Tool ${toolName} not found`);
      }

      // Emit tool invocation event
      this.emit('tool:invoked', {
        type: 'tool:invoked',
        data: { toolName, args },
        timestamp: Date.now()
      } as MCPEvent);

      // Execute tool based on name
      switch (toolName) {
        case 'agent.list':
          return { agents: this.registry.getAllAgents() };
        
        case 'agent.get':
          const agent = this.registry.getAgent(args.agentId);
          return { agent };
        
        case 'group.create':
          const groupId = this.registry.createGeometricGroup(args.creatorId, args.name, args.shape);
          return { groupId };
        
        case 'group.join':
          const joined = this.registry.joinGeometricGroup(args.agentId, args.groupId);
          return { success: joined };
        
        case 'group.leave':
          const left = this.registry.leaveGeometricGroup(args.agentId, args.groupId);
          return { success: left };
        
        case 'group.list':
          return { groups: this.registry.getAllGeometricGroups() };
        
        case 'message.send':
          const message: MCPMessage = {
            id: uuidv4(),
            from: args.from,
            to: args.to,
            type: args.type || 'request',
            method: args.method,
            params: args.params,
            timestamp: Date.now(),
            ttl: args.ttl || 30000,
            priority: args.priority || 'normal'
          };
          this.registry.storeMessage(message);
          return { messageId: message.id };
        
        case 'statistics.get':
          return { statistics: this.registry.getStatistics() };
        
        default:
          throw new Error(`Tool ${toolName} not implemented`);
      }
    } catch (error) {
      console.error(`❌ Tool call failed: ${toolName}`, error);
      throw error;
    }
  }

  /**
   * Handle resource read
   */
  private async handleResourceRead(uri: string): Promise<any> {
    try {
      const resource = this.config.resources.find(r => r.uri === uri);
      if (!resource) {
        throw new Error(`Resource ${uri} not found`);
      }

      // Emit resource access event
      this.emit('resource:accessed', {
        type: 'resource:accessed',
        data: { uri },
        timestamp: Date.now()
      } as MCPEvent);

      // Return resource data based on URI
      switch (uri) {
        case 'agents://registry':
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(this.registry.getAllAgents(), null, 2)
            }]
          };
        
        case 'groups://geometric':
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(this.registry.getAllGeometricGroups(), null, 2)
            }]
          };
        
        case 'statistics://server':
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(this.registry.getStatistics(), null, 2)
            }]
          };
        
        default:
          throw new Error(`Resource ${uri} not implemented`);
      }
    } catch (error) {
      console.error(`❌ Resource read failed: ${uri}`, error);
      throw error;
    }
  }

  /**
   * Handle prompt get
   */
  private async handlePromptGet(promptName: string, args: any): Promise<any> {
    try {
      const prompt = this.config.prompts.find(p => p.name === promptName);
      if (!prompt) {
        throw new Error(`Prompt ${promptName} not found`);
      }

      // Emit prompt execution event
      this.emit('prompt:executed', {
        type: 'prompt:executed',
        data: { promptName, args },
        timestamp: Date.now()
      } as MCPEvent);

      // Return prompt based on name
      switch (promptName) {
        case 'agent.analyze':
          return {
            description: `Analyze agent ${args.agentId} capabilities and geometric properties`,
            messages: [{
              role: 'user',
              content: {
                type: 'text',
                text: `Analyze the agent with ID ${args.agentId}. Consider its geometric properties, consciousness levels, and capabilities.`
              }
            }]
          };
        
        case 'group.consensus':
          return {
            description: `Achieve consensus in geometric group ${args.groupId}`,
            messages: [{
              role: 'user',
              content: {
                type: 'text',
                text: `Help achieve consensus in the geometric group ${args.groupId}. Consider the group's shape, member capabilities, and topological properties.`
              }
            }]
          };
        
        case 'message.compose':
          return {
            description: `Compose a geometric message for agent communication`,
            messages: [{
              role: 'user',
              content: {
                type: 'text',
                text: `Compose a message to ${args.targetAgent} about ${args.topic}. Include appropriate geometric metadata and topological properties.`
              }
            }]
          };
        
        default:
          throw new Error(`Prompt ${promptName} not implemented`);
      }
    } catch (error) {
      console.error(`❌ Prompt execution failed: ${promptName}`, error);
      throw error;
    }
  }

  /**
   * Get server statistics
   */
  public getStatistics(): MCPStatistics {
    return this.registry.getStatistics();
  }

  /**
   * Get registry state
   */
  public getRegistryState(): any {
    return this.registry.getRegistryState();
  }

  /**
   * Check if server is running
   */
  public isServerRunning(): boolean {
    return this.isRunning;
  }
}

