import React from "react";
import { usePlayer } from "./PlayerContext";
import { Layout, Avatar, Typography, Button, Slider, Row, Col } from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepForwardOutlined,
  StepBackwardOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const { Footer } = Layout;
const { Text, Title } = Typography;

const formatDuration = (value) => {
  const minute = Math.floor(value / 60000);
  const secondLeft = Math.floor((value - minute * 60000) / 1000);
  return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
};

const Player = () => {
  const {
    isPlaying,
    currentTrack,
    resume,
    pause,
    skipToNext,
    skipToPrevious,
    position,
    duration,
    seek,
    setIsActive,
  } = usePlayer();

  if (!currentTrack) {
    return null; // Hide the player if no track is currently playing
  }

  const handleSeekChange = (newValue) => {
    seek(newValue);
  };

  const handleClose = () => {
    setIsActive(false);
  };

  return (
    <Footer
      style={{
        backgroundColor: "#004F00",
        color: "white",
        padding: "5px 10px",
        position: "fixed",
        bottom: 0,
        width: "100%",
        zIndex: 1000,
      }}
    >
      <Row align="middle" style={{ width: "100%" }}>
        <Col span={6} style={{ display: "flex", alignItems: "center" }}>
          <Avatar src={currentTrack.albumImage} size={50} />
          <div style={{ marginLeft: "10px" }}>
            <Title
              level={5}
              style={{ color: "white", margin: 0, fontSize: "16px" }}
            >
              {currentTrack.name}
            </Title>
            <Text type="secondary" style={{ color: "white", fontSize: "14px" }}>
              {currentTrack.artist}
            </Text>
          </div>
        </Col>
        <Col span={10} style={{ textAlign: "center" }}>
          <Button
            type="link"
            icon={
              <StepBackwardOutlined style={{ color: "white", fontSize: 30 }} />
            }
            onClick={skipToPrevious}
          />
          <Button
            type="link"
            icon={
              isPlaying ? (
                <PauseCircleOutlined style={{ color: "white", fontSize: 30 }} />
              ) : (
                <PlayCircleOutlined style={{ color: "white", fontSize: 30 }} />
              )
            }
            onClick={isPlaying ? pause : resume}
          />
          <Button
            type="link"
            icon={
              <StepForwardOutlined style={{ color: "white", fontSize: 30 }} />
            }
            onClick={skipToNext}
          />
        </Col>
        <Col span={4} style={{ textAlign: "right" }}>
          <Text style={{ color: "white", fontSize: "14px" }}>
            {formatDuration(position)} / {formatDuration(duration)}
          </Text>
        </Col>
        <Col span={2} style={{ textAlign: "right" }}>
          <Button
            type="link"
            icon={<CloseOutlined style={{ color: "white", fontSize: 20 }} />}
            onClick={handleClose}
          />
        </Col>
      </Row>
      <Row
        align="middle"
        justify="center"
        style={{ width: "100%", marginTop: "0px" }}
      >
        <Slider
          value={position}
          onChange={handleSeekChange}
          min={0}
          max={duration}
          tipFormatter={formatDuration}
          style={{ width: "90%" }}
        />
      </Row>
    </Footer>
  );
};

export default Player;
