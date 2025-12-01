import { useEffect, useState } from "react";
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
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    initAnimations();
  }, []);

  // Timer: Rotate selection every 10 seconds
  useEffect(() => {
    if (isHovering) return

    const timer = setInterval(() => {
      setActiveFeatureIndex((prev) => (prev + 1) % 3);
    }, 10000);
    return () => clearInterval(timer);
  }, [isHovering]);

  const handleCardHover = (index) => {
    setActiveFeatureIndex(index);
    setIsHovering(true);
  };

  const handleMouseLeaveArea = () => {
    setIsHovering(false);
  };

  const features = [
    {
      // Card View
      cardTitle: "Assistant",
      cardDesc: "Schedule & Sync the Learning Plan",
      icon: <Bot size={20} />,
      
      detailTitle: "Assistant Agent",
      detailDesc: "A dedicated AI partner that aggregates study guides, curates relevant video content, and organizes your schedule. By monitoring your progress, it ensures you never miss a topic and optimizes your schedule for maximum retention without burnout.",
      date: "STATUS: ACTIVE",
    },
    {
      cardTitle: "Tutor",
      cardDesc: "Adaptive Lessons & Explanations",
      icon: <GraduationCap size={20} />,
      
      detailTitle: "Tutoring Agent",
      detailDesc: "Generates personalized lesson plans based on your weaknesses. It adapts in real-time to your learning pace, ensuring complex concepts are broken down simply. If you struggle with a topic, it provides alternative explanations until you master it.",
      date: "STATUS: ADAPTIVE",
    },
    {
      cardTitle: "Testing",
      cardDesc: "Mock Exams & Instant Feedback",
      icon: <ClipboardCheck size={20} />,
      
      detailTitle: "Testing Agent",
      detailDesc: "Instant feedback on quizzes and mock exams. This agent analyzes your answers to identify gaps in knowledge and suggests targeted review sessions. It turns your weaknesses into strengths before the big day arrives.",
      date: "STATUS: EVALUATING",
    },
  ];

  const cardDataForDisplay = features.map(f => ({
    title: f.cardTitle,
    description: f.cardDesc,
    icon: f.icon,
    date: "View Protocol"
  }));

  return (
    <>
      <Navbar items={NAV_ITEMS} />

      {/* LAYER 1: Global Particle Network */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}>
        <ParticleNetwork />
      </div>

      {/* LAYER 2: Main Content */}
      <main id="main-content" style={{ position: 'relative', zIndex: 10 }}>

        <section className="hero-section" aria-label="Main hero section">
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

        {/* ================= FEATURES SECTION ================= */}
        <section className="features-section">
          <h2 className="text-center" style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "3rem" }}>
            How Our AI Agents Help You Learn
          </h2>

          <div className="features-content-grid">
            
            {/* LEFT: Display Cards (Stack) */}
            <div className="features-visual" onMouseLeave={handleMouseLeaveArea}>
              <DisplayCards 
                cards={cardDataForDisplay} 
                activeIndex={activeFeatureIndex} 
                onCardHover={handleCardHover}
              />
            </div>

            {/* RIGHT: Detailed Text */}
            <div className="features-text-panel">
               <div key={activeFeatureIndex} className="feature-description-box">
                  <div className="feature-header">
                    <span className="feature-icon">
                      {features[activeFeatureIndex].icon}
                    </span>
                    <h3 className="feature-title">
                      {features[activeFeatureIndex].detailTitle}
                    </h3>
                  </div>
                  
                  <div className="feature-divider"></div>
                  
                  <p className="feature-body">
                    {features[activeFeatureIndex].detailDesc}
                  </p>

                  <div className="feature-meta">
                    {features[activeFeatureIndex].date}
                  </div>
               </div>
            </div>

          </div>

        </section>

      </main>
    </>
  );
}