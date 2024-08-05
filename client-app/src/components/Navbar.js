import React from "react";
import { Layout, Menu, Switch, Drawer, Button } from "antd";
import {
  BookOutlined,
  StarOutlined,
  PlayCircleOutlined,
  UserOutlined,
  GlobalOutlined,
  BulbOutlined,
  BulbFilled,
  MenuOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useTheme } from "../theming/themeContext";
import { useState } from "react";
import "./Navbar.css";

const { Header } = Layout;

const Navbar = () => {
  const { isDarkMode, toggleTheme, themeConfig } = useTheme();
  const styles = themeConfig.components;
  const navigate = useNavigate(); // Initialize navigate
  const [visible, setVisible] = useState(false);

  // Define menu items using the `items` prop
  const menuItems = [
    {
      key: "1",
      icon: <BookOutlined />,
      label: "Browse Books",
      style: { color: styles.Menu.itemColor },
      onClick: () => navigate("/books"), // Navigate to Browse Books
    },
    {
      key: "2",
      icon: <StarOutlined />,
      label: "My Library",
      style: { color: styles.Menu.itemColor },
      onClick: () => navigate("/library"), // Navigate to My Library
    },
    {
      key: "3",
      icon: <PlayCircleOutlined />,
      label: "My Playlists",
      style: { color: styles.Menu.itemColor },
      onClick: () => navigate("/myplaylists"), // Navigate to My Playlists
    },
    {
      key: "4",
      icon: <GlobalOutlined />,
      label: "Community Playlists",
      style: { color: styles.Menu.itemColor },
      onClick: () => navigate("/community-playlists"), // Navigate to Community Playlists
    },
    {
      key: "5",
      icon: <UserOutlined />,
      label: "Profile",
      style: { color: styles.Menu.itemColor },
      onClick: () => navigate("/profile"), // Navigate to Profile
    },
  ];

  const toggleDrawer = () => {
    setVisible(!visible);
  };

  return (
    <Header
      className="navbar-header"
      style={{ backgroundColor: styles.Layout.headerBg }}
    >
      <div
        className="logo"
        onClick={() => navigate("/")} // Navigate to Home
      >
        BookTunes
      </div>
      <Button
        className="menu-button"
        type="primary"
        icon={<MenuOutlined />}
        onClick={toggleDrawer}
      />
      <Drawer
        title="Menu"
        placement="right"
        closable
        onClose={toggleDrawer}
        open={visible}
      >
        <Menu
          mode="vertical"
          items={menuItems}
          style={{
            backgroundColor: styles.Layout.headerBg,
          }}
        />
      </Drawer>
      <div className="menu-container">
        <Menu
          theme={isDarkMode ? "dark" : "light"}
          mode="horizontal"
          items={menuItems}
          className="menu-desktop"
          style={{
            backgroundColor: styles.Layout.headerBg,
          }}
        />
        <Switch
          checkedChildren={
            <BulbFilled style={{ color: styles.Button.colorPrimary }} />
          }
          unCheckedChildren={
            <BulbOutlined style={{ color: styles.Button.colorPrimary }} />
          }
          checked={isDarkMode}
          onChange={toggleTheme}
          className="theme-switch"
        />
      </div>
    </Header>
  );
};

export default Navbar;
