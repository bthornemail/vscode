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
  hypernyms: string[]; // Parent concepts
  hyponyms: string[];  // Child concepts
  relatedConcepts: string[];
}

export interface WordNetEdge {
  id: string;
  source: string;
  target: string;
  relationshipType: 'hypernym' | 'hyponym' | 'similar_to' | 'part_of' | 'related';
  weight: number;
  hyperbolicDistance: number;
  geodesicPath?: number[][]; // Points along the hyperbolic geodesic
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

export class WordNetDataBridge {
  private mcpClient: any; // Will be injected from the main app
  private cache: Map<string, WordNetHyperbolicData> = new Map();

  constructor(mcpClient?: any) {
    this.mcpClient = mcpClient;
  }

  /**
   * Export a subset of WordNet embeddings for A-Frame visualization
   */
  async exportWordNetSubset(
    maxNodes: number = 50,
    rootConcept: string = 'entity',
    includeRelations: boolean = true
  ): Promise<WordNetHyperbolicData> {
    
    const cacheKey = `${rootConcept}_${maxNodes}_${includeRelations}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // If MCP client is available, use it to get live data
      if (this.mcpClient) {
        return await this.fetchFromMCP(maxNodes, rootConcept, includeRelations);
      } else {
        // Otherwise, return mock data for development
        return this.generateMockData(maxNodes, rootConcept);
      }
    } catch (error) {
      console.warn('Failed to fetch WordNet data from MCP, using mock data:', error);
      return this.generateMockData(maxNodes, rootConcept);
    }
  }

  private async fetchFromMCP(
    maxNodes: number,
    rootConcept: string,
    includeRelations: boolean
  ): Promise<WordNetHyperbolicData> {
    
    // Query the H²GNN MCP server for WordNet embeddings
    const embeddingsResponse = await this.mcpClient.callTool('query_wordnet', {
      concept: rootConcept,
      includeHierarchy: true,
      maxResults: maxNodes
    });

    const nodes: WordNetNode[] = [];
    const edges: WordNetEdge[] = [];

    // Process the MCP response
    for (const concept of embeddingsResponse.concepts || []) {
      const node: WordNetNode = {
        id: concept.id || concept.name.replace(/\s+/g, '_').toLowerCase(),
        label: concept.name,
        definition: concept.definition,
        hyperbolicCoords: concept.embedding || this.generateRandomHyperbolicCoords(),
        hierarchyLevel: concept.hierarchyLevel || 0,
        norm: concept.norm || Math.sqrt(concept.embedding?.reduce((sum: number, x: number) => sum + x * x, 0) || 0),
        semanticType: concept.type || 'noun',
        hypernyms: concept.hypernyms || [],
        hyponyms: concept.hyponyms || [],
        relatedConcepts: concept.related || []
      };
      nodes.push(node);

      // Create edges for relationships
      if (includeRelations) {
        for (const hypernym of node.hypernyms) {
          edges.push(this.createEdge(node.id, hypernym, 'hypernym', nodes));
        }
        for (const hyponym of node.hyponyms) {
          edges.push(this.createEdge(node.id, hyponym, 'hyponym', nodes));
        }
      }
    }

    const data: WordNetHyperbolicData = {
      nodes,
      edges,
      metadata: {
        totalConcepts: nodes.length,
        maxHierarchyLevel: Math.max(...nodes.map(n => n.hierarchyLevel)),
        averageNorm: nodes.reduce((sum, n) => sum + n.norm, 0) / nodes.length,
        datasetVersion: 'WordNet-3.0',
        extractionDate: new Date().toISOString(),
        h2gnnModelVersion: '1.0.0'
      }
    };

    this.cache.set(`${rootConcept}_${maxNodes}_${includeRelations}`, data);
    return data;
  }

  private generateMockData(maxNodes: number, rootConcept: string): WordNetHyperbolicData {
    // Generate realistic mock data for development and testing
    const mockConcepts = [
      { name: 'entity', level: 0, type: 'noun' as const },
      { name: 'object', level: 1, type: 'noun' as const },
      { name: 'living_thing', level: 1, type: 'noun' as const },
      { name: 'animal', level: 2, type: 'noun' as const },
      { name: 'plant', level: 2, type: 'noun' as const },
      { name: 'mammal', level: 3, type: 'noun' as const },
      { name: 'bird', level: 3, type: 'noun' as const },
      { name: 'dog', level: 4, type: 'noun' as const },
      { name: 'cat', level: 4, type: 'noun' as const },
      { name: 'canine', level: 4, type: 'noun' as const },
      { name: 'feline', level: 4, type: 'noun' as const },
      { name: 'tree', level: 3, type: 'noun' as const },
      { name: 'flower', level: 3, type: 'noun' as const },
      { name: 'oak', level: 4, type: 'noun' as const },
      { name: 'rose', level: 4, type: 'noun' as const },
    ].slice(0, Math.min(maxNodes, 15));

    const nodes: WordNetNode[] = mockConcepts.map((concept, index) => ({
      id: concept.name,
      label: concept.name.replace(/_/g, ' '),
      definition: `Definition of ${concept.name.replace(/_/g, ' ')}`,
      hyperbolicCoords: this.generateHierarchicalHyperbolicCoords(concept.level, index),
      hierarchyLevel: concept.level,
      norm: 0.1 + (concept.level * 0.15), // Increase norm with hierarchy level
      semanticType: concept.type,
      hypernyms: this.getParentConcepts(concept.name, mockConcepts),
      hyponyms: this.getChildConcepts(concept.name, mockConcepts),
      relatedConcepts: []
    }));

    // Update norms based on actual coordinates
    nodes.forEach(node => {
      node.norm = Math.sqrt(node.hyperbolicCoords.reduce((sum, x) => sum + x * x, 0));
    });

    // Create edges
    const edges: WordNetEdge[] = [];
    nodes.forEach(node => {
      node.hypernyms.forEach(hypernym => {
        edges.push(this.createEdge(node.id, hypernym, 'hypernym', nodes));
      });
    });

    return {
      nodes,
      edges,
      metadata: {
        totalConcepts: nodes.length,
        maxHierarchyLevel: Math.max(...nodes.map(n => n.hierarchyLevel)),
        averageNorm: nodes.reduce((sum, n) => sum + n.norm, 0) / nodes.length,
        datasetVersion: 'Mock-WordNet-1.0',
        extractionDate: new Date().toISOString(),
        h2gnnModelVersion: '1.0.0-mock'
      }
    };
  }

  private generateRandomHyperbolicCoords(): number[] {
    // Generate random coordinates within the Poincaré ball (norm < 1)
    const coords = [
      (Math.random() - 0.5) * 1.8,
      (Math.random() - 0.5) * 1.8,
      (Math.random() - 0.5) * 1.8
    ];
    
    // Ensure norm < 1 for valid Poincaré ball coordinates
    const norm = Math.sqrt(coords.reduce((sum, x) => sum + x * x, 0));
    if (norm >= 1) {
      const scale = 0.9 / norm;
      return coords.map(x => x * scale);
    }
    
    return coords;
  }

  private generateHierarchicalHyperbolicCoords(level: number, index: number): number[] {
    // Generate coordinates that reflect hierarchy
    // Root concepts closer to origin, deeper concepts further out
    const baseRadius = level * 0.15;
    const angle = (index * 2 * Math.PI) / 8; // Distribute around circle
    
    return [
      baseRadius * Math.cos(angle),
      baseRadius * Math.sin(angle),
      (Math.random() - 0.5) * 0.1 // Small z variation
    ];
  }

  private getParentConcepts(conceptName: string, allConcepts: any[]): string[] {
    const hierarchyMap: { [key: string]: string } = {
      'object': 'entity',
      'living_thing': 'entity',
      'animal': 'living_thing',
      'plant': 'living_thing',
      'mammal': 'animal',
      'bird': 'animal',
      'dog': 'mammal',
      'cat': 'mammal',
      'canine': 'mammal',
      'feline': 'mammal',
      'tree': 'plant',
      'flower': 'plant',
      'oak': 'tree',
      'rose': 'flower'
    };
    
    const parent = hierarchyMap[conceptName];
    return parent ? [parent] : [];
  }

  private getChildConcepts(conceptName: string, allConcepts: any[]): string[] {
    const children: string[] = [];
    allConcepts.forEach(concept => {
      const parents = this.getParentConcepts(concept.name, allConcepts);
      if (parents.includes(conceptName)) {
        children.push(concept.name);
      }
    });
    return children;
  }

  private createEdge(
    sourceId: string,
    targetId: string,
    type: 'hypernym' | 'hyponym' | 'similar_to' | 'part_of' | 'related',
    nodes: WordNetNode[]
  ): WordNetEdge {
    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);
    
    let distance = 1.0; // Default distance
    if (sourceNode && targetNode) {
      // Calculate hyperbolic distance
      const diff = sourceNode.hyperbolicCoords.map((coord, i) => 
        coord - (targetNode.hyperbolicCoords[i] || 0)
      );
      const euclideanDist = Math.sqrt(diff.reduce((sum, x) => sum + x * x, 0));
      
      // Approximate hyperbolic distance (simplified)
      distance = Math.log(1 + euclideanDist);
    }

    return {
      id: `${sourceId}_${type}_${targetId}`,
      source: sourceId,
      target: targetId,
      relationshipType: type,
      weight: 1.0 / (1 + distance), // Closer concepts have higher weight
      hyperbolicDistance: distance
    };
  }

  /**
   * Get specific concept data for detailed visualization
   */
  async getConceptDetails(conceptId: string): Promise<WordNetNode | null> {
    if (this.mcpClient) {
      try {
        const response = await this.mcpClient.callTool('query_wordnet', {
          concept: conceptId,
          includeHierarchy: true
        });
        
        if (response.concepts && response.concepts.length > 0) {
          const concept = response.concepts[0];
          return {
            id: concept.id || conceptId,
            label: concept.name,
            definition: concept.definition,
            hyperbolicCoords: concept.embedding || this.generateRandomHyperbolicCoords(),
            hierarchyLevel: concept.hierarchyLevel || 0,
            norm: concept.norm || 0,
            semanticType: concept.type || 'noun',
            hypernyms: concept.hypernyms || [],
            hyponyms: concept.hyponyms || [],
            relatedConcepts: concept.related || []
          };
        }
      } catch (error) {
        console.error('Failed to fetch concept details:', error);
      }
    }
    
    return null;
  }
}

export const wordNetDataBridge = new WordNetDataBridge();
