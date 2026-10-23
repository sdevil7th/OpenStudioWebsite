# Tuning OpenStudio's free effects: gain, space and the audio deadline

*How a noisy fuzz stack, empty plugin windows and reverb transitions changed the way we design and test OpenStudio's free effects.*

A fuzz can sound convincing on its own and become difficult to control when another distortion follows it. A reverb can have a useful collection of spaces and still feel awkward when its editor fills a large screen with empty space. Neither problem is solved by adding another attractive knob.

Our recent work on the free plugin suite has connected those practical complaints to the processing underneath. We have been reviewing what controls actually do, making their relationships easier to find, and checking what happens when several effects compete for the same short audio deadline.

This is a development report dated **23 October 2026**, reviewed on **24 October 2026** against [OpenStudio app commit 1b5ba4b7](https://github.com/sdevil7th/OpenStudio/commit/1b5ba4b70df39665a4d61cdcd6d6dd6eb64b0861). It follows [our first article about the free plugin suite](/blog/building-openstudio-free-plugins). These changes are not a claim about the current downloadable installer, and the listening and platform checks described below are still separate release gates.

## A useful large window needs useful information

The revised suite uses extra space to expose secondary controls, meters and analysis. Reverb can keep its selected machine, shaping controls and response view together. Smaller windows retain the main controls and make deeper pages reachable through navigation. Resizing the editor never changes the sound.

Find searches controls and workflows, then opens the relevant page. It also needs to explain when a parameter belongs to another model or mode. Silently switching a reverb machine just to reveal a search result would change the music; retaining the stored setting and explaining its availability is more useful.

That review uncovered a less visible problem. The wide Reverb response panel could start measuring before the latest knob changes had reached the audio backend. The graph could therefore describe older settings than the controls beside it. Response rendering now waits for pending parameter writes to succeed, including when reached through Find. Cancellation and failed writes prevent a stale capture from starting.

The response itself comes from a fresh, isolated wet-only processor receiving an impulse. It helps explain the current settings without disturbing playback. It is a finite, level-dependent diagnostic, not a certified room measurement or a promise that every modulated tail repeats identically.

*The article image shows the current Hall editor in a browser fixture using the native parameter schema. Its response graph is intentionally unrendered; the screenshot is interface evidence, not an audio measurement.*

## Fuzz exposed the difference between silence and a quiet input

For NAM Rack's Octaver Fuzz, the requested reference was the Way Huge Swollen Pickle. Its [MkIIS manual](https://www.jimdunlop.com/content/manuals/WHE401S.pdf) describes separate decisions about fuzz intensity, filtering, midrange scoop and compression. Those are useful design questions. They do not provide a circuit model or establish that matching knob positions produces matching audio.

OpenStudio retains three original voices: asymmetric Vintage, symmetric and scooped Sustain, and deliberately Gated. We used Sustain as the closest architectural starting point for that reference. The manufacturer's [instructional demonstration](https://www.youtube.com/watch?v=patkTztLSAs) is also available for listening context; this review could not inspect its playback, so we make no recorded-demo matching claim.

The important first test was surprisingly simple: compare digital silence with a quiet, nonzero input. Fresh digital silence stayed silent. Seeded input noise was amplified substantially, especially when Fuzz fed Drive and then Distortion. This identified gain staging as one cause; later tests exposed separate numerical faults in the stack.

We changed the lower and middle part of the Vintage/Sustain gain range while retaining the maximum-gain endpoint. In one reproducible 48 kHz guitar-profile fixture, with Fuzz and Tone halfway and input noise at −72 dBFS RMS, Vintage's noise output changed from about −42.9 to −54.2 dBFS. The early-note RMS level changed by less than half a decibel. These are unweighted digital measurements, not the manufacturer's analog noise-floor specification.

There is a tradeoff: quieter late notes receive less sustain at those moderate settings. Full gain remains available, Gated keeps its previous gain mapping, and a loud stack of three gain stages can still amplify hiss strongly. A hidden gate could conceal that result by cutting off quiet notes. We instead retain explicit control through the rack's input-keyed Gate and its Release setting. The gate detects the clean input and attenuates after the pedals and NAM models, before cabinet and time effects.

The numerical faults had a different cause. Two Distortion calculations subtracted nearly equal values, turning tiny input differences into much larger output jumps. At 8× oversampling, a 20 Hz high-pass filter also lost essential coefficient precision. We replaced the unstable subtraction with stable interval calculations and gave the low-cut filter double-precision coefficients and state, including its shared use in the standalone Saturator. These corrections retain the cutoff, filter order, oversampling and latency. Tests across 32 gain-stage, profile and voice combinations now keep output within the specified tolerance when callback sizes change. That establishes numerical consistency; listening quality and CPU qualification remain separate checks.

## Clean belongs on the pedal

The floating Clean Blend strip above Octaver Fuzz was disconnected from the controls it affected. Clean is now a small knob beside Voice, with its percentage visible on the pedal. Exact entry, keyboard adjustment, reset and Undo use the existing parameter path.

Its meaning matters as much as its position. Clean blends the signal entering Fuzz, including any octave voices. It does not bypass the following Drive, Distortion or amp. Fuzz Level controls what reaches those stages, so it can change their saturation as well as the final loudness.

The faceplate uses precisely registered vector lettering over the existing pedal body. That keeps labels aligned with the interactive controls and readable at different scales. Browser checks cover compact windows through 4K, including focus, hit targets, scrolling and control overlap. They establish usability contracts; visual preference still belongs to the person using the instrument.

![NAM Rack pedalboard with Clean and Voice readouts integrated into the Octaver Fuzz pedal](/assets/blogs/octaver-fuzz-integrated-clean.webp)

*The updated pedal in a browser fixture. The percentage and voice use matching recessed displays; the two switches keep octave processing and fuzz independent.*

## A reverb tail also has a workload

Reverb work has included damping across sample rates, engine retirement, continuing input during Hold, and pitch-shifted Shimmer tails. A silent or fading engine must not accidentally resurrect old audio when it becomes active again. Equally, turning an effect off should not force the audio thread to clear a large block of memory at once.

Our Shimmer work builds on [Signalsmith Stretch](https://signalsmith-audio.co.uk/code/stretch/). Local adaptations spread transform and reset work into bounded pieces. Tests compare output, latency, reset replay and callback partitioning with retained reference behavior. Preparation and memory allocation stay outside the audio callback. This is narrower than claiming that every Shimmer setting is now inexpensive.

The same distinction matters for NAM Rack's new multicore track processing. Independent eligible native-NAM audio tracks can use persistent workers. Routed tracks and other unsupported paths retain their existing serial processing. More cores help independent work, but cannot erase the cost of the longest track or the time needed to wake and synchronize workers.

At 44.1 kHz, a 16-sample buffer gives the host about **0.363 milliseconds** per callback. An attractive average CPU reading can hide an occasional callback that takes too long. Our required four-track, 16-sample target has **not yet passed** qualification; eight samples remains a separate stretch target. Neither lower average cost nor passing ownership tests is evidence of crackle-free live recording.

## Keep the evidence separate

We retain native-level before/after audio, exact settings and resource identities so a change can be auditioned again. Tests cover state recall, bypass, clean-path parity, control transitions and processing boundaries. Browser tests cover the editor. Device probes cover a specific machine and driver under a stated workload.

Listening answers another question: whether the attack, sustain, noise and interaction with the rest of the rig are musically useful. The current fuzz refinement is a measured implementation change awaiting that judgment, not an approved Swollen Pickle emulation. The [NAM Rack guide](/docs/nam-rack-setup), [plugin guide](/docs/plugins-and-scanning) and [app testing notes](https://github.com/sdevil7th/OpenStudio/blob/1b5ba4b70df39665a4d61cdcd6d6dd6eb64b0861/docs/testing.md) keep the workflows and qualification boundaries in one place.
