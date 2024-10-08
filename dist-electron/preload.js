"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("main_process", {
  startApp: async (path) => {
    const res = await electron.ipcRenderer.invoke("start_app", path);
    return res;
  },
  getApps: async () => {
    const res = await electron.ipcRenderer.invoke("get_apps");
    return res;
  },
  getIcon: async () => {
    electron.ipcRenderer.invoke("get_icon");
  },
  getAppsByKeywords: async (callback) => {
    electron.ipcRenderer.on("apps", (event, apps) => {
      callback(apps);
    });
  },
  sendCommand: async (command) => {
    electron.ipcRenderer.invoke("send_command", command);
  }
});
