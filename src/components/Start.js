import React, { useState, useContext } from "react";
import { Redirect } from "react-router-dom";
import drop from "../../assets/images/drop.svg";
import { ipcRenderer } from "electron";
import { ListContext } from "../context/ListContext";

const Start = (props) => {
    const [list, setList] = useContext(ListContext);
    const [redir, setRedir] = useState(false);

    const handleOpen = () => {
        ipcRenderer.send("start:open");
    };

    return (
        <div
            className="start"
            onDrop={() => {
                setRedir(<Redirect to="/list" />);
            }}>
            <div className="start-drop">
                <img src={drop} draggable={false} alt="" />
                <p>Drop files or folders here to minify.</p>
                <div>
                    <p>or alternatively,</p>
                    <button
                        onClick={handleOpen}
                        className="btn waves-effect black-text list-button z-depth-1 start-open">
                        OPEN FILES
                    </button>
                </div>
            </div>
            {redir}
        </div>
    );
};

export default Start;
