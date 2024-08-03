import React from "react";
import { Layout } from "antd";
import Navbar from "./Navbar";

const { Header, Content, Footer } = Layout;

const MainLayout = ({ children }) => {
  return (
    <Layout className="layout">
      <Header
        style={{ position: "fixed", zIndex: 1, width: "100%", padding: "0" }}
      >
        <Navbar />
      </Header>
      <Content style={{ padding: "0", minHeight: "100vh", marginTop: "30px" }}>
        <div style={{ minHeight: 380 }}>{children}</div>
      </Content>
      <Footer style={{ textAlign: "center" }}>BookTunes ©2024</Footer>
    </Layout>
  );
};

export default MainLayout;
