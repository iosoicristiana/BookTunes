import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider, App as AntApp } from "antd";
import MainLayout from "./components/MainLayout";
import Home from "./components/Home";
import AuthCallback from "./spotifyComponents/authCallback";
import Profile from "./spotifyComponents/Profile";
import Books from "./bookComponents/Books";
import BookDetail from "./bookComponents/BookDetail";
import { BookProvider } from "./bookComponents/BookContext";
import MyLibrary from "./bookComponents/MyLibrary";
import Reader from "./bookComponents/Reader";
import { ThemeProvider, useTheme } from "./theming/themeContext";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "./spotifyComponents/authContext";
import NotFound from "./components/NotFound";
import PlaylistDetail from "./spotifyComponents/PlaylistDetail";
import { Book } from "epubjs";
import MyPlaylists from "./spotifyComponents/MyPlaylists";

const AppContent = () => {
  const { themeConfig } = useTheme();

  return (
    <ConfigProvider theme={themeConfig}>
      <Router>
        <AuthProvider>
          <BookProvider>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/callback" element={<AuthCallback />} />
                <Route path="/profile" element={<Profile />} />
                <Route
                  path="/books"
                  element={
                    <ProtectedRoute>
                      <Books />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/book/:id"
                  element={
                    <ProtectedRoute>
                      <BookDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/library"
                  element={
                    <ProtectedRoute>
                      <MyLibrary />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/myplaylists"
                  element={
                    <ProtectedRoute>
                      <MyPlaylists />
                    </ProtectedRoute>
                  }
                />
                <Route path="/playlist/:id" element={<PlaylistDetail />} />
                <Route
                  path="/read/:id"
                  element={
                    <ProtectedRoute>
                      <Reader />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          </BookProvider>
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AntApp>
        <AppContent />
      </AntApp>
    </ThemeProvider>
  );
}

export default App;
