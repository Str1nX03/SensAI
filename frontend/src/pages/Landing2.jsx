import { useEffect } from "react";
import "../styles/landing2.css";
import { initAnimations } from "../utils/animation";
import Navbar from "../components/Navbar";
import "../styles/navbar.css";
import { Home, User, FileText, Briefcase } from "lucide-react";
import RetroWaves from "../components/RetroWaveShader";

const NAV_ITEMS = [
  { name:"Home", url:"/", icon:Home },
  { name:"Login", url:"/login", icon:User },
  { name:"Register", url:"/register", icon:FileText },
  { name:"About", url:"/about", icon:Briefcase }
];

export default function Landing() {

  useEffect(() => {
    initAnimations();   
  }, []);

  return (
  <>
    <Navbar items={NAV_ITEMS} />

    <main id="main-content">

      <section className="hero-section" aria-label="Main hero section">
        <div className="landing-container" style={{ position: "relative", overflow: "hidden" }}>

          {/* BACKGROUND LAYER */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0
          }}>
            <RetroWaves />
          </div>

          <div style={{ position: "relative", zIndex: 1 }}> 
            <div
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--text-quaternary)",
                fontSize: ".9rem",
                marginBottom: "1.5rem"
              }}
            >
              {"> SYSTEM.INITIALIZED"}
            </div>

            <div className="hero-content">

              <h1 className="hero-title">
                Learn anything. <br />
                <span style={{ color: "var(--text-secondary)" }}>Fast.</span>
              </h1>

              <p
                className="hero-subtitle"
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "1.1rem",
                  maxWidth: "600px",
                  margin: "0 auto 2.5rem auto"
                }}
              >
                Experience personalized learning powered by intelligent AI agents that create customized lessons,
                comprehensive study materials, and adaptive quizzes tailored just for you.
              </p>
              <div className="hero-cta" style={{ display: "flex", gap: "1rem", justifyContent: "center" }}></div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                <a href="/login" className="btn btn-primary">Start Learning</a>
                <a href="/register" className="btn btn-secondary">Create Account</a>
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* ================= FEATURES SECTION ================= */}
      <section className="features-section" style={{ marginTop: "1rem", paddingBottom: "8rem" }}>

        <h2 className="text-center">How Our AI Agents Help You Learn</h2>
        <p className="text-center" style={{ marginBottom: "3rem", color: "var(--text-secondary)" }}>
          Three specialized AI agents work together to create your perfect learning experience
        </p>

        <div className="features-grid">

          {/* CARD 1 */}
          <div className="feature-card-new">
            <div className="feature-gradient" />
            <div className="feature-content">
              <div className="feature-icon">
                <svg width="24" height="24" stroke="currentColor" fill="none"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16v4" />
                  <path d="M8 12a4 4 0 0 0-8 0" />
                  <path d="M16 12a4 4 0 0 1 8 0" />
                  <rect x="8" y="2" width="8" height="10" rx="2" />
                </svg>
              </div>
              <div className="feature-title-box">
                <div className="feature-bar"></div>
                <span className="feature-title-text">Assistant Agent</span>
              </div>
              <p className="feature-description">
                Your personal learning guide analyzes your topic and provides curated study materials and videos.
              </p>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="feature-card-new">
            <div className="feature-gradient" />
            <div className="feature-content">
              <div className="feature-icon">
                <svg width="24" height="24" stroke="currentColor" fill="none"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <div className="feature-title-box">
                <div className="feature-bar" />
                <span className="feature-title-text">Tutoring Agent</span>
              </div>
              <p className="feature-description">
                Generates structured personalized lessons tailored to your skill level.
              </p>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="feature-card-new">
            <div className="feature-gradient" />
            <div className="feature-content">
              <div className="feature-icon">
                <svg width="24" height="24" stroke="currentColor" fill="none"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <div className="feature-title-box">
                <div className="feature-bar" />
                <span className="feature-title-text">Testing Agent</span>
              </div>
              <p className="feature-description">
                Generates quizzes, evaluations & helps you assess knowledge instantly.
              </p>
            </div>
          </div>

        </div>
      </section>
    </main>
  </>
  );
}