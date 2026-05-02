import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineUser, HiOutlineLockClosed } from "react-icons/hi2";

const roles = ["Admin", "Doctor", "Nurse"];

const roleRoutes: Record<string, string> = {
  Admin: "/admin/dashboard",
  Doctor: "/doctor/dashboard",
  Nurse: "/nurse/dashboard",
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [roleOpen, setRoleOpen] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !role) {
      setError("Please fill all fields and select a role.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid credentials.");
        setIsLoading(false);
        return;
      }

      // Save token and user info so protected routes can use them
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      // Navigate to the correct dashboard based on the server-verified role
      const route = roleRoutes[data.data.user.role];
      if (route) {
        navigate(route);
      }
    } catch {
      setError("Server connection failed. Make sure the backend is running.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col">
      {/* Main area */}
      <div className="flex-1 flex items-center justify-center bg-[#d6e8ee] px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm px-6 sm:px-8 py-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-[#1a5276] rounded-xl flex items-center justify-center mb-3">
              <span className="text-white text-xl font-bold">W+</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">WardLog</h1>
            <p className="text-gray-500 text-sm mt-1">
              Sign in to access your portal
            </p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:border-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:border-transparent"
                />
              </div>
            </div>

            {/* Role Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleOpen(!roleOpen)}
                className="w-full py-2.5 bg-[#1a5276] hover:bg-[#154360] text-white text-sm font-medium
                           rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {role || "Select Role"}
                <svg
                  className={`w-4 h-4 transition-transform ${roleOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {roleOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                  {roles.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setRole(r);
                        setRoleOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#eaf2f8] transition-colors
                        ${role === r ? "bg-[#eaf2f8] text-[#1a5276] font-medium" : "text-gray-700"}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sign In */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 text-white text-sm font-medium rounded-lg transition-colors
                         ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#1a5276] hover:bg-[#154360]"}`}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
