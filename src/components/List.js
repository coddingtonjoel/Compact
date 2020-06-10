import React, { useState } from "react";
import { Redirect } from "react-router-dom";
const dialog = require("electron").remote.dialog;
import Item from "./Item";

// TODO include a save dialog when they press minify files to select where they want to copy all the temp files to

const List = (props) => {
    const [redir, setRedir] = useState(null);

    const handleCancel = () => {
        // if cancel is pressed and list of files is empty, prompt user to make sure they want to cancel
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
                    }
                });
            setRedir(<Redirect to="/" />);
        }
        // otherwise, if list is empty, just go back to <Start /> w/o prompt
        else {
            setRedir(<Redirect to="/" />);
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
                    className="btn waves-effect black-text list-button z-depth-0">
                    CANCEL
                </button>
                <button className="btn waves-effect black-text list-button z-depth-0">
                    MINIFY FILES
                </button>
            </div>
            {redir}
        </div>
    );
};

export default List;
