import { useEffect, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import * as THREE from "three";
import type { AiNeuralStudioPhase } from "@/data/stemSeparation";
import { cn } from "@/lib/utils";

export interface AiNeuralStudioState {
  globalProgress: number;
  phaseIndex: number;
  phaseProgress: number;
  pointer: { x: number; y: number };
  audioEnergy: number;
  reducedMotion: boolean;
}

interface AiNeuralStudioStageProps {
  phases: AiNeuralStudioPhase[];
  stateRef: MutableRefObject<AiNeuralStudioState>;
  fallback: ReactNode;
  className?: string;
}

const DPR_LIMIT = 2;
const MEMBRANE_COLUMNS = 176;
const MEMBRANE_ROWS = 18;
const MEMBRANE_WIDTH = 8.8;
const MEMBRANE_DEPTH = 3.35;
const GLINT_COUNT = 180;
const SIGNAL_LINE_COUNT = 28;
const STEM_CURRENT_COUNT = 6;
const STEM_RIBBON_POINTS = 148;
const MIXED_SIGNAL_POINTS = 148;
const PROMPT_FILAMENT_POINTS = 144;
const PROMPT_PARTICLE_COUNT = 72;
const RUNTIME_BOUNDARY_POINTS = 192;
const WAVEFORM_SPINE_POINTS = 176;
const SEED_SHOCKWAVE_POINTS = 168;
const GENERATION_STREAM_COUNT = 96;
const ACE_TRANSFORM_POINTS = 164;
const MEMBRANE_LAYERS = [0, 0.72, -0.72, 1.18, -1.18] as const;
const STEM_CURRENT_COLORS = [0xff4fbf, 0x58caff, 0x9b72ff, 0xffc857, 0xdff8ff, 0x43f2a2] as const;

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const phase = (value: number, start: number, end: number) =>
  end <= start ? (value >= end ? 1 : 0) : clamp((value - start) / (end - start));
const easeInOut = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const setAceTransformAnchor = (target: THREE.Vector3, sessionSync: number) => {
  target.set(1.36 + sessionSync * 0.12, 0.08 + sessionSync * 0.04, 1.1 + sessionSync * 0.04);
  return target;
};

const setAceOrbPosition = (target: THREE.Vector3, time: number, promptEntry: number, transformAnchor: THREE.Vector3) => {
  const impact = easeInOut(phase(promptEntry, 0.04, 0.82));
  target.set(
    -2.9 + impact * (transformAnchor.x + 2.9),
    1.42 + (transformAnchor.y - 1.42) * impact + Math.sin(time * 1.1) * 0.035,
    1.34 + (transformAnchor.z - 1.34) * impact + Math.cos(time * 0.82) * 0.045,
  );
  return target;
};

const audioWaveformAmplitude = (u: number, time: number, laneSeed: number, intensity = 1) => {
  const envelope = Math.pow(Math.sin(u * Math.PI), 0.42);
  const transient =
    Math.abs(Math.sin(u * Math.PI * (13.5 + laneSeed * 1.3) + time * 0.16 + laneSeed)) * 0.58 +
    Math.abs(Math.sin(u * Math.PI * (31.0 + laneSeed * 2.1) - time * 0.11)) * 0.3 +
    Math.abs(Math.sin(u * Math.PI * 57.0 + laneSeed * 4.2)) * 0.12;
  return (0.035 + Math.pow(transient, 1.35) * 0.34) * envelope * intensity;
};

const phaseLockedWaveforms = (u: number, lane: number, time: number, depthOffset = 0) => {
  const sharedPulse = Math.sin(u * Math.PI * 2 + time * 0.07) * 0.012;
  const sharedAmplitude = audioWaveformAmplitude(u, time, 0.6, 0.68);
  return {
    amplitude: sharedAmplitude,
    center: new THREE.Vector3(
      -3.42 + u * 6.84,
      -0.1 + lane * 0.48 + sharedPulse,
      1.18 + lane * 0.02 + depthOffset,
    ),
  };
};

const synchronizedSessionPoint = (u: number, lane: number, time: number, depthOffset = 0) => {
  return phaseLockedWaveforms(u, lane, time, depthOffset).center;
};

const hash = (value: string) => {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0) / 4294967295;
};

const accentColor = (phaseItem: AiNeuralStudioPhase) => {
  switch (phaseItem.accent) {
    case "amber":
      return new THREE.Color(1, 0.72, 0.28);
    case "emerald":
      return new THREE.Color(0.22, 0.95, 0.58);
    case "frost":
      return new THREE.Color(0.78, 0.94, 1);
    default:
      return new THREE.Color(0.68, 0.9, 0.95);
  }
};

const planeVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const liquidBackdropFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uUnfold;
  uniform float uGenerate;
  uniform float uCommit;
  uniform vec3 uAccent;

  float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float caustic(vec2 p) {
    float a = sin(p.x * 18.0 + sin(p.y * 4.0 + uTime * 0.34) * 2.1 + uTime * 0.26);
    float b = sin(p.y * 16.0 - uTime * 0.22 + cos(p.x * 3.0) * 1.7);
    float c = sin((p.x + p.y) * 13.0 + uTime * 0.18);
    return pow(max(0.0, (a + b + c) / 3.0), 3.0);
  }

  void main() {
    vec2 p = vUv - 0.5;
    float vignette = smoothstep(1.12, 0.2, length(p * vec2(1.42, 1.0)));
    float vertical = smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.2, vUv.y);
    float grain = (hash2(vUv * 760.0 + uTime * 0.035) - 0.5) * 0.018;
    float light = caustic(vUv * vec2(1.6, 1.0) + vec2(uTime * 0.018, -uTime * 0.012));
    vec3 blackGlass = vec3(0.006, 0.01, 0.017);
    vec3 deepGreen = vec3(0.008, 0.028, 0.025);
    vec3 warmBlack = vec3(0.035, 0.025, 0.015);
    vec3 base = mix(blackGlass, deepGreen, uUnfold * 0.35);
    base = mix(base, warmBlack, uCommit * 0.28);
    vec3 col = base * (0.55 + vignette * 0.75);
    col += vec3(0.68, 0.9, 0.95) * light * (0.075 + uGenerate * 0.18) * vertical;
    col += vec3(1.0, 0.72, 0.28) * light * (uCommit * 0.07 + uGenerate * 0.025);
    col += uAccent * vignette * (0.04 + uGenerate * 0.035);
    col += grain;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const liquidGlassVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const liquidGlassFragmentShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  uniform float uTime;
  uniform float uEmergence;
  uniform float uUnfold;
  uniform float uGenerate;
  uniform float uCommit;
  uniform float uLayer;
  uniform vec3 uAccent;
  uniform vec3 uCameraPos;

  float caustic(vec2 p) {
    float a = sin(p.x * 28.0 + uTime * 0.55 + sin(p.y * 5.0) * 1.8);
    float b = sin(p.y * 24.0 - uTime * 0.42 + cos(p.x * 3.0) * 2.2);
    float c = sin((p.x - p.y) * 19.0 + uTime * 0.25);
    return pow(max(0.0, (a + b + c) / 3.0), 2.4);
  }

  void main() {
    vec3 n = normalize(vWorldNormal);
    vec3 v = normalize(uCameraPos - vWorldPos);
    float fresnel = pow(1.0 - max(dot(n, v), 0.0), 2.25);
    float edge = smoothstep(0.34, 0.5, abs(vUv.y - 0.5));
    float scan = smoothstep(0.025, 0.0, abs(fract(vUv.x * 18.0 + uTime * 0.08) - 0.5));
    float c = caustic(vUv * vec2(2.6, 1.4) + vec2(uLayer * 0.23, uTime * 0.018));
    vec3 glass = vec3(0.62, 0.92, 0.96);
    vec3 emerald = vec3(0.22, 0.95, 0.58);
    vec3 amber = vec3(1.0, 0.72, 0.28);
    vec3 magenta = vec3(1.0, 0.18, 0.68);
    vec3 col = glass * (0.13 + fresnel * 0.72);
    col += mix(emerald, uAccent, 0.45) * c * (0.22 + uGenerate * 0.4);
    col += amber * scan * (0.055 + uCommit * 0.12);
    col += magenta * edge * uGenerate * 0.05;
    col += vec3(1.0) * edge * fresnel * 0.24;
    float body = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
    float alpha = body * (0.18 + uEmergence * 0.22 + fresnel * 0.32 + c * 0.2 + edge * 0.12);
    alpha *= 0.78 + abs(uLayer) * 0.12;
    alpha += uCommit * 0.055;
    alpha *= max(0.07, 1.0 - uGenerate * 0.34 - uCommit * 0.78);
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.72));
  }
