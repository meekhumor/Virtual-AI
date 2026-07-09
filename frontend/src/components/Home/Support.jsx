import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, Clock, Users, BookOpen, Target, HelpCircle, AlertCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      title: 'Getting Started',
      icon: <MessageCircle className="w-6 h-6 text-blue1" />,
      questions: [
        {
          q: 'How do I start a mock interview?',
          a: 'Head to your Dashboard, select your preferred career field or job role, and click "Start Interview" to open the configuration wizard.'
        },
        {
          q: 'Do I need to sign up to try the platform?',
          a: 'No! You can use our "Guest Login" on the registration page to test the simulator instantly. Guest sessions last for 12 hours.'
        },
        {
          q: 'Can I customize the difficulty of the questions?',
          a: 'Yes, you can choose between Entry, Intermediate, and Senior levels during the interview setup step.'
        }
      ]
    },
    {
      title: 'Audio & Video Setup',
      icon: <AlertCircle className="w-6 h-6 text-blue1" />,
      questions: [
        {
          q: 'Why does the simulator need camera and mic access?',
          a: 'To replicate a real interview experience and record your responses. Your video feed is only recorded in Real Mode.'
        },
        {
          q: 'How do I grant camera and microphone permissions?',
          a: 'When prompted by your browser, click "Allow". If you previously blocked access, click the lock icon in your address bar and reset permissions.'
        },
        {
          q: 'What should I do if my audio is not being detected?',
          a: 'Make sure you are in a quiet room, select the correct input microphone, and test it on our preview page before starting.'
        }
      ]
    },
    {
      title: 'Simulation Modes',
      icon: <BookOpen className="w-6 h-6 text-blue1" />,
      questions: [
        {
          q: 'What is the difference between Practice and Real Mode?',
          a: 'Practice Mode lets you answer questions at your own pace without pressure. Real Mode simulates a live interview: it forces full-screen, records your video, and runs a strict timer.'
        },
        {
          q: "How does 'Auto Submit' work?",
          a: 'By default, the simulator is set to "Manual Submit" where you click to confirm. You can toggle "Auto Submit" to automatically send your answer after 3 to 6 seconds of silence.'
        },
        {
          q: 'Can I type my answers instead of speaking?',
          a: 'Yes! If you prefer not to speak or are in a noisy environment, you can open the chat panel at any time and type your responses directly.'
        }
      ]
    },
    {
      title: 'Performance & AI Analysis',
      icon: <Target className="w-6 h-6 text-blue1" />,
      questions: [
        {
          q: 'How is my interview evaluated?',
          a: 'Our AI analyzes your answers and scores you on communication, technical knowledge, confidence, pace (WPM), and filler words usage.'
        },
        {
          q: 'Where can I view my feedback?',
          a: 'All completed interviews are saved to your Dashboard. Click on any past session in your history to view detailed transcripts, scores, and video recordings.'
        },
        {
          q: 'Is my video and feedback data private?',
          a: 'Yes. All recorded videos, transcripts, and AI feedback reports are securely stored and are only visible to you on your private dashboard.'
        }
      ]
    }
  ];

  // Dynamic filter logic
  const filteredCategories = faqCategories.map(category => {
    const matchedQuestions = category.questions.filter(
      item => 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...category,
      questions: matchedQuestions
    };
  }).filter(category => category.questions.length > 0);

  return (
    <div className="w-full max-w-4xl mb-36 mx-auto px-4">
      <div className="flex flex-col items-center mt-12 mb-10">
        <h1 className="text-white text-3xl font-bold mb-4">Support Center</h1>
        <p className="text-gray-400 text-center max-w-2xl mb-8">
          Find answers to common questions or reach out to our support team for assistance.
        </p>
        
        <div className="relative w-full max-w-xl mb-12">
          <input
            type="text"
            placeholder="Search for help (e.g. webcam, resume, modes)..."
            className="w-full p-3 pl-10 rounded-lg bg-darkblue bg-opacity-40 text-white border border-darkblue/40 focus:ring-2 focus:ring-blue1 focus:border-blue1 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-3.5 text-zinc-500 w-4.5 h-4.5" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category, index) => (
            <div key={index} className="bg-darkblue bg-opacity-40 p-6 rounded-lg border border-darkblue/20">
              <div className="flex items-center gap-3 mb-4">
                <div>{category.icon}</div>
                <h2 className="text-white text-lg font-medium">{category.title}</h2>
              </div>
              <div className="space-y-6">
                {category.questions.map((item, qIndex) => (
                  <div key={qIndex} className="space-y-2">
                    <h3 className="text-blue1 font-medium text-sm md:text-base">{item.q}</h3>
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <p className="text-gray-400 text-base md:text-lg">No matches found for "{searchQuery}". Try another keyword!</p>
          </div>
        )}
      </div>

      <div className="mt-12 bg-darkblue bg-opacity-40 p-6 rounded-lg text-center border border-darkblue/20">
        <HelpCircle className="w-12 h-12 text-blue1 mb-4 mx-auto" />
        <h2 className="text-white text-xl font-medium mb-2">Still need help?</h2>
        <p className="text-gray-400 mb-4">
          Our support team is available to assist you with any questions or concerns.
        </p>
        <Link to="/contact">
          <button className="bg-blue1 text-white rounded-3xl py-3 px-6 hover:bg-darkblue/70 transition-all cursor-pointer">
            Contact Support
          </button>
        </Link>
      </div>
    </div>
  );
}
