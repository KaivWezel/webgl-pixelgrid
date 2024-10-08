import * as THREE from "three";
import { Flowmap } from "./flowmap.js";

import { TextureLoader } from "three/src/loaders/TextureLoader.js";
import vertexShader from "./shaders/image/vert.glsl";
import fragmentShader from "./shaders/image/frag.glsl";

import { Pane } from "tweakpane";

export default class GridHover {
	constructor(options, image) {
		// Reference to dom element
		this.dom = options.dom;
		this.width = this.dom.offsetWidth;
		this.height = this.dom.offsetHeight;
		this.pane = new Pane();
		this.image = image;

		// Adding canvas to dom
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.renderer.setSize(this.width, this.height);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.dom.appendChild(this.renderer.domElement);

		this.pane = new Pane();
		console.log(this.pane);
		/**
		 * Scene
		 */
		this.scene = new THREE.Scene();

		/**
		 * Camera
		 */
		this.camera = new THREE.OrthographicCamera(
			this.width / -2,
			this.width / 2,
			this.height / 2,
			this.height / -2,
			0.1,
			1000
		);
		this.camera.position.z = 3;

		this.params = {
			size: 15,
			dissipation: 0.945,
			displacementStrength: 1.5,
		};

		/**
		 * Parameters
		 */
		this.size = 10;
		this.initExperience();
	}

	onResize() {
		this.width = this.dom.offsetWidth;
		this.height = this.dom.offsetHeight;
		this.renderer.setSize(this.width, this.height);
		this.camera.aspect = this.width / this.height;
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.camera.updateProjectionMatrix();
		this.material.uniforms.uContainerResolution.value.set(this.width, this.height);
	}

	async addObjects() {
		this.texture = await this.loadTexture(this.image);
		this.geometry = new THREE.PlaneGeometry(this.width, this.height);
		this.material = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uTexture: { value: this.texture },
				uDataTexture: { value: null },
				uContainerResolution: { value: new THREE.Vector2(this.width, this.height) },
				uImageResolution: { value: new THREE.Vector2(this.texture.image.width, this.texture.image.height) },
			},
		});

		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.scene.add(this.mesh);
	}

	async loadTexture(image) {
		this.textureLoader = new TextureLoader();
		return new Promise((resolve) => {
			this.textureLoader.load(image, (texture) => {
				resolve(texture);
			});
		});
	}

	addPane() {
		const folder = this.pane.addFolder({ title: "Flowmap" });
		folder.addBinding(this.params, "size", { min: 4, max: 50, step: 1, label: "Size" }).on("change", (e) => {
			if (!e.last) return;
			// this.flowmap.destroy();
			this.initGPGPU();
		});
		folder.addBinding(this.params, "dissipation", { min: 0, max: 1, label: "Dissipation" }).on("change", (e) => {
			if (!e.last) return;
			this.flowmap.updateParams(this.params);
		});
		folder
			.addBinding(this.params, "displacementStrength", { min: 0, max: 10, label: "Displacement Strength" })
			.on("change", (e) => {
				if (!e.last) return;
				this.flowmap.updateParams(this.params);
			});
	}

	initGPGPU() {
		this.flowmap = new Flowmap(this.renderer, this.params.size, this.pane, this.params);
		this.material.uniforms.uDataTexture.value = this.flowmap.texture;
	}

	createRaycaster() {
		this.raycaster = new THREE.Raycaster();
		this.pointer = new THREE.Vector2();
	}

	onMouseMove(e) {
		this.pointer.x = (e.clientX / this.width) * 2 - 1;
		this.pointer.y = -(e.clientY / this.height) * 2 + 1;

		// Get uv coord intesection
		this.raycaster.setFromCamera(this.pointer, this.camera);

		const intersections = this.raycaster.intersectObject(this.mesh);
		const target = intersections[0];

		if (target && target.uv) {
			this.flowmap.updateMouse(target.uv);
		}
	}

	addListeners() {
		window.addEventListener("resize", this.onResize.bind(this));
		window.addEventListener("mousemove", this.onMouseMove.bind(this));
	}

	render() {
		this.renderer.render(this.scene, this.camera);
		window.requestAnimationFrame(this.render.bind(this));
		this.flowmap.render();
	}

	async initExperience() {
		await this.addObjects();
		this.createRaycaster();
		this.addListeners();
		this.initGPGPU();
		this.render();
		this.addPane();
	}
}
