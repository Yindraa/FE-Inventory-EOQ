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
  Chip,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Badge,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoIcon from "@mui/icons-material/Info";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import FilterListIcon from "@mui/icons-material/FilterList";
import axios from "axios";
import LeftSidebar from "../components/LeftSidebar";

// Match the backend entity structure
interface Shipping {
  id: string;
  courier: string;
  trackingNumber: string;
  status: string;
  estimatedDate: string;
  orderId?: string;
  customer?: string;
  totalPrice?: number;
}

// Match the backend DTO
interface UpdateShippingDto {
  status?: string;
  courier?: string;
}

export default function ShippingPage() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [data, setData] = useState<Shipping[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingShipping, setEditingShipping] =
    useState<Partial<Shipping> | null>({
      courier: "",
      trackingNumber: "",
      status: "pending",
      estimatedDate: new Date().toISOString().split("T")[0],
    });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });
  const [isMounted, setIsMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const fetchShippingData = useCallback(async () => {
    if (!isMounted) return;

    setLoading(true);
    setError(null);

    try {
      // Use the backend API endpoint
      const response = await axios.get(
        "https://backend-eoq-production.up.railway.app/shipping",
        {
          withCredentials: true,
        }
      );

      console.log("Raw shipping data from API:", response.data);

      // Add console logging to see what fields are actually coming from the backend:
      console.log("Sample shipping item from API:", response.data[0]);

      // Map the data to match our frontend interface
      const mappedData: Shipping[] = (response.data || []).map((item: any) => ({
        id: item.id,
        courier: item.courier || "",
        trackingNumber: item.tracking_number || "",
        status: item.status?.toLowerCase() || "pending",
        estimatedDate: item.estimated_date
          ? item.estimated_date.split("T")[0]
          : "",
        orderId: item.order_id,
        customer: item.customer || "",
        totalPrice: item.total_price || 0,
      }));

      console.log("Mapped shipping data:", mappedData);
      setData(mappedData);

      if (mappedData.length === 0) {
        showNotification("No shipping records found.", "info");
      }
    } catch (error) {
      console.error("Error fetching shipping data:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          setError("Authentication error: Please log in again");
        } else if (!error.response) {
          setError("Network error: Unable to connect to the server");
        } else {
          setError(`Error: ${error.response?.data?.message || error.message}`);
        }
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      axios.defaults.withCredentials = true;
      fetchShippingData();
    }
  }, [isMounted, fetchShippingData]);

  const handleAddOrEdit = async () => {
    try {
      setLoading(true);

      if (!editingShipping) {
        showNotification("No shipping data to save", "error");
        return;
      }

      // Validate required fields
      if (!editingShipping.courier) {
        setError("Courier is required");
        setLoading(false);
        return;
      }

      if (isEditing && editingShipping.id) {
        // Create update DTO that matches backend expectations
        const updateDto: UpdateShippingDto = {
          status: editingShipping.status,
          courier: editingShipping.courier,
        };

        // Use PUT endpoint from backend
        await axios.put(
          `https://backend-eoq-production.up.railway.app/shipping/${editingShipping.id}`,
          updateDto,
          {
            withCredentials: true,
          }
        );

        // Optimistic update
        setData((prevData) =>
          prevData.map((item) =>
            item.id === editingShipping.id ? { ...item, ...updateDto } : item
          )
        );

        showNotification("Shipping updated successfully", "success");
      } else {
        // For new shipping records, we'd need a POST endpoint
        // But your backend doesn't seem to have one, so we'll show an error
        showNotification(
          "Creating new shipping records is not supported by the API",
          "error"
        );
      }

      setOpenModal(false);
      setError(null);
    } catch (error) {
      console.error("Error saving shipping data:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          setError("Authentication error: Please log in again");
        } else if (!error.response) {
          setError("Network error: Unable to connect to the server");
        } else {
          setError(`Error: ${error.response?.data?.message || error.message}`);
        }
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (shipping: Shipping) => {
    console.log("Editing shipping:", shipping);
    setIsEditing(true);
    setOpenModal(true);
    setError(null);
    setEditingShipping({
      id: shipping.id,
      courier: shipping.courier,
      trackingNumber: shipping.trackingNumber,
      status: shipping.status,
      estimatedDate: shipping.estimatedDate,
      orderId: shipping.orderId,
      customer: shipping.customer,
      totalPrice: shipping.totalPrice,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredData = data.filter((row) => {
    // Filter by status if not "all"
    if (statusFilter !== "all" && row.status !== statusFilter) {
      return false;
    }

    // Filter by search term
    const searchTermLower = searchTerm.toLowerCase();
    return (
      row.courier.toLowerCase().includes(searchTermLower) ||
      (row.trackingNumber &&
        row.trackingNumber.toLowerCase().includes(searchTermLower)) ||
      (row.customer && row.customer.toLowerCase().includes(searchTermLower))
    );
  });

  // Get counts for status badges
  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    data.forEach((shipping) => {
      const status = shipping.status?.toLowerCase() || "pending";
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
          <TableCell>Courier</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Actions</TableCell>
        </>
      );
    } else if (isMediumScreen) {
      return (
        <>
          <TableCell>Courier</TableCell>
          <TableCell>Tracking</TableCell>
          <TableCell>Customer</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Actions</TableCell>
        </>
      );
    } else {
      return (
        <>
          <TableCell>ID</TableCell>
          <TableCell>Courier</TableCell>
          <TableCell>Tracking Number</TableCell>
          <TableCell>Customer</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Estimated Date</TableCell>
          <TableCell>Actions</TableCell>
        </>
      );
    }
  };

  // Responsive table rows based on screen size
  const renderTableRow = (row: Shipping) => {
    if (isSmallScreen) {
      return (
        <>
          <TableCell>
            <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
              {row.courier}
            </Typography>
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              {row.trackingNumber}
            </Typography>
            {row.customer && (
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
              >
                {row.customer}
              </Typography>
            )}
          </TableCell>
          <TableCell>
            <Chip
              label={(row.status || "pending").toUpperCase()}
              size="small"
              sx={{
                backgroundColor: getStatusColor(row.status || "pending"),
                color: getStatusTextColor(row.status || "pending"),
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
          </TableCell>
        </>
      );
    } else if (isMediumScreen) {
      return (
        <>
          <TableCell>{row.courier}</TableCell>
          <TableCell>{row.trackingNumber}</TableCell>
          <TableCell>{row.customer || "N/A"}</TableCell>
          <TableCell>
            <Chip
              label={(row.status || "pending").toUpperCase()}
              size="small"
              sx={{
                backgroundColor: getStatusColor(row.status || "pending"),
                color: getStatusTextColor(row.status || "pending"),
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
          </TableCell>
        </>
      );
    } else {
      return (
        <>
          <TableCell>
            {row.id ? row.id.substring(0, 8) + "..." : "N/A"}
          </TableCell>
          <TableCell>{row.courier}</TableCell>
          <TableCell>{row.trackingNumber}</TableCell>
          <TableCell>{row.customer || "N/A"}</TableCell>
          <TableCell>
            <Chip
              label={(row.status || "pending").toUpperCase()}
              size="small"
              sx={{
                backgroundColor: getStatusColor(row.status || "pending"),
                color: getStatusTextColor(row.status || "pending"),
                borderRadius: "4px",
                fontWeight: "medium",
                py: 0.5,
              }}
            />
          </TableCell>
          <TableCell>{row.estimatedDate || "N/A"}</TableCell>
          <TableCell>
            <IconButton
              sx={{ color: "primary.main" }}
              onClick={() => handleEditClick(row)}
              disabled={loading}
            >
              <EditIcon />
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
              Shipping Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track and manage shipping details for your orders. Update courier
              information and delivery status.
            </Typography>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
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

            <Divider sx={{ my: 2 }} />

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
                placeholder="Search courier, tracking..."
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
              <Tooltip title="Creating new shipping records is not supported by the API">
                <span>
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
                    startIcon={<LocalShippingIcon />}
                    disabled={true}
                    fullWidth={isSmallScreen}
                    size={isSmallScreen ? "small" : "medium"}
                  >
                    Add Shipping
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>

        {loading ? (
          <Card elevation={0} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <LinearProgress />
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">
                  Loading shipping data...
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
                        colSpan={isSmallScreen ? 3 : isMediumScreen ? 5 : 7}
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
                            No shipping records found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchTerm || statusFilter !== "all"
                              ? "Try adjusting your search or filter criteria"
                              : "Shipping records will appear here when orders are shipped"}
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
              Edit Shipping
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="ID"
              value={editingShipping?.id || ""}
              margin="normal"
              disabled
              size={isSmallScreen ? "small" : "medium"}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
              <InputLabel>Courier</InputLabel>
              <Select
                value={editingShipping?.courier || ""}
                onChange={(e) =>
                  setEditingShipping({
                    ...editingShipping,
                    courier: e.target.value,
                  })
                }
                disabled={loading}
                size={isSmallScreen ? "small" : "medium"}
              >
                <MenuItem value="JNE">JNE</MenuItem>
                <MenuItem value="J&T Express">J&T Express</MenuItem>
                <MenuItem value="SiCepat">SiCepat</MenuItem>
                <MenuItem value="DHL">DHL</MenuItem>
                <MenuItem value="Pos Indonesia">Pos Indonesia</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Tracking Number"
              value={editingShipping?.trackingNumber || ""}
              onChange={(e) =>
                setEditingShipping({
                  ...editingShipping,
                  trackingNumber: e.target.value,
                })
              }
              margin="normal"
              disabled={loading}
              size={isSmallScreen ? "small" : "medium"}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={editingShipping?.status || "pending"}
                onChange={(e) =>
                  setEditingShipping({
                    ...editingShipping,
                    status: e.target.value,
                  })
                }
                disabled={loading}
                size={isSmallScreen ? "small" : "medium"}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Estimated Date"
              type="date"
              value={editingShipping?.estimatedDate || ""}
              onChange={(e) =>
                setEditingShipping({
                  ...editingShipping,
                  estimatedDate: e.target.value,
                })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
              disabled={loading}
              size={isSmallScreen ? "small" : "medium"}
              sx={{ mb: 3 }}
            />

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
                {loading ? "Saving..." : "Save"}
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
