import { useEffect, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface AiGenesisStageProps {
  className?: string;
  progressRef?: MutableRefObject<number>;
  pointerRef?: MutableRefObject<{ x: number; y: number }>;
}

const ACCENT_PALETTE = ["#c7b4ff", "#7fffd0", "#88bcec", "#ffc971", "#f6a8e0"] as const;
const PARTICLE_COUNT = 1800;
const DPR_LIMIT = 2;

const hash = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

const buildField = () => {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const targets = new Float32Array(PARTICLE_COUNT * 3);
  const scatter = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const seeds = new Float32Array(PARTICLE_COUNT);
  const lanes = new Float32Array(PARTICLE_COUNT);
  const color = new THREE.Color();

  for (let index = 0; index < PARTICLE_COUNT; index += 1) {
    const seed = hash(index + 1);
    const lane = index % 6;
    const angle = seed * Math.PI * 2;
    const radius = 4.5 + hash(index + 23) * 5.5;

    scatter[index * 3] = Math.cos(angle) * radius;
    scatter[index * 3 + 1] = Math.sin(angle * 1.3) * radius * 0.6;
    scatter[index * 3 + 2] = (seed - 0.5) * 6;

    const t = (index / PARTICLE_COUNT) * Math.PI * 4;
    targets[index * 3] = -3.6 + (index / PARTICLE_COUNT) * 7.2;
    targets[index * 3 + 1] = Math.sin(t) * 0.35 + (lane - 2.5) * 0.05;
    targets[index * 3 + 2] = Math.cos(t * 0.8) * 0.18;

    positions[index * 3] = scatter[index * 3]!;
    positions[index * 3 + 1] = scatter[index * 3 + 1]!;
    positions[index * 3 + 2] = scatter[index * 3 + 2]!;

    seeds[index] = seed;
    lanes[index] = lane;
    color.set(ACCENT_PALETTE[index % ACCENT_PALETTE.length]!);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aTarget", new THREE.BufferAttribute(targets, 3));
  geometry.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aLane", new THREE.BufferAttribute(lanes, 1));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uConverge: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uEnergy: { value: 1 },
    },
    vertexShader: `
      attribute vec3 aTarget;
      attribute vec3 aScatter;
      attribute vec3 aColor;
      attribute float aSeed;
      attribute float aLane;
      uniform float uTime;
      uniform float uConverge;
      uniform float uEnergy;
      uniform vec2 uPointer;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = aColor;
        float pulse = sin(uTime * (0.6 + aSeed * 1.4) + aSeed * 17.0) * 0.5 + 0.5;
        vec3 wandering = aScatter + vec3(
          sin(uTime * 0.6 + aSeed * 11.0) * 0.4,
          cos(uTime * 0.7 + aSeed * 9.0) * 0.32,
          sin(uTime * 0.4 + aSeed * 13.0) * 0.5
        );
        vec3 flowing = aTarget + vec3(
          sin(uTime * 1.4 + aSeed * 6.0) * 0.05,
          cos(uTime * 1.2 + aSeed * 8.0) * 0.04 * (1.0 - uConverge * 0.6),
          sin(uTime * 1.0 + aSeed * 14.0) * 0.06
        );
        vec3 pos = mix(wandering, flowing, smoothstep(0.0, 1.0, uConverge));
        pos.x += uPointer.x * (0.18 + aSeed * 0.12) * (1.0 - uConverge * 0.4);
        pos.y += uPointer.y * (0.14 + aSeed * 0.08) * (1.0 - uConverge * 0.4);

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = (3.4 + aSeed * 7.2 + uEnergy * 1.6) * (12.0 / max(4.0, -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
        vAlpha = mix(0.18, 0.42, uConverge) + pulse * 0.18;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float glow = smoothstep(0.5, 0.0, length(uv));
        float core = smoothstep(0.18, 0.0, length(uv));
        gl_FragColor = vec4(vColor + core * 0.4, glow * vAlpha);
      }
    `,
  });

  return new THREE.Points(geometry, material);
};

