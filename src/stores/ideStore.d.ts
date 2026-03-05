import type { IDEState, ProjectState, ProjectFile, KnowledgeGraph, AgentWorkflowState, CollaborationSession, IDELayout, IDESettings, UIState, Notification, Modal } from '../types/ide';
/**
 * HyperDev IDE Store
 *
 * Centralized state management for the entire IDE using Zustand with:
 * - Immer for immutable updates
 * - Selector subscriptions for reactive updates
 * - TypeScript for complete type safety
 */
interface IDEStore extends IDEState {
    setCurrentProject: (project: ProjectState | null) => void;
    updateProject: (updates: Partial<ProjectState>) => void;
    setActiveFile: (file: ProjectFile | null) => void;
    addFile: (file: ProjectFile) => void;
    updateFile: (fileId: string, updates: Partial<ProjectFile>) => void;
    removeFile: (fileId: string) => void;
    setKnowledgeGraph: (graph: KnowledgeGraph | null) => void;
    updateKnowledgeGraph: (updates: Partial<KnowledgeGraph>) => void;
    selectNodes: (nodeIds: string[]) => void;
    addAgent: (agent: AgentWorkflowState) => void;
    updateAgent: (agentId: string, updates: Partial<AgentWorkflowState>) => void;
    removeAgent: (agentId: string) => void;
    setAgentStatus: (agentId: string, status: AgentWorkflowState['status']) => void;
    setCollaborationSession: (session: CollaborationSession | null) => void;
    updateCollaborationSession: (updates: Partial<CollaborationSession>) => void;
    updateLayout: (updates: Partial<IDELayout>) => void;
    toggleSidebar: (side: 'left' | 'right') => void;
    toggleBottomPanel: () => void;
    resizePanel: (panel: keyof IDELayout, dimension: 'width' | 'height', value: number) => void;
    updateSettings: (updates: Partial<IDESettings>) => void;
    resetSettings: () => void;
    setCommandPaletteOpen: (open: boolean) => void;
    setSettingsOpen: (open: boolean) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
    addModal: (modal: Modal) => void;
    removeModal: (id: string) => void;
    setTheme: (theme: 'light' | 'dark' | 'auto') => void;
    toggleSidebarCollapsed: () => void;
    resetState: () => void;
    loadStateFromStorage: () => void;
    saveStateToStorage: () => void;
}
export declare const useIDEStore: import("zustand").UseBoundStore<Omit<Omit<import("zustand").StoreApi<IDEStore>, "subscribe"> & {
    subscribe: {
        (listener: (selectedState: IDEStore, previousSelectedState: IDEStore) => void): () => void;
        <U>(selector: (state: IDEStore) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: ((a: U, b: U) => boolean) | undefined;
            fireImmediately?: boolean;
        } | undefined): () => void;
    };
}, "setState"> & {
    setState(nextStateOrUpdater: IDEStore | Partial<IDEStore> | ((state: Draft<Exclude<A2[0], (...args: any[]) => any>>) => void), shouldReplace?: false): void;
    setState(nextStateOrUpdater: IDEStore | ((state: Draft<Exclude<A2[0], (...args: any[]) => any>>) => void), shouldReplace: true): void;
}>;
export declare const useCurrentProject: () => ProjectState | null;
export declare const useActiveFile: () => ProjectFile | null;
export declare const useKnowledgeGraph: () => KnowledgeGraph | null;
export declare const useActiveAgents: () => AgentWorkflowState[];
export declare const useCollaborationSession: () => CollaborationSession | null;
export declare const useLayout: () => IDELayout;
export declare const useSettings: () => IDESettings;
export declare const useUIState: () => UIState;
export declare const useNotifications: () => Notification[];
export declare const useTheme: () => "auto" | "light" | "dark";
export declare const useIsProjectLoaded: () => boolean;
export declare const useOpenFiles: () => ProjectFile[];
export declare const useActiveFileContent: () => string | undefined;
export declare const useRunningAgents: () => AgentWorkflowState[];
export declare const useSelectedNodes: () => string[];
export {};
//# sourceMappingURL=ideStore.d.ts.map