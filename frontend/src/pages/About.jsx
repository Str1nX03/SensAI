// src/pages/About.jsx
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import { initBackground } from "../utils/scene";
import StackedCarousel from "../components/StackedCarousel";
import { Home, User, FileText, Briefcase } from "lucide-react";

const NAV_ITEMS = [
  { name:"Home", url:"/", icon:Home },
  { name:"Login", url:"/login", icon:User },
  { name:"Register", url:"/register", icon:FileText },
  { name:"About", url:"/about", icon:Briefcase }
];

export default function AboutUs() {
  
  useEffect(() => {
    initBackground();
  }, []);

  const people = [
    {
      name: "Dravin Kumar Sharma",
      designation: "AI Enthusiast",
      quote: "I was impressed by the food quality and the AI recommendations. Truly a unique experience.",
      src: "https://media.licdn.com/dms/image/v2/D4D03AQEyRcQMJzaL9w/profile-displayphoto-shrink_400_400/B4DZXObk5sGkAg-/0/1742925091798?e=1766016000&v=beta&t=V0FuErKJqL788VNvtAvidCW5yfAzYitFPwROrAtLgZA",
      linkedin: "https://www.linkedin.com/in/dravin-kumar-sharma/"
    },
    {
      name: "U S Jagan Krishna",
      designation: "Frontend Developer",
      quote: "I like Films and Designing. My job is to make things look cool and fluid for viewer's eyes.",
      src: "https://media.licdn.com/dms/image/v2/D4D03AQEhjlT2zRvQIw/profile-displayphoto-shrink_400_400/B4DZYv0BpOHAAg-/0/1744558890741?e=1766016000&v=beta&t=oqlVJ7qyI0y9ORzWo1UMk9YxryYJ2k3ZwJZeNzJ9R-M",
      linkedin: "https://www.linkedin.com/in/u-s-jagan-krishna-b60a88277/"
    },
  ];

  return (
    <>
      <Navbar items={NAV_ITEMS} />

      <main 
        id="main-content" 
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "80px"
        }}
      >
        {/* Render the new Stacked Style Carousel */}
        <StackedCarousel testimonials={people} />
      </main>
    </>
  );
}