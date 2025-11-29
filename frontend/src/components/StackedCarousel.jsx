import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, Linkedin } from "lucide-react";
import "../styles/stacked-carousel.css";

export default function StackedCarousel({ testimonials }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 1. We use useCallback to make this function "stable".
  // This allows us to use it inside useEffect without causing infinite loops.
  const handleNext = useCallback(() => {
    if (!testimonials || testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials]);

  const handlePrev = () => {
    if (!testimonials || testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // 2. useEffect is now called BEFORE any 'return null' statements.
  useEffect(() => {
    // If no data, do nothing (but the hook still "runs" technically, satisfying React)
    if (!testimonials || testimonials.length === 0) return;

    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex, handleNext, testimonials]); // 3. dependencies are now correct

  // 4. NOW we can do the early return check
  if (!testimonials || testimonials.length === 0) return null;

  const current = testimonials[currentIndex];

  return (
    <div className="stacked-wrapper">
      
      {/* LEFT: Image Stack */}
      <div className="card-stack">
        <div className="card-layer card-back-left" />
        <div className="card-layer card-back-right" />
        
        <div key={currentIndex} className="card-layer card-front animate-card">
           <img 
             src={current.src} 
             alt={current.name} 
             className="card-img"
             onError={(e) => e.target.src = "https://via.placeholder.com/300"}
           />
        </div>
      </div>

      {/* RIGHT: Content */}
      <div className="content-col">
        <div key={currentIndex} className="animate-text" style={{display:'flex', flexDirection:'column'}}>
            <h2 className="person-name">{current.name}</h2>
            <p className="person-role">{current.designation}</p>
            <p className="person-quote">"{current.quote}"</p>

            {current.linkedin && (
              <a 
                href={current.linkedin} 
                target="_blank" 
                rel="noreferrer" 
                className="linkedin-btn"
              >
                <Linkedin size={18} />
                <span>Connect on LinkedIn</span>
              </a>
            )}
        </div>

        <div className="nav-row">
          <button onClick={handlePrev} className="nav-btn" aria-label="Previous">
            <ArrowLeft size={24} />
          </button>
          <button onClick={handleNext} className="nav-btn" aria-label="Next">
            <ArrowRight size={24} />
          </button>
        </div>
      </div>

    </div>
  );
}