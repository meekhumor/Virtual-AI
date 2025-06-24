import React, { useState } from 'react';
import LottieAnimation from '../Lottie';
import animation from './file-upload.json';
import { useNavigate } from "react-router-dom";

export default function Resume() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(""); 
  const [fileName, setFileName] = useState(""); // Add filename state

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setFileName(selectedFile.name);
      setErrorMessage("");
    }
  };

  const handleUpload = async () => {
    if (file) {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        try {
          // Store file content as plain text instead of DataURL for better compatibility
          const fileContent = reader.result;
          
          // Store the text content of the resume
          localStorage.setItem('resume', fileContent);
          
          // Also store the filename separately
          localStorage.setItem('resumeFileName', fileName);
          
          console.log('Resume saved to localStorage');
          alert('Resume uploaded successfully');
          navigate('/cam-permission'); 
        } catch (error) {
          console.error('Error saving resume:', error);
          setErrorMessage('Failed to process file. Please try again.');
        }
      };
      
      // Read as text instead of DataURL for PDF/DOCX content
      reader.readAsText(file);
    } else {
      setErrorMessage('Please select a file first by clicking on the animation');
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl flex flex-col gap-4 items-center bg-darkblue bg-opacity-40 py-14 my-28 rounded-3xl">
      <h1 className="text-white text-3xl text-center">
        Upload a resume to improve your interview
      </h1>
      <p className="text-gray-400 text-center w-4/6 text-sm">
        We&apos;ll use it to generate better questions, relevant to your unique skills and experience.
      </p>

      <input 
        type="file" 
        onChange={handleFileChange} 
        className="hidden" 
        id="file-upload" 
        accept=".pdf,.docx,.txt" // Limit file types
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
            {fileName ? (
              <p className="text-blue1">{fileName}</p>
            ) : (
              <p>Click the icon to select files. <br/>Upload PDF, DOCX, or TXT.</p>
            )}
          </div>
        </div>
        
        <button
          onClick={handleUpload}
          className="px-6 py-2 bg-blue1 hover:bg-darkblue rounded-xl text-white"
        >
          Upload
        </button>
      </div>

      {errorMessage && <p className="mt-4 text-red-500">{errorMessage}</p>}
    </div>
  );
}