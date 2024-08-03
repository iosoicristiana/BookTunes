import React, { useState, useEffect } from "react";
import { Typography, Spin, Alert, Avatar, Card, Row, Col, Button } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const jwtToken = sessionStorage.getItem("authToken"); // Get JWT from sessionStorage

      try {
        // Fetch profile
        const profileResponse = await fetch(
          "http://localhost:5139/api/User/getProfile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              Accept: "application/json",
            },
          }
        );

        if (!profileResponse.ok) {
          throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
        }

        const profileData = await profileResponse.json();
        setProfile(profileData);
      } catch (error) {
        setError(error.message);
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    navigate("/");
  };

  const imageUrl =
    profile?.images?.$values?.find(
      (image) => image.width === 300 && image.height === 300
    )?.url ||
    profile?.images?.$values?.[0]?.url ||
    null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Spin spinning={loading} tip="Loading profile...">
        {error ? (
          <Alert message="Error" description={error} type="error" showIcon />
        ) : (
          profile && (
            <Card
              style={{
                maxWidth: "800px",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Row gutter={[16, 16]}>
                <Col span={24} style={{ textAlign: "center" }}>
                  {imageUrl && (
                    <Avatar size={128} src={imageUrl} alt="Profile Image" />
                  )}
                </Col>
                <Col span={24} style={{ textAlign: "center" }}>
                  <Title level={2}>{profile.displayName}</Title>
                  <Title level={4}>
                    This is your Spotify profile information
                  </Title>
                  <Paragraph>Your email: {profile.email}</Paragraph>
                  <Paragraph>
                    Followers: {profile.followers?.total || 0}
                  </Paragraph>
                </Col>
                <Col span={24} style={{ textAlign: "center" }}>
                  <Button type="primary" danger onClick={handleLogout}>
                    Logout
                  </Button>
                </Col>
              </Row>
            </Card>
          )
        )}
      </Spin>
    </div>
  );
};

export default Profile;
