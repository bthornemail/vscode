import { Observable } from 'rxjs';
import type { KnowledgeGraph, AgentWorkflowState, ProjectState, CodeGenerationRequest, CodeAnalysisResult } from '../types/ide';
/**
 * HyperDev MCP Client
 *
 * Manages communication with the H²GNN MCP Server for:
 * - Knowledge graph operations
 * - Agent workflow execution
 * - Hyperbolic embedding generation
 * - Real-time collaboration
 */
export declare class HyperDevMCPClient {
    private socket;
    private messageId;
    private pendingRequests;
    private connectionState$;
    private knowledgeGraph$;
    private activeAgents$;
    private collaborationEvents$;
    private endpoint;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectDelay;
    constructor(endpoint?: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    reconnect(): Promise<void>;
    get connectionState(): Observable<'disconnected' | 'connecting' | 'connected'>;
    get knowledgeGraph(): Observable<KnowledgeGraph | null>;
    get activeAgents(): Observable<AgentWorkflowState[]>;
    get collaborationEvents(): Observable<any>;
    get isConnected(): boolean;
    private handleMessage;
    private handleNotification;
    private handleDisconnection;
    private updateAgentState;
    private callTool;
    loadProject(projectId: string): Promise<ProjectState>;
    saveProject(project: ProjectState): Promise<void>;
    analyzeProject(projectPath: string): Promise<KnowledgeGraph>;
    generateCode(request: CodeGenerationRequest): Promise<string>;
    analyzeCode(code: string, context?: any): Promise<CodeAnalysisResult>;
    findSimilarCode(code: string, limit?: number): Promise<any[]>;
    explainCode(code: string, context?: any): Promise<string>;
    getKnowledgeGraph(): Promise<KnowledgeGraph | null>;
    searchKnowledgeGraph(query: string, type?: string): Promise<any[]>;
    spawnAgent(agentType: string, configuration: any): Promise<AgentWorkflowState>;
    executeAgentWorkflow(agentId: string, workflow: any): Promise<any>;
    terminateAgent(agentId: string): Promise<void>;
    joinCollaborationSession(sessionId: string): Promise<void>;
    sendCollaborationMessage(message: string, type?: string): Promise<void>;
    shareAgentWithCollaborators(agentId: string, collaborators: string[]): Promise<void>;
    computeHyperbolicDistance(concept1: string, concept2: string): Promise<number>;
    exploreSemanticSpace(startConcept: string, depth?: number): Promise<any[]>;
    private parseKnowledgeGraphResponse;
    private extractGeneratedCode;
    destroy(): void;
}
//# sourceMappingURL=MCPClient.d.ts.map