`;

const floorFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uUnfold;
  uniform float uGenerate;
  uniform float uCommit;

  void main() {
    vec2 p = vUv - 0.5;
    float fade = smoothstep(0.62, 0.08, abs(p.y)) * smoothstep(0.68, 0.08, abs(p.x));
    float lineX = smoothstep(0.018, 0.0, abs(fract((vUv.x + uTime * 0.01) * 18.0) - 0.5));
    float lineY = smoothstep(0.014, 0.0, abs(fract(vUv.y * 8.0) - 0.5));
    float pulse = sin((vUv.x - 0.5) * 12.0 - uTime * 0.7) * 0.5 + 0.5;
    vec3 base = vec3(0.008, 0.012, 0.018);
    vec3 cyan = vec3(0.38, 0.86, 0.95);
    vec3 amber = vec3(1.0, 0.72, 0.28);
    vec3 col = base + cyan * (lineX * 0.08 + lineY * 0.04) * fade * (0.3 + uUnfold);
    col += amber * pulse * uCommit * 0.035 * fade;
    float alpha = fade * (0.18 + uGenerate * 0.12 + uCommit * 0.1);
    gl_FragColor = vec4(col, alpha);
  }
`;

const makeBackdrop = () => {
  const material = new THREE.ShaderMaterial({
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uUnfold: { value: 0 },
      uGenerate: { value: 0 },
      uCommit: { value: 0 },
      uAccent: { value: new THREE.Color(0.68, 0.9, 0.95) },
    },
    vertexShader: planeVertexShader,
    fragmentShader: liquidBackdropFragmentShader,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(18, 10), material);
  mesh.position.z = -5.8;
  mesh.renderOrder = 0;
  return mesh;
};

const makeMembraneGeometry = () => {
  const vertexCount = (MEMBRANE_COLUMNS + 1) * (MEMBRANE_ROWS + 1);
  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices: number[] = [];

  for (let y = 0; y <= MEMBRANE_ROWS; y += 1) {
    for (let x = 0; x <= MEMBRANE_COLUMNS; x += 1) {
      const index = y * (MEMBRANE_COLUMNS + 1) + x;
      uvs[index * 2] = x / MEMBRANE_COLUMNS;
      uvs[index * 2 + 1] = y / MEMBRANE_ROWS;
    }
  }

  for (let y = 0; y < MEMBRANE_ROWS; y += 1) {
    for (let x = 0; x < MEMBRANE_COLUMNS; x += 1) {
      const a = y * (MEMBRANE_COLUMNS + 1) + x;
      const b = a + 1;
      const c = a + MEMBRANE_COLUMNS + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
};

const liquidPoint = (
  u: number,
  v: number,
  time: number,
  emergence: number,
  unfold: number,
  generate: number,
  commit: number,
  layer: number,
) => {
  const x = (u - 0.5) * MEMBRANE_WIDTH;
  const side = v - 0.5;
  const width = MEMBRANE_DEPTH * (0.5 + unfold * 0.56 + generate * 0.14);
  const ribbonMask = Math.sin(u * Math.PI);
  const fold = Math.sin(u * Math.PI * (1.4 + unfold * 0.7) + layer * 0.9 + time * 0.22);
  const micro = Math.sin(u * Math.PI * 7.5 - time * 0.58 + layer) * 0.06 * (0.4 + generate);
  const sheetTilt = side * width * (0.26 + unfold * 0.08) * (1 - commit * 0.18);
  const y =
    (fold * 0.62 + micro) * ribbonMask * (0.68 + unfold * 0.56) +
    sheetTilt +
    Math.sin((v + u) * Math.PI * 2.0 + time * 0.18) * 0.06 * unfold;
  const z =
    side * width +
    Math.cos(u * Math.PI * 2.2 + time * 0.24 + layer) * 0.32 * ribbonMask * (0.2 + generate * 0.55) +
    layer * 0.22;
  const resolvedY = y * (1 - commit * 0.38) + Math.sin(u * Math.PI * 3.0) * 0.18 * commit;
  const resolvedZ = z * (1 - commit * 0.18) + side * MEMBRANE_DEPTH * 0.78 * commit;
  const rise = -0.42 + emergence * 0.62 + commit * 0.08;
  return new THREE.Vector3(x, resolvedY + rise, resolvedZ);
};

const updateMembraneGeometry = (
  geometry: THREE.BufferGeometry,
  time: number,
  emergence: number,
  unfold: number,
  generate: number,
  commit: number,
  layer: number,
) => {
  const positions = geometry.getAttribute("position") as THREE.BufferAttribute;
  let offset = 0;
  for (let y = 0; y <= MEMBRANE_ROWS; y += 1) {
    const v = y / MEMBRANE_ROWS;
    for (let x = 0; x <= MEMBRANE_COLUMNS; x += 1) {
      const u = x / MEMBRANE_COLUMNS;
      const p = liquidPoint(u, v, time, emergence, unfold, generate, commit, layer);
      positions.setXYZ(offset, p.x, p.y, p.z);
      offset += 1;
    }
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
};

const makeLiquidMembrane = (layer: number) => {
  const geometry = makeMembraneGeometry();
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uEmergence: { value: 0 },
      uUnfold: { value: 0 },
      uGenerate: { value: 0 },
      uCommit: { value: 0 },
      uLayer: { value: layer },
      uAccent: { value: new THREE.Color(0.68, 0.9, 0.95) },
      uCameraPos: { value: new THREE.Vector3() },
    },
    vertexShader: liquidGlassVertexShader,
    fragmentShader: liquidGlassFragmentShader,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 10 + Math.round(layer * 10);
  return mesh;
};

const makeFloor = () => {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uUnfold: { value: 0 },
      uGenerate: { value: 0 },
      uCommit: { value: 0 },
    },
    vertexShader: planeVertexShader,
    fragmentShader: floorFragmentShader,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(11, 5.4), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, -1.45, 0.2);
  mesh.renderOrder = 3;
  return mesh;
};

const makeSignalLines = () => {
  const group = new THREE.Group();
  for (let index = 0; index < SIGNAL_LINE_COUNT; index += 1) {
    const z = -2.3 + (index / (SIGNAL_LINE_COUNT - 1)) * 4.6;
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-5.2, -1.41, z),
      new THREE.Vector3(5.2, -1.41, z),
    ]);
    const material = new THREE.LineBasicMaterial({
      color: index % 5 === 0 ? 0xffc857 : 0x5fe8f2,
      transparent: true,
      opacity: index % 5 === 0 ? 0.16 : 0.075,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const line = new THREE.Line(geometry, material);
    group.add(line);
  }
  return group;
};

const makeGlints = () => {
  const geometry = new THREE.IcosahedronGeometry(0.034, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, GLINT_COUNT);
  const glintData: Array<{ seed: number; home: THREE.Vector3; color: THREE.Color }> = [];
  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();

  for (let index = 0; index < GLINT_COUNT; index += 1) {
    const seed = hash(`liquid-glint-${index}`);
    const home = new THREE.Vector3(
      (hash(`liquid-glint-x-${index}`) - 0.5) * 0.8,
      (hash(`liquid-glint-y-${index}`) - 0.5) * 1.2,
      (hash(`liquid-glint-z-${index}`) - 0.5) * 0.7,
    );
    color.set(seed > 0.84 ? 0xffc857 : seed < 0.18 ? 0x43f2a2 : 0x8ff4ff);
    glintData.push({ seed, home, color: color.clone() });
    matrix.makeScale(0.001, 0.001, 0.001);
    mesh.setMatrixAt(index, matrix);
    mesh.setColorAt(index, color);
  }

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.renderOrder = 20;
  return { mesh, material, glintData };
};

