"use client";

import { useState, useEffect } from "react";
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
import { FaTrash } from "react-icons/fa"; // ✅ Import ikon tempat sampah
import axios from "axios";
import LeftSidebar from "../components/LeftSidebar";

interface Product {
  id: number;
  product: string;
  sku: string;
  location: string;
  price: number;
  stock: number;
  checked?: boolean;
}

export default function ProductPage() {
  const [data, setData] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(
    null
  );
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Ambil data dari backend
  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/products");
      setData(
        response.data.map((item: Product) => ({ ...item, checked: false }))
      );
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return; // Jika pengguna membatalkan, hentikan proses
    }

    try {
      await axios.delete(`/api/products/${id}`);
      fetchProducts(); // Refresh tabel setelah delete
    } catch (error) {
      console.error("Error deleting product:", error);
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
      if (editingProduct?.id) {
        await axios.put(`/api/products/${editingProduct.id}`, editingProduct);
      } else {
        await axios.post("/api/products", editingProduct);
      }
      setOpenModal(false);
      fetchProducts(); // Refresh data setelah perubahan
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setOpenModal(true);
  };

  const filteredData = data.filter((row) =>
    row.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                setEditingProduct(null);
                setOpenModal(true);
              }}
            >
              Add Item
            </Button>
          </div>
        </Paper>

        {/* TABEL PRODUK */}
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
                <TableCell>Stock</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Checkbox
                      checked={row.checked}
                      onChange={() => handleSelectItem(row.id)}
                    />
                  </TableCell>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.product}</TableCell>
                  <TableCell>{row.sku}</TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>{row.price}</TableCell>
                  <TableCell>{row.stock}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* MODAL ADD/EDIT ITEM */}
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
            }}
          >
            <h2
              style={{
                textAlign: "center",
                color: "black",
                fontWeight: "bold",
              }}
            >
              {editingProduct?.id ? "Edit Item" : "Add Item"}
            </h2>
            {["product", "sku", "location", "price", "stock"].map((field) => (
              <TextField
                key={field}
                fullWidth
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                type={
                  field === "price" || field === "stock" ? "number" : "text"
                }
                value={editingProduct?.[field as keyof Product] || ""}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    [field]: e.target.value,
                  })
                }
                margin="dense"
              />
            ))}
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
