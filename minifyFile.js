const os = require("os");
const path = require("path");
const fs = require("fs");
const electron = require("electron");

// minifiers
const Terser = require("terser");
const HTMLMinifier = require("html-minifier");
const CSSO = require("csso");
const imagemin = require("imagemin");
const imageminSvgo = require("imagemin-svgo");
const imageminPngquant = require("imagemin-pngquant");
const imageminMozjpeg = require("imagemin-mozjpeg");

const minifyFile = (filePath, mainWindow) => {
    // ex. js, css, or html
    const extension = filePath.split(".").pop();
    // ex. index.js
    const name = filePath.split("/").pop();
    // index.js --> index.min.js
    const newName = getNewName(name);
    // location for application data on OS
    const userDataPath = (electron.app || electron.remote.app).getPath(
        "userData"
    );
    let saveLocation = path.join(userDataPath, "temp", newName);

    // if "~/Library/Application Support/Compact/temp" doesn't exist, create it
    if (!fs.existsSync(path.join(userDataPath, "temp"))) {
        fs.mkdirSync(path.join(userDataPath, "temp"));
    }

    // if for example, another index.min.js already exists in /Compact/temp/, make this file index(1).min.js
    if (fs.existsSync(saveLocation)) {
        let counter = 1;
        while (fs.existsSync(saveLocation)) {
            let stringArr = name.split(".");
            let newString = "";
            //return stringArr[0] + ".min." + stringArr[1];
            for (let i = 0; i < stringArr.length; i++) {
                if (i === stringArr.length - 2) {
                    newString += stringArr[i] + "(" + counter + ").min.";
                } else if (i === stringArr.length - 1) {
                    newString += stringArr[i];
                } else {
                    newString += stringArr[i] + ".";
                }
            }

            saveLocation = path.join(userDataPath, "temp", newString);
            counter++;
        }
    }

    // function to send data (used later here)
    const sendData = () => {
        // calculate original and new sizes to send back to renderer
        let originalSize = fs.statSync(filePath)["size"];
        let newSize = fs.statSync(saveLocation)["size"];

        mainWindow.webContents.send("file:minified", {
            path: saveLocation,
            name: name,
            type: extension,
            oSize: originalSize,
            nSize: newSize,
            oPath: filePath,
            newName: newName,
        });
    };

    // JavaScript Minification
    if (extension === "js") {
        try {
            let result = Terser.minify(fs.readFileSync(filePath, "utf8"));

            // tests if code includes JSX and lets user know JSX is not compatible for minification
            // this works because Terser's response to JSX code is by returning undefined
            if (result.code === undefined) {
                mainWindow.webContents.send("minify:error-react", {
                    path: filePath,
                });
            } else {
                fs.writeFileSync(saveLocation, result.code, (err, data) => {
                    if (err) {
                        return console.log(err);
                    }
                });
                sendData();
            }
        } catch (err) {
            console.log(err);
        }
    }
    // HTML Minification (uses Terser for inline ES6)
    else if (extension === "html") {
        let result = HTMLMinifier.minify(fs.readFileSync(filePath, "utf8"), {
            collapseBooleanAttributes: true,
            collapseInlineTagWhitespace: true,
            collapseWhitespace: true,
            minifyJS: function (text, inline) {
                return Terser.minify(text).code;
            },
            minifyCSS: true,
            minifyURLs: true,
            removeComments: true,
            removeAttributeQuotes: true,
            removeEmptyAttributes: true,
        });
        fs.writeFileSync(saveLocation, result, (err, data) => {
            if (err) {
                return console.log(err);
            }
        });

        sendData();
    }
    // CSS Minification
    else if (extension === "css") {
        let result = CSSO.minify(fs.readFileSync(filePath, "utf8")).css;
        fs.writeFileSync(saveLocation, result, (err, data) => {
            if (err) {
                return console.log(err);
            }
        });

        sendData();
    }
    // SVG Minification
    else if (extension === "svg") {
    }
};

// ex. turn index.js into index.min.js
// TODO add an option to enable or disable this!!
const getNewName = (name) => {
    let stringArr = name.split(".");

    let newString = "";
    //return stringArr[0] + ".min." + stringArr[1];
    for (let i = 0; i < stringArr.length; i++) {
        if (i === stringArr.length - 1) {
            newString += "min.";
            newString += stringArr[i];
        } else {
            newString += stringArr[i] + ".";
        }
    }
    return newString;
};

module.exports = minifyFile;
