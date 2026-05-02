import { useEffect, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface AiUseCaseConstellationProps {
  className?: string;
  activeIndex?: number;
  pointerRef?: MutableRefObject<{ x: number; y: number }>;
  anchorCount?: number;
}

const ANCHOR_COLORS: Array<[number, number, number]> = [
  [0.78, 0.7, 1.0],
  [0.5, 1.0, 0.78],
  [1.0, 0.78, 0.45],
  [0.62, 0.86, 1.0],
];
const STAR_COUNT = 800;
const DPR_LIMIT = 2;

const buildStars = () => {
  const positions = new Float32Array(STAR_COUNT * 3);
  const seeds = new Float32Array(STAR_COUNT);
  const colors = new Float32Array(STAR_COUNT * 3);
  const color = new THREE.Color();
  for (let index = 0; index < STAR_COUNT; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.5 + Math.random() * 4.5;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = (Math.random() - 0.5) * 3.6;
    positions[index * 3 + 2] = Math.sin(angle) * radius * 0.4 - Math.random() * 1.2;
    seeds[index] = Math.random();
    color.setHSL(0.6 + Math.random() * 0.2, 0.6, 0.7 + Math.random() * 0.2);
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
        pos.y += sin(uTime * 0.3 + aSeed * 14.0) * 0.12;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        float twinkle = sin(uTime * (0.6 + aSeed * 1.4) + aSeed * 18.0) * 0.5 + 0.5;
        gl_PointSize = (1.6 + aSeed * 3.4 + twinkle * 1.2) * (10.0 / max(4.0, -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
        vAlpha = 0.18 + aSeed * 0.32 + twinkle * 0.18;
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

const buildAnchors = (count: number) => {
  const anchors: Array<{ mesh: THREE.Mesh; basePosition: THREE.Vector3; color: THREE.Color }> = [];
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2 + Math.PI / 4;
    const radius = 2.4;
    const accent = ANCHOR_COLORS[index % ANCHOR_COLORS.length]!;
    const color = new THREE.Color(accent[0], accent[1], accent[2]);
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 24, 24),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      }),
    );
    const basePosition = new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle * 0.8) * 1.0,
      Math.sin(angle) * radius * 0.55,
    );
    mesh.position.copy(basePosition);
    anchors.push({ mesh, basePosition, color });
  }
  return anchors;
};

const buildAnchorRings = (anchors: Array<{ basePosition: THREE.Vector3; color: THREE.Color }>) => {
  return anchors.map((anchor) => {
    const points: THREE.Vector3[] = [];
    for (let step = 0; step <= 64; step += 1) {
      const t = (step / 64) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          anchor.basePosition.x + Math.cos(t) * 0.42,
          anchor.basePosition.y + Math.sin(t) * 0.42,
          anchor.basePosition.z,
        ),
      );
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: anchor.color,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });
    return new THREE.Line(geometry, material);
  });
};

const buildLinks = (anchors: Array<{ basePosition: THREE.Vector3 }>) => {
  const lines: THREE.Line[] = [];
  for (let i = 0; i < anchors.length; i += 1) {
    for (let j = i + 1; j < anchors.length; j += 1) {
      const start = anchors[i]!.basePosition;
      const end = anchors[j]!.basePosition;
      const points: THREE.Vector3[] = [];
      for (let step = 0; step <= 16; step += 1) {
        const t = step / 16;
        const p = new THREE.Vector3().lerpVectors(start, end, t);
        p.y += Math.sin(t * Math.PI) * 0.12;
        points.push(p);
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0xc7b4ff,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending,
      });
      lines.push(new THREE.Line(geometry, material));
    }
  }
  return lines;
};

const AiUseCaseConstellation = ({
  className,
  activeIndex = 0,
  pointerRef,
  anchorCount = 4,
}: AiUseCaseConstellationProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeIndexRef = useRef(activeIndex);
  const fallbackPointer = useRef({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

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
      { threshold: 0.02 },
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
    camera.position.set(0, 0, 6.6);

    const root = new THREE.Group();
    scene.add(root);

    const stars = buildStars();
    root.add(stars);

    const anchors = buildAnchors(anchorCount);
    anchors.forEach((anchor) => root.add(anchor.mesh));

    const rings = buildAnchorRings(anchors);
    rings.forEach((ring) => root.add(ring));

    const links = buildLinks(anchors);
    links.forEach((line) => root.add(line));

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

    let smoothActive = activeIndex;

    const animate = (now: number) => {
      if (disposed || !renderer) {
        return;
      }
      resize();
      const time = now / 1000;
      const pointer = pointerRef?.current ?? fallbackPointer.current;
      smoothActive += (activeIndexRef.current - smoothActive) * 0.06;

      const starMaterial = stars.material as THREE.ShaderMaterial;
      starMaterial.uniforms.uTime.value = time;

      anchors.forEach((anchor, index) => {
        const focus = Math.max(0, 1 - Math.abs(index - smoothActive));
        const float = Math.sin(time * 0.6 + index) * 0.06;
        anchor.mesh.position.set(
          anchor.basePosition.x,
          anchor.basePosition.y + float + focus * 0.18,
          anchor.basePosition.z,
        );
        const material = anchor.mesh.material as THREE.MeshBasicMaterial;
        material.opacity = 0.32 + focus * 0.62;
        anchor.mesh.scale.setScalar(0.85 + focus * 0.7);
      });

      rings.forEach((ring, index) => {
        const focus = Math.max(0, 1 - Math.abs(index - smoothActive));
        const material = ring.material as THREE.LineBasicMaterial;
        material.opacity = 0.08 + focus * 0.42;
        ring.rotation.z = time * 0.35 + index;
      });

      links.forEach((line, index) => {
        const material = line.material as THREE.LineBasicMaterial;
        material.opacity = 0.04 + Math.sin(time * 0.5 + index) * 0.02 + 0.04;
      });

      root.rotation.y = pointer.x * 0.16 + Math.sin(time * 0.1) * 0.06;
      root.rotation.x = pointer.y * -0.06 + Math.cos(time * 0.08) * 0.03;

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
      stars.geometry.dispose();
      (stars.material as THREE.Material).dispose();
      anchors.forEach((anchor) => {
        anchor.mesh.geometry.dispose();
        (anchor.mesh.material as THREE.Material).dispose();
      });
      rings.forEach((ring) => {
        ring.geometry.dispose();
        (ring.material as THREE.Material).dispose();
      });
      links.forEach((line) => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
      renderer?.dispose();
    };
    // pointerRef and activeIndex are read via refs each frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, anchorCount]);

  return (
    <div
      className={cn("ai-constellation-stage", failed && "ai-constellation-stage--failed", className)}
      data-ai-constellation-stage
      ref={containerRef}
    >
      <canvas aria-hidden="true" className="ai-constellation-stage__canvas" ref={canvasRef} />
      <div className="ai-constellation-stage__fallback" aria-hidden="true">
        <div className="ai-constellation-stage__fallback-glow" />
      </div>
    </div>
  );
};

export default AiUseCaseConstellation;
