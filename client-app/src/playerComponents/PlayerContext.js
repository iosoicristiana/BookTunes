// import React, { createContext, useContext, useState, useEffect } from "react";

// let positionInterval = null;

// const PlayerContext = createContext();
// export const usePlayer = () => {
//   const context = useContext(PlayerContext);
//   if (context === undefined) {
//     throw new Error("usePlayer must be used within a PlayerProvider");
//   }
//   return context;
// };

// const loadSpotifySDK = () => {
//   return new Promise((resolve) => {
//     const script = document.createElement("script");
//     script.src = "https://sdk.scdn.co/spotify-player.js";
//     script.async = true;
//     document.body.appendChild(script);

//     script.onload = () => {
//       resolve();
//     };
//   });
// };

// export const PlayerProvider = ({ children }) => {
//   const [player, setPlayer] = useState(null);
//   const [token, setToken] = useState(
//     localStorage.getItem("spotifyAccessToken")
//   );
//   const [currentTrack, setCurrentTrack] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [position, setPosition] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [isActive, setIsActive] = useState(false);
//   const [deviceId, setDeviceId] = useState(null);

//   useEffect(() => {
//     if (!window.Spotify) {
//       const script = document.createElement("script");
//       script.src = "https://sdk.scdn.co/spotify-player.js";
//       script.async = true;
//       document.body.appendChild(script);

//       script.onload = () => {
//         window.onSpotifyWebPlaybackSDKReady = () => {
//           initializePlayer();
//         };
//       };
//     } else {
//       initializePlayer();
//     }
//   }, [token]);

//   const initializePlayer = () => {
//     const spotifyPlayer = new window.Spotify.Player({
//       name: "L I C E N T A",
//       getOAuthToken: (cb) => {
//         cb(token);
//       },
//       volume: 0.5,
//     });

//     spotifyPlayer.addListener("ready", ({ device_id }) => {
//       console.log("Ready with Device ID", device_id);
//       setPlayer(spotifyPlayer);
//       setDeviceId(device_id);
//     });

//     spotifyPlayer.addListener("not_ready", ({ device_id }) => {
//       console.log("Device ID has gone offline", device_id);
//     });

//     spotifyPlayer.addListener("player_state_changed", handlePlayerStateChange);

//     spotifyPlayer.addListener("initialization_error", ({ message }) => {
//       console.error("Failed to initialize", message);
//     });

//     spotifyPlayer.addListener("authentication_error", ({ message }) => {
//       console.error("Failed to authenticate", message);
//     });

//     spotifyPlayer.addListener("account_error", ({ message }) => {
//       console.error("Failed to validate Spotify account", message);
//     });

//     spotifyPlayer.addListener("playback_error", ({ message }) => {
//       console.error("Failed to perform playback", message);
//     });

//     spotifyPlayer.connect();
//   };

//   const handlePlayerStateChange = (state) => {
//     if (!state) {
//       console.error("No state is available at the moment");
//       return;
//     }
//     const currentPlayingTrack = {
//       name: state.track_window.current_track.name,
//       artist: state.track_window.current_track.artists
//         .map((artist) => artist.name)
//         .join(", "),
//       albumImage: state.track_window.current_track.album.images[0].url,
//       uri: state.track_window.current_track.uri,
//     };
//     setCurrentTrack(currentPlayingTrack);
//     setIsPlaying(!state.paused);
//     setPosition(state.position);
//     setDuration(state.track_window.current_track.duration_ms);
//     setIsActive(true);

//     if (positionInterval) {
//       clearInterval(positionInterval);
//     }
//     if (!state.paused) {
//       positionInterval = setInterval(() => {
//         setPosition((position) => position + 1000);
//       }, 1000);
//     }
//   };

//   const play = (trackUri, playlistUri) => {
//     if (!player || !trackUri || !playlistUri) {
//       console.error("Spotify player, track URI, or playlist URI is not ready");
//       return;
//     }

//     if (typeof trackUri !== "string" || typeof playlistUri !== "string") {
//       console.error(
//         "Track URI or playlist URI is not a string:",
//         trackUri,
//         playlistUri
//       );
//       return;
//     }

//     const bodyData = {
//       context_uri: playlistUri,
//       offset: {
//         uri: trackUri,
//       },
//       position_ms: 0,
//     };

//     fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
//       method: "PUT",
//       body: JSON.stringify(bodyData),
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         setIsActive(true);
//       })
//       .catch((error) => {
//         console.error("Failed to start playback: ", error);
//       });
//   };

//   const pause = () => {
//     player?.pause();
//     setIsPlaying(false);
//   };

//   const resume = () => {
//     player?.resume();
//     setIsPlaying(true);
//   };

//   const skipToNext = () => {
//     player?.nextTrack().then(() => {
//       player?.getCurrentState().then((state) => {
//         if (state) {
//           setCurrentTrack(state.track_window.current_track);
//         }
//       });
//     });
//   };

//   const skipToPrevious = () => {
//     player?.previousTrack().then(() => {
//       player?.getCurrentState().then((state) => {
//         if (state) {
//           setCurrentTrack(state.track_window.current_track);
//         }
//       });
//     });
//   };

