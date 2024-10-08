import { app, ipcMain, shell, nativeImage } from "electron"
import fs from 'fs'
import plist from 'plist'
import path from 'path'
import { exec } from "child_process"


export class MacosService {

    // 获取应用程序的 path
    public  getApps(dirs: string[]) : Promise<{appPath: string, icon: string, name: string}[]> {
        return new Promise((resolve, reject) => {
            exec('mdfind "kMDItemContentType == \'com.apple.application-bundle\'"',async (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                // 过滤掉非目标目录下的app
                let apps = stdout.split('\n').filter(app => app.endsWith('.app'))
                    .filter((app) => {
                        let cnt = 0
                        dirs.forEach((dir) => {
                            if (!app.startsWith(dir)) cnt++
                        })
                        if (cnt === dirs.length) return false
                        return true
                })
                let appDetails = await Promise.all(apps.map(async appPath => {
                    let icon = (await app.getFileIcon(appPath)).toDataURL();
                    let name = appPath.substring(appPath.lastIndexOf('/') + 1)
                    return { appPath, icon, name };
                }));
                
                // console.log(res)
                resolve(appDetails);
            });
        });
    }

    public getAppsInfo(apps: string[]) : Promise<plist.PlistValue[]> {
        return new Promise((resolve, reject) => {
            let plistObjs : plist.PlistValue[] = [];
            try {
                for (const app of apps) {
                    console.log(app+ ' ___________-----------=====');
                    
                    let plistPath = path.join(app, 'Contents', 'Info.plist');
                    let plistData = fs.readFileSync(plistPath, 'utf8');
                    let plistObj = plist.parse(plistData);
                    console.log(plistObj);
                    console.log('-----------------------------------');
                    plistObjs.push(plistObj);
                }
            } catch (error) {
                reject(error)
            }
            resolve(plistObjs);
        })
    }

    // 获取应用程序的 icon
    // public static appIcns2Png(appIcnss: string[], )  {
    //     return new Promise((resolve, reject) => {
    //         exec(`sips -s format png ${icnsPath} --out /dev/stdout`, { encoding: 'buffer', maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
    //             if (error) {
    //               return reject(`Error converting image: ${stderr}`);
    //             }
          
    //             // 使用 sharp 处理 stdout 的 PNG 数据
    //             sharp(stdout)
    //               .toBuffer()
    //               .then((buffer) => {
    //                 // 将 PNG buffer 转换为 Base64
    //                 const base64Image = buffer.toString('base64');
    //                 resolve(base64Image);
    //               })
    //               .catch(err => reject(`Error processing image: ${err}`));
    //           });
    //     })
    // }
}

const macAppDirs = [
    '/Applications',
    '/Applications/Utilities',
    '/System/Applications',
    '~/Applications/',
]

// 获取应用程序的 path
const getApps = () => {
    return new Promise((resolve, reject) => {
        exec('mdfind "kMDItemContentType == \'com.apple.application-bundle\'"', (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            // 过滤掉非目标目录下的app
            let apps = stdout.split('\n').filter(app => app.endsWith('.app'))
                .filter((app) => {
                    macAppDirs.forEach((dir) => {
                        if (!app.startsWith(dir)) return false
                    })
            })
            resolve(apps);
        });
    });
}


export const showApps = () => {

}

export const appIpcHandle = () => {

    ipcMain.handle("start_app", async (_, appPath: string) => {
        shell.openPath(appPath)

        let appIcon = await app.getFileIcon(appPath + "/Contents/MacOS/Medis")
        console.log(appIcon.toDataURL());

        const plistPath = path.join(appPath, 'Contents', 'Info.plist');
        if (!fs.existsSync(plistPath)) {
            console.warn(`在 ${plistPath} 找不到 Info.plist 文件`);
            return null;
        }

        return appIcon.toDataURL()
        // try {
        //     // 获取应用程序的 Info.plist 文件路径
        //     const plistPath = path.join(appPath, 'Contents', 'Info.plist');
        //     if (!fs.existsSync(plistPath)) {
        //       console.warn(`在 ${plistPath} 找不到 Info.plist 文件`);
        //       return null;
        //     }

        //     // 读取 Info.plist 文件以获取 CFBundleIconFile
        //     const plist = require('plist');
        //     const plistData = fs.readFileSync(plistPath, 'utf8');
        //     const info = plist.parse(plistData);
        //     let iconFileName = info.CFBundleIconFile;

        //     if (!iconFileName) {
        //       console.warn(`在 ${plistPath} 中找不到 CFBundleIconFile`);
        //       return null;
        //     }

        //     // 如果文件名有扩展名，移除扩展名
        //     iconFileName = iconFileName.replace(/\.\w+$/, '');

        //     // 构建可能的图标文件路径
        //     const iconExtensions = ['icns', 'png', 'ico'];
        //     let iconPath;
        //     for (const ext of iconExtensions) {
        //       const potentialPath = path.join(appPath, 'Contents', 'Resources', `${iconFileName}.${ext}`);
        //       if (fs.existsSync(potentialPath)) {
        //         iconPath = potentialPath;
        //         break;
        //       }
        //     }

        //     if (!iconPath) {
        //       console.warn(`无法找到 ${iconFileName} 的图标文件`);
        //       return null;
        //     }

        //     // 读取图标文件
        //     const iconBuffer = fs.readFileSync(iconPath);
        //     // 创建 nativeImage 对象
        //     let res = await app.getFileIcon('/Applications/Medis.app')
        //     const iconImage = nativeImage.createFromBuffer(iconBuffer);
        //     // 将图标转换为 Data URL 格式
        //     console.log(res.toDataURL())
        //     return res.toDataURL();
        //   } catch (error) {
        //     console.error(`获取应用程序图标失败：${error}`);
        //     return null;
        //   }
    })

    ipcMain.handle("show_apps", () => {
        
    })

    

}
