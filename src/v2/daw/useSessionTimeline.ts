import { type RefObject, useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { loadGsap } from "@/lib/gsap";
import { scheduleAfterInitialLoad } from "@/lib/initialLoad";
import {
  LOOP_RANGE,
  RACK_PARAMS,
  SESSION_LENGTH,
  TRACKS,
  initialState,
  masterLevel,
  staticState,
  trackLevel,
} from "./sessionScript";
import type { SessionState, Transport } from "./types";

/** Total length of one pass of the choreography, in seconds. */
export const SCRIPT_LENGTH = 16;
/** React commits per second while the timeline runs (PeakMeter redraws at 20). */
const COMMIT_FPS = 30;

interface Options {
  /** Element whose visibility gates playback. */
  scope: RefObject<HTMLElement>;
  /** False on stages too small to read; renders the static frame instead. */
  enabled?: boolean;
  /** Delay before the first play press, so the reveal has landed. */
  startDelay?: number;
}

/**
 * Drives one `SessionState` from a looping GSAP timeline. Numeric values are
 * tweened on a proxy, discrete ones are flipped with `.call()`, and every
 * commit derives the meters from the deterministic envelopes in sessionScript
 * so the whole loop is reproducible.
 *
 * Reduced motion (or `enabled: false`) skips GSAP entirely and returns the
 * static mid-song frame.
 */
export const useSessionTimeline = ({ scope, enabled = true, startDelay = 0.8 }: Options): SessionState => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const animate = enabled && !prefersReducedMotion;
  const [state, setState] = useState<SessionState>(() => (animate ? initialState() : staticState()));

  useEffect(() => {
    if (!animate) {
      setState(staticState());
      return;
    }

    const element = scope.current;
    if (!element) return;

    let active = true;
    let timeline: { kill: () => void; pause: () => void; play: () => void; paused: () => boolean } | undefined;
    let visible = true;
    let pageVisible = document.visibilityState !== "hidden";

    const rest = initialState();
    const proxy = {
      time: 0,
      namFader: rest.tracks[2].volumeDb,
      guitarPan: rest.tracks[1].pan,
      drive: RACK_PARAMS[1].value,
      tone: RACK_PARAMS[2].value,
      gain: RACK_PARAMS[0].value,
    };
    const flags = { transport: "stopped" as Transport, loop: false, vocalSolo: false };
    let lastCommit = 0;

    const commit = (force = false) => {
      const now = performance.now();
      if (!force && now - lastCommit < 1000 / COMMIT_FPS) return;
      lastCommit = now;
      const { transport } = flags;
      const time = proxy.time;
      const tracks = rest.tracks.map((track, index) => {
        const soloed = index === 0 && flags.vocalSolo;
        const silenced = flags.vocalSolo && index !== 0;
        return {
          ...track,
          volumeDb: index === 2 ? proxy.namFader : track.volumeDb,
          pan: index === 1 ? proxy.guitarPan : track.pan,
          soloed,
          level: silenced ? 0 : trackLevel(index, time, transport),
        };
      });
      const master = flags.vocalSolo ? tracks[0].level * 0.7 : masterLevel(time, transport);
      setState({
        ...rest,
        time,
        transport,
        loop: flags.loop,
        tracks,
        master: { volumeDb: 0, level: master, clipping: false },
        knobs: { ...rest.knobs, inputGain: proxy.gain, drive: proxy.drive, tone: proxy.tone },
      });
    };

    const syncPlayback = () => {
      if (!timeline) return;
      const shouldPlay = visible && pageVisible;
      if (shouldPlay && timeline.paused()) timeline.play();
      else if (!shouldPlay && !timeline.paused()) timeline.pause();
    };

    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              visible = entries.some((entry) => entry.isIntersecting);
              syncPlayback();
            },
            { threshold: 0.05 },
          )
        : undefined;
    observer?.observe(element);

    const onVisibility = () => {
      pageVisible = document.visibilityState !== "hidden";
      syncPlayback();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const cancelSchedule = scheduleAfterInitialLoad(
      () => {
        void loadGsap().then(({ gsap }) => {
          if (!active) return;

          const tl = gsap.timeline({
            repeat: -1,
            paused: true,
            defaults: { ease: "power2.inOut" },
            onUpdate: () => commit(),
            onRepeat: () => commit(true),
          });
          const t0 = startDelay;
          const stopAt = t0 + SESSION_LENGTH;

          tl.call(() => {
            flags.transport = "playing";
          }, [], t0)
            .to(proxy, { time: SESSION_LENGTH, duration: SESSION_LENGTH, ease: "none" }, t0)
            // Ride the NAM Guitar fader up for the chorus.
            .to(proxy, { namFader: 1.8, duration: 2.2 }, t0 + 1.8)
            // Dial in the rig.
            .to(proxy, { drive: 6.8, duration: 1.8 }, t0 + 3.4)
            .to(proxy, { tone: 6.4, duration: 1.2 }, t0 + 4.8)
            // Solo the vocal to check the take, then release.
            .call(() => {
              flags.vocalSolo = true;
            }, [], t0 + 6.1)
            .call(() => {
              flags.vocalSolo = false;
            }, [], t0 + 7.9)
            // Pan the DI a little wider.
            .to(proxy, { guitarPan: -0.45, duration: 1.4 }, t0 + 8.4)
            // Loop the chorus.
            .call(() => {
              flags.loop = true;
            }, [], t0 + 9.3)
            // Stop.
            .call(() => {
              flags.transport = "stopped";
            }, [], stopAt)
            // Return to top and reset the session for the next pass.
            .call(() => {
              flags.loop = false;
            }, [], stopAt + 0.8)
            .to(
              proxy,
              {
                time: 0,
                namFader: rest.tracks[2].volumeDb,
                guitarPan: rest.tracks[1].pan,
                drive: RACK_PARAMS[1].value,
                tone: RACK_PARAMS[2].value,
                duration: 0.9,
                ease: "power3.inOut",
              },
              stopAt + 0.8,
            )
            .set({}, {}, SCRIPT_LENGTH);

          timeline = tl;
          commit(true);
          syncPlayback();
        });
      },
      { delay: 400, timeout: 2000 },
    );

    return () => {
      active = false;
      cancelSchedule();
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      timeline?.kill();
    };
  }, [animate, scope, startDelay]);

  return state;
};

export { LOOP_RANGE, TRACKS };