//   const seek = (position_ms) => {
//     player?.seek(position_ms);
//   };

//   return (
//     <PlayerContext.Provider
//       value={{
//         player,
//         token,
//         currentTrack,
//         isPlaying,
//         play,
//         pause,
//         resume,
//         skipToNext,
//         skipToPrevious,
//         position,
//         duration,
//         seek,
//         isActive,
//       }}
//     >
//       {children}
//     </PlayerContext.Provider>
//   );
// };

// import React, { createContext, useContext, useState, useEffect } from "react";

// let positionInterval = null;

// const PlayerContext = createContext();
// export const usePlayer = () => {
//   const context = useContext(PlayerContext);
//   if (context === undefined) {
//     throw new Error("usePlayer must be used within a PlayerProvider");
//   }
//   return context;
// };

// export const PlayerProvider = ({ children }) => {
//   const [player, setPlayer] = useState(null);
//   const [token, setToken] = useState(
//     localStorage.getItem("spotifyAccessToken")
//   );
//   const [currentTrack, setCurrentTrack] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [position, setPosition] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [isActive, setIsActive] = useState(false);
//   const [deviceId, setDeviceId] = useState(null);

//   useEffect(() => {
//     const loadAndInitializePlayer = async () => {
//       await loadSpotifySDK();

//       window.onSpotifyWebPlaybackSDKReady = () => {
//         const spotifyPlayer = new window.Spotify.Player({
//           name: "L I C E N T A",
//           getOAuthToken: (cb) => {
//             cb(token);
//           },
//           volume: 0.5,
//         });

//         spotifyPlayer.addListener("ready", ({ device_id }) => {
//           console.log("Ready with Device ID", device_id);
//           setPlayer(spotifyPlayer);
//           setDeviceId(device_id);
//         });

//         spotifyPlayer.addListener("not_ready", ({ device_id }) => {
//           console.log("Device ID has gone offline", device_id);
//         });

//         spotifyPlayer.addListener(
//           "player_state_changed",
//           handlePlayerStateChange
//         );

//         spotifyPlayer.addListener("initialization_error", ({ message }) => {
//           console.error("Failed to initialize", message);
//         });

//         spotifyPlayer.addListener("authentication_error", ({ message }) => {
//           console.error("Failed to authenticate", message);
//         });

//         spotifyPlayer.addListener("account_error", ({ message }) => {
//           console.error("Failed to validate Spotify account", message);
//         });

//         spotifyPlayer.addListener("playback_error", ({ message }) => {
//           console.error("Failed to perform playback", message);
//         });

//         spotifyPlayer.connect();
//       };
//     };

//     loadAndInitializePlayer();
//   }, [token]);

//   const handlePlayerStateChange = (state) => {
//     if (!state) {
//       console.error("No state is available at the moment");
//       return;
//     }
//     const currentPlayingTrack = {
//       name: state.track_window.current_track.name,
//       artist: state.track_window.current_track.artists
//         .map((artist) => artist.name)
//         .join(", "),
//       albumImage: state.track_window.current_track.album.images[0].url,
//       uri: state.track_window.current_track.uri,
//     };
//     setCurrentTrack(currentPlayingTrack);
//     setIsPlaying(!state.paused);
//     setPosition(state.position);
//     setDuration(state.track_window.current_track.duration_ms);
//     setIsActive(true);

//     if (positionInterval) {
//       clearInterval(positionInterval);
//     }
//     if (!state.paused) {
//       positionInterval = setInterval(() => {
//         setPosition((position) => position + 1000);
//       }, 1000);
//     }
//   };

//   const play = (trackUri, playlistUri) => {
//     if (!player || !trackUri || !playlistUri) {
//       console.error("Spotify player, track URI, or playlist URI is not ready");
//       return;
//     }

//     if (typeof trackUri !== "string" || typeof playlistUri !== "string") {
//       console.error(
//         "Track URI or playlist URI is not a string:",
//         trackUri,
//         playlistUri
//       );
//       return;
//     }

//     const bodyData = {
//       context_uri: playlistUri,
//       offset: {
//         uri: trackUri,
//       },
//       position_ms: 0,
//     };

//     fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
//       method: "PUT",
//       body: JSON.stringify(bodyData),
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         setIsActive(true);
//       })
//       .catch((error) => {
//         console.error("Failed to start playback: ", error);
//       });
//   };

//   const pause = () => {
//     player?.pause();
//     setIsPlaying(false);
//   };

//   const resume = () => {
//     player?.resume();
//     setIsPlaying(true);
//   };

//   const skipToNext = () => {
//     player?.nextTrack().then(() => {
//       player?.getCurrentState().then((state) => {
//         if (state) {
//           setCurrentTrack(state.track_window.current_track);
//         }
//       });
//     });
//   };

//   const skipToPrevious = () => {
//     player?.previousTrack().then(() => {
//       player?.getCurrentState().then((state) => {
//         if (state) {
//           setCurrentTrack(state.track_window.current_track);
//         }
//       });
//     });
//   };

//   const seek = (position_ms) => {
//     player?.seek(position_ms);
//   };

