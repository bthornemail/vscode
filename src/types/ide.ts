// Core IDE Types for HyperDev

// ============================================================================
// Project & File Management
// ============================================================================

export interface ProjectState {
  id: string;
  name: string;
  path: string;
  files: ProjectFile[];
  metadata: ProjectMetadata;
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  language?: string;
  size?: number;
  lastModified?: Date;
  children?: ProjectFile[];
}

export interface ProjectMetadata {
  createdAt: Date;
  lastModified: Date;
  language: string;
  framework?: string;
  description?: string;
  tags?: string[];
  collaborators?: string[];
}

// ============================================================================
// Knowledge Graph
// ============================================================================

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  metadata: KnowledgeGraphMetadata;
}

export interface KnowledgeGraphNode {
  id: string;
  type: 'file' | 'class' | 'function' | 'interface' | 'variable' | 'concept' | 'module';
  name: string;
  content?: string;
  metadata: NodeMetadata;
  embedding?: HyperbolicEmbedding;
  connections: string[];
  position?: { x: number; y: number; z?: number };
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'imports' | 'extends' | 'implements' | 'calls' | 'references' | 'defines' | 'uses';
  weight: number;
  metadata?: EdgeMetadata;
}

export interface NodeMetadata {
  filePath?: string;
  lineStart?: number;
  lineEnd?: number;
  complexity?: number;
  description?: string;
  documentation?: string;
  parameters?: Parameter[];
  returnType?: string;
  visibility?: 'public' | 'private' | 'protected';
  static?: boolean;
  abstract?: boolean;
}

export interface EdgeMetadata {
  strength?: number;
  direction?: 'bidirectional' | 'unidirectional';
  context?: string;
  frequency?: number;
}

export interface Parameter {
  name: string;
  type: string;
  optional?: boolean;
  defaultValue?: string;
  description?: string;
}

export interface KnowledgeGraphMetadata {
  generatedAt: Date;
  rootPath: string;
  totalFiles: number;
  totalLines: number;
  languages: string[];
  avgComplexity: number;
  nodeCount: number;
  edgeCount: number;
  version: string;
}

// ============================================================================
// Hyperbolic Embeddings
// ============================================================================

export interface HyperbolicEmbedding {
  vector: number[];
  norm: number;
  dimension: number;
  model?: string;
  confidence?: number;
}

export interface HyperbolicSpace {
  dimension: number;
  curvature: number;
  metric: 'poincare' | 'lorentz' | 'klein';
}

export interface SemanticSimilarity {
  sourceId: string;
  targetId: string;
  similarity: number;
  distance: number;
  method: 'hyperbolic' | 'euclidean' | 'cosine';
}

// ============================================================================
// Agent System
// ============================================================================

export interface AgentWorkflowState {
  id: string;
  type: 'pocketflow' | 'h2gnn' | 'hybrid' | 'custom';
  status: 'idle' | 'running' | 'completed' | 'error' | 'paused';
  currentNode: string;
  progress: number;
  outputs: AgentOutput[];
  configuration: AgentConfiguration;
  metadata?: AgentMetadata;
}

export interface AgentConfiguration {
  name: string;
  description?: string;
  capabilities: AgentCapability[];
  parameters: Record<string, any>;
  constraints?: AgentConstraints;
  permissions?: AgentPermissions;
}

export interface AgentCapability {
  type: 'code_generation' | 'code_analysis' | 'refactoring' | 'documentation' | 'testing' | 'review';
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  domains: string[];
}

export interface AgentConstraints {
  maxExecutionTime?: number;
  maxMemoryUsage?: number;
  allowedOperations?: string[];
  restrictedPaths?: string[];
  outputFormat?: string;
}

export interface AgentPermissions {
  canReadFiles: boolean;
  canWriteFiles: boolean;
  canExecuteCode: boolean;
  canAccessNetwork: boolean;
  canModifyProject: boolean;
  allowedCollaborators?: string[];
}

