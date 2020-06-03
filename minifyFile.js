const os = require("os");
const path = require("path");
const fs = require("fs");

const Terser = require("terser");
const HTMLMinifier = require("html-minifier");
const CSSO = require("csso");

const imagemin = require("imagemin"); //TODO Add image minification
const imageminSvgo = require("imagemin-svgo");
const imageminPngquant = require("imagemin-pngquant");
const imageminMozjpeg = require("imagemin-mozjpeg");

const minifyFile = (filePath, mainWindow) => {
    // ex. js, css, or html
    const extension = filePath.split(".").pop();
    // ex. index
    const name = filePath.split("/").pop();
    // index.js --> index.min.js
    const newName = getNewName(name);
    // path on desktop
    const newPath = path.join(os.homedir(), "desktop", newName);

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
                fs.writeFileSync(newPath, result.code, (err, data) => {
                    if (err) {
                        return console.log(err);
                    }
                });
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
        fs.writeFileSync(newPath, result, (err, data) => {
            if (err) {
                return console.log(err);
            }
        });
    }
    // CSS Minification
    else if (extension === "css") {
        let result = CSSO.minify(fs.readFileSync(filePath, "utf8")).css;
        fs.writeFileSync(newPath, result, (err, data) => {
            if (err) {
                return console.log(err);
            }
        });
    }
    // SVG Minification
    else if (extension === "svg") {
    }
};

// ex. turn index.js into index.min.js
// ***add an option to enable or disable this!!
const getNewName = (name) => {
    let stringArr = name.split(".");
    return stringArr[0] + ".min." + stringArr[1];
};

module.exports = minifyFile;
