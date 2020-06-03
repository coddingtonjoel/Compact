const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const MainWindow = require("./MainWindow");
const AppMenu = require("./AppMenu");
const minifyFile = require("./minifyFile");

process.env.NODE_ENV = "development";

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

let mainWindow;

function createMainWindow() {
    mainWindow = new MainWindow("./app/index.html", isDev);
}

app.on("ready", () => {
    createMainWindow();

    new AppMenu(isDev);
});

ipcMain.on("file:add", (e, path) => {
    minifyFile(path);
});

app.on("window-all-closed", () => {
    app.quit();
});

app.allowRendererProcessReuse = true;
