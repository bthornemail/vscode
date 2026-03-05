import { Observable } from 'rxjs';
import type { Web3Manager } from './Web3Manager';
import type { StorageManager } from './StorageManager';
import type { RegenerativeMetrics } from '../frameworks/RegenerativeSupplyChain';
/**
 * Regenerative Finance (ReFi) Integration
 *
 * Provides transparent, blockchain-based tracking of regenerative outcomes
 * and automated DeFi mechanisms for incentivizing positive environmental impact.
 *
 * Features:
 * - Real-time impact measurement and verification
 * - Automated carbon credit generation and trading
 * - Biodiversity token minting based on ecosystem improvements
 * - Soil health rewards and water conservation incentives
 * - Transparent impact reporting with immutable records
 * - Economic governance for regenerative networks
 */
export interface ImpactToken {
    id: string;
    type: 'carbon_credit' | 'biodiversity_token' | 'soil_health_reward' | 'water_conservation_credit' | 'renewable_energy_certificate';
    contractAddress: string;
    symbol: string;
    totalSupply: string;
    methodology: string;
    verification: {
        standard: string;
        auditor: string;
        lastVerified: Date;
        confidence: number;
    };
    priceOracle: {
        currentPrice: number;
        currency: string;
        lastUpdated: Date;
        priceHistory: {
            timestamp: Date;
            price: number;
        }[];
    };
    impactMetrics: RegenerativeMetrics;
    issuanceRules: {
        minimumImprovement: number;
        measurementFrequency: 'daily' | 'weekly' | 'monthly' | 'seasonal';
        verification_required: boolean;
        stakingPeriod: number;
    };
}
export interface ImpactMeasurement {
    id: string;
    timestamp: Date;
    location: {
        coordinates: [number, number];
        region: string;
        ecosystem: string;
        area: number;
    };
    measurements: {
        carbonSequestration: {
            value: number;
            method: 'soil_sampling' | 'biomass_measurement' | 'remote_sensing' | 'smart_contract_oracle';
            confidence: number;
            baseline: number;
            improvement: number;
        };
        biodiversity: {
            speciesCount: number;
            shannonsIndex: number;
            habitatQuality: number;
            pollinatorActivity: number;
            method: 'field_survey' | 'acoustic_monitoring' | 'camera_traps' | 'satellite_analysis';
            confidence: number;
        };
        soilHealth: {
            organicMatter: number;
            ph: number;
            waterHoldingCapacity: number;
            microbialActivity: number;
            method: 'lab_analysis' | 'field_testing' | 'sensor_monitoring';
            confidence: number;
        };
        waterCycle: {
            infiltrationRate: number;
            runoffReduction: number;
            groundwaterRecharge: number;
            method: 'hydrological_monitoring' | 'satellite_analysis' | 'field_measurement';
            confidence: number;
        };
    };
    verifier: {
        address: string;
        credentials: string[];
        reputation: number;
        signature?: string;
    };
    tokenIssuance?: {
        tokenType: ImpactToken['type'];
        amount: number;
        recipient: string;
        txHash?: string;
    };
}
export interface RegenerativePool {
    id: string;
    name: string;
    type: 'carbon_market' | 'biodiversity_fund' | 'soil_health_incentive' | 'water_conservation' | 'renewable_transition';
    contractAddress: string;
    totalValueLocked: number;
    currency: string;
    stakeholders: {
        address: string;
        stake: number;
        role: 'producer' | 'verifier' | 'investor' | 'consumer' | 'governor';
        joinedAt: Date;
    }[];
    governance: {
        votingMechanism: 'token_weighted' | 'quadratic' | 'reputation_based' | 'one_person_one_vote';
        proposals: GovernanceProposal[];
        executedDecisions: GovernanceDecision[];
    };
    impactTargets: {
        carbonSequestration: {
            target: number;
            achieved: number;
            deadline: Date;
        };
        biodiversityImprovement: {
            target: number;
            achieved: number;
            deadline: Date;
        };
        soilHealthGains: {
            target: number;
            achieved: number;
            deadline: Date;
        };
        waterConservation: {
            target: number;
            achieved: number;
            deadline: Date;
        };
    };
    rewardMechanism: {
        baseReward: number;
        performanceMultiplier: number;
        bonusThresholds: {
            threshold: number;
            bonus: number;
        }[];
        paymentSchedule: 'immediate' | 'monthly' | 'seasonal' | 'milestone_based';
    };
}
export interface GovernanceProposal {
    id: string;
    title: string;
    description: string;
    proposer: string;
    type: 'parameter_change' | 'fund_allocation' | 'methodology_update' | 'stakeholder_addition' | 'emergency_action';
    parameters: {
        targetParameter?: string;
        newValue?: any;
        reasoning: string;
        impactAssessment: RegenerativeMetrics;
    };
    voting: {
        startTime: Date;
        endTime: Date;
        quorum: number;
        votes: {
            voter: string;
            choice: 'yes' | 'no' | 'abstain';
            weight: number;
            timestamp: Date;
        }[];
        currentTally: {
            yes: number;
            no: number;
            abstain: number;
        };
    };
    status: 'draft' | 'active' | 'passed' | 'rejected' | 'executed' | 'expired';
    executionDetails?: {
        executedAt: Date;
        executor: string;
        txHash: string;
        gasUsed: number;
    };
}
export interface GovernanceDecision {
    id: string;
    proposalId: string;
    outcome: 'approved' | 'rejected';
    finalVotes: {
        yes: number;
        no: number;
        abstain: number;
    };
    participationRate: number;
    executionPlan: {
        steps: {
            description: string;
            responsible: string;
            deadline: Date;
            completed: boolean;
        }[];
        budgetAllocated: number;
        expectedImpact: RegenerativeMetrics;
    };
    actualResults?: {
        implementedAt: Date;
        actualImpact: RegenerativeMetrics;
        costSpent: number;
        lessonsLearned: string[];
    };
}
export interface ReFiAnalytics {
    totalImpactValue: number;
    totalTokensIssued: number;
    averageVerificationTime: number;
    impactEfficiency: number;
    networkGrowthRate: number;
    governanceParticipation: number;
    priceStability: number;
    carbonCreditsGenerated: number;
    biodiversityTokensMinted: number;
    soilHealthRewardsDistributed: number;
    regenerativeROI: number;
}
export declare class ReFiIntegration {
    private web3Manager;
    private storageManager;
    private impactTokens$;
    private measurements$;
    private regenerativePools$;
    private analytics$;
    private impactMeasured$;
    private tokensIssued$;
    private governanceAction$;
    private priceUpdate$;
    private contracts;
    constructor(web3Manager: Web3Manager, storageManager: StorageManager);
    private initializeReFiSystem;
    submitImpactMeasurement(measurementData: {
        location: ImpactMeasurement['location'];
        measurements: ImpactMeasurement['measurements'];
        verifier: {
            address: string;
            credentials: string[];
        };
    }): Promise<ImpactMeasurement>;
    private validateMeasurement;
    private calculateTokenIssuance;
    private mintImpactTokens;
    createRegenerativePool(poolData: {
        name: string;
        type: RegenerativePool['type'];
        initialFunding: number;
        impactTargets: RegenerativePool['impactTargets'];
        governance: Partial<RegenerativePool['governance']>;
    }): Promise<RegenerativePool>;
    submitGovernanceProposal(poolId: string, proposalData: {
        title: string;
        description: string;
        type: GovernanceProposal['type'];
        parameters: GovernanceProposal['parameters'];
    }): Promise<GovernanceProposal>;
    castVote(poolId: string, proposalId: string, choice: 'yes' | 'no' | 'abstain', weight?: number): Promise<void>;
    private executeProposal;
    calculateReFiAnalytics(): Promise<ReFiAnalytics>;
    private startImpactMonitoring;
    private startPriceOracles;
    private loadImpactTokens;
    private loadRegenerativePools;
    private getVerifierReputation;
    private validateWithSatelliteData;
    private validateAgainstBaselines;
    private requestPeerValidation;
    private calculateVotingWeight;
    private getTotalVotingPower;
    private executeParameterChange;
    private executeFundAllocation;
    private executeMethodologyUpdate;
    get impactTokens(): Observable<Map<string, ImpactToken>>;
    get measurements(): Observable<ImpactMeasurement[]>;
    get regenerativePools(): Observable<Map<string, RegenerativePool>>;
    get analytics(): Observable<ReFiAnalytics | null>;
    get impactMeasured(): Observable<ImpactMeasurement>;
    get tokensIssued(): Observable<{
        measurement: ImpactMeasurement;
        tokens: number;
    }>;
    get governanceActions(): Observable<{
        type: string;
        data: any;
    }>;
    get priceUpdates(): Observable<{
        tokenId: string;
        price: number;
    }>;
    cleanup(): void;
}
//# sourceMappingURL=ReFiIntegration.d.ts.map