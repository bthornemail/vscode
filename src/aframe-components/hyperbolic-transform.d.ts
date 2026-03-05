/**
 * A-Frame Hyperbolic Transform Component
 *
 * This component implements hyperbolic coordinate transformations for the Poincaré Ball Model,
 * allowing A-Frame entities to be positioned using hyperbolic coordinates and automatically
 * converted to Euclidean space for rendering.
 *
 * Usage:
 * <a-entity hyperbolic-transform="hyperbolic: 0.5 0.3 0.2; scale: 1.5"></a-entity>
 */
import { Vector3 } from 'three';
export interface HyperbolicVector {
    value: number[];
    norm: number;
}
export declare function createHyperbolicVector(coords: number[]): HyperbolicVector;
export declare function mobiusAddition(u: HyperbolicVector, v: HyperbolicVector): HyperbolicVector;
export declare function hyperbolicToEuclidean(hypCoords: HyperbolicVector, radius?: number): Vector3;
export declare function hyperbolicDistance(u: HyperbolicVector, v: HyperbolicVector): number;
declare const HyperbolicTransformComponent: {
    schema: {
        hyperbolic: {
            type: string;
            default: {
                x: number;
                y: number;
                z: number;
            };
        };
        scale: {
            type: string;
            default: number;
        };
        radius: {
            type: string;
            default: number;
        };
        animateMovement: {
            type: string;
            default: boolean;
        };
        animationDuration: {
            type: string;
            default: number;
        };
    };
    init(): void;
    update(oldData: any): void;
    tick(time: number): void;
    startAnimation(): void;
    interpolateHyperbolic(start: HyperbolicVector, end: HyperbolicVector, t: number): HyperbolicVector;
    easeInOutCubic(t: number): number;
    updatePosition(): void;
    getHyperbolicPosition(): HyperbolicVector;
    setHyperbolicPosition(coords: number[], animate?: boolean): void;
    getDistanceFromOrigin(): number;
};
export { HyperbolicTransformComponent };
//# sourceMappingURL=hyperbolic-transform.d.ts.map