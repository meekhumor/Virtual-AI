import React, { useState } from 'react';

const Analysis = () => {
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const improvementTips = {
    "Pace": [
      "Take deep breaths between sentences",
      "Practice with a metronome set to 150-160 BPM",
      "Record yourself and count words per minute",
      "Use natural pauses after key points",
      "Aim for 150-160 words per minute"
    ],
    "Filler Words": [
      "Record and count your filler words",
      "Practice replacing 'um' with pauses",
      "Plan your key points beforehand",
      "Take a moment to think before speaking",
      "Use structured transitions instead"
    ],
    "Power Words": [
      "Use action verbs",
      "Include industry-specific terminology",
      "Incorporate quantifiable achievements",
      "Use positive, confident language",
      "Add relevant technical terms"
    ],
    "Negative Tone": [
      "Focus on solutions, not problems",
      "Use positive framing",
      "Highlight opportunities in challenges",
      "Express confidence in abilities",
      "Share enthusiasm for the role"
    ],
    "Pauses": [
      "Practice strategic pausing",
      "Use pauses for emphasis",
      "Take breaths between points",
      "Allow time for information absorption",
      "Create rhythm in your speech"
    ],
    "Eye Contact": [
      "Look directly at the camera",
      "Practice with a friend online",
      "Position your camera at eye level",
      "Minimize screen distractions",
      "Use the 50/70 rule - maintain contact 50-70% of the time"
    ],
    "Lighting": [
      "Face natural light if possible",
      "Use ring light for even illumination",
      "Avoid backlighting",
      "Position light source in front",
      "Test lighting before interviews"
    ]
  };

  const metrics = [
    {
      title: "Pace",
      value: 246,
      unit: "words/min",
      status: "error",
      successMessage: "Your pace is just right! Keep up the steady rhythm.",
      errorMessage: "You're speaking too fast. Try to slow down for better clarity.",
      icon: "analysis/pace.svg"
    },
    {
      title: "Filler Words",
      value: 5,
      unit: "/100 words",
      status: "success",
      successMessage: "You're doing great with filler words. Keep it up!",
      errorMessage: "Reduce filler words for a more concise answer.",
      icon: "analysis/filler-words.svg"
    },
    {
      title: "Power Words",
      value: 0,
      unit: "total",
      status: "error",
      successMessage: "Your answer is strong but could be enhanced with more impactful vocabulary.",
      errorMessage: "This answer needs some charging up. Integrate powerful vocabulary if you can.",
      icon: "analysis/power-words.svg"
    },
    {
      title: "Negative Tone",
      value: 0,
      unit: "total",
      status: "success",
      successMessage: "No negative tone detected! Excellent work.",
      errorMessage: "Watch out for negative language in your tone.",
      icon: "analysis/sad.svg"
    },
    {
      title: "Pauses",
      value: 0,
      unit: "total",
      status: "success",
      successMessage: "No pauses detected. You're maintaining a steady pace!",
      errorMessage: "Make sure to pause occasionally to collect your thoughts.",
      icon: "analysis/pause.svg"
    },
    {
      title: "Eye Contact",
      value: 85,
      unit: "%",
      status: "success",
      successMessage: "Great audience engagement! Keep maintaining strong eye contact.",
      errorMessage: "Make more eye contact with your audience for better connection.",
      icon: "analysis/eye.svg"
    },
    {
      title: "Lighting",
      isQualitative: true,
      value: "Good",
      status: "success",
      successMessage: "Perfect lighting conditions for clear visibility.",
      errorMessage: "The lighting could be improved for clearer visibility.",
      icon: "analysis/bulb.svg",
    }
  ];

  const getValueDisplay = (metric) => {
    if (metric.isQualitative) {
      return (
        <span className={`px-3 py-1 rounded-full text-sm ${
          metric.status === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-400'
        }`}>
          {metric.value}
        </span>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <span className={`text-2xl font-bold ${
          metric.status === 'success' ? 'text-green-500' : 'text-red-500'
        }`}>
          {metric.value}
        </span>
        <span className="text-gray-400 text-sm">{metric.unit}</span>
      </div>
    );
  };

  const handleImprove = (metric) => {
    setSelectedMetric(metric);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-black mt-12 mb-20">
      <div className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-white text-center text-2xl">AI Feedback</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-darkblue bg-opacity-40 p-6 rounded-lg shadow-lg hover:scale-105 cursor-pointer transition-all duration-300">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className={`text-3xl ${
                    metric.status === 'success' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <img src={metric.icon} alt="" className="w-8" />
                  </span>
                  <h3 className="text-white text-lg font-semibold">{metric.title}</h3>
                </div>
                
                <div className="flex items-center gap-3">
                  {getValueDisplay(metric)}
                </div>
                
                <div className="mt-2">
                  <p className="text-gray-400 text-sm">
                    {metric.status === 'success' ? metric.successMessage : metric.errorMessage}
                  </p>
                  {metric.status === 'error' && (
                    <button 
                      onClick={() => handleImprove(metric)}
                      className="text-blue1 text-sm mt-4 hover:text-white rounded-full transition-colors px-4 py-1 border border-blue1 hover:bg-blue1 hover:bg-opacity-20"
                    >
                      IMPROVE
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Improvement Modal */}
        {showModal && selectedMetric && (
        <div 
          className="fixed inset-0 bg-black/60  flex items-center justify-center z-10 px-4 transition-opacity duration-200"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-darkblue2 rounded-2xl p-8 max-w-lg w-full shadow-2xl transform transition-all duration-300 border border-blue1/20"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue1/10 rounded-xl">
                  <img src={selectedMetric.icon} alt="" className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-white text-xl font-bold">
                    Improve {selectedMetric.title}
                  </h2>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-all duration-200 p-2 hover:bg-white/5 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="space-y-4 relative">
              <div className="absolute w-px h-full  left-2"></div>
              {improvementTips[selectedMetric.title].map((tip, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 pl-6 hover:bg-white/5 p-3 rounded-lg transition-all duration-200"
                >
                  <div className="text-blue1 mt-1 bg-darkblue p-1 rounded-full border border-blue1/20 hover:scale-110 transition-transform duration-200">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-gray-300 hover:text-white transition-colors duration-200">{tip}</p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-8 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                <span className="text-blue1">Tip:</span> Practice these regularly for better results
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="bg-blue1 text-white px-4 py-2 rounded-lg hover:bg-opacity-50 transition-all duration-200 flex items-center gap-2 group"
              >
                Got it
                <svg 
                  className="w-4 h-4 transform transition-transform duration-200 group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Analysis;