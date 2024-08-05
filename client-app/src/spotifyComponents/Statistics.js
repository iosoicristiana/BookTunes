import React from "react";
import { Drawer, Tabs } from "antd";
import { Radar, Bar } from "react-chartjs-2";

const { TabPane } = Tabs;

const Statistics = ({
  generalStats,
  trackStats,
  genreStats,
  isDrawerVisible,
  toggleDrawer,
}) => {
  const renderGeneralStatsChart = () => {
    if (!generalStats) return null;

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
          label: "Average Audio Features",
          data: [
            generalStats.danceability,
            generalStats.energy,
            generalStats.speechiness,
            generalStats.acousticness,
            generalStats.instrumentalness,
            generalStats.liveness,
            generalStats.valence,
          ],
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };

    return <Radar data={data} />;
  };

  const renderTrackStatsChart = () => {
    if (!trackStats) return null;

    const labels = trackStats.map((track, index) => `Track ${index + 1}`);
    const data = {
      labels,
      datasets: [
        {
          label: "Danceability",
          data: trackStats.map((track) => track.danceability),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Energy",
          data: trackStats.map((track) => track.energy),
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Speechiness",
          data: trackStats.map((track) => track.speechiness),
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
        {
          label: "Acousticness",
          data: trackStats.map((track) => track.acousticness),
          backgroundColor: "rgba(255, 206, 86, 0.2)",
          borderColor: "rgba(255, 206, 86, 1)",
          borderWidth: 1,
        },
        {
          label: "Instrumentalness",
          data: trackStats.map((track) => track.instrumentalness),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Liveness",
          data: trackStats.map((track) => track.liveness),
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
        {
          label: "Valence",
          data: trackStats.map((track) => track.valence),
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 1,
        },
      ],
    };

    return <Bar data={data} />;
  };

  const renderGenreStatsChart = () => {
    if (!genreStats) return null;
    const data = {
      labels: Object.keys(genreStats),
      datasets: [
        {
          label: "Number of Appearances",
          data: Object.values(genreStats),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };

    const options = {
      indexAxis: "x", // This makes the bar chart horizontal
      scales: {
        x: {
          beginAtZero: true,
        },
        y: {
          ticks: {
            font: {
              size: 10,
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw}`;
            },
          },
        },
      },
    };

    return (
      <div style={{ height: "800px", width: "100%" }}>
        {" "}
        {/* Adjust the height as needed */}
        <Bar data={data} options={options} />
      </div>
    );
  };

  return (
    <Drawer
      title="General Stats"
      placement="right"
      onClose={toggleDrawer}
      open={isDrawerVisible}
      width={600}
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="Average Stats" key="1">
          {renderGeneralStatsChart()}
        </TabPane>
        <TabPane tab="Track Stats" key="2">
          {renderTrackStatsChart()}
        </TabPane>
        <TabPane tab="Genre Stats" key="3">
          {renderGenreStatsChart()}
        </TabPane>
      </Tabs>
    </Drawer>
  );
};

export default Statistics;
