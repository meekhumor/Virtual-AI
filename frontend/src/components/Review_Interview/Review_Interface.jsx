import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from "../../constants";
import { Link, useParams } from 'react-router-dom';
import { Brain } from 'lucide-react';

const Review_Interface = () => {
  const [questions, setQuestions] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [interviewMeta, setInterviewMeta] = useState(null);
  const { interviewId } = useParams();

  const apiBaseUrl = API_BASE_URL;

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/interviews/${interviewId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch interview data");

        const data = await response.json();
        setInterviewMeta(data);
        setQuestions(data.questions || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchInterview();
  }, [interviewId]);

  const currentQuestion = questions[activeQuestionIndex] || {};

  return (
    <div className="flex min-h-screen max-w-5xl mx-auto gap-5">
      {/* Questions Sidebar */}
      <div className="w-1/2 bg-darkblue bg-opacity-40 p-4 py-12">
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className={`p-4 cursor-pointer ${activeQuestionIndex === idx ? "border-l-2 border-blue1" : ""}`}
              onClick={() => setActiveQuestionIndex(idx)}
            >
              <div className={
                `mb-2 ${activeQuestionIndex === idx ? "text-white" : "text-gray-400"}`
              }>
                QUESTION {idx + 1}
              </div>
              <p className={`text-sm ${activeQuestionIndex === idx ? "text-gray-300" : "text-gray-400"}`}>
                {q.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-2/3 p-6 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/review-interview" className="text-gray-400 hover:text-gray-200 text-sm">&lt; Back to Review</Link>
        </div>

        {/* Interview Metadata */}
        <div className='border-b border-3 mb-8'>
          <h1 className="text-2xl font-bold text-gray-300 mb-2">{interviewMeta?.title || "Interview Review"}</h1>
          <div className="flex items-center text-gray-400 text-sm mb-6">
            <span>{new Date(interviewMeta?.scheduled_at).toLocaleDateString()}</span>
            <span className="mx-2">•</span>
            <span>{interviewMeta?.level}</span>
            <span className="mx-2">•</span>
            <span>{interviewMeta?.mode}</span>
            <span className="mx-2">•</span>
            <span>{Math.floor((interviewMeta?.duration_seconds || 0) / 60)} Min</span>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-300 mb-4">Question</h2>
          <p className="text-gray-400 mb-4">{currentQuestion?.text}</p>
        </div>

        {/* Answer */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-300 mb-4">Response</h2>
          <p className="text-gray-400 mb-4">{currentQuestion?.response?.text || "No response submitted."}</p>
        </div>

        {/* Video */}
        {currentQuestion?.response?.video_url && (
          <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video mb-8 border border-zinc-800">
            <video src={currentQuestion.response.video_url} controls className="w-full h-full">
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* AI Feedback */}
        {currentQuestion?.response?.ai_feedback && (
          <div className="bg-darkblue bg-opacity-40 p-8 rounded-xl shadow-lg">
            <div className="flex justify-center items-center space-x-2 mb-6">
              <Brain className="w-6 h-6 text-white mr-2" />
              <span className="text-white text-2xl">AI Powered Feedback</span>
            </div>
            <p className="text-gray-400 mx-auto mb-6">
              {currentQuestion.response.ai_feedback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Review_Interface;