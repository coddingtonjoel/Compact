const path = require("path");
const url = require("url");
const os = require("os");
const fs = require("fs");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const electron = require("electron");
const AppMenu = require("./AppMenu");
const minifyFile = require("./minifyFile");
const rimraf = require("rimraf");
const log = require("electron-log");

let mainWindow;

let isDev;

if (
    process.env.NODE_ENV !== undefined &&
    process.env.NODE_ENV === "development"
) {
    isDev = true;
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: isDev ? 700 : 450,
        height: 600,
        show: false,
        frame: false,
        opacity: 0.95,
        backgroundColor: "#F2F2F2",
        minWidth: 450,
        minHeight: 475,
        icon: `${__dirname}/assets/icons/linux.png`,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        },
    });

    let indexPath;

    if (isDev && process.argv.indexOf("--noDevServer") === -1) {
        indexPath = url.format({
            protocol: "http:",
            host: "localhost:8080",
            pathname: "index.html",
            slashes: true,
        });
    } else {
        indexPath = url.format({
            protocol: "file:",
            pathname: path.join(__dirname, "dist", "index.html"),
            slashes: true,
        });
    }

    mainWindow.loadURL(indexPath);

    // Don't show until we are ready and loaded
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();

        // Open devtools if dev
        if (isDev) {
            const {
                default: installExtension,
                REACT_DEVELOPER_TOOLS,
            } = require("electron-devtools-installer");

            installExtension(REACT_DEVELOPER_TOOLS).catch((err) =>
                console.log("Error loading React DevTools: ", err)
            );
            mainWindow.webContents.openDevTools();
        }
    });

    mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", () => {
    // once again, for consistency, double check if /Compact/temp/ exists,
    // and if it does, delete the folder
    const userDataPath = (electron.app || electron.remote.app).getPath(
        "userData"
    );
    if (fs.existsSync(path.join(userDataPath, "temp"))) {
        rimraf(path.join(userDataPath, "temp"), () => {
            log.info("Temporary files cleared");
        });
    }

    createMainWindow();

    new AppMenu(isDev);

    // APP IPC

    ipcMain.on("file:add", (e, path) => {
        minifyFile(path, mainWindow);
    });

    ipcMain.on("file:remove", (e, data) => {
        // delete file from /Compact/temp/
        rimraf(data.path, () => {});
    });

    ipcMain.on("list:cancel", (e) => {
        dialog
            .showMessageBox({
                type: "warning",
                title: "Cancel Minification",
                message: "Cancel Minification?",
                detail:
                    "If you cancel minification, the changes you have made to the selected files will be lost.",
                buttons: ["Stop", "Close without Saving"],
                cancelId: 0,
            })
            .then((data) => {
                // if choice is "Close without Saving"
                if (data.response === 1) {
                    e.reply("list:cancelled");
                    const userDataPath = (
                        electron.app || electron.remote.app
                    ).getPath("userData");
                    rimraf(path.join(userDataPath, "temp"), () => {
                        log.info("Temporary files cleared");
                    });
                }
            });
    });

    ipcMain.on("list:save", (e) => {
        async function returnSavePath(path) {
            const filePath = await getFilePath();
            e.reply("list:saved", {
                filePath: filePath,
            });
        }
        returnSavePath();
    });

    ipcMain.on("start:open", (e) => {
        const files = dialog.showOpenDialogSync({
            defaultPath: path.join(os.homedir(), "desktop"),
            properties: [
                "openFile",
                "openDirectory",
                "createDirectory",
                "multiSelections",
            ],
            filters: [
                { name: "All Files", extensions: ["*"] },
                {
                    name: "Files",
                    extensions: ["html", "js", "css", "svg"],
                },
            ],
            buttonLabel: "Open",
        });

        e.reply("start:opened", {
            files: files,
        });
    });
});

// asynchronously open files for saving
const getFilePath = () => {
    return new Promise((resolve) => {
        resolve(
            dialog.showOpenDialogSync({
                defaultPath: path.join(os.homedir(), "desktop"),
                properties: ["openDirectory", "createDirectory"],
                buttonLabel: "Save",
            })
        );
    });
};

// delete temporary files on quit
app.on("before-quit", () => {
    const userDataPath = (electron.app || electron.remote.app).getPath(
        "userData"
    );
    if (fs.existsSync(path.join(userDataPath, "temp"))) {
        rimraf(path.join(userDataPath, "temp"), () => {
            log.info("Temporary Files Cleared");
        });
    }
});

// additional macOS settings for standarization

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});

// Stop error
app.allowRendererProcessReuse = true;
