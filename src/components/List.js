import path from "path";
import os from "os";
import fs from "fs";
import React, { useState } from "react";
import { Redirect } from "react-router-dom";
const { remote } = require("electron");
const electron = require("electron");
import rimraf from "rimraf";
import Item from "./Item";
import M from "materialize-css";
const dialog = remote.dialog;
import bytes from "bytes";

// TODO include a save dialog when they press minify files to select where they want to copy all the temp files to

const List = (props) => {
    const [redir, setRedir] = useState(null);

    // create total storage saved variable to calculate later
    let totalSaved = 0;

    const handleCancel = () => {
        // if cancel is pressed and list of files isn't empty, prompt user to make sure they want to cancel
        if (props.fileList.length !== 0) {
            dialog
                .showMessageBox({
                    type: "warning",
                    title: "Cancel Minification",
                    message: "Cancel Minification?",
                    detail:
                        "If you cancel minification, the changes you have made to the selected files will be lost.",
                    buttons: ["Stop", "Close without Saving"],
                    cancelId: 0,
                })
                .then((data) => {
                    // if choice is "Close without Saving"
                    if (data.response === 1) {
                        props.clearList();
                        const userDataPath = (
                            electron.app || electron.remote.app
                        ).getPath("userData");
                        rimraf(path.join(userDataPath, "temp"), () => {
                            log.info("Temporary files cleared");
                        });
                        setRedir(<Redirect to="/" />);
                    }
                });
        }
        // otherwise, if list is empty, just go back to <Start /> w/o prompt
        else {
            setRedir(<Redirect to="/" />);
        }
    };

    const handleMinify = () => {
        // if minify is pressed and list of files is empty, display materialize toast
        if (props.fileList.length === 0) {
            M.toast({
                html: "List of files is currently empty.",
            });
        }
        // otherwise show save dialog and move all files from /Compact/temp/ to the desired location
        else {
            const filePath = dialog.showOpenDialogSync({
                defaultPath: path.join(os.homedir(), "desktop"),
                properties: ["openDirectory", "createDirectory"],
            });

            if (filePath === undefined) {
                M.toast({
                    html: "Save process was interrupted.",
                });
            } else {
                const finalPath = filePath[0];

                // add min folder to selected path if it doesn't exist
                if (!fs.existsSync(path.join(finalPath, "compact-min"))) {
                    fs.mkdirSync(path.join(finalPath, "compact-min"));
                }

                props.fileList.forEach((file) => {
                    const finalName = file.path.split("/").pop();
                    const newPath = path.join(
                        finalPath,
                        "compact-min",
                        finalName
                    );
                    fs.renameSync(file.path, newPath);
                    let saved = file.oSize - file.nSize;
                    totalSaved += saved;
                });
                // convert from bytes to kb / mb
                totalSaved = bytes(totalSaved);
                // pass up to App.js to pass into Finish.js
                props.totalSaved(totalSaved);
                props.finalPath(finalPath);
                setRedir(<Redirect to="/finish" />);
            }
        }
    };

    return (
        <div className="list">
            <div className="list-item-container">
                {props.fileList.map((item) => {
                    return (
                        <Item
                            type={item.type}
                            name={item.name}
                            oSize={item.oSize}
                            nSize={item.nSize}
                            path={item.path}
                            oPath={item.oPath}
                            key={item.path}
                            remove={(path) => {
                                props.remove(path);
                            }}
                        />
                    );
                })}
            </div>
            <div className="list-button-container">
                <button
                    onClick={handleCancel}
                    className="btn waves-effect black-text list-button z-depth-1">
                    CANCEL
                </button>
                <button
                    onClick={handleMinify}
                    className="btn waves-effect black-text list-button z-depth-1">
                    MINIFY FILES
                </button>
            </div>
            {redir}
        </div>
    );
};

export default List;
