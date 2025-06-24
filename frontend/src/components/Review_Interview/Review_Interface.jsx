import React, {useState} from 'react';
import {Link} from "react-router-dom";
import { Brain, Trash2 } from 'lucide-react';


const Review_Interface = () => {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const questions = [
    {
      text: "Can you tell us a little about yourself and what interests you about this entry level position?",
      answer: "I have a background in computer science with a passion for problem-solving. I'm particularly excited about this role because it aligns with my skills and offers opportunities for growth."
    },
    {
      text: "Can you talk about any relevant coursework or projects that you feel makes you a good fit for this entry level position?",
      answer: "During my studies, I worked on a group project to build a web application that optimized task management. It required collaboration and applying concepts from my coursework in software engineering."
    },
    {
      text: "How do you approach continuous learning and professional development in the context of an entry-level position?",
      answer: "I stay updated by taking online courses, attending workshops, and seeking mentorship opportunities. I also actively seek feedback to improve my skills."
    },
    {
      text: "Describe a time when you had to learn a new skill quickly to complete a task or project. What was the outcome?",
      answer: "In my final semester, I had to learn React for a project within two weeks. Despite the steep learning curve, I delivered a fully functional prototype on time, which received excellent feedback."
    },
    {
      text: "When working on a team, how do you handle disagreements or conflicts with team members?",
      answer: "I believe in open communication and actively listening to all perspectives. In a previous project, I helped mediate a conflict by suggesting a compromise that incorporated ideas from both parties."
    },
    {
      text: "How do you prioritize tasks and how do you handle it when your priorities shift unexpectedly?",
      answer: "I use tools like Trello to prioritize tasks and focus on deadlines. When priorities shift, I reassess the timeline and communicate with team members to stay aligned."
    },
    {
      text: "Do you have any questions for us?",
      answer: "Yes, I would love to know more about the company's mentorship programs and growth opportunities for entry-level employees."
    }
  ];
  

  return (
    <div className="flex min-h-screen max-w-5xl mx-auto gap-5">
      {/* Questions */}
      <div className="w-1/2 bg-darkblue bg-opacity-40 p-4 py-12">
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={index}
              className={`p-4 cursor-pointer ${activeQuestionIndex === index ? "border-l-2 border-blue1" : ""}`}
              onClick={() => setActiveQuestionIndex(index)}
            >
              <div className={` mb-2 ${
                activeQuestionIndex === index
                  ? " text-white"
                  : " text-gray-400"
              }`}>
                QUESTION {index + 1}
              </div>
              <p className={`text-sm ${
                activeQuestionIndex === index
                  ? " text-gray-300 "
                  : " text-gray-400"
              }`}>{question.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-2/3 p-6 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Link to="/dashboard" className="text-gray-400 hover:text-gray-200 cursor-pointer text-sm">&lt; Back to Dashboard</Link>
          </div>
        </div>

        {/* Title */}
        <div className='border-b border-3 mb-8'>
          <h1 className="text-2xl font-bold text-gray-300 mb-2">General Interview</h1>
          <div className="flex items-center text-gray-400 text-sm mb-6">
            <span>2 Months Ago</span>
            <span className="mx-2">•</span>
            <span>Entry Level</span>
            <span className="mx-2">•</span>
            <span>Real Mode</span>
            <span className="mx-2">•</span>
            <span>2 Min</span>
          </div>
        </div>

        {/* Question Display */}
        <div className="mb-6">
          <h2 className="text-gray-300 text-xl font-semibold mb-4">Question</h2>
          <p className="text-gray-400 mb-4">
            {questions[activeQuestionIndex].text}
          </p>
        </div>

        {/* Answer Display */}
        <div className="mb-6">
          <h2 className="text-5 text-xl font-semibold mb-4 text-gray-300">Response</h2>
          <p className="text-gray-400 mb-4">
            {questions[activeQuestionIndex].answer}
          </p>
        </div>

        {/* Video */}
        <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video mb-8">
          <div className="absolute bottom-0 left-0 right-0 flex justify-end items-center  p-4 bg-gradient-to-t from-gray-900/50">
            <div className="text-white text-sm ">
              00:00 / 00:19
            </div>
          </div>
        </div>

        {/* AI Feedback Section */}
        <div className="bg-darkblue bg-opacity-40 p-8 rounded-xl shadow-lg">
          <div className="flex justify-center items-center space-x-2 mb-6">
            <Brain className="w-6 h-6 text-white mr-2" />
            <span className="text-white text-2xl">AI Powered Feedback</span>
          </div>
          <p className="text-gray-400 text-center mb-6 text-sm">
            Gain valuable insight with AI-powered feedback. With scores for filler words,
            negative tone, power words, and much more.
          </p>
          <div className="flex justify-center">
            <Link to="/analysis" className="border-gray-400 text-gray-200 border-2 hover:border-gray-300 hover:text-gray-100 text-sm py-3 px-6 rounded-xl ">
              Generate AI Feedback
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Review_Interface;