import React, { useEffect, useState } from "react";
import { Card, List, Spin, Alert, Typography, Row, Col } from "antd";
import { Link } from "react-router-dom";
import { useAuth } from "./authContext";
import { BookOutlined } from "@ant-design/icons";
import { Button } from "antd";

const { Title, Text } = Typography;

const CommunityPlaylists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchAccessToken } = useAuth();

  useEffect(() => {
    const fetchPlaylists = async () => {
      const jwtToken = sessionStorage.getItem("authToken");
      try {
        const response = await fetch(
          "https://localhost:7252/api/Playlist/community",
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
              tracks: spotifyData.tracks.items, // Get all tracks
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
    <div style={{ padding: "20px" }}>
      <Title level={2}>Community Playlists</Title>
      <List
        dataSource={playlists}
        renderItem={(playlist) => (
          <List.Item>
            <Card style={{ width: "100%" }}>
              <Row gutter={16}>
                <Col span={6}>
                  <img
                    alt="playlist cover"
                    src={
                      playlist.coverImageUrl ||
                      "https://via.placeholder.com/150"
                    }
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                    }}
                  />
                </Col>
                <Col span={18}>
                  <Card.Meta
                    title={
                      <Link to={`/playlist/${playlist.spotifyPlaylistId}`}>
                        {playlist.name}
                      </Link>
                    }
                    description={
                      <>
                        <Text>Owner: {playlist.owner}</Text>
                        <br />
                        <Text>{playlist.description}</Text>
                        <br />
                        <Link to={`/book/${playlist.book?.gutenbergId}`}>
                          <Button
                            type="link"
                            icon={<BookOutlined />}
                            size="small"
                          >
                            Based on Book: {playlist.book?.title}
                          </Button>
                        </Link>
                      </>
                    }
                  />
                  <div
                    style={{
                      maxHeight: "150px",
                      overflowY: "scroll",
                      paddingRight: "10px",
                      marginTop: "10px",
                    }}
                  >
                    <List
                      dataSource={playlist.tracks}
                      renderItem={(track) => (
                        <List.Item>
                          <Text>{track.track.name}</Text>
                        </List.Item>
                      )}
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default CommunityPlaylists;
