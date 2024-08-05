import React from "react";
import { List, Avatar, Button, Tooltip, Typography } from "antd";
import {
  PlayCircleOutlined,
  HeartOutlined,
  HeartFilled,
  BarChartOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const TrackList = ({
  tracks,
  favoriteTracks,
  handlePlayTrack,
  handleAddToFavorites,
  handleFetchAudioFeatures,
}) => {
  return (
    <List
      itemLayout="horizontal"
      dataSource={tracks}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Tooltip title="Play Track">
              <Button
                type="link"
                icon={<PlayCircleOutlined style={{ fontSize: "24px" }} />}
                onClick={() => handlePlayTrack(item.track.uri)}
              />
            </Tooltip>,
            <Tooltip title="Add to Favorites">
              <Button
                type="link"
                icon={
                  favoriteTracks.has(item.track.id) ? (
                    <HeartFilled style={{ color: "red", fontSize: "24px" }} />
                  ) : (
                    <HeartOutlined style={{ fontSize: "24px" }} />
                  )
                }
                onClick={() => handleAddToFavorites(item.track.id)}
              />
            </Tooltip>,
            <Tooltip title="View Audio Features">
              <Button
                type="link"
                icon={<BarChartOutlined style={{ fontSize: "24px" }} />}
                onClick={() => handleFetchAudioFeatures(item.track.id)}
              />
            </Tooltip>,
          ]}
        >
          <List.Item.Meta
            avatar={<Avatar src={item.track.album.images[0]?.url} size={64} />}
            title={<Text strong>{item.track.name}</Text>}
            description={`${item.track.artists
              .map((artist) => artist.name)
              .join(", ")} - ${item.track.album.name}`}
          />
          <div>
            <Text type="secondary">
              {new Date(item.track.duration_ms).toISOString().substr(14, 5)}
            </Text>
          </div>
        </List.Item>
      )}
    />
  );
};

export default TrackList;
