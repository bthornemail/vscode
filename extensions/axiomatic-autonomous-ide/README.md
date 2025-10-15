# Axiomatic Autonomous IDE Extension

Transform VSCode into an autonomous, offline-first IDE with AI persistence and geometric communication.

## Features

### 🧠 AI Persistence
- **Persistent Memory**: Stores episodic, semantic, and procedural memories
- **Learning System**: Learns from code edits, builds, and debugging sessions
- **Knowledge Consolidation**: Automatically consolidates and organizes knowledge
- **Offline-First**: Works without internet connection using embedded SQLite

### 🔮 Geometric Communication
- **Platonic Solid Groups**: Organize agents in tetrahedron, cube, octahedron structures
- **Consensus Mechanisms**: Geometric-based consensus for decision making
- **Sacred Mathematics**: Integration of golden ratio and Fibonacci scaling
- **Topological Analysis**: Betti number analysis for system stability

### 🤖 Autonomous Agents
- **Code Analysis Agent**: Analyzes code patterns and structures
- **Suggestion Agent**: Provides intelligent code suggestions and refactoring
- **Learning Manager**: Manages continuous learning from user interactions
- **Agent Coordination**: Geometric communication between agents

### 🎛️ Control Panel
- **System Status**: Monitor AI persistence and agent health
- **Memory Statistics**: View memory usage and learning progress
- **Configuration**: Adjust learning rates and system settings
- **Knowledge Export**: Export learned knowledge for backup

## Installation

1. Copy this extension to your VSCode extensions directory
2. Build the extension:
   ```bash
   cd /home/main/github/vscode/extensions/axiomatic-autonomous-ide
   npm install
   npm run compile
   ```
3. Reload VSCode to activate the extension

## Usage

### Commands

Access commands via Command Palette (`Ctrl+Shift+P`):

- **Initialize Axiomatic System**: Set up the AI persistence and agents
- **Enable Autonomous Mode**: Activate autonomous learning and suggestions
- **Learn from Current File**: Store current file content as learning data
- **Show Memory Statistics**: Display memory usage and learning progress
- **Consolidate Memories**: Trigger memory consolidation process
- **Export Knowledge Base**: Export learned knowledge to JSON file
- **Open Axiomatic Control Panel**: Open the main control interface

### Configuration

Configure the extension in VSCode settings:

```json
{
  "axiomatic.enabled": true,
  "axiomatic.autonomousMode": true,
  "axiomatic.learningRate": "adaptive",
  "axiomatic.persistenceMode": "embedded",
  "axiomatic.geometricConsciousness": true,
  "axiomatic.sacredMathematics": true,
  "axiomatic.maxMemories": 10000,
  "axiomatic.consolidationThreshold": 100
}
```

### Control Panel

The control panel provides a web-based interface for:

- **System Overview**: Status of all Axiomatic components
- **Memory Management**: View and manage stored memories
- **Agent Status**: Monitor autonomous agents
- **Learning Progress**: Track learning achievements
- **Configuration**: Adjust system settings
- **Knowledge Export**: Export and backup knowledge

## Architecture

### Core Components

1. **AxiomaticService**: Main orchestrator for all Axiomatic features
2. **AIPersistenceService**: Manages memory storage and retrieval
3. **GeometricCommunicationService**: Handles agent communication
4. **AutonomousAgentService**: Manages autonomous agents
5. **LearningManager**: Coordinates learning from user interactions

### Storage

- **Embedded Mode**: Uses SQLite database in extension storage
- **Docker Mode**: Connects to external AI Persistence service
- **File System**: Stores memories, configurations, and knowledge

### Agents

- **CodeAnalysisAgent**: Analyzes code patterns and structures
- **SuggestionAgent**: Provides intelligent suggestions
- **LearningManager**: Manages continuous learning

## Development

### Building

```bash
npm install
npm run compile
npm run watch  # For development
```

### Testing

```bash
npm test
```

### Structure

```
src/
├── extension.ts              # Main extension entry point
├── axiomaticService.ts       # Core service orchestrator
├── persistence/              # AI Persistence implementations
│   ├── embeddedPersistence.ts
│   └── dockerPersistence.ts
├── agents/                   # Autonomous agents
│   ├── codeAnalysisAgent.ts
│   ├── suggestionAgent.ts
│   └── autonomousAgentService.ts
├── geometric/                # Geometric communication
│   └── geometricCommunication.ts
├── learning/                 # Learning system
│   └── learningManager.ts
└── views/                    # UI components
    └── controlPanel.ts
```

## Integration with Axiomatic System

This extension integrates with the broader Axiomatic system:

- **AI Persistence Engine**: Uses the production-ready AI Persistence package
- **Geometric Communication**: Implements Platonic solid-based communication
- **Sacred Mathematics**: Applies golden ratio and Fibonacci scaling
- **Universal Signal Processing**: Framework for all signal types
- **H²GNN Integration**: Hyperbolic Geometric Neural Network capabilities

## Status

- ✅ **Core Extension**: Basic extension structure and commands
- ✅ **AI Persistence**: Embedded SQLite storage
- ✅ **Control Panel**: Web-based management interface
- ✅ **Learning System**: Continuous learning from interactions
- ✅ **Agent Framework**: Autonomous agent infrastructure
- 🔄 **Geometric Communication**: Basic implementation
- 🔄 **Advanced Agents**: Enhanced code analysis and suggestions
- 🔄 **Docker Integration**: External AI Persistence service

## Contributing

1. Follow the existing code structure and patterns
2. Add tests for new features
3. Update documentation for changes
4. Ensure compatibility with Axiomatic system principles

## License

MIT License - See LICENSE file for details
