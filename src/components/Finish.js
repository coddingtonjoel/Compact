import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import path from "path";
import { shell } from "electron";
import electron from "electron";
import rimraf from "rimraf";
import check from "../../assets/images/done.svg";

const Finish = (props) => {
    const [redir, setRedir] = useState(null);

    const handleStartAgain = () => {
        const userDataPath = (electron.app || electron.remote.app).getPath(
            "userData"
        );
        rimraf(path.join(userDataPath, "temp"), () => {
            setRedir(<Redirect to="/" />);
        });
    };

    return (
        <div className="finish">
            <div className="finish-main">
                <img
                    className="finish-main-check"
                    src={check}
                    alt=""
                    draggable={false}
                />
                <p className="finish-main-head">Finished minifying files.</p>
                <p className="finish-main-sub">
                    You saved {props.totalSaved} of space!
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
