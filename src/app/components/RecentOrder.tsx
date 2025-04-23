"use client";

import type React from "react";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  useMediaQuery,
  useTheme,
  IconButton,
  Button,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useRouter } from "next/navigation";

// Define the Order interface to match the API response
interface Order {
  id: string;
  productId: string;
  productName?: string;
  customer: string;
  customerName?: string;
  quantity: number;
  date: string;
  orderDate?: string;
  shipping: {
    status: string;
    courier: string;
    trackingNumber: string;
  };
  shippingStatus?: string;
  totalPrice?: number;
}

const RecentOrder: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch data from the backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get the token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No authentication token found");
        setLoading(false);
        // Don't set an error, just show empty state
        setOrders([]);
        return;
      }

      // Fetch real data with authentication
      const response = await axios.get(
        "https://backend-eoq-production.up.railway.app/orders",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("RecentOrder - Raw orders data from API:", response.data);

      if (!response.data || response.data.length === 0) {
        // No orders found, but this is not an error
        setOrders([]);
        setLoading(false);
        return;
      }

      // Map the API response to our Order interface
      const mappedData: Order[] = (response.data || []).map((item: any) => ({
        id: item.id,
        productId: item.productId || "",
        productName: item.productName || "",
        customer: item.customerName || "",
        customerName: item.customerName || "",
        quantity: item.quantity,
        date: item.orderDate?.split("T")[0] || "",
        orderDate: item.orderDate,
        shipping: {
          status: item.shippingStatus?.toLowerCase() || "pending",
          courier: "default",
          trackingNumber: "TRACK-000",
        },
        shippingStatus: item.shippingStatus?.toLowerCase() || "pending",
        // Calculate total price based on quantity (in a real app, this would come from the API)
        totalPrice: item.totalPrice || item.quantity * 25, // Use API totalPrice or fallback to mock calculation
      }));

      // Sort by date (newest first) and take the top 5
      mappedData.sort((a, b) => {
        const dateA = new Date(a.orderDate || a.date || "").getTime();
        const dateB = new Date(b.orderDate || b.date || "").getTime();
        return dateB - dateA;
      });

      setOrders(mappedData.slice(0, 5));
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching orders:", error);

      // Don't show error messages, just show empty state
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = () => {
    fetchOrders();
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/Order?id=${orderId}`);
  };

  // Get status color based on status string
  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case "pending":
        return { bg: "#fff8e1", text: "#f57c00" };
      case "processing":
        return { bg: "#e3f2fd", text: "#1976d2" };
      case "shipped":
        return { bg: "#e8f5e9", text: "#388e3c" };
      case "delivered":
        return { bg: "#e8f5e9", text: "#388e3c" };
      case "cancelled":
        return { bg: "#ffebee", text: "#d32f2f" };
      default:
        return { bg: "#f5f5f5", text: "#757575" };
    }
  };

  // Responsive table columns based on screen size
  const getTableColumns = () => {
    if (isSmallScreen) {
      return (
        <TableRow>
          <TableCell>Order</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      );
    } else if (isMediumScreen) {
      return (
        <TableRow>
          <TableCell>Order ID</TableCell>
          <TableCell>Date</TableCell>
          <TableCell>Product</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      );
    } else {
      return (
        <TableRow>
          <TableCell>Order ID</TableCell>
          <TableCell>Date</TableCell>
          <TableCell>Product</TableCell>
          <TableCell>Customer</TableCell>
          <TableCell>Total Price</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      );
    }
  };

  // Responsive table rows based on screen size
  const renderTableRow = (order: Order) => {
    if (isSmallScreen) {
      return (
        <TableRow key={order.id} hover>
          <TableCell>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {order.productName || "Product"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(
                  order.date || order.orderDate || ""
                ).toLocaleDateString()}
              </Typography>
            </Box>
          </TableCell>
          <TableCell>
            <Chip
              label={(
                order.shipping?.status ||
                order.shippingStatus ||
                "N/A"
              ).toUpperCase()}
              size="small"
              sx={{
                backgroundColor: getStatusColor(
                  order.shipping?.status || order.shippingStatus || ""
                ).bg,
                color: getStatusColor(
                  order.shipping?.status || order.shippingStatus || ""
                ).text,
                fontWeight: "medium",
                fontSize: "0.7rem",
                height: "24px",
              }}
            />
          </TableCell>
          <TableCell align="right">
            <IconButton size="small" onClick={() => handleViewOrder(order.id)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </TableCell>
        </TableRow>
      );
    } else if (isMediumScreen) {
      return (
        <TableRow key={order.id} hover>
          <TableCell>{order.id.substring(0, 8)}...</TableCell>
          <TableCell>
            {new Date(order.date || order.orderDate || "").toLocaleDateString()}
          </TableCell>
          <TableCell>{order.productName || "Product"}</TableCell>
          <TableCell>
            <Chip
              label={(
                order.shipping?.status ||
                order.shippingStatus ||
                "N/A"
              ).toUpperCase()}
              size="small"
              sx={{
                backgroundColor: getStatusColor(
                  order.shipping?.status || order.shippingStatus || ""
                ).bg,
                color: getStatusColor(
                  order.shipping?.status || order.shippingStatus || ""
                ).text,
                fontWeight: "medium",
                fontSize: "0.7rem",
                height: "24px",
              }}
            />
          </TableCell>
          <TableCell align="right">
            <IconButton size="small" onClick={() => handleViewOrder(order.id)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </TableCell>
        </TableRow>
      );
    } else {
      return (
        <TableRow key={order.id} hover>
          <TableCell>{order.id.substring(0, 8)}...</TableCell>
          <TableCell>
            {new Date(order.date || order.orderDate || "").toLocaleDateString()}
          </TableCell>
          <TableCell>{order.productName || "Product"}</TableCell>
          <TableCell>
            {order.customer || order.customerName || "Customer"}
          </TableCell>
          <TableCell>${(order.totalPrice || 0).toFixed(2)}</TableCell>
          <TableCell>
            <Chip
              label={(
                order.shipping?.status ||
                order.shippingStatus ||
                "N/A"
              ).toUpperCase()}
              size="small"
              sx={{
                backgroundColor: getStatusColor(
                  order.shipping?.status || order.shippingStatus || ""
                ).bg,
                color: getStatusColor(
                  order.shipping?.status || order.shippingStatus || ""
                ).text,
                fontWeight: "medium",
                fontSize: "0.7rem",
                height: "24px",
              }}
            />
          </TableCell>
          <TableCell align="right">
            <Tooltip title="View Order Details">
              <IconButton
                size="small"
                onClick={() => handleViewOrder(order.id)}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>
      );
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Recent Orders
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={handleRefresh} disabled={loading}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <TableContainer>
        <Table size={isSmallScreen ? "small" : "medium"}>
          <TableHead sx={{ bgcolor: "#f8f9fa" }}>{getTableColumns()}</TableHead>
          <TableBody>
            {loading ? (
              // Loading skeletons
              Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell
                    colSpan={isSmallScreen ? 3 : isMediumScreen ? 5 : 7}
                  >
                    <Skeleton animation="wave" height={40} />
                  </TableCell>
                </TableRow>
              ))
            ) : orders.length > 0 ? (
              // Order data
              orders.map((order) => renderTableRow(order))
            ) : (
              // No data message
              <TableRow>
                <TableCell
                  colSpan={isSmallScreen ? 3 : isMediumScreen ? 5 : 7}
                  align="center"
                >
                  <Box
                    sx={{
                      py: 3,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <ErrorOutlineIcon
                      sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
                    />
                    <Typography variant="body1" color="text.secondary">
                      No recent orders found
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Create an order to see it here
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => router.push("/Order")}
          sx={{
            borderColor: "#292929",
            color: "#292929",
            "&:hover": { borderColor: "#000", bgcolor: "rgba(0,0,0,0.04)" },
          }}
        >
          View All Orders
        </Button>
      </Box>
    </>
  );
};

export default RecentOrder;
