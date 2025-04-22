"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Checkbox,
  Button,
  Modal,
  Box,
  Alert,
  Typography,
  Card,
  CardContent,
  Chip,
  useMediaQuery,
  useTheme,
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import SortIcon from "@mui/icons-material/Sort";
import InventoryIcon from "@mui/icons-material/Inventory";
import axios from "axios";
import LeftSidebar from "../components/LeftSidebar";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  sku: string;
  location: string;
  price: number;
  quantity: number;
  checked?: boolean;
}

interface ApiProduct {
  id: number;
  product?: string;
  name?: string;
  sku: string;
  location: string;
  price: number;
  stock?: number;
  quantity?: number;
}

export default function ProductPage() {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [data, setData] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({
    name: "",
    sku: "",
    location: "",
    price: 0,
    quantity: 1,
  });
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get<ApiProduct[]>(
        "https://backend-eoq-production.up.railway.app/product",
        {
          withCredentials: true,
        }
      );

      console.log("Raw product data:", response.data);

      setData(
        response.data.map((item) => ({
          ...item,
          name: item.name || item.product || "",
          quantity: item.quantity || item.stock || 0,
          checked: false,
        }))
      );
    } catch (error: unknown) {
      console.error("Error fetching products:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
          router.push("/");
        } else {
          setError("Failed to load products. Please try again later.");
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (isMounted) {
      axios.defaults.withCredentials = true;
      fetchProducts();
    }
  }, [isMounted, fetchProducts]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.delete(
        `https://backend-eoq-production.up.railway.app/product/${id}`,
        {
          withCredentials: true,
        }
      );
      console.log("Product deleted successfully", response);

      // Optimistic update
      setData((prevData) => prevData.filter((product) => product.id !== id));
    } catch (error: unknown) {
      console.error("Error deleting product:", error);

      // Check if error is an AxiosError and handle accordingly
      if (axios.isAxiosError(error)) {
        // Handle 401 (Unauthorized) - session expired
        if (error.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
          router.push("/");
        } else {
          // Handle other HTTP status codes, display message from backend if available
          setError(error.response?.data?.message || "Failed to delete product");
        }
      } else if (error instanceof Error) {
        // Handle unexpected error type
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    const newCheckedStatus = !selectAll;
    setSelectAll(newCheckedStatus);
    setData((prevData) =>
      prevData.map((item) => ({ ...item, checked: newCheckedStatus }))
    );
  };

  const handleSelectItem = (id: number) => {
    const updatedData = data.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setSelectAll(updatedData.every((item) => item.checked));
    setData(updatedData);
  };

  const handleAddOrEdit = async () => {
    try {
      setIsLoading(true);

      if (!editingProduct.name) {
        setError("Product name is required.");
        setIsLoading(false);
        return;
      }

      if (
        isNaN(Number(editingProduct.price)) ||
        isNaN(Number(editingProduct.quantity))
      ) {
        setError("Price and quantity must be valid numbers.");
        setIsLoading(false);
        return;
      }

      if (
        Number(editingProduct.quantity) <= 0 ||
        !Number.isInteger(Number(editingProduct.quantity))
      ) {
        setError("Quantity must be a positive integer.");
        setIsLoading(false);
        return;
      }

      const productData = {
        name: editingProduct.name,
        sku: editingProduct.sku || "",
        location: editingProduct.location || "",
        price: Number(editingProduct.price),
        quantity: Number(editingProduct.quantity),
      };

      if (editingProduct.id) {
        await axios.put(
          `https://backend-eoq-production.up.railway.app/product/${editingProduct.id}`,
          productData,
          {
            withCredentials: true,
          }
        );

        // Optimistic update
        setData((prevData) =>
          prevData.map((product) =>
            product.id === editingProduct.id
              ? { ...product, ...productData }
              : product
          )
        );
      } else {
        const response = await axios.post(
          "https://backend-eoq-production.up.railway.app/product",
          productData,
          {
            withCredentials: true,
          }
        );

        // Add the new product to the list
        if (response.data) {
          setData((prevData) => [
            ...prevData,
            {
              ...response.data,
              checked: false,
            },
          ]);
        }
      }

      setOpenModal(false);
      setError(null);
    } catch (error: unknown) {
      console.error("Error saving product:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
          router.push("/");
        } else {
          setError(
            error.response?.data?.message ||
              `Failed to save product. Server returned status ${error.response?.status}`
          );
        }
      } else {
        setError("Failed to save product. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setOpenModal(true);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Apply sorting and filtering
  const sortedAndFilteredData = [...data]
    .filter((row) => row.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aValue = a[sortField as keyof Product];
      const bValue = b[sortField as keyof Product];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // For numeric values
      const aNum = Number(aValue) || 0;
      const bNum = Number(bValue) || 0;

      return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
    });

  // Get responsive table columns
  const getTableColumns = () => {
    if (isSmallScreen) {
      return (
        <>
          <TableCell padding="checkbox">
            <Checkbox checked={selectAll} onChange={handleSelectAll} />
          </TableCell>
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              Product
              <IconButton size="small" onClick={() => handleSort("name")}>
                <SortIcon
                  fontSize="small"
                  color={sortField === "name" ? "primary" : "action"}
                />
              </IconButton>
            </Box>
          </TableCell>
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              Qty
              <IconButton size="small" onClick={() => handleSort("quantity")}>
                <SortIcon
                  fontSize="small"
                  color={sortField === "quantity" ? "primary" : "action"}
                />
              </IconButton>
            </Box>
          </TableCell>
          <TableCell>Actions</TableCell>
        </>
      );
    } else if (isMediumScreen) {
      return (
        <>
          <TableCell padding="checkbox">
            <Checkbox checked={selectAll} onChange={handleSelectAll} />
          </TableCell>
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              Product
              <IconButton size="small" onClick={() => handleSort("name")}>
                <SortIcon
                  fontSize="small"
                  color={sortField === "name" ? "primary" : "action"}
                />
              </IconButton>
            </Box>
          </TableCell>
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              SKU
              <IconButton size="small" onClick={() => handleSort("sku")}>
                <SortIcon
                  fontSize="small"
                  color={sortField === "sku" ? "primary" : "action"}
                />
              </IconButton>
            </Box>
          </TableCell>
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              Price
              <IconButton size="small" onClick={() => handleSort("price")}>
                <SortIcon
                  fontSize="small"
                  color={sortField === "price" ? "primary" : "action"}
                />
              </IconButton>
            </Box>
          </TableCell>
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              Qty
              <IconButton size="small" onClick={() => handleSort("quantity")}>
                <SortIcon
                  fontSize="small"
                  color={sortField === "quantity" ? "primary" : "action"}
                />
              </IconButton>
            </Box>
          </TableCell>
          <TableCell>Actions</TableCell>
        </>
      );
    } else {
      return (
        <>
          <TableCell padding="checkbox">
            <Checkbox checked={selectAll} onChange={handleSelectAll} />
          </TableCell>
          <TableCell>ID</TableCell>
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              Product
              <IconButton size="small" onClick={() => handleSort("name")}>
                <SortIcon
                  fontSize="small"
                  color={sortField === "name" ? "primary" : "action"}
                />
              </IconButton>
            </Box>
          </TableCell>
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              SKU
              <IconButton size="small" onClick={() => handleSort("sku")}>
                <SortIcon
                  fontSize="small"
                  color={sortField === "sku" ? "primary" : "action"}
                />
              </IconButton>
            </Box>
          </TableCell>
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              Location
              <IconButton size="small" onClick={() => handleSort("location")}>
                <SortIcon
                  fontSize="small"
                  color={sortField === "location" ? "primary" : "action"}
                />
              </IconButton>
            </Box>
          </TableCell>
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              Price
              <IconButton size="small" onClick={() => handleSort("price")}>
                <SortIcon
                  fontSize="small"
                  color={sortField === "price" ? "primary" : "action"}
                />
              </IconButton>
            </Box>
          </TableCell>
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              Quantity
              <IconButton size="small" onClick={() => handleSort("quantity")}>
                <SortIcon
                  fontSize="small"
                  color={sortField === "quantity" ? "primary" : "action"}
                />
              </IconButton>
            </Box>
          </TableCell>
          <TableCell>Actions</TableCell>
        </>
      );
    }
  };

  // Render table rows based on screen size
  const renderTableRow = (row: Product) => {
    if (isSmallScreen) {
      return (
        <>
          <TableCell padding="checkbox">
            <Checkbox
              checked={row.checked}
              onChange={() => handleSelectItem(row.id)}
            />
          </TableCell>
          <TableCell>
            <Typography variant="body2" fontWeight="medium">
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ${row.price.toFixed(2)}
            </Typography>
          </TableCell>
          <TableCell>
            <Chip
              label={row.quantity}
              color={
                row.quantity > 10
                  ? "success"
                  : row.quantity > 0
                  ? "warning"
                  : "error"
              }
              size="small"
            />
          </TableCell>
          <TableCell>
            <IconButton
              size="small"
              sx={{ color: "primary.main" }}
              onClick={() => handleEditClick(row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: "error.main" }}
              onClick={() => handleDelete(row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </TableCell>
        </>
      );
    } else if (isMediumScreen) {
      return (
        <>
          <TableCell padding="checkbox">
            <Checkbox
              checked={row.checked}
              onChange={() => handleSelectItem(row.id)}
            />
          </TableCell>
          <TableCell>{row.name}</TableCell>
          <TableCell>{row.sku || "—"}</TableCell>
          <TableCell>${row.price.toFixed(2)}</TableCell>
          <TableCell>
            <Chip
              label={row.quantity}
              color={
                row.quantity > 10
                  ? "success"
                  : row.quantity > 0
                  ? "warning"
                  : "error"
              }
              size="small"
            />
          </TableCell>
          <TableCell>
            <IconButton
              size="small"
              sx={{ color: "primary.main" }}
              onClick={() => handleEditClick(row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: "error.main" }}
              onClick={() => handleDelete(row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </TableCell>
        </>
      );
    } else {
      return (
        <>
          <TableCell padding="checkbox">
            <Checkbox
              checked={row.checked}
              onChange={() => handleSelectItem(row.id)}
            />
          </TableCell>
          <TableCell>{row.id}</TableCell>
          <TableCell>{row.name}</TableCell>
          <TableCell>{row.sku || "—"}</TableCell>
          <TableCell>{row.location || "—"}</TableCell>
          <TableCell>${row.price.toFixed(2)}</TableCell>
          <TableCell>
            <Chip
              label={row.quantity}
              color={
                row.quantity > 10
                  ? "success"
                  : row.quantity > 0
                  ? "warning"
                  : "error"
              }
              size="small"
            />
          </TableCell>
          <TableCell>
            <IconButton
              sx={{ color: "primary.main" }}
              onClick={() => handleEditClick(row)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              sx={{ color: "error.main" }}
              onClick={() => handleDelete(row.id)}
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
              Product Inventory
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your product inventory. Add, edit, and track your products.
            </Typography>
          </CardContent>
        </Card>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              error.includes("session has expired") ? (
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
            {error}
          </Alert>
        )}

        <Card elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
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
                onClick={() => {
                  // Initialize with empty values but proper types
                  setEditingProduct({
                    name: "",
                    sku: "",
                    location: "",
                    price: 0,
                    quantity: 1, // Default to 1 for quantity
                  });
                  setOpenModal(true);
                }}
                fullWidth={isSmallScreen}
                size={isSmallScreen ? "small" : "medium"}
              >
                Add Product
              </Button>
            </Box>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card elevation={0} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <LinearProgress />
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">
                  Loading products...
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
                  {sortedAndFilteredData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={isSmallScreen ? 4 : isMediumScreen ? 6 : 8}
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
                          <InventoryIcon
                            sx={{
                              fontSize: isSmallScreen ? 40 : 60,
                              color: "text.secondary",
                            }}
                          />
                          <Typography
                            variant={isSmallScreen ? "h6" : "h5"}
                            color="text.secondary"
                          >
                            No products found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchTerm
                              ? "Try adjusting your search"
                              : "Click 'Add Product' to create your first product"}
                          </Typography>
                          {searchTerm && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => setSearchTerm("")}
                              sx={{ mt: 1 }}
                            >
                              Clear Search
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedAndFilteredData.map((row) => (
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

        <Modal
          open={openModal}
          onClose={() => !isLoading && setOpenModal(false)}
        >
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
              {editingProduct?.id ? "Edit Product" : "Add Product"}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
                {error}
              </Alert>
            )}

            {/* Product Name */}
            <TextField
              fullWidth
              label="Product Name"
              type="text"
              value={editingProduct?.name || ""}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  name: e.target.value,
                })
              }
              margin="normal"
              required
              error={!editingProduct?.name}
              helperText={
                !editingProduct?.name ? "Product name is required" : ""
              }
              sx={{ mb: 2 }}
            />

            {/* SKU */}
            <TextField
              fullWidth
              label="SKU"
              type="text"
              value={editingProduct?.sku || ""}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  sku: e.target.value,
                })
              }
              margin="normal"
              sx={{ mb: 2 }}
            />

            {/* Location */}
            <TextField
              fullWidth
              label="Location"
              type="text"
              value={editingProduct?.location || ""}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  location: e.target.value,
                })
              }
              margin="normal"
              sx={{ mb: 2 }}
            />

            {/* Price */}
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={editingProduct?.price || 0}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  price: Number(e.target.value),
                })
              }
              margin="normal"
              InputProps={{
                inputProps: { min: 0, step: 0.01 },
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* Quantity */}
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={editingProduct?.quantity || 1}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  quantity: Number(e.target.value),
                })
              }
              margin="normal"
              required
              error={
                !editingProduct?.quantity ||
                editingProduct.quantity <= 0 ||
                !Number.isInteger(Number(editingProduct.quantity))
              }
              helperText={
                !editingProduct?.quantity ||
                editingProduct.quantity <= 0 ||
                !Number.isInteger(Number(editingProduct.quantity))
                  ? "Quantity must be a positive integer"
                  : ""
              }
              InputProps={{ inputProps: { min: 1, step: 1 } }}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setOpenModal(false)}
                disabled={isLoading}
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
                disabled={isLoading}
                size={isSmallScreen ? "small" : "medium"}
              >
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
    </div>
  );
}