const makeRimLine = (v: number, layer: number, color: number) => {
  const positions = new Float32Array((MEMBRANE_COLUMNS + 1) * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const line = new THREE.Line(geometry, material);
  line.renderOrder = 22;
  return { line, v, layer };
};

const updateRimLine = (
  rim: ReturnType<typeof makeRimLine>,
  time: number,
  emergence: number,
  unfold: number,
  generate: number,
  commit: number,
) => {
  const positions = rim.line.geometry.getAttribute("position") as THREE.BufferAttribute;
  for (let x = 0; x <= MEMBRANE_COLUMNS; x += 1) {
    const u = x / MEMBRANE_COLUMNS;
    const p = liquidPoint(u, rim.v, time, emergence, unfold, generate, commit, rim.layer);
    positions.setXYZ(x, p.x, p.y, p.z);
  }
  positions.needsUpdate = true;
  const material = rim.line.material as THREE.LineBasicMaterial;
  material.opacity = (0.14 + unfold * 0.05 + generate * 0.16 + commit * 0.06) * emergence;
};

const makeAudioWaveformGeometry = (pointCount: number) => {
  const positions = new Float32Array(pointCount * 2 * 3);
  const uvs = new Float32Array(pointCount * 2 * 2);
  const indices: number[] = [];

  for (let index = 0; index < pointCount; index += 1) {
    const u = index / Math.max(1, pointCount - 1);
    const vertexOffset = index * 2;
    uvs[vertexOffset * 2] = u;
    uvs[vertexOffset * 2 + 1] = 0;
    uvs[(vertexOffset + 1) * 2] = u;
    uvs[(vertexOffset + 1) * 2 + 1] = 1;

    if (index < pointCount - 1) {
      const a = vertexOffset;
      const b = vertexOffset + 1;
      const c = vertexOffset + 2;
      const d = vertexOffset + 3;
      indices.push(a, b, c, c, b, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.userData.audioWaveformGeometry = true;
  return geometry;
};

const updateAudioWaveformGeometry = (
  geometry: THREE.BufferGeometry,
  centers: THREE.Vector3[],
  amplitudes: number[],
  amplitudeScale: number,
  depthScale = 0.04,
) => {
  const positions = geometry.getAttribute("position") as THREE.BufferAttribute;

  centers.forEach((point, index) => {
    const amplitude = Math.max(0.001, (amplitudes[index] ?? 0.02) * amplitudeScale);
    const depth = Math.min(0.16, amplitude * depthScale);
    const vertexOffset = index * 2;

    positions.setXYZ(vertexOffset, point.x, point.y + amplitude, point.z + depth);
    positions.setXYZ(vertexOffset + 1, point.x, point.y - amplitude, point.z - depth);
  });

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
};

const makeSignalMaterial = (color: number) =>
  new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: false,
  });

const makeMixedSignalBand = () => {
  const group = new THREE.Group();
  const glowMaterial = makeSignalMaterial(0x8ff4ff);
  const coreMaterial = makeSignalMaterial(0xdff8ff);
  coreMaterial.blending = THREE.NormalBlending;
  const glow = new THREE.Mesh(makeAudioWaveformGeometry(MIXED_SIGNAL_POINTS), glowMaterial);
  const core = new THREE.Mesh(makeAudioWaveformGeometry(MIXED_SIGNAL_POINTS), coreMaterial);
  glow.renderOrder = 24;
  core.renderOrder = 25;
  group.add(glow, core);
  return { group, glow, core, glowMaterial, coreMaterial };
};

const updateMixedSignalBand = (
  mixedSignal: ReturnType<typeof makeMixedSignalBand>,
  time: number,
  emergence: number,
  unfold: number,
  generate: number,
  commit: number,
) => {
  const centers: THREE.Vector3[] = [];
  const amplitudes: number[] = [];
  for (let pointIndex = 0; pointIndex < MIXED_SIGNAL_POINTS; pointIndex += 1) {
    const u = pointIndex / (MIXED_SIGNAL_POINTS - 1);
    const p = liquidPoint(u, 0.5, time, emergence, unfold, generate, commit, 0);
    p.y += Math.sin(u * Math.PI * 6 + time * 0.12) * 0.02 + 0.14;
    p.z += 0.34;
    centers.push(p);
    amplitudes.push(audioWaveformAmplitude(u, time, 0.2, 1.18 + generate * 0.08));
  }

  updateAudioWaveformGeometry(mixedSignal.glow.geometry, centers, amplitudes, 1.34, 0.12);
  updateAudioWaveformGeometry(mixedSignal.core.geometry, centers, amplitudes, 0.52, 0.08);
  mixedSignal.glowMaterial.opacity = (0.22 + emergence * 0.16) * (1 - unfold * 0.76) + commit * 0.02;
  mixedSignal.coreMaterial.opacity = (0.26 + emergence * 0.16) * (1 - unfold * 0.84) + commit * 0.025;
};

const makeStemCurrents = () => {
  const group = new THREE.Group();
  const currents: Array<{
    core: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
    glow: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
    coreMaterial: THREE.MeshBasicMaterial;
    glowMaterial: THREE.MeshBasicMaterial;
    index: number;
  }> = [];

  for (let index = 0; index < STEM_CURRENT_COUNT; index += 1) {
    const glowMaterial = makeSignalMaterial(STEM_CURRENT_COLORS[index]);
    const coreMaterial = makeSignalMaterial(STEM_CURRENT_COLORS[index]);
    coreMaterial.blending = THREE.NormalBlending;
    const glow = new THREE.Mesh(makeAudioWaveformGeometry(STEM_RIBBON_POINTS), glowMaterial);
    const core = new THREE.Mesh(makeAudioWaveformGeometry(STEM_RIBBON_POINTS), coreMaterial);
    glow.renderOrder = 30 + index * 2;
    core.renderOrder = 31 + index * 2;
    currents.push({ core, glow, coreMaterial, glowMaterial, index });
    group.add(glow, core);
  }

  return { group, currents };
};

const updateStemCurrents = (
  stemCurrents: ReturnType<typeof makeStemCurrents>,
  time: number,
  emergence: number,
  unfold: number,
  generate: number,
  commit: number,
  promptEntry: number,
  orbTransform: number,
  generatedReveal: number,
  sessionSync: number,
) => {
  stemCurrents.currents.forEach((current) => {
    const lane = (current.index - (STEM_CURRENT_COUNT - 1) / 2) / ((STEM_CURRENT_COUNT - 1) / 2);
    const spread = 0.025 + unfold * 0.42 - generate * 0.035 + sessionSync * 0.22;
    const laneV = clamp(0.5 + lane * spread, 0.08, 0.92);
    const layer = lane * (0.12 + unfold * 0.5 - generate * 0.08);
    const centers: THREE.Vector3[] = [];
    const amplitudes: number[] = [];
    const quietGenerate = easeInOut(phase(generate, 0.08, 0.9));

    for (let pointIndex = 0; pointIndex < STEM_RIBBON_POINTS; pointIndex += 1) {
      const u = pointIndex / (STEM_RIBBON_POINTS - 1);
      const centerMask = Math.pow(Math.sin(u * Math.PI), 1.18);
      const ripple = Math.sin(u * Math.PI * (3.2 + current.index * 0.24) + time * (0.35 + current.index * 0.03));
      const syncRipple = Math.sin(u * Math.PI * 4.6 + time * 0.11);
      const laneDrift = Math.cos(u * Math.PI * 2 + time * 0.16 + current.index) * 0.045 * (1 - sessionSync * 0.8);
      const p = liquidPoint(
        u,
        clamp(laneV + ripple * 0.018 * (0.3 + unfold) * (1 - sessionSync * 0.72), 0.06, 0.94),
        time,
        emergence,
        unfold,
        generate,
        commit,
        layer,
      );
      p.y +=
        ripple * 0.06 * (0.5 + generate * 0.24) * (1 - sessionSync * 0.72) +
        syncRipple * 0.08 * sessionSync +
        lane * (0.08 + unfold * 0.62 + sessionSync * 0.16) +
        0.18;
      p.z += laneDrift + lane * (0.12 + unfold * 0.32 + sessionSync * 0.08);

      const backgroundTrack = synchronizedSessionPoint(u, lane * 0.64, time, -0.26);
      backgroundTrack.y -= 0.2 - lane * 0.04;
      backgroundTrack.z -= 0.22;
      p.lerp(backgroundTrack, quietGenerate * 0.48 * (0.46 + centerMask * 0.54));

      const finalStack = phaseLockedWaveforms(u, lane, time, -0.04);
      p.lerp(finalStack.center, sessionSync * (0.72 + centerMask * 0.18));

      const freeAmplitude = audioWaveformAmplitude(
        u,
        time,
        current.index * 0.19,
        0.62 + unfold * 0.74 + generate * 0.08,
      );
      amplitudes.push(freeAmplitude * (1 - sessionSync) + finalStack.amplitude * sessionSync);
      centers.push(p);
    }

    const splitOpacity = 0.1 + unfold * 0.48 + generatedReveal * 0.06 + sessionSync * 0.22;
    const generateCalm = 1 - promptEntry * 0.14 - orbTransform * 0.1;
    updateAudioWaveformGeometry(
      current.glow.geometry,
      centers,
      amplitudes,
      (1.12 + unfold * 0.22 + sessionSync * 0.04) * generateCalm * (1 - sessionSync * 0.36),
      0.1,
    );
    updateAudioWaveformGeometry(
      current.core.geometry,
      centers,
      amplitudes,
      (0.42 + unfold * 0.1) * generateCalm * (1 - sessionSync * 0.18),
      0.06,
    );
    current.glowMaterial.opacity = splitOpacity * emergence * (0.28 + generatedReveal * 0.06 + sessionSync * 0.04) * (1 - generate * 0.2);
    current.coreMaterial.opacity = splitOpacity * emergence * (0.5 + sessionSync * 0.04) * (1 - generate * 0.12);
  });
};

const makePromptFilament = () => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(PROMPT_FILAMENT_POINTS * 3), 3));
  const material = new THREE.LineBasicMaterial({
    color: 0xffc857,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const line = new THREE.Line(geometry, material);
  line.renderOrder = 34;
  return { line, material };
};

const updatePromptFilament = (
  filament: ReturnType<typeof makePromptFilament>,
  time: number,
  promptEntry: number,
  orbTransform: number,
  generatedReveal: number,
  sessionSync: number,
  transformAnchor: THREE.Vector3,
) => {
  const positions = filament.line.geometry.getAttribute("position") as THREE.BufferAttribute;
  for (let pointIndex = 0; pointIndex < PROMPT_FILAMENT_POINTS; pointIndex += 1) {
    const t = pointIndex / (PROMPT_FILAMENT_POINTS - 1);
    const local = t - 0.5;
    const draw = clamp((promptEntry - t * 0.34) / 0.66);
    const sourceX = -3.62 + t * (transformAnchor.x + 3.62);
    const sourceY =
      transformAnchor.y +
      Math.sin(t * Math.PI * 5.2 + time * 0.22) * 0.16 * Math.sin(t * Math.PI) +
      Math.sin(t * Math.PI * 13.0 - time * 0.18) * 0.025;
    const sourceZ = transformAnchor.z + local * 0.34 + Math.cos(t * Math.PI * 3.4 + time * 0.12) * 0.04;
    positions.setXYZ(
      pointIndex,
      -3.62 + draw * (sourceX + 3.62),
      sourceY + orbTransform * 0.02,
      sourceZ + generatedReveal * 0.04 - sessionSync * 0.12,
    );
  }
  positions.needsUpdate = true;
  filament.material.opacity = promptEntry * (1 - generatedReveal * 0.58) * (1 - sessionSync * 0.72) * 0.44;
};

const makeAceTransformOrb = () => {
  const group = new THREE.Group();
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0xffc857,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: 0x43f2a2,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 20), coreMaterial);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.48, 36, 22), haloMaterial);
  const trailMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd37a,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });
  const trail = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.028, 1), trailMaterial, PROMPT_PARTICLE_COUNT);
  const trailData = Array.from({ length: PROMPT_PARTICLE_COUNT }, (_, index) => ({
    seed: hash(`ace-transform-orb-particle-${index}`),
  }));
  core.renderOrder = 44;
  halo.renderOrder = 43;
  trail.renderOrder = 42;
  group.add(halo, core, trail);
  return { group, core, halo, trail, coreMaterial, haloMaterial, trailMaterial, trailData };
};

