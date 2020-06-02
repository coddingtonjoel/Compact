const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const MainWindow = require("./MainWindow");
const AppMenu = require("./AppMenu");

process.env.NODE_ENV = "development";

const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin" ? true : false;

let mainWindow;

function createMainWindow() {
    mainWindow = new MainWindow("./app/index.html", isDev);
}

app.on("ready", () => {
    createMainWindow();

    new AppMenu(isDev);
});

app.on("window-all-closed", () => {
    if (!isMac) {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});

app.allowRendererProcessReuse = true;
