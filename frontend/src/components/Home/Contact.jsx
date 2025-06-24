import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, Clock, Users, BookOpen, Target, HelpCircle, AlertCircle } from 'lucide-react';

// Contact Page Component
export default function Contact(){
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="w-full max-w-4xl mb-36 mx-auto px-4">
      <div className="flex flex-col items-center mt-12 mb-10">
        <h1 className="text-white text-3xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-400 text-center max-w-2xl">
          Have questions about our interview preparation platform? 
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-darkblue bg-opacity-40 border-0 p-6 rounded-lg">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Mail className="text-blue1 w-6 h-6" />
              <div>
                <h3 className="text-white font-medium">Email</h3>
                <p className="text-gray-400">virtualinterviewer@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="text-blue1 w-6 h-6" />
              <div>
                <h3 className="text-white font-medium">Phone</h3>
                <p className="text-gray-400">+91 7666811982</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="text-blue1 w-6 h-6" />
              <div>
                <h3 className="text-white font-medium">Hours</h3>
                <p className="text-gray-400">Mon-Fri: 9AM-6PM IST</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-3 rounded-lg bg-darkblue bg-opacity-40 text-white border-0 focus:ring-2 focus:ring-blue1"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full p-3 rounded-lg bg-darkblue bg-opacity-40 text-white border-0 focus:ring-2 focus:ring-blue1"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Subject"
            className="w-full p-3 rounded-lg bg-darkblue bg-opacity-40 text-white border-0 focus:ring-2 focus:ring-blue1"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />
          <textarea
            placeholder="Your Message"
            rows="5"
            className="w-full p-3 rounded-lg bg-darkblue bg-opacity-40 text-white border-0 focus:ring-2 focus:ring-blue1"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
          <button className="bg-blue1 text-white rounded-3xl py-3 px-6 w-full hover:bg-darkblue cursor-pointer">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};