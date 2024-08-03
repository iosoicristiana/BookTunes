import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Spin, Button } from "antd";

const Callback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false); // new state to control error display

  const fetchToken = useCallback(
    async (code) => {
      try {
        const response = await fetch(
          "http://localhost:5139/api/Auth/getToken",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ Code: code }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch token: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.token) {
          sessionStorage.setItem("authToken", data.token);
          navigate("/profile");
        } else {
          throw new Error("Token data is incomplete.");
        }
      } catch (error) {
        setError(`Failed to obtain access token: ${error.message}`);
        setTimeout(() => setShowError(true), 500); // Delay showing the error message
        setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const errorParam = searchParams.get("error");
    const code = searchParams.get("code");

    if (errorParam) {
      setError(`Authorization error: ${errorParam}`);
      setTimeout(() => setShowError(true), 500); // Delay showing the error message
      setLoading(false);
      return;
    }

    if (code) {
      fetchToken(code);
    } else {
      setError("No authorization code found.");
      setTimeout(() => setShowError(true), 500); // Delay showing the error message
      setLoading(false);
    }
  }, [location.search, fetchToken]);

  const handleRetry = () => {
    navigate("/");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {loading ? (
        <Spin
          size="large"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      ) : showError && error ? (
        <div style={{ textAlign: "center" }}>
          <Alert message="Error" description={error} type="error" showIcon />
          <div style={{ marginTop: "20px" }}>
            <Button
              type="primary"
              onClick={handleRetry}
              style={{ marginRight: "10px" }}
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <div>Redirecting...</div>
      )}
    </div>
  );
};

export default Callback;
