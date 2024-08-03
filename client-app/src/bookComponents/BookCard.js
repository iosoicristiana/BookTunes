import React from "react";
import { Card, Button, Tooltip } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useBookContext } from "./BookContext";
import { StarOutlined, StarFilled } from "@ant-design/icons";
import { useTheme } from "../theming/themeContext";

const { Meta } = Card;

const BookCard = ({ book }) => {
  const { addToFavorites, removeFromFavorites, favorites } = useBookContext();
  const navigate = useNavigate();
  const { themeConfig } = useTheme();
  const { token } = themeConfig;

  const isBookFavorite = favorites.some((fav) => fav.id === book.id);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (isBookFavorite) {
      removeFromFavorites(book.id);
    } else {
      addToFavorites(book);
    }
  };

  const coverImage =
    book.cover ||
    book.formats["image/jpeg"] ||
    "https://bookstoreromanceday.org/wp-content/uploads/2020/08/book-cover-placeholder.png";

  const authorsArray = Array.isArray(book.authors?.$values)
    ? book.authors.$values
    : Array.isArray(book.authors)
    ? book.authors
    : [];

  const authors =
    authorsArray.length > 0
      ? authorsArray.map((author) => author.name).join(", ")
      : "Unknown Author";

  return (
    <Card
      hoverable
      style={{
        margin: "10px",
        borderRadius: "10px",
        overflow: "hidden",
        height: "300px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "transform 0.3s",
        background: token.colorBgContainer,
        borderColor: token.colorBorder,
      }}
      cover={
        <img
          alt={book.title}
          src={coverImage}
          style={{ height: "180px", objectFit: "cover" }}
        />
      }
      onClick={() => navigate(`/book/${book.id}`)}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <Meta
        title={
          <div
            style={{
              fontWeight: "bold",
              fontSize: "16px",
              color: token.colorText,
            }}
          >
            {book.title}
          </div>
        }
        description={
          <div
            style={{
              fontSize: "14px",
              color: "gray",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {authors}
          </div>
        }
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "5px",
        }}
      >
        <Tooltip
          title={isBookFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Button
            type="text"
            icon={
              isBookFavorite ? (
                <StarFilled style={{ color: "#fadb14" }} />
              ) : (
                <StarOutlined />
              )
            }
            onClick={handleFavoriteClick}
            style={{
              color: isBookFavorite ? "#fadb14" : "",
              transition: "all 0.3s ease",
              padding: "0",
            }}
          />
        </Tooltip>
        <Link to={`/book/${book.id}`}>
          <Button
            type="primary"
            style={{
              float: "right",
            }}
          >
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default BookCard;
