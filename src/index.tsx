import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./app/App";
import { dropOutdatedState } from "./lib/storage/domain/storage";

dropOutdatedState();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root"),
);
