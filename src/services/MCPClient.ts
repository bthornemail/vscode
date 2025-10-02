import { BehaviorSubject, Observable, Subject } from 'rxjs';
import type { 
  KnowledgeGraph, 
  AgentWorkflowState, 
  ProjectState, 
  MCPResponse,
  CodeGenerationRequest,
  CodeAnalysisResult
} from '../types/ide';

/**
 * HyperDev MCP Client
 * 
 * Manages communication with the H²GNN MCP Server for:
 * - Knowledge graph operations
 * - Agent workflow execution
 * - Hyperbolic embedding generation
 * - Real-time collaboration
 */
export class HyperDevMCPClient {
  private socket: WebSocket | null = null;
  private messageId: number = 0;
  private pendingRequests: Map<number, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }> = new Map();
  
  // Reactive state streams
  private connectionState$ = new BehaviorSubject<'disconnected' | 'connecting' | 'connected'>('disconnected');
  private knowledgeGraph$ = new BehaviorSubject<KnowledgeGraph | null>(null);
  private activeAgents$ = new BehaviorSubject<AgentWorkflowState[]>([]);
  private collaborationEvents$ = new Subject<any>();
  
  // Configuration
  private endpoint: string = 'ws://localhost:3001/mcp';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor(endpoint?: string) {
    if (endpoint) {
      this.endpoint = endpoint;
    }
  }

  // Connection Management

  async connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.connectionState$.next('connecting');
    
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.endpoint);
        
        this.socket.onopen = () => {
          console.log('✅ Connected to H²GNN MCP Server');
          this.connectionState$.next('connected');
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };
        
        this.socket.onclose = (event) => {
          console.log('🔌 Disconnected from MCP Server:', event.code, event.reason);
          this.connectionState$.next('disconnected');
          this.handleDisconnection();
        };
        
        this.socket.onerror = (error) => {
          console.error('❌ MCP WebSocket error:', error);
          this.connectionState$.next('disconnected');
          reject(new Error('Failed to connect to MCP server'));
        };
        
        // Connection timeout
        setTimeout(() => {
          if (this.connectionState$.value !== 'connected') {
            reject(new Error('Connection timeout'));
          }
        }, 10000);
        
      } catch (error) {
        this.connectionState$.next('disconnected');
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connectionState$.next('disconnected');
  }

  async reconnect(): Promise<void> {
    await this.disconnect();
    await this.connect();
  }

  // Observable getters
  get connectionState(): Observable<'disconnected' | 'connecting' | 'connected'> {
    return this.connectionState$.asObservable();
  }

  get knowledgeGraph(): Observable<KnowledgeGraph | null> {
    return this.knowledgeGraph$.asObservable();
  }

  get activeAgents(): Observable<AgentWorkflowState[]> {
    return this.activeAgents$.asObservable();
  }

  get collaborationEvents(): Observable<any> {
    return this.collaborationEvents$.asObservable();
  }

  get isConnected(): boolean {
    return this.connectionState$.value === 'connected';
  }

  // Message Handling

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      if (message.id && this.pendingRequests.has(message.id)) {
        // Handle response to request
        const request = this.pendingRequests.get(message.id)!;
        clearTimeout(request.timeout);
        this.pendingRequests.delete(message.id);
        
        if (message.error) {
          request.reject(new Error(message.error.message || 'MCP request failed'));
        } else {
          request.resolve(message.result);
        }
      } else {
        // Handle notification/event
        this.handleNotification(message);
      }
    } catch (error) {
      console.error('Failed to parse MCP message:', error);
    }
  }

  private handleNotification(message: any): void {
    switch (message.method) {
      case 'knowledge_graph_updated':
        this.knowledgeGraph$.next(message.params.graph);
        break;
        
      case 'agent_state_changed':
        this.updateAgentState(message.params);
        break;
        
      case 'collaboration_event':
        this.collaborationEvents$.next(message.params);
        break;
        
      default:
        console.log('Unknown MCP notification:', message.method);
    }
  }

  private handleDisconnection(): void {
    // Clear pending requests
    for (const [id, request] of this.pendingRequests) {
      clearTimeout(request.timeout);
      request.reject(new Error('Connection lost'));
    }
    this.pendingRequests.clear();
    
    // Attempt reconnection
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.connect().catch(console.error);
      }, delay);
    }
  }

  private updateAgentState(params: any): void {
    const currentAgents = this.activeAgents$.value;
    const updatedAgents = currentAgents.map(agent => 
      agent.id === params.agentId 
        ? { ...agent, ...params.updates }
        : agent
    );
    
    // Add new agent if not exists
    if (!currentAgents.find(a => a.id === params.agentId)) {
      updatedAgents.push(params.agentState);
    }
    
    this.activeAgents$.next(updatedAgents);
  }

  // MCP Tool Calls

  private async callTool(toolName: string, params: any = {}): Promise<any> {
    if (!this.isConnected) {
      throw new Error('Not connected to MCP server');
    }

    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      
      const message = {
        jsonrpc: '2.0',
        id,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: params
        }
      };

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`MCP request timeout for tool: ${toolName}`));
      }, 30000);

      this.pendingRequests.set(id, { resolve, reject, timeout });
      
      this.socket!.send(JSON.stringify(message));
    });
  }

  // Project Management

  async loadProject(projectId: string): Promise<ProjectState> {
    const result = await this.callTool('load_project', { projectId });
    return result.project;
  }

  async saveProject(project: ProjectState): Promise<void> {
    await this.callTool('save_project', { project });
  }

  async analyzeProject(projectPath: string): Promise<KnowledgeGraph> {
    const result = await this.callTool('analyze_path_to_knowledge_graph', {
      path: projectPath,
      recursive: true,
      includeContent: true,
      maxDepth: 10,
      filePatterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.py'],
      excludePatterns: ['**/node_modules/**', '**/dist/**', '**/.git/**']
    });
    
    const knowledgeGraph = this.parseKnowledgeGraphResponse(result);
    this.knowledgeGraph$.next(knowledgeGraph);
    return knowledgeGraph;
  }

  // Code Operations

  async generateCode(request: CodeGenerationRequest): Promise<string> {
    const result = await this.callTool('generate_code_from_graph', {
      type: request.type || 'function',
      description: request.description,
      context: request.context,
      constraints: request.constraints
    });
    
    return this.extractGeneratedCode(result);
  }

  async analyzeCode(code: string, context?: any): Promise<CodeAnalysisResult> {
    const result = await this.callTool('analyze_code_semantics', {
      code,
      context: context || {}
    });
    
    return {
      complexity: result.complexity || 0,
      patterns: result.patterns || [],
      suggestions: result.suggestions || [],
      embedding: result.embedding || null,
      relationships: result.relationships || []
    };
  }

  async findSimilarCode(code: string, limit: number = 10): Promise<any[]> {
    const result = await this.callTool('query_knowledge_graph', {
      query: code,
      type: 'similarity',
      limit
    });
    
    return result.matches || [];
  }

  async explainCode(code: string, context?: any): Promise<string> {
    const result = await this.callTool('explain_code', {
      code,
      context: context || {}
    });
    
    return result.explanation || 'No explanation available';
  }

  // Knowledge Graph Operations

  async getKnowledgeGraph(): Promise<KnowledgeGraph | null> {
    try {
      const result = await this.callTool('get_graph_visualization', {
        layout: 'force'
      });
      
      const graph = this.parseKnowledgeGraphResponse(result);
      this.knowledgeGraph$.next(graph);
      return graph;
    } catch (error) {
      console.error('Failed to get knowledge graph:', error);
      return null;
    }
  }

  async searchKnowledgeGraph(query: string, type: string = 'similarity'): Promise<any[]> {
    const result = await this.callTool('query_knowledge_graph', {
      query,
      type,
      limit: 20
    });
    
    return result.matches || [];
  }

  // Agent Management

  async spawnAgent(agentType: string, configuration: any): Promise<AgentWorkflowState> {
    const result = await this.callTool('spawn_agent', {
      type: agentType,
      config: configuration
    });
    
    const agentState: AgentWorkflowState = {
      id: result.agentId,
      type: agentType,
      status: 'idle',
      currentNode: '',
      progress: 0,
      outputs: [],
      configuration
    };
    
    // Update local state
    const currentAgents = this.activeAgents$.value;
    this.activeAgents$.next([...currentAgents, agentState]);
    
    return agentState;
  }

  async executeAgentWorkflow(agentId: string, workflow: any): Promise<any> {
    const result = await this.callTool('execute_workflow', {
      agentId,
      workflow
    });
    
    return result;
  }

  async terminateAgent(agentId: string): Promise<void> {
    await this.callTool('terminate_agent', { agentId });
    
    // Update local state
    const currentAgents = this.activeAgents$.value;
    this.activeAgents$.next(currentAgents.filter(a => a.id !== agentId));
  }

  // Collaboration Features

  async joinCollaborationSession(sessionId: string): Promise<void> {
    await this.callTool('join_collaboration', { sessionId });
  }

  async sendCollaborationMessage(message: string, type: string = 'chat'): Promise<void> {
    await this.callTool('send_collaboration_message', {
      message,
      type,
      timestamp: new Date().toISOString()
    });
  }

  async shareAgentWithCollaborators(agentId: string, collaborators: string[]): Promise<void> {
    await this.callTool('share_agent', {
      agentId,
      collaborators
    });
  }

  // Hyperbolic Operations

  async computeHyperbolicDistance(concept1: string, concept2: string): Promise<number> {
    const result = await this.callTool('compute_hyperbolic_distance', {
      concept1,
      concept2
    });
    
    return result.distance || 0;
  }

  async exploreSemanticSpace(startConcept: string, depth: number = 3): Promise<any[]> {
    const result = await this.callTool('explore_semantic_space', {
      startConcept,
      depth,
      maxResults: 20
    });
    
    return result.concepts || [];
  }

  // Utility Methods

  private parseKnowledgeGraphResponse(response: any): KnowledgeGraph {
    try {
      // Parse the MCP response and extract knowledge graph data
      const content = response.content?.[0]?.text || '';
      
      // Try to extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[1]);
        return {
          nodes: data.nodes || [],
          edges: data.edges || [],
          metadata: data.metadata || {}
        };
      }
      
      // Fallback to empty graph
      return {
        nodes: [],
        edges: [],
        metadata: {}
      };
      
    } catch (error) {
      console.error('Failed to parse knowledge graph response:', error);
      return {
        nodes: [],
        edges: [],
        metadata: {}
      };
    }
  }

  private extractGeneratedCode(response: any): string {
    try {
      const content = response.content?.[0]?.text || '';
      
      // Extract code from markdown code blocks
      const codeMatch = content.match(/```[\w]*\n([\s\S]*?)\n```/);
      if (codeMatch) {
        return codeMatch[1];
      }
      
      return content;
      
    } catch (error) {
      console.error('Failed to extract generated code:', error);
      return '';
    }
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
    this.connectionState$.complete();
    this.knowledgeGraph$.complete();
    this.activeAgents$.complete();
    this.collaborationEvents$.complete();
  }
}
