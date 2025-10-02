import { useState, useEffect } from 'react'
import HyperbolicWorld from './hyperbolic-world/HyperbolicWorld'

// Enhanced UI components with modern design
const IDEHeader = () => (
  <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4 glass-effect">
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg hyperdev-gradient flex items-center justify-center animate-glow">
          <span className="text-white font-bold text-sm">H</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-primary">HyperDev IDE</h1>
          <div className="text-xs text-muted-foreground">Regenerative Programming Environment</div>
        </div>
      </div>
    </div>
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green rounded-full animate-pulse"></div>
        <span className="text-xs text-muted-foreground">System Online</span>
      </div>
      <div className="px-3 py-1 bg-green/10 text-green rounded-full text-xs font-medium">
        🌱 Impact: 0 tons CO2e
      </div>
      <button className="btn btn-primary btn-sm">
        <span className="mr-2">🔗</span>
        Connect Wallet
      </button>
    </div>
  </div>
)

const FileExplorer = () => (
  <div className="p-4 space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Explorer</h3>
      <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
        + New
      </button>
    </div>
    <div className="space-y-1">
      <div className="flex items-center space-x-2 p-2 hover:bg-hover rounded cursor-pointer transition-all group">
        <span className="text-sm group-hover:scale-110 transition-transform">📁</span>
        <span className="text-sm font-medium">my-carbon-marketplace</span>
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-muted-foreground">3 files</span>
        </div>
      </div>
      <div className="ml-4 space-y-1">
        <div className="flex items-center space-x-2 p-2 hover:bg-hover rounded cursor-pointer transition-all group">
          <span className="text-xs group-hover:scale-110 transition-transform">📄</span>
          <span className="text-sm">CarbonToken.sol</span>
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-green">●</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 p-2 hover:bg-hover rounded cursor-pointer transition-all group">
          <span className="text-xs group-hover:scale-110 transition-transform">📄</span>
          <span className="text-sm">README.md</span>
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-blue">●</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 p-2 hover:bg-hover rounded cursor-pointer transition-all group">
          <span className="text-xs group-hover:scale-110 transition-transform">⚙️</span>
          <span className="text-sm">package.json</span>
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-yellow">●</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const AgentPanel = () => (
  <div className="p-4 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">AI Agents</h3>
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-green rounded-full animate-pulse"></div>
        <span className="text-xs text-green">3 Active</span>
      </div>
    </div>
    <div className="space-y-2">
      {[
        { name: 'Architect Agent', status: 'Ready', icon: '🏗️', color: 'blue', tasks: 0 },
        { name: 'Security Agent', status: 'Scanning', icon: '🔍', color: 'red', tasks: 2 },
        { name: 'Impact Agent', status: 'Optimizing', icon: '🌱', color: 'green', tasks: 1 },
      ].map((agent) => (
        <div key={agent.name} className="card p-3 hover:scale-105 transition-all cursor-pointer group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-lg group-hover:scale-110 transition-transform">{agent.icon}</div>
              <div>
                <div className="text-sm font-medium">{agent.name}</div>
                <div className="text-xs text-muted-foreground">
                  {agent.tasks} active task{agent.tasks !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                agent.status === 'Ready' ? 'bg-green' : 
                agent.status === 'Scanning' ? 'bg-yellow animate-pulse' : 
                'bg-blue animate-pulse'
              }`}></div>
              <span className="text-xs text-muted-foreground">{agent.status}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Ask AI agents..."
          className="input w-full pr-10"
        />
        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
          <span className="text-sm">🚀</span>
        </button>
      </div>
    </div>
  </div>
)

const CodeEditor = () => (
  <div className="h-full card p-0 overflow-hidden">
    <div className="h-8 bg-secondary border-b border-border flex items-center justify-between px-3">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-full bg-red"></div>
          <div className="w-3 h-3 rounded-full bg-yellow"></div>
          <div className="w-3 h-3 rounded-full bg-green"></div>
        </div>
        <span className="text-xs text-muted-foreground ml-2">CarbonToken.sol</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-xs text-green">●</span>
        <span className="text-xs text-muted-foreground">Solidity</span>
      </div>
    </div>
    <div className="h-[calc(100%-2rem)] code-editor p-4 font-mono text-sm overflow-auto">
      <div className="space-y-1">
        <div className="text-muted-foreground">
          <span className="text-blue">//</span> Welcome to HyperDev IDE
        </div>
        <div className="text-muted-foreground">
          <span className="text-blue">//</span> Start building regenerative applications!
        </div>
        <div></div>
        <div className="text-green font-semibold">contract</div>
        <div className="text-yellow">CarbonCreditToken</div>
        <div className="text-white">&#123;</div>
        <div className="ml-4 text-purple">mapping</div>
        <div className="text-white">(</div>
        <div className="text-blue">address</div>
        <div className="text-white"> =&gt; </div>
        <div className="text-blue">uint256</div>
        <div className="text-white">) </div>
        <div className="text-purple">public</div>
        <div className="text-white"> carbonSequestered;</div>
        <div></div>
        <div className="ml-4 text-purple">function</div>
        <div className="text-yellow"> mintForImpact</div>
        <div className="text-white">(</div>
        <div></div>
        <div className="ml-8 text-blue">address</div>
        <div className="text-white"> farmer,</div>
        <div></div>
        <div className="ml-8 text-blue">uint256</div>
        <div className="text-white"> carbonAmount</div>
        <div></div>
        <div className="ml-4 text-white">) </div>
        <div className="text-purple">external</div>
        <div className="text-white"> &#123;</div>
        <div className="ml-8 text-muted-foreground">
          <span className="text-blue">//</span> Verify impact measurement
        </div>
        <div className="ml-8 text-muted-foreground">
          <span className="text-blue">//</span> Mint tokens based on impact
        </div>
        <div className="ml-4 text-white">&#125;</div>
        <div className="text-white">&#125;</div>
      </div>
    </div>
  </div>
)

const KnowledgeGraphVisualization = ({ viewMode }: { viewMode: '2d' | '3d' }) => {
  if (viewMode === '3d') {
    return (
      <div className="h-full card overflow-hidden">
        <div className="h-8 bg-secondary border-b border-border flex items-center justify-between px-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">🌍 Hyperbolic World</span>
            <div className="w-2 h-2 bg-green rounded-full animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">H²GNN + WordNet</span>
            <div className="px-2 py-1 bg-green/10 text-green rounded text-xs">Live</div>
          </div>
        </div>
        <div className="h-[calc(100%-2rem)]">
          <HyperbolicWorld 
            showWordNet={true}
            showAgentPaths={false}
            maxNodes={30}
            worldRadius={8}
            enableVR={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full knowledge-graph-container card relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 mx-auto rounded-full hyperdev-gradient animate-float flex items-center justify-center">
            <span className="text-white text-3xl">🕸️</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Hyperbolic Knowledge Graph</h3>
            <p className="text-sm text-muted-foreground">Visualizing code relationships in geometric space</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="card p-3 hover:scale-105 transition-all">
              <div className="text-green font-bold text-xl">156</div>
              <div className="text-xs text-muted-foreground">Nodes</div>
            </div>
            <div className="card p-3 hover:scale-105 transition-all">
              <div className="text-blue font-bold text-xl">234</div>
              <div className="text-xs text-muted-foreground">Connections</div>
            </div>
            <div className="card p-3 hover:scale-105 transition-all">
              <div className="text-yellow font-bold text-xl">89%</div>
              <div className="text-xs text-muted-foreground">Efficiency</div>
            </div>
          </div>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-green rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-yellow rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const BottomPanel = () => (
  <div className="h-full card border-t border-border">
    <div className="flex border-b border-border">
      <button className="px-4 py-2 text-sm border-r border-border bg-accent text-primary font-medium flex items-center space-x-2">
        <span>💻</span>
        <span>Console</span>
        <div className="w-2 h-2 bg-green rounded-full animate-pulse"></div>
      </button>
      <button className="px-4 py-2 text-sm border-r border-border hover:bg-hover transition-colors flex items-center space-x-2">
        <span>🌐</span>
        <span>P2P Sessions</span>
        <div className="w-2 h-2 bg-blue rounded-full"></div>
      </button>
      <button className="px-4 py-2 text-sm border-r border-border hover:bg-hover transition-colors flex items-center space-x-2">
        <span>📊</span>
        <span>Impact Dashboard</span>
        <div className="w-2 h-2 bg-yellow rounded-full"></div>
      </button>
    </div>
    <div className="p-4 font-mono text-sm space-y-2 overflow-auto">
      <div className="flex items-center space-x-2 text-green">
        <span>✅</span>
        <span>Project initialized: my-carbon-marketplace</span>
        <span className="text-xs text-muted-foreground">2s ago</span>
      </div>
      <div className="flex items-center space-x-2 text-blue">
        <span>🤖</span>
        <span>AI Agent: Smart contracts generated successfully</span>
        <span className="text-xs text-muted-foreground">5s ago</span>
      </div>
      <div className="flex items-center space-x-2 text-yellow">
        <span>🌱</span>
        <span>Impact tracking enabled</span>
        <span className="text-xs text-muted-foreground">8s ago</span>
      </div>
      <div className="flex items-center space-x-2 text-muted-foreground">
        <span className="animate-pulse">&gt;</span>
        <span>Ready for regenerative development...</span>
      </div>
      <div className="flex items-center space-x-2 text-green">
        <span>🔗</span>
        <span>Connected to H²GNN network</span>
        <span className="text-xs text-muted-foreground">12s ago</span>
      </div>
    </div>
  </div>
)

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d')

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-8 animate-fadeIn">
          <div className="w-24 h-24 mx-auto rounded-full hyperdev-gradient animate-glow flex items-center justify-center">
            <span className="text-white text-4xl animate-float">🌍</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary">HyperDev IDE</h1>
            <p className="text-muted-foreground text-lg">Loading regenerative development environment...</p>
          </div>
          <div className="space-y-4">
            <div className="loading-dots">
              <div className="w-3 h-3 bg-green rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-yellow rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <div className="text-sm text-muted-foreground">
              Initializing H²GNN network...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <IDEHeader />
      
      <div className="h-calc-screen-minus-header flex">
        {/* Left Sidebar */}
        <div className="w-80 h-full card border-r border-border flex-shrink-0">
          <div className="h-1/2 border-b border-border">
            <FileExplorer />
          </div>
          <div className="h-1/2">
            <AgentPanel />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 h-full flex flex-col">
          {/* Code Editor */}
          <div className="flex-1 p-4">
            <CodeEditor />
          </div>
          
          {/* Bottom Panel */}
          <div className="h-48 border-t border-border">
            <BottomPanel />
          </div>
        </div>
        
        {/* Right Panel - Knowledge Graph */}
        <div className="w-96 h-full p-4 flex-shrink-0">
          <div className="h-full flex flex-col space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Knowledge Graph</span>
                <div className="w-2 h-2 bg-green rounded-full animate-pulse"></div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setViewMode('2d')}
                  className={`btn btn-sm ${viewMode === '2d' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  2D
                </button>
                <button
                  onClick={() => setViewMode('3d')}
                  className={`btn btn-sm ${viewMode === '3d' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  3D World
                </button>
              </div>
            </div>
            <div className="flex-1">
              <KnowledgeGraphVisualization viewMode={viewMode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App