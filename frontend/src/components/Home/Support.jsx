import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, Clock, Users, BookOpen, Target, HelpCircle, AlertCircle } from 'lucide-react';

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      title: 'Getting Started',
      icon: <MessageCircle className="w-6 h-6 text-blue1" />,
      questions: [
        {
          q: 'How do I start my first interview simulation?',
          a: 'Navigate to the dashboard and select "General Interviews" or choose a specific job position to begin your practice session.'
        },
        {
          q: 'Can I customize my interview questions?',
          a: 'Yes! Use our "Custom-Built Interviews" feature to create personalized interview sets or take assigned interviews.'
        }
      ]
    },
    {
      title: 'Technical Support',
      icon: <AlertCircle className="w-6 h-6 text-blue1" />,
      questions: [
        {
          q: "What should I do if the webcam isn't working?",
          a: 'First, check your internet connection. If the issue persists, try clearing your browser cache or using a different browser.'
        },
        {
          q: 'How can I improve audio during interviews?',
          a: 'Use a quiet environment, test your microphone beforehand, and ensure you have a stable internet connection.'
        }
      ]
    }
  ];

  return (
    <div className="w-full max-w-4xl mb-36 mx-auto px-4">
      <div className="flex flex-col items-center mt-12 mb-10">
        <h1 className="text-white text-3xl font-bold mb-4">Support Center</h1>
        <p className="text-gray-400 text-center max-w-2xl mb-8">
          Find answers to common questions or reach out to our support team for assistance.
        </p>
        
        <input
          type="text"
          placeholder="Search for help..."
          className="w-full max-w-xl p-3 rounded-lg bg-darkblue bg-opacity-40 text-white border-0 focus:ring-2 focus:ring-blue1 mb-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {faqCategories.map((category, index) => (
          <div key={index} className="bg-darkblue bg-opacity-40 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div>{category.icon}</div>
              <h2 className="text-white text-lg font-medium">{category.title}</h2>
            </div>
            <div className="space-y-6">
              {category.questions.map((item, qIndex) => (
                <div key={qIndex} className="space-y-2">
                  <h3 className="text-white font-medium">{item.q}</h3>
                  <p className="text-gray-400">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-darkblue bg-opacity-40 p-6 rounded-lg text-center">
        <HelpCircle className="w-12 h-12 text-blue1 mb-4 mx-auto" />
        <h2 className="text-white text-xl font-medium mb-2">Still need help?</h2>
        <p className="text-gray-400 mb-4">
          Our support team is available to assist you with any questions or concerns.
        </p>
        <button className="bg-blue1 text-white rounded-3xl py-3 px-6 hover:bg-darkblue/70">
          Contact Support
        </button>
      </div>
    </div>
  );
}
