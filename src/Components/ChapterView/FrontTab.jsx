import React from 'react';

export default function FrontTab({ lesson }) {
  return (
    <div className="mt-20 mb-32 flex flex-col items-center justify-center text-center px-4">
      {(lesson?.imageUrl || lesson?.image) && (
        <img 
          src={lesson?.imageUrl || lesson?.image} 
          alt={lesson?.name || "Book Cover"} 
          className="w-48 md:w-64 h-auto object-cover rounded-md shadow-lg mb-12" 
        />
      )}
      <div className="w-16 h-[1px] bg-[#cd5c3d] mb-8 opacity-60"></div>
      <span className="text-xs font-serif text-[#cd5c3d] uppercase tracking-[0.3em] mb-4">Reading Room</span>
      <h2 
        className="text-4xl md:text-5xl font-normal leading-tight text-[#001e2d] mb-8 max-w-2xl" 
        style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif' }}
      >
        {lesson?.name}
      </h2>
      <div className="w-16 h-[1px] bg-[#cd5c3d] mt-4 opacity-60"></div>
    </div>
  );
}
