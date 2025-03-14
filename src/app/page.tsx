"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IconType } from "react-icons";
import { FaUser, FaLock } from "react-icons/fa";
import Image from "next/image";

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
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (typeof window === "undefined") return;

    const savedUsername = localStorage.getItem("rememberedUsername") || "";
    const token = localStorage.getItem("token");

    setUsername(savedUsername);
    setRememberMe(!!savedUsername);

    if (token) router.push("/Dashboard");
  }, [router]);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      if (!username.trim() || !password.trim()) {
        setError("Username and password cannot be empty.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Login failed!");
        }

        const data = await response.json();

        if (typeof window !== "undefined") {
          localStorage.setItem("token", data.token);
          if (rememberMe) {
            localStorage.setItem("rememberedUsername", username);
          } else {
            localStorage.removeItem("rememberedUsername");
          }
        }

        alert("Login successful!");
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
    [username, password, rememberMe, router]
  );

  return (
    <div
      className="relative flex flex-col h-screen items-center justify-center bg-cover bg-center"
      style={
        isClient ? { backgroundImage: "url('/Image/LOGIN PAGE.png')" } : {}
      }
    >
      {isClient && (
        <div className="absolute top-[8%]">
          <Image
            src="/Image/EOQ TRACK LOGO 1.png"
            alt="EOQ Logo"
            width={96}
            height={96}
            priority
          />
        </div>
      )}

      {/* Container Login */}
      <div className="bg-white shadow-2xl rounded-lg p-8 w-[400px] text-black mt-20">
        <h2 className="text-center text-2xl font-semibold mb-6">USER LOGIN</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* Form Login */}
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
          </div>
          <button
            type="submit"
            className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Sign Up Text */}
        <p className="text-center text-sm text-gray-600 mt-4">
          {"Don't have an account?"}{" "}
          <a href="/Sign-Up" className="text-blue-500 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
