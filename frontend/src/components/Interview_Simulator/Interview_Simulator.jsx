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

const stripMarkdown = (text) => {
  return text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/[#*_`]/g, "");
};

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
  const [timeLeft, setTimeLeft] = useState(1200);
  const [isRunning, setIsRunning] = useState(false);
  const [level, setLevel] = useState("ENTRY");
  const [mode, setMode] = useState("PRACTICE");
  const [duration, setDuration] = useState(1200);
  const [micStartTime, setMicStartTime] = useState(null);
  const [shouldProcessTranscript, setShouldProcessTranscript] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewId, setInterviewId] = useState(null);
  const [questions, setQuestions] = useState([]);

  // Vite env var access with fallback
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    const storedTime = sessionStorage.getItem("interviewTime");
    const storedLevel = sessionStorage.getItem("interviewLevel");
    const storedMode = sessionStorage.getItem("interviewMode");

    if (storedTime) {
      setDuration(parseInt(storedTime));
      setTimeLeft(parseInt(storedTime));
    }
    if (storedLevel) setLevel(storedLevel);
    if (storedMode) setMode(storedMode);

    startInterview();
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
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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
    setIsRunning((prev) => !prev);
    setMicStatus((prev) => {
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

  const startInterview = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/interviews/start/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: "General Interview",
          level: level,
          mode: mode,
          duration_seconds: duration,
          resumeFileName: localStorage.getItem("resumeFileName"),
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setInterviewId(data.id);
      setQuestions(data.questions || []);
      if (data.questions && data.questions.length > 0) {
        setTranscriptHistory([{ sender: "ai", text: data.questions[0].text }]);
        handleSpeak(data.questions[0].text);
      }
    } catch (error) {
      console.error("Error starting interview:", error.message);
      setTranscriptHistory((prevHistory) => [
        ...prevHistory,
        {
          sender: "ai",
          text: "Sorry, I couldn't start the interview. Please try again.",
        },
      ]);
    }
  };

  const handleSendMessage = async (inputMessage) => {
    if (!inputMessage.trim() || !interviewId || !questions[currentQuestionIndex]) {
      console.warn("Invalid input, interview ID, or question.");
      return;
    }

    setTranscriptHistory((prevHistory) => [
      ...prevHistory,
      { sender: "user", text: inputMessage },
    ]);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await fetch(
        `${apiBaseUrl}/api/interviews/${interviewId}/questions/${questions[currentQuestionIndex].id}/response/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            text: inputMessage,
            video_url:
              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            resumeFileName:
              localStorage.getItem("resumeFileName") || "resume.pdf",
          }),
        }
      );
      if (response.status === 429) {
        console.log("Rate limit hit, retrying in 2s");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return handleSendMessage(inputMessage);
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      const aiFeedback = result.ai_feedback || "Thank you for your response.";
      handleSpeak(aiFeedback);
      setTranscriptHistory((prevHistory) => [
        ...prevHistory,
        { sender: "ai", text: aiFeedback },
      ]);

      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex((prev) => prev + 1);
        const nextQuestion = questions[currentQuestionIndex + 1].text;
        handleSpeak(nextQuestion);
        setTranscriptHistory((prevHistory) => [
          ...prevHistory,
          { sender: "ai", text: nextQuestion },
        ]);
      } else {
        setTranscriptHistory((prevHistory) => [
          ...prevHistory,
          { sender: "ai", text: "Interview completed. Thank you!" },
        ]);
        setIsRunning(false);
      }
    } catch (error) {
      console.error("Error submitting response:", error.message);
      setTranscriptHistory((prevHistory) => [
        ...prevHistory,
        {
          sender: "ai",
          text: "Sorry, I couldn't process your response. Please try again.",
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col justify-between items-center text-white min-h-screen relative">
      <div className={`fixed top-0 max-w-7xl w-full mx-auto ${isTopBarOpen ? "h-28" : "h-8"} bg-zinc-900 flex items-center justify-between px-6 transition-all duration-500 ease-in-out rounded-b-xl z-10`}>
        <div className={`w-full flex ${isTopBarOpen ? "opacity-100" : "opacity-0"} justify-between items-center mb-4 px-6 transition-opacity duration-300`}>
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
            <img src="/clock.png" alt="Clock" className="w-7 h-7" />
            {timeLeft !== null && <p className="text-xl font-semibold">{formatTime(timeLeft)}</p>}
          </div>
          <div className="w-96 bg-gray-800 h-12 rounded-full overflow-hidden relative flex items-center my-4">
            <div className="bg-blue-600 h-full absolute left-0 top-0" style={{ width: `${((duration - timeLeft) / duration) * 100}%` }}></div>
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