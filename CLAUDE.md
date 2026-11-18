# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A single-page task app (add, complete, delete tasks) in plain HTML/CSS/JavaScript. There is no build step, no package manager, no dependencies, no linter and no tests. The only external resource is the Poppins font, imported from Google Fonts at the top of `style.css`.

## Running the app

Open the file in the user's default browser:

```bash
open index.html
```

Opening `index.html` directly works: there are no ES modules or fetch calls, so `file://` is fine. Reload the page (Cmd+R) to see edits.

Avoid the in-app Browser pane for this project. It renders local files as a static `data:` snapshot, so `style.css` and `app.js` don't load. A local dev server can't read this folder either, because macOS privacy protection blocks access to the Desktop (and this Mac has no Python or Node; only `/usr/bin/ruby` and `perl`). `.claude/launch.json` serves a copy from a temporary scratchpad folder. Re-copy the three files there before previewing, or the copy will be stale.

## Architecture

- `index.html`: static shell. Contains the form (`#task-form`, `#task-input`, `#add-btn`) and an empty `<ul id="task-list">` that JS fills.
- `app.js`: all state and behaviour. The in-memory `tasks` array (`{ id, text, done }`; `id` comes from `newId()`, a UUID, and older saved tasks may still have numeric IDs) is persisted as JSON in `localStorage` under the key `"tasks"`. `renderTasks()` rebuilds the whole list from that array. It shows an `.empty` placeholder `<li>` when there are no tasks.
- `style.css`: glassmorphism design, with an animated gradient background, blurred blobs (`body::before/::after`), a frosted card and keyframe animations.

### JS ↔ CSS coupling to preserve

Two interactions deliberately avoid a full re-render, so that CSS animations can play:

- **Toggle done**: `toggleDone` updates state and toggles the `.done` class on the existing `<li>`. It does not call `renderTasks()`. This lets the strikethrough "draw" across the text (an animated `background-size` on `.task-text`).
- **Delete / Clear completed**: both go through `removeTasks(ids, rows)`. It removes the tasks from the data and saves immediately. Then it adds `.removing` to the rows (which plays the `taskOut` animation), disables their controls, and removes each `<li>` on `animationend`. A 500 ms timeout is the fallback when the animation doesn't run. Keep the data update before the animation: a re-render in the middle of the animation must not bring deleted tasks back.
- **Clear completed button** (`#clear-completed`): it is only shown while some task is done. `updateClearButton()` must be called after anything that changes `done` or removes tasks.

Class names used by JS (`task`, `done`, `removing`, `empty`, `done-checkbox`, `task-text`, `delete-btn`, `clear-btn`) are styled in `style.css`. Keep the two files in sync when renaming.
