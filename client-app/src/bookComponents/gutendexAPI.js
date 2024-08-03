const API_BASE_URL = "https://gutendex.com/books";

const fetchBooksByPage = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}?${query}`);
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
export { fetchBooksByPage, searchBooksByPage, fetchBookDetail };
