"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Button,
  Modal,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  AlertTitle,
  Snackbar,
  Typography,
  useMediaQuery,
  useTheme,
  Tooltip,
  Chip,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Badge,
  LinearProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoIcon from "@mui/icons-material/Info";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import axios from "axios";
import LeftSidebar from "../components/LeftSidebar";
import { useRouter } from "next/navigation";

// Updated Shipping interface to make courier and trackingNumber required
interface Shipping {
  status: string;
  courier: string; // Required field
  trackingNumber: string; // Required field
  id?: string;
  estimatedDate?: string;
}

interface Order {
  id: string;
  productId: string;
  productName?: string;
  quantity: number;
  customer: string;
  customerUsername?: string;
  date: string;
  orderDate?: string;
  shipping: Shipping;
  shippingStatus?: string;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  location: string;
  price: number;
  quantity: number;
}

// Enhanced error interface
interface ApiError {
  status: number;
  message: string;
  details?: string;
  code?: string;
  isAuthError: boolean;
  isNetworkError: boolean;
  isServerError: boolean;
  isValidationError: boolean;
  isNotFoundError: boolean;
  raw?: any;
}

export default function OrderPage() {
  const router = useRouter();
  const [data, setData] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<ApiError | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });
  const [editingOrder, setEditingOrder] = useState<Partial<Order> | null>({
    shipping: {
      courier: "default",
      trackingNumber: "TRACK-000",
      status: "pending",
    },
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Responsive design breakpoints
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Enhanced error logging and handling
  const logApiError = (context: string, error: unknown): ApiError => {
    console.group(`API Error: ${context}`);
    console.error("Error object:", error);

    let apiError: ApiError = {
      status: 0,
      message: "An unknown error occurred",
      isAuthError: false,
      isNetworkError: false,
      isServerError: false,
      isValidationError: false,
      isNotFoundError: false,
      raw: error,
    };

    if (axios.isAxiosError(error)) {
      const response = error.response;
      const request = error.request;

      console.error("Status:", response?.status);
      console.error("Status Text:", response?.statusText);
      console.error("Data:", response?.data);
      console.error("Headers:", response?.headers);
      console.error("Config:", error.config);

      // Extract detailed error information
      const status = response?.status || 0;
      const backendMessage = response?.data?.message || error.message;
      const backendDetails = response?.data?.error || response?.data?.details;
      const backendCode = response?.data?.code;

      // Categorize error
      const isAuthError = status === 401 || status === 403;
      const isNetworkError = !response && !!request;
      const isServerError = status >= 500;
      const isValidationError = status === 400 || status === 422;
      const isNotFoundError = status === 404;

      // Create user-friendly message
      let userMessage = backendMessage;

      if (isNetworkError) {
        userMessage = "Network error: Please check your internet connection";
      } else if (isServerError) {
        userMessage = `Server error (${status}): ${
          backendMessage || "The server encountered an error"
        }`;
      } else if (isAuthError) {
        userMessage = "Authentication error: Please log in again";
      } else if (isNotFoundError) {
        userMessage = `Not found: ${
          backendMessage || "The requested resource was not found"
        }`;
      } else if (isValidationError) {
        userMessage = `Validation error: ${
          backendMessage || "Please check your input"
        }`;
      }

      apiError = {
        status,
        message: userMessage,
        details: backendDetails,
        code: backendCode,
        isAuthError,
        isNetworkError,
        isServerError,
        isValidationError,
        isNotFoundError,
        raw: response?.data,
      };
    } else if (error instanceof Error) {
      apiError = {
        ...apiError,
        message: `Error: ${error.message}`,
        details: error.stack,
      };
    }

    console.error("Processed error:", apiError);
    console.groupEnd();

    return apiError;
  };

  // Helper to show snackbar notifications
  const showNotification = (
    message: string,
    severity: "success" | "error" | "info" | "warning" = "info"
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Update fetchOrders to use enhanced error handling
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);

    try {
      const response = await axios.get(
        "https://backend-eoq-production.up.railway.app/orders",
        {
          withCredentials: true,
        }
      );

      console.log("Raw orders data from API:", response.data);

      const mappedData: Order[] = (response.data || []).map((item: any) => ({
        id: item.id,
        productId: item.productId || "",
        productName: item.productName || "",
        customer: item.customerUsername || "",
        customerUsername: item.customerUsername || "",
        quantity: item.quantity,
        date: item.orderDate?.split("T")[0] || "",
        orderDate: item.orderDate,
        shipping: {
          status: item.shippingStatus?.toLowerCase() || "pending",
          courier: "default", // Always provide a default value
          trackingNumber: "TRACK-000", // Always provide a default value
        },
        shippingStatus: item.shippingStatus,
      }));

      console.log("Mapped orders data:", mappedData);
      setData(mappedData);

      if (mappedData.length === 0) {
        showNotification("No orders found. Create your first order!", "info");
      }
    } catch (error: unknown) {
      const errorInfo = logApiError("fetchOrders", error);
      setErrorDetails(errorInfo);

      if (errorInfo.isAuthError) {
        setError("Your session has expired. Please log in again.");
        router.push("/");
      } else if (errorInfo.isNetworkError) {
        setError(
          "Network error: Unable to connect to the server. Please check your internet connection."
        );
      } else if (errorInfo.isServerError) {
        setError(
          `Server error: ${errorInfo.message}. Our team has been notified.`
        );
      } else {
        setError(`Failed to load orders: ${errorInfo.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get<Product[]>(
        "https://backend-eoq-production.up.railway.app/product",
        {
          withCredentials: true,
        }
      );

      console.log("Products data:", response.data);
      setProducts(response.data || []);
    } catch (error) {
      const errorInfo = logApiError("fetchProducts", error);
      console.error("Failed to fetch products:", errorInfo);

      if (errorInfo.isAuthError) {
        router.push("/");
      } else {
        showNotification(
          `Failed to load products: ${errorInfo.message}`,
          "error"
        );
      }
    }
  }, [router]);

  useEffect(() => {
    if (isMounted) {
      axios.defaults.withCredentials = true;
      fetchOrders();
      fetchProducts();
    }
  }, [isMounted, fetchOrders, fetchProducts]);

  const handleAddOrEdit = async () => {
    try {
      // Validation
      if (!editingOrder?.productId && !isEditing) {
        setError("Product is required");
        return;
      }

      // Validation for quantity
      if (!editingOrder?.quantity || editingOrder.quantity < 1) {
        setError("Quantity must be at least 1");
        return;
      }

      // Format data according to backend expectations
      let orderData: any = {};

      if (isEditing) {
        // For updating an order, we need status and/or quantity
        orderData = {
          status: editingOrder.shipping?.status,
          quantity: Number(editingOrder.quantity),
        };

        console.log("Update order data:", orderData);
      } else {
        // For creating an order, we need productId and quantity
        // Note: Customer field is ignored by the backend
        orderData = {
          productId: editingOrder.productId,
          quantity: Number(editingOrder.quantity),
        };

        console.log("Create order data:", orderData);
      }

      setLoading(true);

      // Choose endpoint
      if (isEditing) {
        const response = await axios.patch(
          `https://backend-eoq-production.up.railway.app/orders/${editingOrder.id}`,
          orderData,
          { withCredentials: true }
        );

        console.log("Update response:", response.data);

        // Optimistic update - update the local data immediately
        setData((prevData) =>
          prevData.map((order) => {
            if (order.id === editingOrder.id) {
              return {
                ...order,
                quantity: editingOrder.quantity || order.quantity,
                shipping: {
                  ...order.shipping,
                  status:
                    editingOrder.shipping?.status || order.shipping.status,
                  courier: order.shipping.courier,
                  trackingNumber: order.shipping.trackingNumber,
                },
                shippingStatus:
                  editingOrder.shipping?.status || order.shippingStatus,
              };
            }
            return order;
          })
        );

        showNotification("Order updated successfully", "success");
      } else {
        await axios.post(
          "https://backend-eoq-production.up.railway.app/orders",
          orderData,
          { withCredentials: true }
        );
        showNotification("Order created successfully", "success");

        // Instead of calling fetchOrders which refreshes all orders and might reset statuses,
        // let's fetch just the new order and add it to our existing data
        try {
          const response = await axios.get(
            "https://backend-eoq-production.up.railway.app/orders",
            {
              withCredentials: true,
            }
          );

          // Find the most recently added order (assuming it's the one we just created)
          const newOrders = response.data || [];
          if (newOrders.length > 0) {
            // Sort by date descending to get the newest order
            newOrders.sort(
              (a: any, b: any) =>
                new Date(b.orderDate).getTime() -
                new Date(a.orderDate).getTime()
            );
            const newestOrder = newOrders[0];

            // Map the new order to our format
            const mappedNewOrder = {
              id: newestOrder.id,
              productId: newestOrder.productId || "",
              productName: newestOrder.productName || "",
              customer: newestOrder.customerUsername || "",
              customerUsername: newestOrder.customerUsername || "",
              quantity: newestOrder.quantity,
              date: newestOrder.orderDate?.split("T")[0] || "",
              orderDate: newestOrder.orderDate,
              shipping: {
                status: newestOrder.shippingStatus?.toLowerCase() || "pending",
                courier: "default",
                trackingNumber: "TRACK-000",
              },
              shippingStatus: newestOrder.shippingStatus,
            };

            // Add the new order to our existing data without affecting other orders
            setData((prevData) => [...prevData, mappedNewOrder]);
          }
        } catch (error) {
          console.error("Error fetching new order:", error);
          // If there's an error, fall back to fetching all orders
          fetchOrders();
        }
      }

      setOpenModal(false);
      setError(null);
      setErrorDetails(null);
    } catch (error: unknown) {
      const errorInfo = logApiError("handleAddOrEdit", error);
      setErrorDetails(errorInfo);

      if (errorInfo.isValidationError) {
        if (
          errorInfo.message.includes("status") &&
          errorInfo.message.includes("invalid")
        ) {
          setError(
            "Invalid status. Choose: pending, processing, shipped, delivered, cancelled"
          );
        } else if (errorInfo.message.includes("quantity")) {
          setError("Invalid quantity. Quantity must be at least 1.");
        } else if (errorInfo.message.includes("productId")) {
          setError("Invalid Product ID. Please select a valid product.");
        } else {
          setError(`Validation error: ${errorInfo.message}`);
        }
      } else if (errorInfo.isAuthError) {
        setError("Authentication error: Please log in again");
        router.push("/");
      } else if (errorInfo.isServerError) {
        setError(
          `Server error (${errorInfo.status}): ${errorInfo.message}. Our team has been notified.`
        );
      } else {
        setError(`Error: ${errorInfo.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (order: Order) => {
    console.log("Editing order:", order);
    setIsEditing(true);
    setOpenModal(true);
    setError(null);
    setErrorDetails(null);

    // Set the editing order with the correct structure
    setEditingOrder({
      id: order.id,
      productId: order.productId,
      quantity: order.quantity,
      customer: order.customer || order.customerUsername,
      date: order.date || order.orderDate?.split("T")[0],
      shipping: {
        status:
          order.shipping?.status ||
          order.shippingStatus?.toLowerCase() ||
          "pending",
        courier: order.shipping?.courier || "default", // Always provide a default value
        trackingNumber: order.shipping?.trackingNumber || "TRACK-000", // Always provide a default value
      },
    });
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setOpenModal(true);
    setError(null);
    setErrorDetails(null);

    setEditingOrder({
      productId: products[0]?.id ? String(products[0].id) : "",
      quantity: 1,
      customer: "", // This field is ignored by the backend
      date: new Date().toISOString().split("T")[0],
      shipping: {
        courier: "default",
        trackingNumber: "TRACK-000",
        status: "pending", // This will be set by the backend anyway
      },
    });
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);

      // The backend expects a body with restoreStock property
      await axios.delete(
        `https://backend-eoq-production.up.railway.app/orders/${id}`,
        {
          withCredentials: true,
          data: { restoreStock: true }, // This is the required body parameter
        }
      );

      // Optimistic update - remove the deleted order from the local data
      setData((prevData) => prevData.filter((order) => order.id !== id));

      showNotification("Order deleted successfully", "success");
    } catch (error) {
      const errorInfo = logApiError("handleDelete", error);
      setErrorDetails(errorInfo);

      if (errorInfo.isNotFoundError) {
        setError("Order not found. It may have been already deleted.");
        // Refresh the list to ensure we have the latest data
        fetchOrders();
      } else if (errorInfo.isAuthError) {
        setError("Authentication error: Please log in again");
        router.push("/");
      } else if (errorInfo.isServerError) {
        setError(
          `Server error (${errorInfo.status}): ${errorInfo.message}. Our team has been notified.`
        );
      } else {
        setError(`Failed to delete order: ${errorInfo.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId: string) => {
    // First check if we have a direct productName in the order
    const order = data.find((o) => o.productId === productId);
    if (order?.productName) {
      return order.productName;
    }

    // Otherwise look up in products array
    const product = products.find((p) => String(p.id) === productId);
    return product ? product.name : productId;
  };

  const filteredData = data.filter((row) => {
    // Filter by status if not "all"
    if (statusFilter !== "all" && row.shipping?.status !== statusFilter) {
      return false;
    }

    // Use productName directly if available
    const productName = row.productName || getProductName(row.productId || "");
    const searchTermLower = searchTerm.toLowerCase();
    return productName.toLowerCase().includes(searchTermLower);
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Get counts for status badges
  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    data.forEach((order) => {
      const status =
        order.shipping?.status ||
        order.shippingStatus?.toLowerCase() ||
        "pending";
      if (counts[status as keyof typeof counts] !== undefined) {
        counts[status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  // Responsive table columns based on screen size
  const getTableColumns = () => {
    if (isSmallScreen) {
      return (
        <>
          <TableCell>Product</TableCell>
          <TableCell>Qty</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Actions</TableCell>
        </>
      );
    } else if (isMediumScreen) {
      return (
        <>
          <TableCell>Date</TableCell>
          <TableCell>Product</TableCell>
          <TableCell>Customer</TableCell>
          <TableCell>Qty</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Actions</TableCell>
        </>
      );
    } else {
      return (
        <>
          <TableCell>Order ID</TableCell>
          <TableCell>Date</TableCell>
          <TableCell>Product</TableCell>
          <TableCell>Customer</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Actions</TableCell>
        </>
      );
    }
  };

  // Responsive table rows based on screen size
  const renderTableRow = (row: Order) => {
    if (isSmallScreen) {
      return (
        <>
          <TableCell>
            <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
              {row.productName || getProductName(row.productId || "")}
            </Typography>
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              {new Date(row.date || row.orderDate || "").toLocaleDateString()}
            </Typography>
          </TableCell>
          <TableCell>{row.quantity || 0}</TableCell>
          <TableCell>
            <Chip
              label={(
                row.shipping?.status ||
                row.shippingStatus ||
                "N/A"
              ).toUpperCase()}
              size="small"
              sx={{
                backgroundColor: getStatusColor(
                  row.shipping?.status || row.shippingStatus || ""
                ),
                color: getStatusTextColor(
                  row.shipping?.status || row.shippingStatus || ""
                ),
                borderRadius: "4px",
                fontWeight: "medium",
              }}
            />
          </TableCell>
          <TableCell>
            <IconButton
              size="small"
              sx={{ color: "primary.main" }}
              onClick={() => handleEditClick(row)}
              disabled={loading}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: "error.main" }}
              onClick={() => handleDelete(row.id)}
              disabled={loading}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </TableCell>
        </>
      );
    } else if (isMediumScreen) {
      return (
        <>
          <TableCell>
            {row.date || row.orderDate
              ? new Date(row.date || row.orderDate || "").toLocaleDateString()
              : "N/A"}
          </TableCell>
          <TableCell>
            {row.productName || getProductName(row.productId || "")}
          </TableCell>
          <TableCell>{row.customer || row.customerUsername || "N/A"}</TableCell>
          <TableCell>{row.quantity || 0}</TableCell>
          <TableCell>
            <Chip
              label={(
                row.shipping?.status ||
                row.shippingStatus ||
                "N/A"
              ).toUpperCase()}
              size="small"
              sx={{
                backgroundColor: getStatusColor(
                  row.shipping?.status || row.shippingStatus || ""
                ),
                color: getStatusTextColor(
                  row.shipping?.status || row.shippingStatus || ""
                ),
                borderRadius: "4px",
                fontWeight: "medium",
              }}
            />
          </TableCell>
          <TableCell>
            <IconButton
              size="small"
              sx={{ color: "primary.main" }}
              onClick={() => handleEditClick(row)}
              disabled={loading}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: "error.main" }}
              onClick={() => handleDelete(row.id)}
              disabled={loading}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </TableCell>
        </>
      );
    } else {
      return (
        <>
          <TableCell>
            {row.id ? row.id.substring(0, 8) + "..." : "N/A"}
          </TableCell>
          <TableCell>
            {row.date || row.orderDate
              ? new Date(row.date || row.orderDate || "").toLocaleDateString()
              : "N/A"}
          </TableCell>
          <TableCell>
            {row.productName || getProductName(row.productId || "")}
          </TableCell>
          <TableCell>{row.customer || row.customerUsername || "N/A"}</TableCell>
          <TableCell>{row.quantity || 0}</TableCell>
          <TableCell>
            <Chip
              label={(
                row.shipping?.status ||
                row.shippingStatus ||
                "N/A"
              ).toUpperCase()}
              size="small"
              sx={{
                backgroundColor: getStatusColor(
                  row.shipping?.status || row.shippingStatus || ""
                ),
                color: getStatusTextColor(
                  row.shipping?.status || row.shippingStatus || ""
                ),
                borderRadius: "4px",
                fontWeight: "medium",
                py: 0.5,
              }}
            />
          </TableCell>
          <TableCell>
            <IconButton
              sx={{ color: "primary.main" }}
              onClick={() => handleEditClick(row)}
              disabled={loading}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              sx={{ color: "error.main" }}
              onClick={() => handleDelete(row.id)}
              disabled={loading}
            >
              <DeleteIcon />
            </IconButton>
          </TableCell>
        </>
      );
    }
  };

  if (!isMounted) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <div
          style={{
            width: isSmallScreen ? "64px" : "256px",
            backgroundColor: "black",
          }}
        ></div>
        <div style={{ flex: 1, padding: "20px" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <LeftSidebar />
      <div
        style={{
          flex: 1,
          padding: isSmallScreen ? "10px" : "20px",
          minHeight: "100vh",
          overflow: "auto",
        }}
      >
        <Card elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography
              variant={isSmallScreen ? "h5" : "h4"}
              fontWeight="bold"
              color="text.primary"
              gutterBottom
            >
              Order Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View, create, and manage your orders. Track status and update
              order information.
            </Typography>
          </CardContent>
        </Card>

        {error && (
          <Alert
            severity={
              errorDetails?.isServerError
                ? "error"
                : errorDetails?.isValidationError
                ? "warning"
                : "error"
            }
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              errorDetails?.isAuthError ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => router.push("/")}
                >
                  Login
                </Button>
              ) : undefined
            }
          >
            <AlertTitle>
              {errorDetails?.isServerError
                ? "Server Error"
                : errorDetails?.isValidationError
                ? "Validation Error"
                : errorDetails?.isAuthError
                ? "Authentication Error"
                : "Error"}
            </AlertTitle>
            {error}
            {errorDetails?.details && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Details: {errorDetails.details}
              </Typography>
            )}
          </Alert>
        )}

        <Card elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: isSmallScreen ? "column" : "row",
                gap: 2,
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Badge
                  badgeContent={data.length}
                  color="primary"
                  sx={{ "& .MuiBadge-badge": { top: 5, right: 5 } }}
                >
                  <Chip
                    label="All"
                    onClick={() => setStatusFilter("all")}
                    variant={statusFilter === "all" ? "filled" : "outlined"}
                    color="primary"
                    sx={{ fontWeight: "medium" }}
                  />
                </Badge>
                <Badge
                  badgeContent={statusCounts.pending}
                  color="warning"
                  sx={{ "& .MuiBadge-badge": { top: 5, right: 5 } }}
                >
                  <Chip
                    label="Pending"
                    onClick={() => setStatusFilter("pending")}
                    variant={statusFilter === "pending" ? "filled" : "outlined"}
                    color="warning"
                    sx={{ fontWeight: "medium" }}
                  />
                </Badge>
                <Badge
                  badgeContent={statusCounts.processing}
                  color="info"
                  sx={{ "& .MuiBadge-badge": { top: 5, right: 5 } }}
                >
                  <Chip
                    label="Processing"
                    onClick={() => setStatusFilter("processing")}
                    variant={
                      statusFilter === "processing" ? "filled" : "outlined"
                    }
                    color="info"
                    sx={{ fontWeight: "medium" }}
                  />
                </Badge>
                <Badge
                  badgeContent={statusCounts.shipped}
                  color="success"
                  sx={{ "& .MuiBadge-badge": { top: 5, right: 5 } }}
                >
                  <Chip
                    label="Shipped"
                    onClick={() => setStatusFilter("shipped")}
                    variant={statusFilter === "shipped" ? "filled" : "outlined"}
                    color="success"
                    sx={{ fontWeight: "medium" }}
                  />
                </Badge>
                <Badge
                  badgeContent={statusCounts.delivered}
                  color="success"
                  sx={{ "& .MuiBadge-badge": { top: 5, right: 5 } }}
                >
                  <Chip
                    label="Delivered"
                    onClick={() => setStatusFilter("delivered")}
                    variant={
                      statusFilter === "delivered" ? "filled" : "outlined"
                    }
                    color="success"
                    sx={{ fontWeight: "medium" }}
                  />
                </Badge>
                <Badge
                  badgeContent={statusCounts.cancelled}
                  color="error"
                  sx={{ "& .MuiBadge-badge": { top: 5, right: 5 } }}
                >
                  <Chip
                    label="Cancelled"
                    onClick={() => setStatusFilter("cancelled")}
                    variant={
                      statusFilter === "cancelled" ? "filled" : "outlined"
                    }
                    color="error"
                    sx={{ fontWeight: "medium" }}
                  />
                </Badge>
              </Box>
            </Box>

            <Divider sx={{ myy: 2 }} />

            <Box
              sx={{
                display: "flex",
                flexDirection: isSmallScreen ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isSmallScreen ? "stretch" : "center",
                gap: isSmallScreen ? 2 : 0,
              }}
            >
              <TextField
                variant="outlined"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
                  ),
                }}
                sx={{
                  width: isSmallScreen ? "100%" : "300px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
                size={isSmallScreen ? "small" : "medium"}
              />
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#292929",
                  color: "white",
                  borderRadius: "8px",
                  px: 3,
                  "&:hover": {
                    bgcolor: "#444",
                  },
                }}
                startIcon={<AddIcon />}
                onClick={handleAddClick}
                disabled={loading}
                fullWidth={isSmallScreen}
                size={isSmallScreen ? "small" : "medium"}
              >
                Add Order
              </Button>
            </Box>
          </CardContent>
        </Card>

        {loading ? (
          <Card elevation={0} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <LinearProgress />
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">
                  Loading orders...
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Card elevation={0} sx={{ borderRadius: 2 }}>
            <TableContainer sx={{ borderRadius: 2 }}>
              <Table size={isSmallScreen ? "small" : "medium"}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                    {getTableColumns()}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={isSmallScreen ? 4 : isMediumScreen ? 6 : 7}
                        align="center"
                      >
                        <Box
                          sx={{
                            py: isSmallScreen ? 4 : 6,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <ErrorOutlineIcon
                            sx={{
                              fontSize: isSmallScreen ? 40 : 60,
                              color: "text.secondary",
                            }}
                          />
                          <Typography
                            variant={isSmallScreen ? "h6" : "h5"}
                            color="text.secondary"
                          >
                            No orders found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchTerm || statusFilter !== "all"
                              ? "Try adjusting your search or filter criteria"
                              : "Click 'Add Order' to create your first order"}
                          </Typography>
                          {(searchTerm || statusFilter !== "all") && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                              }}
                              sx={{ mt: 1 }}
                            >
                              Clear Filters
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((row) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
                        {renderTableRow(row)}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        <Modal open={openModal} onClose={() => !loading && setOpenModal(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: isSmallScreen ? "90%" : 400,
              bgcolor: "white",
              boxShadow: 24,
              p: isSmallScreen ? 3 : 4,
              borderRadius: 2,
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                textAlign: "center",
                color: "text.primary",
                fontWeight: "bold",
                mb: 3,
              }}
            >
              {isEditing ? "Edit Order" : "Add New Order"}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
                {error}
              </Alert>
            )}

            {!isEditing && (
              <>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={editingOrder?.date || ""}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, date: e.target.value })
                  }
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  disabled={loading}
                  size={isSmallScreen ? "small" : "medium"}
                  sx={{ mb: 2 }}
                />

                <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                  <InputLabel>Product</InputLabel>
                  <Select
                    value={editingOrder?.productId || ""}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        productId: e.target.value,
                      })
                    }
                    disabled={loading}
                    error={!editingOrder?.productId}
                    size={isSmallScreen ? "small" : "medium"}
                  >
                    {products.length === 0 ? (
                      <MenuItem disabled value="">
                        No products available
                      </MenuItem>
                    ) : (
                      products.map((product) => (
                        <MenuItem key={product.id} value={String(product.id)}>
                          {product.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                {/* Added back the customer field with a note that it's ignored by the backend */}
                <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Customer"
                    value={editingOrder?.customer || ""}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        customer: e.target.value,
                      })
                    }
                    disabled={loading}
                    size={isSmallScreen ? "small" : "medium"}
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="This field is for display only. The system will use your account username regardless of what you enter here.">
                          <InfoIcon
                            color="info"
                            fontSize="small"
                            sx={{ ml: 1 }}
                          />
                        </Tooltip>
                      ),
                    }}
                    helperText="Note: System will use your account username regardless of input"
                  />
                </FormControl>
              </>
            )}

            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={editingOrder?.quantity?.toString() || ""}
              onChange={(e) =>
                setEditingOrder({
                  ...editingOrder,
                  quantity: Number(e.target.value),
                })
              }
              margin="normal"
              error={!editingOrder?.quantity || editingOrder.quantity < 1}
              helperText={
                !editingOrder?.quantity || editingOrder.quantity < 1
                  ? "Quantity must be at least 1"
                  : ""
              }
              size={isSmallScreen ? "small" : "medium"}
              sx={{ mb: 2 }}
              InputProps={{
                inputProps: { min: 1 },
              }}
            />

            {isEditing && (
              <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editingOrder?.shipping?.status || "pending"}
                  onChange={(e) => {
                    // Fixed: Ensure we always provide required fields
                    setEditingOrder({
                      ...editingOrder,
                      shipping: {
                        status: e.target.value,
                        courier: editingOrder?.shipping?.courier || "default",
                        trackingNumber:
                          editingOrder?.shipping?.trackingNumber || "TRACK-000",
                      },
                    });
                  }}
                  size={isSmallScreen ? "small" : "medium"}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            )}

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setOpenModal(false)}
                disabled={loading}
                size={isSmallScreen ? "small" : "medium"}
                sx={{ borderRadius: "8px" }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                sx={{
                  bgcolor: "black",
                  color: "white",
                  borderRadius: "8px",
                  "&:hover": {
                    bgcolor: "#444",
                  },
                }}
                onClick={handleAddOrEdit}
                disabled={loading}
                size={isSmallScreen ? "small" : "medium"}
              >
                {loading ? "Processing..." : "Save"}
              </Button>
            </Box>
          </Box>
        </Modal>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

const getStatusColor = (status: string) => {
  const lowerStatus = status.toLowerCase();
  switch (lowerStatus) {
    case "pending":
      return "#fff8e1";
    case "processing":
      return "#e3f2fd";
    case "shipped":
      return "#e8f5e9";
    case "delivered":
      return "#e8f5e9";
    case "cancelled":
      return "#ffebee";
    default:
      return "#f5f5f5";
  }
};

const getStatusTextColor = (status: string) => {
  const lowerStatus = status.toLowerCase();
  switch (lowerStatus) {
    case "pending":
      return "#f57c00";
    case "processing":
      return "#1976d2";
    case "shipped":
      return "#388e3c";
    case "delivered":
      return "#388e3c";
    case "cancelled":
      return "#d32f2f";
    default:
      return "#757575";
  }
};
