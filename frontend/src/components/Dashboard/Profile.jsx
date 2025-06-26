import React, { useState, useEffect } from "react";
import { Camera, Edit2, Save, Award, Clock, BarChart2 } from "lucide-react";

const API_BASE_URL = "http://localhost:8000";

const Profile = () => {
  const token = localStorage.getItem("token");

  const [username, setUsername] = useState("User");
  const [email, setEmail] = useState("unknown@example.com");
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState("User");
  const [profileImage, setProfileImage] = useState(null); // Preview only
  const [profileImageUrl, setProfileImageUrl] = useState(null); // From server

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUsername(data.username);
          setNewUsername(data.username);
          setEmail(data.email);
          setProfileImageUrl(data.profile_image_url);
        } else {
          console.error("Failed to fetch profile data");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    if (token) fetchProfile();
  }, [token]);

  const saveChanges = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/update/`, {
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
      } else {
        console.error("Failed to update username");
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
      const res = await fetch(`${API_BASE_URL}/api/profile/image/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProfileImageUrl(data.url);
        setProfileImage(URL.createObjectURL(file));
      } else {
        console.error("Image upload failed");
      }
    } catch (err) {
      console.error("Image upload error:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-16">
      {/* Profile Header */}
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
                    Intermediate
                  </span>
                  <span className="px-3 py-1 text-sm bg-darkblue/60 text-white rounded-full">
                    Consistent
                  </span>
                </div>
              </div>
            </div>
            <button
              className="px-4 py-2 bg-darkblue/60 hover:bg-blue1 rounded-lg transition-colors flex items-center"
              onClick={editMode ? saveChanges : () => setEditMode(true)}
            >
              {editMode ? (
                <Save className="w-4 h-4 mr-2" />
              ) : (
                <Edit2 className="w-4 h-4 mr-2" />
              )}
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
                <p className="text-2xl font-bold">78.6 %</p>
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
                <p className="text-2xl font-bold">13h 30m</p>
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
                <p className="text-2xl font-bold">7</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Interviews Placeholder */}
      <div className="bg-darkblue/40 text-white rounded-lg shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Interviews</h2>
          <div className="space-y-4">
            <div className="text-gray-400 text-sm">
              No recent interviews available.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
