/* src/pages/Product.jsx */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, ExternalLink, PlusCircle, LayoutGrid } from "lucide-react";
import "../styles/product.css";

export default function Product() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedLessons, setExpandedLessons] = useState({});

    // Fetch Course
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        axios.get(`http://localhost:5000/api/course/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            const data = res.data.course || res.data;
            setCourse(data);
            setLoading(false);
        })
        .catch(err => {
            console.error("Error fetching course:", err);
            setLoading(false);
        });
    }, [id, navigate]);

    const toggleLesson = (title) => {
        setExpandedLessons(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const formatLessonNumber = (n) => n.toString().padStart(2, "0");

    const getLessonNumber = (title) => {
        const match = title.match(/Lesson\s+(\d+)/i) || title.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 999;
    };

    if (loading) return <div className="p-5 text-center" style={{color:"#fff"}}>Loading Content...</div>;
    if (!course) return <div className="p-5 text-center" style={{color:"#fff"}}>Course data unavailable.</div>;

    const safeIntro = course.intro 
        ? course.intro.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ') 
        : "";

    // Sort lesson keys
    const lessonKeys = course.lessons 
        ? Object.keys(course.lessons).sort((a, b) => getLessonNumber(a) - getLessonNumber(b)) 
        : [];

    return (
        <div style={{ background: "#0d0d0d", minHeight: "100vh", color: "#fff" }}>
            <style>{`
                .study-link-item {
                    color: #888;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-decoration: none;
                    margin-bottom: 8px;
                    transition: color 0.2s ease;
                    font-size: 0.9rem;
                }
                .study-link-item:hover {
                    color: #fff;
                }
            `}</style>

            {/* NAV */}
            <nav style={{ padding: "1.5rem 3rem", borderBottom: "1px solid #333", display: "flex", alignItems: "center" }}>
                <button 
                    onClick={() => navigate("/dashboard")} 
                    style={{ background:"none", border:"none", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:"10px" }}
                >
                    <ArrowLeft size={20}/> Back to Dashboard
                </button>
            </nav>

            <main className="product-page" style={{ maxWidth:"1200px", margin:"0 auto", padding:"3rem 2rem" }}>
                
                {/* HEADER */}
                <header style={{ textAlign:"center", marginBottom:"4rem" }}>
                    <h1 style={{ fontSize:"3rem", fontWeight:"700", marginBottom:"1rem", background:"linear-gradient(to right, #fff, #888)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                        {course.topic}
                    </h1>
                    <div style={{ fontFamily:"monospace", display:"inline-flex", gap:"1rem", color:"#888" }}>
                        <span>{course.subject?.toUpperCase() || "SUBJECT"}</span>
                        <span>//</span>
                        <span>GRADE {course.standard || "N/A"}</span>
                    </div>
                </header>

                <div className="product-layout" style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:"3rem" }}>
                    
                    {/* --- LEFT SIDEBAR (Overview & Resources Merged) --- */}
                    <div className="overview-section">
                        <div className="glass-card" style={{ background:"#1a1a1a", border:"1px solid #333", padding:"1.5rem", borderRadius:"12px" }}>
                            
                            {/* Overview Part */}
                            <h3 style={{ fontSize:"1.1rem", marginBottom:"1rem", color:"#fff" }}>Overview</h3>
                            <div className="html-content simple-text" dangerouslySetInnerHTML={{ __html: safeIntro }} />

                            {course.links && course.links.length > 0 && (
                                <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #333" }}>
                                    <h3 style={{ fontSize:"1.1rem", marginBottom:"1rem", color:"#fff" }}>Resources</h3>
                                    <div style={{ display:"flex", flexDirection:"column" }}>
                                        {course.links.map((rawLink, i) => {
                                            let linkStr = "";
                                            if (typeof rawLink === "string") linkStr = rawLink;
                                            else if (typeof rawLink === "object" && rawLink !== null) linkStr = rawLink.url || rawLink.link || "";
                                            
                                            if (!linkStr) return null;

                                            let displayUrl = linkStr;
                                            let hostname = "External Resource";
                                            
                                            try {
                                                if (!linkStr.startsWith("http")) linkStr = "https://" + linkStr;
                                                const u = new URL(linkStr);
                                                displayUrl = u.href;
                                                hostname = u.hostname.replace("www.", "");
                                            } catch {
                                                hostname = "Resource " + (i + 1);
                                            }

                                            return (
                                                <a 
                                                    key={i} 
                                                    href={displayUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="study-link-item"
                                                >
                                                    <ExternalLink size={14}/>
                                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hostname}</span>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT SIDE (Lessons) --- */}
                    <div className="lessons-section">
                        <h2 style={{ fontSize:"1.8rem", marginBottom:"2rem" }}>Curriculum</h2>
                        {lessonKeys.length > 0 ? lessonKeys.map((title, i) => (
                            <div key={i} className="lesson-card">
                                <div className="lesson-header" onClick={() => toggleLesson(title)}>
                                    <div style={{ display:"flex", alignItems:"center" }}>
                                        <span className="lesson-number">{formatLessonNumber(i+1)}</span>
                                        <h3>{title}</h3>
                                    </div>
                                    {expandedLessons[title] ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                </div>
                                {expandedLessons[title] && (
                                    <div className="lesson-content">
                                        <div className="html-content" dangerouslySetInnerHTML={{ __html: course.lessons[title] }}/>
                                        {course.tests && course.tests[title] && (
                                            <div className="quiz-box">
                                                <div className="quiz-title"><BookOpen size={18}/><span>Knowledge Check</span></div>
                                                <div className="html-content" dangerouslySetInnerHTML={{ __html: course.tests[title] }}/>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )) : (
                            <p style={{color: "#666"}}>No lessons available.</p>
                        )}
                    </div>
                </div>

                {/* --- FOOTER BUTTONS --- */}
                <div style={{ marginTop: "5rem", borderTop: "1px solid #222", paddingTop: "2rem", display: "flex", justifyContent: "center", gap: "1.5rem" }}>
                    <button 
                        onClick={() => navigate("/dashboard")} 
                        className="btn btn-secondary"
                        style={{ padding: "0.8rem 1.5rem", borderRadius: "8px", borderColor: "#333", color: "#ccc", display:"flex", alignItems:"center" }}
                    >
                        <LayoutGrid size={18} style={{marginRight:"8px"}}/> Dashboard
                    </button>
                    <button 
                        onClick={() => navigate("/dashboard", { state: { activeTab: "generate" } })} 
                        className="btn btn-primary" 
                        style={{ background:"#fff", color:"#000", fontWeight: "600", padding: "0.8rem 1.5rem", borderRadius: "8px", display:"flex", alignItems:"center" }}
                    >
                        <PlusCircle size={18} style={{marginRight:"8px"}}/> Start New Course
                    </button>
                </div>

            </main>
        </div>
    );
}