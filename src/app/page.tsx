"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { IconType } from "react-icons";
import { FaEnvelope, FaLock } from "react-icons/fa";
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
  const API_URL = "https://backend-eoq-production.up.railway.app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window === "undefined") return;

    const savedEmail = localStorage.getItem("rememberedEmail") || "";
    setEmail(savedEmail);
    setRememberMe(!!savedEmail);

    // Check if user is already logged in with session
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/session`, {
          method: "GET",
          credentials: "include", // Ensure cookies are sent
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
          credentials: "include", // Use cookies from backend
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Login failed!");
        }

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
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
    [email, password, rememberMe, router, API_URL]
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

      <div className="bg-white shadow-2xl rounded-lg p-8 w-[400px] text-black mt-20">
        <h2 className="text-center text-2xl font-semibold mb-6">USER LOGIN</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form className="space-y-4" onSubmit={handleLogin}>
          <InputField
            type="email"
            placeholder="Email"
            Icon={FaEnvelope}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
