import React, { useState } from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import "../sass/main.scss";
import Start from "./Start";
import List from "./List";
import Finish from "./Finish";

const App = () => {
    const [totalSaved, setTotalSaved] = useState(0);
    const [finalPath, setFinalPath] = useState(null);
    const [loading, setLoading] = useState(null);

    const handleLoading = (value) => {
        setLoading(value);
    };

    const getTotalSaved = (amount) => {
        setTotalSaved(amount);
    };

    const getFinalPath = (path) => {
        setFinalPath(path);
    };

    return (
        <Router>
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
                    <Start loading={handleLoading} />
                </Route>
            </Switch>
        </Router>
    );
};

export default App;
