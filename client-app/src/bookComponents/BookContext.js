import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import {
  fetchBooksByPage,
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
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(false); // Separate loading state for favorites
  const [error, setError] = useState(null);
  const [totalBooks, setTotalBooks] = useState(0);
  const [currentPage, setCurrentPage] = useState(
    parseInt(localStorage.getItem("currentPage")) || 1
  );

  // Define a cache object
  const cache = {};

  const fetchBooks = useCallback(
    async (params = {}) => {
      setIsLoading(true);
      setError(null);

      params.language = "en";
      params.topic = "fiction";
      params.page = currentPage;

      try {
        const cacheKey = JSON.stringify(params);
        if (cache[cacheKey]) {
          // Use cached data if available
          console.log("Using cached data for books");
          setBooks(cache[cacheKey].results);
          setTotalBooks(cache[cacheKey].count);
        } else {
          console.log("Fetching books from API");
          // Fetch data from API and update cache
          const data = await fetchBooksByPage(params);
          setBooks(data.results);
          setTotalBooks(data.count);
          cache[cacheKey] = data; // Cache the results
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage]
  );

  const fetchFavorites = useCallback(async () => {
    setIsFavoritesLoading(true);
    setError(null);
    try {
      console.log("Fetching favorites from backend");
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
        console.log("Favorites:", favoriteBooks);
        setFavorites(favoriteBooks);

        // Save to localStorage
        localStorage.setItem("favorites", JSON.stringify(favoriteBooks));
      } else {
        throw new Error("Failed to fetch favorites");
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      //setError(error);
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
      console.log("Adding book to favorites");
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

        // Save to localStorage
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
      console.log("Removing book from favorites");
      console.log("Book ID:", bookId);
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

        // Save to localStorage
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
    // Save current page to localStorage
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
