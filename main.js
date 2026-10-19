"use strict";
const { app, BrowserWindow, ipcMain, shell } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

const BRIDGE = path.join(__dirname, "bridge", "rivalcfg_bridge.py");
const PYTHON = "/usr/bin/python3";

let bridge = null;
let pending = new Map();
let seq = 0;

function bridgeRequest(payload) {
  return new Promise((resolve, reject) => {
    if (!bridge) {
      reject(new Error("bridge not running"));
      return;
    }
    const id = ++seq;
    pending.set(id, { resolve, reject });
    bridge.stdin.write(JSON.stringify({ ...payload, id }) + "\n");
  });
}

function startBridge() {
  bridge = spawn(PYTHON, [BRIDGE], { stdio: ["pipe", "pipe", "pipe"] });
  let buf = "";
  bridge.stdout.on("data", (chunk) => {
    buf += chunk.toString();
    let idx;
    while ((idx = buf.indexOf("\n")) !== -1) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line) continue;
      try {
        const res = JSON.parse(line);
        const waiter = pending.get(res.id);
        if (waiter) {
          pending.delete(res.id);
          waiter.resolve(res);
        }
      } catch (err) {
        console.error("bridge parse error:", err.message, line.slice(0, 200));
      }
    }
  });
  bridge.stderr.on("data", (chunk) => console.error("[bridge]", chunk.toString().trim()));
  bridge.on("exit", (code) => {
    console.error("bridge exited", code);
    for (const [, w] of pending) w.reject(new Error("bridge exited"));
    pending.clear();
    bridge = null;
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 940,
    minHeight: 600,
    backgroundColor: "#f7f6f3",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.webContents.on("console-message", (_e, level, message, line, sourceId) => {
    console.log("[renderer]", level, message, sourceId + ":" + line);
  });
  win.webContents.on("render-process-gone", (_e, details) => console.error("renderer gone", details.reason));
  win.loadFile(path.join(__dirname, "src", "index.html"));
  setTimeout(() => {
    win.webContents.executeJavaScript(
      "(async () => { selectPage('devices'); await new Promise(r => setTimeout(r, 120)); const items = document.querySelectorAll('.device-item').length; selectPage('light'); await new Promise(r => setTimeout(r, 120)); const rows = document.querySelectorAll('.row').length; const active = (document.querySelector('.nav-item.active') || {}).textContent || '?'; return JSON.stringify({items, lightRows: rows, active}); })()"
    ).then((r) => console.log("[probe]", r)).catch((e) => console.error("[probe-err]", String(e)));
  }, 6000);
  return win;
}

app.whenReady().then(() => {
  startBridge();
  ipcMain.handle("bridge", (_ev, payload) => bridgeRequest(payload));
  ipcMain.on("open-external", (_ev, url) => {
    if (/^https:\/\//.test(url)) shell.openExternal(url);
  });
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (bridge) bridge.kill();
  app.quit();
});