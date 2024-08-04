import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Home from "./components/Home";
import AuthCallback from "./spotifyComponents/authCallback";
import Profile from "./spotifyComponents/Profile";
import Books from "./bookComponents/Books";
import BookDetail from "./bookComponents/BookDetail";
import { BookProvider } from "./bookComponents/BookContext";
import MyLibrary from "./bookComponents/MyLibrary";
import Reader from "./bookComponents/Reader";

//import About from "./components/About";

function App() {
  return (
    <BookProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/callback" element={<AuthCallback />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/books" element={<Books />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/library" element={<MyLibrary />} />
            <Route path="/read/:id" element={<Reader />} />
            {/* 
           <Route path="/about" element={<About />} />
           More routes can be added here */}
          </Routes>
        </MainLayout>
      </Router>
    </BookProvider>
  );
}

export default App;