const updateAceTransformOrb = (
  transformOrb: ReturnType<typeof makeAceTransformOrb>,
  time: number,
  promptEntry: number,
  orbTransform: number,
  generatedReveal: number,
  sessionSync: number,
  transformAnchor: THREE.Vector3,
  matrix: THREE.Matrix4,
  position: THREE.Vector3,
  scale: THREE.Vector3,
  quaternion: THREE.Quaternion,
) => {
  const reveal = promptEntry * (1 - sessionSync * 0.22);
  const transformPulse = Math.sin(orbTransform * Math.PI) * 0.22 + generatedReveal * 0.08;
  const seedPulse = 1 + Math.sin(time * 3.8) * 0.045 * reveal;
  setAceOrbPosition(transformOrb.group.position, time, promptEntry, transformAnchor);
  transformOrb.group.scale.setScalar((0.18 + reveal * 0.82 + transformPulse) * seedPulse);
  transformOrb.coreMaterial.opacity = reveal * (0.66 - sessionSync * 0.18);
  transformOrb.haloMaterial.opacity = reveal * (0.16 + orbTransform * 0.16 - sessionSync * 0.08);
  transformOrb.trailMaterial.opacity = reveal * (0.36 + orbTransform * 0.18 - sessionSync * 0.18);

  transformOrb.trailData.forEach((particle, index) => {
    const t = index / PROMPT_PARTICLE_COUNT;
    const angle = particle.seed * Math.PI * 2 + time * (0.44 + particle.seed * 0.36);
    const radius = (1 - t) * (0.34 + particle.seed * 0.36) * (0.82 + orbTransform * 0.4);
    position.set(
      -t * (1.1 + particle.seed * 0.9) + Math.cos(angle) * radius,
      t * (0.62 + particle.seed * 0.3) + Math.sin(angle * 1.3) * radius * 0.42,
      Math.sin(angle) * radius,
    );
    scale.setScalar(Math.max(0.001, reveal * (0.28 + particle.seed * 0.8) * (1 - t * 0.62)));
    matrix.compose(position, quaternion, scale);
    transformOrb.trail.setMatrixAt(index, matrix);
  });
  transformOrb.trail.instanceMatrix.needsUpdate = true;
};

const makeAceTransformRings = () => {
  const group = new THREE.Group();
  const rings: Array<{ line: THREE.LineLoop; material: THREE.LineBasicMaterial; index: number }> = [];
  const colors = [0xffc857, 0xdff8ff, 0x43f2a2] as const;

  colors.forEach((color, index) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SEED_SHOCKWAVE_POINTS * 3), 3));
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });
    const line = new THREE.LineLoop(geometry, material);
    line.renderOrder = 40 + index;
    rings.push({ line, material, index });
    group.add(line);
  });

  return { group, rings };
};

