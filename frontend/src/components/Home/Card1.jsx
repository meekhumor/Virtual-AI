import React from 'react'

function Card1({number, title , description}) {
  return (
      <div className='bg-darkblue bg-opacity-40 rounded-3xl flex flex-col gap-4 p-8 py-16 w-80 '>
        <span className='text-gray-500 text-2xl'>{"0" + number}</span>
        <h1 className='text-white text-xl'>{title}</h1>
        <p className='text-gray-400 '>{description}</p>
      </div>
  )
}

export default Card1
