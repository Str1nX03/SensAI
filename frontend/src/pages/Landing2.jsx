import { useEffect } from "react";
import ShaderBackground from "../components/ShaderBackground";
import DisplayCards from "../components/DisplayCards";
import "../styles/landing2.css";
import { initAnimations } from "../utils/animation";
import Navbar from "../components/Navbar";
import { Home, User, FileText, Briefcase, Bot, GraduationCap, ClipboardCheck } from "lucide-react";

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

  // 2. Define the Card Data
  // Inside Landing2.jsx

  const features = [
    {
      title: "Assistant Agent",
      description: "Curated videos & study guides",
      date: "AI Guide",
      icon: <Bot size={16} />,
      // REMOVED the long 'className' string. 
      // The component now assigns positioning automatically based on index.
    },
    {
      title: "Tutoring Agent",
      description: "Personalized lesson plans",
      date: "Adaptive",
      icon: <GraduationCap size={16} />,
    },
    {
      title: "Testing Agent",
      description: "Instant quizzes & feedback",
      date: "Evaluation",
      icon: <ClipboardCheck size={16} />,
    },
  ];

  return (
    <>
      <ShaderBackground />
      <Navbar items={NAV_ITEMS} />

      <main id="main-content" style={{ position: 'relative', zIndex: 10 }}>

        <section className="hero-section" aria-label="Main hero section">
          <div className="landing-container">

            <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-quaternary)", fontSize: ".9rem", marginBottom: "1.5rem" }}>
              {"> SYSTEM.INITIALIZED"}
            </div>

            <div className="hero-content">
              <h1 className="hero-title">
                Learn anything. <br />
                <span style={{ color: "var(--text-secondary)" }}>Fast.</span>
              </h1>
              <p className="hero-subtitle" style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto 2.5rem auto" }}>
                Experience personalized learning powered by intelligent AI agents that create customized lessons,
                comprehensive study materials, and adaptive quizzes tailored just for you.
              </p>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                <a href="/login" className="btn btn-primary">Start Learning</a>
                <a href="/register" className="btn btn-secondary">Create Account</a>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES SECTION ================= */}
        <section className="features-section" style={{ marginTop: "4rem", paddingBottom: "8rem" }}>

          <h2 className="text-center">How Our AI Agents Help You Learn</h2>
          <p className="text-center" style={{ marginBottom: "5rem", color: "var(--text-secondary)" }}>
            Three specialized AI agents work together to create your perfect learning experience
          </p>

          {/* 3. Replaced Grid with Stacked Cards */}
          <div style={{ display: 'flex', justifyContent: 'center', perspective: '1000px' }}>
            <DisplayCards cards={features} />
          </div>

        </section>

      </main>
    </>
  );
}