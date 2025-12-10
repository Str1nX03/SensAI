import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutGrid, LogOut, PlusCircle, BookOpen, Activity, Cpu, Clock, Sparkles,
    Loader2, CheckCircle, ArrowRight, Trash2, AlertTriangle, X, ServerCrash, ArrowLeft
} from "lucide-react";
import CpuArchitecture from "../components/CpuArchitecture";
import GlobalProgressToast from "../components/GlobalProgressToast";
import "../styles/dashboard.css";

// --- CATALOG DATA  ---
const CATALOG_DATA = {
    "Mathematics": ["Calculus", "Matrix", "Multiplication", "Trigonometry", "Mensuration", "Algebra", "Geometry", "Statistics"],
    "Physics": ["Kinematics", "Thermodynamics", "Electromagnetism", "Optics", "Quantum Mechanics", "Nuclear Physics", "Astrophysics"],
    "Chemistry": ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Nuclear Chemistry", "Analytical Chemistry", "Environmental Chemistry"],
    "Biology": ["Genetics", "Cell Biology", "Ecology", "Evolution", "Molecular Biology", "Immunity", "Neuroscience"],
    "Computer Science": ["Data Structures", "Algorithms", "Web Development", "Artificial Intelligence", "Database Management", "Cybersecurity", "Operating Systems", "Machine Learning", "Cloud Computing"]
};

