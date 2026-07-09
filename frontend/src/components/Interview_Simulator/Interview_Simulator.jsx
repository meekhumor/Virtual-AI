import { useState, useRef, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../constants";
import Draggable from "react-draggable";
import { useNavigate } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import {
  Mic, MicOff, Video, VideoOff, Code, X, LogOut,
  Wifi, WifiOff, ChevronRight, CheckCircle,
  MessageSquare, Bot, User, Play,
} from "lucide-react";
import { useInterviewWS } from "../../hooks/useInterviewWS";

const stripMarkdown = (t) => t.replace(/\*\*(.*?)\*\*/g, "$1").replace(/[#*_`]/g, "");

const formatTime = (s) => {
  if (s === null) return "--:--";
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

function WaveBar({ active, color = "#32ACFC", barCount = 5 }) {
  return (
    <div className="flex items-center justify-center gap-[3px]" style={{ height: 28 }}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            width: 3,
            backgroundColor: active ? color : "#3f3f46",
            height: active ? undefined : 6,
            animation: active ? `waveBar 0.9s ease-in-out ${i * 0.12}s infinite alternate` : "none",
          }}
        />
      ))}
      <style>{`
        @keyframes waveBar {
          0%   { height: 4px; }
          100% { height: 22px; }
        }
      `}</style>
    </div>
  );
}

