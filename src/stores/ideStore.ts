import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
  IDEState, 
  ProjectState, 
  ProjectFile, 
  KnowledgeGraph, 
  AgentWorkflowState, 
  CollaborationSession,
  IDELayout,
  IDESettings,
  UIState,
  Notification,
  Modal
} from '../types/ide';

/**
 * HyperDev IDE Store
 * 
 * Centralized state management for the entire IDE using Zustand with:
 * - Immer for immutable updates
 * - Selector subscriptions for reactive updates
 * - TypeScript for complete type safety
 */

interface IDEStore extends IDEState {
  // Project Management
  setCurrentProject: (project: ProjectState | null) => void;
  updateProject: (updates: Partial<ProjectState>) => void;
  setActiveFile: (file: ProjectFile | null) => void;
  addFile: (file: ProjectFile) => void;
  updateFile: (fileId: string, updates: Partial<ProjectFile>) => void;
  removeFile: (fileId: string) => void;
  
  // Knowledge Graph
  setKnowledgeGraph: (graph: KnowledgeGraph | null) => void;
  updateKnowledgeGraph: (updates: Partial<KnowledgeGraph>) => void;
  selectNodes: (nodeIds: string[]) => void;
  
  // Agent Management
  addAgent: (agent: AgentWorkflowState) => void;
  updateAgent: (agentId: string, updates: Partial<AgentWorkflowState>) => void;
  removeAgent: (agentId: string) => void;
  setAgentStatus: (agentId: string, status: AgentWorkflowState['status']) => void;
  
  // Collaboration
  setCollaborationSession: (session: CollaborationSession | null) => void;
  updateCollaborationSession: (updates: Partial<CollaborationSession>) => void;
  
  // Layout Management
  updateLayout: (updates: Partial<IDELayout>) => void;
  toggleSidebar: (side: 'left' | 'right') => void;
  toggleBottomPanel: () => void;
  resizePanel: (panel: keyof IDELayout, dimension: 'width' | 'height', value: number) => void;
  
  // Settings
  updateSettings: (updates: Partial<IDESettings>) => void;
  resetSettings: () => void;
  
  // UI State
  setCommandPaletteOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  addModal: (modal: Modal) => void;
  removeModal: (id: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  toggleSidebarCollapsed: () => void;
  
  // Utility Actions
  resetState: () => void;
  loadStateFromStorage: () => void;
  saveStateToStorage: () => void;
}

// Default state
const defaultLayout: IDELayout = {
  leftSidebar: {
    isVisible: true,
    width: 300,
    activeTab: 'files',
    tabs: ['files', 'agents']
  },
  rightSidebar: {
    isVisible: true,
    width: 400,
    activeTab: 'knowledge-graph',
    tabs: ['knowledge-graph', 'collaboration']
  },
  bottomPanel: {
    isVisible: true,
    height: 200,
    activeTab: 'console',
    tabs: ['console', 'terminal', 'output']
  },
  editor: {
    openFiles: [],
    activeFileIndex: -1,
    cursorPosition: { line: 0, column: 0, filePath: '' },
    scrollPosition: { top: 0, left: 0 },
    wordWrap: true,
    showLineNumbers: true,
    theme: 'dark'
  },
  knowledgeGraph: {
    layout: 'hyperbolic',
    renderMode: 'poincare',
    filters: {
      nodeTypes: [],
      edgeTypes: [],
      complexityRange: [0, 100]
    },
    selectedNodes: [],
    camera: {
      position: { x: 0, y: 0, z: 5 },
      target: { x: 0, y: 0, z: 0 },
      zoom: 1
    }
  }
};

const defaultSettings: IDESettings = {
  general: {
    autoSave: true,
    autoSaveInterval: 30000,
    theme: 'dark',
    language: 'en',
    notifications: true,
    telemetry: false
  },
  editor: {
    fontSize: 14,
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    lineHeight: 1.5,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: true,
    showLineNumbers: true,
    showWhitespace: false,
    enableCodeFolding: true,
    enableAutoCompletion: true,
    enableSemanticHighlighting: true
  },
  agents: {
    autoStart: false,
    maxConcurrentAgents: 5,
    defaultPermissions: {
      canReadFiles: true,
      canWriteFiles: false,
      canExecuteCode: false,
      canAccessNetwork: false,
      canModifyProject: false
    },
    trustLevel: 'moderate',
    loggingLevel: 'normal'
  },
  collaboration: {
    enableRealTimeSync: true,
    showCursors: true,
    showPresence: true,
    allowGuestAccess: false,
    maxParticipants: 10,
    sessionTimeout: 3600000
  },
  visualization: {
    defaultLayout: 'hyperbolic',
    animationSpeed: 1,
    nodeSize: 5,
    edgeOpacity: 0.6,
    showLabels: true,
    enablePhysics: true,
    renderQuality: 'high'
  },
  performance: {
    maxRenderNodes: 1000,
    enableWebGL: true,
    enableWorkers: true,
    cacheSize: 100,
    debounceDelay: 300,
    batchSize: 50
  }
};

const defaultUIState: UIState = {
  isCommandPaletteOpen: false,
  isSettingsOpen: false,
  notifications: [],
  modals: [],
  theme: 'dark',
  sidebarCollapsed: false
};

// Create the store
export const useIDEStore = create<IDEStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      currentProject: null,
      activeFile: null,
      knowledgeGraph: null,
      activeAgents: [],
      collaborationSession: null,
      layout: defaultLayout,
      settings: defaultSettings,
      ui: defaultUIState,

