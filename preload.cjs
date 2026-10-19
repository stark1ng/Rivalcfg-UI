"use strict";
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("rivalui", {
  bridge: (payload) => ipcRenderer.invoke("bridge", payload),
  openExternal: (url) => ipcRenderer.send("open-external", url),
});