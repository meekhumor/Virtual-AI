import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from "../../constants";
import { useSearchParams } from 'react-router-dom';

const Analysis = () => {
  const [searchParams] = useSearchParams();
  const interviewId = searchParams.get('interviewId');

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const apiBaseUrl = API_BASE_URL;
  const token = localStorage.getItem('token');

  const improvementTips = {
    "Pace": [
      "Take deep breaths between sentences",
      "Practice with a metronome set to 150-160 BPM",
      "Record yourself and count words per minute",
      "Use natural pauses after key points",
      "Aim for 150-160 words per minute",
    ],
    "Filler Words": [
      "Record and count your filler words",
      "Practice replacing 'um' with pauses",
      "Plan your key points beforehand",
      "Take a moment to think before speaking",
      "Use structured transitions instead",
    ],
    "Power Words": [
      "Use action verbs",
      "Include industry-specific terminology",
      "Incorporate quantifiable achievements",
      "Use positive, confident language",
      "Add relevant technical terms",
    ],
    "Communication": [
      "Structure answers using STAR method",
      "Be concise and direct",
      "Avoid over-explaining",
      "Use clear, specific examples",
      "Practice active listening",
    ],
    "Technical": [
      "Review core concepts regularly",
      "Practice explaining complex ideas simply",
      "Use correct terminology",
      "Walk through your reasoning",
      "Ask clarifying questions when unsure",
    ],
    "Confidence": [
      "Practice with mock interviews",
      "Prepare and rehearse key stories",
      "Use positive body language",
      "Speak at a steady pace",
      "Remember it's a conversation, not a test",
    ],
  };

  const fetchAnalysis = async () => {
    if (!interviewId) {
      setError('No interview ID provided. Please navigate from an interview session.');
      return;
    }

    setLoading(true);
    setError(null);

    // Try GET first (cached result)
    try {
      const getRes = await fetch(`${apiBaseUrl}/api/interviews/${interviewId}/analysis/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (getRes.ok) {
        const data = await getRes.json();
        setAnalysis(data);
        setLoading(false);
        return;
      }
    } catch (_) {}

    // Fall back to POST (generate new analysis)
    try {
      const postRes = await fetch(`${apiBaseUrl}/api/interviews/${interviewId}/analyze/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (postRes.ok) {
        const data = await postRes.json();
        setAnalysis(data);
      } else {
        const errData = await postRes.json();
        setError(errData.detail || 'Failed to generate analysis.');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  useEffect(() => {
    if (interviewId) fetchAnalysis();
  }, [interviewId]);

  // Helper: score (0-10) → status
  const scoreStatus = (score) => (score !== null && score >= 6 ? 'success' : 'error');

  const scoreCard = (label, score, tipKey) => ({
    title: label,
    value: score !== null ? score.toFixed(1) : '—',
    unit: '/ 10',
    status: scoreStatus(score),
    tipKey,
  });

  const metricCards = analysis
    ? [
        scoreCard('Overall Score', analysis.overall_score, null),
        scoreCard('Communication', analysis.communication_score, 'Communication'),
        scoreCard('Technical', analysis.technical_score, 'Technical'),
        scoreCard('Confidence', analysis.confidence_score, 'Confidence'),
        {
          title: 'Pace',
          value: analysis.pace_wpm !== null ? `${Math.round(analysis.pace_wpm)}` : '—',
          unit: 'words/min',
          status: analysis.pace_wpm && analysis.pace_wpm > 180 ? 'error' : 'success',
          tipKey: 'Pace',
        },
        {
          title: 'Filler Words',
          value: analysis.filler_word_count !== null ? analysis.filler_word_count : '—',
          unit: 'total',
          status: analysis.filler_word_count > 5 ? 'error' : 'success',
          tipKey: 'Filler Words',
        },
        {
          title: 'Power Words',
          value: analysis.power_word_count !== null ? analysis.power_word_count : '—',
          unit: 'total',
          status: analysis.power_word_count > 3 ? 'success' : 'error',
          tipKey: 'Power Words',
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-black mt-12 mb-20">
      <div className="max-w-4xl mx-auto space-y-10 px-4">
        <h1 className="text-white text-center text-2xl">AI Feedback</h1>

        {/* No interview ID */}
        {!interviewId && (
          <div className="text-center text-gray-400 py-20">
            <p className="text-lg">No interview selected.</p>
            <p className="text-sm mt-2">Navigate here from an interview session via the Analysis button.</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-blue1 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Generating AI analysis... this may take a moment.</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchAnalysis}
              className="bg-blue1 text-white px-6 py-2 rounded-lg hover:opacity-80 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Generate button (when no analysis yet and not loading) */}
        {interviewId && !analysis && !loading && !error && (
          <div className="text-center py-10">
            <button
              onClick={fetchAnalysis}
              className="bg-blue1 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:opacity-80 transition"
            >
              Generate Analysis
            </button>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !loading && (
          <>
            {/* Summary */}
            {analysis.summary && (
              <div className="bg-darkblue bg-opacity-40 p-6 rounded-lg shadow-lg">
                <h2 className="text-white text-lg font-semibold mb-2">Summary</h2>
                <p className="text-gray-300">{analysis.summary}</p>
              </div>
            )}

            {/* Metric cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {metricCards.map((metric, index) => (
                <div
                  key={index}
                  className="bg-darkblue bg-opacity-40 p-6 rounded-lg shadow-lg hover:scale-105 cursor-pointer transition-all duration-300"
                >
                  <div className="flex flex-col gap-3">
                    <h3 className="text-white text-lg font-semibold">{metric.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${metric.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                        {metric.value}
                      </span>
                      <span className="text-gray-400 text-sm">{metric.unit}</span>
                    </div>
                    {metric.status === 'error' && metric.tipKey && (
                      <button
                        onClick={() => { setSelectedMetric(metric); setShowModal(true); }}
                        className="text-blue1 text-sm mt-2 hover:text-white rounded-full transition-colors px-4 py-1 border border-blue1 hover:bg-blue1 hover:bg-opacity-20 w-fit"
                      >
                        IMPROVE
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysis.strengths?.length > 0 && (
                <div className="bg-darkblue bg-opacity-40 p-6 rounded-lg shadow-lg">
                  <h2 className="text-white text-lg font-semibold mb-3">✅ Strengths</h2>
                  <ul className="space-y-2">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.improvements?.length > 0 && (
                <div className="bg-darkblue bg-opacity-40 p-6 rounded-lg shadow-lg">
                  <h2 className="text-white text-lg font-semibold mb-3">📈 Areas to Improve</h2>
                  <ul className="space-y-2">
                    {analysis.improvements.map((s, i) => (
                      <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">•</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Re-generate */}
            <div className="text-center">
              <button
                onClick={fetchAnalysis}
                className="text-blue1 border border-blue1 px-6 py-2 rounded-lg hover:bg-blue1 hover:text-white transition"
              >
                Re-generate Analysis
              </button>
            </div>
          </>
        )}

        {/* Improvement Modal */}
        {showModal && selectedMetric && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-10 px-4"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-darkblue2 rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-blue1/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-white text-xl font-bold">Improve {selectedMetric.title}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white p-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {(improvementTips[selectedMetric.tipKey] || []).map((tip, index) => (
                  <div key={index} className="flex items-start gap-4 pl-6 hover:bg-white/5 p-3 rounded-lg">
                    <div className="text-blue1 mt-1 bg-darkblue p-1 rounded-full border border-blue1/20">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <p className="text-gray-300">{tip}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-blue1 text-white px-4 py-2 rounded-lg hover:opacity-80"
                >
                  Got it
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