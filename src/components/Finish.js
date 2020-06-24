import React, { useState, useContext } from "react";
import { Redirect } from "react-router-dom";
import path from "path";
import { shell } from "electron";
import electron from "electron";
import { ListContext } from "../context/ListContext";
import rimraf from "rimraf";
import log from "electron-log";
import check from "../../assets/images/done.svg";

const Finish = (props) => {
    const [redir, setRedir] = useState(null);
    const [list, setList] = useContext(ListContext);

    const handleStartAgain = () => {
        const userDataPath = (electron.app || electron.remote.app).getPath(
            "userData"
        );
        rimraf(path.join(userDataPath, "temp"), () => {
            log.info("Temporary files cleared");
            let newList = list;
            newList.forEach((file) => list.pop());
            setList(newList);
            setRedir(<Redirect to="/" />);
            console.log(list);
        });
    };

    return (
        <div
            className="finish"
            onDrop={() => {
                setRedir(<Redirect to="/list" />);
            }}>
            <div className="finish-main">
                <img
                    className="finish-main-check"
                    src={check}
                    alt=""
                    draggable={false}
                />
                <p className="finish-main-head">Finished minifying files.</p>
                <p className="finish-main-sub">
                    You saved {props.totalSaved} worth of space!
                </p>
            </div>
            <div className="finish-buttons-container">
                <button
                    onClick={handleStartAgain}
                    className="btn waves-effect black-text list-button z-depth-1">
                    START AGAIN
                </button>
                <button
                    onClick={() => {
                        shell.openPath(
                            path.join(props.finalPath, "compact-min")
                        );
                    }}
                    className="btn waves-effect black-text list-button z-depth-1">
                    REVEAL FILES
                </button>
            </div>
            {redir}
        </div>
    );
};

export default Finish;
