import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

import { Analyser } from './analyser';
import { fs as backdropFS, vs as backdropVS } from './backdrop-shader';
import { vs as sphereVS } from './sphere-shader';

interface Visual3DCanvasProps {
  inputNode?: AudioNode | null;
  outputNode?: AudioNode | null;
  className?: string;
}

export const Visual3DCanvas: React.FC<Visual3DCanvasProps> = ({
  inputNode,
  outputNode,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number | null>(null);

  // Analysers refs to access inside animation loop without stale closures
  const inputAnalyserRef = useRef<Analyser | null>(null);
  const outputAnalyserRef = useRef<Analyser | null>(null);

  // Update analysers when nodes change
  useEffect(() => {
    if (inputNode) {
      inputAnalyserRef.current = new Analyser(inputNode);
    } else {
      inputAnalyserRef.current = null;
    }
  }, [inputNode]);

  useEffect(() => {
    if (outputNode) {
      outputAnalyserRef.current = new Analyser(outputNode);
    } else {
      outputAnalyserRef.current = null;
    }
  }, [outputNode]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x100c14);

    // --- Backdrop ---
    const backdrop = new THREE.Mesh(
      new THREE.IcosahedronGeometry(10, 5),
      new THREE.RawShaderMaterial({
        uniforms: {
          resolution: { value: new THREE.Vector2(1, 1) },
          rand: { value: 0 },
        },
        vertexShader: backdropVS,
        fragmentShader: backdropFS,
        glslVersion: THREE.GLSL3,
      }),
    );
    backdrop.material.side = THREE.BackSide;
    scene.add(backdrop);

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(2, -2, 5);

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: false,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    rendererRef.current = renderer;

    // --- Sphere ---
    const geometry = new THREE.IcosahedronGeometry(1, 10);
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x000010,
      metalness: 0.5,
      roughness: 0.1,
      emissive: 0x000010,
      emissiveIntensity: 1.5,
    });

    const sphere = new THREE.Mesh(geometry, sphereMaterial);
    sphere.visible = false;
    scene.add(sphere);

    // Load EXR texture
    new EXRLoader().load(
      '/piz_compressed.exr',
      (texture: THREE.Texture) => {
        // onLoad
        texture.mapping = THREE.EquirectangularReflectionMapping;
        const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
        sphereMaterial.envMap = exrCubeRenderTarget.texture;
        sphere.visible = true;
        texture.dispose(); // Cleanup texture data
      },
      (progress) => {
        // onProgress (optional but good practice to keep the argument slot)
        // console.log((progress.loaded / progress.total * 100) + '% loaded');
      },
      (error) => {
        // onError
        console.warn('Failed to load EXR texture:', error);
        // Fallback: make sphere visible without envMap so it's not invisible
        sphere.visible = true;
      },
    );

    sphereMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.time = { value: 0 };
      shader.uniforms.inputData = { value: new THREE.Vector4() };
      shader.uniforms.outputData = { value: new THREE.Vector4() };
      sphereMaterial.userData.shader = shader;
      shader.vertexShader = sphereVS;
    };

    // --- Post Processing ---
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      5,
      0.5,
      0,
    );
    const fxaaPass = new ShaderPass(FXAAShader); // Kept but unused in original code commented out

    const composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    // --- Resize Handler ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const dPR = window.devicePixelRatio;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
      composer.setSize(w, h);

      backdrop.material.uniforms.resolution.value.set(w * dPR, h * dPR);

      // Update bloom pass resolution if needed
      bloomPass.resolution.set(w, h);

      if (fxaaPass.material.uniforms['resolution']) {
        fxaaPass.material.uniforms['resolution'].value.set(
          1 / (w * dPR),
          1 / (h * dPR),
        );
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    // --- Animation Loop ---
    let prevTime = performance.now();
    const rotation = new THREE.Vector3(0, 0, 0);

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      // Update Analysers
      if (inputAnalyserRef.current) inputAnalyserRef.current.update();
      if (outputAnalyserRef.current) outputAnalyserRef.current.update();

      const t = performance.now();
      const dt = (t - prevTime) / (1000 / 60);
      prevTime = t;

      const backdropMat = backdrop.material as THREE.RawShaderMaterial;
      backdropMat.uniforms.rand.value = Math.random() * 10000;

      if (
        sphereMaterial.userData.shader &&
        outputAnalyserRef.current &&
        inputAnalyserRef.current
      ) {
        const outData = outputAnalyserRef.current.data;
        const inData = inputAnalyserRef.current.data;

        sphere.scale.setScalar(1 + (0.2 * outData[1]) / 255);

        const f = 0.001;
        rotation.x += (dt * f * 0.5 * outData[1]) / 255;
        rotation.z += (dt * f * 0.5 * inData[1]) / 255;
        rotation.y += (dt * f * 0.25 * inData[2]) / 255;
        rotation.y += (dt * f * 0.25 * outData[2]) / 255;

        const euler = new THREE.Euler(rotation.x, rotation.y, rotation.z);
        const quaternion = new THREE.Quaternion().setFromEuler(euler);
        const vector = new THREE.Vector3(0, 0, 5);
        vector.applyQuaternion(quaternion);
        camera.position.copy(vector);
        camera.lookAt(sphere.position);

        const shader = sphereMaterial.userData.shader;
        shader.uniforms.time.value += (dt * 0.1 * outData[0]) / 255;

        shader.uniforms.inputData.value.set(
          (1 * inData[0]) / 255,
          (0.1 * inData[1]) / 255,
          (10 * inData[2]) / 255,
          0,
        );
        shader.uniforms.outputData.value.set(
          (2 * outData[0]) / 255,
          (0.1 * outData[1]) / 255,
          (10 * outData[2]) / 255,
          0,
        );
      }

      composer.render();
    };

    animate();

    // --- Cleanup ---
    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);

      // Dispose Three.js resources
      geometry.dispose();
      sphereMaterial.dispose();
      backdrop.geometry.dispose();
      (backdrop.material as THREE.Material).dispose();
      renderer.dispose();
      pmremGenerator.dispose();
      composer.dispose();

      // Note: AudioContext is managed by parent, so we don't close it here
    };
  }, []); // Run once on mount

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};
