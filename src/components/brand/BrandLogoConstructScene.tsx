import { useMemo, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BrandLogoPiece {
  id: string;
  d: string;
  fill: string;
  colorGroup: "sky" | "blue" | "navy" | "cyan";
  order: number;
}

export const BRAND_LOGO_VIEW_BOX = "634 505 784 784";

export const BRAND_LOGO_PIECES: BrandLogoPiece[] = [
  {
    id: "sky-ribbon-main",
    colorGroup: "sky",
    fill: "rgb(136,188,236)",
    order: 6,
    d: "M 782.528 691.718 C 818.3 645.424 877.331 606.011 933.236 589.489 C 944.52 628.796 956.906 655.66 982.337 687.618 C 916.516 688.862 848.176 727.505 846.95 801.529 C 846.488 829.446 858.996 848.415 877.865 867.761 C 904.663 887.296 926.615 893.691 959.983 893.908 C 981.802 894.05 1003.73 894.027 1025.56 894.028 L 1176.82 894.162 C 1203.02 894.238 1230.5 892.673 1255.85 899.212 C 1288.73 907.693 1317.8 936.44 1323.18 970.394 C 1328.87 1006.2 1299.46 1063.72 1277.53 1091.35 C 1275.68 1094.84 1261.29 1112.41 1258.16 1115.99 C 1220.7 1158.33 1172.55 1189.82 1118.75 1207.15 C 1110.5 1171.05 1090.11 1133.12 1068.05 1103.77 C 1091.52 1103.62 1105.01 1100.72 1126.69 1091.79 C 1202.51 1060.56 1229.52 964.846 1152.97 915.493 C 1140.95 910.069 1123.47 901.872 1110.32 900.402 C 1080.27 897.04 1045.55 898.048 1015.15 897.994 L 869.677 897.046 C 830.601 897.046 785.856 902.429 753.498 876.682 C 737.523 864.188 727.39 845.672 725.479 825.481 C 721.619 786.772 758.109 721.589 782.528 691.718 z",
  },
  {
    id: "blue-ribbon-lower",
    colorGroup: "blue",
    fill: "rgb(56,154,216)",
    order: 2,
    d: "M 1152.97 915.493 C 1162.68 914.351 1183.15 928.286 1190.82 934.418 C 1228.06 964.188 1257.66 1006.53 1270.6 1052.63 C 1273.04 1061.35 1275.78 1087.36 1277.53 1091.35 C 1275.68 1094.84 1261.29 1112.41 1258.16 1115.99 C 1220.7 1158.33 1172.55 1189.82 1118.75 1207.15 C 1110.5 1171.05 1090.11 1133.12 1068.05 1103.77 C 1091.52 1103.62 1105.01 1100.72 1126.69 1091.79 C 1202.51 1060.56 1229.52 964.846 1152.97 915.493 z",
  },
  {
    id: "blue-ribbon-upper",
    colorGroup: "blue",
    fill: "rgb(56,154,216)",
    order: 9,
    d: "M 782.528 691.718 C 818.3 645.424 877.331 606.011 933.236 589.489 C 944.52 628.796 956.906 655.66 982.337 687.618 C 916.516 688.862 848.176 727.505 846.95 801.529 C 846.488 829.446 858.996 848.415 877.865 867.761 C 873.112 866.396 862.152 857.998 858.04 854.663 C 817.309 821.638 786.669 767.845 783.818 714.995 C 783.414 707.503 783.54 700.146 782.656 692.723 L 782.528 691.718 z",
  },
  {
    id: "navy-sweep-main",
    colorGroup: "navy",
    fill: "rgb(23,21,60)",
    order: 1,
    d: "M 602.084 895.192 C 705.574 889.339 793.658 907.831 880.463 966.171 C 968.901 1025.61 1039.81 1116.37 1071.72 1218.23 C 1040.52 1221.96 1018.53 1222.29 987.296 1219.03 C 975.732 1218.81 951.436 1212.89 939.902 1209.56 C 857.463 1185.44 788.332 1128.91 748.318 1052.9 C 730.954 1019.21 726.551 981.274 699.751 953.594 C 674.804 927.827 642.7 914.594 608.639 905.983 C 602.704 904.482 593.838 903.13 589.457 899.079 L 588.901 898.028 C 588.658 897.422 588.414 896.815 588.171 896.208 C 592.751 895.859 597.708 895.026 602.084 895.192 z",
  },
  {
    id: "blue-sweep-edge",
    colorGroup: "blue",
    fill: "rgb(56,154,216)",
    order: 5,
    d: "M 602.084 895.192 C 705.574 889.339 793.658 907.831 880.463 966.171 C 968.901 1025.61 1039.81 1116.37 1071.72 1218.23 C 1040.52 1221.96 1018.53 1222.29 987.296 1219.03 C 944.614 1055.22 779.989 909.659 609.551 897.909 C 608.19 897.617 602.428 896.899 601.692 896.374 C 601.587 895.902 601.799 895.775 602.084 895.192 z",
  },
  {
    id: "deep-blue-join",
    colorGroup: "blue",
    fill: "rgb(36,116,180)",
    order: 8,
    d: "M 588.171 896.208 C 592.751 895.859 597.708 895.026 602.084 895.192 C 601.799 895.775 601.587 895.902 601.692 896.374 C 602.428 896.899 608.19 897.617 609.551 897.909 C 602.668 898.038 595.785 898.078 588.901 898.028 C 588.658 897.422 588.414 896.815 588.171 896.208 z",
  },
  {
    id: "cyan-arc-main",
    colorGroup: "cyan",
    fill: "rgb(12,250,247)",
    order: 4,
    d: "M 979.015 578.239 C 1005.02 574.436 1037.35 575.239 1063.31 577.748 C 1146.62 589.033 1222.12 632.686 1273.47 699.25 C 1295.44 727.809 1317.61 766.027 1326.88 800.433 C 1344.73 866.736 1405.84 883.212 1466.14 890.727 C 1470.05 891.214 1474.29 891.876 1478.34 891.794 L 1479.74 894.206 C 1453.6 895.792 1439.82 898.323 1411.99 898.365 C 1350 902.5 1266.48 882.172 1211.4 853.764 C 1102.31 797.49 1016.73 694.68 979.015 578.239 z",
  },
  {
    id: "blue-arc-shadow",
    colorGroup: "blue",
    fill: "rgb(56,154,216)",
    order: 7,
    d: "M 979.015 578.239 C 1005.02 574.436 1037.35 575.239 1063.31 577.748 C 1066.33 590.612 1072.54 607.158 1077.16 619.636 C 1111.89 713.344 1176.94 792.76 1261.97 845.27 C 1294.54 865.465 1330.22 880.152 1367.57 888.741 C 1382.12 892.108 1397.41 893.406 1411 898.124 C 1411.33 898.204 1411.66 898.285 1411.99 898.365 C 1350 902.5 1266.48 882.172 1211.4 853.764 C 1102.31 797.49 1016.73 694.68 979.015 578.239 z",
  },
  {
    id: "navy-left-spark",
    colorGroup: "navy",
    fill: "rgb(23,21,60)",
    order: 0,
    d: "M 589.457 899.079 C 583.662 899.178 574.375 899.803 568.86 899.523 L 568.63 899.178 C 568.17 899.167 567.71 899.156 567.251 899.144 C 567.183 899.011 567.116 898.878 567.049 898.744 C 566.903 898.877 586.81 896.357 588.171 896.208 C 588.414 896.815 588.658 897.422 588.901 898.028 L 589.457 899.079 z",
  },
  {
    id: "deep-blue-right-spark",
    colorGroup: "blue",
    fill: "rgb(36,116,180)",
    order: 3,
    d: "M 1478.34 891.794 C 1481.42 892.127 1486.55 893.279 1479.74 894.206 L 1478.34 891.794 z",
  },
];

interface BrandLogoConstructSceneProps {
  className?: string;
  label?: string;
  progress?: number;
  showWordmark?: boolean;
  size?: "hero" | "intro" | "compact";
}

const clampProgress = (value: number) => Math.max(0, Math.min(1, value));
const phase = (value: number, start: number, end: number) =>
  end <= start ? (value >= end ? 1 : 0) : clampProgress((value - start) / (end - start));
const easeOutCubic = (value: number) => 1 - Math.pow(1 - clampProgress(value), 3);
const easeInOutCubic = (value: number) => {
  const clamped = clampProgress(value);
  return clamped < 0.5 ? 4 * clamped * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
};

const seedFor = (id: string) => {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
};

const pieceVector = (piece: BrandLogoPiece, mode: "in" | "out") => {
  const seed = seedFor(`${piece.id}-${mode}`);
  const angle = seed * Math.PI * 2 + (mode === "out" ? Math.PI * 0.35 : 0);
  const radius = mode === "out" ? 420 + seed * 220 : 1;
  const polarity = seed > 0.5 ? 1 : -1;
  const edgeBias = seedFor(`${piece.id}-${mode}-edge`);
  const horizontalEdge = edgeBias > 0.38;
  const xSign = Math.cos(angle) >= 0 ? 1 : -1;
  const ySign = Math.sin(angle) >= 0 ? 1 : -1;

  const pixelVector = {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius * (mode === "out" ? 0.78 : 0.92),
    z: mode === "out" ? 240 + seed * 220 : 620 + seed * 520,
    rotate: polarity * (mode === "out" ? 58 + seed * 50 : 34 + seed * 62),
    scale: mode === "out" ? 0.72 + seed * 0.28 : 0.44 + seed * 0.28,
    vw: horizontalEdge ? xSign * (128 + seed * 56) : Math.cos(angle) * (38 + seed * 46),
    vh: horizontalEdge ? Math.sin(angle) * (42 + seed * 48) : ySign * (96 + seed * 42),
  };

  return pixelVector;
};

const pieceStyle = (piece: BrandLogoPiece, progress: number, reducedMotion: boolean): CSSProperties => {
  if (reducedMotion) {
    return {
      opacity: 1,
      transform: "translate3d(0px, 0px, 0px) rotate(0deg) scale(1)",
    };
  }

  const assembleDelay = piece.order * 0.022;
  const destroyDelay = (BRAND_LOGO_PIECES.length - piece.order - 1) * 0.012;
  const flightStart = 0.02 + piece.order * 0.012;
  const flightEnd = 0.46 + piece.order * 0.006;
  const lockEnd = 0.58;
  const flight = easeOutCubic(phase(progress, flightStart, flightEnd));
  const assemble = easeInOutCubic(phase(progress, flightStart + 0.04, lockEnd));
  const destroy = easeInOutCubic(phase(progress, 0.7 + destroyDelay, 1));
  const incoming = pieceVector(piece, "in");
  const outgoing = pieceVector(piece, "out");
  const ambient = Math.sin((progress + seedFor(piece.id)) * Math.PI * 2) * 5;
  const incomingWeight = 1 - flight;

  const xPx = incoming.x * incomingWeight * 0.18 + outgoing.x * destroy;
  const yPx = incoming.y * incomingWeight * 0.18 + outgoing.y * destroy + ambient * assemble * (1 - destroy);
  const z = incoming.z * incomingWeight + outgoing.z * destroy;
  const rotate = incoming.rotate * incomingWeight + outgoing.rotate * destroy;
  const scale = incoming.scale * incomingWeight + (1 - destroy * 0.3) * flight;
  const opacity = clampProgress(phase(progress, flightStart, flightStart + 0.12) * (1 - destroy * 0.96));
  const blur = incomingWeight * 18 + destroy * 10;
  const brightness = 1 + incomingWeight * 0.42 + Math.sin(flight * Math.PI) * 0.2;

  return {
    opacity,
    transform: `translate3d(calc(${(incoming.vw * incomingWeight).toFixed(3)}vw + ${xPx.toFixed(2)}px), calc(${(incoming.vh * incomingWeight).toFixed(3)}vh + ${yPx.toFixed(2)}px), ${z.toFixed(2)}px) rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
    filter: `brightness(${brightness.toFixed(3)}) blur(${blur.toFixed(2)}px) drop-shadow(0 0 ${Math.round(14 + flight * 26)}px ${piece.fill})`,
  };
};

const trailStyle = (piece: BrandLogoPiece, progress: number, reducedMotion: boolean): CSSProperties => {
  if (reducedMotion) {
    return { opacity: 0 };
  }

  const flightStart = 0.02 + piece.order * 0.012;
  const movingIn = phase(progress, flightStart, 0.54);
  const movingOut = phase(progress, 0.7, 1);
  const intensity = Math.max(Math.sin(movingIn * Math.PI), Math.sin(movingOut * Math.PI));
  const seed = seedFor(`${piece.id}-trail`);
  const offset = pieceVector(piece, progress > 0.64 ? "out" : "in");
  const incomingWeight = 1 - easeOutCubic(movingIn);
  const stretch = 1.2 + Math.sin(movingIn * Math.PI) * 2.8 + incomingWeight * 1.4;
  const squash = 0.74 - Math.sin(movingIn * Math.PI) * 0.22;

  return {
    opacity: clampProgress(intensity * 0.48),
    transform: `translate3d(calc(${(offset.vw * incomingWeight * 0.22).toFixed(3)}vw + ${(offset.x * 0.1 + seed * 18).toFixed(2)}px), calc(${(offset.vh * incomingWeight * 0.22).toFixed(3)}vh + ${(offset.y * 0.1).toFixed(2)}px), 0) rotate(${(offset.rotate * 0.24).toFixed(2)}deg) skewX(${((seed - 0.5) * 22).toFixed(2)}deg) scale(${stretch.toFixed(3)}, ${squash.toFixed(3)})`,
    filter: `blur(${(14 + incomingWeight * 18).toFixed(2)}px)`,
  };
};

const BrandLogoConstructScene = ({
  className,
  label = "OpenStudio logo construction",
  progress = 0.5,
  showWordmark = false,
  size = "hero",
}: BrandLogoConstructSceneProps) => {
  const reducedMotion = useReducedMotion();
  const clampedProgress = reducedMotion ? 0.5 : clampProgress(progress);
  const assembled = phase(clampedProgress, 0.34, 0.58) * (1 - phase(clampedProgress, 0.7, 1));
  const sortedPieces = useMemo(() => [...BRAND_LOGO_PIECES].sort((a, b) => a.order - b.order), []);

  return (
    <div
      aria-label={label}
      className={cn("brand-logo-construct", `brand-logo-construct--${size}`, className)}
      data-brand-logo-construct
      data-brand-logo-progress={clampedProgress.toFixed(3)}
      role="img"
      style={{ ["--brand-logo-assembled" as string]: assembled.toFixed(3) }}
    >
      <div className="brand-logo-construct__halo" />
      <svg
        aria-hidden="true"
        className="brand-logo-construct__svg"
        viewBox={BRAND_LOGO_VIEW_BOX}
      >
        <g transform="translate(1023.5, 898) scale(1.2) rotate(45) translate(-1023.5, -898)">
          {sortedPieces.map((piece) => (
            <path
              className={cn("brand-logo-construct__trail", `brand-logo-construct__piece--${piece.colorGroup}`)}
              d={piece.d}
              fill={piece.fill}
              key={`${piece.id}-trail`}
              style={trailStyle(piece, clampedProgress, Boolean(reducedMotion))}
            />
          ))}
          {sortedPieces.map((piece) => (
            <path
              className={cn("brand-logo-construct__piece", `brand-logo-construct__piece--${piece.colorGroup}`)}
              d={piece.d}
              fill={piece.fill}
              key={piece.id}
              style={pieceStyle(piece, clampedProgress, Boolean(reducedMotion))}
            />
          ))}
        </g>
      </svg>
      <div className="brand-logo-construct__rings" aria-hidden="true" />
      {showWordmark ? (
        <div className="brand-logo-construct__wordmark">
          <span>OpenStudio</span>
          <small>constructing the production surface</small>
        </div>
      ) : null}
    </div>
  );
};

export default BrandLogoConstructScene;
