import { REPO } from "@/data/siteContent";
import { SITE_PATHS } from "@/constants/routes";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-09-16",
  appReference: { commit: "7f59cff", channel: "development" },
  blocks: [
    {
      type: "p",
      text: `Everything on this page lives in one dialog: **View → Audio Settings…**, also reachable from the gear icon in the main toolbar. Get the driver, sample rate, and buffer size right once and most latency and crackle problems never appear. Shortcuts follow the OpenStudio default keyboard profile.`,
    },

    { type: "h2", id: "interfaces-and-drivers", text: "Interfaces and drivers" },
    {
      type: "p",
      text: "OpenStudio lists the audio devices available through the selected driver backend; compatibility depends on the interface and driver. The number of inputs you can pick on a track header comes straight from the interface's channel count. What matters more than the interface is the driver path you choose in **Audio System**.",
    },
    {
      type: "kv",
      rows: [
        [
          "Windows",
          "**ASIO** if your interface ships a driver, and strongly recommended for recording and low-latency monitoring. **WASAPI** is built into Windows and is the fallback. **DirectSound** works but adds latency.",
        ],
        [
          "macOS",
          "CoreAudio, using your interface or the built-in output. There is no separate driver to install for class-compliant devices.",
        ],
        [
          "Linux",
          "ALSA or JACK, depending on your audio setup. The release pipeline builds on Ubuntu 24.04.",
        ],
      ],
    },
    {
      type: "table",
      head: ["Windows driver type", "What it is"],
      rows: [
        ["ASIO", "Low-latency professional audio drivers, supplied by the interface vendor"],
        ["WASAPI", "Windows Audio Session API, built into Windows 10 and later"],
        ["DirectSound", "Legacy Windows audio, higher latency"],
      ],
    },
    {
      type: "p",
      text: "ASIO is an optional dependency: OpenStudio launches without it and falls back to the system paths, so a missing vendor driver never stops the app from starting.",
    },

    { type: "h2", id: "choosing-settings", text: "Choosing the settings" },
    {
      type: "ol",
      items: [
        "Open **View → Audio Settings…**.",
        "Pick an **Audio System**. On Windows choose ASIO where you can.",
        "With ASIO, pick the **ASIO Driver**. With WASAPI or DirectSound, pick an **Input Device** and an **Output Device** separately.",
        "Choose a **Sample Rate**. 44100 Hz and 48000 Hz are standard; use whatever your interface runs at natively.",
        "Set a **Buffer Size**. 256 or 512 samples is the right starting point.",
        "Click **Apply** to activate the settings.",
      ],
    },
    {
      type: "p",
      text: "The audio device sample rate controls recording and playback. Imported files can keep their original rate; playback converts them in real time using linear interpolation. Offline rendering can target a different rate from the render dialog.",
    },

    { type: "h2", id: "buffer-size-and-latency", text: "Buffer size and latency" },
    {
      type: "p",
      text: "The buffer is how much audio the engine processes per callback. A smaller buffer means the sound reaches your ears sooner and the CPU has less time to do the work; a larger buffer is safer and later. Monitoring latency also depends on sample rate, the driver and interface, and latency introduced by plugins. Choose and test the buffer before recording.",
    },
    {
      type: "table",
      head: ["Buffer", "Use it when"],
      rows: [
        ["128", "Lowest monitoring latency; only if the machine keeps up without crackle"],
        ["256", "The starting point for recording sessions"],
        ["512", "A safe starting point on a busier project, or the first step up when 256 crackles"],
        ["1024", "Sessions with many tracks and plugins where monitoring latency does not matter"],
      ],
    },
    {
      type: "p",
      text: "The pattern that works: record at 128 or 256, then raise the buffer to 512 or 1024 once the tracking is done and the plugin count grows. Freezing heavy tracks (right-click → **Freeze Track**) is the other lever when a small buffer starts to crackle.",
    },

    { type: "h2", id: "input-monitoring", text: "Input monitoring" },
    {
      type: "p",
      text: "Arm a track and toggle **Monitor** on its header to hear the live input. The signal passes through the track's full chain, input FX and track FX included, before it reaches the output, which is what lets you hear a NAM Rack tone or a compressor while you play. Monitoring latency also includes driver buffering, interface conversion, and any plugin latency.",
    },
    {
      type: "p",
      text: "Set the buffer before you record, not after. Leave headroom when setting input levels and aim for peaks around −12 to −6 dB on the track meter.",
    },

    { type: "h2", id: "macos-microphone-permission", text: "macOS microphone permission" },
    {
      type: "p",
      text: "macOS gates every audio input, including USB and Thunderbolt interfaces, behind the **Microphone** privacy permission. If access was denied, the device still appears in Audio Settings but every recorded sample is silent.",
    },
    {
      type: "ol",
      items: [
        "Quit OpenStudio.",
        "Open **System Settings → Privacy & Security → Microphone** and enable OpenStudio.",
        "Reopen OpenStudio, select the input device again, arm a track, and check the input meter.",
      ],
    },
    {
      type: "p",
      text: "If OpenStudio is missing from that list or the stored decision seems stuck, reset the permission for the installed bundle only. Adjust the path if the app is not in Applications, then relaunch and click **Allow** when asked.",
    },
    {
      type: "code",
      lang: "bash",
      code: 'bundle_id="$(defaults read /Applications/OpenStudio.app/Contents/Info CFBundleIdentifier)"\ntccutil reset Microphone "$bundle_id"',
    },
    {
      type: "callout",
      tone: "warn",
      label: "Scope the reset",
      text: "A bare `tccutil reset Microphone` clears the permission for every application on the machine. Keep the bundle identifier unless that is what you want.",
    },

    { type: "h2", id: "fixing-latency-and-crackle", text: "Fixing latency and crackle" },
    {
      type: "p",
      text: "Latency and crackle pull in opposite directions on the same control, so treat them together. Too late to play against: go smaller. Pops and clicks: go bigger.",
    },
    {
      type: "table",
      head: ["Symptom", "Try, in order"],
      rows: [
        [
          "Noticeable delay between playing and hearing it",
          "Switch to ASIO on Windows; lower the buffer to 128 or 256; close other audio apps competing for the device; if that crackles, step the buffer back up until it is stable",
        ],
        [
          "Pops, clicks, or crackle during playback or recording",
          "Raise the buffer to 512 or 1024; freeze CPU-heavy tracks; reduce active plugins; close background apps; update the interface driver",
        ],
        [
          "Playback shows Playing but nothing is heard",
          "Confirm the output device in Audio Settings; check the interface is on; check mute, solo, and master volume; on ASIO make sure no other app holds the driver exclusively",
        ],
      ],
    },
    {
      type: "p",
      text: `The NAM Rack's own click and noise behaviour at small buffers is still listed as a release audition item upstream, so if the rack crackles at 128 where a plain track does not, that is worth reporting on [the issue tracker](${REPO.issues}) rather than a setting to fight. More symptoms are indexed in [Troubleshooting](${SITE_PATHS.docs}/troubleshooting).`,
    },

    { type: "h2", id: "signal-flow", text: "Signal flow" },
    {
      type: "p",
      text: "Knowing where in the chain each stage sits explains most surprises: why an input EQ ignores fader automation, why a post-fader send drops with the fader, why the master FX chain sees everything.",
    },
    {
      type: "code",
      lang: "text",
      code: "Audio input -> Input FX -> Track FX -> pre-fader send tap\n                                      |\n                              Track fader and pan\n                                      |\n                               post-fader send tap\n                                      |\n                          Track output / routed bus\n                                      |\n                           Master FX -> Master output",
    },
    {
      type: "ul",
      items: [
        "Input FX run before the fader, so fader automation does not affect them.",
        "Track insert FX run before the channel fader.",
        "Sends are pre-fader (independent of the fader) or post-fader (follow it), per send.",
        "The master bus receives the tracks and buses routed to it.",
      ],
    },
    {
      type: "p",
      text: `Sends, buses, and the routing matrix are covered in [Mixing & routing](${SITE_PATHS.docs}/mixing-and-routing).`,
    },
  ],
};

export default doc;
