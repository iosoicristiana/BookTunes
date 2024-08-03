import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ConfigProvider } from "antd";
import { ThemeProvider, useTheme } from "./theming/themeContext";

import "antd/dist/reset.css"; // for Ant Design version 5+

const root = ReactDOM.createRoot(document.getElementById("root"));

const ThemedApp = () => {
  const { themeConfig } = useTheme(); // Access the theme config from context

  return (
    <ConfigProvider theme={themeConfig}>
      <App />
    </ConfigProvider>
  );
};

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  </React.StrictMode>
);
