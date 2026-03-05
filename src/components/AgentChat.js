import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
const agents = [
    {
        id: 'architect',
        name: 'Architect Agent',
        type: 'architect',
        status: 'ready',
        capabilities: ['Code Generation', 'System Design', 'Architecture Planning'],
        currentTask: undefined
    },
    {
        id: 'security',
        name: 'Security Agent',
        type: 'security',
        status: 'busy',
        capabilities: ['Vulnerability Scanning', 'Security Analysis', 'Compliance Check'],
        currentTask: 'Scanning smart contracts for vulnerabilities'
    },
    {
        id: 'impact',
        name: 'Impact Agent',
        type: 'impact',
        status: 'ready',
        capabilities: ['Carbon Tracking', 'Impact Measurement', 'Sustainability Analysis'],
        currentTask: undefined
    },
    {
        id: 'logistics',
        name: 'Logistics Agent',
        type: 'logistics',
        status: 'ready',
        capabilities: ['Supply Chain Optimization', 'Route Planning', 'Resource Allocation'],
        currentTask: undefined
    }
];
export const AgentChat = () => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            type: 'agent',
            agent: 'system',
            content: 'Welcome to HyperDev IDE! I\'m your regenerative development assistant. How can I help you build sustainable applications today?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [selectedAgent, setSelectedAgent] = useState('all');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const handleSendMessage = async () => {
        if (!input.trim())
            return;
        const userMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: input,
            timestamp: new Date(),
            status: 'sending'
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);
        // Simulate agent response
        setTimeout(() => {
            const agentResponse = generateAgentResponse(input, selectedAgent);
            const agentMessage = {
                id: (Date.now() + 1).toString(),
                type: 'agent',
                agent: agentResponse.agent,
                content: agentResponse.content,
                timestamp: new Date(),
                status: 'sent'
            };
            setMessages(prev => [...prev, agentMessage]);
            setIsTyping(false);
        }, 1000 + Math.random() * 2000);
    };
    const generateAgentResponse = (input, selectedAgent) => {
        const lowerInput = input.toLowerCase();
        if (selectedAgent === 'all' || selectedAgent === 'architect') {
            if (lowerInput.includes('smart contract') || lowerInput.includes('solidity')) {
                return {
                    agent: 'Architect Agent',
                    content: `I'll help you create a regenerative smart contract. Based on your request, I recommend implementing a carbon credit token with the following features:

\`\`\`solidity
contract CarbonCreditToken {
    mapping(address => uint256) public carbonSequestered;
    mapping(address => uint256) public impactScore;
    
    function mintForImpact(address farmer, uint256 carbonAmount) external {
        // Verify impact measurement through IoT sensors
        require(verifyImpact(farmer, carbonAmount), "Invalid impact data");
        carbonSequestered[farmer] += carbonAmount;
        impactScore[farmer] = calculateImpactScore(farmer);
    }
}
\`\`\`

Would you like me to implement the verification logic or add more features?`
                };
            }
        }
        if (selectedAgent === 'all' || selectedAgent === 'security') {
            if (lowerInput.includes('security') || lowerInput.includes('vulnerability')) {
                return {
                    agent: 'Security Agent',
                    content: `I've analyzed your code for security vulnerabilities. Here are my findings:

🔍 **Security Analysis Results:**
- ✅ No reentrancy vulnerabilities detected
- ✅ Access control properly implemented
- ⚠️ Consider adding time locks for critical functions
- ⚠️ Implement circuit breakers for emergency stops

**Recommendations:**
1. Add multi-signature requirements for admin functions
2. Implement rate limiting for minting operations
3. Add emergency pause functionality

Would you like me to implement these security enhancements?`
                };
            }
        }
        if (selectedAgent === 'all' || selectedAgent === 'impact') {
            if (lowerInput.includes('carbon') || lowerInput.includes('impact') || lowerInput.includes('sustainability')) {
                return {
                    agent: 'Impact Agent',
                    content: `I'll help you track and optimize your carbon impact. Here's what I can do:

🌱 **Impact Tracking Dashboard:**
- Real-time carbon footprint monitoring
- Supply chain sustainability scoring
- Regenerative practice recommendations
- Impact measurement and verification

**Current Project Impact:**
- Estimated CO2 reduction: 2.3 tons
- Supply chain efficiency: 89%
- Regenerative score: 7.2/10

Would you like me to:
1. Set up automated impact measurement?
2. Optimize your supply chain for sustainability?
3. Generate impact reports for stakeholders?`
                };
            }
        }
        if (selectedAgent === 'all' || selectedAgent === 'logistics') {
            if (lowerInput.includes('supply chain') || lowerInput.includes('logistics') || lowerInput.includes('optimization')) {
                return {
                    agent: 'Logistics Agent',
                    content: `I'll optimize your supply chain for maximum efficiency and sustainability. Here's my analysis:

🚛 **Supply Chain Optimization:**
- Route optimization: 23% reduction in transport emissions
- Inventory management: 15% reduction in waste
- Supplier network: 3 new regenerative suppliers identified

**Recommended Actions:**
1. Implement dynamic routing based on carbon footprint
2. Set up circular economy loops for waste reduction
3. Establish local supplier networks to reduce transport

Would you like me to implement these optimizations or analyze specific logistics challenges?`
                };
            }
        }
        // Default response
        return {
            agent: 'System',
            content: `I understand you're asking about "${input}". I can help you with:

🏗️ **Architecture & Development** - Smart contracts, system design
🔍 **Security Analysis** - Vulnerability scanning, compliance
🌱 **Impact Measurement** - Carbon tracking, sustainability
🚛 **Logistics Optimization** - Supply chain, resource allocation

Which area would you like to focus on? I can provide specific guidance and even generate code for your regenerative applications.`
        };
    };
    const getAgentIcon = (agentType) => {
        switch (agentType) {
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
    return (_jsxs("div", { className: "h-full flex flex-col", children: [_jsxs("div", { className: "p-3 border-b border-border", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Select Agent" }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("div", { className: "w-2 h-2 bg-green rounded-full animate-pulse" }), _jsx("span", { className: "text-xs text-green", children: "4 Active" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("button", { onClick: () => setSelectedAgent('all'), className: `btn btn-sm ${selectedAgent === 'all' ? 'btn-primary' : 'btn-ghost'}`, children: "\uD83E\uDD16 All Agents" }), agents.map(agent => (_jsxs("button", { onClick: () => setSelectedAgent(agent.id), className: `btn btn-sm ${selectedAgent === agent.id ? 'btn-primary' : 'btn-ghost'} flex items-center justify-between`, children: [_jsxs("span", { children: [getAgentIcon(agent.type), " ", agent.name] }), _jsx("div", { className: `w-2 h-2 rounded-full ${getStatusColor(agent.status)}` })] }, agent.id)))] })] }), _jsxs("div", { className: "flex-1 overflow-auto p-3 space-y-3", children: [messages.map(message => (_jsx("div", { className: `flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`, children: _jsxs("div", { className: `max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`, children: [message.type === 'agent' && (_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx("span", { className: "text-sm", children: getAgentIcon(message.agent || 'system') }), _jsx("span", { className: "text-xs font-medium", children: message.agent }), _jsx("span", { className: "text-xs text-muted-foreground", children: message.timestamp.toLocaleTimeString() })] })), _jsxs("div", { className: `p-3 rounded-lg ${message.type === 'user'
                                        ? 'bg-primary text-white'
                                        : 'bg-card border border-border'}`, children: [_jsx("div", { className: "whitespace-pre-wrap text-sm", children: message.content }), message.status === 'sending' && (_jsxs("div", { className: "flex items-center space-x-1 mt-2", children: [_jsx("div", { className: "w-1 h-1 bg-white rounded-full animate-bounce" }), _jsx("div", { className: "w-1 h-1 bg-white rounded-full animate-bounce", style: { animationDelay: '0.1s' } }), _jsx("div", { className: "w-1 h-1 bg-white rounded-full animate-bounce", style: { animationDelay: '0.2s' } })] }))] })] }) }, message.id))), isTyping && (_jsx("div", { className: "flex justify-start", children: _jsx("div", { className: "bg-card border border-border p-3 rounded-lg", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm", children: "\uD83E\uDD16" }), _jsx("span", { className: "text-xs text-muted-foreground", children: "Agent is typing..." }), _jsxs("div", { className: "flex space-x-1", children: [_jsx("div", { className: "w-1 h-1 bg-muted rounded-full animate-bounce" }), _jsx("div", { className: "w-1 h-1 bg-muted rounded-full animate-bounce", style: { animationDelay: '0.1s' } }), _jsx("div", { className: "w-1 h-1 bg-muted rounded-full animate-bounce", style: { animationDelay: '0.2s' } })] })] }) }) })), _jsx("div", { ref: messagesEndRef })] }), _jsx("div", { className: "p-3 border-t border-border", children: _jsxs("div", { className: "flex space-x-2", children: [_jsx("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), onKeyPress: (e) => e.key === 'Enter' && handleSendMessage(), placeholder: "Ask agents about your regenerative project...", className: "input flex-1", disabled: isTyping }), _jsx("button", { onClick: handleSendMessage, disabled: !input.trim() || isTyping, className: "btn btn-primary", children: "\uD83D\uDE80" })] }) })] }));
};
//# sourceMappingURL=AgentChat.js.map