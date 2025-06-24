import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import LoginModal from "../Modal/LoginModal";

export default function RegisterHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false); 

  return (
    <header className="shadow sticky z-50 top-0 max-w-7xl mx-auto px-12">
      <nav className="bg-black border-gray-200 py-6 max-w-screen-xl">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img className=" w-8 rounded-full bg-transparent bg-darkblue bg-opacity-40" src="https://d154zarmrcpu4a.cloudfront.net/60fe828b-2ebf-4dd2-9b4d-d78f771b83cc.png" />
            <div className="text-2xl ml-4 text-white font-extrabold">
              Virtual <span className="text-blue1">AI</span>
            </div>
          </Link>
          <div className="flex items-center justify-end gap-4">
            <p className="text-gray-400 ">Already have an account?</p>
            <button 
              className="rounded-full text-sm text-black1 bg-white hover:bg-black1 hover:text-white px-3 py-1.5"
              onClick={() => setIsModalOpen(true)} 
            >
              Sign In
            </button>
          </div>
         </div>
      </nav>

      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
}
