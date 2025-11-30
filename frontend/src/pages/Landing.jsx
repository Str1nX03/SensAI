import { useEffect } from "react";
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

export default function Landing2() {

  useEffect(() => {
    initAnimations();
  }, []);

  const features = [
    {
      title: "Assistant Agent",
      description: "A dedicated AI partner that aggregates study guides, curates relevant video content, and organizes your schedule to ensure you never miss a topic.",
      date: "STATUS: ACTIVE",
      icon: <Bot size={20} />,
    },
    {
      title: "Tutoring Agent",
      description: "Generates personalized lesson plans based on your weaknesses. It adapts in real-time to your learning pace, ensuring complex concepts are broken down simply.",
      date: "STATUS: ADAPTIVE",
      icon: <GraduationCap size={20} />,
    },
    {
      title: "Testing Agent",
      description: "Instant feedback on quizzes and mock exams. This agent analyzes your answers to identify gaps in knowledge and suggests targeted review sessions.",
      date: "STATUS: EVALUATING",
      icon: <ClipboardCheck size={20} />,
    },
  ];

  return (
    <>
      <Navbar items={NAV_ITEMS} />

      {/* LAYER 1: Global Particle Network */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0, 
        pointerEvents: "none"
      }}>
        <ParticleNetwork />
      </div>

      {/* LAYER 2: Main Content */}
      <main id="main-content" style={{ position: 'relative', zIndex: 10 }}>

        <section className="hero-section" aria-label="Main hero section">
          <div className="hero-grid">

            {/* LEFT COLUMN */}
            <div className="hero-left-shader">
              <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                 <ShaderBackground />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="hero-right-content">
              <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-quinary)", fontSize: ".9rem", marginBottom: "1.5rem" }}>
                {"> SYSTEM.INITIALIZED"}
              </div>

              <h1 className="hero-title">
                Learn anything. <br />
                <span>Fast.</span>
              </h1>
              
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

          <h2 className="text-center" style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "1rem" }}>
            How Our AI Agents Help You Learn
          </h2>
          <p className="text-center" style={{ marginBottom: "5rem", color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto 5rem auto", lineHeight: "1.6" }}>
            Three specialized AI agents work together to create your perfect learning experience. Hover over the cards to inspect their protocols.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', perspective: '1000px' }}>
            <DisplayCards cards={features} />
          </div>

        </section>

      </main>
    </>
  );
}