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

interface Shipping {
  id: number;
  orderId?: number;
  courier: string;
  tracking: string;
  customer: string;
  totalPrice: number;
  status: string;
  estimated: string;
}

export default function ShippingPage() {
  const [data, setData] = useState<Shipping[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingShipping, setEditingShipping] =
    useState<Partial<Shipping> | null>(null);

  useEffect(() => {
    fetchShippingData();
  }, []);

  const fetchShippingData = async () => {
    try {
      const response = await axios.get("/api/shipping");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching shipping data:", error);
    }
  };

  const handleAddOrEdit = async () => {
    try {
      if (editingShipping?.id) {
        // Edit Data (PUT request)
        await axios.put(`/api/shipping/${editingShipping.id}`, editingShipping);
      } else {
        // Tambah Data Baru (POST request tanpa orderId, karena backend yang buat)
        const { ...shippingData } = editingShipping!;

        await axios.post("/api/shipping", shippingData);
      }
      setOpenModal(false);
      fetchShippingData();
    } catch (error) {
      console.error("Error saving shipping data:", error);
    }
  };

  const handleEditClick = (shipping: Shipping) => {
    setEditingShipping(shipping);
    setOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/shipping/${id}`);
      fetchShippingData();
    } catch (error) {
      console.error("Error deleting shipping data:", error);
    }
  };

  const filteredData = data.filter((row) =>
    row.courier.toLowerCase().includes(searchTerm.toLowerCase())
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
          Shipping Details
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
                setEditingShipping({
                  courier: "",
                  tracking: "",
                  customer: "",
                  totalPrice: 0,
                  status: "",
                  estimated: "",
                });
                setOpenModal(true);
              }}
            >
              Add Shipping
            </Button>
          </div>
        </Paper>

        {/* TABEL SHIPPING */}
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Order ID</TableCell>
                <TableCell>Courier</TableCell>
                <TableCell>Tracking</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Total Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Estimated</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.orderId || "-"}</TableCell>
                  <TableCell>{row.courier}</TableCell>
                  <TableCell>{row.tracking}</TableCell>
                  <TableCell>{row.customer}</TableCell>
                  <TableCell>{row.totalPrice}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.estimated}</TableCell>
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

        {/* MODAL ADD/EDIT SHIPPING */}
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
              {editingShipping?.id ? "Edit Shipping" : "Add Shipping"}
            </h2>

            {/* Order ID hanya muncul saat edit */}
            {editingShipping?.id && (
              <TextField
                fullWidth
                label="Order ID"
                value={editingShipping?.orderId}
                margin="dense"
                disabled
              />
            )}

            <FormControl fullWidth margin="dense">
              <InputLabel>Courier</InputLabel>
              <Select
                value={editingShipping?.courier || ""}
                onChange={(e) =>
                  setEditingShipping({
                    ...editingShipping,
                    courier: e.target.value,
                  })
                }
              >
                <MenuItem value="JNE">JNE</MenuItem>
                <MenuItem value="J&T Express">J&T Express</MenuItem>
                <MenuItem value="SiCepat">SiCepat</MenuItem>
                <MenuItem value="DHL">DHL</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Tracking"
              value={editingShipping?.tracking || ""}
              margin="dense"
            />
            <TextField
              fullWidth
              label="Customer"
              value={editingShipping?.customer || ""}
              margin="dense"
            />
            <TextField
              fullWidth
              label="Total Price"
              type="number"
              value={editingShipping?.totalPrice || ""}
              margin="dense"
            />
            <TextField
              fullWidth
              label="Status"
              value={editingShipping?.status || ""}
              margin="dense"
            />
            <TextField
              fullWidth
              label="Estimated"
              type="date"
              value={editingShipping?.estimated || ""}
              onChange={(e) =>
                setEditingShipping({
                  ...editingShipping,
                  estimated: e.target.value,
                })
              }
              margin="dense"
              InputLabelProps={{
                shrink: true,
              }}
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
