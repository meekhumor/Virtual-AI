import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from "../../constants";
import LottieAnimation from '../Lottie';
import animation from './file-upload.json';
import { useNavigate } from "react-router-dom";

export default function Resume() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const apiBaseUrl = API_BASE_URL;

  useEffect(() => {
    const fetchExistingResume = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch(`${apiBaseUrl}/api/resume/upload/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.has_resume) {
            setFileName(data.filename);
            localStorage.setItem("resumeFileName", data.filename);
          }
        }
      } catch (err) {
        console.error("Error fetching existing resume:", err);
      }
    };
    fetchExistingResume();
  }, [apiBaseUrl]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const ext = selectedFile?.name?.split('.').pop().toLowerCase();

    const allowedTypes = ['pdf', 'docx', 'txt'];
    if (selectedFile && !allowedTypes.includes(ext)) {
      setErrorMessage("Only PDF, DOCX, or TXT files are allowed.");
      setFile(null);
      setFileName("");
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setErrorMessage("");
  };

  const handleAction = async () => {
    if (file) {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("User not authenticated.");
        return;
      }

      const formData = new FormData();
      formData.append("resume", file);

      setIsUploading(true);
      try {
        const response = await fetch(`${apiBaseUrl}/api/resume/upload/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Upload failed");

        localStorage.setItem("resumeFileName", fileName);
        alert("Resume uploaded successfully");
        navigate("/cam-permission");
      } catch (err) {
        console.error("Upload error:", err);
        setErrorMessage(err.message);
        alert(err.message);
      } finally {
        setIsUploading(false);
      }
    } else if (fileName) {
      navigate("/cam-permission");
    } else {
      setErrorMessage("Please select a file first.");
    }
  };

  const handleSkip = () => {
    localStorage.removeItem("resumeFileName");
    navigate("/cam-permission");
  };

  return (
    <div className="mx-auto max-w-xl flex flex-col gap-4 items-center bg-darkblue bg-opacity-40 py-14 px-6 md:px-12 my-16 rounded-3xl w-[calc(100%-2rem)] md:w-full">
      <h1 className="text-white text-3xl text-center">
        Upload a resume to improve your interview
      </h1>
      <p className="text-gray-400 text-center w-4/6 text-sm">
        We'll use it to generate better questions, relevant to your unique skills and experience.
      </p>

      <input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        accept=".pdf,.docx,.txt"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex justify-center items-center overflow-hidden w-56 h-44">
          <LottieAnimation animationData={animation} loop={true} />
        </div>
      </label>

      <div className="flex items-center justify-between gap-4 bg-darkblue bg-opacity-40 py-4 px-6 rounded-xl w-4/5">
        <label htmlFor="file-upload" className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer">
          <img
            src="/file-upload.png"
            className="w-8 h-8 flex-shrink-0"
            alt="File upload"
          />
          <div className="text-gray-400 text-sm truncate">
            {fileName ? (
              <span className="text-white font-medium">{fileName}</span>
            ) : (
              <p>Click the icon to select files. <br />Upload PDF, DOCX, or TXT.</p>
            )}
          </div>
        </label>

        <button
          onClick={handleAction}
          disabled={isUploading}
          className={`px-6 py-2 rounded-xl text-white flex-shrink-0 ${isUploading ? 'bg-gray-600' : 'bg-blue1 hover:bg-darkblue'}`}
        >
          {isUploading ? "Uploading..." : (file ? "Upload" : (fileName ? "Continue" : "Upload"))}
        </button>
      </div>

      {errorMessage && (
        <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
      )}

      <button
        onClick={handleSkip}
        className="text-gray-400 hover:text-white text-sm font-medium transition duration-200 mt-4 underline decoration-dotted underline-offset-4"
      >
        Skip for now
      </button>
    </div>
  );
}