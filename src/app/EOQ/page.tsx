"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  Grid,
  Divider,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  InputAdornment,
  Tooltip,
  IconButton,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CalculateIcon from "@mui/icons-material/Calculate";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LeftSidebar from "../components/LeftSidebar";

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  tooltip: string;
  unit?: string;
}

const EOQCalculator = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [demand, setDemand] = useState("");
  const [orderingCost, setOrderingCost] = useState("");
  const [holdingCost, setHoldingCost] = useState("");
  const [eoq, setEoq] = useState<number | null>(null);
  const [reorderPoint, setReorderPoint] = useState<number | null>(null);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [leadTime, setLeadTime] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Function to calculate EOQ
  const calculateEOQ = () => {
    if (!demand || !orderingCost || !holdingCost) return;

    const D = Number.parseFloat(demand.replace(/\./g, "").replace(/,/g, "."));
    const S = Number.parseFloat(
      orderingCost.replace(/\./g, "").replace(/,/g, ".")
    );
    const H = Number.parseFloat(
      holdingCost.replace(/\./g, "").replace(/,/g, ".")
    );
    const L = leadTime
      ? Number.parseFloat(leadTime.replace(/\./g, "").replace(/,/g, "."))
      : 0;

    if (isNaN(D) || isNaN(S) || isNaN(H) || H === 0) return; // Validate input

    // Calculate EOQ using the standard formula: sqrt((2 * D * S) / H)
    const result = Math.sqrt((2 * D * S) / H);
    setEoq(Number(result.toFixed(2)));

    // Calculate Total Annual Cost: (D/Q)*S + (Q/2)*H
    const totalAnnualCost = (D / result) * S + (result / 2) * H;
    setTotalCost(Number(totalAnnualCost.toFixed(2)));

    // Calculate Reorder Point if lead time is provided: D * L
    if (L > 0) {
      const rop = D * (L / 365); // Assuming D is annual and L is in days
      setReorderPoint(Number(rop.toFixed(2)));
    } else {
      setReorderPoint(null);
    }
  };

  // Function to handle Enter key
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      calculateEOQ(); // Run calculation when Enter is pressed
    }
  };

  // Input field component with tooltip
  const InputField: React.FC<InputFieldProps> = ({
    label,
    value,
    onChange,
    onKeyDown,
    tooltip,
    unit,
  }) => {
    return (
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Typography
            variant="subtitle1"
            fontWeight="medium"
            display="flex"
            alignItems="center"
          >
            {label}
            <Tooltip title={tooltip}>
              <IconButton size="small" sx={{ ml: 0.5 }}>
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            variant="outlined"
            size="small"
            InputProps={{
              endAdornment: unit && (
                <InputAdornment position="end">{unit}</InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />
        </Grid>
      </Grid>
    );
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
      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          mb={4}
          color="text.primary"
        >
          Economic Order Quantity (EOQ) Calculator
        </Typography>

        <Grid container spacing={3}>
          {/* Input Section */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: "100%" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  mb={3}
                  color="text.primary"
                >
                  Input Parameters
                </Typography>

                <InputField
                  label="Annual Demand (D)"
                  value={demand}
                  onChange={(e) => setDemand(e.target.value)}
                  onKeyDown={handleKeyDown}
                  tooltip="The total quantity of items required per year"
                  unit="units/year"
                />

                <InputField
                  label="Ordering Cost (S)"
                  value={orderingCost}
                  onChange={(e) => setOrderingCost(e.target.value)}
                  onKeyDown={handleKeyDown}
                  tooltip="The cost incurred each time an order is placed"
                  unit="$"
                />

                <InputField
                  label="Holding Cost (H)"
                  value={holdingCost}
                  onChange={(e) => setHoldingCost(e.target.value)}
                  onKeyDown={handleKeyDown}
                  tooltip="The cost to hold one unit in inventory for one year"
                  unit="$/unit/year"
                />

                <InputField
                  label="Lead Time (optional)"
                  value={leadTime}
                  onChange={(e) => setLeadTime(e.target.value)}
                  onKeyDown={handleKeyDown}
                  tooltip="The time between placing an order and receiving it (in days)"
                  unit="days"
                />

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 3,
                    py: 1.5,
                    bgcolor: "#292929",
                    color: "white",
                    "&:hover": { bgcolor: "#444" },
                    borderRadius: "8px",
                  }}
                  onClick={calculateEOQ}
                  startIcon={<CalculateIcon />}
                >
                  Calculate
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Results Section */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: "100%" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  mb={3}
                  color="text.primary"
                >
                  Results
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="medium"
                    gutterBottom
                  >
                    Economic Order Quantity (EOQ)
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: "#f8f9fa",
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      textAlign="center"
                      color={eoq ? "text.primary" : "text.disabled"}
                    >
                      {eoq !== null ? eoq.toLocaleString() : "—"}{" "}
                      <small>{eoq !== null ? "units" : ""}</small>
                    </Typography>
                  </Paper>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="medium"
                    gutterBottom
                  >
                    Total Annual Cost
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: "#f8f9fa",
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      textAlign="center"
                      color={totalCost ? "text.primary" : "text.disabled"}
                    >
                      {totalCost !== null
                        ? `$${totalCost.toLocaleString()}`
                        : "—"}
                    </Typography>
                  </Paper>
                </Box>

                {leadTime && (
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight="medium"
                      gutterBottom
                    >
                      Reorder Point
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        textAlign="center"
                        color={reorderPoint ? "text.primary" : "text.disabled"}
                      >
                        {reorderPoint !== null
                          ? reorderPoint.toLocaleString()
                          : "—"}{" "}
                        <small>{reorderPoint !== null ? "units" : ""}</small>
                      </Typography>
                    </Paper>
                  </Box>
                )}

                <Box sx={{ mt: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: "#e8f4fd",
                      borderRadius: "8px",
                      border: "1px solid #b3e0ff",
                    }}
                  >
                    <Typography
                      variant="body2"
                      display="flex"
                      alignItems="center"
                    >
                      <InfoIcon
                        sx={{ mr: 1, color: "primary.main" }}
                        fontSize="small"
                      />
                      The EOQ formula minimizes the total inventory costs by
                      balancing ordering and holding costs.
                    </Typography>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default EOQCalculator;
