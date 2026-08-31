# Build Better Guitar Tones with OpenStudio's NAM Rack

*A guitarist-first guide to building tones in OpenStudio, with a repeatable workflow, exact settings from two real presets, and practical ideas from Rabea Massaad, Adam “Nolly” Getgood, and Misha Mansoor.*

There is no magic preset that works for every guitar, pickup, tuning, interface, and mix. There is, however, a reliable order for making decisions. Start with a healthy DI, choose the capture and cabinet that already point in the right direction, control what hits the amp, and use post effects only to finish the sound.

This guide uses two real OpenStudio v19 user presets as examples: **Bestest clean!** and **good highgain riff**. Their values were read from the saved rack presets and rounded for readability. The referenced third-party NAM captures and IR are not bundled with OpenStudio, so treat these settings as recipes and use models you own or can download under their creators' licenses.

Both **Bestest clean!** and **good highgain riff** were tested with a Kramer Baretta Special and a Fender Telecaster. The result still depends on the output and voicing of the pickups, the DI level, and the interface input gain. Treat the numbers below as tested starting points, then level-match and adjust them for the signal your guitar sends into the rack.

[![OpenStudio NAM Rack redesigned amp view with an A2 capture and installed capture library](/assets/blogs/nam-rack-overview.webp)](/assets/blogs/nam-rack-overview.webp)

*The Amp page is the centre of the tone, but the input, pedals, cabinet, Cabinet Space, EQ, and post effects decide how that capture behaves in the song.*

## The five-minute starting workflow

1. **Record a clean DI.** Put OpenStudio NAM Rack on the guitar track, select the correct hardware input, arm or monitor the track, and keep the recorded source dry. You can change the complete tone later without replaying the part.

2. **Tune before effects.** Open the rack tuner and check the note, cents, and tracking confidence. The tuner observes the input; it does not enter the audible chain.

3. **Set the interface once.** Avoid clipping at the interface and avoid changing its gain every time a preset changes. Use **CAL** when a capture supplies reliable reference metadata. Calibration represents the playback hardware and capture reference; the rack's Input knob is a creative trim.

4. **Choose the right kind of capture.** An amp-only capture needs a cabinet IR. A full-rig capture already contains its cabinet, so OpenStudio bypasses the external cabinet automatically. A capture that is already close will beat heroic EQ on the wrong model.

5. **Start with fewer stages.** Turn off Compressor, Octaver, EQ Boost, Precision Drive, Distortion, Graphic EQ, Modulator, Delay, Reverb, Room, and Doubler. Make the capture and cabinet work first, then enable one stage at a time.

6. **Level-match every decision.** Use A/B slots and adjust stage/output level so louder does not automatically win. Compare in the song, not only while playing alone.

## Know what changes before and after the amp

The Pedals page is not just a row of colours. Its position before the NAM capture is the reason those controls feel different from post EQ.

[![OpenStudio NAM Rack Pedals page with Compressor, Stereo Poly Octaver, PRE EQ, Precision Drive, and Distortion](/assets/blogs/nam-rack-pre-fx.webp)](/assets/blogs/nam-rack-pre-fx.webp)

*Everything on this page changes what reaches the capture. EQ Boost (shown as PRE EQ in the current UI) and Precision Drive therefore change the distortion response, not merely the final frequency balance.*

- **Gate** controls silence and note endings before gain raises the noise floor. Raise Threshold until pauses become clean, then back it down if sustains or pick detail disappear. Release controls whether the gate closes naturally or snaps shut.

- **Compressor** evens out clean playing and can add sustain. Mix allows parallel compression; detector HPF stops low strings from making the entire signal pump.

- **Stereo Poly Octaver** blends octave-down and octave-up voices while supporting chords and stereo material. Keep Direct high for a recognisable guitar attack, then add octave voices to taste.

- **EQ Boost (PRE EQ)** changes the signal before the gain stages. Cutting low frequencies here can stop palm mutes from overwhelming a high-gain capture. Boosting upper mids here can make the capture distort more aggressively around the pick attack.

- **Precision Drive** is the rack's tightening overdrive. Low Drive with higher Volume is the classic boost approach; more Drive adds its own clipping. Bright and Attack decide whether it feels sharper, leaner, or fuller.

