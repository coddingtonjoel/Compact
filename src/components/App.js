import React, { useState } from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { ipcRenderer } from "electron";
import "../sass/main.scss";
import Start from "./Start";
import List from "./List";

const App = () => {
    const [list, setList] = useState([]);

    // remove specific item from list (passed up: App.js <- List.js <- Item.js)
    const handleRemove = (path) => {
        const newList = list.filter((item) => item.path !== path);
        setList(newList);
    };

    ipcRenderer.on("file:minified", (e, data) => {
        // if item's path already exists on list, don't add it
        if (list.some((item) => item.path === data.path)) {
            return false;
        } else {
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
        }
    });

    return (
        <Router>
            <Switch>
                <Route exact path="/list">
                    <List
                        fileList={list}
                        remove={handleRemove}
                        clearList={() => {
                            setList([]);
                        }}
                    />
                </Route>
                />
                <Route exact path="/" component={Start} />
            </Switch>
        </Router>
    );
};

export default App;
