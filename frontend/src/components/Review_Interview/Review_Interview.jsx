import React, { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import {Link} from "react-router-dom"

// Review data
const reviewData = [
  {
    label: "Cognitive Skills",
    title: "Analytical Skills",
    level: "Mid",
    time: "30",
    mode: "Real",
    day: "20",
  },
  {
    label: "Cognitive Skills",
    title: "Creativity",
    level: "Entry",
    time: "25",
    mode: "Practical",
    day: "18",
  },
  {
    label: "Cognitive Skills",
    title: "Critical Thinking",
    level: "Mid",
    time: "25",
    mode: "Real",
    day: "15",
  },
  {
    label: "Cognitive Skills",
    title: "Decision-Making",
    level: "Mid",
    time: "30",
    mode: "Practical",
    day: "11",
  },
  {
    label: "Leadership Skills",
    title: "Financial Management",
    level: "Mid",
    time: "30",
    mode: "Real",
    day: "8",
  },
  {
    label: "Leadership Skills",
    title: "Leadership / Leading Others",
    level: "Management",
    time: "30",
    mode: "Real",
    day: "4",
  },
];

function ReviewCard({title, level, mode, time, day}) {
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
          <button className="p-2 hover:bg-darkblue/50 rounded-full transition-colors">
            <img src="/share.svg" className="w-5 h-5" alt="Share" />
          </button>
          <button className="p-2 hover:bg-darkblue/50 rounded-full transition-colors">
            <img src="/delete.svg" className="w-5 h-5" alt="Delete" />
          </button>
          <Link to="/review" className="rounded-lg text-gray-900 hover:bg-darkblue/50 bg-zinc-300 px-3 py-1 text-sm hover:text-white transition-colors">
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Review_Interview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [isLabelDropdownOpen, setIsLabelDropdownOpen] = useState(false);
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);

  const uniqueLabels = ["all", ...new Set(reviewData.map(item => item.label))];
  const uniqueLevels = ["all", ...new Set(reviewData.map(item => item.level))];

  const filteredReviews = reviewData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLabel = selectedLabel === "all" || item.label === selectedLabel;
    const matchesLevel = selectedLevel === "all" || item.level === selectedLevel;
    return matchesSearch && matchesLabel && matchesLevel;
  });

  return (
    <div className="mx-auto w-full max-w-3xl mb-44">
      <h1 className="text-white px-4 text-center text-2xl my-12">
        Review Interviews
      </h1>
      
      <div className="mb-8 px-4 space-y-4">
        {/* Search and Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
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
          
          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLabelDropdownOpen(!isLabelDropdownOpen)}
              className="w-[180px] px-4 py-2 bg-darkblue/40 text-white rounded-xl flex items-center justify-between hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="text-sm">
                {selectedLabel === "all" ? "All Categories" : selectedLabel}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {isLabelDropdownOpen && (
              <div className="absolute mt-3 w-[180px] bg-gray-900 rounded-xl shadow-lg py-1 z-10">
                {uniqueLabels.map((label) => (
                  <button
                    key={label}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800"
                    onClick={() => {
                      setSelectedLabel(label);
                      setIsLabelDropdownOpen(false);
                    }}
                  >
                    {label === "all" ? "All Categories" : label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Level Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
              className="w-[180px] px-4 py-2 bg-darkblue/40 text-white rounded-xl flex items-center justify-between hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="text-sm">
                {selectedLevel === "all" ? "All Levels" : selectedLevel}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {isLevelDropdownOpen && (
              <div className="absolute mt-3 w-[180px] bg-gray-900 rounded-xl shadow-lg py-1 z-10">
                {uniqueLevels.map((level) => (
                  <button
                    key={level}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800"
                    onClick={() => {
                      setSelectedLevel(level);
                      setIsLevelDropdownOpen(false);
                    }}
                  >
                    {level === "all" ? "All Levels" : level}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {filteredReviews.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No interviews found matching your criteria
          </div>
        ) : (
          filteredReviews.map((step, index) => (
            <div key={index}>
              <ReviewCard
                title={step.title}
                level={step.level}
                mode={step.mode}
                time={step.time}
                day={step.day}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}