- **Distortion** is a separate gain voice. Heavy, Extreme, and Crunch modes, plus Weight, Tone, Mix, Gate, and Level, let it become the main dirt or a layer around the capture.

- **Pedal NAM** loads an optional captured pedal after the native pedals and before the amp capture. Use it when the character of a specific captured drive matters more than a flexible native effect.

After the capture, **Cabinet and Cabinet Space** set the speaker response, focus, early room, and width. **Graphic EQ, Modulator, Stereo Delay, and Reverb** then finish the already-amplified tone and can be reordered.

## Tone example 1: “Bestest clean!”

This preset is not a dry, clinical clean. It is a large stereo clean built from a Fender Twin-style amp capture, a Dumble cabinet IR, subtle upper-air EQ, a driven front end, early cabinet room, doubling, and a long Studio reverb.

| Stage | Enabled setting | What it does here |
| --- | --- | --- |
| Input | 0.0 dB | Leaves the saved interface/capture calibration relationship unchanged. |
| Gate | −92.6 dB, 80 ms Release | A very gentle safety net. It should leave clean sustains and finger noise mostly untouched. |
| Compressor / Octaver / EQ Boost / Distortion | Off | The preset gets its feel and size elsewhere instead of stacking every device. |
| Precision Drive | On; Drive 64.8%, Bright 55%, Attack 33.6%, Gate 0%, Volume +5.2 dB | Adds front-end harmonics and pushes the capture. The moderate Bright and softer Attack keep it from becoming a thin metal boost. |
| Amp capture | Fender TwinVerb Vibrato Bright; Amp Quality Economy | Provides the clean American-style foundation. This is a third-party capture, not a bundled model. Economy is the saved A2 quality mode for this preset. |
| Amp wrapper | Gain +7.5 dB; Bright Voice off; Bass +4.3 dB; Mid −1.0 dB; Treble +1.6 dB; Presence 0 dB; Mix 100%; Output −1.4 dB | Drives the clean capture into a more responsive, polished edge while keeping full wet tone. Bass adds body; the small mid dip and treble lift open the sound. |
| Cabinet IR | Dumble IR | Changes the speaker/microphone fingerprint. The IR is at least as important as the amp name for the final clean colour. |
| Cabinet shaping | Level +12 dB; HPF 80 Hz; LPF 8.5 kHz; Edge 50%; Damp 6.6%; Blend 50%; Low Bloom 11.6%; Phase inverted | Removes sub rumble and excess top fizz while restoring level. Phase inversion does not change a lone track's timbre by itself; it matters when this tone is layered with another path. |
| Cabinet Room | On; Amount 51.8%, Width 79.8% | Supplies a broad early reflection before the main reverb, making the cab feel less close-miked. |
| Doubler | On; Mix 78.6%, Delay 4.0 ms, Spread 100% | Creates obvious stereo size with a very short offset. Check mono and reduce Mix if the centre becomes weak. |
| Graphic EQ | On; 250 Hz −1.5 dB, 8 kHz +3.0 dB, 16 kHz +1.5 dB; other bands flat | Clears a little low-mid cloud and adds gloss after the cabinet. |
| Reverb | Studio; Mix 39.8%, Decay 5.66 s, Pre Delay 207 ms, Low Cut 100 Hz, Tone 30.4%, Air 43.2%, Pad off | The long pre-delay keeps the picked note forward before a large tail blooms. Low Cut keeps that tail away from bass; Air adds an elevated high texture. |
| Output | +4.9 dB | Restores the final preset level. Re-match this to neighbouring tones before judging it. |

[![OpenStudio NAM Rack Cabinet page with IR shaping and Cabinet Space Room controls](/assets/blogs/nam-rack-cabinet-ir.webp)](/assets/blogs/nam-rack-cabinet-ir.webp)

*For this kind of clean, the cabinet, early Room, Doubler, and long reverb are doing as much creative work as the amp capture.*

### How to adapt this clean recipe

- For a tighter funk clean, turn off Doubler, reduce Room below 20%, shorten Reverb Decay, and bring Mix below 20%.
- For humbuckers, try less Amp Gain and Bass before reaching for post EQ.
- For single coils, keep the long pre-delay but reduce Air if pick noise becomes brittle.
- If the clean breaks up too early, reduce Precision Drive Volume or Amp Gain. Do not compensate only with Output; Output changes level after the character has already been created.
- If it disappears in mono, reduce Doubler Mix first. The phase switch is not a “better tone” switch—choose its position while listening against other layered tracks.

