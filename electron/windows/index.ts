import { app, BrowserWindow, screen } from "electron"
import path from "path"

// 窗口基类
abstract class Window {

    public win: BrowserWindow | null        // 窗口实例
    protected winWideth: number             // 窗口宽度
    protected winHeight: number             // 窗口高度
    protected viewPath: string              // 视图路径
    protected devViewPath: string           // 开发模式下的视图路径

    constructor(winWideth: number, winHeight: number, viewPath: string, devViewPath: string) {
        this.winWideth = winWideth
        this.winHeight = winHeight
        this.viewPath = viewPath
        this.devViewPath = devViewPath
    }

    public init(): void {                // 初始化窗口模版方法

        this.createWindow()                 // 创建窗口
        // 监听事件
        this.listenCloseEvent()
        this.listenBlurEbvent()
        this.listenFocusEvent()
    }
    

    protected abstract createWindow(): void     // 创建窗口

    protected listenCloseEvent(): void {}       // 关闭事件
    
    protected listenBlurEbvent(): void {}       // 失去焦点

    protected listenFocusEvent(): void {}       // 获取焦点
} 


// 主窗口类
export class MainWindow extends Window {

    constructor(winWideth: number, winHeight: number, viewPath: string, devViewPath: string) {
        super(winWideth, winHeight, viewPath, devViewPath)
    }


    protected createWindow(): void {
        this.win = new BrowserWindow({
            width: this.winWideth,
            height: this.winHeight,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
            },
        })

        if (app.isPackaged) {
            this.win.loadFile(this.viewPath)
        } else {
            this.win.loadURL(this.devViewPath)
            this.win.webContents.openDevTools()
        }
    }

    protected listenCloseEvent(): void {
        // 监听窗口关闭事件
        this.win?.on('closed', () => {
            this.win = null;
            if (process.platform === 'darwin') { // 如果是 MacOS 平台，隐藏 dock 图标
                app.dock.hide()
            }
        })
    }

}

// 输入窗口
export class CommandWindow extends Window {


    constructor(winWideth: number, winHeight: number, viewPath: string, devViewPath: string) {
        super(winWideth, winHeight, viewPath, devViewPath)
    }


    protected createWindow(): void {

        // 设置输入框窗口的位置
        const { width, height } = screen.getPrimaryDisplay().workAreaSize //获取显示器工作区域尺寸 不包括任务栏或 Dock 的可用区域

        // 计算窗口的位置：Y 轴是屏幕高度的 1/3，X 轴是屏幕宽度居中
        const xPos = (width - this.winWideth) / 2 | 0;
        const yPos = height / 6 | 0;

        this.win = new BrowserWindow({
            width: this.winWideth,
            height: this.winHeight,
            x: xPos,              
            y: yPos,
            frame: false,           // 隐藏窗口边框
            show: false,            // 隐藏窗口
            alwaysOnTop: true,      // 窗口置顶
            transparent: false,     // 窗口不透明
            resizable: false,       // 禁止窗口拉伸
            webPreferences: {
              preload: path.join(__dirname, 'preload.js'),
              contextIsolation: true,
            },
          });
    
        if (app.isPackaged){
            this.win.loadFile(this.viewPath)
        } else {
            this.win.loadURL(this.devViewPath)
        }
    }

    protected listenBlurEbvent(): void {
        this.win?.on('blur', () => {
            this.win == null ? void 0 : this.win.hide();
        })
    }   
}


// 列表窗口
// export class ListWindow extends Window {
    
//     constructor(winWideth: number, winHeight: number, viewPath: string, devViewPath: string) {
//         super(winWideth, winHeight, viewPath, devViewPath)
//     }

//     protected createWindow(): void {
//         this.win = new BrowserWindow({
//             width: this.winWideth,
//             height: this.winHeight,
//             frame: false,
//             show: false,
//             alwaysOnTop: true,
//             transparent: false,
//             hasShadow: false,
//             resizable: false,
//             webPreferences: {
//                 preload: path.join(__dirname, 'preload.js'),
//                 contextIsolation: true
//             }
//         })
//         if (app.isPackaged){
//             this.win.loadFile(this.viewPath)
//         } else {
//             this.win.loadURL(this.devViewPath)
//         }
//     }

//     protected listenBlurEbvent(): void {
//         this.win?.on('blur', () => {
//             this.win == null ? void 0 : this.win.hide();
//         })
//     }
// }