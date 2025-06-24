import React, { useState } from "react";
import { useNavigate, Link} from "react-router-dom";
import api from "../../api"; // Adjust the import according to your file structure
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";

const LoginModal = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      const res = await api.post("/api/token/", { username, email, password }); 
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      navigate("/dashboard");

    } catch (error) {
      setErrorMessage("Invalid credentials. Please try again.");
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

        {/* Heading  */}
        <div className="flex flex-col gap-3 items-center justify-center mb-8 mt-4">
          <h1 className="text-3xl font-semibold">Welcome back!</h1>
          <div className="flex gap-1 text-sm">
            <p className="text-gray-700">Don&apos;t have an account?</p>
            <Link to="/register" className="text-blue1">Sign Up</Link>
          </div>
        </div>

        {/* Credentials  */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm text-gray-800 font-semibold">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

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
            {loading ? "Loading..." : "Submit"}
          </button>

          {errorMessage && <p className="text-sm text-red-500 text-center mt-4">{errorMessage}</p>}

        </form>
        <p className="text-sm text-center mt-7 mb-6 text-darkblue cursor-pointer">Forgot your password?</p>
      </div>
    </div>
  );
};

export default LoginModal;
