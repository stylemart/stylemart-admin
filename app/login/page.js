// ============================================================
// ADMIN LOGIN PAGE
// Super Admin / Sub Admin login
// Sub Admin can also register with an admin invitation code
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiUser, FiLock, FiKey, FiArrowLeft } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle login form submission
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Save token and admin info to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  // Handle sub-admin registration
  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register-sub-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_code: adminCode,
          username,
          password,
          full_name: fullName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Save token and admin info
      localStorage.setItem("token", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white">StyleMart</h1>
          <p className="text-slate-400 text-sm mt-1">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {mode === "login" ? (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Welcome Back</h2>
              <p className="text-sm text-gray-500 mb-6">Sign in to your admin account</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold text-base transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500 mb-2">Have an admin invitation code?</p>
                <button
                  onClick={() => { setMode("register"); setError(""); }}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold"
                >
                  Register as Sub Admin →
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
              >
                <FiArrowLeft size={16} /> Back to Login
              </button>

              <h2 className="text-xl font-bold text-gray-800 mb-1">Sub Admin Registration</h2>
              <p className="text-sm text-gray-500 mb-6">Enter the admin code given by Super Admin</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Invitation Code *</label>
                  <div className="relative">
                    <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value.toUpperCase())}
                      placeholder="ADM-XXXXXX"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm uppercase tracking-wider"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name (optional)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password (min 6 chars)"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold text-base transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Registering...
                    </span>
                  ) : (
                    "Register as Sub Admin"
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          © 2026 StyleMart. All rights reserved.
        </p>
      </div>
    </div>
  );
}
