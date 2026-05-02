import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { cn } from "@/lib/utils";

const STEM_COLORS = ["#ff5c5c", "#f5d444", "#56db6d", "#3ad7ff", "#6f7aff", "#f686ff"] as const;
const TOKEN_COLORS = ["#c7b4ff", "#7fffd0", "#88bcec", "#ffc971"] as const;

interface AiSignalWebGLStageProps {
  className?: string;
  progressRef?: MutableRefObject<number>;
  sectionPhaseRef?: MutableRefObject<number>;
}

const makeLine = (points: THREE.Vector3[], color: string, opacity = 0.8) => {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Line(geometry, material);
};

const makeParticleSystem = (count: number, palette: readonly string[], spread = 1) => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const color = new THREE.Color();

  for (let index = 0; index < count; index += 1) {
    const seed = Math.sin(index * 47.17) * 43758.5453;
    const random = seed - Math.floor(seed);
    const theta = random * Math.PI * 2;
    const radius = (0.16 + (index % 17) / 17) * spread;
    positions[index * 3] = Math.cos(theta) * radius;
    positions[index * 3 + 1] = Math.sin(theta * 1.7) * radius * 0.55;
    positions[index * 3 + 2] = ((index % 23) / 23 - 0.5) * spread;
    seeds[index] = random;
    color.set(palette[index % palette.length]!);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uEnergy: { value: 1 },
      uProgress: { value: 0 },
    },
    vertexShader: `
      attribute float aSeed;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uEnergy;
      uniform float uProgress;

      void main() {
        vColor = color;
        vec3 pos = position;
        float wave = sin(uTime * (0.8 + aSeed * 1.8) + aSeed * 18.0);
        pos.x += wave * 0.12 * uEnergy;
        pos.y += cos(uTime * 1.25 + aSeed * 12.0) * 0.08 * uEnergy;
        pos.z += sin(uProgress * 6.283 + aSeed * 9.0) * 0.34 * uEnergy;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = (4.0 + aSeed * 10.0) * (1.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;

      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float glow = smoothstep(0.5, 0.0, length(uv));
        gl_FragColor = vec4(vColor, glow * 0.75);
      }
    `,
  });

  return new THREE.Points(geometry, material);
};

