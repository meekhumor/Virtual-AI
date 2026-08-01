import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../constants";
import { Camera, Edit2, Save, Award, Clock, BarChart2 } from "lucide-react";

const Profile = () => {
  const token = localStorage.getItem("token");
  const apiBaseUrl = API_BASE_URL;

  const [username, setUsername] = useState("Guest");
  const [email, setEmail] = useState("guest@gmail.com");
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState("User");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  // Stats
  const [stats, setStats] = useState(null);
  const [recentInterviews, setRecentInterviews] = useState([]);

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUsername(data.username);
          setNewUsername(data.username);
          setEmail(data.email);
          setProfileImageUrl(data.profile_image_url);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/profile/stats/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          setRecentInterviews(data.recent_interviews || []);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchProfile();
    fetchStats();
  }, [token]);

  const saveChanges = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/profile/update/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: newUsername }),
      });
      if (res.ok) {
        setUsername(newUsername);
        setEditMode(false);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`${apiBaseUrl}/api/profile/image/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setProfileImageUrl(data.url);
        setProfileImage(URL.createObjectURL(file));
      }
    } catch (err) {
      console.error("Image upload error:", err);
    }
  };

  const levelLabel = (level) => {
    const map = { ENTRY: 'Entry Level', INTERMEDIATE: 'Mid Level', SENIOR: 'Senior' };
    return map[level] || level;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-16 px-6 md:px-12 w-full">
      <div className="bg-darkblue bg-opacity-40 text-white rounded-lg shadow-lg">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white text-black2 flex items-center justify-center text-3xl font-bold overflow-hidden">
                  {profileImage || profileImageUrl ? (
                    <img
                      src={profileImage || profileImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span>{username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0">
                  <input
                    type="file"
                    accept="image/*"
                    id="profileImageUpload"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <label
                    htmlFor="profileImageUpload"
                    className="cursor-pointer rounded-full p-2 bg-darkblue hover:bg-blue1 transition-colors block"
                  >
                    <Camera className="w-4 h-4" />
                  </label>
                </div>
              </div>
              <div>
                {editMode ? (
                  <input
                    className="text-2xl font-bold bg-transparent border-b border-gray-300 text-white outline-none"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                ) : (
                  <h1 className="text-2xl font-bold">{username}</h1>
                )}
                <p className="text-gray-400">{email}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 text-sm bg-darkblue/60 text-white rounded-full">
                    {stats?.total_interviews > 5 ? 'Experienced' : 'Learning'}
                  </span>
                  <span className="px-3 py-1 text-sm bg-darkblue/60 text-white rounded-full">
                    {stats?.total_interviews > 0 ? 'Active' : 'Getting Started'}
                  </span>
                </div>
              </div>
            </div>
            <button
              className="px-4 py-2 bg-darkblue/60 hover:bg-blue1 rounded-lg transition-colors flex items-center"
              onClick={editMode ? saveChanges : () => setEditMode(true)}
            >
              {editMode ? <Save className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
              {editMode ? "Save" : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-darkblue/40 text-white rounded-lg shadow-lg">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <Award className="w-8 h-8 text-blue1" />
              <div>
                <p className="text-gray-400">Average Score</p>
                <p className="text-2xl font-bold">
                  {stats?.average_score !== null && stats?.average_score !== undefined
                    ? `${stats.average_score} / 10`
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-darkblue/40 text-white rounded-lg shadow-lg">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-blue1" />
              <div>
                <p className="text-gray-400">Total Time</p>
                <p className="text-2xl font-bold">{stats?.total_time || '0h 0m'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-darkblue/40 text-white rounded-lg shadow-lg">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <BarChart2 className="w-8 h-8 text-blue1" />
              <div>
                <p className="text-gray-400">Completed</p>
                <p className="text-2xl font-bold">{stats?.total_interviews ?? '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="bg-darkblue/40 text-white rounded-lg shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Interviews</h2>
          {recentInterviews.length > 0 ? (
            <div className="space-y-3">
              {recentInterviews.map((iv) => (
                <div key={iv.id} className="flex justify-between items-center p-3 bg-darkblue/40 rounded-lg">
                  <div className="flex gap-6 text-sm text-gray-400">
                    <span className="text-white font-medium">{iv.title || 'General Interview'}</span>
                    <span>{levelLabel(iv.level)}</span>
                    <span>{iv.mode}</span>
                    <span>{formatDate(iv.created_at)}</span>
                  </div>
                  <a
                    href={`/review/${iv.id}`}
                    className="text-blue1 text-sm hover:text-white transition"
                  >
                    Review
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No interviews yet. Complete your first interview to see it here!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;