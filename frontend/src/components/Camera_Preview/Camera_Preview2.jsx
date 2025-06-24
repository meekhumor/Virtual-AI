import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function Camera_Preview2() {
  const videoRef = useRef(null);

  useEffect(() => {
    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam: ", err);
      }
    };

    getVideo();

    return () => {
      if (videoRef.current) {
        const tracks = videoRef.current.srcObject?.getTracks();
        tracks?.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-xl flex flex-col gap-10 items-center bg-darkblue bg-opacity-40 rounded-3xl py-14 my-16">
      <h1 className="text-white text-2xl">Get Ready...</h1>
      <video
        ref={videoRef}
        autoPlay
        className="w-2/3 h-full rounded-2xl transform scale-x-[-1]"
      />
      <Link
        to="/interview-simulator"
        className="bg-blue1 hover:bg-darkblue text-white rounded-3xl px-6 py-3 text-sm"
      >
        Start Interview Simulator
      </Link>
    </div>
  );
}
