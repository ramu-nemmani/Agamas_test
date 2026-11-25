import React, { useEffect, useRef, useState } from 'react';

export default function FrontTab({ lesson, onReachBottom }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const triggeredRef = useRef(false);
  const touchStartYRef = useRef(null);

  useEffect(() => {
    const scrollContainer = document.getElementById('main-scroll-container');
    if (!scrollContainer || !onReachBottom) return;

    const triggerSwitch = () => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;
      setIsTransitioning(true);
      setTimeout(() => {
        onReachBottom();
      }, 300);
    };

    const isAtBottom = () =>
      scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 4;

    const handleScroll = () => {
      if (scrollContainer.scrollTop > 0 && isAtBottom()) {
        triggerSwitch();
      }
    };

    const handleWheel = (e) => {
      if (e.deltaY > 0 && isAtBottom()) {
        triggerSwitch();
      }
    };

    const handleTouchStart = (e) => {
      touchStartYRef.current = e.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (e) => {
      if (touchStartYRef.current === null) return;
      const currentY = e.touches[0]?.clientY ?? touchStartYRef.current;
      const deltaY = touchStartYRef.current - currentY;
      if (deltaY > 20 && isAtBottom()) {
        triggerSwitch();
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    scrollContainer.addEventListener('wheel', handleWheel, { passive: true });
    scrollContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollContainer.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      scrollContainer.removeEventListener('wheel', handleWheel);
      scrollContainer.removeEventListener('touchstart', handleTouchStart);
      scrollContainer.removeEventListener('touchmove', handleTouchMove);
    };
  }, [onReachBottom]);

  return (
    <div
      className={`mt-20 mb-32 flex flex-col items-center justify-center text-center px-4 transition-all duration-300 ease-out ${
        isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
      }`}
    >
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
