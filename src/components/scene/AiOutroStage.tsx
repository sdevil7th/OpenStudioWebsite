import { useEffect, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface AiOutroStageProps {
  className?: string;
  collapseRef?: MutableRefObject<number>;
  pointerRef?: MutableRefObject<{ x: number; y: number }>;
}

const ACCENT_PALETTE = ["#7fffd0", "#c7b4ff", "#88bcec", "#ffc971"] as const;
const PARTICLE_COUNT = 1500;
const DPR_LIMIT = 2;

const buildField = () => {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const targets = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const seeds = new Float32Array(PARTICLE_COUNT);
  const color = new THREE.Color();

  for (let index = 0; index < PARTICLE_COUNT; index += 1) {
    const seed = Math.random();
    const angle = seed * Math.PI * 2;
    const radius = 3.5 + Math.random() * 4;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = Math.sin(angle * 1.6) * radius * 0.6;
    positions[index * 3 + 2] = (seed - 0.5) * 5;

    const targetAngle = Math.random() * Math.PI * 2;
    const targetRadius = 0.2 + Math.random() * 0.6;
    targets[index * 3] = Math.cos(targetAngle) * targetRadius;
    targets[index * 3 + 1] = Math.sin(targetAngle * 1.3) * targetRadius * 0.8;
    targets[index * 3 + 2] = (Math.random() - 0.5) * 0.4;

    seeds[index] = seed;
    color.set(ACCENT_PALETTE[index % ACCENT_PALETTE.length]!);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aTarget", new THREE.BufferAttribute(targets, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uCollapse: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
    },
    vertexShader: `
      attribute vec3 aTarget;
      attribute vec3 aColor;
      attribute float aSeed;
      uniform float uTime;
      uniform float uCollapse;
      uniform vec2 uPointer;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vColor = aColor;
        vec3 wandering = position + vec3(
          sin(uTime * 0.6 + aSeed * 14.0) * 0.5,
          cos(uTime * 0.5 + aSeed * 11.0) * 0.4,
          sin(uTime * 0.4 + aSeed * 9.0) * 0.6
        );
        vec3 collapsed = aTarget + vec3(
          sin(uTime * 1.6 + aSeed * 8.0) * 0.05,
          cos(uTime * 1.4 + aSeed * 7.0) * 0.04,
          sin(uTime * 1.2 + aSeed * 6.0) * 0.06
        );
        float t = smoothstep(0.0, 1.0, uCollapse);
        vec3 pos = mix(wandering, collapsed, t);
        pos.x += uPointer.x * (0.18 + aSeed * 0.08) * (1.0 - t * 0.5);
        pos.y += uPointer.y * (0.12 + aSeed * 0.06) * (1.0 - t * 0.5);

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = (3.0 + aSeed * 6.5) * (12.0 / max(4.0, -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
        vAlpha = 0.18 + t * 0.36 + aSeed * 0.18;
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

const AiOutroStage = ({ className, collapseRef, pointerRef }: AiOutroStageProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackCollapse = useRef(0);
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
      (entries) => setActive(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.05 },
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
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 30);
    camera.position.set(0, 0, 8);

    const root = new THREE.Group();
    scene.add(root);

    const field = buildField();
    root.add(field);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.36, 4),
      new THREE.MeshBasicMaterial({
        color: 0x7fffd0,
        wireframe: true,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      }),
    );
    root.add(core);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.62, 0.02, 16, 80),
      new THREE.MeshBasicMaterial({
        color: 0xc7b4ff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      }),
    );
    root.add(ring);

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
      const pointer = pointerRef?.current ?? fallbackPointer.current;
      const collapseValue = Math.max(0, Math.min(1, collapseRef?.current ?? fallbackCollapse.current));

      const fieldMaterial = field.material as THREE.ShaderMaterial;
      fieldMaterial.uniforms.uTime.value = time;
      fieldMaterial.uniforms.uCollapse.value = collapseValue;
      fieldMaterial.uniforms.uPointer.value.set(pointer.x, pointer.y * -1);

      core.rotation.x = time * 0.4;
      core.rotation.y = time * 0.5;
      core.scale.setScalar(0.6 + collapseValue * 1.4);
      (core.material as THREE.MeshBasicMaterial).opacity = collapseValue * 0.4;

      ring.rotation.x = time * 0.3 + Math.PI / 2;
      ring.rotation.z = time * 0.2;
      (ring.material as THREE.MeshBasicMaterial).opacity = collapseValue * 0.55;

      root.rotation.y = pointer.x * 0.18 + Math.sin(time * 0.12) * 0.05;
      root.rotation.x = pointer.y * -0.08;
      camera.position.z = 8 - collapseValue * 0.8;
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
      core.geometry.dispose();
      (core.material as THREE.Material).dispose();
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
      renderer?.dispose();
    };
    // pointerRef and collapse are read via refs each frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div
      className={cn("ai-outro-stage", failed && "ai-outro-stage--failed", className)}
      data-ai-outro-stage
      ref={containerRef}
    >
      <canvas aria-hidden="true" className="ai-outro-stage__canvas" ref={canvasRef} />
      <div className="ai-outro-stage__fallback" aria-hidden="true">
        <div className="ai-outro-stage__fallback-core" />
      </div>
    </div>
  );
};

export default AiOutroStage;
