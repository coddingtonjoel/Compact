import React from "react";
import { ipcRenderer, shell } from "electron";
import visible from "../../assets/images/visible.svg";
import close from "../../assets/images/close.svg";
import html from "../../assets/images/html.png";
import css from "../../assets/images/css.png";
import js from "../../assets/images/js.png";

const Item = (props) => {
    // identify icon from type given
    let icon;

    switch (props.type) {
        case "html":
            icon = html;
            break;
        case "css":
            icon = css;
            break;
        case "js":
            icon = js;
            break;
    }

    return (
        <div className="item">
            <img
                onClick={() => {
                    ipcRenderer.send("file:remove", {
                        path: props.path,
                    });
                    props.remove(props.path);
                }}
                className="item-close"
                src={close}
                alt=""
                draggable="false"
            />
            <img className="item-type" src={icon} alt="" draggable="false" />
            <span className="item-name">{props.name}</span>
            <span className="item-size">
                {props.oSize}&nbsp;&#8594;&nbsp;{props.nSize}
            </span>
            <img
                className="item-visible"
                src={visible}
                alt=""
                draggable="false"
                onClick={() => {
                    shell.showItemInFolder(props.oPath);
                }}
            />
        </div>
    );
};

export default Item;
