import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Call your backend login API
      const response = await axios.post("/api/login", {
        email,
        password,
      });

      // Check for success and token
      if (response.status === 200 && response.data.token) {
        const token = response.data.token;

        // ✅ Save the token to localStorage
        localStorage.setItem("token", token);

        // Optional: Save user info if included
        // localStorage.setItem("user", JSON.stringify(response.data.user));

        // ✅ Redirect after short delay
        setTimeout(() => {
          navigate("/home");
        }, 1500);
      } else {
        setError("Login failed. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      // Show specific message if available
      const errorMessage = err.response?.data?.error || "Login failed. Please try again.";
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#333652] px-4 py-10">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row items-center sm:items-end justify-center text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6 p-6 mb-7 w-full max-w-2xl">
        {/* Logo */}
        <img src="/logo.png" alt="PhishGuard AI Logo" className="w-24 sm:w-32 h-auto" />

        {/* Text Section */}
        <div>
          <h1 className="text-3xl sm:text-4xl text-white font-bold">PhishGuard AI</h1>
          <p className="mt-2 text-xl sm:text-2xl text-white font-poppins">
            Empowering You to <br className="hidden sm:block" />
            Outsmart Phishing, <br className="hidden sm:block" />
            Email by Email.
          </p>
        </div>
      </header>

      {/* Login Box */}
      <div className="p-6 bg-white shadow-md rounded-3xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Welcome!</h2>
        <h2 className="text-3xl font-bold text-gray-800 text-center">Log In To Your Account</h2>

        <form onSubmit={handleEmailLogin} className="mt-6">
          {/* Email Input */}
          <div className="w-full mb-4">
            <label className="block text-lg text-gray-700 text-center" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg text-center bg-[#e7a92f] text-gray-900 placeholder-gray-700 focus:ring-2 focus:ring-[#0f61a5] focus:outline-none"
              placeholder="Enter your email"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Password Input */}
          <div className="w-full mb-4">
            <label className="block text-lg text-gray-700 text-center" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg text-center bg-[#e7a92f] text-gray-900 placeholder-gray-700 focus:ring-2 focus:ring-[#0f61a5] focus:outline-none"
              placeholder="Enter your password"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-600 text-center font-semibold mt-2">{error}</p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-1/2 px-6 py-3 font-semibold rounded-3xl transition-colors mt-4 mx-auto block ${
              isSubmitting
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-[#0f61a5] text-white hover:bg-[#084980]"
            }`}
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <a href="/" className="text-[#0f61a5] font-bold hover:underline">
            Sign Up Here!
          </a>
        </p>
      </div>

      {/* Success Modal */}
      {isSubmitting && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-md">
          <div className="bg-white p-6 rounded-lg text-center shadow-lg flex flex-col items-center">
            <div className="loader mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800">Login Successful!</h2>
            <p className="text-gray-600 mt-2">Redirecting you to the dashboard...</p>
          </div>
        </div>
      )}

      {/* Spinner CSS */}
      <style>
        {`
          .loader {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color: #d3941a;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default Login;
