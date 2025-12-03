import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutGrid, LogOut, PlusCircle, BookOpen, Activity, Cpu, Clock, Sparkles, Loader2, CheckCircle, ArrowRight, Trash2
} from "lucide-react";
import CpuArchitecture from "../components/CpuArchitecture";
import "../styles/dashboard.css";

const MOCK_USAGE_LOGS = [
    { id: 1, agent: "Curriculum Architect", action: "Generated Syllabus", tokens: 450, time: "2 mins ago", status: "success" },
    { id: 2, agent: "Quiz Generator", action: "Created Unit Test", tokens: 120, time: "15 mins ago", status: "success" },
    { id: 3, agent: "Resource Scraper", action: "Fetched PDF Links", tokens: 890, time: "1 hour ago", status: "warning" },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState(location.state?.activeTab || "courses");
    const [courses, setCourses] = useState([]);

    // GLOBAL GENERATION STATE
    const [generationStatus, setGenerationStatus] = useState("idle");
    const [progress, setProgress] = useState(0);
    const [generatedCourseId, setGeneratedCourseId] = useState(null);
    const progressInterval = useRef(null);

    const [form, setForm] = useState({ subject: "", topic: "", standard: "" });

    useEffect(() => {
        if (location.state?.activeTab) {
            window.history.replaceState({}, document.title);
        }
    }, []);

    // Fetch Courses
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        axios.get("http://localhost:5000/api/courses", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => { if (res.data.courses) setCourses(res.data.courses); })
            .catch(err => console.error(err));
    }, [navigate]);

    // Cleanup interval
    useEffect(() => { return () => clearInterval(progressInterval.current); }, []);

    const updateForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // GENERATE LOGIC
    const generateCourse = async (e) => {
        e.preventDefault();
        if (!form.topic || !form.subject || !form.standard) return alert("Please fill all fields");

        setGenerationStatus("running");
        setProgress(0);

        // Progress Simulation
        progressInterval.current = setInterval(() => {
            setProgress((old) => {
                if (old >= 90) return 90;
                return old + (old < 50 ? 5 : 2);
            });
        }, 800);

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post("http://localhost:5000/api/generate", form, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                clearInterval(progressInterval.current);
                setProgress(100);
                setGeneratedCourseId(res.data.course_id);
                setGenerationStatus("completed");
            }
        } catch (error) {
            clearInterval(progressInterval.current);
            setGenerationStatus("idle");
            alert("Agent connection failed.");
            console.error(error);
        }
    };

    // DELETE LOGIC
    const handleDeleteCourse = async (e, courseId) => {
        e.stopPropagation();
        
        if (window.confirm("Are you sure you want to permanently delete this course? This action cannot be undone.")) {
            try {
                const token = localStorage.getItem("token");
                setCourses(prev => prev.filter(c => c.id !== courseId));

                await axios.delete(`http://localhost:5000/api/courses/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (error) {
                console.error("Failed to delete course", error);
                alert("Failed to delete course. Please try again.");
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:5000/api/courses", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.courses) setCourses(res.data.courses);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleToastClick = () => {
        if (generationStatus === "completed" && generatedCourseId) {
            navigate(`/product/${generatedCourseId}`);
            setGenerationStatus("idle");
            setForm({ subject: "", topic: "", standard: "" });
        } else {
            setActiveTab("generate");
        }
    };

    return (
        <div className="app-container">
            {/* --- SMART TOAST --- */}
            {generationStatus !== "idle" && (
                <div
                    className="floating-status"
                    onClick={handleToastClick}
                    style={{
                        borderColor: generationStatus === "completed" ? "#03ae00" : "#333",
                        opacity: generationStatus === "completed" ? 1 : 0.6
                    }}
                >
                    {generationStatus === "running" ? (
                        <>
                            <div className="status-dot"></div>
                            <div>
                                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#fff", display: "block" }}>Agents Active</span>
                                <span style={{ fontSize: "0.75rem", color: "#888" }}>Building "{form.topic}" ({progress}%)</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ color: "#03ae00", display: "flex", alignItems: "center" }}><CheckCircle size={18} /></div>
                            <div>
                                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#fff", display: "block" }}>Course Ready!</span>
                                <span style={{ fontSize: "0.75rem", color: "#03ae00", fontWeight: "bold" }}>Click to Open <ArrowRight size={10} style={{ display: "inline" }} /></span>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* --- SIDEBAR --- */}
            <aside className="sidebar">
                <div className="user-profile">
                    <img src="https://ui-avatars.com/api/?name=Student&background=333&color=fff" alt="Profile" className="avatar" />
                    <div className="user-info"><h3>Student</h3><p>Pro Plan</p></div>
                </div>

                <nav className="nav-menu">
                    <button className={`nav-item ${activeTab === 'usage' ? 'active' : ''}`} onClick={() => setActiveTab('usage')}>
                        <Activity size={20} /> Usage Logs
                    </button>
                    <div style={{ height: "1px", background: "#222", margin: "0.5rem 0" }}></div>

                    <button
                        className={`nav-item ${activeTab === 'generate' ? 'active' : ''}`}
                        onClick={() => setActiveTab('generate')}
                        style={{ color: activeTab === 'generate' ? "#fff" : "#ccc" }}
                    >
                        {generationStatus === "running" ? <Loader2 size={20} className="animate-spin" /> : <PlusCircle size={20} />}
                        Generate Course
                    </button>

                    <button className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
                        <LayoutGrid size={20} /> Active Courses
                    </button>
                    <div style={{ flexGrow: 1 }}></div>
                    <button className="nav-item" onClick={handleLogout}><LogOut size={20} /> Logout</button>
                </nav>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="main-content-area">

                {activeTab === 'usage' && (
                    <div className="fade-in">
                        <header className="dashboard-header"><div><h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Agent Activity</h1></div></header>
                        <div style={{ display: "grid", gap: "1rem" }}>
                            {MOCK_USAGE_LOGS.map((log) => (
                                <div key={log.id} style={{ display: "grid", gridTemplateColumns: "50px 2fr 2fr 1fr 1fr", alignItems: "center", background: "#0a0a0a", border: "1px solid #222", padding: "1.5rem", borderRadius: "12px" }}>
                                    <div style={{ color: "#666" }}><Cpu size={20} /></div>
                                    <div><h4 style={{ margin: 0, fontSize: "1rem" }}>{log.agent}</h4><span style={{ fontSize: "0.8rem", color: "#666" }}>ID: 00{log.id}</span></div>
                                    <div style={{ fontSize: "0.95rem", color: "#ccc" }}>{log.action}</div>
                                    <div style={{ fontSize: "0.9rem", color: "#888", display: "flex", alignItems: "center", gap: "6px" }}><Clock size={14} /> {log.time}</div>
                                    <div style={{ textAlign: "right", fontFamily: "monospace", color: log.status === 'success' ? "#03ae00" : "#eab308" }}>{log.tokens} TKN</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'generate' && (
                    <div className="fade-in" style={{ maxWidth: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                        {generationStatus === "idle" && (
                            <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
                                <header className="dashboard-header" style={{ justifyContent: "center", textAlign: "center", border: "none" }}>
                                    <div>
                                        <div style={{ display: "inline-flex", padding: "12px", background: "#1a1a1a", borderRadius: "12px", marginBottom: "1rem", color: "#fff" }}><Sparkles size={28} /></div>
                                        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Orchestrate New Course</h1>
                                        <p style={{ fontSize: "1.1rem", color: "#888" }}>Define parameters for your personal AI swarm.</p>
                                    </div>
                                </header>
                                <div className="glass-card" style={{ padding: "3rem", background: "#0a0a0a", border: "1px solid #333" }}>
                                    <form onSubmit={generateCourse}>
                                        <div className="form-group"><label className="form-label">Subject</label><input name="subject" className="form-input" placeholder="e.g. Computer Science" onChange={updateForm} value={form.subject} autoFocus required /></div>
                                        <div className="form-group"><label className="form-label">Specific Topic</label><input name="topic" className="form-input" placeholder="e.g. Neural Networks" onChange={updateForm} value={form.topic} required /></div>
                                        <div className="form-group"><label className="form-label">Grade / Proficiency</label><input name="standard" type="number" className="form-input" placeholder="1 - 12" onChange={updateForm} value={form.standard} required /></div>
                                        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "2rem", height: "55px", background: "#fff", color: "#000", fontWeight: "bold" }}>Initialize Agents & Build Course</button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {generationStatus === "running" && (
                            <div style={{ 
                                display: "flex", 
                                flexDirection: "column", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                flexGrow: 1, 
                                minHeight: "60vh",
                                textAlign: "center"
                            }}>
                                {/* Bigger Animation */}
                                <div style={{ transform: "scale(1.3)", marginBottom: "2rem" }}>
                                    <CpuArchitecture height="260px" centralLogoUrl="/gojo.png" />
                                </div>
                                
                                <h2 style={{ marginTop: "1rem", color: "#fff", fontWeight: "500" }}>Constructing Curriculum...</h2>
                                <p style={{ color: "#666", marginBottom: "2rem" }}>Agents are researching {form.topic}...</p>
                                
                                {/* New Small Progress Bar Style */}
                                <div style={{ width: "320px", display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ flexGrow: 1, height: "6px", background: "#222", borderRadius: "10px", overflow: "hidden" }}>
                                        <div style={{ 
                                            height: "100%", 
                                            background: "#fff", 
                                            width: `${progress}%`, 
                                            transition: "width 0.4s ease-out",
                                            boxShadow: "0 0 10px rgba(255,255,255,0.5)" 
                                        }}></div>
                                    </div>
                                    <span style={{ fontSize: "0.85rem", color: "#fff", fontFamily: "monospace", minWidth: "35px" }}>
                                        {Math.round(progress)}%
                                    </span>
                                </div>
                            </div>
                        )}

                        {generationStatus === "completed" && (
                            <div style={{ textAlign: "center", paddingTop: "5rem" }}>
                                <div style={{ display: "inline-flex", padding: "1.5rem", borderRadius: "50%", background: "rgba(3, 174, 0, 0.1)", color: "#03ae00", marginBottom: "1.5rem" }}><CheckCircle size={48} /></div>
                                <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Course Ready!</h2>
                                <p style={{ color: "#888", marginBottom: "2rem" }}>Your personalized course on <b>{form.topic}</b> has been generated.</p>
                                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                                    <button className="btn btn-primary" onClick={() => { navigate(`/product/${generatedCourseId}`); setGenerationStatus("idle"); setForm({ subject: "", topic: "", standard: "" }); }} style={{ background: "#fff", color: "#000", fontWeight: "bold", padding: "0 2rem" }}>Start Learning Now</button>
                                    <button className="btn btn-secondary" onClick={() => { setGenerationStatus("idle"); setForm({ subject: "", topic: "", standard: "" }); }}>Create Another</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div className="fade-in">
                        <header className="dashboard-header"><div><h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Active Courses</h1></div></header>
                        <div className="bento-grid">
                            <div className="bento-card create-card" onClick={() => setActiveTab('generate')}>
                                <div style={{ background: "#1a1a1a", padding: "1rem", borderRadius: "50%" }}><PlusCircle size={24} /></div><span style={{ fontWeight: 500 }}>Create New Course</span>
                            </div>
                            {courses.map(course => (
                                <div key={course.id} className="bento-card" onClick={() => navigate(`/product/${course.id}`)} style={{ position: "relative", group: "course-card" }}>
                                    {/* Delete Button */}
                                    <button 
                                        onClick={(e) => handleDeleteCourse(e, course.id)}
                                        style={{
                                            position: "absolute",
                                            top: "12px",
                                            right: "12px",
                                            background: "rgba(0,0,0,0.5)",
                                            border: "none",
                                            borderRadius: "8px",
                                            padding: "6px",
                                            color: "#888",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            zIndex: 10
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = "#ff4444"; e.currentTarget.style.background = "rgba(255, 68, 68, 0.1)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = "#888"; e.currentTarget.style.background = "rgba(0,0,0,0.5)"; }}
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <div className="card-top">
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", color: "#666", fontSize: "0.8rem" }}><BookOpen size={14} />{course.subject}</div>
                                        <h4>{course.topic}</h4>
                                    </div>
                                    <span className="card-badge">Grade {course.standard}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}