import { useState, useEffect } from 'react';

interface AgentTask {
  id: string;
  agentId: string;
  agentName: string;
  task: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  estimatedCompletion: Date;
  result?: any;
}

interface AgentMetrics {
  agentId: string;
  name: string;
  type: string;
  status: 'ready' | 'busy' | 'error';
  tasksCompleted: number;
  averageResponseTime: number;
  successRate: number;
  currentLoad: number;
  capabilities: string[];
}

const mockAgents: AgentMetrics[] = [
  {
    agentId: 'architect',
    name: 'Architect Agent',
    type: 'architect',
    status: 'ready',
    tasksCompleted: 47,
    averageResponseTime: 2.3,
    successRate: 96.8,
    currentLoad: 15,
    capabilities: ['Code Generation', 'System Design', 'Architecture Planning']
  },
  {
    agentId: 'security',
    name: 'Security Agent',
    type: 'security',
    status: 'busy',
    tasksCompleted: 23,
    averageResponseTime: 4.1,
    successRate: 91.3,
    currentLoad: 85,
    capabilities: ['Vulnerability Scanning', 'Security Analysis', 'Compliance Check']
  },
  {
    agentId: 'impact',
    name: 'Impact Agent',
    type: 'impact',
    status: 'ready',
    tasksCompleted: 31,
    averageResponseTime: 3.2,
    successRate: 94.2,
    currentLoad: 25,
    capabilities: ['Carbon Tracking', 'Impact Measurement', 'Sustainability Analysis']
  },
  {
    agentId: 'logistics',
    name: 'Logistics Agent',
    type: 'logistics',
    status: 'ready',
    tasksCompleted: 19,
    averageResponseTime: 5.7,
    successRate: 89.5,
    currentLoad: 10,
    capabilities: ['Supply Chain Optimization', 'Route Planning', 'Resource Allocation']
  }
];

const mockTasks: AgentTask[] = [
  {
    id: 'task1',
    agentId: 'security',
    agentName: 'Security Agent',
    task: 'Scan smart contracts for vulnerabilities',
    status: 'running',
    progress: 65,
    startTime: new Date(Date.now() - 300000),
    estimatedCompletion: new Date(Date.now() + 120000),
    result: undefined
  },
  {
    id: 'task2',
    agentId: 'architect',
    agentName: 'Architect Agent',
    task: 'Generate carbon credit token contract',
    status: 'completed',
    progress: 100,
    startTime: new Date(Date.now() - 600000),
    estimatedCompletion: new Date(Date.now() - 300000),
    result: { contractGenerated: true, linesOfCode: 156, securityScore: 8.5 }
  },
  {
    id: 'task3',
    agentId: 'impact',
    agentName: 'Impact Agent',
    task: 'Calculate project carbon footprint',
    status: 'pending',
    progress: 0,
    startTime: new Date(),
    estimatedCompletion: new Date(Date.now() + 180000)
  }
];

