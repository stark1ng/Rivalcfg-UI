# RivalCFG UI

Data-driven desktop GUI for [rivalcfg](https://github.com/flozz/rivalcfg) — configure every
supported SteelSeries mouse on Linux.

UI controls are generated at runtime from rivalcfg's own device profiles: if rivalcfg knows
the mouse (76 product IDs, 30+ models — Rival, Sensei, Aerox, Prime, Kana, Kinzu...), the app
renders the right controls for it, nothing is hardcoded per device.

## Features

- Auto-detection of the connected mouse (vendor 1038)
- DPI presets editor, polling rate, lighting zones and effects, button mapping, sleep/dim timers - whatever the device profile exposes
- Apply settings in a **single** rivalcfg CLI call (only changed parameters are sent)
- Named profiles per device, stored locally
- Per-device link to the official documentation
- Dark theme by default, light theme toggle

## Requirements

- Linux + X11
- `rivalcfg` installed and working (`pip install rivalcfg`)
- `python3` (system) for the bridge process
- USB access to the mouse (udev rules from `sudo rivalcfg --update-udev`)

## Run

```bash
npm install
npm start
```

## Architecture

```
main.js                    Electron main process: bridge IPC, window
preload.cjs                contextBridge API (window.rivalui)
bridge/rivalcfg_bridge.py  JSON-over-stdin helper: device catalog, plugged
                           device detection, rivalcfg CLI invocations
src/
  index.html / app.css / tokens.css   shell + themes (dark default, light toggle)
  app.js                              data-driven settings renderer
  data/devices.json                   catalog generated from rivalcfg profiles
```

## License

MIT. Uses [rivalcfg](https://github.com/flozz/rivalcfg) by Fabien LOISON for all
device communication.