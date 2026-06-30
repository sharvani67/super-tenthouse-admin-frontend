import React, { useState } from "react";
import logo from '@/assets/logo.jpeg';
import axios from "axios";
import BASE_URL from "@/Config/Api";
import { Eye, EyeOff } from "lucide-react";


const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${BASE_URL}/api/admin/login`, {
        email,
        password,
      });

      // ✅ store token
      localStorage.setItem("token", res.data.token);

      alert("Login successful ✅");

      // ✅ redirect to dashboard
      window.location.href = "/contacts";

    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9]">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">

        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={logo}
            alt="Admin Logo"
            className="w-40 h-40 object-contain mb-2"
          />
          <h2 className="text-2xl font-bold text-[#0c2d67]">
            Admin Login
          </h2>
          <p className="text-gray-500 text-sm">
            Sign in to your account
          </p>
        </div>

        {/* FORM */}
        <form className="space-y-5" onSubmit={handleLogin}>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Password
  </label>

  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      placeholder="Enter your password"
      className="w-full px-4 py-2 border rounded-lg pr-10"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />

    {/* Eye Icon */}
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
</div>

          {/* REMEMBER + FORGOT */}
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Remember me
            </label>
            <a href="/forgot-password" className="text-[#0c2d67] hover:underline">
              Forgot password?
            </a>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
              className="w-full hidden sm:inline-flex justify-center items-center bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 text-white border-0 shadow-lg hover:scale-105 transition py-2 rounded-lg font-semibold"
          >
            Login
          </button>

        </form>
      </div>
    </div>
  );
};

export default AdminLogin;