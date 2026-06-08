import { useState, useRef, useEffect, useCallback } from "react";
import {
  FiVideo,
  FiMic,
  FiMicOff,
  FiVideoOff,
  FiLogOut,
  FiMessageSquare,
} from "react-icons/fi";
import Draggable from "react-draggable";
import { Link, useNavigate } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  X,
  Mic,
  Camera,
  Code,
  MessageSquare,
  Clock,
  TrendingUp,
  HelpCircle,
} from "lucide-react";

import { useInterviewWS } from "../../hooks/useInterviewWS";

const stripMarkdown = (text) =>
  text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/[#*_`]/g, "");

export default function Interview_Simulator() {
  const videoRef = useRef(null);
  const hasStartedRef = useRef(false);   // Guard against double-start

  const [micStatus, setMicStatus] = useState(false);
  const [videoStatus, setVideoStatus] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const [isTopBarOpen, setIsTopBarOpen] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [text, setText] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);  // null until loaded from storage
  const [isRunning, setIsRunning] = useState(false);
  const [level, setLevel] = useState("ENTRY");
  const [mode, setMode] = useState("PRACTICE");
  const [duration, setDuration] = useState(1200);
  const [micStartTime, setMicStartTime] = useState(null);
  const [shouldProcessTranscript, setShouldProcessTranscript] = useState(false);
  const [interviewId, setInterviewId] = useState(null);
  const [wsUrl, setWsUrl] = useState(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  // --- Stable handleAgentMessage (useCallback prevents WS reconnect loop) ---
  const handleAgentMessage = useCallback((data) => {
    const { text: agentText, is_question = false } = data;
    setTranscriptHistory((prev) => [...prev, { sender: "ai", text: agentText, is_question }]);
    handleSpeak(agentText);
  }, []);

  const { sendMessage, isConnected } = useInterviewWS(wsUrl, handleAgentMessage);

  // Effect 1: Read sessionStorage settings
  useEffect(() => {
    const storedTime = sessionStorage.getItem("interviewTime");
    const storedLevel = sessionStorage.getItem("interviewLevel");
    const storedMode = sessionStorage.getItem("interviewMode");

    const parsedDuration = storedTime ? parseInt(storedTime) * 60 : 1200;
    if (storedTime) {
      setDuration(parsedDuration);
      setTimeLeft(parsedDuration);
    } else {
      setTimeLeft(1200);
    }
    if (storedLevel) setLevel(storedLevel);
    if (storedMode) setMode(storedMode);
  }, []);

  // Effect 2: Start interview only after level/mode/duration are resolved
  useEffect(() => {
    if (level && mode && duration && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startInterview(level, mode, duration);
    }
  }, [level, mode, duration]);

  // Effect 3: Start timer when WS connects
  useEffect(() => {
    if (isConnected) {
      setIsRunning(true);
    }
  }, [isConnected]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (isRunning && timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Process speech transcript when mic stops
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
      console.log(`Mic was on for ${(Date.now() - micStartTime) / 1000}s`);
    }
  };

  const handleMicToggle = () => {
    setMicStatus((prev) => {
      if (!prev) startListening();
      else stopListening();
      return !prev;
    });
  };

  const getVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  useEffect(() => {
    if (videoStatus) {
      getVideo();
    } else if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, [videoStatus]);

  const handleSpeak = (t) => {
    if (t) {
      const utterance = new SpeechSynthesisUtterance(stripMarkdown(t));
      utterance.lang = "en-IN";
      utterance.pitch = 1;
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startInterview = async (lvl, md, dur) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/interviews/start/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: "General Interview",
          level: lvl,
          mode: md,
          duration_seconds: dur,
          resumeFileName: localStorage.getItem("resumeFileName"),
        }),
      });

      if (!response.ok) throw new Error(`Error: ${response.statusText}`);

      const data = await response.json();
      setInterviewId(data.id);
      setWsUrl(data.ws_url);

      setTranscriptHistory([{ sender: "ai", text: "Connecting to agent... Starting interview." }]);
      handleSpeak("Welcome. Let's begin your interview.");
    } catch (error) {
      console.error("Error starting interview:", error.message);
      setTranscriptHistory([{
        sender: "ai",
        text: "Sorry, I couldn't start the interview. Please try again.",
      }]);
    }
  };

  const handleSendMessage = async (inputMessage) => {
    if (!inputMessage.trim() || !interviewId || !isConnected) {
      console.warn("Invalid input or not connected.");
      return;
    }
    setTranscriptHistory((prev) => [...prev, { sender: "user", text: inputMessage }]);
    sendMessage({ type: "user_message", text: inputMessage });
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <div className="flex flex-col justify-between items-center text-white min-h-screen relative">
      {/* Top Bar */}
      <div
        className={`fixed top-0 max-w-7xl w-full mx-auto ${
          isTopBarOpen ? "h-28" : "h-8"
        } bg-zinc-900 flex items-center justify-between px-6 transition-all duration-500 ease-in-out rounded-b-xl z-10`}
      >
        <div
          className={`w-full flex ${
            isTopBarOpen ? "opacity-100" : "opacity-0"
          } justify-between items-center mb-4 px-6 transition-opacity duration-300`}
        >
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
            <img src="/clock.png" alt="Clock" className="w-7 h-7" />
            <p className="text-xl font-semibold">{formatTime(timeLeft)}</p>
          </div>
          <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-sm">{isConnected ? "Live" : "Connecting..."}</span>
          <div className="w-96 bg-gray-800 h-12 rounded-full overflow-hidden relative flex items-center my-4">
            <div
              className="bg-blue-600 h-full absolute left-0 top-0 transition-all"
              style={{ width: `${timeLeft !== null ? ((duration - timeLeft) / duration) * 100 : 0}%` }}
            />
            <div className="flex justify-between w-full px-4 relative z-10 items-center">
              <img src="/rocket.png" alt="Rocket" className="w-7 h-7" />
              <img src="/goal.png" alt="Goal" className="w-7 h-7" />
            </div>
          </div>
          <div className="flex items-center gap-6 h-12">
            {/* Analysis link carries interviewId */}
            <Link
              to={interviewId ? `/analysis?interviewId=${interviewId}` : "/analysis"}
              className="bg-yellow-600 text-white font-semibold rounded-lg p-3 flex items-center transition hover:bg-darkblue"
            >
              <img src="/analysis.png" alt="Analysis" className="w-7" />
            </Link>
            <button
              onClick={() => setShowInfo((prev) => !prev)}
              className="bg-blue-600 text-white font-semibold rounded-lg p-3 flex items-center transition hover:bg-darkblue"
            >
              <img src="/help.png" alt="Help" className="w-7" />
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsTopBarOpen((prev) => !prev)}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-zinc-800 px-4 py-2 rounded-full shadow-lg z-30"
        >
          <img
            src="down-arrow.png"
            className={`w-6 transform transition-transform duration-500 ${isTopBarOpen ? "rotate-0" : "rotate-180"}`}
            alt="Toggle"
          />
        </button>
      </div>

      {/* Mic orb */}
      <div className="w-full flex-grow flex justify-center items-center transition-all duration-300">
        <div
          className={`bg-darkblue bg-opacity-30 w-56 h-56 rounded-full hover:scale-105 ${
            micStatus ? "border-green-600 border-4 animate-pulse" : "border-red-600 border-4"
          } flex items-center justify-center`}
        >
          <div className="w-3 h-3 rounded-full shadow-lg" />
        </div>
      </div>

      {/* Draggable video */}
      <Draggable bounds="parent">
        <div className="z-10 bg-darkblue3 w-80 h-60 rounded-2xl absolute bottom-36 right-10">
          {videoStatus ? (
            <video ref={videoRef} autoPlay className="w-full h-full rounded-2xl transform scale-x-[-1]" />
          ) : (
            <div className="w-full h-full flex items-center justify-center shadow-xl">
              <div className="bg-darkblue/20 w-28 h-28 rounded-full" />
            </div>
          )}
        </div>
      </Draggable>

      {/* Chat sidebar */}
      <div
        className={`absolute left-0 top-0 bottom-24 md:w-1/4 w-2/5 z-20 transform transition-transform duration-300 ease-in-out ${
          showMessages ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full bg-zinc-950 border-r border-zinc-800/50 flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue1 animate-pulse" />
                <h1 className="text-lg font-medium text-zinc-100">Interview Chat</h1>
              </div>
              <button
                onClick={() => setShowMessages(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {transcriptHistory.length > 0 ? (
              transcriptHistory.map((item, index) => (
                <div key={index} className={`flex ${item.sender === "ai" ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      item.sender === "ai"
                        ? "bg-zinc-800/75 text-zinc-200 rounded-tl-none"
                        : "bg-blue1 text-white rounded-tr-none"
                    } backdrop-blur-sm shadow-lg`}
                  >
                    {item.text}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <FiMessageSquare className="w-6 h-6 text-zinc-500" />
                <div className="text-zinc-500 text-sm">Start your interview conversation...</div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Type your response..."
                className="flex-grow p-2.5 px-4 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-blue1/50 focus:ring-1 focus:ring-blue1/25"
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
                className="p-2.5 rounded-xl bg-blue1 text-white hover:opacity-80 transition-all"
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

      {/* Code Editor sidebar */}
      <div
        className={`absolute right-0 top-0 bottom-24 md:w-1/4 w-2/5 z-20 transform transition-transform duration-300 ease-in-out ${
          showCodeEditor ? "block" : "hidden"
        }`}
      >
        <div className="h-full bg-zinc-950 border-l border-zinc-800/50 flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-medium text-zinc-100">Code Solution</h1>
              <button
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue1 rounded-lg hover:opacity-80"
                onClick={() => console.log("Code submitted")}
              >
                Submit
              </button>
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
              }}
            />
          </div>
        </div>
      </div>

      {/* Info Modal */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-20 bg-black/60 backdrop-blur-sm ${
          showInfo ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="relative w-[800px] max-h-[85vh] bg-darkblue2 rounded-xl shadow-2xl overflow-y-auto">
          <button
            onClick={() => setShowInfo(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="p-10 pt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white">Master Your Interview</h2>
              <p className="text-gray-400 mt-2">Navigate our advanced interview simulator with confidence</p>
            </div>
            <div className="mb-8 space-y-4">
              {[
                { icon: <Mic className="w-5 h-5" />, title: "Voice Controls", description: "Click to speak, release when finished." },
                { icon: <Camera className="w-5 h-5" />, title: "Video Interface", description: "Toggle camera to practice professional presence." },
                { icon: <Code className="w-5 h-5" />, title: "Code Editor", description: "Access the built-in code editor for technical challenges." },
                { icon: <MessageSquare className="w-5 h-5" />, title: "Chat Interface", description: "Switch to text mode for written responses." },
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer group">
                  <div className="bg-blue1/10 p-3 rounded-xl text-blue1 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <div>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-gray-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
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
            className={`text-white p-3 rounded-2xl hover:bg-darkblue ${micStatus ? "bg-blue1" : "bg-gray-600"}`}
          >
            {micStatus ? <FiMic className="w-8 h-8" /> : <FiMicOff className="w-8 h-8" />}
          </button>
          <button
            onClick={() => setVideoStatus((prev) => !prev)}
            className={`text-white p-3 rounded-2xl hover:bg-darkblue ${videoStatus ? "bg-blue1" : "bg-gray-600"}`}
          >
            {videoStatus ? <FiVideo className="w-8 h-8" /> : <FiVideoOff className="w-8 h-8" />}
          </button>
          <Link to={interviewId ? `/review/${interviewId}` : "/review-interview"} className="text-white p-3 bg-red-600 hover:bg-gray-600 rounded-2xl">
            <FiLogOut className="w-8 h-8" />
          </Link>
        </div>
        <button
          onClick={() => setShowCodeEditor((prev) => !prev)}
          className="bg-orange-600 hover:bg-darkblue text-white text-xl p-3 mr-20 rounded-2xl font-bold"
        >
          <img src="/code.png" alt="" className="w-8" />
        </button>
      </div>
    </div>
  );
}