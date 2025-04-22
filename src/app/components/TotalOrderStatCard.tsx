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
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  BarElement,
  type ChartOptions,
  type ChartData,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  BarElement
);

const TotalOrderStatCard = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [orderTrend, setOrderTrend] = useState<number[]>([]);
  const [percentChange, setPercentChange] = useState<number>(0);

  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        setLoading(true);
        // Mock data for development - in production, use your actual API
        const mockData = {
          data: Array(15)
            .fill(null)
            .map((_, i) => ({ id: i + 1, name: `Order ${i + 1}` })),
        };

        // Uncomment this for real API call
        // const response = await axios.get("https://backend-eoq-production.up.railway.app/orders", {
        //   withCredentials: true,
        // })
        // setTotalOrders(response.data.length)

        // For development, use mock data
        setTotalOrders(mockData.data.length);

        // Generate mock trend data based on total orders
        const mockTrend = generateMockTrendData(mockData.data.length);
        setOrderTrend(mockTrend);

        // Calculate mock percentage change
        const lastMonth = mockTrend[mockTrend.length - 2] || 0;
        const currentMonth = mockTrend[mockTrend.length - 1] || 0;
        const change =
          lastMonth > 0 ? ((currentMonth - lastMonth) / lastMonth) * 100 : 0;
        setPercentChange(Number.parseFloat(change.toFixed(1)));
      } catch (error) {
        console.error("Error fetching order stats:", error);
        setError("Failed to load order data");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStats();
  }, []);

  // Generate mock trend data for visualization
  const generateMockTrendData = (currentValue: number) => {
    const months = 6;
    const result = [];
    let baseValue = Math.max(Math.floor(currentValue / 2), 1);

    for (let i = 0; i < months; i++) {
      // Add some randomness to create a realistic trend
      const change = Math.floor(Math.random() * 4) - 1; // Random value between -1 and 2
      baseValue = Math.max(baseValue + change, 0);
      result.push(baseValue);
    }

    // Ensure the last value matches our current total
    result[months - 1] = currentValue;
    return result;
  };

  // Chart data and options with proper typing
  const chartData: ChartData<"bar"> = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: orderTrend,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 100);
          if (percentChange >= 0) {
            gradient.addColorStop(0, "rgba(25, 118, 210, 0.8)");
            gradient.addColorStop(1, "rgba(25, 118, 210, 0.3)");
          } else {
            gradient.addColorStop(0, "rgba(211, 47, 47, 0.8)");
            gradient.addColorStop(1, "rgba(211, 47, 47, 0.3)");
          }
          return gradient;
        },
        borderRadius: 4,
        borderSkipped: false,
        barThickness: 8,
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
        min: 0,
        max: Math.max(...orderTrend) * 1.3,
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
          label: (item: any) => `Orders: ${item.raw}`,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
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
              Total Orders
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={100} height={40} />
            ) : (
              <Typography
                variant={isSmallScreen ? "h5" : "h4"}
                fontWeight="bold"
              >
                {totalOrders !== null ? totalOrders : "N/A"}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: percentChange >= 0 ? "#e3f2fd" : "#ffebee",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoppingCartIcon
              sx={{ color: percentChange >= 0 ? "#1976d2" : "#d32f2f" }}
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
            <Bar data={chartData} options={chartOptions} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TotalOrderStatCard;
