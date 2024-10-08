import { app, BrowserWindow, globalShortcut, ipcMain, Menu, Tray, Notification } from 'electron'
import path from 'path'
import { SQLite3Service } from '../db/sqlite'
import { CommandWindow, MainWindow } from '../windows'
import pinyin from 'pinyin'
import { MacosService } from '../os/mac'

// 超参数
const mainWindowWidth: number = 800             // 主窗口宽度
const mainWindowHeight: number = 600            // 主窗口高度
const commandWindowWidth: number = 750            // 输入框窗口宽度
const commandWindowHeight: number = 800           // 输入框窗口高度
const trayIcon: string = path.join(__dirname, '../src/assets', 'icon.icons') // 菜单栏图标

interface ApplicationConfig {
    hotKey: HotKey[]

}
interface HotKey {
    id: number
    key: string
    command: string
    active: boolean
}

export class Application {

    private mainWin: MainWindow           // 主窗口
    private commandWin: CommandWindow     // 命令窗口
    private menu: Menu | null                   // 菜单
    private tray: Tray | null                   // 菜单栏托盘
    private db: SQLite3Service | null           // 数据源
    private macos: MacosService                 // 系统服务
    private config: ApplicationConfig           // 系统配置

    constructor() {
        this.mainWin = new MainWindow(
            mainWindowWidth,
            mainWindowHeight,
            'src/views/index/index.html',
            'http://localhost:5173/src/views/index/index.html'
        )

        this.commandWin = new CommandWindow(
            commandWindowWidth,
            commandWindowHeight,
            'src/views/index/index.html',
            'http://localhost:5173/src/views/command/index.html'
        )

        this.macos = new MacosService()
    }

    public init(): void {
        app.whenReady().then(async () => {
            this.initDb()                           // 初始化数据库
            this.initMainWin()                      // 初始化主窗口
            this.initCommandWin()                   // 初始化命令窗口
            this.initMenu()                         // 初始化菜单
            this.initTray()                         // 初始化菜单栏
            await this.readConfig()                       // 初始化配置
            this.registerGlobalShortcut()           // 注册全局快捷键
        })
    }

    private initMainWin(): void {
        this.mainWin.init()
    }

    private initCommandWin(): void {
        this.commandWin.init()
    }

    private initMenu(): void {
        this.menu = Menu.buildFromTemplate([
            {
                label: 'Preference',
                click: () => {
                    if (this.mainWin.win) {
                        this.mainWin.win.focus();
                    } else {
                        this.initMainWin();
                        app.dock.show()
                    }
                }
            },
            {
                label: 'Quit',
                click: () => app.quit()
            }
        ])
    }

    private initTray(): void {
        // 创建菜单栏
        this.tray = new Tray(trayIcon)
        this.tray.setToolTip("hello co2")
        if (this.menu) {
            this.tray.setContextMenu(this.menu)
        }
    }

    private initDb(): void {
        // 获取数据文件路径
        let dbPath = app.getPath('userData') + '/data.db'
        
        let dealerr = (err: Error | null) => {
            if (err) {
                // 通知
                this.notify('Error', '系统错误')
            }
        }
        if (!app.isPackaged) {    // 如果是开发环境 
            dbPath = path.join(__dirname, 'data.db')
            dealerr = (err: Error | null) => {
                if (err) {
                    console.error(err)
                }
            }
        }
        console.log(dbPath);
        this.db = new SQLite3Service(dbPath, dealerr)
    }

    private async readConfig(): Promise<void> {
        // 读取热键配置
        const rows = await this.db?.selectQuery<HotKey>('select * from hot_key')
        if (rows) {
            this.config = {
                hotKey: rows
            }
        }
        console.log('config',this.config);
    }

    private registerGlobalShortcut(): void {

        // 关闭命令窗口快捷键 esc
        const close = globalShortcut.register('esc', () => {
            if (this.commandWin.win?.isVisible()) {
                this.commandWin.win?.hide()
            }
        })
        if (!close) this.notify('Error', `esc 快捷键注册失败, 请手动调整`)

        // 注册自定义快捷键
        this.config.hotKey.forEach((hotKey) => {

            if (hotKey.command === 'toggle') {
                const wakeup = globalShortcut.register('Control+R', () => {
                    if (this.commandWin.win?.isVisible()) {
                        this.commandWin.win?.hide()
                    } else {
                        this.commandWin.win?.webContents.openDevTools()
                        this.commandWin.win?.show()
                        this.commandWin.win?.focus()
                    }
                })
                if (!wakeup) this.notify('Error', `${hotKey.key} 快捷键注册失败, 请手动调整`)
            }
            console.log(hotKey+ " @@@ ");
            
        })


    }

    private initIpcHandle(): void {
        // 获取拼音
        function converToPinyin(str: string): string {
            return pinyin(str, {
                style: pinyin.STYLE_NORMAL // 将中文转换为拼音
            }).flat().join(''); // 扁平化数组并拼接为字符串
        }

        ipcMain.handle("smart_tips", async (_, command: string) => {
            // 命令提示 
            command = converToPinyin(command.trim())

            // 查询所有命令
            let commands = this.db?.selectQuery(`select * from command where commands like '${command}%'`)

            // 显示命中的app
            let apps = this.macos.getApps(['/Applications', '/Applications/Utilities', '/System/Applications'])
        })
    }
    private notify(title: string, body: string): void {            // 通知
        new Notification({
            title,
            body
        }).show()
    }
}






app.on('window-all-closed', () => {

    // macos 中所有窗口关闭不退出程序而是在dock表现为未激活 
    if (process.platform !== 'darwin') { // win和linux 中所有窗口关闭退出程序
        app.quit();
    }
});

