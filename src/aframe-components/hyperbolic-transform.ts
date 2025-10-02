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

// Hyperbolic arithmetic functions (adapted from the H²GNN math)
export interface HyperbolicVector {
  value: number[];
  norm: number;
}

export function createHyperbolicVector(coords: number[]): HyperbolicVector {
  const norm = Math.sqrt(coords.reduce((sum, x) => sum + x * x, 0));
  return {
    value: [...coords],
    norm: norm
  };
}

export function mobiusAddition(u: HyperbolicVector, v: HyperbolicVector): HyperbolicVector {
  const gamma_u = 1 / Math.sqrt(1 - u.norm * u.norm);
  const gamma_v = 1 / Math.sqrt(1 - v.norm * v.norm);
  
  const u_dot_v = u.value.reduce((sum, val, i) => sum + val * v.value[i], 0);
  
  const numerator = u.value.map((u_i, i) => 
    gamma_u * u_i + gamma_v * v.value[i] + 
    (gamma_u - 1) / (u.norm * u.norm) * u_dot_v * u_i
  );
  
  const denominator = 1 + u_dot_v;
  
  const result = numerator.map(x => x / denominator);
  
  return createHyperbolicVector(result);
}

export function hyperbolicToEuclidean(hypCoords: HyperbolicVector, radius: number = 1): Vector3 {
  // Project hyperbolic coordinates to Euclidean space within the Poincaré ball
  const scale = radius / (1 + Math.sqrt(1 - hypCoords.norm * hypCoords.norm));
  
  return new Vector3(
    hypCoords.value[0] * scale,
    hypCoords.value[1] * scale,
    hypCoords.value[2] || 0 // Handle 2D coordinates
  );
}

export function hyperbolicDistance(u: HyperbolicVector, v: HyperbolicVector): number {
  // Compute hyperbolic distance in the Poincaré ball model
  const diff = u.value.map((u_i, i) => u_i - v.value[i]);
  const diffNormSq = diff.reduce((sum, x) => sum + x * x, 0);
  
  const numerator = 2 * diffNormSq;
  const denominator = (1 - u.norm * u.norm) * (1 - v.norm * v.norm);
  
  return Math.acosh(1 + numerator / denominator);
}

// A-Frame component definition
const HyperbolicTransformComponent = {
  schema: {
    hyperbolic: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
    scale: { type: 'number', default: 1 },
    radius: { type: 'number', default: 1 },
    animateMovement: { type: 'boolean', default: false },
    animationDuration: { type: 'number', default: 1000 }
  },

  init() {
    this.currentHyperbolic = createHyperbolicVector([0, 0, 0]);
    this.targetHyperbolic = createHyperbolicVector([0, 0, 0]);
    this.animating = false;
    this.animationStart = 0;
    
    // Set initial position
    this.updatePosition();
  },

  update(oldData: any) {
    const data = this.data;
    
    // Update target hyperbolic coordinates
    this.targetHyperbolic = createHyperbolicVector([
      data.hyperbolic.x,
      data.hyperbolic.y,
      data.hyperbolic.z
    ]);

    if (data.animateMovement && oldData.hyperbolic) {
      // Start animation to new position
      this.startAnimation();
    } else {
      // Immediate update
      this.currentHyperbolic = this.targetHyperbolic;
      this.updatePosition();
    }
  },

  tick(time: number) {
    if (this.animating) {
      const progress = Math.min((time - this.animationStart) / this.data.animationDuration, 1);
      
      // Interpolate in hyperbolic space using Möbius addition
      const t = this.easeInOutCubic(progress);
      this.currentHyperbolic = this.interpolateHyperbolic(
        this.currentHyperbolic,
        this.targetHyperbolic,
        t
      );
      
      this.updatePosition();
      
      if (progress >= 1) {
        this.animating = false;
        this.currentHyperbolic = this.targetHyperbolic;
      }
    }
  },

  startAnimation() {
    this.animating = true;
    this.animationStart = this.el.sceneEl?.time || Date.now();
  },

  interpolateHyperbolic(start: HyperbolicVector, end: HyperbolicVector, t: number): HyperbolicVector {
    // Linear interpolation in hyperbolic space (simplified)
    // In a full implementation, this would use proper geodesic interpolation
    const interpolated = start.value.map((startVal, i) => 
      startVal + (end.value[i] - startVal) * t
    );
    
    return createHyperbolicVector(interpolated);
  },

  easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },

  updatePosition() {
    if (!this.el.object3D) return;
    
    // Convert hyperbolic coordinates to Euclidean position
    const euclideanPos = hyperbolicToEuclidean(this.currentHyperbolic, this.data.radius);
    
    // Apply position and scale
    this.el.object3D.position.copy(euclideanPos);
    this.el.object3D.scale.setScalar(this.data.scale);
    
    // Emit event for other components to listen
    this.el.emit('hyperbolic-position-updated', {
      hyperbolic: this.currentHyperbolic,
      euclidean: euclideanPos,
      distance: hyperbolicDistance(this.currentHyperbolic, createHyperbolicVector([0, 0, 0]))
    });
  },

  // Utility methods for other components
  getHyperbolicPosition(): HyperbolicVector {
    return this.currentHyperbolic;
  },

  setHyperbolicPosition(coords: number[], animate: boolean = false) {
    this.targetHyperbolic = createHyperbolicVector(coords);
    
    if (animate) {
      this.startAnimation();
    } else {
      this.currentHyperbolic = this.targetHyperbolic;
      this.updatePosition();
    }
  },

  getDistanceFromOrigin(): number {
    return hyperbolicDistance(this.currentHyperbolic, createHyperbolicVector([0, 0, 0]));
  }
};

// Register the component with A-Frame
if (typeof window !== 'undefined' && (window as any).AFRAME) {
  (window as any).AFRAME.registerComponent('hyperbolic-transform', HyperbolicTransformComponent);
}

export { HyperbolicTransformComponent };
