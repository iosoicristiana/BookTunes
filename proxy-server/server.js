import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const port = 3001;

app.use(cors());

app.get("/fetch-epub", async (req, res) => {
  const bookId = req.query.book_id;

  try {
    const response = await fetch(
      `https://www.gutenberg.org/ebooks/${bookId}.epub.noimages`
    );
    if (!response.ok) {
      return res.status(response.status).send(response.statusText);
    }
    const data = await response.buffer();
    res.set({
      "Content-Type": "application/epub+zip",
      "Content-Disposition": `attachment; filename="${bookId}.epub"`,
    });
    console.log("data", data);
    res.send(data);
  } catch (error) {
    console.error("Error fetching book content:", error);
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
