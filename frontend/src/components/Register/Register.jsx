import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CardSign from "./CardSign";
import axios from "axios";
import api from "../../api";
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
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      const res = await api.post("/api/user/register/", { email, username, password });
      alert("Registration successful");

      const loginRes = await api.post("/api/token/", { username, email, password });
      localStorage.setItem(ACCESS_TOKEN, loginRes.data.access);
      localStorage.setItem(REFRESH_TOKEN, loginRes.data.refresh);

      navigate("/dashboard");
    } catch (error) {
      alert("Already registered, please login!")
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
              <div>
                <CardSign title={step.title} description={step.description} />
              </div>
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
            className="rounded-full border-2 py-1 pl-4 mb-4"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex items-center gap-4 mt-6">
            <button 
              type="submit" 
              className="bg-blue1 hover:bg-darkblue/50 text-white py-1.5 px-4 rounded-full w-28"
            >
              {loading ? "Loading..." : "Continue"} 
            </button>
            <Link 
              to="/dashboard"
              className="text-zinc-400 hover:text-zinc-300 underline ml-24"
            >
              Guest Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}