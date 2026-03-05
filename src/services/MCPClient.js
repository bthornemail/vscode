import { BehaviorSubject, Subject } from 'rxjs';
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
    constructor(endpoint) {
        Object.defineProperty(this, "socket", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "messageId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "pendingRequests", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        // Reactive state streams
        Object.defineProperty(this, "connectionState$", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new BehaviorSubject('disconnected')
        });
        Object.defineProperty(this, "knowledgeGraph$", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new BehaviorSubject(null)
        });
        Object.defineProperty(this, "activeAgents$", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new BehaviorSubject([])
        });
        Object.defineProperty(this, "collaborationEvents$", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Subject()
        });
        // Configuration
        Object.defineProperty(this, "endpoint", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'ws://localhost:3001/mcp'
        });
        Object.defineProperty(this, "reconnectAttempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "maxReconnectAttempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 5
        });
        Object.defineProperty(this, "reconnectDelay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1000
        });
        if (endpoint) {
            this.endpoint = endpoint;
        }
    }
    // Connection Management
    async connect() {
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
            }
            catch (error) {
                this.connectionState$.next('disconnected');
                reject(error);
            }
        });
    }
    async disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.connectionState$.next('disconnected');
    }
    async reconnect() {
        await this.disconnect();
        await this.connect();
    }
    // Observable getters
    get connectionState() {
        return this.connectionState$.asObservable();
    }
    get knowledgeGraph() {
        return this.knowledgeGraph$.asObservable();
    }
    get activeAgents() {
        return this.activeAgents$.asObservable();
    }
    get collaborationEvents() {
        return this.collaborationEvents$.asObservable();
    }
    get isConnected() {
        return this.connectionState$.value === 'connected';
    }
    // Message Handling
    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            if (message.id && this.pendingRequests.has(message.id)) {
                // Handle response to request
                const request = this.pendingRequests.get(message.id);
                clearTimeout(request.timeout);
                this.pendingRequests.delete(message.id);
                if (message.error) {
                    request.reject(new Error(message.error.message || 'MCP request failed'));
                }
                else {
                    request.resolve(message.result);
                }
            }
            else {
                // Handle notification/event
                this.handleNotification(message);
            }
        }
        catch (error) {
            console.error('Failed to parse MCP message:', error);
        }
    }
    handleNotification(message) {
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
    handleDisconnection() {
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
    updateAgentState(params) {
        const currentAgents = this.activeAgents$.value;
        const updatedAgents = currentAgents.map(agent => agent.id === params.agentId
            ? { ...agent, ...params.updates }
            : agent);
        // Add new agent if not exists
        if (!currentAgents.find(a => a.id === params.agentId)) {
            updatedAgents.push(params.agentState);
        }
        this.activeAgents$.next(updatedAgents);
    }
    // MCP Tool Calls
    async callTool(toolName, params = {}) {
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
            this.socket.send(JSON.stringify(message));
        });
    }
    // Project Management
    async loadProject(projectId) {
        const result = await this.callTool('load_project', { projectId });
        return result.project;
    }
    async saveProject(project) {
        await this.callTool('save_project', { project });
    }
    async analyzeProject(projectPath) {
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
    async generateCode(request) {
        const result = await this.callTool('generate_code_from_graph', {
            type: request.type || 'function',
            description: request.description,
            context: request.context,
            constraints: request.constraints
        });
        return this.extractGeneratedCode(result);
    }
    async analyzeCode(code, context) {
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
    async findSimilarCode(code, limit = 10) {
        const result = await this.callTool('query_knowledge_graph', {
            query: code,
            type: 'similarity',
            limit
        });
        return result.matches || [];
    }
    async explainCode(code, context) {
        const result = await this.callTool('explain_code', {
            code,
            context: context || {}
        });
        return result.explanation || 'No explanation available';
    }
    // Knowledge Graph Operations
    async getKnowledgeGraph() {
        try {
            const result = await this.callTool('get_graph_visualization', {
                layout: 'force'
            });
            const graph = this.parseKnowledgeGraphResponse(result);
            this.knowledgeGraph$.next(graph);
            return graph;
        }
        catch (error) {
            console.error('Failed to get knowledge graph:', error);
            return null;
        }
    }
    async searchKnowledgeGraph(query, type = 'similarity') {
        const result = await this.callTool('query_knowledge_graph', {
            query,
            type,
            limit: 20
        });
        return result.matches || [];
    }
    // Agent Management
    async spawnAgent(agentType, configuration) {
        const result = await this.callTool('spawn_agent', {
            type: agentType,
            config: configuration
        });
        const agentState = {
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
    async executeAgentWorkflow(agentId, workflow) {
        const result = await this.callTool('execute_workflow', {
            agentId,
            workflow
        });
        return result;
    }
    async terminateAgent(agentId) {
        await this.callTool('terminate_agent', { agentId });
        // Update local state
        const currentAgents = this.activeAgents$.value;
        this.activeAgents$.next(currentAgents.filter(a => a.id !== agentId));
    }
    // Collaboration Features
    async joinCollaborationSession(sessionId) {
        await this.callTool('join_collaboration', { sessionId });
    }
    async sendCollaborationMessage(message, type = 'chat') {
        await this.callTool('send_collaboration_message', {
            message,
            type,
            timestamp: new Date().toISOString()
        });
    }
    async shareAgentWithCollaborators(agentId, collaborators) {
        await this.callTool('share_agent', {
            agentId,
            collaborators
        });
    }
    // Hyperbolic Operations
    async computeHyperbolicDistance(concept1, concept2) {
        const result = await this.callTool('compute_hyperbolic_distance', {
            concept1,
            concept2
        });
        return result.distance || 0;
    }
    async exploreSemanticSpace(startConcept, depth = 3) {
        const result = await this.callTool('explore_semantic_space', {
            startConcept,
            depth,
            maxResults: 20
        });
        return result.concepts || [];
    }
    // Utility Methods
    parseKnowledgeGraphResponse(response) {
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
        }
        catch (error) {
            console.error('Failed to parse knowledge graph response:', error);
            return {
                nodes: [],
                edges: [],
                metadata: {}
            };
        }
    }
    extractGeneratedCode(response) {
        try {
            const content = response.content?.[0]?.text || '';
            // Extract code from markdown code blocks
            const codeMatch = content.match(/```[\w]*\n([\s\S]*?)\n```/);
            if (codeMatch) {
                return codeMatch[1];
            }
            return content;
        }
        catch (error) {
            console.error('Failed to extract generated code:', error);
            return '';
        }
    }
    // Cleanup
    destroy() {
        this.disconnect();
        this.connectionState$.complete();
        this.knowledgeGraph$.complete();
        this.activeAgents$.complete();
        this.collaborationEvents$.complete();
    }
}
//# sourceMappingURL=MCPClient.js.map