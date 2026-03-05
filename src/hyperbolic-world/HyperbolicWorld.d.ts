/**
 * H²GNN Hyperbolic World Component
 *
 * A React component that renders an A-Frame scene visualizing the hierarchical
 * structure of WordNet concepts and PocketFlow agent workflows in hyperbolic space.
 */
import React from 'react';
import 'aframe';
import 'aframe-extras';
import '../aframe-components/hyperbolic-transform';
interface HyperbolicWorldProps {
    mcpClient?: any;
    showWordNet?: boolean;
    showAgentPaths?: boolean;
    maxNodes?: number;
    worldRadius?: number;
    enableVR?: boolean;
}
declare const HyperbolicWorld: React.FC<HyperbolicWorldProps>;
export default HyperbolicWorld;
//# sourceMappingURL=HyperbolicWorld.d.ts.map