# Building OpenStudio's free plugin suite

*What reference manuals, repeated design reviews and audio regression tests taught us about making built-in effects useful, understandable and dependable.*

A delay should make it easy to set a rhythm. A reverb should help you shape a space. A guitar instrument should show the strings that are actually sounding. Those goals sound straightforward, but improving OpenStudio's built-in plugins meant working through much more than their appearance.

The development suite now has fifteen dedicated effect and instrument editors. Pitch Correct opens the existing clip pitch editor, keeping one place to edit notes and one editing history. Reverb, Delay and Chorus went through a second design pass after the first proposals still felt awkward. Missing processing and routing behavior took priority over decoration.

This article describes the **unreleased development checkout reviewed on 4 October 2026**, including working-tree additions on top of app commit `52cbd7c`. The implementation was checked again against development commit `b482852` on 8 October. It does not describe the contents of an existing installer. The [plugin guide](/docs/plugins-and-scanning) explains the available workflows; this is the engineering story behind them.

## Research started with the controls

We used established plugins to investigate what people need to see and change. That meant reading manufacturer manuals as well as looking at interfaces. A screenshot can show an attractive knob; it cannot tell you when that knob is active, what happens during a mode change, or which settings survive a preset recall.

For example, [FabFilter's dynamic EQ documentation](https://www.fabfilter.com/help/pro-q/using/dynamic-eq) describes controls whose availability depends on the selected band and processing mode. The useful lesson was contextual editing: bring the relevant band controls close to the graph and make processing restrictions explicit. That informed the separation between ordinary band dynamics, linear-phase dynamics and OpenStudio's original spectral processing.

Time effects offered another lesson. The [BigSky plug-in](https://www.strymon.net/product/bigsky-plugin/) combines multiple reverb machines with shared controls and machine-specific detail. [RAUM's Freeze documentation](https://docs.native-instruments.com/ni-tech-manuals/raum-manual/en/global-controls-and-freeze) shows why a seemingly simple hold control needs a precise behavioral definition. OpenStudio now exposes the controls its selected engine consumes and distinguishes hold policies, including whether new sound can enter the held space.

Compact references mattered too. [TAL-Chorus-LX](https://tal-software.com/products/tal-chorus-lx) is a reminder that a modulation effect does not need an enormous surface to be usable. Our Chorus, Flanger and Phaser still have different capabilities, so the editor changes with the mode rather than filling every view with every possible control.

These references guided questions and workflows. They did not give us the manufacturers' algorithms, calibration data or permission to call our processors equivalent. Some reference pages were inaccessible during the visual research; historical screenshots were recorded as historical evidence. A current-version visual-parity claim would go beyond that evidence.

## A clearer first view, with detail when it matters

The revised Reverb puts type selection, decay and the main space decisions together. Its deeper pages expose engine-specific shaping and convolution work without requiring every user to navigate an IR laboratory. Delay separates left/right timing and synchronization from motion, ducking and routing. Chorus keeps the principal modulation choices compact and changes its detail controls with the selected mode.

That hierarchy also matters in a small plugin window. Graphic EQ shows the full bank when there is room and uses frequency pages at compact sizes. The remaining faders stay available. Shared controls support numeric entry, fine adjustment, reset and keyboard interaction; wheel behavior follows the user's input profile.

The instrument displays needed an equally clear distinction between a key being pressed and a voice sounding. Guitar's performance display now reads the native string allocations, latched articulations and held, pedal-held or releasing roles. A released key can still have an audible voice, and a keyswitch can affect the next note without changing the current one. A decorative animation would have concealed those differences.

Pitch was the clearest example of avoiding unnecessary UI. OpenStudio already had a graphical clip editor, reached through **Edit Pitch**. We reused that session instead of creating another editor inside the plugin. Clip correction and realtime route correction remain separate operations, and the entry flow checks for active correction effects instead of silently changing the signal chain. See the [pitch editing guide](/docs/pitch-editing) for that distinction.

## The interface exposed unfinished behavior

Design work repeatedly uncovered processing and host details that needed implementation.

Changing EQ phase mode had to preserve supported active dynamics through the prepared transition. A phase selector that looked correct while dropping another setting would be misleading. Drum pads needed to display their effective MIDI mapping, including **Ignore**, rather than always displaying a default piece name. Separate drum outputs also needed an actual route through the host to a destination track, with saved source channels and usable stem exports.

Convolution needed a clear preparation lifecycle: choose a source, prepare it, inspect the result, then apply or revert. Cancellation or failure must leave the last working response usable. Portable state includes the IR data, so a preset or project does not depend only on a path that might disappear on another machine.

These details are less visible in a mockup than typography or colour, but they determine whether the interface tells the truth.

## Old sessions are part of the design

Adding controls can accidentally change old music. An expanded selector can reinterpret an existing automation value; a new default can change the sound of a saved project; a preset can lose settings from an engine that is currently hidden.

We retained native parameter identities, old normalized ranges and missing-field defaults. Expanded options use appended compatibility parameters where necessary. Complete-state operations preserve hidden engine settings, embedded IRs and mappings. Presets, Compare and Undo use that complete state rather than reconstructing it from a handful of visible knobs.

Routing has its own version of this problem. Restoring a send in several steps can briefly create an enabled Main 1/2 route before the intended auxiliary channels and gain arrive. Restoration now publishes the validated send configuration together. Host bypass also needs to follow prepared processor latency, including changes made by a preset or full-state recall. Otherwise switching an effect out can move its dry signal in time.

Export tails required similar attention. Releasing a keyboard key does not necessarily end a piano or guitar voice, especially with sustain or sostenuto held. Instrument export now uses rate-aware release bounds and releases both pedals at the end of the musical content. Those are finite-release contracts; an intentionally infinite effect still needs a deliberate export length.

## Adding colour without rewriting the default

The [UA 1176 manual](https://help.uaudio.com/hc/en-us/articles/4419447352980-UA-1176-Classic-Limiter-Collection-Manual) distinguishes amplifier colour from gain reduction. That is a useful signal-flow question even when building an original processor: what should remain when compression is inactive, and where should input and output colour sit?

OpenStudio's optional **Original stages** place separate nonlinear stages around compressor gain reduction. In Preamp, input colour precedes the tone section, output drive follows it, and linear output trim comes last. The stages include level-dependent and history-dependent behavior. They are not fitted commercial circuit models or hardware dBu calibration.

Legacy remains the default. Original stages use prepared 16x FIR processing, with higher CPU cost and declared latency. Testing earlier processing choices exposed aliasing that a control-layout review could never have found. The retained selected-bin check uses a 6170 Hz sine at 48 kHz, separate drive settings and a 64x comparison. It is deliberately a narrow test, with its stimulus and limits recorded.

Combined extreme drive and headroom settings remain a broader aliasing concern. Passing the selected-bin gate does not establish clean behavior for every input, automation pattern or setting. That boundary matters more than presenting oversampling as a quality guarantee.

## What the checks can establish

The 3 October development baseline passed 2,480 frontend tests, 168 native suite checks and 233 host integration checks. The frontend suite was repeated during the 4 October review. Those layers answer different questions: whether a gesture makes one Undo step, whether saved state survives a round trip, whether a processor reports the expected latency, and whether the host actually exports the intended channels and releases.

Browser checks cover layout and interaction. Native window checks cover the embedded editor's boot and lifecycle. Neither substitutes for the other. Likewise, a synthetic audio fixture can establish a deterministic invariant without proving that a vocal sounds natural or a reverb resembles a commercial reference.

Listening to the exact rendered artifacts, testing physical audio and MIDI devices, and qualifying release builds across platforms and monitor scales remain separate work. We keep those results distinct from diagnostic plots and automated passes.

The suite is now much easier to inspect and use, but there is no useful single percentage for resemblance to every reference. The maintainable result is a clear account of what each processor does, how its controls reach that behavior, what older sessions retain, and which claims still need evidence.
