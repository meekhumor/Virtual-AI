import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, Clock, Users, BookOpen, Target, HelpCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../constants';

// Contact Page Component
export default function Contact(){
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all required fields (Name, Email, Message).' });
      return;
    }

    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Thank you! Your message has been sent successfully.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus({ type: 'error', message: data.error || 'Failed to send message. Please try again.' });
      }
    } catch (err) {
      setSubmitStatus({ type: 'error', message: 'Network error. Please check your connection and try again.' });
    } finally {
      setSubmitting(false);
    }
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
          {submitStatus && (
            <div className={`p-3 rounded-lg text-sm border ${
              submitStatus.type === 'success' 
                ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                : 'bg-red-500/10 border-red-500/50 text-red-400'
            }`}>
              {submitStatus.message}
            </div>
          )}
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-3 rounded-lg bg-darkblue bg-opacity-40 text-white border-0 focus:ring-2 focus:ring-blue1"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={submitting}
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full p-3 rounded-lg bg-darkblue bg-opacity-40 text-white border-0 focus:ring-2 focus:ring-blue1"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={submitting}
          />
          <input
            type="text"
            placeholder="Subject"
            className="w-full p-3 rounded-lg bg-darkblue bg-opacity-40 text-white border-0 focus:ring-2 focus:ring-blue1"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            disabled={submitting}
          />
          <textarea
            placeholder="Your Message"
            rows="5"
            className="w-full p-3 rounded-lg bg-darkblue bg-opacity-40 text-white border-0 focus:ring-2 focus:ring-blue1"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            disabled={submitting}
          />
          <button 
            type="submit"
            disabled={submitting}
            className="bg-blue1 text-white rounded-3xl py-3 px-6 w-full hover:bg-darkblue cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? 'Sending Message...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};