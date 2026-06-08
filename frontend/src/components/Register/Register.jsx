import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CardSign from "./CardSign";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";

const signup = [
  {
    title: "Put on the pressure",
    description: "We simulate the interview and the pressure, for the most realistic experience possible",
  },
  {
    title: "AI powered interviews",
    description: "Upload your resume and job description for custom-tailored practice sessions.",
  },
  {
    title: "Practice smarter, not harder.",
    description: "We use your built-in camera to help you improve in less time than any other option.",
  },
];

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGuestLogin = (e) => {
    e.preventDefault();
    localStorage.setItem(ACCESS_TOKEN, "guest_token_bypass");
    localStorage.setItem(REFRESH_TOKEN, "guest_token_bypass");
    localStorage.setItem("token", "guest_token_bypass");
    localStorage.setItem("username", "guest_user");
    localStorage.setItem("userEmail", "guest@gmail.com");
    navigate("/dashboard");
  };

  // Vite env var access with fallback (note: include /api in the fetch URL if needed)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const signupResponse = await fetch(`${apiBaseUrl}/api/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await signupResponse.json();

      if (!signupResponse.ok) {
        throw new Error(data?.error || data?.message || "Signup failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("userEmail", data.user.email);

      navigate("/confirm-email");
    } catch (err) {
      alert(err.message); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl flex mx-auto h-full mt-16">
      {/* Left */}
      <div className="hidden lg:flex lg:flex-col lg:w-1/2 bg-darkblue bg-opacity-40 lg:justify-center lg:gap-12 lg:px-14 h-full lg:py-20 rounded-l-3xl">
        <h1 className="text-white text-3xl">Land a job worth loving.</h1>
        <div className="flex flex-col gap-8">
          {signup.map((step, index) => (
            <div key={index}>
              <CardSign title={step.title} description={step.description} />
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col gap-10 bg-black1 bg-opacity-40 p-20 px-24 lg:rounded-r-3xl sm:mx-auto">
        <h1 className="text-white text-3xl">Sign Up</h1>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label htmlFor="username" className="text-gray-200 ml-2 mb-2">
            Username
          </label>
          <input
            id="username"
            className="rounded-full border-2 w-80 py-1 pl-4 mb-4"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label htmlFor="email" className="text-gray-200 ml-2 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="rounded-full border-2 py-1 pl-4 mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password" className="text-gray-200 ml-2 mb-2">
            Password
          </label>
          <input
            id="password"
            className="rounded-full border-2 py-1 pl-4 mb-4"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex items-center gap-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue1 hover:bg-darkblue/50 text-white py-1.5 px-4 rounded-full w-28 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Continue"}
            </button>
            <button
              type="button"
              onClick={handleGuestLogin}
              className="text-zinc-400 hover:text-zinc-300 underline ml-24 bg-transparent border-0 cursor-pointer"
            >
              Guest Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}