export interface AgentOutput {
  id: string;
  type: 'code' | 'text' | 'data' | 'visualization' | 'error';
  content: any;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AgentMetadata {
  createdAt: Date;
  lastActive: Date;
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  creator: string;
}

// ============================================================================
// Code Operations
// ============================================================================

export interface CodeGenerationRequest {
  description: string;
  type?: 'function' | 'class' | 'interface' | 'module' | 'test' | 'documentation';
  context?: CodeContext;
  constraints?: CodeConstraints;
  style?: CodeStyle;
}

export interface CodeContext {
  filePath?: string;
  position?: { line: number; column: number };
  surroundingCode?: string;
  relatedNodes?: string[];
  projectMetadata?: ProjectMetadata;
}

export interface CodeConstraints {
  maxLines?: number;
  followPatterns?: string[];
  includeComments?: boolean;
  includeTests?: boolean;
  targetFramework?: string;
}

export interface CodeStyle {
  language: string;
  indentation: 'tabs' | 'spaces';
  indentSize: number;
  lineEnding: 'lf' | 'crlf';
  quoteMark: 'single' | 'double';
  semicolons: boolean;
  bracketSpacing: boolean;
}

export interface CodeAnalysisResult {
  complexity: number;
  patterns: CodePattern[];
  suggestions: CodeSuggestion[];
  embedding?: HyperbolicEmbedding;
  relationships: CodeRelationship[];
  metrics?: CodeMetrics;
}

export interface CodePattern {
  type: string;
  name: string;
  confidence: number;
  description: string;
  examples?: string[];
}

export interface CodeSuggestion {
  type: 'improvement' | 'refactor' | 'style' | 'performance' | 'security';
  message: string;
  severity: 'info' | 'warning' | 'error';
  range?: { start: number; end: number };
  autofix?: string;
}

export interface CodeRelationship {
  type: string;
  target: string;
  confidence: number;
  context?: string;
}

export interface CodeMetrics {
  linesOfCode: number;
  cyclomaticComplexity: number;
  maintainabilityIndex: number;
  testCoverage?: number;
  duplicationRate?: number;
}

// ============================================================================
// Collaboration
// ============================================================================

export interface CollaborationSession {
  id: string;
  projectId: string;
  participants: UserParticipant[];
  agents: AgentParticipant[];
  createdAt: Date;
  isActive: boolean;
  metadata?: CollaborationMetadata;
}

export interface UserParticipant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer' | 'guest';
  status: 'online' | 'offline' | 'away';
  cursor?: CursorPosition;
  activeFile?: string;
  permissions: UserPermissions;
}

export interface AgentParticipant {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'busy' | 'error';
  capabilities: AgentCapability[];
  currentTask?: string;
  owner: string;
}

export interface CursorPosition {
  line: number;
  column: number;
  selection?: { start: number; end: number };
  filePath: string;
}

export interface UserPermissions {
  canEdit: boolean;
  canComment: boolean;
  canInvite: boolean;
  canManageAgents: boolean;
  canViewHistory: boolean;
}

export interface CollaborationMetadata {
  lastActivity: Date;
  totalMessages: number;
  totalEdits: number;
  averageSessionTime: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'user' | 'agent';
  content: string;
  type: 'text' | 'code' | 'file' | 'command' | 'system';
  timestamp: Date;
  replyTo?: string;
  reactions?: MessageReaction[];
  metadata?: Record<string, any>;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: Date;
}

// ============================================================================
// MCP Protocol
// ============================================================================

