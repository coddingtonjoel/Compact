import React, { useState, useEffect, useContext } from "react";
import { Redirect } from "react-router-dom";
import drop from "../../assets/images/drop.svg";
import { ipcRenderer } from "electron";
import { ListContext } from "../context/ListContext";

const Start = (props) => {
    const [list, setList] = useContext(ListContext);
    const [redir, setRedir] = useState(false);

    return (
        <div
            className="start"
            onDrop={() => {
                setRedir(<Redirect to="/list" />);
            }}>
            <div className="start-drop">
                <img src={drop} draggable="false" alt="" />
                <p>Drop files or folders here to minify.</p>
            </div>
            {redir}
        </div>
    );
};

export default Start;
