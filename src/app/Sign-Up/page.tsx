"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const API_URL = "https://backend-eoq-production.up.railway.app";

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      setError("Username hanya boleh berisi huruf, angka, dan underscore (_).");
      setLoading(false);
      return;
    }

    const emailRegex = /^[\w-]+@[\w-]+\.[a-z]{2,}$/;
    const phoneRegex = /^\d{10,15}$/;
    if (!emailRegex.test(formData.email) && !phoneRegex.test(formData.email)) {
      setError("Masukkan email atau nomor telepon yang valid.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password harus minimal 6 karakter.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Sign Up failed!");
      }

      alert("Account created successfully! You can now log in.");
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col h-screen items-center justify-center relative bg-cover bg-center"
      style={{ backgroundImage: "url('/Image/SIGN UP.png')" }}
    >
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="w-full h-full bg-black opacity-60"></div>
      </div>
      <div className="relative bg-white shadow-2xl rounded-lg p-8 w-[400px] text-black">
        <h2 className="text-center text-2xl font-semibold mb-6">
          CREATE ACCOUNT
        </h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <form className="space-y-4" onSubmit={handleSignUp}>
          <div>
            <label className="text-sm font-semibold">USERNAME:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border-b border-black py-2 focus:outline-none text-black"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold">EMAIL/TELEPON:</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border-b border-black py-2 focus:outline-none text-black"
              required
            />
          </div>
          <div className="relative">
            <label className="text-sm font-semibold">PASSWORD:</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border-b border-black py-2 focus:outline-none text-black pr-10"
              required
            />
            <button
              type="button"
              className="absolute right-2 top-8 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>
          <div className="relative">
            <label className="text-sm font-semibold">CONFIRM PASSWORD:</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border-b border-black py-2 focus:outline-none text-black pr-10"
              required
            />
            <button
              type="button"
              className="absolute right-2 top-8 text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <FaEyeSlash size={20} />
              ) : (
                <FaEye size={20} />
              )}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "SIGN UP"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link href="/" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
