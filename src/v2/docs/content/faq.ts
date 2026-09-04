import { REPO, TONE3000_URL, V2_PATHS } from "../../content";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-09-04",
  blocks: [
    {
      type: "p",
      text: "Short answers to the questions that come up before and just after installing, each with a link to the page that has the detail.",
    },

    { type: "h2", id: "is-openstudio-really-free", text: "Is OpenStudio really free, and what does AGPLv3 mean for me?" },
    {
      type: "p",
      text: "Yes. No paid tier, no trial, no license key, no account. The NAM Rack and every built-in effect ship in the base app with nothing to unlock. The source is published under the GNU Affero General Public License v3; the NAM core it uses is MIT-licensed.",
    },
    {
      type: "p",
      text: `The license covers the software, not what you produce with it, so commercial releases made in OpenStudio are yours. If you modify OpenStudio and distribute your version, or run a modified version for others over a network, you must publish your changes under AGPLv3. Full text: the [LICENSE file](${REPO.license}); plain summary: the [terms page](${V2_PATHS.terms}).`,
    },

    { type: "h2", id: "which-platforms", text: "Which platforms does it run on?" },
    {
      type: "ul",
      items: [
        "Windows 10 or later, 64-bit, as an installer that also handles WebView2 and the VC++ redistributable.",
        "macOS 12 Monterey or later, as an unsigned DMG.",
        "x86-64 Linux as an AppImage, tested on Ubuntu 22.04 and later.",
      ],
    },
    {
      type: "p",
      text: `Drivers: ASIO, WASAPI, or DirectSound on Windows; CoreAudio on macOS; ALSA or JACK on Linux. Plan on 8 GB of RAM. The [download page](${V2_PATHS.download}) has the current builds and requirements table.`,
    },

    { type: "h2", id: "why-does-the-installer-warn", text: "Why does the installer warn me?" },
    {
      type: "p",
      text: "Builds are unsigned, so SmartScreen on Windows and Gatekeeper on macOS warn on first launch. On Windows choose **More info** → **Run anyway**; on macOS right-click the app, choose **Open**, and allow it under **System Settings → Privacy & Security** if asked. Most Linux distributions run the AppImage without extra steps.",
    },
    {
      type: "p",
      text: `That path is documented, not warning-free. Download only from openstudio.org.in or the official [GitHub releases](${REPO.releases}), and compare the SHA-256 on the [download page](${V2_PATHS.download}) if you want certainty.`,
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
      text: `**Options → Toggle 32-bit Plugin Bridge** is experimental. The supported path is 64-bit native hosting. See [Plugins & scanning](${V2_PATHS.docs}/plugins-and-scanning).`,
    },

    { type: "h2", id: "does-it-bundle-captures-or-irs", text: "Does it bundle amp captures or cabinet IRs?" },
    {
      type: "p",
      text: `No. The NAM Rack engine is in the base app, but third-party captures and impulse responses keep their creators' licenses and are distributed separately. Load your own \`.nam\` files and IRs, or connect the optional [TONE3000](${TONE3000_URL}) catalog. A roadmap guardrail rules out bundling third-party captures or IRs without clear redistribution permission.`,
    },

    { type: "h2", id: "do-i-need-an-account", text: "Do I need an account?" },
    {
      type: "p",
      text: "No. The one optional exception is TONE3000: its connected catalog uses a TONE3000 account through a browser-based OAuth sign-in, with tokens kept in the OS credential store. Local capture loading never depends on it, and the app stays usable when the service is unavailable.",
    },
    {
      type: "callout",
      tone: "note",
      label: "Partner approval",
      text: `Enabling the connected catalog in a public release is gated on written TONE3000 approval for that release candidate. Setup is in [NAM Rack setup](${V2_PATHS.docs}/nam-rack-setup).`,
    },

    { type: "h2", id: "is-ai-required", text: "Is AI required, and does it run locally?" },
    {
      type: "p",
      text: "AI is optional and never blocks startup. Stem separation, text-to-music, and text-to-audio install on demand through **AI Tools Setup**, which prepares a managed local Python runtime and model assets. Once the files are validated, processing runs on your machine and works offline.",
    },
    {
      type: "p",
      text: `The bundled Basic Pitch model for audio-to-MIDI needs ONNX Runtime, provisioned on Windows and Linux only. Generation results depend on your hardware, RAM, and VRAM; upstream gives no fixed minimum. Stable Audio 3 Medium is license-gated and needs a separate snapshot import. See [AI Tools setup](${V2_PATHS.docs}/ai-runtime-setup).`,
    },

    { type: "h2", id: "what-project-format", text: "What is the project file format?" },
    {
      type: "p",
      text: "Projects save as `.osproj`; legacy `.s13` files still open. The file holds tracks, clip references, MIDI data, automation, markers, the tempo map, mixer and plugin state, and settings. Audio stays outside the project and is referenced by path. To move a session, use **File → Archive Session…**, which copies every referenced media file alongside the project.",
    },

    { type: "h2", id: "can-i-import-reaper-or-ableton-projects", text: "Can I import REAPER or Ableton projects?" },
    {
      type: "p",
      text: "REAPER: yes. OpenStudio imports `.rpp` and exports RPP and EDL. Ableton Live: no, there is no `.als` import. AAF import is stubbed and should not be counted on. For anything else, export stems from the other DAW and import the audio.",
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
      text: `The render dialog shows metadata fields, an online render option, and selected-item sources that are not yet wired. Details in [Rendering & export](${V2_PATHS.docs}/rendering-and-export).`,
    },

    { type: "h2", id: "does-it-phone-home", text: "Does it phone home?" },
    {
      type: "p",
      text: "The app requests release metadata from openstudio.org.in to find newer builds; **Help → Check for Updates…** triggers the same check. Those requests fetch version and download information and are not intended to send personal identity information. Projects, audio, presets, and exports stay on your device, and the optional AI tools process audio locally.",
    },
    {
      type: "p",
      text: `TONE3000 and GitHub are contacted only when you sign in or fetch release assets. The desktop app has no advertising or marketing vendors. The [privacy page](${V2_PATHS.privacy}) is the full statement.`,
    },

    { type: "h2", id: "where-do-i-report-bugs", text: "Where do I report bugs or contribute?" },
    {
      type: "p",
      text: `Open an issue on [GitHub](${REPO.issues}) with your OS, OpenStudio version, and steps to reproduce. Code and documentation changes go through pull requests on the [repository](${REPO.url}); the [community page](${V2_PATHS.community}) lists good first issues. Security problems go by email, not a public issue; see the [security page](${V2_PATHS.security}).`,
    },

    { type: "h2", id: "where-is-the-roadmap", text: "Where is the roadmap?" },
    {
      type: "p",
      text: `On the [roadmap page](${V2_PATHS.roadmap}), mirrored from [roadmap.md](${REPO.roadmapDoc}) upstream. It describes direction, not dates: release quality now, DAW foundations next (MIDI workflows, CLAP parity, render options), and a local DAW assistant among the items under exploration.`,
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
      text: `A native extension SDK is only under exploration, conditional on demand for a stable ABI; Lua and JSFX remain the supported extension paths. See [Lua scripting](${V2_PATHS.docs}/lua-scripting).`,
    },
  ],
};

export default doc;