const MOCK_USAGE_LOGS = [
    { id: 1, agent: "RAG+", action: "Better Accuracy", tokens: "Beta", time: "Active", status: "free to use" },
    { id: 2, agent: "Usage", action: "Token and Log Count", tokens: "under progress", time: "coming soon", status: "under progress" },
    { id: 3, agent: "PDF", action: "Download PDF", tokens: "ongoing", time: "coming soon", status: "under progress" },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    // --- 1. STATE INITIALIZATION ---
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || "courses");
    const [courses, setCourses] = useState([]);

    const [generationStatus, setGenerationStatus] = useState(() => {
        return localStorage.getItem("dash_genStatus") || "idle";
    });

    const [generatedCourseId, setGeneratedCourseId] = useState(() => {
        const saved = localStorage.getItem("dash_genId");
        return saved && saved !== "null" && saved !== "undefined" ? parseInt(saved, 10) : null;
    });

    const [newlyCreatedId, setNewlyCreatedId] = useState(() => {
        const saved = localStorage.getItem("dash_newId");
        return saved && saved !== "null" && saved !== "undefined" ? parseInt(saved, 10) : null;
    });

    const [progress, setProgress] = useState(() => {
        const saved = localStorage.getItem("dash_progress");
        return saved ? parseInt(saved, 10) : 0;
    });

    const progressInterval = useRef(null);
    const [form, setForm] = useState({ subject: "", topic: "", standard: "" });

    // MODAL STATES
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
    const [errorModal, setErrorModal] = useState({ show: false, message: "" });
    
    // CATALOG MODAL STATES
    const [catalogModal, setCatalogModal] = useState(false);
    const [catalogStep, setCatalogStep] = useState("subject"); 
    const [selectedCatalogSubject, setSelectedCatalogSubject] = useState(null);

    // --- 2. HELPERS ---
    const handleLogout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("dash_genStatus");
        localStorage.removeItem("dash_genId");
        localStorage.removeItem("dash_newId");
        localStorage.removeItem("dash_progress");
        sessionStorage.removeItem("dash_session_active");
        navigate("/login");
    }, [navigate]);

    const fetchCourses = useCallback(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        axios.get("http://localhost:5000/api/courses", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (res.data.courses) {
                    setCourses(res.data.courses);
                }
            })
            .catch(err => {
                console.error(err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    handleLogout();
                }
            });
    }, [navigate, handleLogout]);

    const startProgressLoop = useCallback(() => {
        clearInterval(progressInterval.current);
        progressInterval.current = setInterval(() => {
            setProgress((old) => {
                if (old >= 90) return 90;
                const next = old + (old < 50 ? 5 : 1);
                localStorage.setItem("dash_progress", next);
                return next;
            });
        }, 800);
    }, []);

    // --- 3. INTELLIGENT REFRESH DETECTION ---
    useEffect(() => {
        if (location.state?.activeTab) {
            window.history.replaceState({}, document.title);
        }

        const savedStatus = localStorage.getItem("dash_genStatus");
        const isEnvironmentAlive = sessionStorage.getItem("dash_session_active") === "true";

        if (savedStatus === "running") {
            if (!isEnvironmentAlive) {
                setGenerationStatus("idle");
                localStorage.setItem("dash_genStatus", "idle");
                localStorage.removeItem("dash_progress");
                sessionStorage.removeItem("dash_session_active");
                
                setErrorModal({
                    show: true,
                    message: "Generation was interrupted. Please try again."
                });
            } else {
                setGenerationStatus("running");
                startProgressLoop();
            }
        }
        else if (location.state?.resetForm) {
            if (savedStatus !== "running") {
                setGenerationStatus("idle");
                setForm({ subject: "", topic: "", standard: "" });
                localStorage.removeItem("dash_genStatus");
                localStorage.removeItem("dash_genId");
                localStorage.removeItem("dash_progress");
                sessionStorage.removeItem("dash_session_active");
            }
        }
        else if (savedStatus === "completed") {
            setGenerationStatus("completed");
            setProgress(100);
            const savedId = localStorage.getItem("dash_genId");
            if (savedId && savedId !== "null") {
                setGeneratedCourseId(parseInt(savedId, 10));
            }
        }

        fetchCourses();
        return () => clearInterval(progressInterval.current);
    }, [fetchCourses, location.state, startProgressLoop]);

    // PREVENT ACCIDENTAL LEAVING
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (generationStatus === "running") {
                e.preventDefault();
                e.returnValue = "";
                return "Generation is in progress. Leaving now will cancel it.";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [generationStatus]);

    const updateForm = (e) => {
        let { name, value } = e.target;
        if (name === "standard") {
            if (value > 12) value = "12";
            if (value < 0) value = "1"; 
        }
        setForm({ ...form, [name]: value });
    };

    const openCatalog = () => {
        setCatalogStep("subject");
        setCatalogModal(true);
    };

    const handleSubjectSelect = (subject) => {
        setSelectedCatalogSubject(subject);
        setCatalogStep("topic");
    };

    const handleTopicSelect = (topic) => {
        setForm(prev => ({
            ...prev,
            subject: selectedCatalogSubject,
            topic: topic
        }));
        setCatalogModal(false);
    };

    const handleCatalogBack = () => {
        setCatalogStep("subject");
        setSelectedCatalogSubject(null);
    };

    // --- 4. ACTIONS ---
    const generateCourse = async (e) => {
        e.preventDefault();
        if (!form.topic || !form.subject || !form.standard) return alert("Please fill all fields");

        sessionStorage.setItem("dash_session_active", "true");
        setGenerationStatus("running");
        setProgress(0);
        localStorage.setItem("dash_progress", "0");
        startProgressLoop();
        localStorage.setItem("dash_genStatus", "running");

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post("http://localhost:5000/api/generate", form, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                clearInterval(progressInterval.current);
                setProgress(100);
                localStorage.setItem("dash_progress", "100");

                const rawId = res.data.course_id || res.data.id || res.data.courseId;
                const newId = rawId ? parseInt(rawId, 10) : null;

                if (!newId) throw new Error("Server responded with success but no Course ID.");

                setGeneratedCourseId(newId);
                setGenerationStatus("completed");
                setNewlyCreatedId(newId);

                localStorage.setItem("dash_genStatus", "completed");
                localStorage.setItem("dash_genId", newId);
                localStorage.setItem("dash_newId", newId);

                fetchCourses();
            }
        } catch (error) {
            clearInterval(progressInterval.current);
            setGenerationStatus("idle");
            localStorage.setItem("dash_genStatus", "idle");
            localStorage.removeItem("dash_progress");
            sessionStorage.removeItem("dash_session_active");
            
            console.error(error);
            setErrorModal({
                show: true,
                message: "Generation failed. Please try again."
            });
        }
    };

    const confirmDeleteRequest = (e, courseId) => {
        e.stopPropagation();
        setDeleteModal({ show: true, id: courseId });
    };

    const executeDelete = async () => {
        const courseId = deleteModal.id;
        if (!courseId) return;

        try {
            const token = localStorage.getItem("token");
            setCourses(prev => prev.filter(c => c.id !== courseId));
            setDeleteModal({ show: false, id: null });

            if (courseId === newlyCreatedId) {
                setNewlyCreatedId(null);
                localStorage.removeItem("dash_newId");
            }
            if (courseId === generatedCourseId) {
                setGenerationStatus("idle");
                localStorage.removeItem("dash_genStatus");
                localStorage.removeItem("dash_genId");
                localStorage.removeItem("dash_progress");
                sessionStorage.removeItem("dash_session_active");
            }

            await axios.delete(`http://localhost:5000/api/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Failed to delete course", error);
            setDeleteModal({ show: false, id: null });
            setErrorModal({ show: true, message: "Failed to delete course. Server might be unreachable." });
            fetchCourses();
        }
    };

    const openCourse = (courseId) => {
        const targetId = courseId || localStorage.getItem("dash_genId");
        
        if (!targetId || targetId === "null" || targetId === "undefined") {
            setErrorModal({ 
                show: true, 
                message: "Course ID is missing. Please create a new course." 
            });
            return;
        }
        
        const validId = parseInt(targetId, 10);
        if (validId === newlyCreatedId) {
            setNewlyCreatedId(null);
            localStorage.removeItem("dash_newId");
        }
        navigate(`/product/${validId}`);
    };

    return (
        <div className="app-container">

            {/* --- CATALOG MODAL --- */}
            {catalogModal && (
                <div className="dashboard-modal-overlay">
                    <div className="dashboard-modal dashboard-catalog-modal">
                        <button onClick={() => setCatalogModal(false)} className="dashboard-modal-close">
                            <X size={20} />
                        </button>
                        
                        {catalogStep === "subject" ? (
                            <div className="catalog-content">
                                <h3 className="dashboard-modal-title" style={{textAlign: "center", marginBottom: "5px"}}>Select a Subject</h3>
                                <div className="catalog-grid">
                                    {Object.keys(CATALOG_DATA).map((subject) => (
                                        <button key={subject} className="catalog-item-btn" onClick={() => handleSubjectSelect(subject)}>
                                            {subject}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="catalog-content">
                                <div style={{display: "flex", alignItems: "center", marginBottom: "20px"}}>
                                    <button onClick={handleCatalogBack} className="btn-icon-text" style={{marginRight: "15px", background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer"}}>
                                        <ArrowLeft size={20} /> Back
                                    </button>
                                    <h3 className="dashboard-modal-title" style={{margin: 0}}>Select Topic</h3>
                                </div>
                                <div className="catalog-grid">
                                    {CATALOG_DATA[selectedCatalogSubject]?.map((topic) => (
                                        <button key={topic} className="catalog-item-btn" onClick={() => handleTopicSelect(topic)}>
                                            {topic}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- ERROR MODAL --- */}
            {errorModal.show && (
                <div className="dashboard-modal-overlay">
                    <div className="dashboard-modal dashboard-modal-error">
                        <button onClick={() => setErrorModal({ show: false, message: "" })} className="dashboard-modal-close"><X size={20} /></button>
                        <div className="dashboard-modal-icon dashboard-modal-icon-error"><ServerCrash size={32} /></div>
                        <h3 className="dashboard-modal-title">Attention</h3>
                        <p className="dashboard-modal-text">{errorModal.message}</p>
                        <button onClick={() => setErrorModal({ show: false, message: "" })} className="btn dashboard-modal-primary-btn">Dismiss</button>
                    </div>
                </div>
            )}

            {/* --- DELETE MODAL --- */}
            {deleteModal.show && (
                <div className="dashboard-modal-overlay">
                    <div className="dashboard-modal dashboard-modal-delete">
                        <div className="dashboard-modal-icon dashboard-modal-icon-warning"><AlertTriangle size={32} /></div>
                        <h3 className="dashboard-modal-title">Delete Course?</h3>
                        <div className="dashboard-modal-actions">
                            <button onClick={() => setDeleteModal({ show: false, id: null })} className="btn dashboard-modal-btn dashboard-modal-btn-cancel">Cancel</button>
                            <button onClick={executeDelete} className="btn dashboard-modal-btn dashboard-modal-btn-danger">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SIDEBAR --- */}
            <aside className="sidebar">
                <div className="user-profile">
                    <img src="https://ui-avatars.com/api/?name=Student&background=333&color=fff" alt="Profile" className="avatar" />
                    <div className="user-info"><h3>Student</h3><p>Pro Plan</p></div>
                </div>
                <nav className="nav-menu">
                    <button className={`nav-item ${activeTab === "usage" ? "active" : ""}`} onClick={() => setActiveTab("usage")}><Activity size={20} /> Upcoming Features</button>
                    <div className="dashboard-sidebar-divider"></div>
                    <button className={`nav-item ${activeTab === "generate" ? "active" : ""}`} onClick={() => setActiveTab("generate")}>
                        {generationStatus === "running" ? <Loader2 size={20} className="animate-spin" /> : <PlusCircle size={20} />} Generate Course
                    </button>
                    <button className={`nav-item ${activeTab === "courses" ? "active" : ""}`} onClick={() => setActiveTab("courses")}><LayoutGrid size={20} /> Active Courses</button>
                    <div className="dashboard-nav-spacer"></div>
                    <button className="nav-item logout-btn" onClick={handleLogout}><LogOut size={20} /> Logout</button>
                </nav>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="main-content-area">
                {/* --- ADDED GLOBAL TOAST HERE --- */}
                <GlobalProgressToast />

                {activeTab === "usage" && (
                    <div className="fade-in">
                        <header className="dashboard-header"><div><h1 className="dashboard-page-title">Agent Activity</h1></div></header>
                        <div className="dashboard-usage-list">
                            {MOCK_USAGE_LOGS.map((log) => (
                                <div key={log.id} className="dashboard-usage-row">
                                    <div className="dashboard-usage-icon"><Cpu size={20} /></div>
                                    <div><h4 className="dashboard-usage-agent">{log.agent}</h4><span className="dashboard-usage-id">ID: 00{log.id}</span></div>
                                    <div className="dashboard-usage-action">{log.action}</div>
                                    <div className="dashboard-usage-time"><Clock size={14} /> {log.time}</div>
                                    <div className={`dashboard-usage-tokens ${log.status === "success" ? "dashboard-usage-tokens--success" : "dashboard-usage-tokens--warning"}`}>
                                        {log.tokens} <Clock size={14} className="dashboard-usage-clock-icon" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "generate" && (
                    <div className="fade-in dashboard-generate-root">
                        {generationStatus === "idle" && (
                            <div className="dashboard-generate-form-shell">
                                <header className="dashboard-header dashboard-generate-header">
                                    <div>
                                        <div className="dashboard-generate-icon"><Sparkles size={24} /></div>
                                        <h1 className="dashboard-generate-title">Orchestrate New Course</h1>
                                        <p className="dashboard-generate-subtitle">Define parameters for your personal AI swarm.</p>
                                    </div>
                                </header>
                                <div className="glass-card dashboard-generate-card">
                                    <form onSubmit={generateCourse}>
                                        <div style={{ marginBottom: "20px" }}>
                                            <button type="button" onClick={openCatalog} className="btn-secondary" style={{width: "100%", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", border: "1px dashed var(--text-quinary)", background: "rgba(41, 121, 255, 0.1)", color: "var(--text-quinary)", borderRadius: "8px", cursor: "pointer"}}>
                                                <BookOpen size={18} /> Browse Subject & Topic Catalog
                                            </button>
                                        </div>
                                        <div className="form-group"><label className="form-label">Subject</label><input name="subject" className="form-input" placeholder="e.g. Computer Science" onChange={updateForm} value={form.subject} required /></div>
                                        <div className="form-group"><label className="form-label">Specific Topic</label><input name="topic" className="form-input" placeholder="e.g. Neural Networks" onChange={updateForm} value={form.topic} required /></div>
                                        <div className="form-group"><label className="form-label">Grade / Proficiency</label><input name="standard" type="number" className="form-input" placeholder="1 - 12" onChange={updateForm} value={form.standard} min="1"max="12"required /></div>
                                        <button type="submit" className="btn btn-primary dashboard-generate-submit">Initialize Agents & Build Course</button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {generationStatus === "running" && (
                            <div className="dashboard-running-view">
                                <div className="dashboard-running-visual"><CpuArchitecture height="260px" centralLogoUrl="/gojo.png" /></div>
                                <h2 className="dashboard-running-title">Constructing Curriculum...</h2>
                                <p className="dashboard-running-text">Agents are researching {form.topic || "content"}...</p>
                                <div className="dashboard-progress-wrapper">
                                    <div className="dashboard-progress-track">
                                        <div className="dashboard-progress-fill" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <span className="dashboard-progress-label">{Math.round(progress)}%</span>
                                </div>
                            </div>
                        )}

                        {generationStatus === "completed" && (
                            <div className="dashboard-completed-view">
                                <div className="dashboard-completed-icon"><CheckCircle size={48} /></div>
                                <h2 className="dashboard-completed-title">Course Ready!</h2>
                                <p className="dashboard-completed-text">Your personalized course has been generated.</p>
                                <div className="dashboard-completed-actions">
                                    <button className="btn btn-primary dashboard-completed-primary-btn" onClick={() => openCourse(generatedCourseId)}>Start Learning Now</button>
                                    <button className="btn btn-secondary" onClick={() => { setGenerationStatus("idle"); localStorage.setItem("dash_genStatus", "idle"); setForm({ subject: "", topic: "", standard: "" }); sessionStorage.removeItem("dash_session_active"); }}>Create Another</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "courses" && (
                    <div className="fade-in">
                        <header className="dashboard-header"><div><h1 className="dashboard-page-title">Active Courses</h1></div></header>
                        <div className="bento-grid">
                            <div className="bento-card create-card dashboard-create-card" onClick={() => setActiveTab("generate")}>
                                <div className="dashboard-create-card-icon"><PlusCircle size={24} /></div>
                                <span className="dashboard-create-card-label">Create New Course</span>
                            </div>
                            {courses.map((course) => (
                                <div key={course.id} className="bento-card dashboard-course-card" onClick={() => openCourse(course.id)}>
                                    {course.id === newlyCreatedId && <div className="dashboard-course-new-badge">NEW</div>}
                                    <button onClick={(e) => confirmDeleteRequest(e, course.id)} className="dashboard-course-delete-btn"><Trash2 size={16} /></button>
                                    <div className="card-top">
                                        <div className="dashboard-course-meta"><BookOpen size={14} />{course.subject}</div>
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