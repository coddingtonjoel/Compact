import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import fs from "fs";
import os from "os";
import path from "path";
import drop from "../../assets/images/drop.svg";
import { ipcRenderer } from "electron";
import log from "electron-log";
import M from "materialize-css";
import { send } from "process";

const Start = (props) => {
    const [redir, setRedir] = useState(null);

    let incompatibleFiles = 0;

    useEffect(() => {
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
            props.loading(
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
            // counter to list with a Materialize toast when finished if > 0
            sendFiles(files);
            if (incompatibleFiles > 0) {
                M.toast({
                    html: `${incompatibleFiles} file(s) could not be minified due to incompatible file type.`,
                });
            }
            // reset for next drag and drop
            incompatibleFiles = 0;
            props.loading(null);
        };

        document.ondragover = document.ondrop = (e) => {
            e.dataTransfer.dropEffect = "copy";
            e.preventDefault();
        };

        document.ondrop = (e) => {
            handleFiles(e.dataTransfer.files);
            e.preventDefault();
        };

        // display toast for if file contains JSX
        ipcRenderer.on("minify:error-react", (e, data) => {
            M.toast({
                html: `${data.path
                    .split("/")
                    .pop()} could not be minified because the file contains JSX.`,
            });
        });
    }, [redir]);

    return (
        <div className={`start`}>
            <div className="start-drop">
                <img src={drop} draggable="false" alt="" />
                <p>Drop files or folders here to minify.</p>
            </div>
            {redir}
        </div>
    );
};

export default Start;
