import { useEffect } from "react";
import Navbar from "../components/Navbar";
import StackedCarousel from "../components/StackedCarousel";
import NeonOrbs from "../components/NeonOrbs";
import { initAnimations } from "../utils/animation";
import { Home, User, FileText, Briefcase } from "lucide-react";

const NAV_ITEMS = [
  { name: "Home", url: "/", icon: Home },
  { name: "Login", url: "/login", icon: User },
  { name: "Register", url: "/register", icon: FileText },
  { name: "About", url: "/about", icon: Briefcase }
];

export default function AboutUs() {

  useEffect(() => {
    document.body.setAttribute("data-theme", "dark");

    // 2. Init any animations
    initAnimations();
  }, []);

  const people = [
    {
      name: "Dravin Kumar Sharma",
      designation: "AI Enthusiast",
      quote: "I was impressed by the food quality and the AI recommendations. Truly a unique experience.",
      src: "/dravin.jpg",
      linkedin: "https://www.linkedin.com/in/dravin-kumar-sharma/"
    },
    {
      name: "U S Jagan Krishna",
      designation: "Frontend Developer",
      quote: "I like films and music, also I like to quoteS: What is this earth without art? Just a rock.",
      src: "jagan.png",
      linkedin: "https://www.linkedin.com/in/u-s-jagan-krishna-b60a88277/"
    },
    {
      name: "Ansh Raj",
      designation: "Research Guide",
      quote: "I am like a GPS for the library that prevents you from driving your thesis straight into a swamp of Wikipedia tabs and despair.",
      src: "ansh.jpg",
      linkedin: "https://www.linkedin.com/in/anshraj767/"
    },
  ];

  return (
    <>
      <Navbar items={NAV_ITEMS} />

      {/* Background Component */}
      <NeonOrbs />

      <main
        id="main-content"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "80px",
          zIndex: 1
        }}
      >
        <div className="about-header" style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h1 className="about-title" style={{
            fontSize: "3rem",
            fontWeight: "700",
            color: "#fff",
            marginBottom: "0.5rem"
          }}>
            Meet The Minds
          </h1>
          <p className="about-subtitle" style={{ color: "#ffffffff" }}>
            The architects behind the intelligence.
          </p>
        </div>

        <div className="about-carousel">
          <StackedCarousel testimonials={people} />
        </div>

      </main>
    </>
  );
}