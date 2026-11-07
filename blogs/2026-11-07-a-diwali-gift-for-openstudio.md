# A Diwali gift for the OpenStudio community

*Smoother recording, more thoughtful editing, AI that makes better use of your machine, and a calmer way to get help. Here’s what we’ve been working on for OpenStudio this Diwali.*

There is a particular kind of interruption that every musician knows: you have the part in your head, your hands are ready, and the software needs your attention for something else. A waveform stops keeping up. A shortcut seems to have forgotten which window you were using. An export fails over a dependency you have never heard of.

Over the past few weeks, we’ve been spending time on those moments. Some changes add new ways to work; others fix things that should have felt dependable already. With Diwali here, we’d like to share that work as a gift to the community building songs, guitar tones, experiments and whole sessions in OpenStudio.

**A quick note on availability:** this is a preview of the **unpublished 0.1.09 candidate**, reviewed on **7 November 2026** in [app PR #37](https://github.com/sdevil7th/OpenStudio/pull/37), at [commit 1069786f](https://github.com/sdevil7th/OpenStudio/commit/1069786f2a55fdcf451b7d5b2327a73fe124fb83). These changes are being prepared for release; the current download or Store build may not contain them yet.

## Giving a recording room to breathe

Pressing Record asks the computer to do several things at once: prepare files, start capturing, play the arrangement and keep the screen useful. We’ve moved recording-storage preparation ahead of capture and reduced repeated work when the audio interface delivers very small blocks. You can also cancel recording preparation with Record or Stop before the take begins.

The waveform display has received attention too. It keeps refreshing as you scroll and zoom during a take, and the timeline spends less effort drawing material outside the visible area. Zoom to Full Project includes the current recording extent within the available zoom limits. A wide view has fewer crowded ruler labels while retaining the same snap resolution.

For developers, the interesting constraint is the audio callback: it has to finish before the next block arrives. Preparing storage earlier, avoiding a disk-thread wake-up from every recording callback, and compiling optional profiling out of ordinary builds all reduce work along that path. NAM cabinet processing is now prepared for the actual device block size too.

This work does **not** make an eight-sample buffer safe for every session. Our strict test with a loaded project and a game competing for resources still misses its deadlines. Keep using the buffer size that works reliably with your interface and project; the [candidate notes](https://github.com/sdevil7th/OpenStudio/blob/1069786f2a55fdcf451b7d5b2327a73fe124fb83/docs/releases/0.1.09.md) retain that limitation.

## Editing that lets you keep your train of thought

Two overlapping takes can now have a linked crossfade that you can reopen, reshape or remove. The clips stay separate, and their manual fades and gain envelopes still matter. Splitting a member of that crossfade no longer means losing the connection to its editor.

There’s also tempo detection for audio and MIDI clips. It proposes candidates, including those familiar half-time and double-time possibilities, and lets you audition a short preview with a click before changing the project tempo. Apply is undoable. A loose performance can still confuse detection, so listening and manual beat counting remain useful.

Smaller details help explain what an edit will do. The blue range calls itself **Time selection** and offers clear, select-clips and loop controls. Copy and Slip feedback follow the active mouse profile. Clicking a clip should preserve its placement, and trim gestures should finish when you release the mouse, even if the engine is catching up.

We’ve updated the [recording and editing guide](/docs/recording-and-editing) with the practical steps, including the fact that tempo previews use the system/WebView output, which may differ from your ASIO device.

## Fewer chores between an idea and an arrangement

If you’ve recorded a MIDI phrase in pieces, **Join Selected MIDI Clips** brings same-track clips together while preserving note identity, mute state and note releases. If you simply want to send the parts elsewhere, **Export Selected MIDI Clips** writes the selection into one MIDI file, with separate tracks for its source tracks and the relative gaps intact. Joining first is unnecessary.

In the default OpenStudio timeline profile, Join uses **Ctrl+J** on Windows/Linux or **Cmd+J** on macOS; **Shift+X** creates crossfades between selected overlapping audio clips. Selected MIDI export has no default shortcut, but you can assign one. Your chosen profile and focused editor still determine the effective keys; the [shortcut guide](/docs/keyboard-shortcuts) explains those differences.

The mixer now lets you type an exact dB level into a track or master readout. Enter applies it, Escape cancels, and `-inf` sets silence. Its height is adjustable, and finishing a pointer resize returns keyboard context to the editor you were using. Saved MIDI device names also remain visible when a controller is unavailable, rather than quietly becoming a different route.

## The fixes you may only notice when they’re missing

Mixed sample rates are normal in a real project. OpenStudio still keeps original sources by default, but you can now request a high-quality copy at the project rate, either for an existing clip or as an import preference. Originals remain available, the clip keeps its timing and fades, and the source replacement supports Undo.

OGG export now uses the built-in Vorbis encoder. That removes its dependence on a particular FFmpeg build having the optional encoder installed. Some other operations, including final sample-rate conversion, still use FFmpeg; we’ve corrected the [export guide](/docs/rendering-and-export) accordingly.

A neutral EQ band now retains exact unity coefficients, preventing tiny recursive rounding residuals on affected platforms. The detached pitch editor also waits until its canvas is actually ready before acknowledging that it has opened. That replaces a fragile assumption about how quickly a window should render, especially when reopening a hidden or slower view.

## AI that pays attention to the rest of your computer

Local AI shares your RAM and GPU memory with everything else you’re doing. ACE-Step, Stable Audio and MiniMax now plan where model components live around available memory. Keeping more on the GPU can help speed; moving work through system memory or temporary disk can make a request fit, at the cost of more waiting. The app can release an idle generation worker, and model switches retire the previous worker before starting the next.

Stem separation has a more useful recovery path. Automatic processing can choose CPU when the model cannot run on the available GPU backend. A confirmed GPU out-of-memory failure gets one CPU retry after the failed worker exits. Longer recordings can use bounded output memory and temporary disk on supported Windows/Linux configurations. An older installation can be repaired through **AI Tools Setup → Repair Stem Separation** while keeping downloaded models.

Successful stems retain the source clip’s trim and timeline position and arrive as one undoable edit. Cancelled or incomplete results don’t leave a collection of partial tracks behind.

There are optional acceleration and lower-memory settings for specific tested configurations too. They remain explicit choices: reduced precision can change audio, and disk offloading can be slow. Our [hardware report](https://github.com/sdevil7th/OpenStudio/blob/1069786f2a55fdcf451b7d5b2327a73fe124fb83/docs/ai-optimization-qualification-2026-11-06.md) records the machines and workloads actually exercised. The [AI setup guide](/docs/ai-runtime-setup) translates the controls into everyday use.

## Help that starts when you ask for it

Explaining an intermittent problem is frustrating. **OpenStudio Support** is a separate companion for Windows, macOS and Linux that can collect existing diagnostic evidence or inspect an audio/MIDI export, then create a local ZIP for you to review and share.

Close the DAW, open Support from its installed launcher, choose an operation, review the output, and create the ZIP when you’re ready. Nothing uploads automatically. Redaction is best effort, so reviewing the files matters; optional crash dumps can contain private information.

Support stays out of a running music session. It starts explicitly, and collection happens with OpenStudio closed. For developers investigating an incident, matching build identities and symbol archives help connect evidence to the right binary. Missing evidence remains unknown rather than being reported as a clean bill of health. The [troubleshooting guide](/docs/troubleshooting#offline-support) now walks through the companion.

## A little more light, and more music

Alongside these changes, we’ve been checking candidate installers on Windows, macOS and Linux and preparing Snap delivery. Package tests, Store approval and publication are separate steps; a prepared candidate does not mean a new Store release is available.

We’re grateful to everyone who sends a reproducible bug, tries a difficult session, or explains where a control broke their flow. Those details have shaped this work. We hope the next release gives you more time to follow an idea while it’s still fresh.

Happy Diwali from OpenStudio. Here’s to the music you’ll make next.
