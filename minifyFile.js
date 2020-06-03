const os = require("os");
const path = require("path");
const fs = require("fs");
const uglifyjs = require("uglify-js");

const minifyFile = (filePath) => {
    console.log("Minifying...");

    let result = uglifyjs.minify(fs.readFileSync(filePath, "utf8"));
    console.log(result.error);
    console.log(result.code);

    console.log("completed.");
};

module.exports = minifyFile;