      // Project Management
      setCurrentProject: (project) => set((state) => {
        state.currentProject = project;
        if (project) {
          // Save to localStorage
          localStorage.setItem('hyperdev:currentProject', JSON.stringify(project));
        } else {
          localStorage.removeItem('hyperdev:currentProject');
        }
      }),

      updateProject: (updates) => set((state) => {
        if (state.currentProject) {
          Object.assign(state.currentProject, updates);
          localStorage.setItem('hyperdev:currentProject', JSON.stringify(state.currentProject));
        }
      }),

      setActiveFile: (file) => set((state) => {
        state.activeFile = file;
        if (file && !state.layout.editor.openFiles.find(f => f.id === file.id)) {
          state.layout.editor.openFiles.push(file);
          state.layout.editor.activeFileIndex = state.layout.editor.openFiles.length - 1;
        } else if (file) {
          const index = state.layout.editor.openFiles.findIndex(f => f.id === file.id);
          if (index !== -1) {
            state.layout.editor.activeFileIndex = index;
          }
        }
      }),

      addFile: (file) => set((state) => {
        if (state.currentProject) {
          state.currentProject.files.push(file);
        }
      }),

      updateFile: (fileId, updates) => set((state) => {
        if (state.currentProject) {
          const file = state.currentProject.files.find(f => f.id === fileId);
          if (file) {
            Object.assign(file, updates);
          }
        }
        
        // Update in open files as well
        const openFile = state.layout.editor.openFiles.find(f => f.id === fileId);
        if (openFile) {
          Object.assign(openFile, updates);
        }
      }),

      removeFile: (fileId) => set((state) => {
        if (state.currentProject) {
          state.currentProject.files = state.currentProject.files.filter(f => f.id !== fileId);
        }
        
        // Remove from open files
        state.layout.editor.openFiles = state.layout.editor.openFiles.filter(f => f.id !== fileId);
        
        // Adjust active file index
        if (state.layout.editor.activeFileIndex >= state.layout.editor.openFiles.length) {
          state.layout.editor.activeFileIndex = Math.max(0, state.layout.editor.openFiles.length - 1);
        }
      }),

      // Knowledge Graph
      setKnowledgeGraph: (graph) => set((state) => {
        state.knowledgeGraph = graph;
      }),

      updateKnowledgeGraph: (updates) => set((state) => {
        if (state.knowledgeGraph) {
          Object.assign(state.knowledgeGraph, updates);
        }
      }),