export const AgentDashboard = () => {
  const [agents, setAgents] = useState<AgentMetrics[]>(mockAgents);
  const [tasks, setTasks] = useState<AgentTask[]>(mockTasks);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'tasks' | 'performance'>('overview');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        currentLoad: Math.max(0, Math.min(100, agent.currentLoad + (Math.random() - 0.5) * 10)),
        averageResponseTime: Math.max(0.5, agent.averageResponseTime + (Math.random() - 0.5) * 0.5)
      })));
      
      setTasks(prev => prev.map(task => {
        if (task.status === 'running') {
          const newProgress = Math.min(100, task.progress + Math.random() * 5);
          return {
            ...task,
            progress: newProgress,
            status: newProgress >= 100 ? 'completed' : 'running'
          };
        }
        return task;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'architect': return '🏗️';
      case 'security': return '🔍';
      case 'impact': return '🌱';
      case 'logistics': return '🚛';
      default: return '🤖';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green';
      case 'busy': return 'text-yellow';
      case 'error': return 'text-red';
      default: return 'text-muted';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-muted';
      case 'running': return 'text-blue';
      case 'completed': return 'text-green';
      case 'failed': return 'text-red';
      default: return 'text-muted';
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const runningTasks = tasks.filter(t => t.status === 'running').length;
  const averageSuccessRate = agents.reduce((sum, agent) => sum + agent.successRate, 0) / agents.length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">🤖 Agent Dashboard</span>
            <div className="w-2 h-2 bg-green rounded-full animate-pulse"></div>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setViewMode('overview')}
              className={`btn btn-sm ${viewMode === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('tasks')}
              className={`btn btn-sm ${viewMode === 'tasks' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Tasks
            </button>
            <button
              onClick={() => setViewMode('performance')}
              className={`btn btn-sm ${viewMode === 'performance' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Performance
            </button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="card p-2 text-center">
            <div className="text-green font-bold">{completedTasks}</div>
            <div className="text-muted-foreground">Completed</div>
          </div>
          <div className="card p-2 text-center">
            <div className="text-blue font-bold">{runningTasks}</div>
            <div className="text-muted-foreground">Running</div>
          </div>
          <div className="card p-2 text-center">
            <div className="text-yellow font-bold">{agents.filter(a => a.status === 'ready').length}</div>
            <div className="text-muted-foreground">Available</div>
          </div>
          <div className="card p-2 text-center">
            <div className="text-purple font-bold">{averageSuccessRate.toFixed(1)}%</div>
            <div className="text-muted-foreground">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        {viewMode === 'overview' && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Agent Status</h3>
            {agents.map(agent => (
              <div
                key={agent.agentId}
                className={`card p-3 cursor-pointer transition-all hover:scale-105 ${
                  selectedAgent === agent.agentId ? 'border-green' : ''
                }`}
                onClick={() => setSelectedAgent(selectedAgent === agent.agentId ? null : agent.agentId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getAgentIcon(agent.type)}</div>
                    <div>
                      <div className="text-sm font-medium">{agent.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {agent.tasksCompleted} tasks completed
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className={`text-xs ${getStatusColor(agent.status)}`}>
                        {agent.status.toUpperCase()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {agent.currentLoad}% load
                      </div>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-muted relative">
                      <div
                        className="absolute inset-0 rounded-full bg-green transition-all"
                        style={{ 
                          clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((agent.currentLoad / 100) * 2 * Math.PI - Math.PI/2)}% ${50 + 50 * Math.sin((agent.currentLoad / 100) * 2 * Math.PI - Math.PI/2)}%)` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {selectedAgent === agent.agentId && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Response Time:</span>
                        <span className="ml-1 font-medium">{agent.averageResponseTime.toFixed(1)}s</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>
                        <span className="ml-1 font-medium">{agent.successRate.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Capabilities: {agent.capabilities.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {viewMode === 'tasks' && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Active Tasks</h3>
            {tasks.map(task => (
              <div key={task.id} className="card p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{getAgentIcon(task.agentId)}</span>
                    <span className="text-sm font-medium">{task.agentName}</span>
                    <span className={`text-xs ${getTaskStatusColor(task.status)}`}>
                      {task.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {task.progress}%
                  </span>
                </div>
                
                <div className="text-sm mb-2">{task.task}</div>
                
                {task.status === 'running' && (
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div
                      className="bg-blue h-2 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                )}
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Started: {task.startTime.toLocaleTimeString()}</span>
                  <span>ETA: {task.estimatedCompletion.toLocaleTimeString()}</span>
                </div>
                
                {task.result && (
                  <div className="mt-2 p-2 bg-green/10 rounded text-xs">
                    <div className="text-green font-medium">Result:</div>
                    <div className="text-muted-foreground">
                      {JSON.stringify(task.result, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {viewMode === 'performance' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Performance Metrics</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="card p-3">
                <div className="text-xs text-muted-foreground mb-2">Response Time by Agent</div>
                <div className="space-y-1">
                  {agents.map(agent => (
                    <div key={agent.agentId} className="flex justify-between text-xs">
                      <span>{agent.name}</span>
                      <span className="font-medium">{agent.averageResponseTime.toFixed(1)}s</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="card p-3">
                <div className="text-xs text-muted-foreground mb-2">Success Rate by Agent</div>
                <div className="space-y-1">
                  {agents.map(agent => (
                    <div key={agent.agentId} className="flex justify-between text-xs">
                      <span>{agent.name}</span>
                      <span className="font-medium">{agent.successRate.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="card p-3">
              <div className="text-xs text-muted-foreground mb-2">Task Completion History</div>
              <div className="space-y-2">
                {tasks.filter(t => t.status === 'completed').map(task => (
                  <div key={task.id} className="flex justify-between items-center text-xs">
                    <span>{task.task}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green">✓</span>
                      <span className="text-muted-foreground">
                        {task.estimatedCompletion.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
