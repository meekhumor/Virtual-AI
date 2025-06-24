import React from "react";
function CardSign({title , description}) {
  return (
    <div>
        <div className='flex gap-4'>
            <img src="/check.png" className="w-6 h-6 mt-1" alt="" />
            <div className='flex flex-col gap-3'>
                <h1 className='text-white text-lg'>{title}</h1>
                <p className='text-gray-400 text-sm'>{description}</p>
            </div>
        </div>
    </div>
  )
}

export default CardSign
