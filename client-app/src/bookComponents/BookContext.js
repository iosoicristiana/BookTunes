import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import {
  fetchBooksByPage,
  fetchBooksByUrl,
  fetchBookDetail as fetchBookDetailAPI,
} from "./gutendexAPI";

const BookContext = createContext();

export const useBookContext = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error("useBookContext must be used within a BookProvider");
  }
  return context;
};

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [bookDetail, setBookDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalBooks, setTotalBooks] = useState(0);
  const [currentPage, setCurrentPage] = useState(
    parseInt(localStorage.getItem("currentPage")) || 1
  );
  //const booksPerPage = 32;
  const [nextPageUrl, setNextPageUrl] = useState(null); // URL for the next page
  const [prevPageUrl, setPrevPageUrl] = useState(null); // URL for the previous pag

  const cache = {};
  const fetchBooks = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch books using the provided parameters
      const data = await fetchBooksByPage(params);

      setBooks(data.results);
      setTotalBooks(data.count);
      setNextPageUrl(data.next); // Save the next page URL
      setPrevPageUrl(data.previous); // Save the previous page URL
    } catch (error) {
      console.error("Error fetching books:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBooksUsingUrl = useCallback(async (url) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch books using the direct URL
      const data = await fetchBooksByUrl(url);

      setBooks(data.results);
      setTotalBooks(data.count);
      setNextPageUrl(data.next); // Save the next page URL
      setPrevPageUrl(data.previous); // Save the previous page URL
    } catch (error) {
      console.error("Error fetching books:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const goToNextPage = () => {
    if (nextPageUrl) {
      setCurrentPage((prev) => prev + 1);
      fetchBooksUsingUrl(nextPageUrl);
    }
  };

  const goToPrevPage = () => {
    if (prevPageUrl) {
      setCurrentPage((prev) => prev - 1);
      fetchBooksUsingUrl(prevPageUrl);
    }
  };

  const fetchFavorites = useCallback(async () => {
    setIsFavoritesLoading(true);
    setError(null);
    try {
      const response = await fetch("https://localhost:7252/api/Book/getBooks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const favoriteBooks = data.$values || [];
        setFavorites(favoriteBooks);
        localStorage.setItem("favorites", JSON.stringify(favoriteBooks));
      } else {
        throw new Error("Failed to fetch favorites");
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setFavorites([]);
    } finally {
      setIsFavoritesLoading(false);
    }
  }, []);

  const fetchBookDetail = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchBookDetailAPI(id);
      setBookDetail(data);
    } catch (error) {
      console.error("Error fetching book detail:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToFavorites = async (book) => {
    try {
      const response = await fetch("https://localhost:7252/api/Book/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(book),
      });

      if (response.ok) {
        setFavorites((prevFavorites) => [...prevFavorites, book]);
        localStorage.setItem("favorites", JSON.stringify(favorites));
      } else {
        console.error("Failed to add to favorites");
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  };

  const removeFromFavorites = async (bookId) => {
    try {
      const response = await fetch(
        `https://localhost:7252/api/Book/remove/${bookId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ bookId }),
        }
      );

      if (response.ok) {
        setFavorites((prevFavorites) =>
          prevFavorites.filter((book) => book.id !== bookId)
        );
        localStorage.setItem("favorites", JSON.stringify(favorites));
      } else {
        console.error("Failed to remove from favorites");
        const data = await response.json();
        console.error("response from server:", data);
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  return (
    <BookContext.Provider
      value={{
        books,
        bookDetail,
        fetchBooks,
        fetchBookDetail,
        addToFavorites,
        removeFromFavorites,
        fetchFavorites,
        favorites,
        isLoading,
        isFavoritesLoading,
        error,
        totalBooks,
        currentPage,
        setCurrentPage,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};
