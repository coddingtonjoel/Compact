const path = require("path");
const url = require("url");
const fs = require("fs");
const { app, BrowserWindow, ipcMain } = require("electron");
const electron = require("electron");
const AppMenu = require("./AppMenu");
const minifyFile = require("./minifyFile");
const rimraf = require("rimraf");
const log = require("electron-log");

app.setMaxListeners(20);
ipcMain.setMaxListeners(20);

let mainWindow;

let isDev = false;

if (
    process.env.NODE_ENV !== undefined &&
    process.env.NODE_ENV === "development"
) {
    isDev = true;
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 450,
        height: 600,
        show: false,
        backgroundColor: "#F2F2F2",
        resizable: isDev,
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
            //mainWindow.webContents.openDevTools();
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
});

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

// APP IPC

ipcMain.on("file:add", (e, path) => {
    minifyFile(path, mainWindow);
});

ipcMain.on("file:remove", (e, data) => {
    // delete file from /Compact/temp/
    rimraf(data.path, () => {});
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
