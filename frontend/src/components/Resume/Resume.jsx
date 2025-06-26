import React, { useState } from 'react';
import LottieAnimation from '../Lottie';
import animation from './file-upload.json';
import { useNavigate } from "react-router-dom";

export default function Resume() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

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

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file first.');
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("User not authenticated.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setIsUploading(true);
    try {
      const response = await fetch("http://localhost:8000/api/resume/upload/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");

      localStorage.setItem("resumeFileName", fileName);
      setUploadedUrl(result.url);
      alert("Resume uploaded successfully");
      navigate("/cam-permission");
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMessage(err.message);
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl flex flex-col gap-4 items-center bg-darkblue bg-opacity-40 py-14 my-28 rounded-3xl">
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
        <div className="flex items-center gap-4">
          <img
            src="/file-upload.png"
            className="w-8 h-8"
            alt="File upload"
          />
          <div className="text-gray-400 text-sm">
            {fileName ? fileName : (
              <p>Click the icon to select files. <br />Upload PDF, DOCX, or TXT.</p>
            )}
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={isUploading}
          className={`px-6 py-2 rounded-xl text-white ${isUploading ? 'bg-gray-600' : 'bg-blue1 hover:bg-darkblue'}`}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {errorMessage && (
        <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
      )}
    </div>
  );
}
