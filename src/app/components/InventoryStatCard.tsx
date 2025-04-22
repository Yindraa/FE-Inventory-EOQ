"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  type ChartOptions,
  type ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

const InventoryStatCard = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [inventoryTrend, setInventoryTrend] = useState<number[]>([]);
  const [percentChange, setPercentChange] = useState<number>(0);

  useEffect(() => {
    const fetchInventoryStats = async () => {
      try {
        setLoading(true);
        // Mock data for development - in production, use your actual API
        const mockData = {
          data: Array(10)
            .fill(null)
            .map((_, i) => ({ id: i + 1, name: `Product ${i + 1}` })),
        };

        // Uncomment this for real API call
        // const response = await axios.get("https://backend-eoq-production.up.railway.app/product", {
        //   withCredentials: true,
        // })
        // setTotalProducts(response.data.length)

        // For development, use mock data
        setTotalProducts(mockData.data.length);

        // Generate mock trend data based on total products
        const mockTrend = generateMockTrendData(mockData.data.length);
        setInventoryTrend(mockTrend);

        // Calculate mock percentage change
        const lastMonth = mockTrend[mockTrend.length - 2] || 0;
        const currentMonth = mockTrend[mockTrend.length - 1] || 0;
        const change =
          lastMonth > 0 ? ((currentMonth - lastMonth) / lastMonth) * 100 : 0;
        setPercentChange(Number.parseFloat(change.toFixed(1)));
      } catch (error) {
        console.error("Error fetching inventory stats:", error);
        setError("Failed to load inventory data");
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryStats();
  }, []);

  // Generate mock trend data for visualization
  const generateMockTrendData = (currentValue: number) => {
    const months = 6;
    const result = [];
    let baseValue = Math.max(
      currentValue - Math.floor(Math.random() * 10) - 5,
      0
    );

    for (let i = 0; i < months; i++) {
      // Add some randomness to create a realistic trend
      const change = Math.floor(Math.random() * 6) - 2; // Random value between -2 and 3
      baseValue = Math.max(baseValue + change, 0);
      result.push(baseValue);
    }

    // Ensure the last value matches our current total
    result[months - 1] = currentValue;
    return result;
  };

  // Chart data and options with proper typing
  const chartData: ChartData<"line"> = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: inventoryTrend,
        borderColor: percentChange >= 0 ? "#4ade80" : "#f87171",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 100);
          if (percentChange >= 0) {
            gradient.addColorStop(0, "rgba(74, 222, 128, 0.5)");
            gradient.addColorStop(1, "rgba(74, 222, 128, 0.0)");
          } else {
            gradient.addColorStop(0, "rgba(248, 113, 113, 0.5)");
            gradient.addColorStop(1, "rgba(248, 113, 113, 0.0)");
          }
          return gradient;
        },
        pointBackgroundColor: percentChange >= 0 ? "#4ade80" : "#f87171",
        pointBorderColor: "#fff",
        pointBorderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
        min: Math.min(...inventoryTrend) * 0.8,
        max: Math.max(...inventoryTrend) * 1.2,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#333",
        titleColor: "#fff",
        bodyColor: "#fff",
        titleFont: {
          size: 13,
          weight: "bold",
        },
        bodyFont: {
          size: 12,
        },
        padding: 10,
        displayColors: false,
        callbacks: {
          title: (items: any) => `Month: ${items[0].label}`,
          label: (item: any) => `Products: ${item.raw}`,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    elements: {
      line: {
        capBezierPoints: true,
      },
    },
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 2,
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
        },
      }}
    >
      <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Products
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={100} height={40} />
            ) : (
              <Typography
                variant={isSmallScreen ? "h5" : "h4"}
                fontWeight="bold"
              >
                {totalProducts !== null ? totalProducts : "N/A"}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: percentChange >= 0 ? "#e8f5e9" : "#ffebee",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <InventoryIcon
              sx={{ color: percentChange >= 0 ? "#388e3c" : "#d32f2f" }}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {percentChange >= 0 ? (
            <TrendingUpIcon sx={{ color: "#388e3c", fontSize: 16, mr: 0.5 }} />
          ) : (
            <TrendingDownIcon
              sx={{ color: "#d32f2f", fontSize: 16, mr: 0.5 }}
            />
          )}
          <Typography
            variant="caption"
            color={percentChange >= 0 ? "#388e3c" : "#d32f2f"}
            fontWeight="medium"
          >
            {percentChange >= 0 ? "+" : ""}
            {percentChange}% from last month
          </Typography>
        </Box>

        {/* Chart */}
        <Box sx={{ height: 80, mt: 1 }}>
          {loading ? (
            <Skeleton variant="rectangular" width="100%" height={80} />
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default InventoryStatCard;
