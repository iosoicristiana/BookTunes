const getAccessToken = async () => {
  return localStorage.getItem("spotifyAccessToken");
};

export const fetchPlaylistDetails = async (playlistId) => {
  const accessToken = localStorage.getItem("spotifyAccessToken");
  if (!accessToken) {
    throw new Error("Access token not available");
  }

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
      throw new Error("Failed to fetch playlist details");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching playlist details:", error);
    throw error;
  }
};

export const updatePlaylistDetails = async (
  playlistId,
  newTitle,
  newDescription
) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("spotifyAccessToken")}`,
        },
        body: JSON.stringify({
          name: newTitle,
          description: newDescription,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message);
    }
  } catch (error) {
    console.error("Error updating playlist details:", error);
    throw error;
  }
};
export const addTrackToFavorites = async (trackId) => {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `https://api.spotify.com/v1/me/tracks?ids=${trackId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to add track to favorites");
  }

  return response;
};

export const fetchTrackAudioFeatures = async (trackId) => {
  const accessToken = localStorage.getItem("spotifyAccessToken");

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/audio-features/${trackId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch audio features: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching audio features:", error);
    return {};
  }
};
export const togglePlaylistPrivacy = async (playlistId, isPublic) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("spotifyAccessToken")}`,
        },
        body: JSON.stringify({
          public: isPublic,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message);
    }
  } catch (error) {
    console.error("Error updating playlist privacy:", error);
    throw error;
  }
};

export const fetchMultipleTracksAudioFeatures = async (trackIds) => {
  const accessToken = localStorage.getItem("spotifyAccessToken");
  if (!accessToken) {
    throw new Error("Access token not available");
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/audio-features?ids=${trackIds.join(",")}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch audio features: ${response.status}`);
    }

    const data = await response.json();
    return data.audio_features || [];
  } catch (error) {
    console.error("Error fetching audio features:", error);
    return [];
  }
};

export const fetchArtistDetails = async (artistId) => {
  const accessToken = localStorage.getItem("spotifyAccessToken");
  const response = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch artist details for ID ${artistId}`);
  }
  const data = await response.json();
  return data;
};
