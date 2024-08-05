import React, { useEffect, useState } from "react";
import { Card, Typography, Progress, List, Tag } from "antd";
import { fetchTrackAudioFeatures } from "./utils"; // Ensure this import path is correct

const { Title, Text } = Typography;

const PlaylistStats = ({ playlist }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStats = async () => {
      try {
        const trackFeatures = await Promise.all(
          playlist.tracks.items.map((item) =>
            fetchTrackAudioFeatures(item.track.id)
          )
        );

        const genres = {};
        const popularitySum = playlist.tracks.items.reduce(
          (sum, item) => sum + item.track.popularity,
          0
        );
        const valenceSum = trackFeatures.reduce(
          (sum, features) => sum + features.valence,
          0
        );

        let mostPopularTrack = playlist.tracks.items[0].track;
        playlist.tracks.items.forEach((item) => {
          if (item.track.popularity > mostPopularTrack.popularity) {
            mostPopularTrack = item.track;
          }
          item.track.artists.forEach((artist) => {
            if (artist.genres) {
              artist.genres.forEach((genre) => {
                genres[genre] = (genres[genre] || 0) + 1;
              });
            }
          });
        });

        setStats({
          averagePopularity: popularitySum / playlist.tracks.items.length,
          mostPopularTrack,
          genres,
          averageValence: valenceSum / trackFeatures.length,
        });
        setLoading(false);
      } catch (error) {
        console.error("Failed to calculate stats:", error);
        setLoading(false);
      }
    };

    calculateStats();
  }, [playlist]);

  if (loading) {
    return <Text>Loading statistics...</Text>;
  }

  return (
    <Card title="Playlist Statistics" style={{ marginTop: 20 }}>
      <Title level={4}>Genres</Title>
      <List
        dataSource={Object.entries(stats.genres)}
        renderItem={([genre, count]) => (
          <List.Item>
            <Tag>{genre}</Tag>
            <Text>{count}</Text>
          </List.Item>
        )}
      />
      <Title level={4}>Average Popularity</Title>
      <Progress percent={Math.round(stats.averagePopularity)} />
      <Title level={4}>Most Popular Track</Title>
      <Text>{`${stats.mostPopularTrack.name} by ${stats.mostPopularTrack.artists
        .map((artist) => artist.name)
        .join(", ")} with ${
        stats.mostPopularTrack.popularity
      }% popularity`}</Text>
      <Title level={4}>Average Valence</Title>
      <Progress percent={Math.round(stats.averageValence * 100)} />
    </Card>
  );
};

export default PlaylistStats;
