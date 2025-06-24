import { Link } from "react-router-dom";

export default function Permission() {
  return (
    <div className="mx-auto w-full max-w-xl flex flex-col items-center text-center gap-6 bg-darkblue bg-opacity-40 py-14 my-24 rounded-3xl">
      <img src="/camCheck.png" className="w-28" alt="Camera check icon" />
      <h1 className="text-white text-3xl w-4/5 mt-4">
        We use your computer&apos;s camera to help you prepare.
      </h1>
      <p className="text-gray-300 w-[25rem] mb-4 text-sm">
        Recording yourself is proven to be one of the best ways to practice for an interview.
      </p>
      <Link
        to="/cam-preview1"
        className="text-white py-3 text-sm rounded-3xl px-5 bg-blue1 hover:bg-darkblue"
      >
        Get Started With Video
      </Link>
      <p className="text-gray-400 text-sm w-96 scale-90">
        Your recordings are always private and will only be seen by people you choose to share them with.
      </p>
      <Link to="/interview-simulator" className="text-blue1 hover:underline">
        I don&apos;t want to use video
      </Link>
    </div>
  );
}
