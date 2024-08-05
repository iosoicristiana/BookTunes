import React from "react";
import { Button } from "antd";
import { SpotifyFilled } from "@ant-design/icons";

const LoginButton = () => {
  const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
  const REDIRECT_URI = encodeURIComponent("http://localhost:3000/callback");
  const SCOPES = encodeURIComponent(
    "user-read-private user-read-email playlist-modify-private playlist-modify-public playlist-read-private user-modify-playback-state user-read-playback-state user-read-currently-playing streaming user-library-modify user-top-read"
  );

  const handleLogin = () => {
    const spotifyUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}&response_type=code&show_dialog=true`;
    window.location.href = spotifyUrl;
  };

  return (
    <Button
      type="primary"
      size="large"
      icon={<SpotifyFilled />}
      onClick={handleLogin}
      style={{
        backgroundColor: "#1DB954", // Spotify green
        borderColor: "#1DB954",
      }}
    >
      Log In with Spotify
    </Button>
  );
};

export { LoginButton };
