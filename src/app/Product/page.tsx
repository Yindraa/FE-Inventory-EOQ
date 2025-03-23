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
  Checkbox,
  Button,
  Modal,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { FaTrash } from "react-icons/fa";
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get<ApiProduct[]>(
        "https://backend-eoq-production.up.railway.app/product",
        { withCredentials: true }
      );

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
          router.push("/login");
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
      await axios.delete(
        `https://backend-eoq-production.up.railway.app/product/${id}`,
        { withCredentials: true }
      );
      fetchProducts();
    } catch (error: unknown) {
      console.error("Error deleting product:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
          router.push("/login");
        } else {
          setError(error.response?.data?.message || "Failed to delete product");
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
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
      if (!editingProduct.name) {
        setError("Product name is required.");
        return;
      }

      if (
        isNaN(Number(editingProduct.price)) ||
        isNaN(Number(editingProduct.quantity))
      ) {
        setError("Price and quantity must be valid numbers.");
        return;
      }

      if (
        Number(editingProduct.quantity) <= 0 ||
        !Number.isInteger(Number(editingProduct.quantity))
      ) {
        setError("Quantity must be a positive integer.");
        return;
      }

      const productData = {
        name: editingProduct.name,
        sku: editingProduct.sku,
        location: editingProduct.location,
        price: Number(editingProduct.price),
        quantity: Number(editingProduct.quantity),
      };

      if (editingProduct.id) {
        await axios.put(
          `https://backend-eoq-production.up.railway.app/product/${editingProduct.id}`,
          productData,
          { withCredentials: true }
        );
      } else {
        await axios.post(
          "https://backend-eoq-production.up.railway.app/product",
          productData,
          { withCredentials: true }
        );
      }

      setOpenModal(false);
      setError(null);
      fetchProducts();
    } catch (error: unknown) {
      console.error("Error saving product:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
          router.push("/login");
        } else {
          setError(
            error.response?.data?.message ||
              `Failed to save product. Server returned status ${error.response?.status}`
          );
        }
      } else {
        setError("Failed to save product. Please check your connection.");
      }
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setOpenModal(true);
  };

  const filteredData = data.filter((row) =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isMounted) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <div style={{ width: "256px", backgroundColor: "black" }}></div>
        <div style={{ flex: 1, padding: "20px" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div
      style={{ display: "flex", backgroundColor: "white", minHeight: "100vh" }}
    >
      <LeftSidebar />
      <div
        style={{
          flex: 1,
          padding: "20px",
          minHeight: "100vh",
          overflow: "auto",
        }}
      >
        <h2
          style={{
            marginBottom: "15px",
            fontSize: "26px",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          List Product
        </h2>

        {error && (
          <Paper
            sx={{
              padding: "10px",
              marginBottom: "10px",
              backgroundColor: "#ffebee",
              color: "#d32f2f",
            }}
          >
            {error}
            {error.includes("session has expired") && (
              <Button
                variant="text"
                color="error"
                onClick={() => router.push("/login")}
                sx={{ ml: 2 }}
              >
                Go to Login
              </Button>
            )}
          </Paper>
        )}

        <Paper
          sx={{
            padding: "10px",
            marginBottom: "10px",
            backgroundColor: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon style={{ marginRight: "5px" }} />,
              }}
              sx={{ width: "300px" }}
            />
            <Button
              variant="contained"
              sx={{ bgcolor: "#292929", color: "white" }}
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
            >
              Add Item
            </Button>
          </div>
        </Paper>

        {/* PRODUCT TABLE */}
        {isLoading ? (
          <Paper sx={{ p: 3, textAlign: "center" }}>Loading products...</Paper>
        ) : (
          <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>
                    <Checkbox checked={selectAll} onChange={handleSelectAll} />
                  </TableCell>
                  <TableCell>No ID</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Checkbox
                          checked={row.checked}
                          onChange={() => handleSelectItem(row.id)}
                        />
                      </TableCell>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.sku}</TableCell>
                      <TableCell>{row.location}</TableCell>
                      <TableCell>{row.price}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell>
                        <IconButton
                          sx={{ color: "black" }}
                          onClick={() => handleEditClick(row)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          sx={{ color: "red" }}
                          onClick={() => handleDelete(row.id)}
                        >
                          <FaTrash />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* ADD/EDIT ITEM MODAL */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "white",
              boxShadow: 24,
              p: 4,
              borderRadius: 1,
            }}
          >
            <h2
              style={{
                textAlign: "center",
                color: "black",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              {editingProduct?.id ? "Edit Item" : "Add Item"}
            </h2>

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
              margin="dense"
              required
              error={!editingProduct?.name}
              helperText={
                !editingProduct?.name ? "Product name is required" : ""
              }
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
              margin="dense"
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
              margin="dense"
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
              margin="dense"
              InputProps={{ inputProps: { min: 0 } }}
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
              margin="dense"
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
            />

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2, bgcolor: "black", color: "white" }}
              onClick={handleAddOrEdit}
            >
              SAVE
            </Button>
          </Box>
        </Modal>
      </div>
    </div>
  );
}
