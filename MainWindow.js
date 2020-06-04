const { BrowserWindow } = require("electron");

class MainWindow extends BrowserWindow {
    constructor(file, isDev) {
        super({
            title: "Compact",
            width: 450,
            height: 600,
            // icon: "./assets/icons/icon.png",
            backgroundColor: "#F2F2F2",
            resizable: isDev ? true : false,
            webPreferences: {
                nodeIntegration: true,
            },
        });

        this.loadFile(file);

        const loadFile = (file) => {
            this.loadFile(file);
        };
    }
}

module.exports = MainWindow;
