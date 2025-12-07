let bikesChart = null;

function initChart() {
  const ctx = document.getElementById("bikes-chart").getContext("2d");

  bikesChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Bikes available",
          data: [],
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxTicksLimit: 6
          }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: "Bikes" }
        }
      }
    }
  });
}

function updateChart(history) {
  if (!bikesChart) return;

  bikesChart.data.labels = history.map((h) =>
    h.timestamp.toLocaleTimeString()
  );
  bikesChart.data.datasets[0].data = history.map(
    (h) => h.bikesAvailable
  );

  bikesChart.update();
}

export { initChart, updateChart };
