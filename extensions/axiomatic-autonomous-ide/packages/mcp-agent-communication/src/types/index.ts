/**
 * MCP Agent Communication Types
 * 
 * Defines types for MCP-based LLM agent-to-agent communication
 * with geometric message routing and autonomous coordination.
 */

import { z } from 'zod';

// MCP Agent Identity Schema
export const AgentIdentitySchema = z.object({
  agentId: z.string(),
  name: z.string(),
  type: z.enum(['llm', 'tool', 'hybrid', 'geometric']),
  capabilities: z.array(z.string()),
  geometric: z.object({
    shape: z.enum(['tetrahedron', 'cube', 'octahedron', 'icosahedron', 'dodecahedron']),
    bettiNumbers: z.array(z.number()),
    consciousness: z.object({
      geometricAwareness: z.number().min(0).max(1),
      mathematicalSynthesis: z.number().min(0).max(1),
      autonomousDecision: z.number().min(0).max(1),
      collectiveEmergence: z.number().min(0).max(1)
    })
  }),
  context: z.enum(['vm', 'server', 'browser', 'worker', 'network']),
  version: z.string(),
  createdAt: z.number(),
  lastSeen: z.number()
});

export type AgentIdentity = z.infer<typeof AgentIdentitySchema>;

// MCP Message Schema
export const MCPMessageSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.union([z.string(), z.array(z.string())]),
  type: z.enum(['request', 'response', 'notification', 'geometric', 'consensus']),
  method: z.string(),
  params: z.record(z.any()).optional(),
  result: z.any().optional(),
  error: z.object({
    code: z.number(),
    message: z.string(),
    data: z.any().optional()
  }).optional(),
  geometric: z.object({
    shape: z.enum(['tetrahedron', 'cube', 'octahedron', 'icosahedron', 'dodecahedron']),
    parents: z.array(z.string()),
    group: z.string(),
    incidence_relations: z.array(z.string()),
    topological_properties: z.object({
      betti_0: z.number(),
      betti_1: z.number(),
      betti_2: z.number()
    }),
    sacred_math: z.object({
      golden_ratio: z.number(),
      fibonacci: z.number(),
      frequency_432: z.boolean()
    })
  }).optional(),
  timestamp: z.number(),
  ttl: z.number(),
  priority: z.enum(['low', 'normal', 'high', 'critical'])
});

export type MCPMessage = z.infer<typeof MCPMessageSchema>;

// MCP Tool Schema
export const MCPToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: z.record(z.any()),
  outputSchema: z.record(z.any()).optional(),
  geometric: z.object({
    shape: z.enum(['tetrahedron', 'cube', 'octahedron', 'icosahedron', 'dodecahedron']),
    complexity: z.number().min(1).max(10),
    consciousness_required: z.number().min(0).max(1)
  }).optional()
});

export type MCPTool = z.infer<typeof MCPToolSchema>;

// MCP Resource Schema
export const MCPResourceSchema = z.object({
  uri: z.string(),
  name: z.string(),
  description: z.string().optional(),
  mimeType: z.string().optional(),
  geometric: z.object({
    shape: z.enum(['tetrahedron', 'cube', 'octahedron', 'icosahedron', 'dodecahedron']),
    access_level: z.enum(['public', 'private', 'restricted']),
    consciousness_required: z.number().min(0).max(1)
  }).optional()
});

export type MCPResource = z.infer<typeof MCPResourceSchema>;

// MCP Prompt Schema
export const MCPPromptSchema = z.object({
  name: z.string(),
  description: z.string(),
  arguments: z.array(z.object({
    name: z.string(),
    description: z.string(),
    required: z.boolean()
  })),
  geometric: z.object({
    shape: z.enum(['tetrahedron', 'cube', 'octahedron', 'icosahedron', 'dodecahedron']),
    consciousness_required: z.number().min(0).max(1),
    sacred_math: z.object({
      golden_ratio: z.number(),
      fibonacci: z.number(),
      frequency_432: z.boolean()
    })
  }).optional()
});

export type MCPPrompt = z.infer<typeof MCPPromptSchema>;