function SpeakOrb({ icon: Icon, label, active, color, size = 120 }) {
  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div className="relative flex items-center justify-center">
        <div
          className="rounded-full flex flex-col items-center justify-center gap-1 transition-all duration-300"
          style={{
            width: size,
            height: size,
            background: active ? "rgba(50, 172, 252, 0.08)" : "black",
            border: `2px solid ${active ? color : "#3f3f46"}`,
          }}
        >
          <Icon
            size={size * 0.28}
            style={{ color: active ? color : "#71717a" }}
            className="transition-colors duration-300"
          />
          <WaveBar active={active} color={color} barCount={5} />
        </div>
      </div>

      <span
        className="text-xs font-semibold tracking-widest uppercase transition-colors duration-300"
        style={{ color: active ? color : "#52525b" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function Interview_Simulator() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const editorRef = useRef(null);
  const silenceTimer = useRef(null);
  const micTestTimeout = useRef(null);
  const lastTranscriptRef = useRef("");
  const webcamStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [webcamStream, setWebcamStream] = useState(null);

  // session settings 
  const [level, setLevel] = useState("ENTRY");
  const [mode, setMode] = useState("PRACTICE");
  const [duration, setDuration] = useState(1200);
  const [editorLanguage, setEditorLanguage] = useState("python");
  const [silenceTimeout, setSilenceTimeout] = useState(() => {
    const stored = sessionStorage.getItem("silenceTimeout");
    return stored ? parseInt(stored, 10) : 4000; // default 4 seconds
  });

  // interview state   
  const [isStarted, setIsStarted] = useState(false);
  const [interviewId, setInterviewId] = useState(null);
  const [wsUrl, setWsUrl] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [transcriptHistory, setTranscriptHistory] = useState([]);

  // AI/user speaking state 
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [waitingForUser, setWaitingForUser] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [wsError, setWsError] = useState(null);

  // ui panels
  const [showChat, setShowChat] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [videoStatus, setVideoStatus] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [showEndModal, setShowEndModal] = useState(false);

  const [micTestState, setMicTestState] = useState("idle");
  const [micTestTranscript, setMicTestTranscript] = useState("");

  const apiBaseUrl = API_BASE_URL;
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const currentTranscriptRef = useRef("");
  useEffect(() => {
    currentTranscriptRef.current = transcript;
  }, [transcript]);

  // agent message handler
  const handleAgentMessage = useCallback((data) => {
    const { text: agentText, is_question = false } = data;
    setTranscriptHistory((prev) => [...prev, { sender: "ai", text: agentText, is_question }]);
    setProcessing(false);
    speakText(agentText);
  }, []);

  const handleWsError = useCallback((msg) => {
    setWsError(msg);
    setProcessing(false);
  }, []);

  const { sendMessage, isConnected, closeWS } = useInterviewWS(wsUrl, handleAgentMessage, handleWsError);

  // read session settings
  useEffect(() => {
    const storedTime = sessionStorage.getItem("interviewTime");
    const storedLevel = sessionStorage.getItem("interviewLevel");
    const storedMode = sessionStorage.getItem("interviewMode");
    const parsedDuration = storedTime ? parseInt(storedTime) * 60 : 1200;
    setDuration(parsedDuration);
    setTimeLeft(parsedDuration);
    if (storedLevel) setLevel(storedLevel);
    if (storedMode) {
      setMode(storedMode);
      if (storedMode === "REAL") {
        setVideoStatus(true);
      }
    }
  }, []);

  // start timer on ws connect 
  useEffect(() => {
    if (isConnected) {
      setIsRunning(true);
      setWaitingForUser(true);
      setWsError(null);
    }
  }, [isConnected]);

  // countdown
  useEffect(() => {
    let timer;
    if (isRunning && timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    } else if (timeLeft === 0) {
      endInterview("COMPLETED");
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptHistory]);

  // text to speech
  const getPreferredVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    let voice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Google UK English"));
    if (!voice) {
      voice = voices.find(v => v.name.includes("Samantha") || v.name.includes("Siri") || v.name.includes("Daniel"));
    }
    if (!voice) {
      voice = voices.find(v => v.name.includes("Microsoft David") || v.name.includes("Microsoft Zira"));
    }
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith("en-US") || v.lang.startsWith("en-GB"));
    }
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith("en"));
    }
    return voice;
  };

  const speakText = (text) => {
    window.speechSynthesis.cancel();
    if (!text) return;
    const utt = new SpeechSynthesisUtterance(stripMarkdown(text));
    
    const preferredVoice = getPreferredVoice();
    if (preferredVoice) {
      utt.voice = preferredVoice;
      utt.lang = preferredVoice.lang;
    } else {
      utt.lang = "en-US";
    }

    utt.pitch = 1;
    utt.rate = 1.0;
    utt.onstart = () => {
      setAiSpeaking(true);
      setUserSpeaking(false);
      setWaitingForUser(false);
      SpeechRecognition.stopListening();
    };
    const handleTtsEnd = () => {
      setAiSpeaking(false);
      setWaitingForUser(true);
    };
    utt.onend = handleTtsEnd;
    utt.onerror = handleTtsEnd;
    window.speechSynthesis.speak(utt);
  };

  // send message 
  const handleSendMessage = useCallback((inputText, videoUrl) => {
    if (!inputText.trim() || !interviewId || !isConnected) return;
    const code = editorRef.current?.getValue() || "";
    setTranscriptHistory((prev) => [...prev, { sender: "user", text: inputText }]);
    setProcessing(true);
    setWaitingForUser(false);
    sendMessage({ 
      type: "user_message", 
      text: inputText, 
      code: code.trim() || undefined,
      video_url: videoUrl || undefined 
    });
  }, [interviewId, isConnected, sendMessage]);

  const uploadVideoBlob = async (blob) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("video", blob, "response_video.webm");
    const res = await fetch(`${apiBaseUrl}/api/interviews/video/upload/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    const data = await res.json();
    return data.url;
  };

  const stopMediaRecorder = () => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
        resolve(null);
        return;
      }
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        recordedChunksRef.current = [];
        resolve(blob);
      };
      mediaRecorderRef.current.stop();
    });
  };

  const submitUserResponse = useCallback(async () => {
    const finalText = currentTranscriptRef.current.trim();
    if (finalText) {
      SpeechRecognition.stopListening();
      setUserSpeaking(false);
      setProcessing(true); // Show loader during upload
      
      let videoUrl = "";
      if (mode === "REAL") {
        try {
          const videoBlob = await stopMediaRecorder();
          if (videoBlob) {
            videoUrl = await uploadVideoBlob(videoBlob);
          }
        } catch (err) {
          console.error("Video capture/upload error:", err);
        }
      }

      handleSendMessage(finalText, videoUrl);
      resetTranscript();
      lastTranscriptRef.current = "";
    }
  }, [handleSendMessage, resetTranscript, mode]);

  const startMediaRecorder = (stream) => {
    if (!stream) return;
    recordedChunksRef.current = [];
    try {
      const options = { mimeType: "video/webm;codecs=vp9,opus" };
      let recorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      console.log("MediaRecorder started");
    } catch (err) {
      console.error("Failed to start MediaRecorder:", err);
    }
  };

  useEffect(() => {
    if (mode === "REAL" && waitingForUser && isStarted && !aiSpeaking && !processing && webcamStream) {
      startMediaRecorder(webcamStream);
    }
  }, [waitingForUser, isStarted, mode, aiSpeaking, processing, webcamStream]);

  // Auto start mic when its user turn
  useEffect(() => {
    if (!isStarted || !isConnected) return;

    if (waitingForUser && !aiSpeaking && !processing) {
      resetTranscript();
      lastTranscriptRef.current = "";
      SpeechRecognition.startListening({ continuous: true });
    } else {
      SpeechRecognition.stopListening();
      clearTimeout(silenceTimer.current);
    }
  }, [waitingForUser, aiSpeaking, processing, isStarted, isConnected]);

  // silence detection
  useEffect(() => {
    if (!listening || !isStarted || !waitingForUser) return;
    if (!transcript.trim()) return;

    setUserSpeaking(true);

    if (transcript !== lastTranscriptRef.current) {
      lastTranscriptRef.current = transcript;
      clearTimeout(silenceTimer.current);
      if (silenceTimeout > 0) {
        silenceTimer.current = setTimeout(() => {
          submitUserResponse();
        }, silenceTimeout);
      }
    }
  }, [transcript, listening, isStarted, waitingForUser, silenceTimeout, submitUserResponse]);

  useEffect(() => {
    if (!listening) setUserSpeaking(false);
  }, [listening]);

  // webcam 
  useEffect(() => {
    if (videoStatus && isStarted) {
      const constraints = {
        video: true,
        audio: mode === "REAL"
      };
      navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
          webcamStreamRef.current = stream;
          setWebcamStream(stream);
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("Webcam error:", err));
    } else {
      stopVideoTracks();
    }
    return () => { stopVideoTracks(); };
  }, [videoStatus, isStarted, mode]);

  const stopVideoTracks = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((t) => t.stop());
      webcamStreamRef.current = null;
    }
    setWebcamStream(null);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  // unmount cleanup
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      SpeechRecognition.stopListening();
      clearTimeout(silenceTimer.current);
      if (micTestTimeout.current) clearTimeout(micTestTimeout.current);
      stopVideoTracks();
      closeWS();
      if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
    };
  }, []);

  const enterFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => { });
  };

  // mic test
  const handleMicTest = () => {
    if (micTestState === "recording") {
      SpeechRecognition.stopListening();
      if (micTestTimeout.current) clearTimeout(micTestTimeout.current);
      setMicTestState("done");
      setMicTestTranscript(currentTranscriptRef.current || "(nothing heard)");
      resetTranscript();
      return;
    }
    setMicTestState("recording");
    setMicTestTranscript("");
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
    micTestTimeout.current = setTimeout(() => {
      SpeechRecognition.stopListening();
      setMicTestState("done");
      setMicTestTranscript(currentTranscriptRef.current || "(nothing heard)");
      resetTranscript();
    }, 5000);
  };

  // start interview
  const handleStartInterview = async () => {
    if (isStarted) return;
    setIsStarted(true);
    if (mode === "REAL") {
      setVideoStatus(true);
    }
    enterFullscreen();
    try {
      const res = await fetch(`${apiBaseUrl}/api/interviews/start/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: "General Interview",
          level,
          mode,
          duration_seconds: duration,
          resumeFileName: localStorage.getItem("resumeFileName"),
        }),
      });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setInterviewId(data.id);
      setWsUrl(data.ws_url);
      setTranscriptHistory([{ sender: "ai", text: "Connecting to interviewer…" }]);
    } catch (err) {
      console.error("Start failed:", err);
      setTranscriptHistory([{ sender: "ai", text: "Couldn't start the interview. Please try again." }]);
      setIsStarted(false);
    }
  };

  const patchStatus = useCallback(async (newStatus) => {
    if (!interviewId) return;
    try {
      await fetch(`${apiBaseUrl}/api/interviews/${interviewId}/status/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error("Status patch failed:", e);
    }
  }, [interviewId, apiBaseUrl]);

  // End interview
  const endInterview = useCallback(async (status = "COMPLETED") => {
    setIsRunning(false);
    window.speechSynthesis.cancel();
    SpeechRecognition.stopListening();
    clearTimeout(silenceTimer.current);
    closeWS();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
    stopVideoTracks();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
    await patchStatus(status);
    if (interviewId) {
      navigate(`/review/${interviewId}`);
    } else {
      navigate("/review-interview");
    }
  }, [interviewId, navigate, patchStatus, closeWS]);

  const timePercent = timeLeft !== null ? ((duration - timeLeft) / duration) * 100 : 0;
  const timerColor = timeLeft !== null && timeLeft < 120 ? "#f87171" : "#e4e4e7";

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden antialiased">

      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-black border-b border-darkblue z-20 shrink-0">
        {/* ws status*/}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${isConnected ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            {isConnected ? "Live" : "Disconnected"}
          </div>
          {wsError && (
            <span className="text-xs text-red-400 bg-red-950/50 px-2 py-0.5 rounded-full">{wsError}</span>
          )}
        </div>

        {/* Countdown */}
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-2xl font-bold tracking-widest" style={{ color: timerColor }}>
            {formatTime(timeLeft)}
          </span>
          <div className="w-40 h-0.5 bg-black1 border border-darkblue/40 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${timePercent}%`,
                background: timeLeft !== null && timeLeft < 120
                  ? "linear-gradient(90deg, #ef4444, #f97316)"
                  : "linear-gradient(90deg, #32ACFC, #0F4C75)",
              }}
            />
          </div>
        </div>

        {/* Auto submit choices*/}
        <div className="flex items-center gap-3">
          {isStarted && (
            <div className="flex items-center gap-1.5 bg-black1 border border-darkblue/60 px-3 py-1.5 rounded-full text-xs text-zinc-400">
              <span className="text-xs tracking-wider text-zinc-500 hidden md:inline">Auto Submit:</span>
              <select
                value={silenceTimeout}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setSilenceTimeout(val);
                  sessionStorage.setItem("silenceTimeout", val);
                }}
                className="bg-transparent text-zinc-300 text-xs cursor-pointer border-none outline-none focus:outline-none focus:ring-0 p-0 m-0"
              >
                <option value={3000} className="bg-black2 text-zinc-300">3s</option>
                <option value={4000} className="bg-black2 text-zinc-300">4s</option>
                <option value={5000} className="bg-black2 text-zinc-300">5s</option>
                <option value={6000} className="bg-black2 text-zinc-300">6s</option>
                <option value={0} className="bg-black2 text-zinc-300">Manual</option>
              </select>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* chat panel */}
        <div
          className="flex flex-col border-r border-darkblue bg-black shrink-0 transition-[width] duration-300 overflow-hidden"
          style={{ width: showChat ? 320 : 0 }}
        >
          {showChat && (
            <>
              <div className="px-4 py-3 border-b border-darkblue bg-black flex items-center gap-2 shrink-0">
                <MessageSquare size={14} className="text-blue1" />
                <span className="text-sm font-semibold text-zinc-200">Transcript</span>
                <span className="ml-auto text-xs text-zinc-600">{transcriptHistory.length} messages</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {transcriptHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-600 text-sm text-center">
                    <MessageSquare size={28} strokeWidth={1.5} />
                    <p>Interview conversation<br />will appear here</p>
                  </div>
                )}
                {transcriptHistory.map((item, i) => (
                  <div key={i} className={`flex ${item.sender === "ai" ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${item.sender === "ai"
                        ? "bg-black1 border border-darkblue/40 text-zinc-200 rounded-tl-sm"
                        : "bg-blue1/80 border border-blue1/20 text-white rounded-tr-sm"
                        }`}
                    >
                      {item.text}
                      {item.is_question && item.sender === "ai" && (
                        <div className="mt-1 text-[10px] text-blue1/80 font-medium uppercase tracking-wider">Question</div>
                      )}
                    </div>
                  </div>
                ))}
                {processing && (
                  <div className="flex justify-start">
                    <div className="bg-black1 border border-darkblue/40 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* text input fallback  */}
              {isStarted && (
                <div className="p-3 border-t border-darkblue bg-black shrink-0">
                  <div className="flex gap-2 items-center">
                    <textarea
                      rows={1}
                      placeholder="Type your response..."
                      className="flex-1 resize-none py-2 px-3 rounded-xl bg-black border border-darkblue text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:border-blue1 focus:ring-1 focus:ring-blue1/20"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && textInput.trim()) {
                          e.preventDefault();
                          handleSendMessage(textInput.trim());
                          setTextInput("");
                        }
                      }}
                    />
                    <button
                      onClick={() => { if (textInput.trim()) { handleSendMessage(textInput.trim()); setTextInput(""); } }}
                      disabled={!textInput.trim() || !isConnected}
                      className="p-2.5 rounded-xl bg-blue1 text-white hover:bg-darkblue transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Centre panel */}
        <div className="flex-1 flex flex-col items-center justify-center gap-10 relative p-8 min-w-0 overflow-hidden">

          {!isStarted ? (
            <div
              className="max-w-md w-full rounded-3xl p-8 text-center bg-black border border-darkblue shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-zinc-100 mb-5">Ready to Begin?</h2>
              <p className="text-xs text-zinc-400 leading-relaxed text-center mb-6">
                The mic activates automatically when it's your turn. Just speak naturally, it detects silence and submits your answer.
              </p>

              <div className="mb-6 p-4 rounded-2xl text-left bg-black border border-darkblue/60">
                <label className="text-xs text-zinc-400 font-medium block mb-3 px-2">
                  Auto Submit after Silence
                </label>
                <select
                  value={silenceTimeout}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setSilenceTimeout(val);
                    sessionStorage.setItem("silenceTimeout", val);
                  }}
                  className="w-full text-xs rounded-md py-2 px-1 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue1/30 bg-black2 border border-darkblue"
                >
                  <option value={3000}>3 seconds (Fast)</option>
                  <option value={4000}>4 seconds (Medium - Recommended)</option>
                  <option value={5000}>5 seconds (Relaxed)</option>
                  <option value={6000}>6 seconds (Slow)</option>
                  <option value={0}>Manual Submit Only (Disable Auto Submit)</option>
                </select>
              </div>

              {/* Mic test */}
              <div className="mb-6 p-3 rounded-2xl text-left bg-black2 border border-darkblue/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-400 font-medium px-3">Test your microphone</span>
                  {micTestState === "done" && <CheckCircle size={13} className="text-emerald-400" />}
                </div>
                <button
                  onClick={handleMicTest}
                  disabled={!browserSupportsSpeechRecognition}
                  className={`w-full py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    !browserSupportsSpeechRecognition
                      ? "bg-zinc-800 text-zinc-600 border border-zinc-700 cursor-not-allowed"
                      : micTestState === "recording"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse"
                      : "bg-black border border-darkblue text-zinc-300 hover:bg-black1"
                  }`}
                >
                  {micTestState === "recording"
                    ? <><Mic size={13} className="animate-pulse" /> Listening… tap again to stop</>
                    : <><Mic size={13} /> Tap &amp; speak to test mic</>}
                </button>
                {!browserSupportsSpeechRecognition && (
                  <div className="text-[11px] text-rose-400 mt-2 text-center flex flex-col gap-1.5 bg-black/40 p-2.5 rounded-xl border border-rose-500/20">
                    <p className="font-semibold">Speech recognition is disabled or unsupported in this browser.</p>
                    <p className="text-zinc-400">
                      <strong>Firefox Notice:</strong> Firefox has native Web Speech engine limitations on many platforms. For full voice features, we recommend using a Chromium-based browser (like <strong>Chrome, Brave, or Edge</strong>) or <strong>Safari</strong>.
                    </p>
                  </div>
                )}
                {micTestState === "done" && (
                  <p className="text-xs text-zinc-500 mt-2 rounded-md py-2 px-3 font-mono break-words bg-black">
                    Heard: &quot;{micTestTranscript}&quot;
                  </p>
                )}
              </div>

              <button
                onClick={handleStartInterview}
                className="w-full py-3 px-6 rounded-3xl font-semibold text-sm text-white flex items-center justify-center bg-blue1 hover:bg-blue2 duration-300"
              >
                Start Interview
              </button>
            </div>
          ) : (
            <>
              {/* Status text */}
              <div className="text-center">
                <p className="text-md font-medium text-zinc-400">
                  {processing
                    ? "AI is thinking…"
                    : aiSpeaking
                      ? "AI is speaking"
                      : userSpeaking
                        ? "Listening to you…"
                        : waitingForUser
                          ? "Your turn, speak naturally"
                          : "Connecting…"}
                </p>
                {waitingForUser && !processing && !aiSpeaking && (
                  <p className="text-sm text-zinc-600 mt-1">
                    {silenceTimeout > 0 
                      ? `Mic is active, pauses over ${silenceTimeout/1000}s auto-submit`
                      : "Mic is active, submit manually when done"}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-16 xl:gap-28">
                {/* AI Orb */}
                <SpeakOrb
                  icon={Bot}
                  label="Virtual Ai"
                  active={aiSpeaking || processing}
                  color="#32ACFC"
                  size={160}
                />

                {/* User Orb */}
                <SpeakOrb
                  icon={User}
                  label="You"
                  active={userSpeaking}
                  color="#10b981"
                  size={160}
                />
              </div>

              {/* Live transcript preview  */}
              {waitingForUser && !aiSpeaking && !processing && (
                <div className="flex flex-col items-center gap-3 w-full max-w-sm">
                  {transcript.trim() && (
                    <div
                      className="w-full rounded-2xl px-4 py-3 text-center transition-all bg-emerald-500/10 border border-emerald-500/20"
                    >
                      <p className="text-sm text-emerald-400 font-semibold mb-1 uppercase tracking-wider">Hearing you speak…</p>
                      <p className="text-sm text-zinc-200 leading-relaxed font-medium">&ldquo;{transcript}&rdquo;</p>
                      <button
                        onClick={submitUserResponse}
                        className="mt-3 px-6 py-2 bg-black border border-blue1 hover:bg-blue1 hover:text-black text-white rounded-full text-xs font-semibold transition-all duration-300 active:scale-95"
                      >
                        Submit Response
                      </button>
                    </div>
                  )}
                  {silenceTimeout === 0 && !transcript.trim() && (
                    <p className="text-sm text-zinc-500 bg-black1 border border-darkblue/40 px-3 py-1.5 rounded-full">
                      Start speaking. Your voice response will be shown here.
                    </p>
                  )}
                </div>
              )}

              {/* Draggable webcam */}
              {videoStatus && (
                <Draggable bounds="parent">
                  <div className="absolute bottom-4 right-4 z-10 cursor-move select-none">
                    <div className="w-52 h-40 rounded-2xl overflow-hidden shadow-2xl" style={{ border: "2px solid rgba(255,255,255,0.1)" }}>
                      <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform scale-x-[-1]" />
                    </div>
                  </div>
                </Draggable>
              )}
            </>
          )}
        </div>

        {/* Code editor panel  */}
        <div
          className="flex flex-col border-l border-darkblue bg-black shrink-0 transition-all duration-300 overflow-hidden"
          style={{ width: showCodeEditor ? 420 : 0 }}
        >
          {showCodeEditor && (
            <>
              <div className="px-4 py-3 border-b border-darkblue bg-black flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Code size={14} className="text-blue1" />
                  <span className="text-sm font-semibold text-zinc-200">Code Editor</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={editorLanguage}
                    onChange={(e) => setEditorLanguage(e.target.value)}
                    className="text-xs rounded-md py-1 px-2 text-zinc-300 bg-black2 border border-darkblue cursor-pointer"
                  >
                    {["Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Rust", "Sql"].map((l) => (
                      <option key={l} value={l} style={{ background: "#0F1D26" }}>{l}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const code = editorRef.current?.getValue() || "";
                      if (code.trim() && isConnected) {
                        handleSendMessage(`[Code — ${editorLanguage}]\n${code}`);
                      }
                    }}
                    className="px-4 py-1 text-xs font-medium text-white rounded-md bg-blue1 hover:bg-blue2 transition-all duration-300"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setShowCodeEditor(false)}
                    className="text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                <Editor
                  height="100%"
                  language={editorLanguage}
                  defaultValue="# Write your solution here"
                  theme="vs-dark"
                  onMount={(editor) => { editorRef.current = editor; }}
                  options={{
                    fontSize: 13,
                    lineNumbers: "on",
                    automaticLayout: true,
                    minimap: { enabled: false },
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    padding: { top: 12 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    wordWrap: "on",
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom bar  */}
      <footer
        className="flex items-center justify-between px-6 py-3 shrink-0 bg-black border-t border-darkblue"
      >
        {/* Chat button  */}
        <div className="flex items-center gap-2">
          <button
            id="btn-chat-toggle"
            onClick={() => setShowChat((p) => !p)}
            title="Toggle Interview Chat"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: showChat ? "rgba(50, 172, 252, 0.15)" : "rgba(27, 38, 44, 0.5)",
              border: showChat ? "1px solid rgba(50, 172, 252, 0.35)" : "1px solid #073757",
              color: showChat ? "#32ACFC" : "#71717a",
            }}
          >
            <MessageSquare size={15} />
            <span className="hidden sm:inline">Chat</span>
          </button>
        </div>

        {/* End interview button  */}
        <button
          id="btn-end-interview"
          onClick={() => setShowEndModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.25)";
            e.currentTarget.style.color = "#fca5a5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.12)";
            e.currentTarget.style.color = "#f87171";
          }}
        >
          <LogOut size={15} />
          <span>End Interview</span>
        </button>

        {/* Code editor and camera button  */}
        <div className="flex items-center gap-2">
          <button
            id="btn-camera-toggle"
            onClick={() => {
              if (mode === "REAL") return;
              setVideoStatus((p) => !p);
            }}
            disabled={mode === "REAL"}
            title={mode === "REAL" ? "Camera required in Real mode" : videoStatus ? "Turn camera off" : "Turn camera on"}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: videoStatus ? "rgba(50, 172, 252, 0.15)" : "rgba(27, 38, 44, 0.5)",
              border: videoStatus ? "1px solid rgba(50, 172, 252, 0.35)" : "1px solid #073757",
              color: videoStatus ? "#32ACFC" : "#71717a",
              opacity: mode === "REAL" ? 0.6 : 1,
              cursor: mode === "REAL" ? "not-allowed" : "pointer"
            }}
          >
            {videoStatus ? <Video size={15} /> : <VideoOff size={15} />}
            <span className="hidden sm:inline">{videoStatus ? "Cam On" : "Camera"}</span>
          </button>

          <button
            id="btn-code-toggle"
            onClick={() => setShowCodeEditor((p) => !p)}
            title="Toggle Code Editor"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: showCodeEditor ? "rgba(249,115,22,0.15)" : "rgba(27, 38, 44, 0.5)",
              border: showCodeEditor ? "1px solid rgba(249,115,22,0.35)" : "1px solid #073757",
              color: showCodeEditor ? "#fb923c" : "#71717a",
            }}
          >
            <Code size={15} />
            <span className="hidden sm:inline">Code</span>
          </button>
        </div>
      </footer>

      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl bg-black2 border border-darkblue">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <LogOut size={20} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 text-center mb-2">End Interview?</h3>
            <p className="text-zinc-400 text-sm text-center mb-6">
              This will mark your interview as completed and take you to the review page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-zinc-300 transition-all bg-black1 border border-darkblue/60 hover:bg-black2"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowEndModal(false); endInterview("COMPLETED"); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}
              >
                End Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}