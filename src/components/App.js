import React, { useState, useContext } from "react";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";
import "../sass/main.scss";
import M from "materialize-css";
import { ipcRenderer } from "electron";
import fs from "fs";
import path from "path";
import Start from "./Start";
import List from "./List";
import Finish from "./Finish";
import { ListContext } from "../context/ListContext";
import { ToastContainer, toast, Zoom } from "react-toastify";

const App = () => {
    const [totalSaved, setTotalSaved] = useState(0);
    const [finalPath, setFinalPath] = useState(null);
    const [loading, setLoading] = useState(null);
    const [redir, setRedir] = useState(false);
    const [list, setList] = useContext(ListContext);

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
                // don't add duplicate files to list TODO THIS ISNT WORKING
                if (list.some((item) => item.oPath === file.path)) {
                    return false;
                }
                if (
                    file.split(".").pop() !== "js" &&
                    file.split(".").pop() !== "css" &&
                    file.split(".").pop() !== "html" &&
                    file.split(".").pop() !== "svg"
                ) {
                    // notify user about incompatible file types
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
            toast.info(
                `${incompatibleFiles} file(s) could not be minified due to incompatible file type.`,
                {}
            );
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
        handleFiles(e.dataTransfer.files);
    };

    // display toast for if file contains JSX
    ipcRenderer.on("minify:error-react", (e, data) => {
        toast.info(
            `${data.path
                .split("/")
                .pop()} could not be minified because the file contains JSX.`,
            {
                toastId: data.path,
            }
        );
    });

    // when file is dropped, this is the response from main process that the file was minified
    ipcRenderer.on("file:minified", (e, data) => {
        // if item's path already exists on list, don't add it
        // TODO: currently affected by memory leak bug if this if statement isn't here
        if (list.some((item) => item.path === data.path)) {
            return false;
        } else {
            let newList = list;
            newList.push({
                name: data.name,
                path: data.path,
                type: data.type,
                oSize: data.oSize,
                nSize: data.nSize,
                oPath: data.oPath,
                newName: data.newName,
            });

            setList(newList);
            console.log(list);
        }
    });

    return (
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
            {redir}
            <ToastContainer
                position="top-center"
                transition={Zoom}
                autoClose={3000}
                hideProgressBar={false}
                pauseOnHover={false}
                newestOnTop={true}
                closeOnClick
            />
        </Switch>
    );
};

export default withRouter(App);
