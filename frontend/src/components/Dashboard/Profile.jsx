import React, { useState, useEffect } from 'react';
import { Camera, Edit2, Award, Clock, BarChart2 } from 'lucide-react';
import { getUserDetails } from '../../api';

const Profile = () => {
  const [userDetails, setUserDetails] = useState({
    username: 'null',
    email: 'null',
    joinedDate: 'null',
    totalInterviews: 0,
    averageScore: 60,
    recentInterviews: []
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const data = await getUserDetails();
        setUserDetails(data);
      } catch (error) {
        console.error('Failed to fetch user details');
      }
    };

    fetchUserDetails();
  }, []);

  return (
      <div className="max-w-4xl mx-auto space-y-6 mt-16">
        {/* Profile Header */}
        <div className="bg-darkblue bg-opacity-40 text-white rounded-lg shadow-lg">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-white text-black2 flex items-center justify-center text-3xl font-bold">
                    {userDetails.username.charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute bottom-0 right-0 rounded-full p-2 bg-darkblue hover:bg-blue1 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{userDetails.username}</h1>
                  <p className="text-gray-400">{userDetails.email}</p>
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
              <button className="px-4 py-2 bg-darkblue/60 hover:bg-blue1 rounded-lg transition-colors flex items-center">
                <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
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

        {/* Recent Interviews */}
        <div className="bg-darkblue/40 text-white rounded-lg shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Interviews</h2>
            <div className="space-y-4">
              {/* {userDetails.recentInterviews.map((interview, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-darkblue rounded-lg">
                  <div>
                    <h3 className="font-semibold">{interview.title}</h3>
                    <p className="text-sm text-gray-400">{interview.date}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-white ${
                    interview.score >= 70 ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {interview.score}%
                  </span>
                </div>
              ))} */}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Profile;