const buildWaveformLine = (yOffset: number, color: string, opacity: number) => {
  const points: THREE.Vector3[] = [];
  for (let index = 0; index < 220; index += 1) {
    const t = index / 219;
    const x = -4 + t * 8;
    const y = yOffset + Math.sin(t * Math.PI * 12) * 0.04;
    points.push(new THREE.Vector3(x, y, Math.sin(t * Math.PI * 4) * 0.06));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Line(geometry, material);
};

const AiGenesisStage = ({ className, progressRef, pointerRef }: AiGenesisStageProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackProgress = useRef(0);
  const fallbackPointer = useRef({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        setActive(visible);
      },
      { threshold: 0.01 },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) {
      return;
    }
    const canvas = canvasRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!canvas || reducedMotion || !desktop) {
      setFailed(true);
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

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040712, 0.05);
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 60);
    camera.position.set(0, 0, 9.6);

    const root = new THREE.Group();
    scene.add(root);

    const field = buildField();
    root.add(field);

    const waveLines: THREE.Line[] = [];
    waveLines.push(buildWaveformLine(0, "#f6fbff", 0.42));
    waveLines.push(buildWaveformLine(0.42, "#c7b4ff", 0.22));
    waveLines.push(buildWaveformLine(-0.42, "#7fffd0", 0.22));
    waveLines.forEach((line) => root.add(line));

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.42, 3),
      new THREE.MeshBasicMaterial({
        color: 0xc7b4ff,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
      }),
    );
    root.add(core);

    const resize = () => {
      if (!renderer || !canvas.parentElement) {
        return;
      }
      const bounds = canvas.parentElement.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_LIMIT));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const animate = (now: number) => {
      if (disposed || !renderer) {
        return;
      }
      resize();
      const time = now / 1000;
      const converge = Math.max(0, Math.min(1, progressRef?.current ?? fallbackProgress.current));
      const pointer = pointerRef?.current ?? fallbackPointer.current;
      const pointerX = pointer.x;
      const pointerY = pointer.y;

      const fieldMaterial = field.material as THREE.ShaderMaterial;
      fieldMaterial.uniforms.uTime.value = time;
      fieldMaterial.uniforms.uConverge.value = converge;
      fieldMaterial.uniforms.uEnergy.value = 1 + Math.sin(time * 0.4) * 0.18;
      fieldMaterial.uniforms.uPointer.value.set(pointerX, pointerY * -1);

      waveLines.forEach((line, index) => {
        const material = line.material as THREE.LineBasicMaterial;
        const baseOpacity = index === 0 ? 0.46 : 0.24;
        material.opacity = baseOpacity * converge;
        line.scale.x = 0.6 + converge * 0.4;
        line.position.y = (index - 1) * 0.4 * converge + Math.sin(time * 0.6 + index) * 0.04;
        line.position.x = pointerX * 0.06;
      });

      core.rotation.x = time * 0.32;
      core.rotation.y = time * 0.42;
      core.scale.setScalar(0.6 + converge * 0.7);
      (core.material as THREE.MeshBasicMaterial).opacity = 0.06 + converge * 0.22;

      root.rotation.y = pointerX * 0.12 + Math.sin(time * 0.12) * 0.06;
      root.rotation.x = pointerY * -0.08 + Math.cos(time * 0.1) * 0.03;
      camera.position.x = pointerX * 0.3;
      camera.position.y = pointerY * -0.18;
      camera.position.z = 9.6 - converge * 0.6;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    setFailed(false);
    resize();
    window.addEventListener("resize", resize);
    frameId = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      field.geometry.dispose();
      (field.material as THREE.Material).dispose();
      waveLines.forEach((line) => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
      core.geometry.dispose();
      (core.material as THREE.Material).dispose();
      renderer?.dispose();
    };
    // pointerRef is read via .current each frame; progress is mirrored into progressRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div
      className={cn("ai-genesis-stage", failed && "ai-genesis-stage--failed", className)}
      data-ai-genesis-stage
      ref={containerRef}
    >
      <canvas aria-hidden="true" className="ai-genesis-stage__canvas" ref={canvasRef} />
      <div className="ai-genesis-stage__fallback" aria-hidden="true">
        <div className="ai-genesis-stage__fallback-wave" />
        <div className="ai-genesis-stage__fallback-wave ai-genesis-stage__fallback-wave--alt" />
        <div className="ai-genesis-stage__fallback-core" />
      </div>
    </div>
  );
};

export default AiGenesisStage;
