"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  useMediaQuery,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
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

const OrderReportStatCard = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [percentChange, setPercentChange] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeFilter, setTimeFilter] = useState<string>("1M");
  const [categoryData, setCategoryData] = useState<{ [key: string]: number }>({
    ecommerce: 0,
    offline: 0,
    other: 0,
  });

  const handleTimeFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: string
  ) => {
    if (newFilter !== null) {
      setTimeFilter(newFilter);
      fetchRevenueData(newFilter);
    }
  };

  const fetchRevenueData = (filter: string) => {
    setLoading(true);

    // Simulate API call with different data based on filter
    setTimeout(() => {
      let mockRevenue = 0;
      let mockChange = 0;
      let mockCategories = { ecommerce: 0, offline: 0, other: 0 };

      switch (filter) {
        case "1W":
          mockRevenue = 2850;
          mockChange = 3.2;
          mockCategories = { ecommerce: 65, offline: 25, other: 10 };
          break;
        case "1M":
          mockRevenue = 12580;
          mockChange = 15.4;
          mockCategories = { ecommerce: 60, offline: 30, other: 10 };
          break;
        case "6M":
          mockRevenue = 68420;
          mockChange = 8.7;
          mockCategories = { ecommerce: 55, offline: 35, other: 10 };
          break;
        case "1Y":
          mockRevenue = 142750;
          mockChange = 22.1;
          mockCategories = { ecommerce: 50, offline: 40, other: 10 };
          break;
      }

      setTotalRevenue(mockRevenue);
      setPercentChange(mockChange);
      setCategoryData(mockCategories);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    fetchRevenueData(timeFilter);
  }, []);

  // Chart data and options with proper typing
  const chartData: ChartData<"doughnut"> = {
    labels: ["E-commerce", "Offline Store", "Other"],
    datasets: [
      {
        data: [
          categoryData.ecommerce,
          categoryData.offline,
          categoryData.other,
        ],
        backgroundColor: ["#d32f2f", "#333333", "#9e9e9e"],
        hoverBackgroundColor: ["#b71c1c", "#1f1f1f", "#757575"],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%", // Moved cutout here in the options
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
            return `${label}: ${percentage}%`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };

  // Get period text based on selected filter
  const getPeriodText = () => {
    switch (timeFilter) {
      case "1W":
        return "last week";
      case "1M":
        return "last month";
      case "6M":
        return "last 6 months";
      case "1Y":
        return "last year";
      default:
        return "last month";
    }
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
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Total Revenue
          </Typography>

          <ToggleButtonGroup
            size="small"
            value={timeFilter}
            exclusive
            onChange={handleTimeFilterChange}
            aria-label="time filter"
            sx={{
              "& .MuiToggleButtonGroup-grouped": {
                border: 0,
                fontSize: "0.7rem",
                px: 1,
                py: 0.5,
                "&.Mui-selected": {
                  backgroundColor: "#292929",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#444",
                  },
                },
                "&:not(.Mui-selected)": {
                  color: "text.secondary",
                },
              },
            }}
          >
            <ToggleButton value="1W">1W</ToggleButton>
            <ToggleButton value="1M">1M</ToggleButton>
            <ToggleButton value="6M">6M</ToggleButton>
            <ToggleButton value="1Y">1Y</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            {loading ? (
              <Skeleton variant="text" width={120} height={40} />
            ) : (
              <Typography
                variant={isSmallScreen ? "h5" : "h4"}
                fontWeight="bold"
              >
                ${totalRevenue !== null ? totalRevenue.toLocaleString() : "N/A"}
              </Typography>
            )}

            <Box sx={{ display: "flex", alignItems: "center" }}>
              {percentChange >= 0 ? (
                <TrendingUpIcon
                  sx={{ color: "#388e3c", fontSize: 16, mr: 0.5 }}
                />
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
                {percentChange}% vs {getPeriodText()}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              bgcolor: "#ffebee",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AssessmentIcon sx={{ color: "#d32f2f" }} />
          </Box>
        </Box>

        {/* Chart */}
        <Box
          sx={{
            height: 140,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 1,
          }}
        >
          {loading ? (
            <Skeleton variant="circular" width={140} height={140} />
          ) : (
            <Doughnut data={chartData} options={chartOptions} />
          )}
        </Box>

        {/* Legend */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: "#d32f2f",
              }}
            />
            <Typography variant="caption">E-commerce</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: "#333333",
              }}
            />
            <Typography variant="caption">Offline</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: "#9e9e9e",
              }}
            />
            <Typography variant="caption">Other</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderReportStatCard;
