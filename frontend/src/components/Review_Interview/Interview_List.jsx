import axios from 'axios';
import { useState, useEffect } from 'react';

function InterviewList() {
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/interviews/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => setInterviews(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div>
      {interviews.map(interview => (
        <div key={interview.id} className="border-b border-3 mb-8">
          <h1 className="text-2xl font-bold text-gray-300 mb-2">{interview.title}</h1>
          <div className="flex items-center text-gray-400 text-sm mb-6">
            <span>{new Date(interview.scheduled_at).toLocaleDateString()}</span>
            <span className="mx-2">•</span>
            <span>{interview.level}</span>
            <span className="mx-2">•</span>
            <span>{interview.mode}</span>
            <span className="mx-2">•</span>
            <span>{Math.floor(interview.duration_seconds / 60)} Min</span>
          </div>
          {interview.questions.map(q => (
            <div key={q.order}>
              <h2 className="text-gray-300 text-xl font-semibold mb-4">Question</h2>
              <p className="text-gray-400 mb-4">{q.text}</p>
              <h2 className="text-gray-300 text-xl font-semibold mb-4">Response</h2>
              <p className="text-gray-400 mb-4">{q.response.text}</p>
              {q.response.video_url && (
                <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video mb-8">
                  <video src={q.response.video_url} controls />
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default InterviewList;