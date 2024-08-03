import React, { createContext, useContext, useState, useMemo } from "react";
import { lightThemeConfig, darkThemeConfig } from "./themeConfig"; // ensure path correctness

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false); // default to light mode
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const themeConfig = useMemo(() => {
    return isDarkMode ? darkThemeConfig : lightThemeConfig;
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ themeConfig, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
