import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import {Link} from "react-router-dom"

const ComingSoon = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const launchDate = new Date('2025-03-01').getTime();
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-44 bg-black flex flex-col items-center justify-center p-4">
  
      <div className="max-w-3xl w-full space-y-10 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Coming Soon....
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds }
          ].map((item) => (
            <div key={item.label} className="bg-darkblue/40 rounded-lg p-6 hover:scale-105 transition-transform duration-300 ease-in-out">
              <div className="text-2xl font-bold text-white mb-1">{item.value}</div>
              <div className="text-gray-400">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <Link to="/dashboard"
            className="flex items-center gap-2 text-gray-400 hover:text-white bg-darkblue/40 px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 ease-in-out mt-20"
        >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
        </Link>
    </div>
  );
};

export default ComingSoon;
