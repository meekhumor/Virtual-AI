import React from 'react';
import { Users, Target, BookOpen, Code, Github, Linkedin } from 'lucide-react';

const teamMembers = [
  { name: 'Om Mukherjee', role: 'Student', github: '#', linkedin: '#' },
  { name: 'Aryan Yadav', role: 'Student', github: '#', linkedin: '#' },
  { name: 'Aman Vatsa', role: 'Student', github: '#', linkedin: '#' },
];

const features = [
  {
    icon: <Users className="w-10 h-10 text-blue1" />, 
    title: 'AI-Powered Interviews',
    description: 'Advanced AI-driven mock interviews tailored to your career needs.'
  },
  {
    icon: <Target className="w-10 h-10 text-blue1" />, 
    title: 'Personalized Feedback',
    description: 'Get real-time AI feedback to improve your interview skills.'
  },
  {
    icon: <BookOpen className="w-10 h-10 text-blue1" />, 
    title: 'Comprehensive Guide',
    description: 'Access guides, sample answers, and real-world interview questions.'
  }
];

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-white">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">About</h1>
        <p className="text-gray-400 max-w-3xl mx-auto">
          Built by a team of four passionate developers, Virtual Interviewer is designed to help professionals excel in their job interviews using cutting-edge AI technology.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <div key={index} className="bg-darkblue/40 p-6 rounded-xl shadow-lg text-center">
            <div className="mb-4 flex justify-center">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
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
