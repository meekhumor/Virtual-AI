import React, { useState } from 'react';
import {Link} from "react-router-dom"

function CardCat({ index, label, title, level, time, questions, image, description }) {
  const [isToggled, setIsToggled] = useState(false);
  const handleToggle = () => {
    setIsToggled(!isToggled);
  };

  return (
    <div>
      <div className='bg-darkblue bg-opacity-40 flex flex-col gap-2 pt-10 pb-12 px-2 pl-4 rounded-2xl'>
        {/* Top */}
        <div className="flex justify-center items-center gap-3">
          <div className='w-1/3 p-5 '>
            <img src={image} className="w-14 h-14" alt="" />
          </div>
          <div className="flex flex-col gap-2 w-2/3">
            <p className="text-blue-200 text-center py-1 rounded-full bg-darkblue/30 text-xs w-28">
              {label}
            </p>
            <h1 className="text-white text-xl w-40 pl-1">{title}</h1>
          </div>
        </div>

        {/* Middle */}
        <div className="flex flex-col gap-4 justify-center ml-6 ">
          <div className="flex flex-row gap-4">
            <img src="/category/Shape1.svg" className="w-6" alt="" />
            <p className="text-gray-400 ">{level}-level</p>
          </div>
          <div className="flex flex-row gap-4">
            <img src="/category/Shape2.svg" className="w-6" alt="" />
            <p className="text-gray-400 ">{time} Minutes</p>
          </div>
          <div className="flex flex-row gap-4">
            <img src="/category/Shape3.svg" className="w-6" alt="" />
            <p className="text-gray-400 ">{questions} Questions</p>
          </div>
        </div>

        <div className='flex gap-10 justify-center items-center mt-2'>
          <h1 className='text-gray-400'>Real Mode</h1>
          <div className="flex justify-center items-center mt-4">
            <label htmlFor={`toggle-${index}`} className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  id={`toggle-${index}`}
                  className="sr-only"
                  checked={isToggled}
                  onChange={handleToggle}
                />
                <div
                  className={`w-12 h-6 ${
                    isToggled ? "bg-blue1" : "bg-darkblue/80"
                  } rounded-full shadow-inner`}
                ></div>

                <div
                  className={`dot relative w-4 h-4 bg-zinc-300 rounded-full shadow left-[0.3rem] top-[-1.3rem] transition-transform 
                  ${isToggled ? "transform translate-x-6" : ""}`}
                ></div>
              </div>
            </label>
          </div>
        </div>

        <Link className="bg-blue1 hover:bg-darkblue text-white rounded-2xl  py-3 px-16 text-center mx-auto mt-8">
          Start Interview
        </Link>
      </div>
    </div>
  );
}

export default CardCat;
