import React from "react";
import { Layout, Typography, Card } from "antd";
import { useTheme } from "../theming/themeContext";
import { LoginButton } from "../spotifyComponents/LoginButton";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const Home = () => {
  const { themeConfig } = useTheme(); // Accessing theme configuration
  const { token } = themeConfig;

  const heroStyle = {
    backgroundImage:
      "url(https://images.unsplash.com/photo-1582751836565-74f64cc184cb?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)", // Ensure this path is correct
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "600px",
    textAlign: "center",
    backgroundColor: `rgba(${parseInt(
      token.colorBgBase.slice(1, 3),
      16
    )}, ${parseInt(token.colorBgBase.slice(3, 5), 16)}, ${parseInt(
      token.colorBgBase.slice(5, 7),
      16
    )}, 0.8)`,
    borderColor: token.colorBorder,
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    padding: "40px 20px",
  };

  return (
    <Layout className="layout" style={{ minHeight: "calc(100vh - 70px)" }}>
      <Content style={heroStyle}>
        <Card style={cardStyle}>
          <Title
            style={{
              color: token.colorPrimary,
              fontSize: "50px",
              fontWeight: "bold",
            }}
          >
            Welcome to Bookify
          </Title>
          <Paragraph style={{ color: token.colorText, fontSize: "15px" }}>
            Discover and save your favorite fiction books. Generate playlists
            based on the books you love.
          </Paragraph>

          <LoginButton />
        </Card>
      </Content>
    </Layout>
  );
};

export default Home;
