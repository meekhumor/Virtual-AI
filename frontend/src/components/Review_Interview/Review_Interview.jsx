import React, { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Link } from "react-router-dom";

function ReviewCard({ id, title, level, mode, time, day, onDelete, onShare }) {
  return (
    <div className="transition-all duration-200">
      <div className="flex flex-wrap justify-between py-4 px-6 items-center hover:bg-darkblue hover:bg-opacity-40 rounded-2xl">
        <div className="flex flex-col gap-2">
          <p className="text-gray-400 text-xs">{day} Days Ago</p>
          <h1 className="text-white text-lg font-medium">{title}</h1>
          <div className="flex gap-3 items-center">
            <span className="px-3 py-1 rounded-full bg-darkblue/50 text-gray-300 text-xs">{level} Level</span>
            <span className="px-3 py-1 rounded-full bg-darkblue/50 text-gray-300 text-xs">{mode} Mode</span>
            <span className="px-3 py-1 rounded-full bg-darkblue/50 text-gray-300 text-xs">{time} min</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="p-2 hover:bg-darkblue/50 rounded-full transition-colors"
            onClick={() => onDelete(id)}
          >
            <img src="/delete.svg" className="w-5 h-5" alt="Delete" />
          </button>
          <Link to={`/review/${id}`} className="rounded-lg text-gray-900 hover:bg-darkblue/50 bg-zinc-300 px-3 py-1 text-sm hover:text-white transition-colors">
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Review_Interview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [interviews, setInterviews] = useState([]);

  // Vite env var access with fallback
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${apiBaseUrl}/api/interviews/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setInterviews(data);
      } catch (error) {
        console.error("Failed to fetch interviews:", error);
      }
    };
    fetchData();
  }, []);

  const filteredReviews = interviews.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this interview?");
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${apiBaseUrl}/api/interviews/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete");

      setInterviews((prev) => prev.filter((item) => item.id !== id));
      alert("Interview deleted successfully.");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete interview.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl mb-44">
      <h1 className="text-white px-4 text-center text-2xl my-12">
        Review Interviews
      </h1>

      <div className="mb-8 px-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search interviews..."
            className="w-full pl-10 pr-4 py-2 bg-darkblue/40 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        {filteredReviews.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No interviews found matching your criteria
          </div>
        ) : (
          filteredReviews.map((item) => (
            <ReviewCard
              key={item.id}
              id={item.id}
              title={item.title}
              level={item.level}
              mode={item.mode}
              time={Math.round(item.duration_seconds / 60)}
              day={Math.round((Date.now() - new Date(item.scheduled_at)) / (1000 * 60 * 60 * 24))}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}