import { Link } from "react-router-dom";
import Card1 from "./Card1";
import LottieAnimation from "../Lottie";
import animation1 from "./animations/analysis.json";
import animation2 from "./animations/choose.json";
import animation3 from "./animations/interview.json";
import Card2 from "./Card2";
import { useState } from "react";

const steps = [
  {
    title: "Select Your Field or Role",
    description:
      "This ensures that the interview questions and scenarios are tailored to your needs.",
    animation: animation1,
  },
  {
    title: "Engage with AI Interviewer",
    description:
      "Log in at your scheduled time and start the interview. The bot will ask questions relevant to your chosen field.",
    animation: animation2,
  },
  {
    title: "Receive Detailed Feedback",
    description:
      "After the interview, receive a detailed analysis of your overall performance and feedback based on it",
    animation: animation3,
  },
];

const features = [
  {
    title: "Unlimited practice, from anywhere",
    description:
      "Take unlimited online mock interviews whenever you want, wherever you want.",
    image: "home/icon1.svg",
  },
  {
    title: "Real interview pressure, real results",
    description:
      "Recording your responses adds a touch of realistic interview pressure",
    image: "home/icon2.svg",
  },
  {
    title: "Self-review for self-improvement",
    description:
      "Know exactly how you have performed and refine your approach.",
    image: "home/icon3.svg",
  },
  {
    title: "Tailor-made interview questions",
    description:
      "Personalize your prep with custom questions tailored to your job roles.",
    image: "home/icon4.svg",
  },
  {
    title: "Enhance and level up your skills",
    description:
      "Access curated resources to continuously improve your interview skills.",
    image: "home/icon5.svg",
  },
];

export default function Home() {
  

  return (
    <div className="mx-auto w-full min-h-screen max-w-6xl flex flex-col my-20 mb-36">
    

      {/* Heading  */}
      <div className="flex flex-col justify-center gap-4 mb-24">
        <h1 className="text-white font-bold text-5xl text-center">
          Your <span className="text-blue1">Dream Job</span> is Just an <br />{" "}
          Interview Away!
        </h1>
        <p className="text-gray-400 text-center">
          Transform your interview skills from preparation to practice,
          <br /> and all the way to sucess
        </p>
        <div className="flex flex-row gap-6 justify-center mt-4">
          <Link
            to="/register"
            className="rounded-full hover:bg-darkblue text-white bg-blue1 px-7 py-4 "
          >
            Start for Free
          </Link>
          <Link
            to="#"
            className="rounded-full hover:bg-black1 hover:text-white  text-gray-700 bg-white px-7 py-4"
          >
            Learn More
          </Link>
        </div>
      </div>


      {/* How it works section */}
      <div className="flex flex-col gap-16 mb-8">
        <div className="text-center gap-1">
          <p className="text-gray-500 ">3 SIMPLE STEPS</p>
          <h1 className="text-white font-bold text-4xl">How does it works?</h1>
        </div>
        <div className="flex flex-col items-center">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col sm:flex-row items-center ${
                index % 2 === 0 ? "sm:flex-row-reverse" : ""
              } gap-36 mb-16`}
            >
              <div className="md:w-1/2 mx-auto transform scale-140">
                <LottieAnimation animationData={step.animation} />
              </div>
              <div className="md:w-1/2 mx-auto">
                <Card1
                  number={index + 1}
                  title={step.title}
                  description={step.description}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features section */}
      <div className="flex flex-col gap-16 mb-24">
        <h1 className="text-white text-center font-bold text-4xl max-w-xl mx-auto">
          Achieve interview success with our AI-powered{" "}
          <span className="text-blue1">practice tools</span>
        </h1>
        <div className="flex flex-wrap justify-center lg:max-w-5xl m-auto gap-8 md:max-w-3xl sm:max-w-xl">
          {features.map((step, index) => (
            <div key={index}>
              <Card2
                title={step.title}
                description={step.description}
                image={step.image}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sign Up  */}
      <div className="flex justify-center gap-28">
        <div className="flex flex-col max-w-md gap-3 my-auto">
          <h1 className="text-white text-3xl font-semibold">
            Take the first step toward your{" "}
            <span className="text-blue1">dream job</span>
          </h1>
          <p className="text-gray-400 max-w-sm">
            You can start practicing and improving your skills immediately.
          </p>
          <Link
            to="/register"
            className="text-white bg-blue1 hover:bg-darkblue/50 w-28 py-3 rounded-full text-center mt-10"
          >
            Sign Up
          </Link>
        </div>
        <img
          src="/home/lasticon.svg"
          className="w-64"
        />
      </div>

    </div>
  );
}
