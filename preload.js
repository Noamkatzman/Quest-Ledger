const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ledger", {
  load: () => ipcRenderer.sendSync("ledger:load"),
  save: (json) => ipcRenderer.invoke("ledger:save", json),
  notify: (title, body) => ipcRenderer.send("notify", { title, body }),
  getStartup: () => ipcRenderer.invoke("startup:get"),
  setStartup: (on) => ipcRenderer.invoke("startup:set", on),
  onStartupChanged: (fn) => ipcRenderer.on("startup-changed", (_e, on) => fn(on)),
  exportBackup: (json) => ipcRenderer.invoke("backup:export", json),
  importBackup: () => ipcRenderer.invoke("backup:import")
});