//   return (
//     <PlayerContext.Provider
//       value={{
//         player,
//         token,
//         currentTrack,
//         isPlaying,
//         play,
//         pause,
//         resume,
//         skipToNext,
//         skipToPrevious,
//         position,
//         duration,
//         seek,
//         isActive,
//       }}
//     >
//       {children}
//     </PlayerContext.Provider>
//   );
// };

// const loadSpotifySDK = () => {
//   return new Promise((resolve) => {
//     const script = document.createElement("script");
//     script.src = "https://sdk.scdn.co/spotify-player.js";
//     script.async = true;
//     document.body.appendChild(script);

//     script.onload = () => {
//       resolve();
//     };
//   });
// };

import React, { createContext, useContext, useState, useEffect } from "react";

let positionInterval = null;

const PlayerContext = createContext();
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};

export const PlayerProvider = ({ children }) => {
  const [player, setPlayer] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("spotifyAccessToken")
  );
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    if (!document.getElementById("spotify-player")) {
      const script = document.createElement("script");
      script.id = "spotify-player";
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        window.onSpotifyWebPlaybackSDKReady = () => {
          initializePlayer();
        };
      };
    } else {
      window.onSpotifyWebPlaybackSDKReady = () => {
        initializePlayer();
      };
    }

    return () => {
      if (player) {
        player.disconnect();
      }
      if (positionInterval) {
        clearInterval(positionInterval);
      }
    };
  }, [token]);

  const initializePlayer = () => {
    const spotifyPlayer = new window.Spotify.Player({
      name: "L I C E N T A",
      getOAuthToken: (cb) => {
        cb(token);
      },
      volume: 0.5,
    });

    spotifyPlayer.addListener("ready", ({ device_id }) => {
      console.log("Ready with Device ID", device_id);
      setPlayer(spotifyPlayer);
      setDeviceId(device_id);
    });

    spotifyPlayer.addListener("not_ready", ({ device_id }) => {
      console.log("Device ID has gone offline", device_id);
    });

    spotifyPlayer.addListener("player_state_changed", handlePlayerStateChange);

    spotifyPlayer.addListener("initialization_error", ({ message }) => {
      console.error("Failed to initialize", message);
    });

    spotifyPlayer.addListener("authentication_error", ({ message }) => {
      console.error("Failed to authenticate", message);
    });

    spotifyPlayer.addListener("account_error", ({ message }) => {
      console.error("Failed to validate Spotify account", message);
    });

    spotifyPlayer.addListener("playback_error", ({ message }) => {
      console.error("Failed to perform playback", message);
    });

    spotifyPlayer.connect();
  };

  const handlePlayerStateChange = (state) => {
    if (!state) {
      console.error("No state is available at the moment");
      return;
    }
    const currentPlayingTrack = {
      name: state.track_window.current_track.name,
      artist: state.track_window.current_track.artists
        .map((artist) => artist.name)
        .join(", "),
      albumImage: state.track_window.current_track.album.images[0].url,
      uri: state.track_window.current_track.uri,
    };
    setCurrentTrack(currentPlayingTrack);
    setIsPlaying(!state.paused);
    setPosition(state.position);
    setDuration(state.track_window.current_track.duration_ms);
    setIsActive(true);

    if (positionInterval) {
      clearInterval(positionInterval);
    }
    if (!state.paused) {
      positionInterval = setInterval(() => {
        setPosition((position) => position + 1000);
      }, 1000);
    }
  };

  const play = (trackUri, playlistUri) => {
    if (!player || !trackUri || !playlistUri) {
      console.error("Spotify player, track URI, or playlist URI is not ready");
      return;
    }

    if (typeof trackUri !== "string" || typeof playlistUri !== "string") {
      console.error(
        "Track URI or playlist URI is not a string:",
        trackUri,
        playlistUri
      );
      return;
    }

    const bodyData = {
      context_uri: playlistUri,
      offset: {
        uri: trackUri,
      },
      position_ms: 0,
    };

    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      body: JSON.stringify(bodyData),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setIsActive(true);
      })
      .catch((error) => {
        console.error("Failed to start playback: ", error);
      });
  };

  const pause = () => {
    player?.pause();
    setIsPlaying(false);
  };

  const resume = () => {
    player?.resume();
    setIsPlaying(true);
  };

  const skipToNext = () => {
    player?.nextTrack().then(() => {
      player?.getCurrentState().then((state) => {
        if (state) {
          setCurrentTrack(state.track_window.current_track);
        }
      });
    });
  };

  const skipToPrevious = () => {
    player?.previousTrack().then(() => {
      player?.getCurrentState().then((state) => {
        if (state) {
          setCurrentTrack(state.track_window.current_track);
        }
      });
    });
  };

  const seek = (position_ms) => {
    player?.seek(position_ms);
  };

  return (
    <PlayerContext.Provider
      value={{
        player,
        token,
        currentTrack,
        isPlaying,
        play,
        pause,
        resume,
        skipToNext,
        skipToPrevious,
        position,
        duration,
        seek,
        isActive,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

const loadSpotifySDK = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      resolve();
    };
  });
};
