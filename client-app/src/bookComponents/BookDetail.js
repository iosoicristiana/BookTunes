import React, { useState, useEffect } from "react";
import {
  Layout,
  Row,
  Col,
  Typography,
  Button,
  Card,
  Spin,
  Tag,
  Rate,
  Tooltip,
  Modal,
  Result,
} from "antd";
import {
  StarOutlined,
  StarFilled,
  ReadOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import GoogleBooksAPI from "./GoogleBooksAPI"; // Custom API module to fetch book details from Google Books API
import { useTheme } from "../theming/themeContext"; // Import the useTheme hook
import { useBookContext } from "./BookContext";
import PlaylistPreferencesModal from "../spotifyComponents/PlaylistPreferencesModal";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const BookDetails = () => {
  const { id } = useParams();
  const {
    fetchBookDetail,
    bookDetail,
    addToFavorites,
    removeFromFavorites,
    favorites,
    isLoading,
  } = useBookContext();
  const [isFavorite, setIsFavorite] = useState(false);
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(null);
  const [reviewsCount, setReviewsCount] = useState(null);
  const [ModalVisible, setModalVisible] = useState(false);
  const [SuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [generatedPlaylist, setGeneratedPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);

  const { themeConfig } = useTheme(); // Accessing theme configuration
  const { token } = themeConfig;

  const navigate = useNavigate();

  useEffect(() => {
    fetchBookDetail(id);
  }, [fetchBookDetail, id]);

  useEffect(() => {
    if (bookDetail) {
      const fetchGoogleBookData = async () => {
        const googleBookData = await GoogleBooksAPI.fetchBookDescription(
          bookDetail.title,
          bookDetail.authors.map((a) => a.name).join(", ")
        );
        setDescription(
          googleBookData.description || "No description available."
        );
        setRating(googleBookData.averageRating || null);
        setReviewsCount(googleBookData.reviewsCount || null);

        // Use the highest quality Google Books image if available
        const googleCover =
          googleBookData.imageLinks?.extraLarge ||
          googleBookData.imageLinks?.large ||
          googleBookData.imageLinks?.medium ||
          googleBookData.imageLinks?.small ||
          googleBookData.imageLinks?.thumbnail;
        const existingCover = bookDetail.formats["image/jpeg"];

        bookDetail.cover =
          existingCover ||
          googleCover ||
          "https://bookstoreromanceday.org/wp-content/uploads/2020/08/book-cover-placeholder.png";
      };

      fetchGoogleBookData();
      setIsFavorite(favorites.some((fav) => fav.id === bookDetail.id));
    }
  }, [bookDetail, favorites]);

  const handleFavoriteClick = () => {
    if (isFavorite) {
      removeFromFavorites(bookDetail.id);
    } else {
      addToFavorites(bookDetail);
    }
    setIsFavorite(!isFavorite);
  };

  const handleGeneratePlaylist = async (preferences) => {
    try {
      setLoading(true);
      console.log("Generating playlist with preferences:", preferences);
      const response = await fetch(
        `https://localhost:7252/api/Playlist/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ bookId: bookDetail.id, ...preferences }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        setGeneratedPlaylist(result);
        console.log("Playlist generated successfully:", result);
        setSuccessModalVisible(true);
      } else {
        console.log(result.message);
        Modal.error({
          title: "Failed to generate playlist",
          content:
            "An error occurred while generating the playlist. Please try again.",
        });
      }
    } catch (error) {
      Modal.error({
        title: "Error",
        content:
          "An error occurred while generating the playlist. Please try again.",
      });
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  const handleReadBookClick = () => {
    navigate(`/read/${bookDetail.id}`);
  };

  if (isLoading || !bookDetail) {
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

  const tagStyle = {
    marginBottom: "5px",
    textDecoration: "none",
    lineHeight: "1.2",
  }; // Adjust the line height as needed

  return (
    <Layout className="layout">
      <Content style={{ padding: "50px", background: token.colorBgBase }}>
        <Card
          style={{
            marginBottom: "20px",
            background: token.colorBgContainer,
            borderRadius: "10px",
            padding: "20px",
            borderColor: token.colorBorder,
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <img
                alt={bookDetail.title}
                src={bookDetail.cover}
                style={{ width: "100%", borderRadius: "10px" }}
              />
            </Col>
            <Col xs={24} sm={16}>
              <Title level={2} style={{ color: token.colorText }}>
                {bookDetail.title}
              </Title>
              <Title level={4} style={{ color: token.colorText }}>
                {bookDetail.authors.map((author) => author.name).join(", ")}
              </Title>
              {rating && (
                <div style={{ marginBottom: "20px" }}>
                  <Tooltip
                    overlayInnerStyle={{ borderRadius: "4px" }}
                    title={`Google Books Rating: ${rating} (${reviewsCount} reviews)`}
                  >
                    <span>
                      <Rate disabled defaultValue={rating} />
                    </span>
                  </Tooltip>
                </div>
              )}
              <Paragraph style={{ color: token.colorText }}>
                {description}
              </Paragraph>
              <div
                style={{
                  marginTop: "20px",
                  color: token.colorText,
                }}
              >
                <Title level={5} style={{ color: token.colorText }}>
                  Subjects
                </Title>
                {bookDetail.subjects.map((subject) => (
                  <Tag key={subject} color="#D4AF37" style={tagStyle}>
                    {subject}
                  </Tag>
                ))}
              </div>
              <div
                style={{
                  marginTop: "20px",
                  color: token.colorText,
                }}
              >
                <Title level={5} style={{ color: token.colorText }}>
                  Bookshelves
                </Title>
                {bookDetail.bookshelves.map((bookshelf) => (
                  <Tag key={bookshelf} color="#4682B4" style={tagStyle}>
                    {bookshelf}
                  </Tag>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "20px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  icon={
                    isFavorite ? (
                      <StarFilled style={{ color: "#fadb14" }} />
                    ) : (
                      <StarOutlined />
                    )
                  }
                  onClick={handleFavoriteClick}
                  style={{
                    backgroundColor: token.colorPrimary,
                    borderColor: token.colorPrimary,
                    color: token.colorText,
                    minWidth: "30%",
                  }}
                >
                  {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlayCircleOutlined />}
                  onClick={() => setModalVisible(true)}
                  style={{
                    backgroundColor: token.colorPrimary,
                    borderColor: token.colorPrimary,
                    color: token.colorText,
                    minWidth: "30%",
                  }}
                  loading={loading}
                >
                  Generate Playlist
                </Button>
                <PlaylistPreferencesModal
                  visible={ModalVisible}
                  onCancel={() => setModalVisible(false)}
                  onSubmit={handleGeneratePlaylist}
                  loading={loading}
                />
                <Button
                  type="primary"
                  size="large"
                  icon={<ReadOutlined />}
                  onClick={handleReadBookClick}
                  style={{
                    backgroundColor: token.colorPrimary,
                    borderColor: token.colorPrimary,
                    color: token.colorText,
                    minWidth: "30%",
                  }}
                >
                  Read Book
                </Button>
              </div>
            </Col>
          </Row>
        </Card>
      </Content>
      <Modal
        open={SuccessModalVisible}
        title="Success"
        onCancel={() => setSuccessModalVisible(false)}
        footer={[null]}
      >
        <Result
          status="success"
          title="Playlist Generated Successfully"
          subTitle={`Your playlist "${generatedPlaylist?.name}" has been generated successfully.`}
          extra={[
            <Button
              type="primary"
              key="view"
              onClick={() => {
                setSuccessModalVisible(false);
                navigate(`/playlist/${generatedPlaylist.id}`);
              }}
            >
              View Playlist
            </Button>,
          ]}
        />
      </Modal>
    </Layout>
  );
};

export default BookDetails;
