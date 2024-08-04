import React, { useState, useEffect } from "react";
import {
  Layout,
  Row,
  Col,
  Input,
  Spin,
  Alert,
  Pagination,
  DatePicker,
  Dropdown,
  Menu,
  Button,
  Typography,
  Card,
  Modal,
} from "antd";
import {
  DownOutlined,
  FilterOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import BookCard from "./BookCard";
import { useBookContext } from "./BookContext";
import { useNavigate, useLocation } from "react-router-dom";
import moment from "moment";

const { Content } = Layout;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { Title } = Typography;

const Books = () => {
  const { books, isLoading, error, fetchBooks, totalBooks } = useBookContext();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const [searchTerm, setSearchTerm] = useState(query.get("search") || "");
  const [currentPage, setCurrentPage] = useState(
    parseInt(query.get("page"), 10) || 1
  );
  const [booksPerPage, setBooksPerPage] = useState(
    parseInt(query.get("pageSize"), 10) || 12
  ); // Number of books per page
  const [sortBy, setSortBy] = useState(
    query.get("sort") || "popularity_descending"
  ); // Sort by popularity or ascending
  const [authorYearRange, setAuthorYearRange] = useState([null, null]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const params = {
      search: searchTerm,
      page: currentPage,
      pageSize: booksPerPage,
      sort: sortBy,
    };
    if (authorYearRange[0] && authorYearRange[1]) {
      params.author_year_start = authorYearRange[0];
      params.author_year_end = authorYearRange[1];
    }

    fetchBooks(params); // Fetch books on component mount and when parameters change
  }, [
    fetchBooks,
    currentPage,
    searchTerm,
    sortBy,
    booksPerPage,
    authorYearRange,
  ]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on new search
    navigate(`?search=${value}&page=1&sort=${sortBy}&pageSize=${booksPerPage}`);
  };

  const handleSortChange = ({ key }) => {
    setSortBy(key);
    setCurrentPage(1); // Reset to first page on new sort
    navigate(
      `?search=${searchTerm}&page=1&sort=${key}&pageSize=${booksPerPage}`
    );
  };

  const handleYearRangeChange = (dates, dateStrings) => {
    setAuthorYearRange(
      dateStrings.map((date) => (date ? parseInt(date) : null))
    );
    setCurrentPage(1); // Reset to first page on new filter
    navigate(
      `?search=${searchTerm}&page=1&sort=${sortBy}&pageSize=${booksPerPage}&author_year_start=${dateStrings[0]}&author_year_end=${dateStrings[1]}`
    );
    setIsModalVisible(false);
  };

  // Change page
  const paginate = (pageNumber, pageSize) => {
    setCurrentPage(pageNumber);
    setBooksPerPage(pageSize);
    navigate(
      `?search=${searchTerm}&page=${pageNumber}&sort=${sortBy}&pageSize=${pageSize}`
    );
  };

  const sortMenuItems = [
    {
      key: "popularity_descending",
      label: "Popularity Descending",
    },
    {
      key: "popularity_ascending",
      label: "Popularity Ascending",
    },
    {
      key: "ascending",
      label: "ID Ascending",
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Layout className="layout">
      <Content style={{ padding: "50px" }}>
        <Card
          style={{
            marginBottom: "20px",
            backgroundImage:
              "url(https://images.unsplash.com/photo-1588580000645-4562a6d2c839?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "10px",
            color: "white",
            marginTop: "-40px",
            padding: "10px 20px",
            position: "relative",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)", // Increased opacity for better contrast
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Title style={{ color: "white" }}>
                Find Your Next Favorite Book
              </Title>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  alignItems: "center",
                  marginTop: "20px",
                  justifyContent: "center",
                }}
              >
                <Search
                  placeholder="Search for books"
                  onSearch={handleSearch}
                  style={{
                    flex: 1,
                    minWidth: "200px",
                    //backgroundColor: "rgba(255, 255, 255, 0.8)", //
                    borderRadius: "5px",
                  }}
                />
                <Dropdown
                  overlay={
                    <Menu items={sortMenuItems} onClick={handleSortChange} />
                  }
                >
                  <Button
                    style={{
                      //backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: "5px",
                    }}
                  >
                    <SortAscendingOutlined /> Sort By <DownOutlined />
                  </Button>
                </Dropdown>
                <Button
                  onClick={showModal}
                  style={{
                    //backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "5px",
                  }}
                >
                  <FilterOutlined /> Filter By <DownOutlined />
                </Button>
                <Modal
                  title="Filter by Author's Time Period"
                  open={isModalVisible}
                  onCancel={handleCancel}
                  footer={null}
                >
                  <RangePicker
                    picker="year"
                    onChange={handleYearRangeChange}
                    style={{ minWidth: "200px" }}
                    value={
                      authorYearRange[0] && authorYearRange[1]
                        ? [
                            moment(authorYearRange[0]),
                            moment(authorYearRange[1]),
                          ]
                        : []
                    }
                  />
                </Modal>
              </div>
            </div>
          </div>
        </Card>
        {isLoading ? (
          <Spin size="large" tip="Loading books...">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "50vh",
              }}
            ></div>
          </Spin>
        ) : error ? (
          <Alert
            message="Error"
            description={error.message}
            type="error"
            showIcon
          />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {books.map((book) => (
                <Col key={book.id} xs={24} sm={12} md={8} lg={6}>
                  <BookCard book={book} />
                </Col>
              ))}
            </Row>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <Pagination
                current={currentPage}
                total={totalBooks}
                pageSize={booksPerPage}
                onChange={paginate}
                showSizeChanger
                pageSizeOptions={["12", "24", "48"]}
                onShowSizeChange={paginate}
              />
            </div>
          </>
        )}
      </Content>
    </Layout>
  );
};

export default Books;
