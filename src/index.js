import React from "react";
import { render } from "react-dom";
import App from "./components/App";
import { ListProvider } from "./context/ListContext";
import { HashRouter as Router } from "react-router-dom";

let root = document.createElement("div");

root.id = "root";
document.body.appendChild(root);

render(
    <ListProvider>
        <Router>
            <App />
        </Router>
    </ListProvider>,

    document.getElementById("root")
);
