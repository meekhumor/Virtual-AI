import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:8000/api";

export default function Login() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (token) {
      setUserEmail(localStorage.getItem("userEmail") || "");
    }
  }, [token]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/signup/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Signup successful! Please login.");
      } else {
        setMessage(data.error || "Signup failed");
      }
    } catch (err) {
      setMessage("Signup error: " + err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", data.user.email);
        setUserEmail(data.user.email);
        setMessage("Login successful");
      } else {
        setMessage(data.error || "Login failed");
      }
    } catch (err) {
      setMessage("Login error: " + err.message);
    }
  };

  const handleLogout = () => {
    setToken("");
    setUserEmail("");
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setMessage("Logged out");
  };

  if (token) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center p-6 text-white">
        <h2 className="text-2xl font-semibold mb-6">Welcome, {userEmail}</h2>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition"
        >
          Logout
        </button>
        {message && <p className="mt-4 text-red-400">{message}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-6 text-white">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Signup</h2>
        <form onSubmit={handleSignup} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-3 rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 py-3 rounded font-semibold hover:bg-blue-700 transition"
          >
            Signup
          </button>
        </form>

        <h2 className="text-3xl font-bold mt-12 mb-6 text-center">Login</h2>
        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 py-3 rounded font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        {message && (
          <p className="mt-6 text-center text-red-400 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}