      selectNodes: (nodeIds) => set((state) => {
        state.layout.knowledgeGraph.selectedNodes = nodeIds;
      }),

      // Agent Management
      addAgent: (agent) => set((state) => {
        state.activeAgents.push(agent);
      }),

      updateAgent: (agentId, updates) => set((state) => {
        const agent = state.activeAgents.find(a => a.id === agentId);
        if (agent) {
          Object.assign(agent, updates);
        }
      }),

      removeAgent: (agentId) => set((state) => {
        state.activeAgents = state.activeAgents.filter(a => a.id !== agentId);
      }),

      setAgentStatus: (agentId, status) => set((state) => {
        const agent = state.activeAgents.find(a => a.id === agentId);
        if (agent) {
          agent.status = status;
        }
      }),

      // Collaboration
      setCollaborationSession: (session) => set((state) => {
        state.collaborationSession = session;
      }),

      updateCollaborationSession: (updates) => set((state) => {
        if (state.collaborationSession) {
          Object.assign(state.collaborationSession, updates);
        }
      }),

      // Layout Management
      updateLayout: (updates) => set((state) => {
        Object.assign(state.layout, updates);
        localStorage.setItem('hyperdev:layout', JSON.stringify(state.layout));
      }),

      toggleSidebar: (side) => set((state) => {
        if (side === 'left') {
          state.layout.leftSidebar.isVisible = !state.layout.leftSidebar.isVisible;
        } else {
          state.layout.rightSidebar.isVisible = !state.layout.rightSidebar.isVisible;
        }
        localStorage.setItem('hyperdev:layout', JSON.stringify(state.layout));
      }),

      toggleBottomPanel: () => set((state) => {
        state.layout.bottomPanel.isVisible = !state.layout.bottomPanel.isVisible;
        localStorage.setItem('hyperdev:layout', JSON.stringify(state.layout));
      }),

      resizePanel: (panel, dimension, value) => set((state) => {
        const panelState = state.layout[panel] as any;
        if (panelState && dimension in panelState) {
          panelState[dimension] = value;
        }
        localStorage.setItem('hyperdev:layout', JSON.stringify(state.layout));
      }),

      // Settings
      updateSettings: (updates) => set((state) => {
        Object.assign(state.settings, updates);
        localStorage.setItem('hyperdev:settings', JSON.stringify(state.settings));
      }),

      resetSettings: () => set((state) => {
        state.settings = { ...defaultSettings };
        localStorage.setItem('hyperdev:settings', JSON.stringify(state.settings));
      }),

      // UI State
      setCommandPaletteOpen: (open) => set((state) => {
        state.ui.isCommandPaletteOpen = open;
      }),

      setSettingsOpen: (open) => set((state) => {
        state.ui.isSettingsOpen = open;
      }),

      addNotification: (notification) => set((state) => {
        const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        state.ui.notifications.push({
          ...notification,
          id,
          timestamp: new Date()
        });
        
        // Auto-remove non-persistent notifications after 5 seconds
        if (!notification.persistent) {
          setTimeout(() => {
            set((state) => {
              state.ui.notifications = state.ui.notifications.filter(n => n.id !== id);
            });
          }, 5000);
        }
      }),

      removeNotification: (id) => set((state) => {
        state.ui.notifications = state.ui.notifications.filter(n => n.id !== id);
      }),

      clearNotifications: () => set((state) => {
        state.ui.notifications = [];
      }),

      addModal: (modal) => set((state) => {
        state.ui.modals.push(modal);
      }),

      removeModal: (id) => set((state) => {
        state.ui.modals = state.ui.modals.filter(m => m.id !== id);
      }),

      setTheme: (theme) => set((state) => {
        state.ui.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('hyperdev:theme', theme);
      }),

      toggleSidebarCollapsed: () => set((state) => {
        state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed;
        localStorage.setItem('hyperdev:sidebarCollapsed', String(state.ui.sidebarCollapsed));
      }),

