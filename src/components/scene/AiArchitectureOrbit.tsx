import { useEffect, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface AiArchitectureOrbitProps {
  className?: string;
  activeNode?: number;
  pointerRef?: MutableRefObject<{ x: number; y: number }>;
  nodeCount?: number;
  accents?: Array<[number, number, number]>;
}

const DEFAULT_ACCENTS: Array<[number, number, number]> = [
  [0.38, 1.0, 0.66],
  [0.78, 0.7, 1.0],
  [0.62, 0.86, 1.0],
  [1.0, 0.78, 0.45],
  [0.86, 0.6, 1.0],
  [0.45, 1.0, 0.82],
];
const DPR_LIMIT = 2;

const buildOrbitNodes = (count: number, accents: Array<[number, number, number]>) => {
  const group = new THREE.Group();
  const radius = 2.6;
  const nodes: Array<{ mesh: THREE.Mesh; basePosition: THREE.Vector3 }> = [];
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2;
    const tilt = Math.sin(index * 1.7) * 0.4;
    const accent = accents[index % accents.length]!;
    const color = new THREE.Color(accent[0], accent[1], accent[2]);
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 32), material);
    const basePosition = new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle * 1.2) * 0.85 + tilt,
      Math.sin(angle) * radius * 0.6,
    );
    mesh.position.copy(basePosition);
    nodes.push({ mesh, basePosition });
    group.add(mesh);
  }
  return { group, nodes };
};

const buildConnections = (
  nodes: Array<{ basePosition: THREE.Vector3 }>,
  accents: Array<[number, number, number]>,
) => {
  const lines: THREE.Line[] = [];
  for (let index = 0; index < nodes.length; index += 1) {
    const next = (index + 1) % nodes.length;
    const start = nodes[index]!.basePosition;
    const end = nodes[next]!.basePosition;
    const points: THREE.Vector3[] = [];
    for (let step = 0; step <= 24; step += 1) {
      const t = step / 24;
      const point = new THREE.Vector3().lerpVectors(start, end, t);
      point.y += Math.sin(t * Math.PI) * 0.18;
      points.push(point);
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const accent = accents[index % accents.length]!;
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(accent[0], accent[1], accent[2]),
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });
    lines.push(new THREE.Line(geometry, material));
  }
  return lines;
};

const buildSpokes = (nodes: Array<{ basePosition: THREE.Vector3 }>) => {
  const spokes: THREE.Line[] = [];
  for (let index = 0; index < nodes.length; index += 1) {
    const points = [new THREE.Vector3(0, 0, 0), nodes[index]!.basePosition.clone()];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0xc7b4ff,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
    });
    spokes.push(new THREE.Line(geometry, material));
  }
  return spokes;
};

