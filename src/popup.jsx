import React from "react";
import ReactDOM from "react-dom/client";
import Popup from "./pages/Popup";

const root = ReactDOM.createRoot(
  document.getElementById("app-root")
);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);