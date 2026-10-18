import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./demo.css";
// After Tailwind, as in the apps: theme.css's low-weight rules follow its base rules.
import "../theme.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
