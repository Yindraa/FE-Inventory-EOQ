"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IconType } from "react-icons";
import { FaUser, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

interface InputProps {
  type: string;
  placeholder: string;
  Icon: IconType;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField = ({
  type,
  placeholder,
  Icon,
  value,
  onChange,
}: InputProps) => {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-3 text-black" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-black"
      />
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const API_URL = "https://api.example.com"; // Ganti dengan URL backend

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [emailReset, setEmailReset] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== "undefined") {
      const savedUsername = localStorage.getItem("rememberedUsername");
      const token = localStorage.getItem("token");
      if (savedUsername) {
        setUsername(savedUsername);
        setRememberMe(true);
      }
      if (token) {
        router.push("/dashboard");
      }
    }
  }, [router]);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Login failed!");

        if (typeof window !== "undefined") {
          localStorage.setItem("token", data.token);
          if (rememberMe) {
            localStorage.setItem("rememberedUsername", username);
          } else {
            localStorage.removeItem("rememberedUsername");
          }
        }

        alert("Login successful!");
        router.push("/dashboard");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [username, password, rememberMe, router]
  );

  const handleForgotPassword = async () => {
    if (!emailReset) {
      setError("Please enter your email.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailReset }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Reset failed!");

      alert("Reset link sent to your email.");
      setForgotPassword(false);
      setEmailReset("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div
      className="flex flex-col h-screen items-center justify-center bg-cover bg-center"
      style={isClient ? { backgroundImage: "url('/background.jpg')" } : {}}
    >
      {isClient && <img src="/logo.png" alt="EOQ Logo" className="w-24 mb-4" />}

      <div className="bg-white shadow-2xl rounded-lg p-8 w-[400px] text-black">
        <h2 className="text-center text-2xl font-semibold mb-6">
          {forgotPassword ? "RESET PASSWORD" : "USER LOGIN"}
        </h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {forgotPassword ? (
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <InputField
              type="email"
              placeholder="Enter your email"
              Icon={FaUser}
              value={emailReset}
              onChange={(e) => setEmailReset(e.target.value)}
            />
            <button
              onClick={handleForgotPassword}
              className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700"
            >
              Send Reset Link
            </button>
            <button
              type="button"
              className="w-full text-sm text-gray-600 hover:underline"
              onClick={() => setForgotPassword(false)}
            >
              Back to Login
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleLogin}>
            <InputField
              type="text"
              placeholder="Username"
              Icon={FaUser}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <InputField
              type="password"
              placeholder="Password"
              Icon={FaLock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="accent-gray-600"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="hover:underline text-blue-500"
                onClick={() => setForgotPassword(true)}
              >
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="flex items-center justify-center my-2">
              <div className="border-t w-1/4"></div>
              <span className="mx-2 text-sm text-gray-600">OR</span>
              <div className="border-t w-1/4"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center border py-2 rounded-lg hover:bg-gray-100"
            >
              <FcGoogle className="mr-2 text-xl" />
              Continue with Google
            </button>
          </form>
        )}

        {/* Tambahkan "Don't have an account?" */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <button
            onClick={() => router.push("/Sign-Up")}
            className="text-blue-500 hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