const updateAceTransformRings = (
  transformRings: ReturnType<typeof makeAceTransformRings>,
  time: number,
  promptEntry: number,
  orbTransform: number,
  generatedReveal: number,
  sessionSync: number,
  transformAnchor: THREE.Vector3,
) => {
  const impact = easeInOut(phase(orbTransform, 0.06, 0.78));
  const flash = Math.sin(impact * Math.PI);
  const hold = easeInOut(phase(generatedReveal, 0.16, 1));

  transformRings.rings.forEach((ring) => {
    const positions = ring.line.geometry.getAttribute("position") as THREE.BufferAttribute;
    const radius = 0.24 + impact * (0.78 + ring.index * 0.28) + sessionSync * (0.16 + ring.index * 0.06);
    const wobbleAmount = 0.04 + ring.index * 0.015;

    for (let pointIndex = 0; pointIndex < SEED_SHOCKWAVE_POINTS; pointIndex += 1) {
      const t = pointIndex / SEED_SHOCKWAVE_POINTS;
      const angle = t * Math.PI * 2;
      const wobble = Math.sin(angle * 8 + time * (1.1 + ring.index * 0.2)) * wobbleAmount;
      positions.setXYZ(
        pointIndex,
        transformAnchor.x + Math.cos(angle) * (radius + wobble),
        transformAnchor.y + Math.sin(angle * 3 + time * 0.6) * 0.025,
        transformAnchor.z + Math.sin(angle) * (radius * (0.62 + ring.index * 0.08) + wobble),
      );
    }

    positions.needsUpdate = true;
    ring.material.opacity =
      ((flash * 0.42 + hold * 0.16) * (1 - ring.index * 0.2) + sessionSync * 0.035) * promptEntry;
  });
};

const makeAceTransformStreams = () => {
  const geometry = new THREE.IcosahedronGeometry(0.026, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, GENERATION_STREAM_COUNT);
  const streamData = Array.from({ length: GENERATION_STREAM_COUNT }, (_, index) => ({
    seed: hash(`ace-transform-stream-${index}`),
    lane: index % 3,
  }));
  const color = new THREE.Color();
  const matrix = new THREE.Matrix4();

  streamData.forEach((stream, index) => {
    color.set(stream.lane === 0 ? 0xffc857 : stream.lane === 1 ? 0xdff8ff : 0x43f2a2);
    mesh.setColorAt(index, color);
    matrix.makeScale(0.001, 0.001, 0.001);
    mesh.setMatrixAt(index, matrix);
  });

  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.instanceMatrix.needsUpdate = true;
  mesh.renderOrder = 46;
  return { mesh, material, streamData };
};

const updateAceTransformStreams = (
  streams: ReturnType<typeof makeAceTransformStreams>,
  time: number,
  orbTransform: number,
  generatedReveal: number,
  sessionSync: number,
  transformAnchor: THREE.Vector3,
  matrix: THREE.Matrix4,
  position: THREE.Vector3,
  scale: THREE.Vector3,
  quaternion: THREE.Quaternion,
) => {
  const streamReveal = orbTransform * (1 - sessionSync * 0.58);

  streams.streamData.forEach((stream, index) => {
    const lane = stream.lane - 1;
    const packet = (time * (0.09 + stream.seed * 0.1) + stream.seed * 1.7) % 1;
    const arc = Math.sin(packet * Math.PI);
    const sourceX = transformAnchor.x - 0.82 + stream.seed * 0.22;
    const sourceY = transformAnchor.y + lane * 0.16 + Math.sin(stream.seed * Math.PI * 2) * 0.08;
    const sourceZ = transformAnchor.z - 0.16 + lane * 0.13;
    const targetX = transformAnchor.x + 1.28 + stream.seed * 1.08;
    const targetY =
      transformAnchor.y +
      Math.sin(packet * Math.PI * 3.8 + stream.seed * 4) * 0.22 * (0.4 + generatedReveal) +
      lane * 0.1;
    const targetZ = transformAnchor.z + 0.16 + Math.sin(stream.seed * Math.PI * 2) * 0.2;
    position.set(
      sourceX + (targetX - sourceX) * packet,
      sourceY + (targetY - sourceY) * packet + arc * (0.22 + stream.seed * 0.14),
      sourceZ + (targetZ - sourceZ) * packet,
    );
    scale.setScalar(Math.max(0.001, streamReveal * arc * (0.2 + stream.seed * 0.58)));
    matrix.compose(position, quaternion, scale);
    streams.mesh.setMatrixAt(index, matrix);
  });

  streams.mesh.instanceMatrix.needsUpdate = true;
  streams.material.opacity = streamReveal * (0.32 + generatedReveal * 0.18);
};

const makeAceWaveTransform = () => {
  const group = new THREE.Group();
  const promptGlowMaterial = makeSignalMaterial(0xffc857);
  const promptCoreMaterial = makeSignalMaterial(0xfff0bf);
  promptCoreMaterial.blending = THREE.NormalBlending;
  const generatedGlowMaterial = makeSignalMaterial(0x43f2a2);
  const generatedCoreMaterial = makeSignalMaterial(0xdff8ff);
  generatedCoreMaterial.blending = THREE.NormalBlending;

  const promptGlow = new THREE.Mesh(makeAudioWaveformGeometry(ACE_TRANSFORM_POINTS), promptGlowMaterial);
  const promptCore = new THREE.Mesh(makeAudioWaveformGeometry(ACE_TRANSFORM_POINTS), promptCoreMaterial);
  const generatedGlow = new THREE.Mesh(makeAudioWaveformGeometry(ACE_TRANSFORM_POINTS), generatedGlowMaterial);
  const generatedCore = new THREE.Mesh(makeAudioWaveformGeometry(ACE_TRANSFORM_POINTS), generatedCoreMaterial);

  promptGlow.renderOrder = 52;
  promptCore.renderOrder = 53;
  generatedGlow.renderOrder = 56;
  generatedCore.renderOrder = 57;
  group.add(promptGlow, promptCore, generatedGlow, generatedCore);

  return {
    group,
    promptGlow,
    promptCore,
    generatedGlow,
    generatedCore,
    promptGlowMaterial,
    promptCoreMaterial,
    generatedGlowMaterial,
    generatedCoreMaterial,
  };
};

const updateAceWaveTransform = (
  transform: ReturnType<typeof makeAceWaveTransform>,
  time: number,
  promptEntry: number,
  orbTransform: number,
  generatedReveal: number,
  sessionSync: number,
  transformAnchor: THREE.Vector3,
) => {
  const promptCenters: THREE.Vector3[] = [];
  const promptAmplitudes: number[] = [];
  const generatedCenters: THREE.Vector3[] = [];
  const generatedAmplitudes: number[] = [];
  const transformFlash = Math.sin(orbTransform * Math.PI);

  for (let pointIndex = 0; pointIndex < ACE_TRANSFORM_POINTS; pointIndex += 1) {
    const u = pointIndex / (ACE_TRANSFORM_POINTS - 1);
    const envelope = Math.sin(u * Math.PI);
    const promptDraw = clamp((promptEntry - u * 0.3) / 0.7);
    const generatedDraw = clamp((generatedReveal - u * 0.36) / 0.64);

    const promptTarget = new THREE.Vector3(
      -3.58 + u * (transformAnchor.x + 3.46),
      transformAnchor.y +
        Math.sin(u * Math.PI * 5.2 + time * 0.22) * 0.24 * envelope +
        Math.sin(u * Math.PI * 13.0 - time * 0.18) * 0.035,
      transformAnchor.z - 0.18 + Math.cos(u * Math.PI * 3.2 + time * 0.1) * 0.08,
    );
    const promptStart = new THREE.Vector3(-3.58, transformAnchor.y - 0.2, transformAnchor.z - 0.38);
    promptStart.lerp(promptTarget, promptDraw);
    promptStart.lerp(transformAnchor, orbTransform * 0.28 * envelope);
    promptCenters.push(promptStart);
    promptAmplitudes.push(audioWaveformAmplitude(u, time, 0.38, 0.8 + promptEntry * 0.34) * (0.38 + promptDraw * 0.62));

    const generatedTarget = new THREE.Vector3(
      transformAnchor.x + u * 3.22,
      transformAnchor.y +
        Math.sin(u * Math.PI * 4.6 + time * 0.11) * 0.28 * envelope +
        Math.sin(u * Math.PI * 12.4 - time * 0.08) * 0.05,
      transformAnchor.z + 0.12 + Math.sin(u * Math.PI * 2.4 + time * 0.08) * 0.12,
    );
    const generatedStart = transformAnchor.clone();
    generatedStart.x += transformFlash * 0.08 * envelope;
    generatedStart.y += Math.sin(u * Math.PI * 8 + time * 0.2) * 0.04 * transformFlash;
    generatedStart.lerp(generatedTarget, generatedDraw);
    const syncedGenerated = phaseLockedWaveforms(u, 1.26, time, 0.08);
    generatedStart.lerp(syncedGenerated.center, sessionSync * (0.74 + envelope * 0.18));
    generatedCenters.push(generatedStart);

    const generatedAmplitude = audioWaveformAmplitude(u, time, 0.72, 0.88 + generatedReveal * 0.2);
    generatedAmplitudes.push(generatedAmplitude * (1 - sessionSync) + syncedGenerated.amplitude * sessionSync);
  }

  updateAudioWaveformGeometry(transform.promptGlow.geometry, promptCenters, promptAmplitudes, 1.08 + promptEntry * 0.18, 0.1);
  updateAudioWaveformGeometry(transform.promptCore.geometry, promptCenters, promptAmplitudes, 0.42 + promptEntry * 0.08, 0.06);
  updateAudioWaveformGeometry(
    transform.generatedGlow.geometry,
    generatedCenters,
    generatedAmplitudes,
    1.18 + generatedReveal * 0.2 - sessionSync * 0.08,
    0.1,
  );
  updateAudioWaveformGeometry(transform.generatedCore.geometry, generatedCenters, generatedAmplitudes, 0.46 + generatedReveal * 0.08, 0.06);

  transform.promptGlowMaterial.opacity = promptEntry * (0.34 + transformFlash * 0.18) * (1 - generatedReveal * 0.66) * (1 - sessionSync * 0.82);
  transform.promptCoreMaterial.opacity = promptEntry * 0.52 * (1 - generatedReveal * 0.68) * (1 - sessionSync * 0.86);
  transform.generatedGlowMaterial.opacity = generatedReveal * 0.44 * (1 - sessionSync * 0.55) + sessionSync * 0.14;
  transform.generatedCoreMaterial.opacity = generatedReveal * 0.62 * (1 - sessionSync * 0.42) + sessionSync * 0.22;
};

