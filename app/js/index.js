const { ipcRenderer } = require("electron");

document.ondragover = document.ondrop = (e) => {
    e.dataTransfer.dropEffect = "copy";
    e.preventDefault();
};

// TODO add model for dropped item(s) and .appendChild() to a UL for each
document.ondrop = (e) => {
    for (let file of e.dataTransfer.files) {
        // notify user about incompatible file types
        if (
            file.path.split(".").pop() !== "js" &&
            file.path.split(".").pop() !== "css" &&
            file.path.split(".").pop() !== "html" &&
            file.path.split(".").pop() !== "svg"
        ) {
            M.toast({
                html: `${file.path
                    .split("/")
                    .pop()} could not be minified due to incompatible file type.`,
            });
        } else {
            ipcRenderer.send("file:add", file.path);
        }
    }
    // e.preventDefault();
};

// TODO add "minify:done" channel and open folder on completion

// display toast for if file contains JSX
ipcRenderer.on("minify:error-react", (e, data) => {
    M.toast({
        html: `${data.path
            .split("/")
            .pop()} could not be minified because the file contains JSX.`,
    });
});
