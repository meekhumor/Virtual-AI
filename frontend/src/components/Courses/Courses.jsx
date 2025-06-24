import React from 'react';
import { Clock, Users, ChevronRight, Trophy } from 'lucide-react';
const courses = [
  {
    title: "Interview Skill Masterclass",
    description: "Master interview techniques with confidence using the STAR framework, and communicate effectively. ",
    src: "/courses/interview_skill.jpg",
    duration: "22.5 hours",
    students: "86,868",
    level: "All Levels",
    topics: ["Interview Skills", "Career Development"],
    status: "Most Popular",
    link: "https://www.udemy.com/course/the-complete-job-interviewing-skills-masterclass-course/"
  },
  {
    title: "Technical Interview Preparation",
    description: "Ace coding challenges with popular data structures and algorithms, enhance your analytical skills",
    src: "/courses/technical.jpg",
    duration: "58.5 hours",
    students: "52,782",
    level: "All Levels",
    topics: ["Data Structures", "Algorithms"],
    status: "Bestseller",
    link: "https://www.udemy.com/course/datastructurescncpp/"
  },
  {
    title: "System Design Mastery",
    description: "Learn to design scalable and robust systems with real-world case studies.",
    src: "/courses/system.jpg",
    duration: "5 hours",
    students: "80,961",
    level: "Intermediate",
    topics: ["Scalability", "Microservices", "Databases"],
    status: "Popular",
    link: "https://www.udemy.com/course/system-design-interview-prep/"
  },
  {
    title: "Soft Skills & Communication",
    description: "Improve your confidence, articulation, and body language for in-person and virtual interviews.",
    src: "/courses/soft_skill.jpg",
    duration: "31.5 hours",
    students: "30,210",
    level: "Management",
    topics: ["Body Language", "Communication", "Confidence Building"],
    status: "Bestseller",
    link: "https://www.udemy.com/course/the-complete-communication-skills-master-class-for-life/?couponCode=LEARNNOWPLANS"
  },
];

function CourseCard({ course }) {
  return (
    
    <div className="bg-darkblue/40 rounded-xl p-6 shadow-lg transition-all duration-300 border border-gray-800 hover:border-blue1/50 group">
      <div className="flex gap-6">
        <div className="relative">
          <img src={course.src} alt={course.title} className="w-80 h-60" />
          {course.status && (
            <span className="absolute -top-3 -left-3 bg-blue1 text-white text-xs px-2 py-1 rounded-full">
              {course.status}
            </span>
          )}
        </div>
        <div className="flex-1 space-y-3">
          <h2 className="text-xl text-white font-semibold transition-colors">
            {course.title}
          </h2>
          <p className="text-gray-400 text-sm">{course.description}</p>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.students} students</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              <span>{course.level}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {course.topics.map((topic, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-1 bg-darkblue/50 text-gray-300 rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <a href={course.link} className="bg-blue1 text-white rounded-full py-2 px-6 text-sm hover:bg-darkblue transition-colors flex items-center gap-2 group">
              <span>Start Learning</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Courses() {
  return (
    <div className="w-full max-w-4xl mx-auto mb-36 px-6">
      <div className="text-center space-y-3 my-12">

        <h1 className="text-white text-2xl ">
          Top Courses
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Choose from our selection of specialized training programs.
        </p>
      </div>

      <div className="grid md:grid-cols-1 gap-6">
        {courses.map((course, index) => (
          <CourseCard key={index} course={course} />
        ))}
      </div>
    </div>
  );
}