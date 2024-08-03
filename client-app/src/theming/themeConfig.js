// src/themeConfig.js
import { theme } from "antd";

// Define updated color schemes for light and dark themes
const lightColors = {
  colorBgBase: "#faf7de", // Light grey for background
  colorPrimary: "#12822c", // Green for primary actions
  colorSecondary: "#dcf0bd", // Light grey for secondary backgrounds
  colorTertiary: "#6C757D", // Dark grey for tertiary items
  colorText: "#212529", // Dark text
  colorTextSecondary: "#495057", // Medium grey for secondary text
  colorBorder: "#CED4DA", // Light border color
  colorLink: "#28a745", // Green for links
  colorLinkHover: "#218838", // Darker green for hovered links
  bgWhite: "#ffffff", // White background
};

const darkColors = {
  colorBgBase: "#1C1C1E", // Dark grey for background
  colorPrimary: "#34c759", // Green for primary actions
  colorSecondary: "#2C2C2E", // Darker grey for secondary backgrounds
  colorTertiary: "#38383A", // Medium dark grey for tertiary items
  colorText: "#E5E5EA", // Light text
  colorTextSecondary: "#A1A1AA", // Lighter grey for secondary text
  colorBorder: "#48484A", // Medium grey border color
  colorLink: "#34c759", // Green for links
  colorLinkHover: "#32a852", // Lighter green for hovered links
  bgWhite: "#1C1C1E", // Dark background
};

// Define tokens for light and dark themes
const lightToken = {
  colorPrimary: lightColors.colorPrimary,
  colorBgBase: lightColors.colorBgBase,
  colorBgContainer: lightColors.colorSecondary,
  colorWhite: lightColors.bgWhite,
  colorText: lightColors.colorText,
  colorTextSecondary: lightColors.colorTextSecondary,
  colorBorder: lightColors.colorBorder,
  colorLink: lightColors.colorLink,
  colorLinkHover: lightColors.colorLinkHover,
  fontSizeSM: "14px",
  lineHeightHeading2: "1.25",
  borderRadius: "4px",
};

const darkToken = {
  colorPrimary: darkColors.colorPrimary,
  colorBgBase: darkColors.colorBgBase,
  colorBgContainer: darkColors.colorSecondary,
  colorWhite: darkColors.bgWhite,
  colorText: darkColors.colorText,
  colorTextSecondary: darkColors.colorTextSecondary,
  colorBorder: darkColors.colorBorder,
  colorLink: darkColors.colorLink,
  colorLinkHover: darkColors.colorLinkHover,
  fontSizeSM: "14px",
  lineHeightHeading2: "1.25",
  borderRadius: "4px",
};

// Define component-specific styles for light and dark themes
const lightComponents = {
  Layout: {
    headerBg: lightColors.colorSecondary,
    siderBg: lightColors.colorSecondary,
  },
  Menu: {
    itemColor: lightColors.colorPrimary,
    itemSelectedColor: lightColors.bgWhite,
    itemHoverBg: lightColors.colorTertiary,
    itemSelectedBg: lightColors.colorTertiary,
    itemBorderRadius: 20,
    itemHoverColor: lightColors.colorPrimary,
  },
  Button: {
    colorPrimary: lightColors.colorPrimary,
    colorText: lightColors.colorText,
    colorBorder: lightColors.colorBorder,
  },
};

const darkComponents = {
  Layout: {
    headerBg: darkColors.colorSecondary,
    siderBg: darkColors.colorSecondary,
  },
  Menu: {
    itemColor: darkColors.colorPrimary,
    itemSelectedColor: darkColors.bgWhite,
    itemHoverBg: darkColors.colorTertiary,
    itemSelectedBg: darkColors.colorTertiary,
    itemBorderRadius: 20,
    itemHoverColor: darkColors.colorPrimary,
  },
  Button: {
    colorPrimary: darkColors.colorPrimary,
    colorText: darkColors.colorText,
    colorBorder: darkColors.colorBorder,
  },
};

// Export theme configurations for light and dark modes
export const lightThemeConfig = {
  token: lightToken,
  components: lightComponents,
  algorithm: theme.defaultAlgorithm,
};

export const darkThemeConfig = {
  token: darkToken,
  components: darkComponents,
  algorithm: theme.darkAlgorithm,
};
