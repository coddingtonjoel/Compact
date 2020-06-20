import React, { useState } from "react";
import {
    HashRouter as Router,
    Route,
    Switch,
    Redirect,
} from "react-router-dom";
import "../sass/main.scss";
import { ipcRenderer } from "electron";
import fs from "fs";
import path from "path";
import M from "materialize-css";
import Start from "./Start";
import List from "./List";
import Finish from "./Finish";

const App = () => {
    const [totalSaved, setTotalSaved] = useState(0);
    const [finalPath, setFinalPath] = useState(null);
    const [loading, setLoading] = useState(null);
    const [redir, setRedir] = useState(false);

    const getTotalSaved = (amount) => {
        setTotalSaved(amount);
    };

    const getFinalPath = (path) => {
        setFinalPath(path);
    };

    // counter for amount of incompatible types for each batch of dragged files
    let incompatibleFiles = 0;

    const sendFiles = (files) => {
        for (let file of files) {
            file = file.path || file;

            // if file is a folder, recursively check each file in the nested folders
            if (fs.lstatSync(file).isDirectory()) {
                // rename for clarity
                let folder = file;
                let files = fs.readdirSync(folder).map((fileName) => {
                    return path.join(folder, fileName);
                });
                sendFiles(files);
            } else {
                // notify user about incompatible file types
                if (
                    file.split(".").pop() !== "js" &&
                    file.split(".").pop() !== "css" &&
                    file.split(".").pop() !== "html" &&
                    file.split(".").pop() !== "svg"
                ) {
                    incompatibleFiles++;
                } else {
                    ipcRenderer.send("file:add", file);
                    setRedir(<Redirect to="/list" />);
                }
            }
        }
    };

    const handleFiles = (files) => {
        setLoading(
            <div className="base-loader">
                <div className="preloader-wrapper big active">
                    <div className="spinner-layer spinner-blue-only">
                        <div className="circle-clipper left">
                            <div className="circle"></div>
                        </div>
                        <div className="gap-patch">
                            <div className="circle"></div>
                        </div>
                        <div className="circle-clipper right">
                            <div className="circle"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
        sendFiles(files);
        if (incompatibleFiles > 0) {
            M.toast({
                html: `${incompatibleFiles} file(s) could not be minified due to incompatible file type.`,
            });
        }
        // reset for next drag and drop
        incompatibleFiles = 0;
        setTimeout(() => {
            setLoading(false);
        }, 300);
    };

    document.ondragover = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
    };

    document.ondrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("handle files...");
        handleFiles(e.dataTransfer.files);
        console.log("handled");
    };

    // display toast for if file contains JSX
    ipcRenderer.on("minify:error-react", (e, data) => {
        M.toast({
            html: `${data.path
                .split("/")
                .pop()} could not be minified because the file contains JSX.`,
            classes: "jsx-toast",
        });
    });

    return (
        <Router>
            <Switch>
                <Route exact path="/list">
                    <List
                        totalSaved={(amount) => {
                            setTotalSaved(amount);
                        }}
                        finalPath={(path) => {
                            setFinalPath(path);
                        }}
                        loading={loading}
                    />
                </Route>
                <Route exact path="/finish">
                    <Finish totalSaved={totalSaved} finalPath={finalPath} />
                </Route>
                <Route exact path="/">
                    <Start />
                </Route>
            </Switch>
            {redir}
        </Router>
    );
};

export default App;
