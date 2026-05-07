import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { FeatureChapter, FeatureSceneFragment } from "@/data/marketing";
import type { ScreenshotAsset } from "@/data/screenshots";
import {
  clamp,
  easeInOutCubic,
  easeOutCubic,
  phaseProgress,
  type FeatureSceneCompositorState,
} from "@/components/scene/FeatureSceneCompositor";
import { cn } from "@/lib/utils";

interface FeatureSceneWebGLStageProps {
  chapters: FeatureChapter[];
  stateRef: React.MutableRefObject<FeatureSceneCompositorState>;
  fallback: React.ReactNode;
  className?: string;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PlaneRecord {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  rect: Rect;
  seed: number;
  depth: number;
  role: "base" | "fragment";
}

interface ParticleRecord {
  points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  basePositions: Float32Array;
  scatter: Float32Array;
  seeds: Float32Array;
  count: number;
}

interface ChapterRecord {
  group: THREE.Group;
  planes: PlaneRecord[];
  particles: ParticleRecord;
  accent: THREE.Color;
}

const WORLD_WIDTH = 12;
const WORLD_HEIGHT = 8;
const DPR_LIMIT = 2;
const PARTICLES_PER_PLANE = 280;

const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uDistort;
  uniform float uSeed;

  float wave(vec2 p) {
    return sin((p.x + uSeed) * 19.0 + uTime * 1.6) * cos((p.y - uSeed) * 17.0 + uTime * 1.15);
  }

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float edge = max(abs(uv.x - 0.5), abs(uv.y - 0.5)) * 2.0;
    transformed.z += wave(uv) * uDistort * (0.06 + edge * 0.16);
    transformed.x += sin((uv.y + uSeed) * 12.0 + uTime) * uDistort * 0.08 * edge;
    transformed.y += cos((uv.x - uSeed) * 10.0 + uTime * 0.8) * uDistort * 0.05 * edge;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uOpacity;
  uniform float uDissolve;
  uniform float uBrightness;
  uniform float uTime;
  uniform float uSeed;
  uniform vec3 uAccent;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32 + uSeed);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec4 tex = texture2D(uTexture, vUv);
    float grain = noise(vUv * 38.0 + vec2(uSeed * 4.0, uTime * 0.06));
    float edge = smoothstep(0.62, 1.0, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)) * 2.0);
    float tear = smoothstep(1.0 - uDissolve * 1.12, 1.0, grain + edge * 0.28);
    float scan = 0.94 + sin(vUv.y * 960.0) * 0.035;
    vec3 color = tex.rgb * uBrightness * scan;
    color += uAccent * (0.05 + tear * 0.2) * uDissolve;
    float alpha = tex.a * uOpacity * (1.0 - tear * uDissolve);
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

const particleVertexShader = `
  attribute vec3 aScatter;
  attribute float aSeed;
  attribute float aSize;
  uniform float uProgress;
  uniform float uReassemble;
  uniform float uTime;
  uniform float uDirection;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    float burst = smoothstep(0.0, 1.0, uProgress);
    float rebuild = smoothstep(0.0, 1.0, uReassemble);
    vec3 target = position + aScatter * burst * (1.0 - rebuild);
    target.x += sin(uTime * 1.7 + aSeed * 7.0) * 0.08 * burst;
    target.y += cos(uTime * 1.3 + aSeed * 9.0) * 0.06 * burst;
    target.z += sin(aSeed * 13.0 + uTime) * 0.3 * burst;
    target.x += uDirection * burst * (1.0 - rebuild) * 0.55;
    vec4 mvPosition = modelViewMatrix * vec4(target, 1.0);
    gl_PointSize = aSize * (18.0 / max(5.0, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
    vAlpha = burst * (1.0 - rebuild) * (0.05 + aSeed * 0.18);
    vSeed = aSeed;
  }
`;

