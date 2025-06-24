import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";

export default function Camera_Preview1() {
  const [videoAccess, setVideoAccess] = useState(false);
  const [audioAccess, setAudioAccess] = useState(false);
  const [networkAccess, setNetworkAccess] = useState(false);
  const navigate = useNavigate('')

  useEffect(() => {
    // Check for video access
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(() => setVideoAccess(true))
    .catch((err) => {
      console.error("Error accessing video: ", err);
      setVideoAccess(false);
    });
  

    // Check for audio access
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setAudioAccess(true))
      .catch(() => setAudioAccess(false));

    // Check for network access
    setNetworkAccess(navigator.onLine);

    // Optional: Check network periodically
    const handleNetworkChange = () => setNetworkAccess(navigator.onLine);
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, []);
  useEffect(() => { 
    if (videoAccess && audioAccess && networkAccess) {
      navigate('/cam-preview2'); 
    } 
  }, [videoAccess, audioAccess, networkAccess, navigate]);

  return (
    <div className="mx-auto w-full max-w-xl flex flex-col gap-3 items-center bg-darkblue bg-opacity-40 py-14 my-16 rounded-3xl">
      <h1 className='text-white text-3xl'>Let&apos;s get you set up.</h1>
      <p className='text-gray-400 text-sm'>We&apos;re testing your connection...</p>

      <div className='flex justify-center items-center gap-6 px-10 py-3 bg-darkblue bg-opacity-40 rounded-xl my-8 scale'>
        <img src="/microphone.svg" className='w-5' alt="" />
        <p className='text-gray-200 text-sm'>Please speak into the microphone to complete setup.</p>
      </div>

      <div className='flex gap-14'>
        <div className='flex flex-col items-center gap-3'>
          <p className='items-center text-white '>Video</p>
          <img src={videoAccess ? "/check.svg" : "/cross.svg"} className='w-16' alt="" />
        </div>

        <div className='flex flex-col items-center gap-3'>
          <p className='items-center text-white'>Audio</p>
          <img src={audioAccess ? "/check.svg" : "/cross.svg"} className='w-16' alt="" />
        </div>

        <div className='flex flex-col items-center gap-3'>
          <p className='items-center text-white'>Network</p>
          <img src={networkAccess ? "/check.svg" : "/cross.svg"} className='w-16' alt="" />
        </div>
      </div>
    </div>
  );
}