export interface MCPResponse<T = any> {
  jsonrpc: '2.0';
  id?: number;
  result?: T;
  error?: MCPError;
  method?: string;
  params?: any;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema?: any;
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// UI State Management
// ============================================================================

export interface IDEState {
  currentProject: ProjectState | null;
  activeFile: ProjectFile | null;
  knowledgeGraph: KnowledgeGraph | null;
  activeAgents: AgentWorkflowState[];
  collaborationSession: CollaborationSession | null;
  layout: IDELayout;
  settings: IDESettings;
  ui: UIState;
}

export interface IDELayout {
  leftSidebar: PanelState;
  rightSidebar: PanelState;
  bottomPanel: PanelState;
  editor: EditorState;
  knowledgeGraph: VisualizationState;
}

export interface PanelState {
  isVisible: boolean;
  width?: number;
  height?: number;
  activeTab?: string;
  tabs: string[];
}

export interface EditorState {
  openFiles: ProjectFile[];
  activeFileIndex: number;
  cursorPosition: CursorPosition;
  scrollPosition: { top: number; left: number };
  wordWrap: boolean;
  showLineNumbers: boolean;
  theme: string;
}

export interface VisualizationState {
  layout: 'force' | 'hierarchical' | 'circular' | 'hyperbolic';
  renderMode: '2d' | '3d' | 'poincare';
  filters: VisualizationFilters;
  selectedNodes: string[];
  camera: CameraState;
}

export interface VisualizationFilters {
  nodeTypes: string[];
  edgeTypes: string[];
  complexityRange: [number, number];
  timeRange?: [Date, Date];
  searchQuery?: string;
}

export interface CameraState {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  zoom: number;
}

export interface UIState {
  isCommandPaletteOpen: boolean;
  isSettingsOpen: boolean;
  notifications: Notification[];
  modals: Modal[];
  theme: 'light' | 'dark' | 'auto';
  sidebarCollapsed: boolean;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  persistent?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface Modal {
  id: string;
  type: string;
  title: string;
  content: any;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closable?: boolean;
}

export interface IDESettings {
  general: GeneralSettings;
  editor: EditorSettings;
  agents: AgentSettings;
  collaboration: CollaborationSettings;
  visualization: VisualizationSettings;
  performance: PerformanceSettings;
}

export interface GeneralSettings {
  autoSave: boolean;
  autoSaveInterval: number;
  theme: string;
  language: string;
  notifications: boolean;
  telemetry: boolean;
}

export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  tabSize: number;
  insertSpaces: boolean;
  wordWrap: boolean;
  showLineNumbers: boolean;
  showWhitespace: boolean;
  enableCodeFolding: boolean;
  enableAutoCompletion: boolean;
  enableSemanticHighlighting: boolean;
}

export interface AgentSettings {
  autoStart: boolean;
  maxConcurrentAgents: number;
  defaultPermissions: AgentPermissions;
  trustLevel: 'strict' | 'moderate' | 'permissive';
  loggingLevel: 'minimal' | 'normal' | 'verbose';
}

export interface CollaborationSettings {
  enableRealTimeSync: boolean;
  showCursors: boolean;
  showPresence: boolean;
  allowGuestAccess: boolean;
  maxParticipants: number;
  sessionTimeout: number;
}

export interface VisualizationSettings {
  defaultLayout: string;
  animationSpeed: number;
  nodeSize: number;
  edgeOpacity: number;
  showLabels: boolean;
  enablePhysics: boolean;
  renderQuality: 'low' | 'medium' | 'high';
}

export interface PerformanceSettings {
  maxRenderNodes: number;
  enableWebGL: boolean;
  enableWorkers: boolean;
  cacheSize: number;
  debounceDelay: number;
  batchSize: number;
}

// ============================================================================
// Events & Commands
// ============================================================================

export interface IDEEvent {
  type: string;
  payload: any;
  timestamp: Date;
  source: 'user' | 'agent' | 'system';
}

export interface Command {
  id: string;
  name: string;
  description: string;
  category: string;
  shortcut?: string;
  parameters?: CommandParameter[];
  handler: (params?: any) => Promise<any>;
}

export interface CommandParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'file' | 'directory';
  required: boolean;
  description: string;
  defaultValue?: any;
  options?: string[];
}

// ============================================================================
// Utility Types
// ============================================================================

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export type OperationResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
};

export type AsyncOperation<T> = Promise<OperationResult<T>>;

export type EventHandler<T = any> = (event: T) => void | Promise<void>;

export type Subscription = {
  unsubscribe: () => void;
};

// ============================================================================
// Constants
// ============================================================================

export const NODE_TYPES = [
  'file',
  'class', 
  'function',
  'interface',
  'variable',
  'concept',
  'module'
] as const;

export const EDGE_TYPES = [
  'imports',
  'extends', 
  'implements',
  'calls',
  'references',
  'defines',
  'uses'
] as const;

export const AGENT_TYPES = [
  'pocketflow',
  'h2gnn',
  'hybrid',
  'custom'
] as const;

export const COLLABORATION_ROLES = [
  'owner',
  'editor', 
  'viewer',
  'guest'
] as const;

export const LAYOUT_TYPES = [
  'force',
  'hierarchical',
  'circular', 
  'hyperbolic'
] as const;
