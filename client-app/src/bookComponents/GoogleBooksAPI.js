import axios from "axios";

const GoogleBooksAPI = {
  fetchBookDescription: async (title, authors) => {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/books/v1/volumes",
        {
          params: {
            q: `${title}+inauthor:${authors}`,
            key: process.env.REACT_APP_GOOGLE_BOOKS_API_KEY,
          },
        }
      );

      const bookData = response.data.items[0].volumeInfo;
      return {
        description: bookData.description,
        averageRating: bookData.averageRating,
        publishedDate: bookData.publishedDate,
        reviewsCount: bookData.ratingsCount,
        imageLinks: bookData.imageLinks,
      };
    } catch (error) {
      console.error(
        "Error fetching book description from Google Books API:",
        error
      );
      return {
        description: "No description available.",
      };
    }
  },
};

export default GoogleBooksAPI;