## Tone example 2: “good highgain riff”

This preset takes the opposite approach: one full-rig capture already containing the familiar Peavey 5150, Maxon/OD808, Mesa oversized cabinet, and SM57 chain; no separate cabinet; no added Precision Drive or Distortion; a restrained EQ Boost before the capture; a deliberate Graphic EQ curve afterward; and no Cabinet Room.

| Stage | Enabled setting | What it does here |
| --- | --- | --- |
| Input | 0.0 dB | Preserves the input reference used while the preset was built. |
| Gate | −54.4 dB, 80 ms Release | Much firmer than the clean preset, giving palm-muted stops a defined edge without using the pedal gates. |
| Compressor / Octaver | Off | Keeps pick transients direct and avoids extra low octave energy before high gain. |
| EQ Boost (PRE EQ) | On; 120 Hz +4.2 dB, 250 Hz +1.0 dB, 500 Hz −1.5 dB, 1 kHz flat, 2.5 kHz +4.5 dB, 5 kHz flat, 8 kHz +1.8 dB, 12 kHz +4.0 dB; HPF/LPF off | Mild, capture-specific shaping adds some low weight, trims boxiness at 500 Hz, and brings out pick definition without using another clipping stage. |
| Precision Drive / Distortion / Pedal NAM | Off / Off / empty | The full-rig capture already has a Maxon/OD808 baked into it, so I preferred this mild EQ Boost shaping rather than stacking another drive or overdrive in front. |
| Full-rig capture | Peavey 5150 + Maxon/OD808 + Mesa OS + SM57; Amp Quality Full | Supplies amp, boost, speaker, and microphone as one captured response. This is a third-party capture, not a bundled model. Full is the saved A2 quality mode for this preset. |
| Amp wrapper | Gain −4.2 dB; Tight Boost on; Bright Voice off; Bass +4.9 dB; Mid −3.3 dB; Treble +2.6 dB; Presence 0 dB; Mix 100%; Output −1.4 dB | The lower input gain stops the full rig from turning to blur. Tight adds extra control before the capture; the broad tone curve adds weight and attack around the capture's existing voice. |
| External cabinet | Off automatically | The full-rig capture already contains its Mesa/SM57 cabinet response, so a second IR would double-filter it. |
| Cabinet Room | Off | Keeps the riff dry and immediate. The stored Amount and Width values are bypassed and do not affect the audible preset. |
| Graphic EQ | On; HPF 50 Hz; 65 Hz +0.6 dB, 125 Hz +2.9 dB, 250 Hz −3.1 dB, 500 Hz +1.6 dB, 1 kHz flat, 2 kHz +3.0 dB, 4 kHz +3.1 dB, 8 kHz +3.5 dB, 16 kHz −0.1 dB; LPF 19.1 kHz; Level −2.0 dB | Finishes the full-rig response after the capture, balancing weight, low-mid space, and pick presence while its level trim keeps the shaped signal under control. |
| Doubler / Modulator / Delay / Reverb | Off | Keeps the rhythm tone dry, focused, and easy to double-track. Stored values behind bypassed effects are not part of the audible preset. |
| Output | −2.8 dB | Brings the final preset level down after the amp wrapper and active Graphic EQ. Re-match it before comparing with another tone. |

### Why the high-gain recipe works

The preset uses controlled input level and frequency shaping instead of asking more distortion to create heaviness. Its standalone Precision Drive is off because the source capture already contains a Maxon/OD808, while the rack Tight switch remains on. That is why reading only the visible pedal row would miss part of the story.

Both EQ stages are specific to this capture, guitar, and input level. EQ Boost makes the restrained pre-capture moves; Graphic EQ does the more detailed finishing afterward. Start flatter on another model. If palm mutes bloom too much, reduce 120 Hz in EQ Boost or 125 Hz in Graphic EQ before raising the gate. If the tone is fizzy, reduce the Graphic EQ's 8 kHz band or lower its LPF before cutting all treble. If it disappears beside bass and drums, restore some Amp Mid instead of adding more gain.

For wide rhythm guitars, record the part twice and hard-pan two real performances. Leave Doubler off on the main high-gain tracks; a short artificial double can be useful for a sketch, but it cannot reproduce the timing and articulation differences of two performances.

