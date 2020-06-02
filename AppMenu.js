const { Menu } = require("electron");

const isMac = process.platform === "darwin";

class AppMenu extends Menu {
    constructor(isDev) {
        super();

        let template = [];

        if (isMac) {
            template.unshift({
                role: "appMenu",
            });
        }

        if (isDev) {
            template.push({
                label: "Developer",
                submenu: [
                    { role: "reload" },
                    { role: "forcereload" },
                    { type: "separator" },
                    { role: "toggledevtools" },
                ],
            });
        }

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }
}

module.exports = AppMenu;
