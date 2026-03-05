/**
 * WordNet Data Bridge for H²GNN Hyperbolic World
 *
 * This module exports WordNet concept embeddings from H²GNN into a clean JSON format
 * suitable for A-Frame visualization in the Poincaré ball model.
 */
export interface WordNetNode {
    id: string;
    label: string;
    definition?: string;
    hyperbolicCoords: number[];
    hierarchyLevel: number;
    norm: number;
    semanticType: 'noun' | 'verb' | 'adjective' | 'adverb';
    hypernyms: string[];
    hyponyms: string[];
    relatedConcepts: string[];
}
export interface WordNetEdge {
    id: string;
    source: string;
    target: string;
    relationshipType: 'hypernym' | 'hyponym' | 'similar_to' | 'part_of' | 'related';
    weight: number;
    hyperbolicDistance: number;
    geodesicPath?: number[][];
}
export interface WordNetHyperbolicData {
    nodes: WordNetNode[];
    edges: WordNetEdge[];
    metadata: {
        totalConcepts: number;
        maxHierarchyLevel: number;
        averageNorm: number;
        datasetVersion: string;
        extractionDate: string;
        h2gnnModelVersion: string;
    };
}
export declare class WordNetDataBridge {
    private mcpClient;
    private cache;
    constructor(mcpClient?: any);
    /**
     * Export a subset of WordNet embeddings for A-Frame visualization
     */
    exportWordNetSubset(maxNodes?: number, rootConcept?: string, includeRelations?: boolean): Promise<WordNetHyperbolicData>;
    private fetchFromMCP;
    private generateMockData;
    private generateRandomHyperbolicCoords;
    private generateHierarchicalHyperbolicCoords;
    private getParentConcepts;
    private getChildConcepts;
    private createEdge;
    /**
     * Get specific concept data for detailed visualization
     */
    getConceptDetails(conceptId: string): Promise<WordNetNode | null>;
}
export declare const wordNetDataBridge: WordNetDataBridge;
//# sourceMappingURL=wordnet-data-bridge.d.ts.map