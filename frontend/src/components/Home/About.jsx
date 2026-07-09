import React from 'react';
import { Github, Linkedin, Mic, Upload, Video, LineChart } from 'lucide-react';

const teamMembers = [
  { name: 'Om Mukherjee', role: 'Student', github: 'https://github.com/meekhumor', linkedin: 'https://www.linkedin.com/in/om-mukherjee7' },
  { name: 'Aryan Yadav', role: 'Student', github: 'https://github.com/Aryan-y-77', linkedin: '#' },
  { name: 'Aman Vatsa', role: 'Student', github: 'https://github.com/amanv13', linkedin: '#' },
];

const features = [
  {
    icon: <Mic className="w-10 h-10 text-blue1" />, 
    title: 'Interactive Simulator',
    description: 'Engage in conversational mock sessions powered by dynamic voice-to-text integration.'
  },
  {
    icon: <Upload className="w-10 h-10 text-blue1" />, 
    title: 'Resume Customization',
    description: 'Upload your resume to trigger questions curated specifically for your stack and background.'
  },
  {
    icon: <Video className="w-10 h-10 text-blue1" />, 
    title: 'Real Mode Session',
    description: 'Practice under pressure with fullscreen restrictions and video responses recording.'
  },
  {
    icon: <LineChart className="w-10 h-10 text-blue1" />, 
    title: 'Deep AI Feedback',
    description: 'Receive immediate metrics on speaking pace (WPM), confidence, filler word count, and feedback.'
  }
];

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 text-white">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">About</h1>
        <p className="text-gray-400 max-w-3xl mx-auto text-sm md:text-base leading-relaxed">
          Built by a team of three passionate developers, Virtual Interviewer is designed to help you excel in your job interviews using AI technology.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {features.map((feature, index) => (
          <div key={index} className="bg-darkblue/40 p-6 rounded-xl border border-darkblue/20 shadow-lg text-center flex flex-col items-center">
            <div className="mb-4 flex justify-center">{feature.icon}</div>
            <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member, index) => (
          <div key={index} className="bg-darkblue/40 p-6 rounded-xl shadow-lg text-center hover:scale-105">
            <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
            <p className="text-gray-400 mb-4">{member.role}</p>
            <div className="flex justify-center gap-4">
              <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <Github className="w-6 h-6" />
              </a>
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
