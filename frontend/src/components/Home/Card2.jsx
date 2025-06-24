function Card2({title , description, image}) {
  return (
      <div className='bg-darkblue bg-opacity-40 rounded-3xl flex flex-col w-72 gap-6 p-8 py-12 pb-18'>
        <div className="w-24 h-24 overflow-hidden">
          <img src={image} className='w-full h-full '/>
        </div>
        <h1 className='text-white text-xl'>{title}</h1>
        <p className='text-gray-400 '>{description}</p>
      </div>
  )
}

export default Card2
