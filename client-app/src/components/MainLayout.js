import React from "react";
import { Layout } from "antd";
import Navbar from "./Navbar";
import { useTheme } from "../theming/themeContext";
import { PlayerProvider } from "../playerComponents/PlayerContext";
import Player from "../playerComponents/Player";

const { Header, Content, Footer } = Layout;

const MainLayout = ({ children }) => {
  const { themeConfig } = useTheme();
  const { token } = themeConfig;

  return (
    <PlayerProvider>
      <Layout className="layout" style={{ background: token.colorBgBase }}>
        <Header
          style={{
            position: "fixed",
            zIndex: 1,
            width: "100%",
            padding: "0",
            background: token.colorBgContainer,
          }}
        >
          <Navbar />
        </Header>
        <Content
          style={{
            padding: "0",
            minHeight: "100vh",
            marginTop: "64px",
            background: token.colorBgBase,
            color: token.colorText,
          }}
        >
          <div style={{ minHeight: 380 }}>{children}</div>
        </Content>
        <Footer
          style={{
            textAlign: "center",
            background: token.colorBgContainer,
            color: token.colorText,
          }}
        >
          BookTunes ©2024
        </Footer>
        <Player />
      </Layout>
    </PlayerProvider>
  );
};

export default MainLayout;
