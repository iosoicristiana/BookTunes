const API_BASE_URL = "https://gutendex.com/books";

// Fetch books by page with the option to pass a direct URL for pagination
const fetchBooksByPage = async (params = {}, url = null) => {
  let requestUrl =
    url || `${API_BASE_URL}?${new URLSearchParams(params).toString()}`;

  const response = await fetch(requestUrl);

  if (!response.ok) {
    throw new Error(`Error fetching books: ${response.statusText}`);
  }

  return await response.json();
};

const searchBooksByPage = async (searchTerm, page = 1) => {
  const response = await fetch(
    `${API_BASE_URL}?search=${searchTerm}&languages=en&page=${page}`
  );
  if (!response.ok) {
    throw new Error(`Error searching books: ${response.statusText}`);
  }
  return await response.json();
};

const fetchBookDetail = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  if (!response.ok) {
    throw new Error(`Error fetching book details: ${response.statusText}`);
  }
  return await response.json();
};

// Fetch books directly by using the next or previous URL
const fetchBooksByUrl = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error fetching books: ${response.statusText}`);
  }

  return await response.json();
};

export {
  fetchBooksByPage,
  searchBooksByPage,
  fetchBookDetail,
  fetchBooksByUrl,
};