## What Rabea, Nolly, and Misha keep returning to

Three experienced modern players/producers arrive at a similar conclusion from different directions: tone is a chain of decisions, not one amp setting.

In D'Addario's [Sound Advice session with Rabea Massaad](https://www.youtube.com/watch?v=jy_StnCv874), Rabea breaks tone into the pick, fingers, pedals, amp, and guitar. That is a useful order of responsibility. If the pick attack is too sharp or the fretting hand is noisy, a rack can reshape it but cannot make it irrelevant. Record yourself, listen back, and change the source before building a larger corrective chain.

In a detailed [Guitar World interview with Adam “Nolly” Getgood](https://www.guitarworld.com/gear/guitars/adam-nolly-getgood-on-the-myths-surrounding-high-gain-guitar-tone), Nolly stresses the player's technique, pick and string choices, controlled low end before distortion, and enough midrange to keep a high-gain sound present. In NAM Rack terms: use EQ Boost or a low-drive Precision Drive to stop excessive bass from hitting the capture, and do not assume a dramatic mid scoop is automatically heavier.

In Sweetwater's workshop summary, [Misha Mansoor describes a 5150-style amp, boost, Vintage 30 cabinet, and SM57](https://www.sweetwater.com/insync/record-guitar-misha-mansoor/) as a familiar clear high-gain route. He explains that the boost removes low frequencies before the amp so low tunings and palm mutes stay controlled. In a separate [modern-metal tone walkthrough](https://www.sweetwater.com/insync/how-to-dial-in-a-modern-metal-tone-with-misha-mansoor/), he starts amp EQ around noon, uses conservative gain, keeps an overdrive's Drive low and Level high, uses gates for precise stops, and damps unused strings behind the nut.

None of those ideas require copying an artist's gear. They translate directly into decisions available in NAM Rack: clean source, sensible input, suitable capture, controlled pre-gain bass, enough midrange, deliberate gate, and cabinet choice before post-processing.

## Nine tricks that save time

1. **Loop the actual riff.** A sustained chord can hide problems that palm mutes expose. Dial a high-gain tone with the part it must play.

2. **Start amp EQ near neutral.** Move one control at a time and return to A/B. The capture already contains a strong tone; large wrapper moves should have a clear purpose.

3. **Use less gain than the solo button suggests.** Double-tracking and bass make a restrained guitar sound larger. Too much gain reduces pick contrast and makes editing feel less tight.

4. **Remove low end before gain, weight it after.** EQ Boost, Precision Drive Attack, and Tight control what distorts. Amp Bass, cabinet response, post EQ, and the bass guitar can provide weight later.

5. **Choose the cabinet before polishing EQ.** With an amp-only capture, try several IRs before building a complicated curve. A different speaker/microphone response can solve the whole problem.

6. **Set the gate while notes decay.** Raise Threshold during the noisy pause, then sustain a note and lower it until the ending returns. Adjust Release after Threshold.

7. **Gain-match A/B.** Save the unedited tone in A, make changes in B, and match output. If the improvement disappears at equal loudness, it was probably only louder.

8. **Check stereo tricks in mono.** Room and Doubler can make a clean inspiring, but the centre still has to survive phone speakers, clubs, and mono buses.

9. **Save stages, not only victories.** Keep versions such as `Riff 01 capture`, `Riff 02 pre-EQ`, and `Riff 03 mix-ready`. The preset library's notes, tags, folders, A/B comparison, and export make experiments recoverable.

## A compact checklist before you save

- The interface input is clean and not clipping.
- The tuner is stable and the guitar is intonated for the part.
- Calibration and creative Input trim have not been confused.
- The capture type is correct: amp-only with an IR, or full-rig without a second cabinet.
- Bypassed stages are truly unnecessary.
- The gate preserves the notes you want.
- A/B is level-matched.
- The tone works with drums and bass, not only in solo.
- Stereo tones have been checked in mono.
- The preset has useful tags/notes, and third-party capture/IR licenses are respected before sharing.

OpenStudio includes the NAM Rack engine in the normal app download. Bring a local `.nam` capture and WAV IR, or optionally connect a TONE3000 account, then use the recipes above as starting points rather than commandments.

[Download OpenStudio](/download) and build the tone around the guitar, hands, and song in front of you.
