import { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "../../constants";
import { Play, Pause } from "lucide-react";
import CardDash1 from "./CardDash1";
import { Link, NavLink } from "react-router-dom";

const interviewTypes = [
  {
    title: 'General Interviews',
    description: 'Covers the questions you are most likely to get while interviewing.',
    tagline: 'Start Interview',
    image: '/dashboard/icon1.svg',
    link: '/interview-setting',
  },
  {
    title: 'Interview by Job Position',
    description: 'Our AI selects the most relevant questions based on your job position',
    tagline: 'Choose Job Position',
    image: '/dashboard/icon2.svg',
    link: '/domain',
  },
  {
    title: 'Custom-Built Interviews',
    description: 'Interview with your own questions, or take assigned interviews.',
    tagline: 'Start Interview',
    image: '/dashboard/icon3.svg',
    link: '/coming-soon',
  },
];

export default function Dashboard() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [recentInterview, setRecentInterview] = useState(null);
  const videoRef = useRef(null);

  const apiBaseUrl = API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchRecentInterview = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${apiBaseUrl}/api/interviews/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setRecentInterview(data[0]); 
          }
        }
      } catch (e) {
        console.error('Failed to fetch interviews:', e);
      }
    };
    fetchRecentInterview();
  }, [token]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    return `${m} min`;
  };

  const levelLabel = (level) => {
    const map = { ENTRY: 'Entry Level', INTERMEDIATE: 'Mid Level', SENIOR: 'Senior' };
    return map[level] || level;
  };

  return (
    <div className="w-full max-w-4xl px-6 md:px-12 mb-36 mx-auto">
      <div className='flex justify-center items-center'>
        <div className='flex flex-col mt-12 mb-5' id="hero">
          <h1 className='text-white text-2xl text-center'>Simulate an Interview</h1>
        </div>
      </div>

      {/* Interview type cards */}
      <div className="flex justify-center items-center gap-6">
        {interviewTypes.map((step, index) => (
          <div key={index}>
            <CardDash1
              title={step.title}
              description={step.description}
              tagline={step.tagline}
              image={step.image}
              link={step.link}
            />
          </div>
        ))}
      </div>

      {/* Master course video */}
      <div className="flex justify-center items-center gap-8 relative">
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <video ref={videoRef} className="rounded-lg w-96 aspect-square" loop playsInline muted>
            <source src="courses/course.mp4" type="video/mp4" />
          </video>
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg hover:bg-opacity-60"
            >
              <Play size={50} className="text-zinc-200" />
            </button>
          )}
          {isPlaying && isHovered && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg hover:bg-opacity-60"
            >
              <Pause size={50} className="text-zinc-200" />
            </button>
          )}
        </div>
        <div className="flex flex-col pt-4 max-w-xs">
          <p className="text-gray-500 text-sm">VIDEO COURSE</p>
          <h1 className="text-white text-lg mt-4">Master the Interview</h1>
          <p className="text-gray-400 text-sm mt-4 mb-6">
            Take our online course and learn everything you need to know to ace the interview.
          </p>
          <Link to="/courses" className="bg-blue1 text-white rounded-3xl py-3 w-44 text-sm text-center hover:bg-darkblue/90 transition">
            Take the Class
          </Link>
        </div>
      </div>

      {/* Review Your Interview */}
      <div className="flex flex-col px-10 gap-4">
        <div className='flex justify-between'>
          <h1 className='text-white text-2xl'>Review Your Interview</h1>
          <NavLink to="/review-interview" className="text-blue1 text-md hover:text-gray-400">VIEW ALL</NavLink>
        </div>
        {recentInterview ? (
          <div className="bg-darkblue bg-opacity-60 flex flex-row p-4 rounded-lg px-6 justify-between items-center">
            <div className="flex text-gray-400 gap-8">
              <p className="text-gray-200">{recentInterview.title || 'General Interview'}</p>
              <p className="text-sm">{formatTimeAgo(recentInterview.created_at)}</p>
              <p className="text-sm">{formatDuration(recentInterview.duration_seconds)}</p>
              <p className="text-sm">{levelLabel(recentInterview.level)}</p>
            </div>
            <Link
              to={`/review/${recentInterview.id}`}
              className="text-white p-1 rounded-xl px-5 bg-blue1 hover:bg-darkblue cursor-pointer"
            >
              Review
            </Link>
          </div>
        ) : (
          <div className="bg-darkblue bg-opacity-60 p-4 rounded-lg text-gray-400 text-sm">
            No interviews yet. Start your first interview above!
          </div>
        )}
      </div>

      {/* Build interview */}
      <div className="flex mt-16 gap-6 px-10">
        <div className="bg-darkblue bg-opacity-60 w-1/3 rounded-lg flex gap-3 flex-col px-3 justify-center items-center">
          <img src="/dashboard/icon3.svg" alt="" className="w-44" />
          <h1 className="text-white text-xl">Build an Interview</h1>
          <p className="text-gray-400 text-sm text-center">Add your own questions and build your own interview from scratch</p>
          <NavLink to="/coming-soon" className="bg-blue1 hover:bg-darkblue text-white rounded-3xl py-2 my-3 px-6 text-sm">
            Build Interview
          </NavLink>
        </div>
        <div className="flex flex-col gap-4 w-2/3">
          <div className='flex justify-between items-center'>
            <h1 className='text-white text-2xl'>Featured Interviews</h1>
            <NavLink to="/interview-category" className="text-blue1 text-md hover:text-gray-400">VIEW ALL</NavLink>
          </div>
          <div className="bg-darkblue bg-opacity-60 w-full h-1/2 rounded-lg flex gap-2 py-4">
            <img src="/category/icon2.svg" alt="" className="w-14 h-14 m-4 mx-6" />
            <div className="flex flex-col gap-1 my-auto">
              <h1 className="text-xl text-white">Brainteaser</h1>
              <p className="text-gray-400 text-sm pr-3">Brainteasers are questions that make you think and arrive at a reasonable answer.</p>
              <Link to="/interview-setting" className="hover:cursor-pointer text-sm text-blue1 mt-3">Take Interview</Link>
            </div>
          </div>
          <div className="bg-darkblue bg-opacity-60 w-full h-1/2 rounded-lg flex gap-2 py-4">
            <img src="/category/icon3.svg" alt="" className="w-14 h-14 m-4 mx-6" />
            <div className="flex flex-col gap-1 my-auto">
              <h1 className="text-xl text-white">Critical Thinking</h1>
              <p className="text-gray-400 text-sm pr-3">Critical Thinking is becoming more important in today's data driven environment</p>
              <Link to="/interview-setting" className="hover:cursor-pointer text-sm text-blue1 mt-3">Take Interview</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
