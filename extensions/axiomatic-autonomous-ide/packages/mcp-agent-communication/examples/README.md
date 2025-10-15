# MCP Agent Communication Examples

This directory contains comprehensive examples demonstrating the capabilities of the MCP Agent Communication package.

## Examples

### 1. Basic Usage (`basic-usage.ts`)

Demonstrates basic MCP agent communication with geometric message routing and autonomous coordination.

**Features:**
- Server and client setup
- Agent identity creation and registration
- Geometric group formation
- Message sending (MCP and geometric)
- Consensus checking
- Statistics gathering

**Run:**
```bash
npx tsx examples/basic-usage.ts
```

### 2. Geometric Consensus (`geometric-consensus.ts`)

Demonstrates geometric consensus mechanisms using Platonic solid structures and topological invariants.

**Features:**
- Multiple agent coordination
- Different geometric group types (tetrahedron, cube, octahedron)
- Consensus proposal and voting
- Sacred mathematics integration
- Topological analysis
- Betti number validation

**Run:**
```bash
npx tsx examples/geometric-consensus.ts
```

### 3. Autonomous Coordination (`autonomous-coordination.ts`)

Demonstrates autonomous agent coordination with emergent behavior and self-organizing groups.

**Features:**
- Autonomous agent types (coordinator, worker, observer, communicator)
- Self-organizing group formation
- Emergent task distribution
- Autonomous decision making
- Collective intelligence
- System evolution simulation

**Run:**
```bash
npx tsx examples/autonomous-coordination.ts
```

## Prerequisites

Before running the examples, make sure you have:

1. **Node.js 18+** installed
2. **TypeScript** and **tsx** installed globally:
   ```bash
   npm install -g typescript tsx
   ```
3. **The MCP package** built and available:
   ```bash
   cd packages/mcp-agent-communication
   npm install
   npm run build
   ```

## Running Examples

### Option 1: Direct Execution

```bash
# Navigate to the examples directory
cd packages/mcp-agent-communication/examples

# Run any example
npx tsx basic-usage.ts
npx tsx geometric-consensus.ts
npx tsx autonomous-coordination.ts
```

### Option 2: From Package Root

```bash
# Navigate to the package root
cd packages/mcp-agent-communication

# Run examples
npx tsx examples/basic-usage.ts
npx tsx examples/geometric-consensus.ts
npx tsx examples/autonomous-coordination.ts
```

## Example Output

Each example provides detailed console output showing:

- Server startup and configuration
- Agent creation and registration
- Group formation and management
- Message routing and delivery
- Consensus mechanisms
- Statistics and monitoring
- Cleanup and shutdown

## Customization

You can customize the examples by modifying:

- **Agent configurations**: Change agent types, capabilities, and identities
- **Group settings**: Modify geometric shapes, sizes, and consensus thresholds
- **Message content**: Customize message types and payloads
- **Timing**: Adjust delays and intervals for different behaviors
- **Network settings**: Change ports, hosts, and transport configurations

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in the server configuration
2. **Connection refused**: Ensure the server starts before clients connect
3. **Module not found**: Make sure the package is built (`npm run build`)
4. **TypeScript errors**: Check that all dependencies are installed

### Debug Mode

Enable debug logging by setting environment variables:

```bash
DEBUG=mcp:* npx tsx examples/basic-usage.ts
```

## Integration

These examples can be integrated into your own applications by:

1. **Copying the code**: Use the example code as a starting point
2. **Importing components**: Import specific classes and functions
3. **Extending functionality**: Add your own features and capabilities
4. **Customizing behavior**: Modify the examples for your use case

## Contributing

To add new examples:

1. Create a new TypeScript file in the `examples/` directory
2. Follow the existing naming convention (`kebab-case.ts`)
3. Include comprehensive documentation and comments
4. Add the example to this README
5. Test the example thoroughly
6. Submit a pull request

## Support

For help with the examples:

- Check the main [README.md](../README.md) for detailed documentation
- Review the [API Reference](../README.md#api-reference) for available methods
- Open an issue on GitHub for bugs or questions
- Join the community discussions for support

