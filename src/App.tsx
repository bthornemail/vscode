import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from 'react-resizable-panels';

// Core IDE Components
import { IDEHeader } from './components/layout/IDEHeader';
import { FileExplorer } from './components/sidebar/FileExplorer';
import { AgentPanel } from './components/sidebar/AgentPanel';
import { MonacoEditor } from './components/editor/MonacoEditor';
import { KnowledgeGraphVisualizer } from './components/visualization/KnowledgeGraphVisualizer';
import { CollaborationSidebar } from './components/collaboration/CollaborationSidebar';
import { AgentConsole } from './components/console/AgentConsole';
import { CommandPalette } from './components/commands/CommandPalette';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Stores and Services
import { useIDEStore } from './stores/ideStore';
import { useMCPClient } from './hooks/useMCPClient';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useCollaboration } from './hooks/useCollaboration';

// Types
import type { ProjectState, IDELayout } from './types/ide';

/**
 * HyperDev IDE - Main Application Component
 * 
 * A revolutionary decentralized agentic programming IDE powered by:
 * - H²GNN (Hyperbolic Geometric Neural Networks)
 * - PocketFlow (Agentic Workflow Framework)
 * - MCP (Model Context Protocol)
 */
export default function App(): React.ReactElement {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  
  // Global IDE state
  const {
    layout,
    currentProject,
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    activeAgents,
    knowledgeGraph
  } = useIDEStore();
  
  // Core services
  const { mcpClient, isConnected, connectionError } = useMCPClient();
  const { collaborationSession, activeUsers } = useCollaboration();
  
  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    'cmd+shift+p': () => setCommandPaletteOpen(true),
    'cmd+k': () => setCommandPaletteOpen(true),
    'cmd+`': () => console.log('Toggle terminal'), // TODO: Implement terminal
    'cmd+shift+e': () => console.log('Toggle explorer'), // TODO: Implement
    'cmd+shift+g': () => console.log('Toggle knowledge graph'), // TODO: Implement
  });
  
  // Initialize IDE on mount
  useEffect(() => {
    let mounted = true;
    
    const initializeIDE = async (): Promise<void> => {
      try {
        console.log('🚀 Initializing HyperDev IDE...');
        
        // Initialize MCP connection
        if (!isConnected) {
          console.log('🔌 Connecting to H²GNN MCP Server...');
          await mcpClient.connect();
        }
        
        // Load default project or last opened project
        const projectId = localStorage.getItem('hyperdev:lastProject');
        if (projectId) {
          console.log(`📂 Loading project: ${projectId}`);
          await loadProject(projectId);
        } else {
          console.log('📝 Creating new project...');
          await createNewProject();
        }
        
        // Initialize collaboration if available
        if (collaborationSession) {
          console.log('👥 Joining collaboration session...');
          await collaborationSession.join();
        }
        
        if (mounted) {
          setIsInitialized(true);
          console.log('✅ HyperDev IDE initialized successfully');
        }
        
      } catch (error) {
        console.error('❌ IDE initialization failed:', error);
        if (mounted) {
          setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
        }
      }
    };
    
    initializeIDE();
    
    return () => {
      mounted = false;
    };
  }, [mcpClient, isConnected, collaborationSession]);
  
  // Project management functions
  const loadProject = async (projectId: string): Promise<void> => {
    try {
      const project = await mcpClient.loadProject(projectId);
      useIDEStore.getState().setCurrentProject(project);
      
      // Trigger knowledge graph analysis
      await mcpClient.analyzeProject(project.path);
      
    } catch (error) {
      console.error('Failed to load project:', error);
      throw error;
    }
  };
  
  const createNewProject = async (): Promise<void> => {
    try {
      const project: ProjectState = {
        id: `project_${Date.now()}`,
        name: 'New Project',
        path: '/workspace/new-project',
        files: [],
        metadata: {
          createdAt: new Date(),
          lastModified: new Date(),
          language: 'typescript',
          framework: 'react'
        }
      };
      
      useIDEStore.getState().setCurrentProject(project);
      localStorage.setItem('hyperdev:lastProject', project.id);
      
    } catch (error) {
      console.error('Failed to create new project:', error);
      throw error;
    }
  };
  
  // Error handling
  if (initError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-400">Initialization Error</h1>
          <p className="text-gray-300">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (!isInitialized) {
    return <LoadingScreen />;
  }
  
  // Connection error
  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-yellow-400">Connection Error</h1>
          <p className="text-gray-300">Failed to connect to H²GNN MCP Server</p>
          <p className="text-sm text-gray-400">{connectionError}</p>
          <div className="space-x-2">
            <button
              onClick={() => mcpClient.reconnect()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Reconnect
            </button>
            <button
              onClick={() => setInitError(null)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Work Offline
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
        {/* IDE Header */}
        <IDEHeader 
          project={currentProject}
          isConnected={isConnected}
          activeUsers={activeUsers}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />
        
        {/* Main IDE Layout */}
        <div className="flex-1 flex overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            {/* Left Sidebar */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <div className="h-full bg-gray-900 border-r border-gray-700">
                <div className="h-1/2 border-b border-gray-700">
                  <FileExplorer 
                    project={currentProject}
                    onFileSelect={(file) => console.log('File selected:', file)}
                  />
                </div>
                <div className="h-1/2">
                  <AgentPanel 
                    agents={activeAgents}
                    onAgentSelect={(agent) => console.log('Agent selected:', agent)}
                  />
                </div>
              </div>
            </ResizablePanel>
            
            <ResizableHandle />
            
            {/* Main Editor Area */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <ResizablePanelGroup direction="vertical">
                {/* Code Editor */}
                <ResizablePanel defaultSize={70} minSize={40}>
                  <MonacoEditor 
                    mcpClient={mcpClient}
                    project={currentProject}
                    onCodeChange={(code) => console.log('Code changed:', code)}
                  />
                </ResizablePanel>
                
                <ResizableHandle />
                
                {/* Console/Terminal */}
                <ResizablePanel defaultSize={30} minSize={15}>
                  <AgentConsole 
                    agents={activeAgents}
                    mcpClient={mcpClient}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            
            <ResizableHandle />
            
            {/* Right Sidebar */}
            <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
              <ResizablePanelGroup direction="vertical">
                {/* Knowledge Graph Visualization */}
                <ResizablePanel defaultSize={60} minSize={30}>
                  <KnowledgeGraphVisualizer 
                    knowledgeGraph={knowledgeGraph}
                    mcpClient={mcpClient}
                    onNodeSelect={(node) => console.log('Node selected:', node)}
                  />
                </ResizablePanel>
                
                <ResizableHandle />
                
                {/* Collaboration Sidebar */}
                <ResizablePanel defaultSize={40} minSize={20}>
                  <CollaborationSidebar 
                    session={collaborationSession}
                    activeUsers={activeUsers}
                    mcpClient={mcpClient}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        
        {/* Command Palette Overlay */}
        <AnimatePresence>
          {isCommandPaletteOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-start justify-center pt-32 z-50"
              onClick={() => setCommandPaletteOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <CommandPalette 
                  mcpClient={mcpClient}
                  onClose={() => setCommandPaletteOpen(false)}
                  onCommand={(command) => {
                    console.log('Command executed:', command);
                    setCommandPaletteOpen(false);
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Status Indicators */}
        <div className="fixed bottom-4 right-4 space-y-2 z-40">
          {/* Connection Status */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isConnected 
                ? 'bg-green-900/80 text-green-300 border border-green-700' 
                : 'bg-red-900/80 text-red-300 border border-red-700'
            }`}
          >
            {isConnected ? '🟢 H²GNN Connected' : '🔴 H²GNN Disconnected'}
          </motion.div>
          
          {/* Active Agents Count */}
          {activeAgents.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 rounded-full text-xs font-medium bg-blue-900/80 text-blue-300 border border-blue-700"
            >
              🤖 {activeAgents.length} Agent{activeAgents.length !== 1 ? 's' : ''} Active
            </motion.div>
          )}
          
          {/* Collaboration Status */}
          {activeUsers.length > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 rounded-full text-xs font-medium bg-purple-900/80 text-purple-300 border border-purple-700"
            >
              👥 {activeUsers.length} User{activeUsers.length !== 1 ? 's' : ''} Online
            </motion.div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

// Development hot reload
if (import.meta.hot) {
  import.meta.hot.accept();
}
