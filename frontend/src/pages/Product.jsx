import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Home, ArrowLeft, ChevronDown, ChevronUp, Link as LinkIcon } from "lucide-react";
import "../styles/product.css"; 

const NAV_ITEMS = [
  { name: "Dashboard", url: "/dashboard", icon: Home },
];

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // UI Toggles
  const [showResources, setShowResources] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`http://localhost:5000/api/course/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setCourse(res.data);
      setLoading(false);
    })
    .catch(() => navigate("/dashboard"));
  }, [id, navigate]);

  const toggleLesson = (title) => {
    setExpandedLessons(prev => ({ ...prev, [title]: !prev[title] }));
  };

  if (loading) return <div style={{padding:"5rem", textAlign:"center"}}>Loading Course Data...</div>;

  return (
    <>
      <Navbar items={NAV_ITEMS} />

      <main id="main-content" style={{ padding: "3rem 4rem", maxWidth: "1600px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <header className="product-header" style={{ borderBottom: "1px solid #333", paddingBottom: "1rem", marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{course.topic}</h1>
            <p style={{ color: "#888", fontFamily: "monospace" }}>
                SUBJECT: {course.subject} // GRADE: {course.standard}
            </p>
        </header>

        <div className="product-layout" style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "4rem" }}>
            
            {/* LEFT COLUMN: Overview & Resources */}
            <div className="overview-section">
                
                {/* Overview Card */}
                <div className="glass-card mb-3" style={{ marginBottom: "1.5rem" }}>
                    <h3>Overview</h3>
                    <div style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "#ccc" }}>
                        {course.intro}
                    </div>
                </div>

                {/* Resources Card */}
                <div className="glass-card">
                    <h3>Resources</h3>
                    <p style={{ fontSize: "0.85rem", marginBottom: "1rem", color: "#888" }}>Curated materials for you.</p>

                    <div className="resource-dropdown">
                        <button 
                            className="btn btn-secondary" 
                            style={{ width: "100%", justifyContent: "space-between", display: "flex" }}
                            onClick={() => setShowResources(!showResources)}
                        >
                            <span>📚 View Materials</span>
                            <span>{showResources ? "▲" : "▼"}</span>
                        </button>

                        {showResources && course.links && (
                            <div className="resource-list" style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {course.links.map((link, i) => (
                                    <a key={i} href={link} target="_blank" rel="noreferrer" className="resource-item" style={{ 
                                        padding: "0.75rem", background: "#111", borderRadius: "4px", fontSize: "0.85rem", color: "#4facfe", textDecoration:"none"
                                    }}>
                                        🔗 {link.substring(0, 30)}...
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Lessons & Quizzes */}
            <div className="lessons-section">
                <h2 className="mb-3">Learning Path</h2>

                {course.lessons ? Object.keys(course.lessons).map((title, index) => (
                    <div key={index} className="lesson-card" style={{ marginBottom: "1rem", border: "1px solid #333", borderRadius: "6px", overflow: "hidden" }}>
                        
                        {/* HEADER */}
                        <div 
                            onClick={() => toggleLesson(title)}
                            className="lesson-header" 
                            style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", cursor: "pointer", background: "#0a0a0a" }}
                        >
                            <span>{title}</span>
                            <span>{expandedLessons[title] ? "▲" : "▼"}</span>
                        </div>

                        {/* CONTENT */}
                        {expandedLessons[title] && (
                            <div className="lesson-content" style={{ padding: "1.5rem", borderTop: "1px solid #333", background: "rgba(0,0,0,0.2)" }}>
                                
                                <div style={{ lineHeight: "1.7", marginBottom: "2rem", color: "#ddd", whiteSpace: "pre-wrap" }}>
                                    {course.lessons[title]}
                                </div>

                                {/* QUIZ */}
                                {course.tests && course.tests[title] && (
                                    <div className="quiz-section" style={{ background: "#111", padding: "1.5rem", borderRadius: "6px", border: "1px solid #333", borderLeft: "3px solid #a855f7" }}>
                                        <h4 style={{ marginBottom: "1rem", color: "#a855f7" }}>📝 Knowledge Check</h4>
                                        <div style={{ fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>
                                            {course.tests[title]}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="glass-card text-center"><p>No lessons available.</p></div>
                )}
            </div>

        </div>
      </main>
    </>
  );
}