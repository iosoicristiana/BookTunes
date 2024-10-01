import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchPlaylistDetails,
  updatePlaylistDetails,
  addTrackToFavorites,
  fetchTrackAudioFeatures,
  fetchMultipleTracksAudioFeatures,
  FetchGenresForTracks,
  fetchArtistDetails,
} from "./utils";
import { useAuth } from "./authContext";
import { usePlayer } from "../playerComponents/PlayerContext";
import {
  Spin,
  Alert,
  Card,
  Avatar,
  Input,
  Button,
  Space,
  Typography,
  message,
  Tooltip,
  Modal,
} from "antd";
import {
  EditOutlined,
  SaveOutlined,
  SpotifyOutlined,
  BarChartOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { Radar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import Statistics from "./Statistics";
import TrackList from "./TrackList";
import { useLocation } from "react-router-dom";

Chart.register(...registerables);

const { Title, Text } = Typography;

const PlaylistDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const { bookId } = location.state || {};
  const navigate = useNavigate();
  const { fetchAccessToken } = useAuth();
  const { play } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [favoriteTracks, setFavoriteTracks] = useState(new Set());
  const [audioFeatures, setAudioFeatures] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [generalStats, setGeneralStats] = useState(null);
  const [trackStats, setTrackStats] = useState(null);
  const [genreStats, setGenreStats] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let accessToken = localStorage.getItem("spotifyAccessToken");
        if (!accessToken) {
          accessToken = await fetchAccessToken();
        }
        if (accessToken) {
          const data = await fetchPlaylistDetails(id);
          setPlaylist(data);
          console.log(data);
          setNewTitle(data.name);
          setNewDescription(data.description);

          const trackIds = data.tracks.items.map((item) => item.track.id);
          const audioFeaturesData = await fetchMultipleTracksAudioFeatures(
            trackIds
          );
          calculateGeneralStats(audioFeaturesData);
          setTrackStats(audioFeaturesData);

          const genres = await fetchGenresForTracks(data.tracks.items);

          console.log("Gnres", genres);
          calculateGenreStats(genres);
        } else {
          setError("Access token not available");
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, fetchAccessToken]);

  const calculateGeneralStats = (audioFeaturesData) => {
    if (!Array.isArray(audioFeaturesData) || audioFeaturesData.length === 0) {
      console.error("No audio features data available");
      return;
    }

    const stats = audioFeaturesData.reduce(
      (acc, feature) => {
        acc.danceability += feature.danceability;
        acc.energy += feature.energy;
        acc.speechiness += feature.speechiness;
        acc.acousticness += feature.acousticness;
        acc.instrumentalness += feature.instrumentalness;
        acc.liveness += feature.liveness;
        acc.valence += feature.valence;
        return acc;
      },
      {
        danceability: 0,
        energy: 0,
        speechiness: 0,
        acousticness: 0,
        instrumentalness: 0,
        liveness: 0,
        valence: 0,
      }
    );

    const totalTracks = audioFeaturesData.length;
    for (const key in stats) {
      stats[key] /= totalTracks;
    }

    setGeneralStats(stats);
  };

  const fetchGenresForTracks = async (tracks) => {
    try {
      const artistIds = tracks.flatMap((item) =>
        item.track && item.track.artists
          ? item.track.artists.map((artist) => artist.id)
          : []
      );
      const uniqueArtistIds = [...new Set(artistIds)];

      console.log("Fetching genres for artist IDs:", uniqueArtistIds);

      const artistDetails = await Promise.all(
        uniqueArtistIds.map(async (id) => {
          try {
            const artist = await fetchArtistDetails(id);
            return artist;
          } catch (error) {
            console.error(
              `Failed to fetch details for artist ID ${id}:`,
              error
            );
            return null;
          }
        })
      );

      const validArtistDetails = artistDetails.filter(
        (artist) => artist !== null
      );
      const genres = validArtistDetails.flatMap((artist) => artist.genres);

      console.log("Fetched genres:", genres);

      return genres;
    } catch (error) {
      console.error("Error fetching genres for tracks:", error);
      return [];
    }
  };
  const calculateGenreStats = (genres) => {
    const genreCount = genres.reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});

    setGenreStats(genreCount);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updatePlaylistDetails(id, newTitle, newDescription);
      setPlaylist({ ...playlist, name: newTitle, description: newDescription });
      message.success("Playlist updated successfully!");
      setIsEditing(false);
    } catch (err) {
      message.error("Failed to update playlist.");
    }
  };

  const handleAddToFavorites = async (trackId) => {
    try {
      await addTrackToFavorites(trackId);
      setFavoriteTracks((prevFavorites) => new Set(prevFavorites).add(trackId));
      message.success("Track added to your favorites!");
    } catch (err) {
      message.error("Failed to add track to favorites.");
    }
  };

  const handlePlayTrack = (trackUri) => {
    if (!playlist || !trackUri) {
      console.error("Playlist or track URI is not ready");
      return;
    }

    const playlistUri = playlist.uri; // Ensure the playlist URI is available
    if (typeof trackUri !== "string" || typeof playlistUri !== "string") {
      console.error(
        "Track URI or playlist URI is not a string:",
        trackUri,
        playlistUri
      );
      return;
    }

    play(trackUri, playlistUri);
    message.success("Playing track");
  };

  const handleFetchAudioFeatures = async (trackId) => {
    try {
      const audioFeaturesData = await fetchTrackAudioFeatures(trackId);
      setAudioFeatures(audioFeaturesData);
      setIsModalVisible(true);
    } catch (err) {
      message.error("Failed to fetch audio features.");
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setAudioFeatures(null);
  };

  const handleReadBookClick = () => {
    navigate(`/read/${bookId}`);
  };

  const renderAudioFeaturesChart = () => {
    if (!audioFeatures) return null;

    const data = {
      labels: [
        "Danceability",
        "Energy",
        "Speechiness",
        "Acousticness",
        "Instrumentalness",
        "Liveness",
        "Valence",
      ],
      datasets: [
        {
          label: "Audio Features",
          data: [
            audioFeatures.danceability,
            audioFeatures.energy,
            audioFeatures.speechiness,
            audioFeatures.acousticness,
            audioFeatures.instrumentalness,
            audioFeatures.liveness,
            audioFeatures.valence,
          ],
          backgroundColor: "rgba(29, 185, 84, 0.2)",
          borderColor: "#1DB954",
          borderWidth: 1,
        },
      ],
    };

    return <Radar data={data} />;
  };

  const toggleDrawer = () => {
    setIsDrawerVisible(!isDrawerVisible);
  };

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

  if (!playlist) {
    return <div>No playlist data</div>;
  }

  return (
    <>
      <Card style={{ margin: "20px", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            src={playlist.images[0]?.url}
            size={200}
            shape="square"
            style={{
              transition: "transform 0.3s",
              cursor: "pointer",
              marginRight: "20px",
            }}
            onClick={() =>
              window.open(playlist.external_urls.spotify, "_blank")
            }
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              {isEditing ? (
                <Space>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    style={{ fontSize: "24px", fontWeight: "bold" }}
                  />
                  <Button icon={<SaveOutlined />} onClick={handleSave} />
                </Space>
              ) : (
                <Space>
                  <Title level={2} style={{ margin: 0 }}>
                    {playlist.name}
                  </Title>
                  <Button icon={<EditOutlined />} onClick={handleEdit} />
                </Space>
              )}
            </div>
            {isEditing ? (
              <Input.TextArea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            ) : (
              <Text>{playlist.description}</Text>
            )}
          </div>
          <Tooltip title="Read Book">
            <Button
              type="link"
              icon={
                <BookOutlined style={{ fontSize: "32px", color: "#1DB954" }} />
              }
              onClick={handleReadBookClick}
              style={{ marginLeft: "auto", marginRight: "10px" }}
            />
          </Tooltip>
          <Tooltip title="Open in Spotify">
            <Button
              type="link"
              icon={
                <SpotifyOutlined
                  style={{ fontSize: "32px", color: "#1DB954" }}
                />
              }
              href={playlist.external_urls.spotify}
              target="_blank"
              style={{ marginLeft: "10px", marginRight: "10px" }}
            />
          </Tooltip>
        </div>
        <Button
          type="primary"
          shape="circle"
          icon={<BarChartOutlined />}
          onClick={toggleDrawer}
          style={{ position: "fixed", top: 80, right: 20, zIndex: 1000 }}
        />
        <TrackList
          tracks={playlist.tracks.items}
          favoriteTracks={favoriteTracks}
          handlePlayTrack={handlePlayTrack}
          handleAddToFavorites={handleAddToFavorites}
          handleFetchAudioFeatures={handleFetchAudioFeatures}
        />
      </Card>
      <Modal
        title="Audio Features"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        centered
      >
        {renderAudioFeaturesChart()}
      </Modal>
      <Statistics
        generalStats={generalStats}
        trackStats={trackStats}
        genreStats={genreStats}
        isDrawerVisible={isDrawerVisible}
        toggleDrawer={toggleDrawer}
      />
    </>
  );
};

export default PlaylistDetail;