const AiSignalWebGLStage = ({ className, progressRef, sectionPhaseRef }: AiSignalWebGLStageProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackProgress = useRef(0);
  const fallbackPhase = useRef(0);
  const reduceMotion = useReducedMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!canvas || reduceMotion || !desktop) {
      return;
    }

    let renderer: THREE.WebGLRenderer | undefined;
    let frameId = 0;
    let disposed = false;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas,
        powerPreference: "high-performance",
      });
    } catch {
      setFailed(true);
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x05070d, 5, 14);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30);
    camera.position.set(0, 0, 8.2);

    const root = new THREE.Group();
    scene.add(root);

    const coreGeometry = new THREE.IcosahedronGeometry(0.56, 3);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xc7b4ff,
      transparent: true,
      opacity: 0.2,
      wireframe: true,
      blending: THREE.AdditiveBlending,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    root.add(core);

    const orbitGroup = new THREE.Group();
    root.add(orbitGroup);
    for (let index = 0; index < 5; index += 1) {
      const angle = (index / 5) * Math.PI * 2;
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 16, 16),
        new THREE.MeshBasicMaterial({
          color: TOKEN_COLORS[index % TOKEN_COLORS.length],
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
        }),
      );
      node.position.set(Math.cos(angle) * 1.02, Math.sin(angle) * 0.7, Math.sin(angle * 1.3) * 0.28);
      orbitGroup.add(node);
    }

    const leftParticles = makeParticleSystem(520, STEM_COLORS, 3.2);
    leftParticles.position.set(-2.75, -0.18, 0);
    root.add(leftParticles);

    const rightParticles = makeParticleSystem(460, TOKEN_COLORS, 2.8);
    rightParticles.position.set(2.72, 0.1, 0);
    root.add(rightParticles);

    const lineGroups: THREE.Line[] = [];
    const makeWavePoints = (xStart: number, xEnd: number, yBase: number, amp: number, phase: number) => {
      const points: THREE.Vector3[] = [];
      for (let index = 0; index < 96; index += 1) {
        const t = index / 95;
        const x = xStart + (xEnd - xStart) * t;
        const y = yBase + Math.sin(t * Math.PI * 8 + phase) * amp * (0.35 + Math.sin(t * Math.PI) * 0.65);
        points.push(new THREE.Vector3(x, y, Math.sin(t * Math.PI + phase) * 0.18));
      }
      return points;
    };

    lineGroups.push(makeLine(makeWavePoints(-5.2, -0.75, 0, 0.38, 0), "#f6fbff", 0.42));
    STEM_COLORS.forEach((color, index) => {
      const y = -1.65 + index * 0.56;
      lineGroups.push(makeLine(makeWavePoints(-4.8, -0.32, y, 0.1 + index * 0.018, index), color, 0.74));
    });
    TOKEN_COLORS.forEach((color, index) => {
      const y = -0.86 + index * 0.58;
      lineGroups.push(makeLine(makeWavePoints(0.42, 4.9, y, 0.18, index * 1.6), color, 0.64));
    });

    lineGroups.forEach((line) => root.add(line));

    const resize = () => {
      if (!renderer || !canvas.parentElement) {
        return;
      }
      const bounds = canvas.parentElement.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const animate = (now: number) => {
      if (disposed || !renderer) {
        return;
      }
      const time = now / 1000;
      const sceneProgress = progressRef?.current ?? fallbackProgress.current;
      const scenePhase = sectionPhaseRef?.current ?? fallbackPhase.current;
      const separation = Math.sin(sceneProgress * Math.PI);
      root.rotation.y = Math.sin(time * 0.18) * 0.12 + (sceneProgress - 0.5) * 0.18;
      root.rotation.x = Math.cos(time * 0.16) * 0.04 + scenePhase * 0.08;
      core.rotation.x = time * 0.35 + sceneProgress * Math.PI * 1.2;
      core.rotation.y = time * 0.52 + sceneProgress * Math.PI * 1.6;
      core.scale.setScalar(1 + separation * 0.18);
      orbitGroup.rotation.z = time * 0.42 + sceneProgress * Math.PI * 2;
      orbitGroup.rotation.x = Math.sin(time * 0.3) * 0.28 + scenePhase * 0.3;
      leftParticles.position.x = -2.75 - separation * 0.42;
      rightParticles.position.x = 2.72 + separation * 0.42;

      const leftMaterial = leftParticles.material as THREE.ShaderMaterial;
      leftMaterial.uniforms.uTime.value = time;
      leftMaterial.uniforms.uEnergy.value = 1.15 + Math.sin(time * 0.8) * 0.2 + separation * 0.48;
      leftMaterial.uniforms.uProgress.value = sceneProgress;
      const rightMaterial = rightParticles.material as THREE.ShaderMaterial;
      rightMaterial.uniforms.uTime.value = time + 4;
      rightMaterial.uniforms.uEnergy.value = 1.05 + Math.cos(time * 0.7) * 0.2 + scenePhase * 0.44;
      rightMaterial.uniforms.uProgress.value = 1 - sceneProgress;

      lineGroups.forEach((line, index) => {
        line.position.y =
          Math.sin(time * (0.45 + index * 0.015) + index) * 0.035 +
          Math.sin(sceneProgress * Math.PI + index) * 0.05;
        line.position.z = Math.cos(time * 0.3 + index) * 0.06 + separation * 0.16;
        line.scale.x = 1 + sceneProgress * 0.05;
      });

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    frameId = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      lineGroups.forEach((line) => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
      leftParticles.geometry.dispose();
      (leftParticles.material as THREE.Material).dispose();
      rightParticles.geometry.dispose();
      (rightParticles.material as THREE.Material).dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      orbitGroup.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        mesh.geometry?.dispose();
        (mesh.material as THREE.Material | undefined)?.dispose?.();
      });
      renderer?.dispose();
    };
    // progressRef and sectionPhaseRef are read via .current each frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  return (
    <div className={cn("ai-signal-webgl-stage", failed && "ai-signal-webgl-stage--failed", className)} data-ai-webgl-stage>
      <canvas aria-hidden="true" className="ai-signal-webgl-stage__canvas" ref={canvasRef} />
      <div className="ai-signal-webgl-stage__fallback" aria-hidden="true">
        <div className="ai-signal-webgl-stage__fallback-wave ai-signal-webgl-stage__fallback-wave--stem" />
        <div className="ai-signal-webgl-stage__fallback-core" />
        <div className="ai-signal-webgl-stage__fallback-wave ai-signal-webgl-stage__fallback-wave--music" />
      </div>
    </div>
  );
};

export default AiSignalWebGLStage;
