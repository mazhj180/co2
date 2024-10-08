import { contextBridge, ipcRenderer } from "electron"


contextBridge.exposeInMainWorld("main_process", {
    startApp : async (path: string) => {
        const res = await ipcRenderer.invoke("start_app",path)
        return res
    },

    getApps : async () => {
        const res = await ipcRenderer.invoke("get_apps")
        
        return res
    },

    getIcon : async () => {
        ipcRenderer.invoke("get_icon")
    },

    getAppsByKeywords : async (callback) => { 
        ipcRenderer.on('apps',(event,apps) => {
            callback(apps)
        })
    },
    
    sendCommand : async (command) => {
        ipcRenderer.invoke("send_command",command)
    }
})