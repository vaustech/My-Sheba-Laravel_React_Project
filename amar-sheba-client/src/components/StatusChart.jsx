// src/components/StatusChart.jsx
import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import "../styles/WidgetCard.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const StatusChart = ({ chartData }) => {
  if (!chartData || !chartData.datasets?.[0]?.data?.length) {
    return (
      <div className="chart-empty text-center text-muted py-4">
        <i className="bi bi-graph-down fs-3 d-block mb-2 text-secondary"></i>
        <span>📊 স্ট্যাটাস দেখানোর মতো কোনো ডেটা নেই।</span>
      </div>
    );
  }

  const options = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#e9ecef",
          boxWidth: 14,
          padding: 18,
          font: { size: 13, weight: 500 },
        },
      },
      tooltip: {
        backgroundColor: "rgba(33, 37, 41, 0.85)",
        titleColor: "#0dcaf0",
        bodyColor: "#e9ecef",
        borderColor: "#0dcaf0",
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      },
    },
    cutout: "68%",
    radius: "90%",
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1400,
    },
  };

  return (
    <div className="chart-container fade-in-chart position-relative">
      <Doughnut data={chartData} options={options} />
      <div className="chart-center-text">সেবা</div>
    </div>
  );
};

export default StatusChart;
