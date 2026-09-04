export type Transport = "stopped" | "playing" | "recording";

export interface TrackState {
  /** Fader position in dB, -60 … +12 (OpenStudio's extended scale). */
  volumeDb: number;
  /** -1 (L) … +1 (R). */
  pan: number;
  muted: boolean;
  soloed: boolean;
  armed: boolean;
  /** Linear peak level fed to PeakMeter (1.0 = 0 dBFS). */
  level: number;
}

export interface SessionState {
  /** Playhead position in seconds. */
  time: number;
  transport: Transport;
  loop: boolean;
  tracks: TrackState[];
  master: { volumeDb: number; level: number; clipping: boolean };
  /** NAM Rack knob values keyed by param id (see RACK_PARAMS). */
  knobs: Record<string, number>;
  rackPower: boolean;
  selectedTrack: number;
  snap: boolean;
}
