"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Skeleton,
  Chip,
} from "@mui/material";
import InventoryStatCard from "../components/InventoryStatCard";
import TotalOrderStatCard from "../components/TotalOrderStatCard";
import TotalCustomerStatCard from "../components/TotalCustomerStatCard";
import OrderReportStatCard from "../components/OrderReportStatCard";
import RecentOrder from "../components/RecentOrder";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";

export default function Dashboard() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const [username, setUsername] = useState<string>("User");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    // Try to get username from localStorage or cookies
    const fetchUsername = () => {
      setIsLoading(true);
      try {
        // Try multiple sources for the username
        const storedUsername = localStorage.getItem("username");
        const storedEmail = localStorage.getItem("email");

        // Get username from token if available
        const token = localStorage.getItem("token");
        let tokenUsername = null;

        if (token) {
          try {
            // Simple JWT parsing (assuming JWT format)
            const base64Url = token.split(".")[1];
            if (base64Url) {
              const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split("")
                  .map(
                    (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                  )
                  .join("")
              );

              const payload = JSON.parse(jsonPayload);
              if (payload.username) {
                tokenUsername = payload.username;
              }
            }
          } catch (e) {
            console.error("Error parsing token:", e);
          }
        }

        // Use the first available username source
        const finalUsername =
          storedUsername ||
          tokenUsername ||
          (storedEmail ? storedEmail.split("@")[0] : null) ||
          "User";

        // Store it for consistency across components
        if (finalUsername !== "User") {
          localStorage.setItem("username", finalUsername);
        }

        setUsername(finalUsername);
      } catch (error) {
        console.error("Error fetching username:", error);
        setUsername("User");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsername();
  }, []);

  if (!isMounted) {
    return null;
  }

  // Combined layout and page
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      {/* Left Sidebar - Hidden on mobile, shown as drawer */}
      <LeftSidebar />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            xs: "100%",
            md: isTablet ? "calc(100% - 80px)" : "calc(100% - 256px - 288px)",
          },
          p: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
          <Box sx={{ mb: 4 }}>
            {isLoading ? (
              <>
                <Skeleton variant="text" width={300} height={40} />
                <Skeleton variant="text" width={200} height={24} />
              </>
            ) : (
              <>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography
                    variant={isSmallScreen ? "h5" : "h4"}
                    fontWeight="bold"
                    color="text.primary"
                  >
                    Welcome, {username}
                  </Typography>
                  <Chip
                    label="Admin"
                    size="small"
                    color="primary"
                    sx={{
                      ml: 2,
                      bgcolor: "#292929",
                      color: "white",
                      fontWeight: "medium",
                    }}
                  />
                </Box>
                <Typography variant="body1" color="text.secondary">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Typography>
              </>
            )}
          </Box>

          {/* Statistics Cards */}
          <Grid
            container
            spacing={isSmallScreen ? 2 : 3}
            sx={{ mb: isSmallScreen ? 2 : 4 }}
          >
            {/* Baris Pertama (2 card atas) */}
            <Grid container item xs={12} spacing={isSmallScreen ? 2 : 3}>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <InventoryStatCard />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <TotalOrderStatCard />
              </Grid>
            </Grid>

            {/* Baris Kedua (2 card bawah) */}
            <Grid container item xs={12} spacing={isSmallScreen ? 2 : 3}>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <TotalCustomerStatCard />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <OrderReportStatCard />
              </Grid>
            </Grid>
          </Grid>

          {/* Recent Orders */}
          <Card elevation={0} sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
              <RecentOrder />
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Right Sidebar - Hidden on mobile and tablet, shown as drawer */}
      {!isMobile && !isTablet && <RightSidebar />}
      {(isMobile || isTablet) && <RightSidebar />}
    </Box>
  );
}
