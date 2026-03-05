import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const mockAgents = [
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
const mockTasks = [
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
    const [agents, setAgents] = useState(mockAgents);
    const [tasks, setTasks] = useState(mockTasks);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [viewMode, setViewMode] = useState('overview');
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
    const getAgentIcon = (type) => {
        switch (type) {
            case 'architect': return '🏗️';
            case 'security': return '🔍';
            case 'impact': return '🌱';
            case 'logistics': return '🚛';
            default: return '🤖';
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'ready': return 'text-green';
            case 'busy': return 'text-yellow';
            case 'error': return 'text-red';
            default: return 'text-muted';
        }
    };
    const getTaskStatusColor = (status) => {
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
    return (_jsxs("div", { className: "h-full flex flex-col", children: [_jsxs("div", { className: "p-3 border-b border-border", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm font-medium", children: "\uD83E\uDD16 Agent Dashboard" }), _jsx("div", { className: "w-2 h-2 bg-green rounded-full animate-pulse" })] }), _jsxs("div", { className: "flex space-x-1", children: [_jsx("button", { onClick: () => setViewMode('overview'), className: `btn btn-sm ${viewMode === 'overview' ? 'btn-primary' : 'btn-ghost'}`, children: "Overview" }), _jsx("button", { onClick: () => setViewMode('tasks'), className: `btn btn-sm ${viewMode === 'tasks' ? 'btn-primary' : 'btn-ghost'}`, children: "Tasks" }), _jsx("button", { onClick: () => setViewMode('performance'), className: `btn btn-sm ${viewMode === 'performance' ? 'btn-primary' : 'btn-ghost'}`, children: "Performance" })] })] }), _jsxs("div", { className: "grid grid-cols-4 gap-2 text-xs", children: [_jsxs("div", { className: "card p-2 text-center", children: [_jsx("div", { className: "text-green font-bold", children: completedTasks }), _jsx("div", { className: "text-muted-foreground", children: "Completed" })] }), _jsxs("div", { className: "card p-2 text-center", children: [_jsx("div", { className: "text-blue font-bold", children: runningTasks }), _jsx("div", { className: "text-muted-foreground", children: "Running" })] }), _jsxs("div", { className: "card p-2 text-center", children: [_jsx("div", { className: "text-yellow font-bold", children: agents.filter(a => a.status === 'ready').length }), _jsx("div", { className: "text-muted-foreground", children: "Available" })] }), _jsxs("div", { className: "card p-2 text-center", children: [_jsxs("div", { className: "text-purple font-bold", children: [averageSuccessRate.toFixed(1), "%"] }), _jsx("div", { className: "text-muted-foreground", children: "Success Rate" })] })] })] }), _jsxs("div", { className: "flex-1 overflow-auto p-3", children: [viewMode === 'overview' && (_jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-sm font-medium", children: "Agent Status" }), agents.map(agent => (_jsxs("div", { className: `card p-3 cursor-pointer transition-all hover:scale-105 ${selectedAgent === agent.agentId ? 'border-green' : ''}`, onClick: () => setSelectedAgent(selectedAgent === agent.agentId ? null : agent.agentId), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "text-2xl", children: getAgentIcon(agent.type) }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: agent.name }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [agent.tasksCompleted, " tasks completed"] })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "text-right", children: [_jsx("div", { className: `text-xs ${getStatusColor(agent.status)}`, children: agent.status.toUpperCase() }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [agent.currentLoad, "% load"] })] }), _jsx("div", { className: "w-3 h-3 rounded-full bg-muted relative", children: _jsx("div", { className: "absolute inset-0 rounded-full bg-green transition-all", style: {
                                                                clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((agent.currentLoad / 100) * 2 * Math.PI - Math.PI / 2)}% ${50 + 50 * Math.sin((agent.currentLoad / 100) * 2 * Math.PI - Math.PI / 2)}%)`
                                                            } }) })] })] }), selectedAgent === agent.agentId && (_jsxs("div", { className: "mt-3 pt-3 border-t border-border space-y-2", children: [_jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Response Time:" }), _jsxs("span", { className: "ml-1 font-medium", children: [agent.averageResponseTime.toFixed(1), "s"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Success Rate:" }), _jsxs("span", { className: "ml-1 font-medium", children: [agent.successRate.toFixed(1), "%"] })] })] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["Capabilities: ", agent.capabilities.join(', ')] })] }))] }, agent.agentId)))] })), viewMode === 'tasks' && (_jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-sm font-medium", children: "Active Tasks" }), tasks.map(task => (_jsxs("div", { className: "card p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm", children: getAgentIcon(task.agentId) }), _jsx("span", { className: "text-sm font-medium", children: task.agentName }), _jsx("span", { className: `text-xs ${getTaskStatusColor(task.status)}`, children: task.status.toUpperCase() })] }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [task.progress, "%"] })] }), _jsx("div", { className: "text-sm mb-2", children: task.task }), task.status === 'running' && (_jsx("div", { className: "w-full bg-muted rounded-full h-2 mb-2", children: _jsx("div", { className: "bg-blue h-2 rounded-full transition-all duration-300", style: { width: `${task.progress}%` } }) })), _jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [_jsxs("span", { children: ["Started: ", task.startTime.toLocaleTimeString()] }), _jsxs("span", { children: ["ETA: ", task.estimatedCompletion.toLocaleTimeString()] })] }), task.result && (_jsxs("div", { className: "mt-2 p-2 bg-green/10 rounded text-xs", children: [_jsx("div", { className: "text-green font-medium", children: "Result:" }), _jsx("div", { className: "text-muted-foreground", children: JSON.stringify(task.result, null, 2) })] }))] }, task.id)))] })), viewMode === 'performance' && (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-sm font-medium", children: "Performance Metrics" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "card p-3", children: [_jsx("div", { className: "text-xs text-muted-foreground mb-2", children: "Response Time by Agent" }), _jsx("div", { className: "space-y-1", children: agents.map(agent => (_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { children: agent.name }), _jsxs("span", { className: "font-medium", children: [agent.averageResponseTime.toFixed(1), "s"] })] }, agent.agentId))) })] }), _jsxs("div", { className: "card p-3", children: [_jsx("div", { className: "text-xs text-muted-foreground mb-2", children: "Success Rate by Agent" }), _jsx("div", { className: "space-y-1", children: agents.map(agent => (_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { children: agent.name }), _jsxs("span", { className: "font-medium", children: [agent.successRate.toFixed(1), "%"] })] }, agent.agentId))) })] })] }), _jsxs("div", { className: "card p-3", children: [_jsx("div", { className: "text-xs text-muted-foreground mb-2", children: "Task Completion History" }), _jsx("div", { className: "space-y-2", children: tasks.filter(t => t.status === 'completed').map(task => (_jsxs("div", { className: "flex justify-between items-center text-xs", children: [_jsx("span", { children: task.task }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-green", children: "\u2713" }), _jsx("span", { className: "text-muted-foreground", children: task.estimatedCompletion.toLocaleTimeString() })] })] }, task.id))) })] })] }))] })] }));
};
//# sourceMappingURL=AgentDashboard.js.map