const makeRuntimeBoundary = () => {
  const group = new THREE.Group();
  const rings: Array<{ line: THREE.LineLoop; material: THREE.LineBasicMaterial; index: number }> = [];
  const colors = [0x8ff4ff, 0x43f2a2, 0xffc857] as const;

  colors.forEach((color, index) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(RUNTIME_BOUNDARY_POINTS * 3), 3));
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const line = new THREE.LineLoop(geometry, material);
    line.renderOrder = 8 + index;
    rings.push({ line, material, index });
    group.add(line);
  });

  return { group, rings };
};

const updateRuntimeBoundary = (
  boundary: ReturnType<typeof makeRuntimeBoundary>,
  time: number,
  emergence: number,
  unfold: number,
  generate: number,
  commit: number,
) => {
  boundary.rings.forEach((ring) => {
    const positions = ring.line.geometry.getAttribute("position") as THREE.BufferAttribute;
    const radiusX = 4.72 + ring.index * 0.32 + unfold * 0.28 + commit * 0.18;
    const radiusY = 1.32 + ring.index * 0.16 + generate * 0.08;

    for (let pointIndex = 0; pointIndex < RUNTIME_BOUNDARY_POINTS; pointIndex += 1) {
      const t = pointIndex / RUNTIME_BOUNDARY_POINTS;
      const angle = t * Math.PI * 2;
      const shimmer = Math.sin(angle * 5 + time * (0.22 + ring.index * 0.06)) * 0.045;
      const x = Math.cos(angle) * (radiusX + shimmer);
      const y = Math.sin(angle) * (radiusY + shimmer * 0.5) + 0.06;
      const z = Math.sin(angle + time * 0.08 + ring.index) * (0.22 + ring.index * 0.09);
      positions.setXYZ(pointIndex, x, y, z);
    }

    positions.needsUpdate = true;
    ring.material.opacity = (0.055 + unfold * 0.035 + generate * 0.055 + commit * 0.07) * emergence * (1 - ring.index * 0.18);
  });

  boundary.group.rotation.y = -0.08 + unfold * 0.08;
  boundary.group.rotation.z = time * 0.015 + commit * 0.05;
};

const makeWaveformSpine = () => {
  const group = new THREE.Group();
  const spines: Array<{ line: THREE.Line; material: THREE.LineBasicMaterial; index: number }> = [];
  const colors = [0xdff8ff, 0xffc857] as const;

  colors.forEach((color, index) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(WAVEFORM_SPINE_POINTS * 3), 3));
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const line = new THREE.Line(geometry, material);
    line.renderOrder = 38 + index;
    spines.push({ line, material, index });
    group.add(line);
  });

  return { group, spines };
};

const updateWaveformSpine = (
  spine: ReturnType<typeof makeWaveformSpine>,
  time: number,
  emergence: number,
  unfold: number,
  generate: number,
  commit: number,
) => {
  spine.spines.forEach((item) => {
    const positions = item.line.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let pointIndex = 0; pointIndex < WAVEFORM_SPINE_POINTS; pointIndex += 1) {
      const u = pointIndex / (WAVEFORM_SPINE_POINTS - 1);
      const p = liquidPoint(u, 0.5, time, emergence, unfold, generate, commit, item.index === 0 ? 0 : 0.08);
      const resolvedWave = Math.sin(u * Math.PI * 8 + time * 0.08) * 0.07 + Math.sin(u * Math.PI * 2.4) * 0.12;
      p.y = p.y * (1 - commit * 0.55) + resolvedWave * (0.45 + commit * 0.55) + 0.08;
      p.z += (item.index === 0 ? 0.04 : -0.04) + Math.cos(u * Math.PI * 6) * 0.025;
      positions.setXYZ(pointIndex, p.x, p.y, p.z);
    }
    positions.needsUpdate = true;
    item.material.opacity = (generate * 0.06 + commit * (item.index === 0 ? 0.26 : 0.16)) * emergence;
  });
};

const makeFinalWaveformRibbon = () => {
  const glowMaterial = makeSignalMaterial(0xfff0bf);
  const coreMaterial = makeSignalMaterial(0xdff8ff);
  coreMaterial.blending = THREE.NormalBlending;
  const glow = new THREE.Mesh(makeAudioWaveformGeometry(WAVEFORM_SPINE_POINTS), glowMaterial);
  const core = new THREE.Mesh(makeAudioWaveformGeometry(WAVEFORM_SPINE_POINTS), coreMaterial);
  const group = new THREE.Group();
  glow.renderOrder = 48;
  core.renderOrder = 49;
  group.add(glow, core);
  return { group, glow, core, glowMaterial, coreMaterial };
};

const updateFinalWaveformRibbon = (
  finalRibbon: ReturnType<typeof makeFinalWaveformRibbon>,
  time: number,
  emergence: number,
  unfold: number,
  generate: number,
  commit: number,
) => {
  const centers: THREE.Vector3[] = [];
  const amplitudes: number[] = [];
  const resolve = easeInOut(phase(commit, 0.08, 1));
  for (let pointIndex = 0; pointIndex < WAVEFORM_SPINE_POINTS; pointIndex += 1) {
    const u = pointIndex / (WAVEFORM_SPINE_POINTS - 1);
    const p = liquidPoint(u, 0.5, time, emergence, unfold, generate, commit, 0.04);
    const syncGuide = phaseLockedWaveforms(u, 0, time, -0.22);
    syncGuide.center.y -= 0.02;
    p.lerp(syncGuide.center, resolve);
    centers.push(p);
    amplitudes.push(audioWaveformAmplitude(u, time, 0.52, 0.48) * (1 - resolve) + syncGuide.amplitude * resolve);
  }

  updateAudioWaveformGeometry(finalRibbon.glow.geometry, centers, amplitudes, 0.82 + resolve * 0.3, 0.08);
  updateAudioWaveformGeometry(finalRibbon.core.geometry, centers, amplitudes, 0.28 + resolve * 0.1, 0.05);
  finalRibbon.glowMaterial.opacity = resolve * 0.08;
  finalRibbon.coreMaterial.opacity = resolve * 0.12;
};

