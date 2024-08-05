import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
      if (!localStorage.getItem("spotifyAccessToken")) {
        fetchAccessToken();
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const login = (token) => {
    sessionStorage.setItem("authToken", token);
    setIsAuthenticated(true);
    fetchAccessToken(); // Fetch the access token after logging in
    //fetchAccessTokenCookie();
  };

  const logout = () => {
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("spotifyAccessToken");
    setIsAuthenticated(false);
    navigate("/"); // Navigate to the home page after logging out
  };

  const fetchAccessToken = async () => {
    try {
      const response = await fetch("https://localhost:7252/api/User/getToken", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("spotifyAccessToken", data.accessToken);
      } else {
        console.error("Failed to fetch access token");
      }
    } catch (error) {
      console.error("Error fetching access token:", error);
    }
  };
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// daca ma supar si vreau sa il iau direct
//   const fetchAccessToken = async () => {
//     try {
//       const response = await fetch("https://localhost:7252/api/User/getAccessToken", {
//         method: "GET",
//         credentials: "include", // Include cookies in the request
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setAccessToken(data.accessToken);
//         return data.accessToken;
//       } else {
//         console.error("Failed to get access token");
//         return null;
//       }
//     } catch (error) {
//       console.error("Error fetching access token:", error);
//       return null;
//     }
//   };

// const fetchAccessTokenCookie = async () => {
//   try {
//     const response = await fetch("https://localhost:7252/api/User/getAccessToken", {
//       method: "GET",
//       credentials: "include", // Include cookies in the request
//     });

//     if (response.ok) {
//       const data = await response.json();
//     } else {
//       console.error("Failed to get access token");
//     }
//   } catch (error) {
//     console.error("Error fetching access token:", error);
//   }
// };

// import React, { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     const token = sessionStorage.getItem("authToken");
//     setIsAuthenticated(!!token);
//   }, []);

//   const login = async (code) => {
//     try {
//       const response = await fetch("https://localhost:7252/api/Auth/getToken", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//         body: JSON.stringify({ code }),
//         credentials: "include", // Include cookies in the request
//       });

//       if (response.ok) {
//         const data = await response.json();
//         sessionStorage.setItem("authToken", data.token);
//         setIsAuthenticated(true);
//         return true; // indicate success
//       } else {
//         const errorData = await response.json();
//         console.error("Login failed:", errorData);
//         setIsAuthenticated(false);
//         return false; // indicate failure
//       }
//     } catch (error) {
//       console.error("Error during login:", error);
//       setIsAuthenticated(false);
//       return false; // indicate failure
//     }
//   };

//   const logout = () => {
//     sessionStorage.removeItem("authToken"); // Remove JWT token from sessionStorage
//     setIsAuthenticated(false);
//   };

//   const getAccessToken = async () => {
//     try {
//       const response = await fetch(
//         "https://localhost:7252/api/User/getAccessToken",
//         {
//           method: "GET",
//           credentials: "include", // Include cookies in the request
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         return data.accessToken;
//       } else {
//         console.error("Failed to get access token");
//         return null;
//       }
//     } catch (error) {
//       console.error("Error fetching access token:", error);
//       return null;
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{ isAuthenticated, login, logout, getAccessToken }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
