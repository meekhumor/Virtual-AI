import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const levels = ["Internship", "Entry Level", "Mid Level", "Management"];
const content = [
  "Expect questions on basic concepts and your eagerness to learn.",
  "Questions will focus on foundational skills and your enthusiasm.",
  "Prepare for questions evaluating your problem-solving experience.",
  "Anticipate questions testing your leadership and strategic thinking.",
];
const time = ["20", "30", "45", "60"];

// Map UI labels → backend enum values
const LEVEL_MAP = {
  "Internship": "ENTRY",
  "Entry Level": "ENTRY",
  "Mid Level": "INTERMEDIATE",
  "Management": "SENIOR",
};

function Interview_Setting() {
  const [selectedlevel, setSelectedlevel] = useState(0);
  const [selectedtime, setSelectedTime] = useState(0);
  const [isToggled, setIsToggled] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => setIsToggled((prev) => !prev);

  const handleNext = () => {
    const backendLevel = LEVEL_MAP[levels[selectedlevel]] || "ENTRY";
    const backendMode = isToggled ? 'REAL' : 'PRACTICE';

    sessionStorage.setItem('interviewTime', time[selectedtime]);
    sessionStorage.setItem('interviewLevel', backendLevel);
    sessionStorage.setItem('interviewMode', backendMode);

    navigate('/resume');
  };

  return (
    <div className='flex flex-col mx-auto max-w-2xl items-center rounded-3xl py-14 px-6 md:px-12 my-16 gap-12 bg-darkblue bg-opacity-40 w-[calc(100%-2rem)] md:w-full'>

      {/* Heading */}
      <div className='flex flex-col gap-2 items-center'>
        <p className='text-gray-400 text-sm'>GENERAL INTERVIEW</p>
        <h1 className='text-white text-3xl'>Interview Setting</h1>
      </div>

      {/* Level */}
      <div className='flex flex-col items-center gap-3'>
        <p className='text-gray-300 text-xl'>What experience level are you interviewing for?</p>
        <div className="text-white flex flex-col items-center max-w-3xl">
          <div className="text-gray-400 cursor-pointer">
            {levels.map((option, index) => (
              <button
                key={index}
                className={`flex-1 py-2 px-6 text-center focus:outline-none ${
                  selectedlevel === index
                    ? 'border-blue-500 border-b-2 text-white'
                    : 'border-transparent hover:cursor-pointer'
                }`}
                onClick={() => setSelectedlevel(index)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="p-4">
            <p className="text-center text-sm text-gray-500">{content[selectedlevel]}</p>
          </div>
        </div>
      </div>

      {/* Time */}
      <div className='flex flex-col items-center gap-3'>
        <p className='text-gray-300 text-xl'>How long do you want your interview to be?</p>
        <div className="text-white flex flex-col items-center max-w-5xl">
          <div className="text-gray-400">
            {time.map((option, index) => (
              <button
                key={index}
                className={`flex-1 py-2 px-6 text-center focus:outline-none ${
                  selectedtime === index
                    ? 'border-blue-500 border-b-2 text-white'
                    : 'border-transparent hover:cursor-pointer'
                }`}
                onClick={() => setSelectedTime(index)}
              >
                {option} mins
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toggle — Practice / Real */}
      <div className="flex items-center justify-center gap-3">
        {/* "Practice Interview" is active when isToggled=false */}
        <span className={`font-semibold ${!isToggled ? 'text-white' : 'text-gray-500'}`}>
          Practice Interview
        </span>
        <div
          onClick={handleToggle}
          className={`relative inline-flex items-center h-7 w-14 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
            isToggled ? 'bg-blue-500' : 'bg-gray-600'
          }`}
        >
          <div
            className={`transform bg-white w-5 h-5 rounded-full shadow transition-transform duration-200 ease-in-out ${
              isToggled ? 'translate-x-8' : 'translate-x-1'
            }`}
          />
        </div>
        {/* "Real Interview" is active when isToggled=true */}
        <span className={`font-semibold ${isToggled ? 'text-white' : 'text-gray-500'}`}>
          Real Interview
        </span>
      </div>

      <button
        onClick={handleNext}
        className="text-white py-2 rounded-3xl px-8 bg-blue1 hover:bg-darkblue mt-6 transition-colors"
      >
        Next
      </button>
    </div>
  );
}

export default Interview_Setting;
