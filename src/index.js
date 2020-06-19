import React from "react";
import { render } from "react-dom";
import App from "./components/App";
import { ListProvider } from "./context/ListContext";

let root = document.createElement("div");

root.id = "root";
document.body.appendChild(root);

render(
    <ListProvider>
        <App />
    </ListProvider>,

    document.getElementById("root")
);
