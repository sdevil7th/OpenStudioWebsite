# The Harness That Rewareded Me with Real MIDI Editor

*The MIDI editor did not become trustworthy when the feature list was complete. It became trustworthy when a harness could use it like an impatient musician and prove every edit survived undo, redo, playback, save, and reload.*

The first pass looked comforting from inside the codebase.

Notes had a model. Clips could be serialized. Controller data existed. Unit tests were green. The piano roll opened. The timeline drew MIDI items. On paper, the editor was turning into a real thing.

Then I used it.

Not as the person who knew which path had just been implemented. As someone trying to make a musical edit quickly.

That is when the confidence fell apart. A drag could preview correctly and still fail to commit. A resize could lose its source window. Ctrl-click sometimes lived too close to copy-drag. Controller workflows felt like developer shortcuts wearing a thin UI disguise. A popped-out editor could drift away from the project state it was supposed to edit.

The editor had features, but it did not have trust.

So I changed the question. I stopped asking, "Is this function implemented?" and started asking, "Can I do the whole edit in the real app, undo it, redo it, save it, reload it, and still hear the same thing?"

That question needed a harness.

## 1. I Stopped Testing Nouns

Feature lists are full of nouns: MIDI clip, piano roll, controller lane, source length, loop region, inspector.

Musicians live in verbs.

They grab a clip. They snap it. They trim the front. They stretch the loop. They slip the source because the good phrase starts a little later. They duplicate a part, mute a mistake, draw a pitch bend, change a velocity, hit undo, then hit play and expect the project to remember what just happened.

So the harness started with workflows instead of feature labels:

- move a MIDI item and snap it to the grid
- trim the left edge while preserving the source offset
- extend the right edge into a loop
- Alt-slip the source inside the item
- copy-drag without damaging the original
- split, duplicate, delete, mute, and lock
- open the piano roll and edit notes
- draw controller data
- edit pitchbend, velocity, pressure, chance, variance, and program data
- undo and redo every one of those actions
- save, reload, render, and export without losing the MIDI data

That list changed the work immediately.

A feature was no longer done because the code path existed. It was done when the complete edit survived like a user would expect it to survive.

## 2. The Harness Needed A Tiny Song It Could Interrogate

The harness needed a project it could trust, so I built one on purpose.

Not a demo song. Not a random clip dragged in by hand. A small, deliberately boring project where every value mattered.

It creates MIDI clips with known notes, known controller events, known pitchbend data, known source lengths, known loop settings, and known note metadata like release velocity, chance, variance, and play count.

That made the checks exact.

If a note starts at `0.000s` and a drag should move it to `0.375s`, the harness checks `0.375s`. If undo runs, the note has to return to `0.000s`. If redo runs, it has to land back on `0.375s`. Close enough was not good enough, because close enough is how editors slowly become haunted by off-by-one musical mistakes.

This removed a lot of guesswork. I was no longer staring at the UI and thinking, "seems fine." The project had known facts, and the harness could ask whether the editor respected them.

## 3. It Had To Touch The Real App

The most important rule was simple: if a user does it with a pointer or keyboard, the harness should do it with a pointer or keyboard.

Unit tests are still useful. They can prove that a transform function maps one event list into another. They can prove serialization works. They can protect small pieces of logic from regression.

But they cannot prove that a resize handle is actually reachable. They cannot prove that Ctrl-click selects instead of accidentally starting a copy-drag. They cannot prove that a controller node receives the click instead of the grid behind it.

So the harness opens the running app and performs real interactions:

- clicks clips
- drags bodies and edges
- sends modifier-key gestures
- opens context menus
- presses duplicate, delete, undo, and redo shortcuts
- opens the piano roll
- drags notes
- draws lane data
- uses visible controls instead of hidden internal calls

That caught bugs the code-level tests were never going to catch.

