import React, { useEffect, useState } from "react";
import { Card, List, Spin, Alert, Typography } from "antd";
import { Link } from "react-router-dom";
import { useAuth } from "./authContext";

const { Title } = Typography;

const MyPlaylists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchAccessToken } = useAuth();

  useEffect(() => {
    const fetchPlaylists = async () => {
      const jwtToken = sessionStorage.getItem("authToken");
      try {
        const response = await fetch(
          "https://localhost:7252/api/Playlist/get",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch playlists: ${response.status}`);
        }

        const data = await response.json();
        const playlistsData = data.$values;
        console.log(playlistsData);

        const playlistDetails = await Promise.all(
          playlistsData.map(async (playlist) => {
            const spotifyData = await fetchSpotifyPlaylist(
              playlist.spotifyPlaylistId
            );
            return {
              ...playlist,
              coverImageUrl: spotifyData.images[0]?.url,
              owner: spotifyData.owner.display_name,
              tracks: spotifyData.tracks.total,
            };
          })
        );

        setPlaylists(playlistDetails || []);
      } catch (error) {
        setError(error.message);
        console.error("Failed to fetch playlists:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSpotifyPlaylist = async (playlistId) => {
      const accessToken =
        localStorage.getItem("spotifyAccessToken") ||
        (await fetchAccessToken());

      try {
        const response = await fetch(
          `https://api.spotify.com/v1/playlists/${playlistId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch playlist from Spotify: ${response.status}`
          );
        }

        return await response.json();
      } catch (error) {
        console.error("Error fetching Spotify playlist:", error);
        return {};
      }
    };

    fetchPlaylists();
  }, [fetchAccessToken]);

  if (loading) {
    return (
      <Spin
        size="large"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      />
    );
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <Title level={2}>My Playlists</Title>
      <List
        grid={{ gutter: 16, column: 4 }}
        dataSource={playlists}
        renderItem={(playlist) => (
          <List.Item>
            <Card
              hoverable
              cover={
                <img
                  alt="playlist cover"
                  src={
                    playlist.coverImageUrl || "https://via.placeholder.com/150"
                  }
                />
              }
            >
              <Card.Meta
                title={
                  <Link
                    to={{
                      pathname: `/playlist/${playlist.spotifyPlaylistId}`,
                    }}
                  >
                    {playlist.name}
                  </Link>
                }
                description={
                  <>
                    <p>{playlist.description}</p>
                    <p>Tracks: {playlist.tracks}</p>
                  </>
                }
              />
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default MyPlaylists;
