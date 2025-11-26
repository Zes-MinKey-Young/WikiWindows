# WikiWindows

Yet another InPageEdit.

This was originally an old personal program written in 2022. It is now re-written with Codex and Vue.


## Usage
Add a line `mw.loader.load('https://cdn.jsdelivr.net/gh/Zes-Minkey-Young/WikiWindows@latest/dist/wikiwindows.iife.min.js')` to your user `Common.js`.

There are 3 states of the WikiWindows Button, everything is done by clicking it first:
1. Default state. WikiWindows has no impact on links.
2. Select state. When you click a link, you will open a WikiWindow, with the type subject to the `href`.
3. Select_input state. Entering this state will open a `WikiWindowMeta` if it does not exists. While you are in this state, the links you click on will put their corresponding title into the TextInputBox in the **Meta Window**.

Currently, there are WikiWindows for view, edit and diff.

All `WikiWindow`s are like window in modern graphic OS. They can be minimized or closed.


## License
WikiWindows is licensed under the GPLv3 license. The Codex-icon SVGs are hard-linked when building. Codex itself, while licensed under GPL, is dynamically loaded by `mw.loader.using`.

Run `bun install` to obtain the dependencies' licenses.