const particleFragmentShader = `
  uniform vec3 uAccent;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec2 p = gl_PointCoord - vec2(0.5);
    float angle = vSeed * 6.2831853;
    mat2 rotate = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    p = rotate * p;
    vec2 shardP = vec2(p.x * 0.62, p.y * 1.95);
    float shard = smoothstep(0.42, 0.03, abs(shardP.x) + abs(shardP.y));
    float ember = smoothstep(0.38, 0.0, length(p)) * 0.18;
    float alpha = (shard + ember) * vAlpha;
    vec3 hotEdge = mix(uAccent, vec3(1.0, 0.86, 0.62), 0.28 + vSeed * 0.22);
    gl_FragColor = vec4(hotEdge, alpha);
  }
`;

const phase = (value: number, start: number, end: number) => phaseProgress(value, start, end);
const smooth = (value: number) => value * value * (3 - 2 * value);

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
};

const accentColor = (chapter: FeatureChapter) => {
  switch (chapter.accent) {
    case "amber":
      return new THREE.Color(1, 0.74, 0.35);
    case "emerald":
      return new THREE.Color(0.38, 1, 0.66);
    case "frost":
      return new THREE.Color(0.72, 0.9, 1);
    default:
      return new THREE.Color(0.78, 0.68, 1);
  }
};

const baseRect = (): Rect => ({
  x: 0.035,
  y: 0,
  width: 0.66,
  height: 0.56,
});

const fragmentRect = (layout: FeatureSceneFragment["layout"]): Rect => {
  const base = baseRect();
  switch (layout) {
    case "top-strip":
      return { x: base.x + base.width * 0.02, y: base.y + base.height * 0.03, width: base.width * 0.5, height: 0.09 };
    case "top-crest":
      return { x: base.x + base.width * 0.02, y: base.y + base.height * 0.02, width: base.width * 0.26, height: 0.14 };
    case "bottom-strip":
      return { x: base.x + base.width * 0.06, y: base.y + base.height - 0.11, width: base.width * 0.74, height: 0.1 };
    case "inset-left":
      return { x: base.x + base.width * 0.08, y: base.y + base.height * 0.68, width: 0.2, height: 0.22 };
    default:
      return { x: base.x + base.width * 0.76, y: base.y + base.height * 0.1, width: 0.22, height: 0.25 };
  }
};

const rectToWorld = (rect: Rect) => ({
  x: (rect.x + rect.width / 2 - 0.5) * WORLD_WIDTH,
  y: (0.5 - rect.y - rect.height / 2) * WORLD_HEIGHT,
  width: rect.width * WORLD_WIDTH,
  height: rect.height * WORLD_HEIGHT,
});

const materialForTexture = (texture: THREE.Texture, accent: THREE.Color, seed: number) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthTest: true,
    depthWrite: false,
    uniforms: {
      uTexture: { value: texture },
      uOpacity: { value: 1 },
      uDissolve: { value: 0 },
      uBrightness: { value: 1 },
      uDistort: { value: 0 },
      uTime: { value: 0 },
      uSeed: { value: seed },
      uAccent: { value: accent },
    },
    vertexShader,
    fragmentShader,
  });

const makePlane = (
  asset: ScreenshotAsset,
  texture: THREE.Texture,
  rect: Rect,
  accent: THREE.Color,
  seed: number,
  role: PlaneRecord["role"],
  depth: number,
) => {
  const world = rectToWorld(rect);
  const geometry = new THREE.PlaneGeometry(world.width, world.height, 36, 28);
  const material = materialForTexture(texture, accent, seed);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(world.x, world.y, depth);
  mesh.userData.assetLabel = asset.label;
  return { mesh, rect, seed, depth, role };
};