const buildHaze = () => {
  const count = 540;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();
  for (let index = 0; index < count; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.4 + Math.random() * 2.6;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = (Math.random() - 0.5) * 2.4;
    positions[index * 3 + 2] = Math.sin(angle) * radius * 0.6;
    seeds[index] = Math.random();
    color.setHSL(0.62 + Math.random() * 0.18, 0.6, 0.7);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      attribute float aSeed;
      attribute vec3 aColor;
      uniform float uTime;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vColor = aColor;
        vec3 pos = position;
        pos.y += sin(uTime * 0.4 + aSeed * 12.0) * 0.18;
        pos.x += cos(uTime * 0.3 + aSeed * 9.0) * 0.12;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = (2.0 + aSeed * 4.5) * (10.0 / max(4.0, -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
        vAlpha = 0.16 + aSeed * 0.18;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float glow = smoothstep(0.5, 0.0, length(uv));
        gl_FragColor = vec4(vColor, glow * vAlpha);
      }
    `,
  });
  return new THREE.Points(geometry, material);
};

const AiArchitectureOrbit = ({
  className,
  activeNode = 0,
  pointerRef,
  nodeCount = 6,
  accents = DEFAULT_ACCENTS,
}: AiArchitectureOrbitProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeNodeRef = useRef(activeNode);
  const fallbackPointer = useRef({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    activeNodeRef.current = activeNode;
  }, [activeNode]);

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
    scene.fog = new THREE.FogExp2(0x040712, 0.06);
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 30);
    camera.position.set(0, 0.4, 6.6);

    const root = new THREE.Group();
    scene.add(root);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.7, 3),
      new THREE.MeshBasicMaterial({
        color: 0xc7b4ff,
        wireframe: true,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
      }),
    );
    root.add(core);

    const innerCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.42, 2),
      new THREE.MeshBasicMaterial({
        color: 0x7fffd0,
        wireframe: true,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
      }),
    );
    root.add(innerCore);

    const { group: orbitGroup, nodes } = buildOrbitNodes(nodeCount, accents);
    root.add(orbitGroup);

    const connectionLines = buildConnections(nodes, accents);
    connectionLines.forEach((line) => root.add(line));

    const spokeLines = buildSpokes(nodes);
    spokeLines.forEach((line) => root.add(line));

    const haze = buildHaze();
    root.add(haze);

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

    let smoothActive = activeNode;

    const animate = (now: number) => {
      if (disposed || !renderer) {
        return;
      }
      resize();
      const time = now / 1000;
      const pointer = pointerRef?.current ?? fallbackPointer.current;
      smoothActive += (activeNodeRef.current - smoothActive) * 0.08;

      orbitGroup.rotation.y = time * 0.16 + pointer.x * 0.18;
      orbitGroup.rotation.x = Math.sin(time * 0.2) * 0.06 + pointer.y * -0.08;

      core.rotation.x = time * 0.4;
      core.rotation.y = time * 0.32;
      core.scale.setScalar(1 + Math.sin(time * 0.8) * 0.04);
      innerCore.rotation.x = time * -0.6;
      innerCore.rotation.y = time * -0.5;

      nodes.forEach((node, index) => {
        const distance = Math.abs(index - smoothActive);
        const focus = Math.max(0, 1 - distance);
        const pulse = Math.sin(time * 1.2 + index) * 0.08;
        const material = node.mesh.material as THREE.MeshBasicMaterial;
        material.opacity = 0.4 + focus * 0.6;
        node.mesh.scale.setScalar(0.85 + focus * 0.7 + pulse * 0.1);
      });

      connectionLines.forEach((line, index) => {
        const distance = Math.min(
          Math.abs(index - smoothActive),
          Math.abs(index + 1 - smoothActive),
          Math.abs(index - 1 - smoothActive),
        );
        const focus = Math.max(0, 1 - distance * 0.7);
        const material = line.material as THREE.LineBasicMaterial;
        material.opacity = 0.08 + focus * 0.42;
      });

      spokeLines.forEach((line, index) => {
        const focus = Math.max(0, 1 - Math.abs(index - smoothActive));
        (line.material as THREE.LineBasicMaterial).opacity = 0.04 + focus * 0.36;
      });

      const hazeMaterial = haze.material as THREE.ShaderMaterial;
      hazeMaterial.uniforms.uTime.value = time;

      root.rotation.y = pointer.x * 0.06 + Math.sin(time * 0.1) * 0.04;
      root.rotation.x = pointer.y * -0.05;

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
      core.geometry.dispose();
      (core.material as THREE.Material).dispose();
      innerCore.geometry.dispose();
      (innerCore.material as THREE.Material).dispose();
      nodes.forEach((node) => {
        node.mesh.geometry.dispose();
        (node.mesh.material as THREE.Material).dispose();
      });
      connectionLines.forEach((line) => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
      spokeLines.forEach((line) => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
      haze.geometry.dispose();
      (haze.material as THREE.Material).dispose();
      renderer?.dispose();
    };
    // pointerRef is read via .current each frame; activeNode is mirrored into activeNodeRef
    // Only [active, accents, nodeCount] should trigger renderer rebuild.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, accents, nodeCount]);

  return (
    <div
      className={cn("ai-arch-stage", failed && "ai-arch-stage--failed", className)}
      data-ai-arch-stage
      ref={containerRef}
    >
      <canvas aria-hidden="true" className="ai-arch-stage__canvas" ref={canvasRef} />
      <div className="ai-arch-stage__fallback" aria-hidden="true">
        <div className="ai-arch-stage__fallback-core" />
        <div className="ai-arch-stage__fallback-ring" />
      </div>
    </div>
  );
};

export default AiArchitectureOrbit;
