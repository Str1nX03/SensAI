import { useEffect, useState, useRef } from "react";

// ---------------------------
const loaderImage = "/load.png"; 
// ---------------------------

import ShaderBackground from "../components/ShaderBackground";
import ParticleNetwork from "../components/ParticleNetwork"; 
import DisplayCards from "../components/DisplayCards";
import { initAnimations } from "../utils/animation";
import Navbar from "../components/Navbar";
import { Home, User, FileText, Briefcase, Bot, GraduationCap, ClipboardCheck } from "lucide-react";
import "../styles/landing.css";

const NAV_ITEMS = [
  { name: "Home", url: "/", icon: Home },
  { name: "Login", url: "/login", icon: User },
  { name: "Register", url: "/register", icon: FileText },
  { name: "About", url: "/about", icon: Briefcase }
];

export default function Landing() {
  // 1. UPDATED STATE INITIALIZATION
  const [loadingState, setLoadingState] = useState(() => {
    const hasSeenIntro = sessionStorage.getItem("introShown");
    return hasSeenIntro ? 'complete' : 'loading';
  });

  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  
  const animationsInitialized = useRef(false);

  // 2. UPDATED EFFECT LOGIC
  useEffect(() => {
    // CASE A: User has already seen the intro (Skipping)
    if (loadingState === 'complete') {
       if (!animationsInitialized.current) {
         initAnimations(); 
         animationsInitialized.current = true;
       }
       return; 
    }

    // CASE B: First time visit (Run the Loader)
    const minWaitTime = new Promise(resolve => setTimeout(resolve, 3000));
    const imageLoad = new Promise((resolve) => {
      const img = new Image();
      img.src = loaderImage;
      img.onload = resolve;
      img.onerror = resolve; 
    });

    Promise.all([minWaitTime, imageLoad]).then(() => {
      setLoadingState('ready'); 
    });
  }, []); // Run once on mount

  // 3. UPDATED ENTER HANDLER
  const handleEnterSite = () => {
    setLoadingState('entering'); 
    
    // Save the flag so next reload skips this
    sessionStorage.setItem("introShown", "true");

    setTimeout(() => {
      setLoadingState('complete'); 
      if (!animationsInitialized.current) {
        initAnimations();
        animationsInitialized.current = true;
      }
    }, 800);
  };

  // 4. FEATURE ROTATION
  useEffect(() => {
    if (loadingState !== 'complete' || isHovering) return;
    const timer = setInterval(() => {
      setActiveFeatureIndex((prev) => (prev + 1) % 3);
    }, 10000);
    return () => clearInterval(timer);
  }, [loadingState, isHovering]);

  const handleCardHover = (index) => {
    setActiveFeatureIndex(index);
    setIsHovering(true);
  };

  const handleMouseLeaveArea = () => {
    setIsHovering(false);
  };

  const features = [
    {
      cardTitle: "Assistant", cardDesc: "Schedule & Sync the Learning Plan", icon: <Bot size={20} />,
      detailTitle: "Assistant Agent", detailDesc: "A dedicated AI partner that aggregates study guides, curates relevant video content, and organizes your schedule.", date: "STATUS: ACTIVE",
    },
    {
      cardTitle: "Tutor", cardDesc: "Adaptive Lessons & Explanations", icon: <GraduationCap size={20} />,
      detailTitle: "Tutoring Agent", detailDesc: "Generates personalized lesson plans based on your weaknesses. It adapts in real-time to your learning pace.", date: "STATUS: ADAPTIVE",
    },
    {
      cardTitle: "Testing", cardDesc: "Mock Exams & Instant Feedback", icon: <ClipboardCheck size={20} />,
      detailTitle: "Testing Agent", detailDesc: "Instant feedback on quizzes and mock exams. This agent analyzes your answers to identify gaps.", date: "STATUS: EVALUATING",
    },
  ];

  const cardDataForDisplay = features.map(f => ({
    title: f.cardTitle, description: f.cardDesc, icon: f.icon, date: "View Protocol"
  }));

  const isLoaderVisible = loadingState !== 'complete';
  const isFadingOut = loadingState === 'entering';

  return (
    <>
      <style>{`
        @keyframes slide-up-fade {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-enter {
          opacity: 0; 
          animation: slide-up-fade 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .delay-1 { animation-delay: 0.2s; } 
        .enter-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 12px 36px;
          font-family: var(--font-mono);
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          opacity: 0; 
          transform: translateY(20px);
        }
        .enter-btn.visible {
          animation: slide-up-fade 0.8s ease-out forwards;
        }
        .enter-btn:hover {
          background: rgba(147, 51, 234, 0.2);
          border-color: #9333ea;
          box-shadow: 0 0 20px #9333ea;
          text-shadow: 0 0 8px #d8b4fe;
        }
      `}</style>

      {/* ================= LOADING SCREEN ================= */}
      {isLoaderVisible && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: '#050505',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          zIndex: 9999,
          opacity: isFadingOut ? 0 : 1,
          transition: 'opacity 0.8s ease-in-out',
          pointerEvents: isFadingOut ? 'none' : 'all',
        }}>
          <div style={{ textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img className="animate-enter" src={loaderImage} alt="Loading..." 
              style={{ maxWidth: '450px', width: '85vw', height: 'auto', borderRadius: '4px', boxShadow: '0 0 30px rgba(0,0,0,0.8)', marginBottom: '2.5rem' }} 
            />
            <blockquote className="animate-enter delay-1" style={{ fontFamily: 'var(--font-mono, monospace)', color: '#e5e5e5', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 2.5rem auto', lineHeight: '1.6', fontStyle: 'italic', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              "Are you the strongest because you're Gojo Satoru, or are you Gojo Satoru because you're the strongest?"
            </blockquote>
            {loadingState === 'ready' && (
              <button className="enter-btn visible" onClick={handleEnterSite}>
                ENTER DOMAIN
              </button>
            )}
            {loadingState === 'loading' && <div style={{ height: '46px' }}></div>}
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <div style={{ 
        opacity: loadingState === 'complete' ? 1 : 0, 
        transition: 'opacity 1s ease-in',
        height: '100%',
        overflow: loadingState === 'complete' ? 'auto' : 'hidden' 
      }}>
        <Navbar items={NAV_ITEMS} />
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}>
          <ParticleNetwork />
        </div>
        <main id="main-content" style={{ position: 'relative', zIndex: 10 }}>
          <section className="hero-section">
            <div className="hero-grid">
              <div className="hero-left-shader">
                <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                   <ShaderBackground />
                </div>
              </div>
              <div className="hero-right-content">
                <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-quinary)", fontSize: ".9rem", marginBottom: "1.5rem" }}>
                  {"> SYSTEM.INITIALIZED"}
                </div>
                <h1 className="hero-title">Learn anything. <br /><span>Fast.</span></h1>
                <p className="hero-subtitle">
                  Experience personalized learning powered by intelligent AI agents that create customized lessons,
                  comprehensive study materials, and adaptive quizzes tailored just for you.
                </p>
                <div className="hero-cta">
                  <a href="/login" className="btn btn-primary">Start Learning</a>
                  <a href="/register" className="btn btn-secondary">Create Account</a>
                </div>
              </div>
            </div>
          </section>

          <section className="features-section">
            <h2 className="text-center" style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "3rem" }}>
              How Our AI Agents Help You Learn
            </h2>
            <div className="features-content-grid">
              <div className="features-visual" onMouseLeave={handleMouseLeaveArea}>
                <DisplayCards 
                  cards={cardDataForDisplay} 
                  activeIndex={activeFeatureIndex} 
                  onCardHover={handleCardHover}
                />
              </div>
              <div className="features-text-panel">
                 <div key={activeFeatureIndex} className="feature-description-box">
                   <div className="feature-header">
                     <span className="feature-icon">{features[activeFeatureIndex].icon}</span>
                     <h3 className="feature-title">{features[activeFeatureIndex].detailTitle}</h3>
                   </div>
                   <div className="feature-divider"></div>
                   <p className="feature-body">{features[activeFeatureIndex].detailDesc}</p>
                   <div className="feature-meta">{features[activeFeatureIndex].date}</div>
                 </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}