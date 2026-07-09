import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from "../../constants";
import { Search } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  COMPLETED: { label: 'Completed', class: 'bg-teal/15 text-teal border-teal/30' },
  IN_PROGRESS: { label: 'In Progress', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  PENDING: { label: 'Pending', class: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30' },
};

function InterviewCard({ id, title, level, mode, time, day, status, onDelete }) {
  const navigate = useNavigate();
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  const handleResume = () => {
    sessionStorage.setItem('resumeInterviewId', id);
    navigate('/interview-simulator');
  };

  return (
    <div className="flex flex-wrap justify-between py-4 px-6 items-center hover:bg-darkblue/40 rounded-2xl transition-all duration-200 group">
      <div className="flex flex-col gap-2 min-w-0 flex-1 mr-4">
        <div className="flex items-center gap-2">
          <p className="text-gray-500 text-xs">{day}d ago</p>
          <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${cfg.class}`}>
            {cfg.label}
          </span>
        </div>
        <h2 className="text-white text-base font-medium truncate">{title}</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full bg-darkblue/50 text-gray-400 text-xs">{level}</span>
          <span className="px-2.5 py-0.5 rounded-full bg-darkblue/50 text-gray-400 text-xs">{mode}</span>
          <span className="px-2.5 py-0.5 rounded-full bg-darkblue/50 text-gray-400 text-xs">{time} min</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          className="p-2 hover:bg-red-950/40 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
          onClick={() => onDelete(id)}
          title="Delete interview"
        >
          <img src="/delete.svg" className="w-4 h-4" alt="Delete" />
        </button>

        {status === 'IN_PROGRESS' ? (
          <button
            onClick={handleResume}
            className="rounded-xl text-white bg-amber-600/80 hover:bg-amber-600 px-4 py-1.5 text-sm font-medium transition-all"
          >
            Resume
          </button>
        ) : (
          <Link
            to={`/review/${id}`}
            className="rounded-xl text-zinc-900 bg-zinc-200 hover:bg-zinc-100 px-4 py-1.5 text-sm font-medium transition-all"
          >
            Review
          </Link>
        )}
      </div>
    </div>
  );
}

export default function My_Interviews() {
  const [searchQuery, setSearchQuery] = useState("");
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const apiBaseUrl = API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${apiBaseUrl}/api/interviews/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setInterviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch interviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this interview?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${apiBaseUrl}/api/interviews/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setInterviews((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete interview.");
    }
  };

  const filtered = interviews.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "ALL" || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    ALL: interviews.length,
    IN_PROGRESS: interviews.filter((i) => i.status === 'IN_PROGRESS').length,
    COMPLETED: interviews.filter((i) => i.status === 'COMPLETED').length,
    PENDING: interviews.filter((i) => i.status === 'PENDING').length,
  };

  return (
    <div className="mx-auto w-full max-w-3xl mb-44 px-4">
      <div className="pt-12 pb-6 text-center">
        <h1 className="text-white text-2xl font-semibold">My Interviews</h1>
        <p className="text-zinc-500 text-sm mt-1">{interviews.length} total · {counts.IN_PROGRESS} in progress</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
        <input
          type="text"
          placeholder="Search interviews…"
          className="w-full pl-10 pr-4 py-2.5 bg-darkblue/40 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue1/40 border border-zinc-800"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-1 mb-6 bg-darkblue/30 p-1 rounded-xl border border-zinc-800/50">
        {['ALL', 'IN_PROGRESS', 'COMPLETED', 'PENDING'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterStatus === s
                ? 'bg-blue1/20 text-blue1 border border-blue1/30'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {s === 'ALL' ? 'All' : s === 'IN_PROGRESS' ? 'In Progress' : s === 'COMPLETED' ? 'Completed' : 'Pending'}
            <span className="ml-1 opacity-60">({counts[s]})</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-1">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-blue1 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-zinc-500 py-12 text-sm">
            {searchQuery ? 'No interviews match your search.' : 'No interviews found.'}
          </div>
        ) : (
          filtered.map((item) => (
            <InterviewCard
              key={item.id}
              id={item.id}
              title={item.title}
              level={item.level}
              mode={item.mode}
              status={item.status || 'PENDING'}
              time={Math.round(item.duration_seconds / 60)}
              day={Math.max(0, Math.round((Date.now() - new Date(item.scheduled_at)) / (1000 * 60 * 60 * 24)))}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}