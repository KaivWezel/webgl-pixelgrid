import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/Addons.js";
import fragmentShader from "./shaders/gpgpu/frag.glsl";

export class Flowmap {
	constructor(renderer, size, pane, params) {
		this.size = size;
		this.pane = pane;
		this.params = params;

		this.renderer = renderer;

		this.clock = new THREE.Clock();
		this.createGPGPUTexture();
	}

	get texture() {
		return this.computation.getCurrentRenderTarget(this.gridVariable).texture;
	}

	createGPGPUTexture() {
		this.computation = new GPUComputationRenderer(this.size, this.size, this.renderer);

		this.flowmapTexture = this.computation.createTexture();
		/**
		 * Variables
		 */
		this.gridVariable = this.computation.addVariable("uGrid", fragmentShader, this.flowmapTexture);

		// Add uniforms to variable
		this.gridVariable.material.uniforms.uTime = new THREE.Uniform(0);
		this.gridVariable.material.uniforms.uPointer = new THREE.Uniform(new THREE.Vector2(-1, -1));
		this.gridVariable.material.uniforms.uVelocity = new THREE.Uniform(new THREE.Vector2(0, 0));
		this.gridVariable.material.uniforms.uDissipation = new THREE.Uniform(this.params.dissipation);
		this.gridVariable.material.uniforms.uDisplacementStrength = new THREE.Uniform(this.params.displacementStrength);
		this.gridVariable.material.needsUpdate = true;

		/**
		 * Set gpgpu dependencie to itself so it it does ping-pong rendering
		 */
		this.computation.setVariableDependencies(this.gridVariable, [this.gridVariable]);
		this.computation.init();
	}

	updateParams() {
		this.gridVariable.material.uniforms.uDissipation.value = this.params.dissipation;
		this.gridVariable.material.uniforms.uDisplacementStrength.value = this.params.displacementStrength;
	}

	updateMouse(uv) {
		let velocity = this.gridVariable.material.uniforms.uPointer.value;

		if (velocity.x === -1 && velocity.y === -1) {
			velocity = uv;
		}

		velocity.subVectors(uv, velocity);

		velocity.multiplyScalar(10);
		this.gridVariable.material.uniforms.uVelocity.value = velocity;
		this.gridVariable.material.uniforms.uPointer.value = uv;
	}

	render() {
		this.gridVariable.material.uniforms.uTime.value = this.clock.getElapsedTime();

		this.computation.compute();
	}
}
