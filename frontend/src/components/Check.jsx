import React, { useState } from 'react';

const fillerWords = [
  "um", "uh", "like", "you know", "actually", "basically", "seriously", "literally",
  "kind of", "sort of", "well", "so", "I mean", "right", "okay", "er", "ah", "mhm",
  "just", "pretty much", "I guess", "you see", "I believe", "I'm not sure"
];

const powerWords = [
  "innovative", "dynamic", "effective", "leader", "strategic", "driven", "collaborative",
  "passionate", "visionary", "ambitious", "enthusiastic", "motivated", "successful", "growth",
  "competent", "skilled", "proactive", "resourceful", "accomplished", "dedicated", 
  "team player", "forward-thinking", "problem-solver", "expert", "confident",
  "strong communicator", "organized", "hardworking", "efficient", "resilient",
  "professional", "goal-driven", "self-starter", "committed"
];

const negativeWords = [
  "hate", "stupid", "idiot", "useless", "failure", "worst", "disaster", "terrible",
  "disgusting", "horrible", "pathetic", "loser", "awful", "lame", "shame", "sucks",
  "crap", "damn", "screw", "worthless", "garbage", "toxic", "broken", "broke", "foolish",
  "lousy", "coward", "sickening", "moron", "dumb", "jerk", "asshole", "bastard", "bitch",
  "shitty", "prick", "scum", "loser", "manipulative"
];

const analyzeTranscript = (transcript) => {
    const words = transcript.toLowerCase().split(/\s+/);
    let fillerCount = 0;
    let powerCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
        if (fillerWords.includes(word)) fillerCount++;
        if (powerWords.includes(word)) powerCount++;
        if (negativeWords.includes(word)) negativeCount++;
    });

    return { wordCount: words.length, fillerCount, powerCount, negativeCount };
};

const TranscriptAnalyzer = () => {
    const [transcript, setTranscript] = useState('');
    const [duration, setDuration] = useState('');
    const [result, setResult] = useState(null);

    const handleSubmit = () => {
        if (!duration || isNaN(duration) || duration <= 0) {
            alert('Please enter a valid duration in minutes.');
            return;
        }

        const analysis = analyzeTranscript(transcript);
        const wordsPerMinute = analysis.wordCount / parseFloat(duration);
        setResult({ ...analysis, wordsPerMinute: wordsPerMinute.toFixed(2) });
    };

    return (
        <div className="bg-white p-4">
            <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste the transcript here..."
                rows="10"
                cols="50"
                className="border p-2 w-full mb-4"
            />
            <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Enter duration in minutes"
                className="border p-2 w-full mb-4"
            />
            <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white p-2 rounded"
            >
                Analyze Transcript
            </button>

            {result && (
                <div className="mt-4">
                    <p>Total Words: {result.wordCount}</p>
                    <p>Filler Words: {result.fillerCount}</p>
                    <p>Power Words: {result.powerCount}</p>
                    <p>Negative Words: {result.negativeCount}</p>
                    <p>Words Per Minute (WPM): {result.wordsPerMinute}</p>
                </div>
            )}
        </div>
    );
};

export default TranscriptAnalyzer;