      // Utility Actions
      resetState: () => set(() => ({
        currentProject: null,
        activeFile: null,
        knowledgeGraph: null,
        activeAgents: [],
        collaborationSession: null,
        layout: { ...defaultLayout },
        settings: { ...defaultSettings },
        ui: { ...defaultUIState }
      })),

      loadStateFromStorage: () => set((state) => {
        try {
          // Load project
          const savedProject = localStorage.getItem('hyperdev:currentProject');
          if (savedProject) {
            state.currentProject = JSON.parse(savedProject);
          }

          // Load layout
          const savedLayout = localStorage.getItem('hyperdev:layout');
          if (savedLayout) {
            state.layout = { ...defaultLayout, ...JSON.parse(savedLayout) };
          }

          // Load settings
          const savedSettings = localStorage.getItem('hyperdev:settings');
          if (savedSettings) {
            state.settings = { ...defaultSettings, ...JSON.parse(savedSettings) };
          }

          // Load theme
          const savedTheme = localStorage.getItem('hyperdev:theme');
          if (savedTheme) {
            state.ui.theme = savedTheme as any;
            document.documentElement.setAttribute('data-theme', savedTheme);
          }

          // Load sidebar state
          const sidebarCollapsed = localStorage.getItem('hyperdev:sidebarCollapsed');
          if (sidebarCollapsed) {
            state.ui.sidebarCollapsed = sidebarCollapsed === 'true';
          }

        } catch (error) {
          console.error('Failed to load state from storage:', error);
        }
      }),

      saveStateToStorage: () => {
        const state = get();
        
        try {
          if (state.currentProject) {
            localStorage.setItem('hyperdev:currentProject', JSON.stringify(state.currentProject));
          }
          localStorage.setItem('hyperdev:layout', JSON.stringify(state.layout));
          localStorage.setItem('hyperdev:settings', JSON.stringify(state.settings));
          localStorage.setItem('hyperdev:theme', state.ui.theme);
          localStorage.setItem('hyperdev:sidebarCollapsed', String(state.ui.sidebarCollapsed));
        } catch (error) {
          console.error('Failed to save state to storage:', error);
        }
      }
    }))
  )
);

// Auto-save state to localStorage on changes
useIDEStore.subscribe(
  (state) => state,
  (state) => {
    // Debounce saves to avoid excessive localStorage writes
    const debouncedSave = debounce(() => {
      state.saveStateToStorage();
    }, 1000);
    
    debouncedSave();
  }
);

// Load initial state from storage
useIDEStore.getState().loadStateFromStorage();

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Selectors for commonly used state slices
export const useCurrentProject = () => useIDEStore((state) => state.currentProject);
export const useActiveFile = () => useIDEStore((state) => state.activeFile);
export const useKnowledgeGraph = () => useIDEStore((state) => state.knowledgeGraph);
export const useActiveAgents = () => useIDEStore((state) => state.activeAgents);
export const useCollaborationSession = () => useIDEStore((state) => state.collaborationSession);
export const useLayout = () => useIDEStore((state) => state.layout);
export const useSettings = () => useIDEStore((state) => state.settings);
export const useUIState = () => useIDEStore((state) => state.ui);
export const useNotifications = () => useIDEStore((state) => state.ui.notifications);
export const useTheme = () => useIDEStore((state) => state.ui.theme);

// Computed selectors
export const useIsProjectLoaded = () => useIDEStore((state) => !!state.currentProject);
export const useOpenFiles = () => useIDEStore((state) => state.layout.editor.openFiles);
export const useActiveFileContent = () => useIDEStore((state) => {
  const { openFiles, activeFileIndex } = state.layout.editor;
  return activeFileIndex >= 0 && openFiles[activeFileIndex] ? openFiles[activeFileIndex].content : '';
});
export const useRunningAgents = () => useIDEStore((state) => 
  state.activeAgents.filter(agent => agent.status === 'running')
);
export const useSelectedNodes = () => useIDEStore((state) => state.layout.knowledgeGraph.selectedNodes);
