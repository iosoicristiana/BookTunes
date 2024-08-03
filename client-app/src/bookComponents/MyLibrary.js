import React, { useEffect } from "react";
import { Layout, Row, Col, Spin, Typography } from "antd";
import { useBookContext } from "./BookContext";
import BookCard from "./BookCard";
import { useTheme } from "../theming/themeContext";

const { Content } = Layout;
const { Title } = Typography;

const MyLibrary = () => {
  const { fetchFavorites, favorites, isFavoritesLoading } = useBookContext();
  const { themeConfig } = useTheme();
  const { token } = themeConfig;

  useEffect(() => {
    fetchFavorites(); // Fetch favorites when the component mounts
  }, [fetchFavorites]);

  if (isFavoritesLoading) {
    return (
      <Spin
        size="large"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      />
    );
  }

  return (
    <Layout className="layout" style={{ background: token.colorBgBase }}>
      <Content style={{ padding: "50px" }}>
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <Title level={2} style={{ color: token.colorText }}>
            My Library
          </Title>
        </div>
        {favorites.length === 0 ? (
          <div style={{ textAlign: "center", color: token.colorText }}>
            <Title level={4} style={{ color: token.colorText }}>
              You have no favorite books.
            </Title>
          </div>
        ) : (
          <Row gutter={[16, 16]} justify="center">
            {favorites.map((book) => (
              <Col key={book.id} xs={24} sm={12} md={8} lg={6}>
                <BookCard book={book} isFavorite />
              </Col>
            ))}
          </Row>
        )}
      </Content>
    </Layout>
  );
};

export default MyLibrary;