One Ctrl-click path could turn into a copy-drag if the pointer moved at the wrong moment. A split tool removed notes by object identity, which failed once the note list had been rebuilt. Glue initially behaved more like a length helper than a true merge. Some controller interactions were technically implemented but awkward enough that the harness made the awkwardness impossible to ignore.

These were not theoretical failures. They were the exact failures that make an editor feel slippery.

## 4. Undo Became Part Of The Feature

There is a special kind of fear in creative software: making an edit and not being sure undo will put the project back.

The harness made that fear measurable.

For every workflow, it checks the edit, then undo, then redo. A drag can preview live, but it must commit one undoable command at the end. A resize should not create dozens of history entries. A controller transform has to restore the exact previous event list when undone.

That forced a better editing model.

Timeline moves became single commits. Source-window edits became proper undoable actions. Note inspector changes became real note edits instead of side effects. Controller lane edits became safer because the old state and new state were both explicit.

Once undo and redo were treated as part of the feature, the editor stopped feeling fragile. It started feeling calmer.

## 5. Prompt Boxes Started Looking Like Debug Leaks

The harness also exposed a design smell: too many workflows still depended on prompt boxes.

Prompt boxes are fine when you are proving an idea to yourself at midnight. They are not fine as the main interaction model for a music editor. They interrupt flow, hide state, resist repeated use, and make a polished tool feel like a debug panel with a nicer coat of paint.

So I replaced those paths with visible controls:

- source length controls
- repeat controls
- MIDI FX controls
- lane transform controls
- line and curve generation controls
- pitchbend range controls
- sampler root-note controls

That was not just polish. It made the editor more human.

It also made the harness stronger, because it could click the same controls a musician sees. The tests stopped depending on private shortcuts and started exercising the product surface.

## 6. The Picture Had To Match The Sound

The UI can look right while playback receives the wrong MIDI.

That is the dangerous version of a bug, because the screen reassures you while the engine quietly disagrees.

So the harness also checks the data that reaches playback. After a loop resize, the outgoing MIDI payload has to match the visible item window. Events beyond the source length have to resolve through the loop correctly. Metadata like release velocity, pitchbend, controller values, chance, variance, and play count has to survive the trip.

The same rule shaped save and reload, render, freeze, and export.

It was not enough for the editor to draw the right thing. The project had to remember it, and the audio engine had to receive it.

## What The Harness Helped Finish

With the harness guiding the work, the MIDI editor became less like a pile of partial tools and more like one connected editing surface.

The timeline now supports selecting, moving, snapping, copy-dragging, cross-track moves, trimming, source-slipping, loop extension, splitting, duplicating, deleting, muting, locking, repeating, source-length changes, and keyboard shortcuts.

The piano roll now supports docked and popped-out sessions, active and reference clips, note tools, range selection, audition, insert velocity, quantize, source controls, a compact ruler, visible scrollbars, and direct inspector editing.

Controller lanes became first-class instead of decorative: velocity, release velocity, chance, variance, pitchbend, program and bank data, pressure, arbitrary controllers, 14-bit controller pairs, generated shapes, transforms, thinning, copy/paste, lane sizing, interpolation, and pitchbend ranges.

The popped-out editor forced one more important cleanup. The main project owns transport, recording, clip data, and undo history. Detached editors are views that send commands back to the main project. That fixed stale snapshots, recording visibility problems, and transport sync issues.

The harness did not make those features glamorous. It made them dependable.

## The Lesson I Kept

The harness was not a QA afterthought. It was the thing that made the MIDI editor possible.

Before it, I was fixing isolated problems and hoping the editor felt better. After it, I could build one workflow at a time, run it like a user, see the exact failure, fix it, and lock the behavior in.

That is the lesson from this pass: feature parity is not checklist parity. It is behavior parity.

A MIDI editor is only done when someone can grab a clip, stretch a loop, fix a note, draw a bend, pop out the editor, hit play, and never wonder whether the app understood the edit.
