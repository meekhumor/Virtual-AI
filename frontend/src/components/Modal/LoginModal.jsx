import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL, ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  
  console.log('API_BASE_URL:', API_BASE_URL);
  const apiBaseUrl = API_BASE_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(`${apiBaseUrl}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem(ACCESS_TOKEN, data.token);
        localStorage.setItem(REFRESH_TOKEN, data.token);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("username", data.user.username); 
        navigate("/dashboard"); // adjust route if needed
      } else {
        setErrorMessage(data.error || "Login failed");
      }
    } catch (err) {
      setErrorMessage("Login error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white px-14 py-6 rounded shadow-lg max-w-lg w-full relative">
        <div className="relative left-96 mx-2 top-3 cursor-pointer">
          <img src="/closeLogin.svg" onClick={onClose} alt="Close" />
        </div>

        <div className="flex flex-col gap-3 items-center justify-center mb-8 mt-4">
          <h1 className="text-3xl font-semibold">Welcome back!</h1>
          <div className="flex gap-1 text-sm">
            <p className="text-gray-700">Don&apos;t have an account?</p>
            <Link to="/register" className="text-blue1">Sign Up</Link>
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm text-gray-800 font-semibold">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm text-gray-800 font-semibold">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="w-full py-3 px-4 bg-blue1 text-white rounded-xl hover:bg-darkblue mt-6">
            {loading ? "Loading..." : "Login"}
          </button>

          {errorMessage && <p className="text-sm text-red-500 text-center mt-4">{errorMessage}</p>}
        </form>

        <p className="text-sm text-center mt-7 mb-6 text-darkblue cursor-pointer">
          Forgot your password?
        </p>
      </div>
    </div>
  );
};

export default LoginModal;