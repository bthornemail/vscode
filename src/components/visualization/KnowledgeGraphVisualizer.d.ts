import React from 'react';
import type { KnowledgeGraph, KnowledgeGraphNode } from '../../types/ide';
import type { HyperDevMCPClient } from '../../services/MCPClient';
interface Props {
    knowledgeGraph: KnowledgeGraph | null;
    mcpClient: HyperDevMCPClient;
    onNodeSelect?: (node: KnowledgeGraphNode) => void;
    className?: string;
}
/**
 * Hyperbolic Knowledge Graph Visualizer
 *
 * The crown jewel of HyperDev IDE - renders knowledge graphs in hyperbolic space
 * using Poincaré disk model for optimal hierarchical representation.
 */
export declare const KnowledgeGraphVisualizer: React.FC<Props>;
export {};
//# sourceMappingURL=KnowledgeGraphVisualizer.d.ts.map