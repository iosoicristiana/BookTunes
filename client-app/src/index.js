import React from "react";
import App from "./App";
import { createRoot } from "react-dom/client";

import "antd/dist/reset.css";

const Main = () => {
  return <App />;
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<Main />);
