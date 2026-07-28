# Building a Free NAM Guitar Rig Inside OpenStudio

*OpenStudio now includes a complete, free NAM guitar rig inside the DAW: A1 and A2 captures, native pre- and post-effects, cabinet IRs, TONE3000 access, tuning, presets, project recall, and offline rendering.*

OpenStudio’s NAM Rack is built for the full guitar workflow. Plug in, tune, choose a capture, shape the front and back of the amp, record, and reopen the project with the same tone intact. This is not a model loader bolted onto OpenStudio; the rack belongs to the DAW’s audio engine, automation, project state, and render path.

There is no paid NAM Rack tier or subscription. Local captures and IRs work without an account. A TONE3000 account is required only when connecting to TONE3000, and every third-party capture or IR keeps its creator’s license.

You can explore the complete workflow in the [NAM Rack feature chapter](/features#nam-rack), or [download OpenStudio](/download) when you are ready to try it.

## One rack, one recording workflow

The main rack keeps the input and output meters, gate, tuner, A/B comparison, presets, section navigation, amp capture, and library controls in one workspace. The amp panel uses familiar Gain, Bass, Mid, Treble, Presence, and Level controls around the selected NAM capture. It keeps the capture name and amp-only or full-rig cabinet state visible, while architecture, creator, and license details remain available in the Capture Library.

[![OpenStudio NAM Rack amp and capture overview](/assets/blogs/nam-rack-overview.webp)](/assets/blogs/nam-rack-overview.webp)

*The amp view keeps capture selection, A/B comparison, input and output metering, capture details, and the main tone controls in one place. Open the image to inspect it at full resolution.*

### Tune before the signal is processed

The tuner reads the matching armed or input-monitored hardware route before effects, so tuning never becomes part of the audible or recorded signal. It reports the chromatic note, cents from pitch, frequency, input level, tracking confidence, and a 440 Hz reference. The tracker holds a stable reading through a guitar note’s decay instead of dropping the display immediately after the transient.

[![OpenStudio NAM Rack tuner showing E4, cents, pitch, input level, and tracking confidence](/assets/blogs/nam-rack-tuner.webp)](/assets/blogs/nam-rack-tuner.webp)

*The tuner observes the raw input route; it does not color, delay, or otherwise enter the guitar signal.*

## Why NAM belongs inside the session

A NAM file is more than a static EQ curve. A neural model learns the nonlinear behavior of a real signal chain: how it responds to a soft note, how it compresses when the pick digs in, and how its harmonics change with input level.

That is what makes [Neural Amp Modeler](https://github.com/sdatkinson/neural-amp-modeler) valuable. It gives musicians an open format for captured gear and gives developers an open inference engine through [NeuralAmpModelerCore](https://github.com/sdatkinson/NeuralAmpModelerCore). The capture does not have to be trapped in one company’s pedal, plug-in, or account.

Inside OpenStudio, the NAM Rack lives on the track and is recalled with the project. Recorded audio remains raw before effects, while monitoring, playback, and offline export run through the rack beside automation, sends, editing, and the rest of the mix.

### A1 and A2, without locking the rack to one generation

OpenStudio loads both A1 and A2 NAM captures, whether they represent an amp or a complete captured rig. A2 is the newer Neural Amp Modeler architecture, while existing A1 libraries remain fully useful. The code-backed promise here is compatibility with both generations—not a guarantee that one capture will sound better than another. Guitarists can choose the capture that sounds and responds correctly for the session.

OpenStudio now sits in the same practical category as [AmpliTube](https://www.ikmultimedia.com/products/amplitube5/), [Guitar Rig](https://www.native-instruments.com/en/products/komplete/guitar/guitar-rig-7-pro/), [Neural DSP](https://neuraldsp.com/plugins) and similar amp modelers: it takes a direct guitar input through an amp, cabinet, effects, and into a record-ready session.

OpenStudio’s proposition is straightforward. The NAM capture host, native pedalboard, cabinet stage, effects, recording, editing, automation, mixing, and export are built into one free, open-source DAW. Capture quality, input calibration, cabinet choice, monitoring, and the player still shape the result, but the workflow itself is complete and does not require a paid rack tier.

## The signal path is explicit

The implemented route is:

```text
Input (the tuner observes here without entering the audible path)
  -> input trim
  -> gate
  -> compressor
  -> tape echo
  -> mono octaver
  -> Precision Drive
  -> distortion
  -> A1/A2 amp or full-rig NAM capture
  -> cabinet IR and cabinet shaping
  -> reorderable graphic EQ, modulation, delay, and reverb
  -> output trim and meters
```

[![OpenStudio NAM Rack signal-chain drawer showing every processing stage](/assets/blogs/nam-rack-signal-chain.webp)](/assets/blogs/nam-rack-signal-chain.webp)

*The signal-chain drawer shows the actual audible order. The five pre-effects keep a fixed order, while the four post-cab effects can be reordered.*

## Developer notes: the pre-effects

The main Pedals page exposes five focused devices. Each faceplate maps a small set of controls to parameters implemented by the rack, while Device Controls exposes additional settings such as Precision Drive’s Gate. The DSP underneath handles smoothing, state recall, bypass behavior, and the work needed to keep those controls safe in a real-time project.

[![OpenStudio NAM Rack pre-effects with Compressor, Tape Echo, Mono Octaver, Precision Drive, and Distortion](/assets/blogs/nam-rack-pre-fx.webp)](/assets/blogs/nam-rack-pre-fx.webp)

*The main Pedals screen contains exactly the five devices shown above. Gate lives in the rack header, while Device Controls exposes the pedals' additional settings.*

- **Gate** — Threshold and Release control the rack’s first processing stage, before compression and gain can raise the noise floor. Taking Threshold to its minimum effectively bypasses the stage.

- **Compressor** — Comp is a musician-facing macro over threshold, ratio, and knee. Detail moves the attack and release behavior together, while Mix enables parallel compression and Level makes gain matching explicit. A high-pass filter in the detector stops low-end energy from dominating the compression decision.

- **Tape Echo** — Time, Feedback, Mix, Mod, and Tone cover slapback, longer echoes, darker repeats, and tape-like movement. The feedback loop is filtered and saturated. Because the effect sits before the capture, its repeats can push and react with the amp model; bypass stops new input while existing repeats spill naturally.

- **Mono Octaver** — Down, Up, and Direct set the sub octave, upper octave, and original guitar levels. The implementation uses a monophonic detector with hysteresis and smoothing to stabilize single-note tracking; it does not claim polyphonic tracking.

- **Precision Drive** — Drive, Bright, Attack, and Level make this a focused tightening stage. Attack controls the pre-drive low cut, Bright shapes the upper voice, and the advanced view also exposes a gate. The circuit uses transistor-style saturation and remains separate from Distortion, so it can tighten a capture without becoming the main high-gain sound.

- **Distortion** — This is a dedicated diode-clipping stage with Drive, Tone, Mix, and Level, not a hidden mode inside Precision Drive. Keeping the two pedals independent lets a player use one as a boost, the other as the main gain source, or stack both. Precision Drive and Distortion share one fixed 2× nonlinear processing pass instead of nesting a separate resampler around each stage.

The five visible pedals run in a fixed order before the capture. Graphic EQ, Modulator, Stereo Delay, and Reverb are the four reorderable post-cab stages.

## Amp capture and cabinet decisions stay separate

The NAM slot accepts A1 and A2 amp-only or full-rig captures. Model files are validated and prepared away from the audio callback, then swapped into the running processor with a crossfade. File parsing, allocation, and model preparation never belong on the real-time thread.

When an amp-only capture needs a speaker, the cabinet screen loads an external IR and adds focused shaping: Edge, Damp, Blend, Bloom, high- and low-pass filters, Level, Pan, and Phase. These names describe musical outcomes while the engine handles filter smoothing and IR transitions underneath.

[![OpenStudio NAM Rack cabinet IR and IR Shaper screen](/assets/blogs/nam-rack-cabinet-ir.webp)](/assets/blogs/nam-rack-cabinet-ir.webp)

*The cabinet stage keeps the active IR, source actions, shaping controls, and library visible together.*

If a full-rig capture already includes its cabinet, OpenStudio bypasses and locks the separate cabinet stage instead of stacking another IR on top. The previous external IR choice is remembered, so switching back to an amp-only capture restores the player’s cabinet rather than discarding it.

## Developer notes: the post-effects

The post section starts after the cabinet, so these tools shape the resulting rig without changing how the amp capture is driven. Graphic EQ, Modulator, Stereo Delay, and Reverb can be reordered, with EQ → Modulator → Delay → Reverb as the default.

### Post-cab graphic EQ

Nine fixed musical bands from 65 Hz to 16 kHz make broad, repeatable correction faster than creating parametric nodes for every tone. Each band covers ±12 dB, coefficient changes are smoothed, and the whole EQ can move within the post-effect order.

[![OpenStudio NAM Rack nine-band post-cab graphic EQ](/assets/blogs/nam-rack-graphic-eq.webp)](/assets/blogs/nam-rack-graphic-eq.webp)

*This is a nine-band graphic EQ—not a parametric EQ—with fixed centers at 65, 125, 250, 500 Hz and 1, 2, 4, 8, and 16 kHz.*

### Modulation, delay, and reverb

[![OpenStudio NAM Rack Modulator, Stereo Delay, and Reverb pedals](/assets/blogs/nam-rack-post-fx.webp)](/assets/blogs/nam-rack-post-fx.webp)

*The post-effects share a consistent pedal layout but keep the controls that matter to each algorithm.*

- **Modulator** — Chorus and Flanger share one device because both are built on time modulation. Rate, Position, Depth, Feedback, and Mix cover the movement, while Clean, Ensemble, and BBD choose the tonal family. Pedal mode makes Position a coordinated manual macro; Auto mode creates evolving motion without multiplying the rack with near-identical devices.

- **Stereo Delay** — Digital, Tape, and Analog modes change the filtering and saturation, not just the label. Time, Feedback, Mix, Mod, and Ducker cover the core behavior; Ping Pong and Tempo Sync are available in the full controls. When Sync is active, the manual time control yields to musical subdivisions so the UI never presents two conflicting timing sources. Ducking keeps repeats behind active playing, and bypass lets the bounded tail finish naturally.

- **Reverb** — The plate algorithm exposes Pre Delay, Decay, Mix, Low Cut, Tone, and Shimmer. Low Cut keeps the reverb bed clear, Tone controls high-frequency damping, Shimmer uses a pitch-shifted feedback branch, and an existing decay continues after bypass instead of being cut off.

## TONE3000 inside the rack

TONE3000 is integrated directly into the rack workflow. Connect an account, browse the available library views, inspect capture and creator metadata, audition a choice in the current session, and install the selected A1 or A2 model from TONE3000’s official delivery URL.

[![OpenStudio TONE3000 library interface with filters, capture list, and selected model details](/assets/blogs/nam-rack-tone3000-library.webp)](/assets/blogs/nam-rack-tone3000-library.webp)

*The connected browser keeps filters, results, creator details, and install actions inside the rack. The visible rows are deterministic development fixtures for interface review, not live TONE3000 catalog entries.*

The connection uses OAuth 2.0 with PKCE: OpenStudio opens the normal TONE3000 sign-in page, verifies the local callback, and exchanges the authorization code without embedding a client secret. The current library presents Latest, Trending, and Downloaded online views alongside local Installed and Favorites views, with filters for architecture and capture metadata. OpenStudio keeps creator attribution and license metadata visible and does not bulk-download, proxy, mirror, or re-host creator content. Richer catalog access will not be promised until TONE3000 approves that scope in writing.

### Audition first, commit deliberately

Capture and IR audition is temporary. **Stop Audition** restores the previous source, while **Use Capture** or **Use IR** commits the selection. OpenStudio FX Collection presets use a separate **Preview Preset**, **Apply Preset**, and **Cancel Preview** flow.

### Cabinet IR sources

The IR source screen brings local and permitted connected sources into the same cabinet workflow. A player can inspect a result, audition it against the active capture, and use it without losing the context of the rack.

[![OpenStudio cabinet IR source browser with audition and use actions](/assets/blogs/nam-rack-ir-library.webp)](/assets/blogs/nam-rack-ir-library.webp)

*The source-browser entries shown here are deterministic development records used to review the interface; they are not presented as production catalog content.*

## Calibration keeps “tone” separate from hardware level

Neural captures are level-sensitive. A model trained around one analogue reference can respond differently when an interface feeds it a much hotter or quieter digital signal.

The calibration panel aligns the interface’s 0 dBFS reference with capture input and output dBu metadata. Each capture can use its metadata, turn calibration off, or apply an override. Calibration stays inside the NAM wet path and never moves the musician’s creative Input or Output trims.

[![OpenStudio NAM capture dBu calibration screen](/assets/blogs/nam-rack-input-calibration.webp)](/assets/blogs/nam-rack-input-calibration.webp)

*Hardware reference is playback-environment state, while capture metadata and deliberate overrides belong to the portable tone. Keeping those domains separate prevents an A/B or preset change from silently recalibrating the interface.*

## Presets remember the complete tone

A rack preset stores the creative signal chain rather than only the amp filename. The library provides search, favorites, recent items, folders, tags, notes, Save As, import/export, duplication, rename, and delete. Factory starting points such as Current Capture · Clean Polish, Current Capture · Wide Chorus, Current Capture · Tight High Gain, and Current Capture · Shimmer Bloom adapt the controls around the current capture; they do not include a NAM model or IR.

[![OpenStudio NAM Rack preset library with search, templates, user presets, import, and export](/assets/blogs/nam-rack-preset-library.webp)](/assets/blogs/nam-rack-preset-library.webp)

*The preset library combines factory templates for the current capture with saved user presets, search, organization, and import/export.*

## The less visible work that makes the rack dependable

The screen is only the front of the feature. The audio engine also has to make every change safe and repeatable:

- NAM models and cabinet IRs are parsed, allocated, and prepared away from the audio callback, then published as ready resources.
- Sample-rate conversion is explicit when a model and session expect different rates.
- The rack reports latency introduced by model-rate conversion and the shared drive stage. Model and cabinet swaps, plus supported power and bypass transitions, use aligned paths and click-safe transitions where the processor requires them.
- Working buffers are preallocated, controls are atomic, and the callback performs bounded work with no file access.
- Delay and reverb tails are reported to the render path, and offline export uses the same processor graph as playback.
- Project state stores model and IR identity, parameters, order, and bypass state; missing assets offer Locate, Replace, Bypass, and supported Re-download actions.

Those choices are what turn NAM support from a file loader into a dependable DAW instrument.

## Help us improve the rack

The next decisions should come from guitarists using the rack in real sessions. Tell us which control feels missing, redundant, or unclear; whether the defaults work across single coils, humbuckers, active pickups, and different interface levels; how quickly the tuner settles on sustained notes; and whether the fixed pre order and reorderable post section feel obvious.

We would especially like to know:

- Should Precision Drive’s Gate move onto the main faceplate?
- How does Mono Octaver tracking behave with your guitar and playing style?
- Do Pedal and Auto modes make the Modulator easier or harder to use?
- Which delay subdivisions, reverb controls, or cabinet-shaping terms need improvement?
- What would make TONE3000 browsing, preset organization, or missing-file recovery faster?
- Which native pedal should come next, and which three to five controls does it truly need?

Share what you hear and what slows you down in the [OpenStudio issue tracker](https://github.com/sdevil7th/OpenStudio/issues). Specific guitars, interfaces, buffer sizes, captures, and IRs are especially useful because they help us reproduce the experience instead of guessing.

## Thank you to the people who made the foundation

Thank you to Steve Atkinson and everyone who has built, tested, documented, and shared work around Neural Amp Modeler. Open-sourcing both the ideas and the production-grade core made it possible to build this as a real part of an open DAW instead of another closed island.

Thank you as well to the TONE3000 team and to the capture creators who keep the ecosystem useful. A model loader becomes a guitar rig because there are great models, clear metadata, and people willing to share the sound of their gear.

The current build brings the NAM guitar workflow together inside OpenStudio: tune, shape, audition, record, automate, recall, and render without leaving the project. The next step is musician feedback on the controls, defaults, and remaining release validation.
