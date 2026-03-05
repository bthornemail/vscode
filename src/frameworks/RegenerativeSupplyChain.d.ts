import { Observable } from 'rxjs';
import { Vector } from '../math/hyperbolic-arithmetic';
import type { SupplyChainNode, StorageManager } from '../services/StorageManager';
import type { Web3Manager, Web3Identity } from '../services/Web3Manager';
/**
 * Regenerative Supply Chain Management (RSCM) Framework
 *
 * A revolutionary framework that shifts from Green Supply Chain Management (GSCM)
 * to truly regenerative systems that build ecological, social, and economic value.
 *
 * Key Features:
 * - Net-Positive Impact: Build value, not just reduce harm
 * - Resilience: Adaptive capacity and systemic strength
 * - Circular Flows: Full resource integration and refinement
 * - Hyperbolic Optimization: Use H²GNN for complex network optimization
 * - Decentralized Verification: Blockchain-based outcome tracking
 */
export interface RegenerativeMetrics {
    ecological: {
        carbonSequestration: number;
        biodiversityIndex: number;
        soilHealth: number;
        waterRetention: number;
        energyEfficiency: number;
    };
    social: {
        communityImpact: number;
        jobsCreated: number;
        skillsDeveloped: number;
        culturalPreservation: number;
        equityScore: number;
    };
    economic: {
        localValueRetention: number;
        profitability: number;
        resilience: number;
        innovationIndex: number;
        fairPricing: number;
    };
}
export interface RegenerativeFlow {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    type: 'material' | 'energy' | 'information' | 'value' | 'waste_to_resource';
    quantity: number;
    unit: string;
    regenerativeImpact: RegenerativeMetrics;
    carbonFootprint: number;
    circularityScore: number;
    verification: {
        method: 'iot_sensor' | 'satellite' | 'field_audit' | 'blockchain' | 'community_validation';
        confidence: number;
        timestamp: Date;
        verifier: string;
    };
    hyperbolicPosition?: Vector;
}
export interface RegenerativeNetwork {
    nodes: Map<string, SupplyChainNode>;
    flows: Map<string, RegenerativeFlow>;
    bioregions: Map<string, Bioregion>;
    metrics: NetworkMetrics;
    governance: GovernanceStructure;
    hyperbolicGraph: HyperbolicNetworkGraph;
}
export interface Bioregion {
    id: string;
    name: string;
    boundaries: {
        type: 'watershed' | 'foodshed' | 'ecosystem' | 'cultural' | 'climate';
        coordinates: [number, number][];
    };
    baselineMetrics: RegenerativeMetrics;
    currentMetrics: RegenerativeMetrics;
    nodes: string[];
    regenerativeGoals: {
        carbonSequestration: {
            current: number;
            target: number;
            timeline: Date;
        };
        biodiversity: {
            current: number;
            target: number;
            timeline: Date;
        };
        soilRestoration: {
            current: number;
            target: number;
            timeline: Date;
        };
        waterCycle: {
            current: number;
            target: number;
            timeline: Date;
        };
    };
    governance: {
        stakeholders: Web3Identity[];
        decisionMaking: 'consensus' | 'majority' | 'weighted' | 'delegated';
        incentiveStructure: IncentiveStructure;
    };
}
export interface IncentiveStructure {
    carbonCredits: {
        pricePerTon: number;
        methodology: string;
        certificationBody: string;
    };
    biodiversityTokens: {
        pricePerIndex: number;
        measurementProtocol: string;
    };
    soilHealthRewards: {
        pricePerImprovement: number;
        testingFrequency: 'monthly' | 'quarterly' | 'annual';
    };
    communityBenefits: {
        profitSharing: number;
        skillDevelopment: number;
        infrastructure: number;
    };
}
export interface NetworkMetrics {
    totalRegenerativeValue: number;
    circularity: number;
    resilience: number;
    efficiency: number;
    transparency: number;
    participation: number;
    growth: {
        nodesAdded: number;
        valueIncrease: number;
        impactIncrease: number;
        timeline: 'monthly' | 'quarterly' | 'annual';
    };
}
export interface GovernanceStructure {
    type: 'dao' | 'cooperative' | 'federation' | 'hybrid';
    votingMechanism: 'token' | 'reputation' | 'stake' | 'quadratic';
    proposals: Proposal[];
    decisions: Decision[];
    stakeholders: {
        producers: Web3Identity[];
        consumers: Web3Identity[];
        validators: Web3Identity[];
        governors: Web3Identity[];
    };
}
export interface Proposal {
    id: string;
    title: string;
    description: string;
    proposer: string;
    type: 'network_upgrade' | 'incentive_change' | 'node_addition' | 'metric_adjustment';
    impact: {
        ecological: number;
        social: number;
        economic: number;
    };
    voting: {
        startDate: Date;
        endDate: Date;
        quorum: number;
        votes: {
            voter: string;
            choice: 'yes' | 'no' | 'abstain';
            weight: number;
        }[];
    };
    status: 'draft' | 'voting' | 'passed' | 'rejected' | 'implemented';
}
export interface Decision {
    id: string;
    proposalId: string;
    outcome: 'approved' | 'rejected';
    votes: {
        total: number;
        yes: number;
        no: number;
        abstain: number;
    };
    implementation: {
        date: Date;
        responsible: string[];
        milestones: {
            description: string;
            date: Date;
            completed: boolean;
        }[];
    };
}
export interface HyperbolicNetworkGraph {
    nodeEmbeddings: Map<string, Vector>;
    flowEmbeddings: Map<string, Vector>;
    regionEmbeddings: Map<string, Vector>;
    distanceMatrix: Map<string, Map<string, number>>;
    clusters: {
        ecological: string[][];
        economic: string[][];
        social: string[][];
    };
}
export declare class RegenerativeSupplyChainFramework {
    private network$;
    private metrics$;
    private alerts$;
    private storageManager;
    private web3Manager;
    private hyperbolicMath;
    constructor(storageManager: StorageManager, web3Manager: Web3Manager);
    private initializeFramework;
    addNode(nodeData: {
        type: SupplyChainNode['type'];
        name: string;
        location: {
            coordinates: [number, number];
            address: string;
        };
        ethAddress?: string;
        initialMetrics: RegenerativeMetrics;
        bioregionId?: string;
    }): Promise<SupplyChainNode>;
    createFlow(flowData: {
        sourceNodeId: string;
        targetNodeId: string;
        type: RegenerativeFlow['type'];
        quantity: number;
        unit: string;
        estimatedImpact: RegenerativeMetrics;
    }): Promise<RegenerativeFlow>;
    createBioregion(bioregionData: {
        name: string;
        type: Bioregion['boundaries']['type'];
        coordinates: [number, number][];
        regenerativeGoals: Bioregion['regenerativeGoals'];
    }): Promise<Bioregion>;
    optimizeNetwork(): Promise<{
        recommendations: Array<{
            type: 'add_connection' | 'remove_connection' | 'relocate_node' | 'change_flow';
            description: string;
            impact: RegenerativeMetrics;
            effort: 'low' | 'medium' | 'high';
        }>;
        potentialImpact: RegenerativeMetrics;
    }>;
    private findRegenerativeClusters;
    private exploreCluster;
    analyzeRegenerativeImpact(timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<{
        trends: {
            ecological: {
                metric: string;
                trend: 'improving' | 'stable' | 'declining';
                rate: number;
            }[];
            social: {
                metric: string;
                trend: 'improving' | 'stable' | 'declining';
                rate: number;
            }[];
            economic: {
                metric: string;
                trend: 'improving' | 'stable' | 'declining';
                rate: number;
            }[];
        };
        achievements: {
            carbonSequestered: number;
            biodiversityImproved: number;
            jobsCreated: number;
            localValueGenerated: number;
        };
        opportunities: {
            description: string;
            potential: number;
            effort: 'low' | 'medium' | 'high';
        }[];
    }>;
    private calculateTotalCarbonSequestered;
    private calculateBiodiversityImprovement;
    private calculateJobsCreated;
    private calculateLocalValueGenerated;
    private generateNodeEmbedding;
    private generateFlowEmbedding;
    private generateBioregionEmbedding;
    private getNodeTypeScore;
    private calculateDistance;
    private calculateGeographicCenter;
    private createEmptyMetrics;
    private createEmptyNetwork;
    private loadNetwork;
    private storeNetwork;
    private calculateRegenerativeScore;
    private calculateFlowImpact;
    private calculateCarbonFootprint;
    private calculateCircularityScore;
    private updateNetworkMetrics;
    private analyzeRegenerativeOpportunities;
    private calculateBaselineMetrics;
    private calculateCurrentMetrics;
    private createDefaultIncentiveStructure;
    private findIsolatedRegenerativeNodes;
    private findLinearFlows;
    private estimateConnectionImpact;
    private estimateNodeConnectionImpact;
    private estimateCircularityImpact;
    get network(): Observable<RegenerativeNetwork | null>;
    get metrics(): Observable<NetworkMetrics | null>;
    get alerts(): Observable<{
        type: string;
        severity: string;
        message: string;
        data: any;
    }>;
}
//# sourceMappingURL=RegenerativeSupplyChain.d.ts.map