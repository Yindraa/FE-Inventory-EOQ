"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Card,
  CardContent,
  Alert,
  InputAdornment,
  IconButton,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function LoginPage() {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Use environment variable for base URL
  const API_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://backend-eoq-production.up.railway.app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window === "undefined") return;

    const savedEmail = localStorage.getItem("rememberedEmail") || "";
    setEmail(savedEmail);
    setRememberMe(!!savedEmail);

    const checkSession = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/session`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          router.push("/Dashboard");
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };

    checkSession();
  }, [router, API_URL]);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      if (!email.trim() || !password.trim()) {
        setError("Email and password cannot be empty.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Login failed!");
        }

        const data = await response.json();
        console.log("Login API Response JSON:", data);

        if (data.token) {
          localStorage.setItem("token", data.token);
          console.log("Received token:", data.token);
        } else {
          console.warn("No token received from login response.");
        }

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        router.push("/Dashboard");
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    },
    [email, password, rememberMe, router, API_URL]
  );

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  if (!isClient) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "url('/Image/LOGIN PAGE.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        padding: isSmallScreen ? 2 : 4,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Image
            src="/Image/EOQ TRACK LOGO 1.png"
            alt="EOQ Logo"
            width={96}
            height={96}
            priority
          />
        </Box>

        <Card
          sx={{
            maxWidth: isSmallScreen ? "100%" : 400,
            width: "100%",
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            overflow: "visible",
          }}
        >
          <CardContent sx={{ p: isSmallScreen ? 3 : 4 }}>
            <Typography
              variant="h5"
              component="h1"
              align="center"
              fontWeight="bold"
              gutterBottom
            >
              USER LOGIN
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    color="primary"
                  />
                }
                label="Remember me"
                sx={{ mb: 2 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.5,
                  bgcolor: "#292929",
                  color: "white",
                  "&:hover": { bgcolor: "#444" },
                  borderRadius: "8px",
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Login"
                )}
              </Button>

              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Don't have an account?{" "}
                <Link
                  href="/Sign-Up"
                  style={{ color: "#1976d2", textDecoration: "none" }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
