import path from "path";
import os from "os";
import fs from "fs";
import React, { useState, useContext } from "react";
import { Redirect } from "react-router-dom";
const electron = require("electron");
import rimraf from "rimraf";
import Item from "./Item";
import M from "materialize-css";
import { ListContext } from "../context/ListContext";
import { dialog, ipcRenderer } from "electron";
import bytes from "bytes";
import log from "electron-log";

const List = (props) => {
    const [redir, setRedir] = useState(null);
    const [list, setList] = useContext(ListContext);

    // create total storage saved variable to calculate later
    let totalSaved = 0;

    const handleCancel = () => {
        // if cancel is pressed and list of files isn't empty, prompt user to make sure they want to cancel
        if (list.length !== 0) {
            ipcRenderer.send("list:cancel");
            ipcRenderer.on("list:cancelled", (e) => {
                setList([]);
                console.log("List cleared!");
                setRedir(<Redirect to="/" />);
            });
        }
        // otherwise, if list is empty, just go back to <Start /> w/o prompt
        else {
            setRedir(<Redirect to="/" />);
        }
    };

    const handleMinify = () => {
        // if minify is pressed and list of files is empty, display materialize toast
        if (list.length === 0) {
            M.toast({
                html: "List of files is currently empty.",
            });
        }
        // otherwise show save dialog and move all files from /Compact/temp/ to the desired location
        else {
            ipcRenderer.send("list:save");
            ipcRenderer.on("list:saved", (e, data) => {
                let filePath = data.filePath;
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

                    // THIS IS THE VARIABLE THAT ISNT UPDATING --> props.fileList
                    console.log("currentList(): " + list);
                    list.forEach((file) => {
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
            });
        }
    };
    ipcRenderer.on("file:minified", (e, data) => {
        // if item's path already exists on list, don't add it
        if (list.some((item) => item.path === data.path)) {
            return false;
        } else {
            // let newList = list;
            // newList.push({
            // name: data.name,
            // path: data.path,
            // type: data.type,
            // oSize: data.oSize,
            // nSize: data.nSize,
            // oPath: data.oPath,
            // newName: data.newName,
            // });
            setList([
                ...list,
                {
                    name: data.name,
                    path: data.path,
                    type: data.type,
                    oSize: data.oSize,
                    nSize: data.nSize,
                    oPath: data.oPath,
                    newName: data.newName,
                },
            ]);
            console.log(list);
        }
        console.log("ONE FILE DROPPED. CURRENT LIST: " + list);
    });

    return (
        <div className="list">
            <div className="list-item-container">
                {list.map((item) => {
                    return (
                        <Item
                            type={item.type}
                            name={item.name}
                            oSize={item.oSize}
                            nSize={item.nSize}
                            path={item.path}
                            oPath={item.oPath}
                            key={item.path}
                        />
                    );
                })}
            </div>
            {props.loading}
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
