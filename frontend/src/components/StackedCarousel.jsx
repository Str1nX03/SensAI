// src/components/StackedCarousel.jsx
import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Linkedin } from "lucide-react";
import "../styles/stacked-carousel.css";

export default function StackedCarousel({ testimonials }) {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  // 1. Calculate count safely first
  const count = testimonials ? testimonials.length : 0;

  // 2. Call useEffect unconditionally
  useEffect(() => {
    if (!autoplay || count === 0) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % count);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoplay, count]);

  // 3. return early if no data exists
  if (!testimonials || count === 0) return null;

  // 4. Helper functions
  const handleNext = () => {
    setActive((prev) => (prev + 1) % count);
    setAutoplay(false);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + count) % count);
    setAutoplay(false);
  };

  // Determine indexes for the stack
  const activeIndex = active;
  const nextIndex = (active + 1) % count;
  const prevIndex = (active - 1 + count) % count;

  const activePerson = testimonials[activeIndex];
  const nextPerson = testimonials[nextIndex];
  const prevPerson = testimonials[prevIndex];

  return (
    <div className="stacked-wrapper">
      
      <div className="card-stack animate-card">
        
        <div 
            className="card-layer card-back-left"
            style={{ backgroundImage: `url(${nextPerson.src})` }}
        />
        
        <div 
            className="card-layer card-back-right"
            style={{ backgroundImage: `url(${prevPerson.src})` }}
        />

        {/* Foreground Card (Active) */}
        <div className="card-layer card-front">
          <img 
            src={activePerson.src} 
            alt={activePerson.name} 
            className="card-img"
          />
        </div>

      </div>

      {/* RIGHT: Content */}
      <div className="content-col">
        <div key={active} className="animate-text">
            <h2 className="person-name">{activePerson.name}</h2>
            <p className="person-role">{activePerson.designation}</p>
            
            <p className="person-quote">"{activePerson.quote}"</p>

            {activePerson.linkedin && (
            <a 
                href={activePerson.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="linkedin-btn"
            >
                <Linkedin size={18} />
                <span>LinkedIn</span>
            </a>
            )}
        </div>

        <div className="nav-row">
            <button onClick={handlePrev} className="nav-btn">
                <ArrowLeft size={20} />
            </button>
            <button onClick={handleNext} className="nav-btn">
                <ArrowRight size={20} />
            </button>
        </div>
      </div>
    </div>
  );
}