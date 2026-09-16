import { REPO, TONE3000_URL } from "@/data/siteContent";
import { SITE_PATHS } from "@/constants/routes";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-09-16",
  appReference: { commit: "7f59cff", channel: "development" },
  blocks: [
    {
      type: "p",
      text: "Short answers to the questions that come up before and just after installing, each with a link to the page that has the detail.",
    },

    {
      type: "h2",
      id: "is-openstudio-really-free",
      text: "Is OpenStudio really free, and what does AGPLv3 mean for me?",
    },
    {
      type: "p",
      text: "Yes. No paid tier, no trial, no license key, no account. The NAM Rack and every built-in effect ship in the base app with nothing to unlock. The source is published under the GNU Affero General Public License v3; the NAM core it uses is MIT-licensed.",
    },
    {
      type: "p",
      text: `The app’s license does not by itself put your recordings under AGPLv3; third-party content and models have their own terms. Distributing a modified app, or letting others use it over a network, carries corresponding-source obligations under AGPLv3. Full text: the [LICENSE file](${REPO.license}); plain summary: the [terms page](${SITE_PATHS.terms}).`,
    },

    { type: "h2", id: "which-platforms", text: "Which platforms does it run on?" },
    {
      type: "ul",
      items: [
        "Windows 10 or later, 64-bit, as an installer that also handles WebView2 and the VC++ redistributable.",
        "macOS 12 Monterey or later, as a DMG.",
        "x86-64 Linux as an AppImage; the release pipeline builds on Ubuntu 24.04.",
      ],
    },
    {
      type: "p",
      text: `Drivers: ASIO, WASAPI, or DirectSound on Windows; CoreAudio on macOS; ALSA or JACK on Linux. Plan on 8 GB of RAM. The [download page](${SITE_PATHS.download}) has the current builds and requirements table.`,
    },

    { type: "h2", id: "why-does-the-installer-warn", text: "Why does the installer warn me?" },
    {
      type: "p",
      text: "Signing and notarization depend on the build. SmartScreen on Windows or Gatekeeper on macOS may warn or block first launch. On Windows choose **More info** → **Run anyway**; on macOS right-click the app, choose **Open**, and allow it under **System Settings → Privacy & Security** if asked. Most Linux distributions run the AppImage without extra steps.",
    },
    {
      type: "p",
      text: `That path is documented, not warning-free. Download only from openstudio.org.in or the official [GitHub releases](${REPO.releases}), and compare the SHA-256 on the [download page](${SITE_PATHS.download}) to check file integrity.`,
    },

    { type: "h2", id: "which-plugin-formats", text: "Which plugin formats work, and how well?" },
    {
      type: "p",
      text: "VST3 is the stable, primary path for effects and instruments. CLAP and LV2 code paths are present where the format is available, but compatibility varies more by plugin; bringing CLAP instrument and event handling up to the VST3 standard is on the roadmap.",
    },
    {
      type: "callout",
      tone: "warn",
      label: "32-bit bridge",
      text: `32-bit plugin hosting is not a supported workflow. Use 64-bit native plugins. See [Plugins & scanning](${SITE_PATHS.docs}/plugins-and-scanning).`,
    },

    { type: "h2", id: "does-it-bundle-captures-or-irs", text: "Does it bundle amp captures or cabinet IRs?" },
    {
      type: "p",
      text: `No. The NAM Rack engine is in the base app, but third-party captures and impulse responses keep their creators' licenses and are distributed separately. Load your own \`.nam\` files and IRs, or connect the optional [TONE3000](${TONE3000_URL}) catalog. A roadmap guardrail rules out bundling third-party captures or IRs without clear redistribution permission.`,
    },

    { type: "h2", id: "do-i-need-an-account", text: "Do I need an account?" },
    {
      type: "p",
      text: "Core recording and editing need no account. Gated Stable Audio downloads require Hugging Face access and licence approval. TONE3000 is another optional service: its connected catalog uses a TONE3000 account through a browser-based OAuth sign-in, with tokens kept in the OS credential store. Local capture loading never depends on it, and the app stays usable when the service is unavailable.",
    },
    {
      type: "callout",
      tone: "note",
      label: "Partner approval",
      text: `Enabling the connected catalog in a public release is gated on written TONE3000 approval for that release candidate. Setup is in [NAM Rack setup](${SITE_PATHS.docs}/nam-rack-setup).`,
    },

    { type: "h2", id: "is-ai-required", text: "Is AI required, and does it run locally?" },
    {
      type: "p",
      text: "AI is optional and never blocks startup. Stem separation, text-to-music, and text-to-audio install on demand through **AI Tools Setup**, which prepares a managed local Python runtime and model assets. Once the files are validated, processing runs on your machine and works offline.",
    },
    {
      type: "p",
      text: `The bundled Basic Pitch model for audio-to-MIDI needs ONNX Runtime, provisioned on Windows and Linux only. Generation results depend on your hardware, RAM, and VRAM; upstream gives no fixed minimum. Guided setup downloads Stable Audio 3 Medium after Hugging Face licence approval, and MiniMax Music 3 after licence acceptance. Local snapshot import remains optional. See [AI Tools setup](${SITE_PATHS.docs}/ai-runtime-setup).`,
    },

    { type: "h2", id: "what-project-format", text: "What is the project file format?" },
    {
      type: "p",
      text: "Projects save as `.osproj`; retired project formats require conversion and cannot be opened by renaming the file. Back up projects and keep the older app for unconverted sessions. The file holds tracks, clip references, MIDI data, automation, markers, the tempo map, mixer and plugin state, and settings. Audio stays outside the project and is referenced by path. To move a session, copy its project and media files, including any NAM captures and IRs. **File → Archive Session…** has portability limits; see [Rendering & export](/docs/rendering-and-export#project-tools).",
    },

    { type: "h2", id: "can-i-import-reaper-or-ableton-projects", text: "Can I import REAPER or Ableton projects?" },
    {
      type: "p",
      text: "Not currently. REAPER `.rpp`, Ableton Live `.als`, and AAF import are not available as supported project workflows. RPP and EDL export are not available from the app either. Export stems from the other DAW and import the audio.",
    },

    { type: "h2", id: "what-export-formats", text: "What can I export?" },
    {
      type: "p",
      text: "WAV, AIFF, and FLAC with selectable bit depth; MP3 and OGG Vorbis through FFmpeg; MIDI; and DDP. Master, per-track stems, region ranges, and a render queue are available. FFmpeg is bundled on Windows; on macOS and Linux, MP3 and OGG export need a system `ffmpeg` on your `PATH`.",
    },
    {
      type: "callout",
      tone: "warn",
      label: "Placeholder controls",
      text: `Selected-item rendering is supported for selected audio clips. Resample Quality remains disabled; Metadata entry and Online render are not offered in the current dialog. Details in [Rendering & export](${SITE_PATHS.docs}/rendering-and-export).`,
    },

    { type: "h2", id: "does-it-phone-home", text: "Does it phone home?" },
    {
      type: "p",
      text: "The app requests release metadata from openstudio.org.in to find newer builds; **Help → Check for Updates…** triggers the same check. Those requests fetch version and download information and are not intended to send personal identity information. Projects, audio, presets, and exports stay on your device, and the optional AI tools process audio locally.",
    },
    {
      type: "p",
      text: `Optional connected features contact TONE3000 for its catalogue and downloads, GitHub for releases and runtime assets, and model hosts such as Hugging Face during AI setup. Gated models may need a provider account and access approval. The desktop app has no advertising or marketing vendors. The [privacy page](${SITE_PATHS.privacy}) is the full statement.`,
    },

    { type: "h2", id: "where-do-i-report-bugs", text: "Where do I report bugs or contribute?" },
    {
      type: "p",
      text: `Open an issue on [GitHub](${REPO.issues}) with your OS, OpenStudio version, and steps to reproduce. Code and documentation changes go through pull requests on the [repository](${REPO.url}); the [community page](${SITE_PATHS.community}) lists good first issues. Security problems go by email, not a public issue; see the [security page](${SITE_PATHS.security}).`,
    },

    { type: "h2", id: "where-is-the-roadmap", text: "Where is the roadmap?" },
    {
      type: "p",
      text: `On the [roadmap page](${SITE_PATHS.roadmap}), mirrored from [roadmap.md](${REPO.roadmapDoc}) upstream. It describes direction, not dates: release quality now, DAW foundations next (MIDI workflows, CLAP parity, render options), and a local DAW assistant among the items under exploration.`,
    },

    { type: "h2", id: "what-is-not-planned", text: "What is not planned?" },
    {
      type: "p",
      text: "The roadmap's product guardrails rule out:",
    },
    {
      type: "ul",
      items: [
        "Bundling third-party NAM captures or cabinet IRs without clear redistribution permission.",
        "Presenting automated measurements as proof of subjective tone, naturalness, or commercial-product parity.",
        "Exposing experimental controls as working features before their full signal path, persistence, and tests exist.",
        "Bringing back retired NAM Rack controls or decorative routing without a new product decision and full QA.",
      ],
    },
    {
      type: "p",
      text: `A native extension SDK is only under exploration, conditional on demand for a stable ABI; Lua and JSFX remain the supported extension paths. See [Lua scripting](${SITE_PATHS.docs}/lua-scripting).`,
    },
  ],
};

export default doc;
