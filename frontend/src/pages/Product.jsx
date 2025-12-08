/* src/pages/Product.jsx */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
    ArrowLeft, BookOpen, ChevronDown, ChevronUp, PlusCircle, LayoutGrid, 
    CheckCircle, ArrowRight 
} from "lucide-react";
import "../styles/product.css";

export default function Product() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedLessons, setExpandedLessons] = useState({});
    
    const [showToast, setShowToast] = useState(true);

    // --- GLOBAL STATUS STATE  ---
    // 1. Lazy init genStatus
    const [genStatus] = useState(() => 
        localStorage.getItem("dash_genStatus") || "idle"
    );
    
    // 2. Lazy init genId
    const [genId] = useState(() => 
        localStorage.getItem("dash_genId")
    );

    // 3. Initialize progress from Storage
    const [progress, setProgress] = useState(() => {
        const saved = localStorage.getItem("dash_progress");
        const status = localStorage.getItem("dash_genStatus");
        
        if (status === "running") {
            return saved ? parseInt(saved, 10) : 0;
        }
        return 100;
    });

    // 4. PROGRESS TIMER
    useEffect(() => {
        let interval;
        if (genStatus === "running") {
            interval = setInterval(() => {
                setProgress((old) => {
                    const next = (old >= 90 ? 90 : old + 1);
                    // SAVE to storage so Dashboard stays in sync
                    localStorage.setItem("dash_progress", next);
                    return next;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [genStatus]);

    // 5. TOAST AUTO-DISMISS
    useEffect(() => {
        if (genStatus === "completed" && String(genId) === String(id)) {
            const timer = setTimeout(() => {
                setShowToast(false);
                localStorage.removeItem("dash_genStatus"); 
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [genStatus, genId, id]);

    // 6. FETCH COURSE DATA
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

    // --- HELPERS ---
    const toggleLesson = (title) => {
        setExpandedLessons(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const formatLessonNumber = (n) => n.toString().padStart(2, "0");

    const getLessonNumber = (title) => {
        const match = title.match(/Lesson\s+(\d+)/i) || title.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 999;
    };

    const cleanTitle = (title) => {
        const boldMatch = title.match(/\*\*(.*?)\*\*/);
        if (boldMatch && boldMatch[1]) {
            return boldMatch[1].trim();
        }
        return title.replace(/^[#\s]+/, '').replace(/\*\*/g, '').trim();
    };

    const cleanOverview = (text) => {
        if (!text) return "";
        return text.replace(/^[#]+\s*/gm, '').replace(/\*\*/g, '').replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ').trim();
    };

    const cleanLessonContent = (content) => {
        if (!content) return "";
        let cleaned = content;
        cleaned = cleaned.replace(/^\s*(###|\*\*|##)\s*Lesson.*$/im, '');
        cleaned = cleaned.replace(/^\s*Lesson\s+\d+[:.].*$/im, '');
        cleaned = cleaned.replace(/Lesson\s+\d+:.*Lesson\s+\d+:.*\n?/i, '');
        cleaned = cleaned.replace(/^\s*###\s*/, '');
        return cleaned.trim();
    };

    // --- ACTIONS ---
    const handleToastClick = () => {
        if (genStatus === "completed" && genId) {
            if (String(genId) === String(id)) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                navigate(`/product/${genId}`);
            }
        } else {
            navigate("/dashboard", { state: { activeTab: "generate" } });
        }
    };

    const handleStartNewCourse = () => {
        if (genStatus === "running") {
            navigate("/dashboard", { state: { activeTab: "generate" } });
        } else {
            navigate("/dashboard", { state: { activeTab: "generate", resetForm: true } });
        }
    };

    if (loading) return <div className="loading-container">Loading Content...</div>;
    if (!course) return <div className="loading-container">Course data unavailable.</div>;

    const lessonKeys = course.lessons 
        ? Object.keys(course.lessons).sort((a, b) => getLessonNumber(a) - getLessonNumber(b)) 
        : [];

    return (
        <div className="product-container">
            
            {/* --- PERSISTENT FLOATING TOAST --- */}
            {genStatus !== "idle" && showToast && (
                <div
                    className="persistent-toast"
                    onClick={handleToastClick}
                    style={{
                        border: genStatus === "completed" ? "1px solid #03ae00" : "1px solid #333",
                        opacity: 0.9,
                        cursor: "pointer"
                    }}
                >
                    {genStatus === "running" ? (
                        <>
                            <div className="toast-pulse-dot"></div>
                            <div>
                                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#fff", display: "block" }}>Agent Active</span>
                                <span style={{ fontSize: "0.75rem", color: "#888" }}>Building Course... ({progress}%)</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ color: "#03ae00", display: "flex", alignItems: "center" }}><CheckCircle size={18} /></div>
                            <div>
                                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#fff", display: "block" }}>Course Ready!</span>
                                <span style={{ fontSize: "0.75rem", color: "#03ae00", fontWeight: "bold" }}>
                                    {String(genId) === String(id) ? "You are here" : "Click to Open"} <ArrowRight size={10} style={{ display: "inline" }} />
                                </span>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* --- NAVIGATION --- */}
            <nav className="product-nav">
                <button onClick={() => navigate("/dashboard")} className="nav-btn-back">
                    <ArrowLeft size={20}/> Back to Dashboard
                </button>
            </nav>

            {/* --- MAIN CONTENT --- */}
            <main className="product-main">
                
                <header className="product-header">
                    <h1 className="product-title">{course.topic}</h1>
                    <div className="product-meta">
                        <span>{course.subject?.toUpperCase() || "SUBJECT"}</span>
                        <span>||</span>
                        <span>GRADE {course.standard || "N/A"}</span>
                    </div>
                </header>

                <div className="product-layout">
                    {/* LEFT: Overview */}
                    <div className="overview-section">
                        <div className="overview-card">
                            <h3 className="overview-header">
                                <BookOpen size={18} color="#888"/> Course Overview
                            </h3>
                            <div className="overview-text" dangerouslySetInnerHTML={{ __html: cleanOverview(course.intro) }} />
                        </div>
                    </div>

                    {/* RIGHT: Lessons */}
                    <div className="lessons-section">
                        <h2 className="lessons-title">Curriculum</h2>
                        {lessonKeys.length > 0 ? lessonKeys.map((title, i) => (
                            <div key={i} className="lesson-card">
                                <div className="lesson-header" onClick={() => toggleLesson(title)}>
                                    <div className="lesson-header-content">
                                        <span className="lesson-number">{formatLessonNumber(i+1)}</span>
                                        <h3>{cleanTitle(title)}</h3>
                                    </div>
                                    {expandedLessons[title] ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                </div>
                                
                                {expandedLessons[title] && (
                                    <div className="lesson-body">
                                        <div className="html-content" dangerouslySetInnerHTML={{ __html: cleanLessonContent(course.lessons[title]) }}/>
                                        
                                        {course.tests && course.tests[title] && (
                                            <div className="quiz-box">
                                                <div className="quiz-header"><BookOpen size={18}/><span>Knowledge Check</span></div>
                                                <div className="html-content" dangerouslySetInnerHTML={{ __html: course.tests[title] }}/>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )) : (
                            <p style={{color: "#666", fontStyle:"italic"}}>No lessons available for this course yet.</p>
                        )}
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <div className="product-footer">
                    <button onClick={() => navigate("/dashboard")} className="btn-dashboard">
                        <LayoutGrid size={18} style={{marginRight:"8px"}}/> Dashboard
                    </button>
                    <button 
                        onClick={handleStartNewCourse} 
                        className="btn-new-course"
                    >
                        <PlusCircle size={18} style={{marginRight:"8px"}}/> Start New Course
                    </button>
                </div>

            </main>
        </div>
    );
}