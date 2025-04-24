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
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const TotalCustomerStatCard = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const [newCustomers, setNewCustomers] = useState<number | null>(null);
  const [percentChange, setPercentChange] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [chartInitialized, setChartInitialized] = useState<boolean>(false);

  useEffect(() => {
    // Simulate API call
    const fetchCustomerStats = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch from your API
        // const response = await axios.get('/api/customers/stats')

        // Simulated data
        setTimeout(() => {
          const mockTotal = 42;
          const mockNew = 8;
          const mockChange = 5.2;

          setTotalCustomers(mockTotal);
          setNewCustomers(mockNew);
          setPercentChange(mockChange);
          setLoading(false);
          setChartInitialized(true);
        }, 1000);
      } catch (error) {
        console.error("Error fetching customer stats:", error);
        setLoading(false);
      }
    };

    fetchCustomerStats();

    // Ensure Chart.js is properly initialized
    if (typeof window !== "undefined") {
      const initializeChart = () => {
        if (!chartInitialized) {
          ChartJS.register(ArcElement, Tooltip, Legend);
          setChartInitialized(true);
        }
      };

      initializeChart();
    }
  }, [chartInitialized]);

  const loyalCustomers =
    totalCustomers !== null && newCustomers !== null
      ? totalCustomers - newCustomers
      : null;

  // Chart data and options with proper typing
  const chartData: ChartData<"doughnut"> = {
    labels: ["New Customers", "Loyal Customers"],
    datasets: [
      {
        data: [newCustomers || 0, loyalCustomers || 0],
        backgroundColor: ["#f57c00", "#333333"],
        hoverBackgroundColor: ["#ef6c00", "#1f1f1f"],
        borderWidth: 0,
        // Remove cutout from here - it should be in options
      },
    ],
  };

  const chartOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%", // Move cutout here in the options
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
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
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
              Total Customers
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={100} height={40} />
            ) : (
              <Typography
                variant={isSmallScreen ? "h5" : "h4"}
                fontWeight="bold"
              >
                {totalCustomers !== null ? totalCustomers : "N/A"}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: "#fff8e1",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PeopleIcon sx={{ color: "#f57c00" }} />
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
            {newCustomers !== null ? `${newCustomers} new customers` : ""}
            {percentChange >= 0 ? " +" : " "}
            {percentChange}% from last month
          </Typography>
        </Box>

        {/* Chart */}
        <Box
          sx={{
            height: 120,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loading ? (
            <Skeleton variant="circular" width={120} height={120} />
          ) : chartInitialized ? (
            <>
              <Box
                sx={{
                  position: "absolute",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  New
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {newCustomers !== null &&
                  totalCustomers !== null &&
                  totalCustomers > 0
                    ? `${Math.round((newCustomers / totalCustomers) * 100)}%`
                    : "N/A"}
                </Typography>
              </Box>
              <Doughnut data={chartData} options={chartOptions} />
            </>
          ) : (
            <Box
              sx={{
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Loading chart...
              </Typography>
            </Box>
          )}
        </Box>

        {/* Legend */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: "#f57c00",
              }}
            />
            <Typography variant="caption">New</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: "#333333",
              }}
            />
            <Typography variant="caption">Loyal</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TotalCustomerStatCard;
