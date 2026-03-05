export interface AISuggestionPanel {
    id: string;
    type: 'node_addition' | 'connection_optimization' | 'pattern_completion' | 'error_prevention';
    confidence: number;
    reasoning: string;
    suggested_elements: any[];
    expected_improvement: string;
    vr_position?: {
        x: number;
        y: number;
        z: number;
    };
    applied: boolean;
}
export interface VRCanvasEnhancement {
    aiSuggestions: AISuggestionPanel[];
    hyperbolicVisualization: boolean;
    gestureControls: boolean;
    spatialAudio: boolean;
    collaborativeMode: boolean;
}
export interface VRInteraction {
    type: 'gesture' | 'voice' | 'gaze' | 'controller';
    action: string;
    parameters: any;
    timestamp: Date;
    confidence: number;
}
export declare class AIEnhancedVRInterface {
    private metaLogEndpoint;
    private aiSuggestions;
    private vrEnhancements;
    private interactionHistory;
    private isInitialized;
    constructor(metaLogEndpoint?: string);
    /**
     * Initialize AI-enhanced VR interface
     */
    initialize(): Promise<void>;
    /**
     * Get AI suggestions for current canvas
     */
    getAISuggestions(canvasData: any): Promise<AISuggestionPanel[]>;
    /**
     * Apply AI suggestion in VR space
     */
    applyAISuggestion(suggestionId: string): Promise<boolean>;
    /**
     * Get hyperbolic visualization data
     */
    getHyperbolicVisualization(canvasData: any): Promise<any>;
    /**
     * Setup gesture controls for AI interaction
     */
    setupGestureControls(): Promise<void>;
    /**
     * Setup spatial audio for AI feedback
     */
    setupSpatialAudio(): Promise<void>;
    /**
     * Get collaborative VR session info
     */
    getCollaborativeSession(sessionId: string): Promise<any>;
    /**
     * Process voice command for AI interaction
     */
    processVoiceCommand(command: string): Promise<any>;
    /**
     * Get VR interface statistics
     */
    getVRStatistics(): any;
    /**
     * Private helper methods
     */
    private connectToMetaLog;
    private setupAISuggestionPipeline;
    private initializeVREnhancements;
    private setupInteractionHandlers;
    private calculateVRPosition;
    private generateFallbackSuggestions;
    private generateFallbackHyperbolicViz;
    private applyNodeAdditionInVR;
    private applyConnectionOptimizationInVR;
    private applyPatternCompletionInVR;
    private applyErrorPreventionInVR;
    private convertToVRCoordinates;
    private recordInteraction;
    private getCurrentVRSession;
    private executeVRCommand;
    private executeCreateInVR;
    private executeOptimizeInVR;
    private executeConnectInVR;
    private executeExplainInVR;
    private updateCollaborativeSuggestions;
    private initializeHyperbolicViz;
    private calculateApplicationRate;
    private calculateAverageConfidence;
    private calculateAverageSuggestionTime;
    private getCurrentVRFPS;
    private getVRMemoryUsage;
}
export declare function createAIEnhancedVRInterface(metaLogEndpoint?: string): AIEnhancedVRInterface;
export declare const AI_VR_INTERFACE_VERSION = "1.0.0";
export declare const AI_VR_CAPABILITIES: {
    readonly AI_SUGGESTIONS: true;
    readonly HYPERBOLIC_VISUALIZATION: true;
    readonly GESTURE_CONTROLS: true;
    readonly SPATIAL_AUDIO: true;
    readonly COLLABORATIVE_VR: true;
    readonly VOICE_CONTROL: true;
    readonly REAL_TIME_SUGGESTIONS: true;
    readonly VR_OPTIMIZATION: true;
};
//# sourceMappingURL=ai-enhanced-vr-interface.d.ts.map