const buildParticles = (planes: PlaneRecord[], accent: THREE.Color, chapterSeed: number): ParticleRecord => {
  const count = Math.max(1, planes.length * PARTICLES_PER_PLANE);
  const positions = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);

  planes.forEach((plane, planeIndex) => {
    const world = rectToWorld(plane.rect);
    for (let index = 0; index < PARTICLES_PER_PLANE; index += 1) {
      const particleIndex = planeIndex * PARTICLES_PER_PLANE + index;
      const seed = hashString(`${chapterSeed}-${planeIndex}-${index}`);
      const angle = seed * Math.PI * 2 + plane.seed;
      const radius = 0.8 + (index % 13) * 0.075;
      const localX = (hashString(`x-${chapterSeed}-${planeIndex}-${index}`) - 0.5) * world.width;
      const localY = (hashString(`y-${chapterSeed}-${planeIndex}-${index}`) - 0.5) * world.height;

      positions[particleIndex * 3] = world.x + localX;
      positions[particleIndex * 3 + 1] = world.y + localY;
      positions[particleIndex * 3 + 2] = plane.depth + 0.03;
      scatter[particleIndex * 3] = Math.cos(angle) * radius * (plane.role === "base" ? 1.4 : 2.3);
      scatter[particleIndex * 3 + 1] = Math.sin(angle) * radius * (plane.role === "base" ? 0.8 : 1.6);
      scatter[particleIndex * 3 + 2] = 0.8 + seed * 3.2;
      seeds[particleIndex] = seed;
      sizes[particleIndex] = 3.5 + seed * 8.5;
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uProgress: { value: 0 },
      uReassemble: { value: 0 },
      uTime: { value: 0 },
      uDirection: { value: 1 },
      uAccent: { value: accent },
    },
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
  });

  const points = new THREE.Points(geometry, material);
  points.renderOrder = 20;
  return { points, basePositions: positions, scatter, seeds, count };
};

const makeFallbackTexture = (asset: ScreenshotAsset) => {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#151925");
    gradient.addColorStop(0.55, "#080b12");
    gradient.addColorStop(1, "#11151e");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(255,255,255,0.16)";
    context.font = "600 42px sans-serif";
    context.fillText(asset.label ?? "OpenStudio", 64, 120);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
};

const loadTexture = (loader: THREE.TextureLoader, asset: ScreenshotAsset) =>
  new Promise<THREE.Texture>((resolve) => {
    loader.load(
      asset.src,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = 8;
        resolve(texture);
      },
      undefined,
      () => resolve(makeFallbackTexture(asset)),
    );
  });