const makeSharedTimeRuler = () => {
  const group = new THREE.Group();
  const railMaterial = new THREE.LineBasicMaterial({
    color: 0xdff8ff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const railGeometry = new THREE.BufferGeometry();
  railGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array([-3.42, -0.02, 1.36, 3.42, -0.02, 1.36]), 3),
  );
  const rail = new THREE.Line(railGeometry, railMaterial);
  rail.renderOrder = 70;
  const tickMaterial = new THREE.MeshBasicMaterial({
    color: 0xffc857,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });
  const tickGeometry = new THREE.BoxGeometry(0.018, 1.78, 0.018);
  const ticks = new THREE.InstancedMesh(tickGeometry, tickMaterial, 17);
  ticks.renderOrder = 71;
  group.add(rail, ticks);
  group.userData.sharedTimeRuler = true;
  return { group, rail, ticks, railMaterial, tickMaterial };
};

const updateSharedTimeRuler = (
  sharedTimeRuler: ReturnType<typeof makeSharedTimeRuler>,
  time: number,
  commit: number,
  matrix: THREE.Matrix4,
  position: THREE.Vector3,
  scale: THREE.Vector3,
  quaternion: THREE.Quaternion,
) => {
  const reveal = easeInOut(phase(commit, 0.02, 0.42));
  sharedTimeRuler.railMaterial.opacity = reveal * 0.28;
  sharedTimeRuler.tickMaterial.opacity = reveal * 0.32;

  for (let index = 0; index < sharedTimeRuler.ticks.count; index += 1) {
    const x = -3.42 + (index / (sharedTimeRuler.ticks.count - 1)) * 6.84;
    const beat = 0.74 + Math.sin(time * 2.1 + index * 0.6) * 0.16;
    position.set(x, -0.02, 1.34);
    scale.set(index % 4 === 0 ? 1.35 : 0.82, beat, 1);
    matrix.compose(position, quaternion, scale);
    sharedTimeRuler.ticks.setMatrixAt(index, matrix);
  }
  sharedTimeRuler.ticks.instanceMatrix.needsUpdate = true;
};

const makeSharedPlayhead = () => {
  const group = new THREE.Group();
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(2 * 3), 3));
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xdff8ff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const line = new THREE.Line(lineGeometry, lineMaterial);
  line.renderOrder = 74;

  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xfff0bf,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: false,
  });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 2.35), glowMaterial);
  glow.renderOrder = 73;

  const markerMaterial = new THREE.MeshBasicMaterial({
    color: 0xffc857,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });
  const marker = new THREE.Mesh(new THREE.SphereGeometry(0.052, 20, 12), markerMaterial);
  marker.renderOrder = 75;

  group.add(glow, line, marker);
  group.userData.sharedPlayhead = true;
  return { group, line, glow, marker, lineMaterial, glowMaterial, markerMaterial };
};

const updateSharedPlayhead = (sharedPlayhead: ReturnType<typeof makeSharedPlayhead>, time: number, commit: number) => {
  const reveal = easeInOut(phase(commit, 0.1, 1));
  const playheadCycle = (commit * 3.35 + time * 0.035) % 1;
  const x = -3.42 + playheadCycle * 6.84;
  const bottom = -1.04;
  const top = 0.96;
  const z = 1.46;
  const positions = sharedPlayhead.line.geometry.getAttribute("position") as THREE.BufferAttribute;
  positions.setXYZ(0, x, bottom, z);
  positions.setXYZ(1, x, top, z);
  positions.needsUpdate = true;

  sharedPlayhead.glow.position.set(x, (top + bottom) * 0.5, z - 0.012);
  sharedPlayhead.glow.scale.set(1, 0.8 + reveal * 0.34, 1);
  sharedPlayhead.marker.position.set(x, top + 0.08, z);
  sharedPlayhead.marker.scale.setScalar(0.62 + Math.sin(time * 4.2) * 0.08 + reveal * 0.22);
  sharedPlayhead.lineMaterial.opacity = reveal * 0.92;
  sharedPlayhead.glowMaterial.opacity = reveal * 0.24;
  sharedPlayhead.markerMaterial.opacity = reveal * 0.82;
};

