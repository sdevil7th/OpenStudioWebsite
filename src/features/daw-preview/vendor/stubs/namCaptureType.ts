// Hand-written stand-in for OpenStudio frontend/src/utils/namCaptureType.ts
// (@ d2056151222fefcede123ef614ec38c6893cbfd5). The picker only needs the
// capture-type union; the upstream helpers read the native catalog types.
export type NAMCaptureType =
  | "amp"
  | "pedal"
  | "pedal_amp"
  | "amp_cab"
  | "amp_pedal_cab"
  | "preamp"
  | "studio"
  | "full_rig"
  | "unknown";
