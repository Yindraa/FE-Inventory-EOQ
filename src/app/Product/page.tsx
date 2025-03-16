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
import axios from "axios";
import LeftSidebar from "../components/LeftSidebar";

interface Product {
  id: number;
  product: string;
  sku: string;
  location: string;
  price: number;
  stock: number;
  checked?: boolean; // Tambahkan properti checked untuk checkbox
}

export default function ProductPage() {
  const [data, setData] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    id: 0,
    product: "",
    sku: "",
    location: "",
    price: 0,
    stock: 0,
  });

  const [selectAll, setSelectAll] = useState(false); // State untuk checkbox header

  useEffect(() => {
    axios
      .get("/api/products")
      .then((response) => {
        setData(
          response.data.map((item: Product) => ({ ...item, checked: false }))
        );
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Fungsi untuk memilih semua checkbox
  const handleSelectAll = () => {
    const newCheckedStatus = !selectAll;
    setSelectAll(newCheckedStatus);
    setData((prevData) =>
      prevData.map((item) => ({ ...item, checked: newCheckedStatus }))
    );
  };

  // Fungsi untuk memilih checkbox individu
  const handleSelectItem = (id: number) => {
    const updatedData = data.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );

    // Periksa apakah semua item dicentang
    const allChecked = updatedData.every((item) => item.checked);
    setSelectAll(allChecked);

    setData(updatedData);
  };

  const handleAddItem = () => {
    if (!newProduct.product || !newProduct.sku) return;
    setData((prevData) => [
      ...prevData,
      { ...newProduct, id: prevData.length + 1, checked: false } as Product,
    ]);
    setNewProduct({
      id: 0,
      product: "",
      sku: "",
      location: "",
      price: 0,
      stock: 0,
    });
    setOpenModal(false);
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
              onClick={() => setOpenModal(true)}
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
                    <IconButton sx={{ color: "black" }}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* MODAL ADD ITEM */}
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
              Add Item
            </h2>
            <TextField
              fullWidth
              label="Product"
              value={newProduct.product}
              onChange={(e) =>
                setNewProduct({ ...newProduct, product: e.target.value })
              }
              margin="dense"
            />
            <TextField
              fullWidth
              label="SKU"
              value={newProduct.sku}
              onChange={(e) =>
                setNewProduct({ ...newProduct, sku: e.target.value })
              }
              margin="dense"
            />
            <TextField
              fullWidth
              label="Location"
              value={newProduct.location}
              onChange={(e) =>
                setNewProduct({ ...newProduct, location: e.target.value })
              }
              margin="dense"
            />
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: Number(e.target.value) })
              }
              margin="dense"
            />
            <TextField
              fullWidth
              label="Stock"
              type="number"
              value={newProduct.stock}
              onChange={(e) =>
                setNewProduct({ ...newProduct, stock: Number(e.target.value) })
              }
              margin="dense"
            />
            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                backgroundColor: "black",
                color: "white",
                "&:hover": { backgroundColor: "#333" },
              }}
              onClick={handleAddItem}
            >
              SAVE
            </Button>
          </Box>
        </Modal>
      </div>
    </div>
  );
}