const AiNeuralStudioStage = ({ phases, stateRef, fallback, className }: AiNeuralStudioStageProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktopStage = window.matchMedia("(min-width: 1024px)").matches;

    if (!canvas || reducedMotion || !desktopStage) {
      setFailed(true);
      setReady(false);
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
      setReady(false);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x01040a, 0.045);

    const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 80);
    camera.position.set(0, 0.24, 8.9);

    const root = new THREE.Group();
    scene.add(root);

    const backdrop = makeBackdrop();
    root.add(backdrop);

    const floor = makeFloor();
    root.add(floor);

    const signalLines = makeSignalLines();
    root.add(signalLines);

    const mixedSignal = makeMixedSignalBand();
    root.add(mixedSignal.group);

    const runtimeBoundary = makeRuntimeBoundary();
    root.add(runtimeBoundary.group);

    const membranes = MEMBRANE_LAYERS.map((layer) => ({ layer, mesh: makeLiquidMembrane(layer) }));
    membranes.forEach(({ mesh }, index) => {
      mesh.position.y = index === 0 ? 0 : -0.04 - index * 0.01;
      root.add(mesh);
    });

    const rimLines = [
      makeRimLine(0.05, 0, 0x8ff4ff),
      makeRimLine(0.95, 0, 0xffc857),
      makeRimLine(0.5, 0.72, 0x43f2a2),
      makeRimLine(0.22, -0.72, 0xff4fbf),
      makeRimLine(0.78, 1.18, 0xdff8ff),
    ];
    rimLines.forEach((rim) => root.add(rim.line));

    const stemCurrents = makeStemCurrents();
    root.add(stemCurrents.group);

    const promptFilament = makePromptFilament();
    root.add(promptFilament.line);

    const transformOrb = makeAceTransformOrb();
    root.add(transformOrb.group);

    const transformRings = makeAceTransformRings();
    root.add(transformRings.group);

    const transformStreams = makeAceTransformStreams();
    root.add(transformStreams.mesh);

    const aceWaveTransform = makeAceWaveTransform();
    root.add(aceWaveTransform.group);

    const waveformSpine = makeWaveformSpine();
    root.add(waveformSpine.group);

    const finalWaveformRibbon = makeFinalWaveformRibbon();
    root.add(finalWaveformRibbon.group);

    const sharedTimeRuler = makeSharedTimeRuler();
    root.add(sharedTimeRuler.group);

    const sharedPlayhead = makeSharedPlayhead();
    root.add(sharedPlayhead.group);

    const glints = makeGlints();
    root.add(glints.mesh);

    const keyLight = new THREE.PointLight(0x8ff4ff, 1.9, 12);
    keyLight.position.set(-2.4, 2.1, 2.8);
    scene.add(keyLight);

    const amberLight = new THREE.PointLight(0xffc857, 0.8, 10);
    amberLight.position.set(2.4, 0.8, 2.2);
    scene.add(amberLight);

    const fillLight = new THREE.AmbientLight(0xb7f8ff, 0.22);
    scene.add(fillLight);

    const lookTarget = new THREE.Vector3();
    const fogCold = new THREE.Color(0x01040a);
    const fogWarm = new THREE.Color(0x080604);
    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const tempScale = new THREE.Vector3();
    const tempQuaternion = new THREE.Quaternion();
    const tempTransformAnchor = new THREE.Vector3();

    const resize = () => {
      if (!renderer || !canvas.parentElement) return;
      const bounds = canvas.parentElement.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_LIMIT));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const animate = (now: number) => {
      if (disposed || !renderer) return;
      resize();

      const time = now / 1000;
      const state = stateRef.current;
      const global = clamp(state.globalProgress);
      const phaseIndex = Math.trunc(clamp(state.phaseIndex, 0, phases.length - 1));
      const activePhase = phases[phaseIndex] ?? phases[0]!;
      const accent = accentColor(activePhase);

      const emergence = 0.42 + easeInOut(phase(global, 0, 0.22)) * 0.58;
      const unfold = easeInOut(phase(global, 0.18, 0.5));
      const generate = easeInOut(phase(global, 0.42, 0.7));
      const commit = easeInOut(phase(global, 0.64, 1));
      const promptEntry = easeInOut(phase(generate, 0.02, 0.5));
      const orbTransform = easeInOut(phase(generate, 0.24, 0.68));
      const generatedReveal = easeInOut(phase(generate, 0.46, 1));
      const sessionSync = commit;
      const audioEnergy = clamp(state.audioEnergy, 0, 1.4);
      setAceTransformAnchor(tempTransformAnchor, sessionSync);

      const backdropMaterial = backdrop.material as THREE.ShaderMaterial;
      backdropMaterial.uniforms.uTime.value = time;
      backdropMaterial.uniforms.uUnfold.value = unfold;
      backdropMaterial.uniforms.uGenerate.value = generate;
      backdropMaterial.uniforms.uCommit.value = commit;
      backdropMaterial.uniforms.uAccent.value.copy(accent);

      const floorMaterial = floor.material as THREE.ShaderMaterial;
      floorMaterial.uniforms.uTime.value = time;
      floorMaterial.uniforms.uUnfold.value = unfold;
      floorMaterial.uniforms.uGenerate.value = generate;
      floorMaterial.uniforms.uCommit.value = commit;

      membranes.forEach(({ layer, mesh }, index) => {
        updateMembraneGeometry(mesh.geometry, time, emergence, unfold, generate, commit, layer);
        const material = mesh.material as THREE.ShaderMaterial;
        material.uniforms.uTime.value = time;
        material.uniforms.uEmergence.value = emergence;
        material.uniforms.uUnfold.value = unfold;
        material.uniforms.uGenerate.value = generate;
        material.uniforms.uCommit.value = commit;
        material.uniforms.uAccent.value.copy(accent);
        material.uniforms.uCameraPos.value.copy(camera.position);
        mesh.visible = index === 0 || unfold > 0.08 || generate > 0.16;
        const membraneFocus = 1 - generatedReveal * 0.08 - sessionSync * 0.2;
        mesh.scale.setScalar((0.96 + emergence * 0.16 + audioEnergy * 0.018 + generate * 0.018) * membraneFocus);
      });

      rimLines.forEach((rim) => updateRimLine(rim, time, emergence, unfold, generate, commit));
      updateMixedSignalBand(mixedSignal, time, emergence, unfold, generate, commit);
      updateStemCurrents(stemCurrents, time, emergence, unfold, generate, commit, promptEntry, orbTransform, generatedReveal, sessionSync);
      updatePromptFilament(promptFilament, time, promptEntry, orbTransform, generatedReveal, sessionSync, tempTransformAnchor);
      updateAceTransformOrb(
        transformOrb,
        time,
        promptEntry,
        orbTransform,
        generatedReveal,
        sessionSync,
        tempTransformAnchor,
        tempMatrix,
        tempPosition,
        tempScale,
        tempQuaternion,
      );
      updateAceTransformRings(transformRings, time, promptEntry, orbTransform, generatedReveal, sessionSync, tempTransformAnchor);
      updateAceTransformStreams(
        transformStreams,
        time,
        orbTransform,
        generatedReveal,
        sessionSync,
        tempTransformAnchor,
        tempMatrix,
        tempPosition,
        tempScale,
        tempQuaternion,
      );
      updateAceWaveTransform(aceWaveTransform, time, promptEntry, orbTransform, generatedReveal, sessionSync, tempTransformAnchor);
      updateRuntimeBoundary(runtimeBoundary, time, emergence, unfold, generate, commit);
      updateWaveformSpine(waveformSpine, time, emergence, unfold, generate, commit);
      updateFinalWaveformRibbon(finalWaveformRibbon, time, emergence, unfold, generate, commit);
      updateSharedTimeRuler(sharedTimeRuler, time, commit, tempMatrix, tempPosition, tempScale, tempQuaternion);
      updateSharedPlayhead(sharedPlayhead, time, commit);

      glints.material.opacity = (0.12 + generate * 0.24 + commit * 0.06) * emergence;
      glints.glintData.forEach((glint, index) => {
        const orbit = time * (0.18 + glint.seed * 0.22) + glint.seed * Math.PI * 2;
        const radius = 1.05 + glint.seed * 2.45 + unfold * 0.82;
        const reveal = clamp((generate + unfold * 0.45 - glint.seed * 0.22) / 0.9);
        const calm = 1 - commit * 0.36;
        const scale = reveal * calm * (0.34 + glint.seed * 0.78) * (0.72 + generate * 0.42);
        tempPosition.copy(glint.home);
        tempPosition.x += Math.cos(orbit) * radius;
        tempPosition.z += Math.sin(orbit * 0.84) * (0.52 + glint.seed * 1.08);
        tempPosition.y += Math.sin(orbit * 1.3 + glint.seed * 4) * (0.3 + generate * 0.36);
        tempPosition.y += commit * 0.14 * Math.sin(glint.seed * 12);
        tempScale.setScalar(Math.max(0.001, scale));
        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
        glints.mesh.setMatrixAt(index, tempMatrix);
      });
      glints.mesh.instanceMatrix.needsUpdate = true;

      signalLines.children.forEach((child, index) => {
        const material = (child as THREE.Line).material as THREE.LineBasicMaterial;
        material.opacity =
          (index % 5 === 0 ? 0.08 : 0.035) +
          unfold * (index % 5 === 0 ? 0.08 : 0.035) +
          generate * 0.025 +
          commit * 0.03;
      });

      const fog = scene.fog as THREE.FogExp2;
      fog.color.copy(fogCold).lerp(fogWarm, commit * 0.55);
      fog.density = 0.042 + generate * 0.012;

      keyLight.intensity = 1.3 + emergence * 0.7 + generate * 0.5;
      amberLight.intensity = 0.35 + generate * 0.35 + commit * 0.8;

      root.rotation.y = -0.22 + unfold * 0.22 + generate * 0.035 + state.pointer.x * 0.055;
      root.rotation.x = -0.1 + unfold * 0.045 + state.pointer.y * -0.034;
      root.position.x = 0.26 - commit * 0.1;
      root.position.y = -0.04 + commit * 0.09;

      camera.position.x = state.pointer.x * 0.16 + Math.sin(time * 0.08) * 0.035 * generate;
      camera.position.y = 0.18 + state.pointer.y * -0.07 + generate * 0.16 + commit * 0.07;
      camera.position.z = 9.05 - emergence * 0.78 - unfold * 0.68 - generate * 0.16 + commit * 0.28;
      lookTarget.set(0, -0.04 + commit * 0.08, 0);
      camera.lookAt(lookTarget);

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    setFailed(false);
    setReady(true);
    resize();
    window.addEventListener("resize", resize);
    frameId = window.requestAnimationFrame(animate);

    const disposeNode = (obj: THREE.Object3D) => {
      obj.traverse((child) => {
        const mesh = child as THREE.Mesh & THREE.Line & THREE.Points;
        if (mesh.geometry) mesh.geometry.dispose();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((item) => item.dispose());
        else if (material) material.dispose();
      });
    };

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      disposeNode(root);
      renderer?.dispose();
    };
  }, [phases, stateRef]);

  return (
    <>
      <canvas
        aria-hidden="true"
        className={cn("ai-neural-studio-stage", failed && "ai-neural-studio-stage--failed", className)}
        data-ai-neural-webgl
        data-ai-neural-webgl-ready={ready ? "true" : "false"}
        ref={canvasRef}
      />
      <div className={cn("ai-neural-fallback-stage", ready && !failed && "ai-neural-fallback-stage--hidden")}>
        {fallback}
      </div>
    </>
  );
};

export default AiNeuralStudioStage;