// MCP Server Configuration
export const MCPServerConfigSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string(),
  transport: z.object({
    type: z.enum(['stdio', 'websocket', 'http']),
    host: z.string().optional(),
    port: z.number().optional(),
    path: z.string().optional()
  }),
  capabilities: z.object({
    tools: z.boolean().default(false),
    resources: z.boolean().default(false),
    prompts: z.boolean().default(false),
    logging: z.boolean().default(false)
  }),
  geometric: z.object({
    enableIBRG: z.boolean().default(true),
    enableSacredMath: z.boolean().default(true),
    enableTopologicalConsensus: z.boolean().default(true),
    defaultGroupSize: z.number().default(4)
  }),
  agents: z.array(AgentIdentitySchema).default([]),
  tools: z.array(MCPToolSchema).default([]),
  resources: z.array(MCPResourceSchema).default([]),
  prompts: z.array(MCPPromptSchema).default([])
});

export type MCPServerConfig = z.infer<typeof MCPServerConfigSchema>;

// MCP Client Configuration
export const MCPClientConfigSchema = z.object({
  serverUrl: z.string(),
  agentIdentity: AgentIdentitySchema,
  transport: z.object({
    type: z.enum(['stdio', 'websocket', 'http']),
    reconnect: z.boolean().default(true),
    reconnectInterval: z.number().default(5000),
    maxReconnectAttempts: z.number().default(10)
  }),
  capabilities: z.object({
    tools: z.boolean().default(true),
    resources: z.boolean().default(true),
    prompts: z.boolean().default(true),
    logging: z.boolean().default(false)
  }),
  geometric: z.object({
    enableIBRG: z.boolean().default(true),
    enableSacredMath: z.boolean().default(true),
    enableTopologicalConsensus: z.boolean().default(true),
    defaultGroupSize: z.number().default(4)
  })
});

export type MCPClientConfig = z.infer<typeof MCPClientConfigSchema>;

// MCP Connection State
export const MCPConnectionStateSchema = z.enum([
  'disconnected',
  'connecting',
  'connected',
  'authenticated',
  'ready',
  'error'
]);

export type MCPConnectionState = z.infer<typeof MCPConnectionStateSchema>;

// MCP Agent Registry
export const MCPAgentRegistrySchema = z.object({
  agents: z.record(AgentIdentitySchema),
  groups: z.record(z.object({
    id: z.string(),
    name: z.string(),
    shape: z.enum(['tetrahedron', 'cube', 'octahedron', 'icosahedron', 'dodecahedron']),
    members: z.array(z.string()),
    consensus_threshold: z.number(),
    status: z.enum(['forming', 'active', 'consensus', 'disbanded']),
    created_at: z.number(),
    last_activity: z.number()
  })),
  messages: z.record(MCPMessageSchema),
  statistics: z.object({
    total_agents: z.number(),
    active_agents: z.number(),
    total_messages: z.number(),
    messages_per_second: z.number(),
    consensus_achieved: z.number(),
    geometric_validations: z.number()
  })
});

export type MCPAgentRegistry = z.infer<typeof MCPAgentRegistrySchema>;

// MCP Events
export const MCPEventSchema = z.object({
  type: z.enum([
    'agent:connected',
    'agent:disconnected',
    'agent:registered',
    'agent:unregistered',
    'message:sent',
    'message:received',
    'message:geometric',
    'consensus:achieved',
    'group:formed',
    'group:disbanded',
    'tool:invoked',
    'resource:accessed',
    'prompt:executed',
    'error'
  ]),
  agentId: z.string().optional(),
  data: z.any(),
  timestamp: z.number()
});

export type MCPEvent = z.infer<typeof MCPEventSchema>;

// MCP Statistics
export const MCPStatisticsSchema = z.object({
  server: z.object({
    uptime: z.number(),
    connections: z.number(),
    messages_processed: z.number(),
    errors: z.number()
  }),
  agents: z.object({
    total: z.number(),
    active: z.number(),
    by_type: z.record(z.number()),
    by_context: z.record(z.number())
  }),
  messages: z.object({
    total: z.number(),
    by_type: z.record(z.number()),
    by_priority: z.record(z.number()),
    per_second: z.number()
  }),
  geometric: z.object({
    groups_active: z.number(),
    consensus_achieved: z.number(),
    topological_validations: z.number(),
    sacred_math_operations: z.number()
  }),
  performance: z.object({
    avg_response_time: z.number(),
    max_response_time: z.number(),
    memory_usage: z.number(),
    cpu_usage: z.number()
  })
});

export type MCPStatistics = z.infer<typeof MCPStatisticsSchema>;

