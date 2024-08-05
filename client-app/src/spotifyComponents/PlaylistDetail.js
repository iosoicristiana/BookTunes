import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchPlaylistDetails,
  updatePlaylistDetails,
  addTrackToFavorites,
  fetchTrackAudioFeatures,
} from "./utils";
import { useAuth } from "./authContext";
import { usePlayer } from "../playerComponents/PlayerContext";
import {
  Spin,
  Alert,
  Card,
  List,
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
  PlayCircleOutlined,
  HeartOutlined,
  HeartFilled,
  EditOutlined,
  SaveOutlined,
  SpotifyOutlined,
  UserAddOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import PlaylistStats from "./PlaylistStats"; // Ensure this import

const { Title, Text } = Typography;

const PlaylistDetail = () => {
  const { id } = useParams();
  const { fetchAccessToken } = useAuth();
  const { play } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [favoriteTracks, setFavoriteTracks] = useState(new Set());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [audioFeatures, setAudioFeatures] = useState(null);

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
          setNewTitle(data.name);
          setNewDescription(data.description);
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
    play(trackUri);
    message.success("Playing track");
  };

  const handleFetchAudioFeatures = async (trackId) => {
    try {
      const features = await fetchTrackAudioFeatures(trackId);
      setAudioFeatures(features);
      setIsModalVisible(true);
    } catch (err) {
      message.error("Failed to fetch audio features.");
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setAudioFeatures(null);
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

  const renderAudioFeaturesChart = () => {
    if (!audioFeatures) {
      return null;
    }

    return (
      <div>
        {/* Render your audio features chart here */}
        <pre>{JSON.stringify(audioFeatures, null, 2)}</pre>
      </div>
    );
  };

  return (
    <>
      <Card style={{ margin: "20px", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{ position: "relative", cursor: "pointer" }}>
            <Avatar
              src={playlist.images[0]?.url}
              size={200}
              shape="square"
              style={{ transition: "transform 0.3s" }}
              onClick={() =>
                window.open(playlist.external_urls.spotify, "_blank")
              }
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </div>
          <div style={{ marginLeft: "20px", flex: 1 }}>
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
              style={{ marginLeft: "auto", marginRight: "10px" }}
            />
          </Tooltip>
          <Tooltip title="View Playlist Stats">
            <Button
              type="link"
              icon={<BarChartOutlined style={{ fontSize: "32px" }} />}
              onClick={() => setIsModalVisible(true)}
              style={{ marginLeft: "auto", marginRight: "10px" }}
            />
          </Tooltip>
        </div>
        <List
          itemLayout="horizontal"
          dataSource={playlist.tracks.items}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  icon={<PlayCircleOutlined />}
                  onClick={() => handlePlayTrack(item.track.uri)}
                />,
                <Button
                  icon={
                    favoriteTracks.has(item.track.id) ? (
                      <HeartFilled style={{ color: "red" }} />
                    ) : (
                      <HeartOutlined />
                    )
                  }
                  onClick={() => handleAddToFavorites(item.track.id)}
                />,
                <Button
                  icon={<BarChartOutlined />}
                  onClick={() => handleFetchAudioFeatures(item.track.id)}
                />,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={item.track.album.images[0]?.url} />}
                title={item.track.name}
                description={`${item.track.artists
                  .map((artist) => artist.name)
                  .join(", ")} - ${item.track.album.name}`}
              />
              <div>
                {new Date(item.track.duration_ms).toISOString().substr(14, 5)}
              </div>
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="Audio Features"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        <PlaylistStats playlist={playlist} />
      </Modal>
    </>
  );
};

export default PlaylistDetail;
