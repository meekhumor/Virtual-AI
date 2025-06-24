import { useState, useRef, useEffect } from "react";
import {
  FiVideo,
  FiMic,
  FiMicOff,
  FiVideoOff,
  FiLogOut,
  FiMessageSquare,
} from "react-icons/fi";
import Draggable from "react-draggable";
import { Link } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { X, Mic, Camera, Code, MessageSquare, Clock, TrendingUp, HelpCircle } from 'lucide-react';

// Simple function to strip Markdown bold markers
const stripMarkdown = (text) => {
  return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/[#*_`]/g, '');
};

// Define the API base URL based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://virtual-interviewer.onrender.com'
  : 'http://localhost:8000';

export default function Interview_Simulator() {
  const videoRef = useRef(null);
  const [micStatus, setMicStatus] = useState(false);
  const [videoStatus, setVideoStatus] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const [isTopBarOpen, setIsTopBarOpen] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [text, setText] = useState("");
  const [timeLeft, setTimeLeft] = useState("1200"); 
  const [isRunning, setIsRunning] = useState(false);
  const [Level, setLevel] = useState("Internship");
  const [Time, setTime] = useState("20");
  const [micStartTime, setMicStartTime] = useState(null); 
  const [shouldProcessTranscript, setShouldProcessTranscript] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); 

  useEffect(() => {
    const storedTime = sessionStorage.getItem("interviewTime");
    const storedLevel = sessionStorage.getItem("interviewLevel");

    setTime(storedTime);
    setLevel(storedLevel);
    if (storedTime) {
      setTimeLeft(parseInt(storedTime) * 60); 
    }

    // Send initial "hello" message to start the interview
    handleSendMessage("hello");
  }, []);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (shouldProcessTranscript && transcript && !listening) {
      handleSendMessage(transcript);
      resetTranscript();
      setShouldProcessTranscript(false);
    }
  }, [transcript, listening, shouldProcessTranscript]);

  const startListening = () => {
    setMicStartTime(Date.now());
    setShouldProcessTranscript(true);
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    if (micStartTime) {
      const elapsedTime = Date.now() - micStartTime;
      console.log(`Mic was on for ${elapsedTime / 1000} seconds`);
    }
  };

  const handleMicToggle = () => {
    setIsRunning(prev => !prev);
    setMicStatus(prev => {
      if (!prev) {
        startListening();
      } else {
        stopListening();
      }
      return !prev;
    });
  };

  const getVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing webcam: ", err);
    }
  };

  useEffect(() => {
    if (videoStatus) {
      getVideo();
    } else if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [videoStatus]);

  const handleSpeak = (text) => {
    if (text) {
      const cleanText = stripMarkdown(text);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "en-IN";
      utterance.pitch = 1;
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (inputMessage) => {
    if (!inputMessage.trim()) {
      console.warn("Input message is empty.");
      return;
    }
  
    setTranscriptHistory((prevHistory) => [
      ...prevHistory,
      { sender: "user", text: inputMessage },
    ]);
  
    const data = {
      input_value: inputMessage,
      tweaks: {
        "TextInput-QXLsN": { input_value: Level },
        "TextInput-XXLvP": { input_value: Time },
      },
      instruction: "Ask one interview question at a time based on the level and user input."
    };
  
    try {
      console.log("Sending data to API:", JSON.stringify(data).substring(0, 200) + "...");
      
      const response = await fetch(`${API_BASE_URL}/api/gemini/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const result = await response.json();
      const message = result.outputs?.[0]?.outputs?.[0]?.results?.message?.text || "No response received";
      
      handleSpeak(message);
      setTranscriptHistory((prevHistory) => [
        ...prevHistory,
        { sender: "ai", text: message },
      ]);
      setCurrentQuestionIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching AI response:", error.message);
      setTranscriptHistory((prevHistory) => [
        ...prevHistory,
        { sender: "ai", text: "Sorry, I couldn't process your response. Let's continue anyway. What’s your name and what topics would you like to discuss?" },
      ]);
    }
  };

  // JSX remains unchanged
  return (
    <div className="flex flex-col justify-between items-center text-white min-h-screen relative">
      <div className={`fixed top-0 max-w-7xl w-full mx-auto ${isTopBarOpen ? "h-28" : "h-8"} bg-zinc-900 flex items-center justify-between px-6 transition-all duration-500 ease-in-out rounded-b-xl z-10`}>
        <div className={`w-full flex ${isTopBarOpen ? "opacity-100" : "opacity-0"} justify-between items-center mb-4 px-6 transition-opacity duration-300`}>
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
            <img src="/clock.png" alt="Clock" className="w-7 h-7" />
            {timeLeft !== null && <p className="text-xl font-semibold">{formatTime(timeLeft)}</p>}
          </div>
          <div className="w-96 bg-gray-800 h-12 rounded-full overflow-hidden relative flex items-center my-4">
            <div className="bg-blue-600 h-full absolute left-0 top-0" style={{ width: `${((Time * 60 - timeLeft) / (Time * 60)) * 100}%` }}></div>
            <div className="flex justify-between w-full px-4 relative z-10 items-center">
              <img src="/rocket.png" alt="Rocket" className="w-7 h-7" />
              <img src="/goal.png" alt="Goal" className="w-7 h-7" />
            </div>
          </div>
          <div className="flex items-center gap-6 h-12">
            <Link to="/analysis" className="bg-yellow-600 text-white font-semibold rounded-lg p-3 flex items-center transition hover:bg-darkblue">
              <img src="/analysis.png" alt="Analysis" className="w-7" />
            </Link>
            <button onClick={() => { setShowInfo((prev) => !prev); }} className="bg-blue-600 text-white font-semibold rounded-lg p-3 flex items-center transition hover:bg-darkblue">
              <img src="/help.png" alt="Help" className="w-7" />
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsTopBarOpen((prev) => !prev)}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-zinc-800 px-4 py-2 rounded-full shadow-lg transition-all duration-300 ease-in-out z-30"
        >
          <img
            src="down-arrow.png"
            className={`w-6 transform transition-transform duration-500 ease-in-out ${isTopBarOpen ? "rotate-0" : "rotate-180"}`}
            alt="Toggle"
          />
        </button>
      </div>
      <div className="w-full flex-grow flex justify-center items-center transition-all duration-300">
        <div className={`bg-darkblue bg-opacity-30 w-56 h-56 rounded-full hover:scale-105 ${micStatus ? "border-green-600 border-4 animate-pulse" : "border-red-600 border-4"} flex items-center justify-center`}>
          <div className="w-3 h-3 rounded-full shadow-lg"></div>
        </div>
      </div>
      <Draggable bounds="parent">
        <div className="z-10 bg-darkblue3 w-80 h-60 rounded-2xl absolute bottom-36 right-10">
          {videoStatus ? (
            <video
              ref={videoRef}
              autoPlay
              className="w-full h-full rounded-2xl transform scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center shadow-xl">
              <div className="bg-darkblue/20 w-28 h-28 rounded-full"></div>
            </div>
          )}
        </div>
      </Draggable>
      <div 
        className={`
          absolute left-0 top-0 bottom-24 md:w-1/4 w-2/5 z-20
          transform transition-transform duration-300 ease-in-out
          ${showMessages ? 'translate-x-0' : '-translate-x-full '}
        `}
      >
        <div className="h-full bg-zinc-950 border-r border-zinc-800/50 flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue1 animate-pulse"></div>
                <h1 className="text-lg font-medium text-zinc-100">Interview Chat</h1>
              </div>
              <button
                onClick={() => setShowMessages(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
                aria-label="Close messages"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {transcriptHistory.length > 0 ? (
              transcriptHistory.map((item, index) => (
                <div
                  key={index}
                  className={`flex ${
                    item.sender === "ai" ? "justify-start" : "justify-end"
                  } group`}
                >
                  <div
                    className={`
                      max-w-[85%] p-3 rounded-2xl text-sm
                      ${item.sender === "ai" 
                        ? "bg-zinc-800/75 text-zinc-200 rounded-tl-none" 
                        : "bg-blue1 text-white rounded-tr-none"
                      }
                      backdrop-blur-sm shadow-lg
                    `}
                  >
                    {item.text}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center">
                  <FiMessageSquare className="w-6 h-6 text-zinc-500" />
                </div>
                <div className="text-zinc-500 text-sm">
                  Start your interview conversation...
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Type your response..."
                className="flex-grow p-2.5 px-4 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-blue1/50 focus:ring-1 focus:ring-blue1/25 transition-colors"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && text.trim()) {
                    handleSendMessage(text);
                    setText("");
                  }
                }}
              />
              <button
                className="p-2.5 rounded-xl bg-blue1 text-white hover:bg-blue1 transition-all"
                onClick={() => {
                  if (text.trim()) {
                    handleSendMessage(text);
                    setText("");
                  }
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
      <div 
        className={`
          absolute right-0 top-0 bottom-24 md:w-1/4 w-2/5 z-20
          transform transition-transform duration-300 ease-in-out 
          ${showCodeEditor ? 'block' : 'hidden'}
        `}
      >
        <div className="h-full bg-zinc-950 border-l border-zinc-800/50 flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-medium text-zinc-100">Code Solution</h1>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue1 rounded-lg hover:bg-blue1/80 focus:outline-none focus:ring-2 focus:ring-blue1/50 focus:ring-offset-1 focus:ring-offset-zinc-900 transition-all"
                  onClick={() => console.log("Submit button clicked")}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden bg-zinc-950">
            <Editor
              height="100%"
              width="100%"
              defaultLanguage="python"
              defaultValue="# Write your solution here"
              theme="vs-dark"
              options={{
                fontSize: 14,
                lineNumbers: "on",
                automaticLayout: true,
                minimap: { enabled: false },
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: true,
                renderLineHighlight: "all",
                lineHeight: 1.6,
                letterSpacing: 0.5,
                tabSize: 4,
              }}
            />
          </div>
        </div>
      </div>
      <div
        className={`fixed inset-0 flex items-center justify-center z-20 bg-black/60 backdrop-blur-sm ${
          showInfo ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="relative w-[800px] max-h-[85vh] bg-darkblue2 rounded-xl shadow-2xl overflow-y-auto">
          <button 
            onClick={() => setShowInfo(false)} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="p-10 pt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white">Master Your Interview</h2>
              <p className="text-gray-400 mt-2">Navigate our advanced interview simulator with confidence</p>
            </div>
            <div className="mb-8">
              <div className="space-y-4">
                {[
                  {
                    icon: <Mic className="w-5 h-5" />,
                    title: "Voice Controls",
                    description: "Click to speak, release when finished. Watch for the pulse indicator.",
                  },
                  {
                    icon: <Camera className="w-5 h-5" />,
                    title: "Video Interface",
                    description: "Toggle camera to practice professional presence and body language.",
                  },
                  {
                    icon: <Code className="w-5 h-5" />,
                    title: "Code Editor",
                    description: "Access the built-in code editor for technical challenges.",
                  },
                  {
                    icon: <MessageSquare className="w-5 h-5" />,
                    title: "Chat Interface",
                    description: "Switch to text mode for written responses when needed.",
                  }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer group"
                  >
                    <div className={`bg-blue1/10 p-3 rounded-xl text-blue1 group-hover:scale-110 transition-transform duration-200`}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-200">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 p-6 rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-2 text-blue1 mb-2">
                  <Clock className="w-5 h-5" />
                  <h4 className="font-semibold text-white">Progress Tracking</h4>
                </div>
                <p className="text-gray-400">Monitor your progress and remaining time via the dynamic top bar</p>
              </div>
              <div className="bg-white/5 p-6 rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-2 text-blue1 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <h4 className="font-semibold text-white">Real-time Analytics</h4>
                </div>
                <p className="text-gray-400">Access detailed performance metrics and feedback instantly</p>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue1/10 p-2 rounded-lg text-blue1">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-white">Essential Tips</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Use the escape key or leave button to exit the interview",
                  "Interview concludes automatically upon completion",
                  "Access help documentation at any time during the session"
                ].map((tip, index) => (
                  <li key={index} className="flex items-center space-x-2 text-gray-400 ">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue1"></div>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full bg-darkblue bg-opacity-30 h-24 flex justify-between items-center">
        <button
          onClick={() => setShowMessages((prev) => !prev)}
          className="bg-yellow-600 hover:bg-blue2 p-3 ml-20 rounded-2xl font-bold"
        >
          <FiMessageSquare className="w-8 h-8" />
        </button>
        <div className="flex gap-6">
          <button
            onClick={handleMicToggle}
            className={`text-white p-3 rounded-2xl hover:bg-darkblue ${
              micStatus ? "bg-blue1" : "bg-gray-600"
            }`}
          >
            {micStatus ? (
              <FiMic className="w-8 h-8" />
            ) : (
              <FiMicOff className="w-8 h-8" />
            )}
          </button>
          <button
            onClick={() => setVideoStatus((prev) => !prev)}
            className={`text-white p-3 rounded-2xl hover:bg-darkblue ${
              videoStatus ? "bg-blue1" : "bg-gray-600"
            }`}
          >
            {videoStatus ? (
              <FiVideo className="w-8 h-8" />
            ) : (
              <FiVideoOff className="w-8 h-8" />
            )}
          </button>
          <Link to="/review" className="text-white p-3 bg-red-600 hover:bg-gray-600 rounded-2xl">
            <FiLogOut className="w-8 h-8" />
          </Link>
        </div>
        <button
          onClick={() => setShowCodeEditor((prev) => !prev)}
          className="bg-orange-600 hover:bg-darkblue text-white text-xl p-3 mr-20 rounded-2xl font-bold"
        >
          <img src="/code.png" alt="" className="w-8"/>
        </button>
      </div>
    </div>
  );
}