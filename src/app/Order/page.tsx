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
  Button,
  Modal,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import LeftSidebar from "../components/LeftSidebar";

interface Order {
  id: number;
  date: string;
  product: string;
  customer: string;
  totalPrice: number;
  status: string;
}

export default function OrderPage() {
  const [data, setData] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Partial<Order> | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Ambil data order dari backend
  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/orders");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleAddOrEdit = async () => {
    try {
      if (editingOrder?.id) {
        // Edit order
        await axios.put(`/api/orders/${editingOrder.id}`, editingOrder);
      } else {
        // Tambah order baru
        await axios.post("/api/orders", editingOrder);
      }
      setOpenModal(false);
      fetchOrders(); // Refresh data setelah perubahan
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  const handleEditClick = (order: Order) => {
    setEditingOrder(order);
    setOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/orders/${id}`);
      fetchOrders(); // Refresh data setelah menghapus
    } catch (error) {
      console.error("Error deleting order:", error);
    }
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
          Order History
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
                setEditingOrder({
                  date: "",
                  product: "",
                  customer: "",
                  totalPrice: 0,
                  status: "",
                });
                setOpenModal(true);
              }}
            >
              Add Order
            </Button>
          </div>
        </Paper>

        {/* TABEL ORDER */}
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Total Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.product}</TableCell>
                  <TableCell>{row.customer}</TableCell>
                  <TableCell>{row.totalPrice}</TableCell>
                  <TableCell>{row.status}</TableCell>
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
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* MODAL ADD/EDIT ORDER */}
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
              {editingOrder?.id ? "Edit Order" : "Add Order"}
            </h2>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={editingOrder?.date || ""}
              onChange={(e) =>
                setEditingOrder({ ...editingOrder, date: e.target.value })
              }
              margin="dense"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Product"
              value={editingOrder?.product || ""}
              onChange={(e) =>
                setEditingOrder({ ...editingOrder, product: e.target.value })
              }
              margin="dense"
            />
            <TextField
              fullWidth
              label="Customer"
              value={editingOrder?.customer || ""}
              onChange={(e) =>
                setEditingOrder({ ...editingOrder, customer: e.target.value })
              }
              margin="dense"
            />
            <TextField
              fullWidth
              label="Total Price"
              type="number"
              value={editingOrder?.totalPrice || ""}
              onChange={(e) =>
                setEditingOrder({
                  ...editingOrder,
                  totalPrice: +e.target.value,
                })
              }
              margin="dense"
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Status</InputLabel>
              <Select
                value={editingOrder?.status || ""}
                onChange={(e) =>
                  setEditingOrder({ ...editingOrder, status: e.target.value })
                }
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Processing">Processing</MenuItem>
                <MenuItem value="Shipped">Shipped</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
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