const FeatureSceneWebGLStage = ({ chapters, stateRef, fallback, className }: FeatureSceneWebGLStageProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktopStage = window.matchMedia("(min-width: 1280px)").matches;
    if (!canvas || reduceMotion || !desktopStage) {
      setFailed(true);
      setReady(false);
      return;
    }

    let disposed = false;
    let rafId = 0;
    let renderer: THREE.WebGLRenderer | undefined;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.05);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
    camera.position.set(0, 0, 17);
    const records: Array<ChapterRecord | undefined> = Array(chapters.length);
    const loadingChapters = new Set<number>();
    const loadTimers: number[] = [];
    const loader = new THREE.TextureLoader();
    const renderStartTime = performance.now();

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas,
        powerPreference: "high-performance",
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
    } catch {
      setFailed(true);
      setReady(false);
      return;
    }

    const resize = () => {
      if (!renderer || !canvas.parentElement) {
        return;
      }
      const bounds = canvas.parentElement.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const makeChapter = async (chapter: FeatureChapter, chapterIndex: number): Promise<ChapterRecord> => {
      const accent = accentColor(chapter);
      const baseTexture = await loadTexture(loader, chapter.sceneBase.asset);
      const fragmentTextures = await Promise.all(
        chapter.sceneFragments.map((fragment) => loadTexture(loader, fragment.asset)),
      );
      const group = new THREE.Group();
      const chapterSeed = hashString(chapter.id);
      const planes: PlaneRecord[] = [
        makePlane(chapter.sceneBase.asset, baseTexture, baseRect(), accent, chapterSeed, "base", 0),
      ];

      chapter.sceneFragments.forEach((fragment, fragmentIndex) => {
        planes.push(
          makePlane(
            fragment.asset,
            fragmentTextures[fragmentIndex]!,
            fragmentRect(fragment.layout),
            accent,
            chapterSeed + fragmentIndex * 0.17 + 0.2,
            "fragment",
            0.32 + fragmentIndex * 0.34,
          ),
        );
      });

      planes.forEach((plane) => group.add(plane.mesh));
      const particles = buildParticles(planes, accent, chapterIndex + chapterSeed);
      group.add(particles.points);
      scene.add(group);
      return { group, planes, particles, accent };
    };

    const disposeRecord = (record: ChapterRecord) => {
      record.planes.forEach((plane) => {
        plane.mesh.geometry.dispose();
        plane.mesh.material.uniforms.uTexture.value?.dispose?.();
        plane.mesh.material.dispose();
      });
      record.particles.points.geometry.dispose();
      record.particles.points.material.dispose();
      scene.remove(record.group);
    };

    const loadChapterAt = async (chapterIndex: number) => {
      const normalizedIndex = clamp(chapterIndex, 0, chapters.length - 1);
      const chapter = chapters[normalizedIndex];

      if (!chapter || records[normalizedIndex] || loadingChapters.has(normalizedIndex)) {
        return;
      }

      loadingChapters.add(normalizedIndex);
      try {
        const record = await makeChapter(chapter, normalizedIndex);
        if (disposed) {
          disposeRecord(record);
          return;
        }
        records[normalizedIndex] = record;
      } finally {
        loadingChapters.delete(normalizedIndex);
      }
    };

    const loadRemainingChapters = () => {
      chapters.forEach((_, index) => {
        if (records[index]) {
          return;
        }

        loadTimers.push(
          window.setTimeout(() => {
            void loadChapterAt(index);
          }, 260 + index * 180),
        );
      });
    };

    const applyPlaneState = (
      plane: PlaneRecord,
      record: ChapterRecord,
      visible: number,
      loosen: number,
      destruction: number,
      reassembly: number,
      direction: 1 | -1,
      incoming: boolean,
      time: number,
    ) => {
      const world = rectToWorld(plane.rect);
      const material = plane.mesh.material;
      const burst = smooth(destruction);
      const rebuild = smooth(reassembly);
      const activeBreak = incoming ? 1 - rebuild : burst * (1 - rebuild * 0.7);
      const depth = plane.role === "base" ? 0.42 : 1.25 + plane.depth;
      const polarity = plane.seed > 0.5 ? 1 : -1;

      material.uniforms.uTime.value = time;
      material.uniforms.uOpacity.value = clamp(visible * (incoming ? 0.08 + rebuild * 0.92 : 1 - burst * 0.52), 0, 1);
      material.uniforms.uDissolve.value = clamp(incoming ? (1 - rebuild) * 0.55 : burst * 0.78, 0, 1);
      material.uniforms.uBrightness.value = clamp(incoming ? 0.72 + rebuild * 0.38 : 1 - burst * 0.34, 0.45, 1.18);
      material.uniforms.uDistort.value = loosen * 0.45 + activeBreak * 1.1;

      plane.mesh.position.x = world.x + direction * activeBreak * (plane.role === "base" ? -0.42 : 1.2 + plane.depth * 0.8) + polarity * loosen * 0.18;
      plane.mesh.position.y = world.y + activeBreak * (plane.role === "base" ? -0.12 : polarity * 0.62) + Math.sin(time * 0.36 + plane.seed * 8) * 0.035;
      plane.mesh.position.z = plane.depth + activeBreak * depth + (incoming ? (1 - rebuild) * 1.7 : 0);
      plane.mesh.rotation.x = activeBreak * (plane.role === "base" ? 0.08 : 0.36 * polarity);
      plane.mesh.rotation.y = direction * activeBreak * (plane.role === "base" ? -0.12 : 0.72 + plane.depth * 0.18);
      plane.mesh.rotation.z = polarity * activeBreak * (plane.role === "base" ? 0.035 : 0.2);
      plane.mesh.scale.setScalar((incoming ? 0.92 + rebuild * 0.08 : 1 - burst * 0.045) + loosen * 0.018);
      plane.mesh.visible = visible > 0.005;
      record.group.visible = record.group.visible || plane.mesh.visible;
    };

    const render = () => {
      if (disposed || !renderer) {
        return;
      }

      resize();
      const state = stateRef.current;
      const time = (performance.now() - renderStartTime) / 1000;
      const progress = clamp(state.transitionProgress ?? 0, 0, 1);
      const direction = state.transitionDirection === -1 ? -1 : 1;
      const fromIndex = clamp(state.fromIndex ?? state.activeIndex ?? 0, 0, chapters.length - 1);
      const toIndex = clamp(state.toIndex ?? state.nextIndex ?? fromIndex, 0, chapters.length - 1);
      void loadChapterAt(fromIndex);
      void loadChapterAt(toIndex);
      const hasTransition = state.transitionActive > 0.001 && fromIndex !== toIndex;
      const loosen = hasTransition ? clamp(state.loosenProgress ?? phase(progress, 0.22, 0.36), 0, 1) : 0;
      const destruction = hasTransition ? clamp(state.destructionProgress ?? phase(progress, 0.36, 0.72), 0, 1) : 0;
      const reassembly = hasTransition ? clamp(state.reassemblyProgress ?? phase(progress, 0.72, 0.9), 0, 1) : 1;
      const readable = hasTransition ? clamp(state.readableProgress ?? phase(progress, 0.9, 1), 0, 1) : 1;

      records.forEach((record, index) => {
        if (!record) {
          return;
        }

        record.group.visible = false;
        let visible = index === (state.visualOwnerIndex ?? state.activeIndex) ? 1 : 0;
        let incoming = false;
        let recordLoosen = 0;
        let recordDestruction = 0;
        let recordReassembly = 1;

        if (hasTransition && index === fromIndex) {
          visible = clamp(1 - reassembly * 0.76, 0, 1);
          recordLoosen = loosen;
          recordDestruction = destruction;
          recordReassembly = 0;
        } else if (hasTransition && index === toIndex) {
          visible = clamp(0.08 + reassembly * 0.92, 0, 1);
          incoming = true;
          recordLoosen = loosen * (1 - reassembly);
          recordDestruction = 1 - reassembly;
          recordReassembly = reassembly;
        }

        record.planes.forEach((plane) =>
          applyPlaneState(plane, record, visible, recordLoosen, recordDestruction, recordReassembly, direction, incoming, time),
        );

        record.particles.points.visible = hasTransition && (index === fromIndex || index === toIndex);
        record.particles.points.material.uniforms.uProgress.value =
          index === fromIndex ? destruction : clamp(1 - reassembly, 0, 1);
        record.particles.points.material.uniforms.uReassemble.value = index === toIndex ? reassembly : readable * 0.35;
        record.particles.points.material.uniforms.uTime.value = time;
        record.particles.points.material.uniforms.uDirection.value = direction;
      });

      const ambientPulse = Math.sin(time * 0.55) * 0.04;
      camera.position.x = (state.pointerX ?? 0) * 0.18;
      camera.position.y = (state.pointerY ?? 0) * 0.12;
      camera.position.z = 15.6 - destruction * 0.72 + reassembly * 0.18 + ambientPulse;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(render);
    };

    const initialIndex = clamp(stateRef.current.activeIndex ?? 0, 0, chapters.length - 1);
    const initialNextIndex = clamp(stateRef.current.nextIndex ?? initialIndex + 1, 0, chapters.length - 1);

    Promise.all([loadChapterAt(initialIndex), loadChapterAt(initialNextIndex)])
      .then(() => {
        if (disposed) {
          return;
        }
        setFailed(false);
        setReady(true);
        resize();
        render();
        loadRemainingChapters();
      })
      .catch(() => {
        if (!disposed) {
          setFailed(true);
          setReady(false);
        }
      });

    window.addEventListener("resize", resize);

    return () => {
      disposed = true;
      loadTimers.forEach((timer) => window.clearTimeout(timer));
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      records.forEach((record) => {
        if (record) {
          disposeRecord(record);
        }
      });
      renderer?.dispose();
    };
  }, [chapters, stateRef]);

  return (
    <>
      <canvas
        aria-hidden="true"
        className={cn("feature-story-webgl-stage", failed && "feature-story-webgl-stage--failed", className)}
        data-feature-story-webgl-ready={ready ? "true" : "false"}
        data-feature-story-webgl
        ref={canvasRef}
      />
      <div className={cn("feature-story-fallback-stage", ready && !failed && "feature-story-fallback-stage--hidden")}>
        {fallback}
      </div>
    </>
  );
};

export default FeatureSceneWebGLStage;
