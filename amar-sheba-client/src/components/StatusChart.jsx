import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Card } from 'react-bootstrap';

// Chart.js রেজিস্ট্রেশন
ChartJS.register(ArcElement, Tooltip, Legend);

const StatusChart = ({ chartData }) => {
  // যদি কোনো ডেটা না থাকে বা ডেটাসেট খালি থাকে
  if (
    !chartData ||
    !chartData.datasets ||
    chartData.datasets.length === 0 ||
    chartData.datasets[0].data.every((val) => val === 0)
  ) {
    return (
      <Card className="text-center shadow-sm">
        <Card.Body>📊 স্ট্যাটাস দেখানোর মতো কোনো ডেটা নেই।</Card.Body>
      </Card>
    );
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 15,
          padding: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || '';
            if (label) label += ': ';
            if (context.parsed !== null) label += context.parsed;
            return label;
          },
        },
      },
    },
  };

  return (
    <Card className="shadow-sm text-center p-3">
      <Card.Title>সেবা স্ট্যাটাস চার্ট</Card.Title>
      <div style={{ maxWidth: '400px', margin: 'auto' }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </Card>
  );
};

export default StatusChart;
