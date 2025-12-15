import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutGrid, LogOut, PlusCircle, BookOpen, Activity, Cpu, Clock, Sparkles,
    Loader2, CheckCircle, Trash2, AlertTriangle, X, ServerCrash, ArrowLeft
} from "lucide-react";
import CpuArchitecture from "../components/CpuArchitecture";
import GlobalProgressToast from "../components/GlobalProgressToast";
import "../styles/dashboard.css";

// --- CATALOG DATA ---
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

const GENERATION_DURATION_MS = 3 * 60 * 1000;

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    // --- 1. STATE INITIALIZATION ---
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || "courses");
    const [courses, setCourses] = useState([]);

    // Status: idle | running | finalizing | completed
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
    const [catalogModal, setCatalogModal] = useState(false);
    const [catalogStep, setCatalogStep] = useState("subject");
    const [selectedCatalogSubject, setSelectedCatalogSubject] = useState(null);

    // --- 2. HELPERS ---

    const handleLogout = useCallback(() => {
        localStorage.clear();
        sessionStorage.clear();
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
                if (res.data.courses) setCourses(res.data.courses);
            })
            .catch(err => {
                console.error(err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    handleLogout();
                }
            });
    }, [navigate, handleLogout]);

    const resetGenerator = useCallback(() => {
        setGenerationStatus("idle");
        setForm({ subject: "", topic: "", standard: "" });
        localStorage.removeItem("dash_genStatus");
        localStorage.removeItem("dash_genId");
        localStorage.removeItem("dash_progress");
        localStorage.removeItem("dash_startTime");
        localStorage.removeItem("dash_backendReady");
        localStorage.removeItem("dash_tempId");
        sessionStorage.removeItem("dash_session_active");
    }, []);

    const completeGeneration = useCallback(() => {
        clearInterval(progressInterval.current);
        setProgress(100);
        localStorage.setItem("dash_progress", "100");

        const storedId = localStorage.getItem("dash_tempId");
        if (storedId) {
            const newId = parseInt(storedId, 10);
            setGeneratedCourseId(newId);
            setNewlyCreatedId(newId);
            localStorage.setItem("dash_genId", newId);
            localStorage.setItem("dash_newId", newId);
        }

        setGenerationStatus("completed");
        localStorage.setItem("dash_genStatus", "completed");

        localStorage.removeItem("dash_startTime");
        localStorage.removeItem("dash_backendReady");
        localStorage.removeItem("dash_tempId");

        fetchCourses();
    }, [fetchCourses]);

    const startProgressLoop = useCallback(() => {
        clearInterval(progressInterval.current);

        progressInterval.current = setInterval(() => {
            const startTime = parseInt(localStorage.getItem("dash_startTime") || "0", 10);
            const backendReady = localStorage.getItem("dash_backendReady") === "true";

            if (!startTime) return;

            if (backendReady) {
                completeGeneration();
                return;
            }

            const elapsed = Date.now() - startTime;
            let calculatedProgress = Math.floor((elapsed / GENERATION_DURATION_MS) * 100);

            if (calculatedProgress >= 99) calculatedProgress = 99;

            if (elapsed >= GENERATION_DURATION_MS) {
                setProgress(99);
                localStorage.setItem("dash_progress", "99");
                setGenerationStatus("finalizing");
                localStorage.setItem("dash_genStatus", "finalizing");
            } else {
                setProgress(calculatedProgress);
                localStorage.setItem("dash_progress", calculatedProgress.toString());
            }
        }, 1000);
    }, [completeGeneration]);

    // --- 3. REFRESH & STATE MANAGEMENT ---
    useEffect(() => {
        if (location.state?.activeTab) {
            window.history.replaceState({}, document.title);
        }

        const savedStatus = localStorage.getItem("dash_genStatus");

        if (savedStatus === "running" || savedStatus === "finalizing") {
            const sessionActive = sessionStorage.getItem("dash_session_active");
            if (!sessionActive) {
                setTimeout(() => resetGenerator(), 0);
            } else {
                setTimeout(() => {
                    setGenerationStatus(savedStatus);
                    startProgressLoop();
                }, 0);
            }
        }
        else if (location.state?.resetForm) {
            if (savedStatus !== "running" && savedStatus !== "finalizing") {
                setTimeout(() => resetGenerator(), 0);
            }
        }
        else if (savedStatus === "completed") {
            setTimeout(() => {
                setGenerationStatus("completed");
                setProgress(100);
            }, 0);
        }

        fetchCourses();
        return () => clearInterval(progressInterval.current);
    }, [fetchCourses, location.state, startProgressLoop, resetGenerator]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (generationStatus === "running" || generationStatus === "finalizing") {
                e.preventDefault();
                e.returnValue = "";
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

    const openCatalog = () => { setCatalogStep("subject"); setCatalogModal(true); };
    const handleSubjectSelect = (subject) => { setSelectedCatalogSubject(subject); setCatalogStep("topic"); };
    const handleTopicSelect = (topic) => { setForm(prev => ({ ...prev, subject: selectedCatalogSubject, topic: topic })); setCatalogModal(false); };
    const handleCatalogBack = () => { setCatalogStep("subject"); setSelectedCatalogSubject(null); };

    // --- 4. GENERATE ACTION ---
    const generateCourse = async (e) => {
        e.preventDefault();
        if (!form.topic || !form.subject || !form.standard) return alert("Please fill all fields");

        sessionStorage.setItem("dash_session_active", "true");
        localStorage.removeItem("dash_backendReady");
        localStorage.removeItem("dash_tempId");

        localStorage.setItem("dash_startTime", Date.now().toString());

        setGenerationStatus("running");
        setProgress(0);
        localStorage.setItem("dash_progress", "0");
        localStorage.setItem("dash_genStatus", "running");

        startProgressLoop();

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post("http://localhost:5000/api/generate", form, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                const rawId = res.data.course_id || res.data.id || res.data.courseId;

                localStorage.setItem("dash_backendReady", "true");
                localStorage.setItem("dash_tempId", rawId);

            }
        } catch (error) {
            clearInterval(progressInterval.current);
            setTimeout(() => resetGenerator(), 0);
            console.error(error);
            setErrorModal({ show: true, message: "Generation failed. Please try again." });
        }
    };

    const confirmDeleteRequest = (e, courseId) => { e.stopPropagation(); setDeleteModal({ show: true, id: courseId }); };

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
                setTimeout(() => resetGenerator(), 0);
            }

            await axios.delete(`http://localhost:5000/api/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

        } catch (error) {
            console.error("Error deleting course:", error);

            setDeleteModal({ show: false, id: null });
            setErrorModal({ show: true, message: "Failed to delete course." });

            fetchCourses();
        }
    };

    const openCourse = (courseId) => {
        const targetId = courseId || localStorage.getItem("dash_genId");
        if (targetId && targetId !== "null") navigate(`/product/${targetId}`);
        else setErrorModal({ show: true, message: "Course ID missing." });
    };

    return (
        <div className="app-container">

            {/* --- CATALOG MODAL --- */}
            {catalogModal && (
                <div className="dashboard-modal-overlay">
                    <div className="dashboard-modal dashboard-catalog-modal">
                        <button onClick={() => setCatalogModal(false)} className="dashboard-modal-close"><X size={20} /></button>
                        {catalogStep === "subject" ? (
                            <div className="catalog-content">
                                <h3 className="dashboard-modal-title" style={{ textAlign: "center", marginBottom: "5px" }}>Select a Subject</h3>
                                <div className="catalog-grid">{Object.keys(CATALOG_DATA).map((s) => <button key={s} className="catalog-item-btn" onClick={() => handleSubjectSelect(s)}>{s}</button>)}</div>
                            </div>
                        ) : (
                            <div className="catalog-content">
                                <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                                    <button onClick={handleCatalogBack} className="btn-icon-text" style={{ marginRight: "15px", background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer" }}><ArrowLeft size={20} /> Back</button>
                                    <h3 className="dashboard-modal-title" style={{ margin: 0 }}>Select Topic</h3>
                                </div>
                                <div className="catalog-grid">{CATALOG_DATA[selectedCatalogSubject]?.map((t) => <button key={t} className="catalog-item-btn" onClick={() => handleTopicSelect(t)}>{t}</button>)}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- ERROR & DELETE MODALS --- */}
            {errorModal.show && (<div className="dashboard-modal-overlay"><div className="dashboard-modal dashboard-modal-error"><button onClick={() => setErrorModal({ show: false })} className="dashboard-modal-close"><X size={20} /></button><div className="dashboard-modal-icon dashboard-modal-icon-error"><ServerCrash size={32} /></div><h3 className="dashboard-modal-title">Attention</h3><p className="dashboard-modal-text">{errorModal.message}</p><button onClick={() => setErrorModal({ show: false })} className="btn dashboard-modal-primary-btn">Dismiss</button></div></div>)}
            {deleteModal.show && (<div className="dashboard-modal-overlay"><div className="dashboard-modal dashboard-modal-delete"><div className="dashboard-modal-icon dashboard-modal-icon-warning"><AlertTriangle size={32} /></div><h3 className="dashboard-modal-title">Delete Course?</h3><div className="dashboard-modal-actions"><button onClick={() => setDeleteModal({ show: false })} className="btn dashboard-modal-btn dashboard-modal-btn-cancel">Cancel</button><button onClick={executeDelete} className="btn dashboard-modal-btn dashboard-modal-btn-danger">Delete</button></div></div></div>)}

            {/* --- SIDEBAR --- */}
            <aside className="sidebar">
                <div className="user-profile"><img src="https://ui-avatars.com/api/?name=Student&background=333&color=fff" alt="Profile" className="avatar" /><div className="user-info"><h3>Student</h3><p>Pro Plan</p></div></div>
                <nav className="nav-menu">
                    <button className={`nav-item ${activeTab === "usage" ? "active" : ""}`} onClick={() => setActiveTab("usage")}><Activity size={20} /> Upcoming Features</button>
                    <div className="dashboard-sidebar-divider"></div>
                    <button className={`nav-item ${activeTab === "generate" ? "active" : ""}`} onClick={() => setActiveTab("generate")}>
                        {generationStatus === "running" || generationStatus === "finalizing" ? <Loader2 size={20} className="animate-spin" /> : <PlusCircle size={20} />} Generate Course
                    </button>
                    <button className={`nav-item ${activeTab === "courses" ? "active" : ""}`} onClick={() => setActiveTab("courses")}><LayoutGrid size={20} /> Active Courses</button>
                    <div className="dashboard-nav-spacer"></div>
                    <button className="nav-item logout-btn" onClick={handleLogout}><LogOut size={20} /> Logout</button>
                </nav>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="main-content-area">
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
                                    <div><div className="dashboard-generate-icon"><Sparkles size={24} /></div><h1 className="dashboard-generate-title">Orchestrate New Course</h1><p className="dashboard-generate-subtitle">Define parameters for your personal AI swarm.</p></div>
                                </header>
                                <div className="glass-card dashboard-generate-card">
                                    <form onSubmit={generateCourse}>
                                        <div style={{ marginBottom: "20px" }}><button type="button" onClick={openCatalog} className="btn-secondary" style={{ width: "100%", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", border: "1px dashed var(--text-quinary)", background: "rgba(41, 121, 255, 0.1)", color: "var(--text-quinary)", borderRadius: "8px", cursor: "pointer" }}><BookOpen size={18} /> Browse Subject & Topic Catalog</button></div>
                                        <div className="form-group"><label className="form-label">Subject</label><input name="subject" className="form-input" placeholder="e.g. Computer Science" onChange={updateForm} value={form.subject} required /></div>
                                        <div className="form-group"><label className="form-label">Specific Topic</label><input name="topic" className="form-input" placeholder="e.g. Neural Networks" onChange={updateForm} value={form.topic} required /></div>
                                        <div className="form-group"><label className="form-label">Grade / Proficiency</label><input name="standard" type="number" className="form-input" placeholder="1 - 12" onChange={updateForm} value={form.standard} min="1" max="12" required /></div>
                                        <button type="submit" className="btn btn-primary dashboard-generate-submit">Initialize Agents & Build Course</button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* RUNNING / FINALIZING */}
                        {(generationStatus === "running" || generationStatus === "finalizing") && (
                            <div className="dashboard-running-view">
                                <div className="dashboard-running-visual"><CpuArchitecture height="260px" centralLogoUrl="/gojo.png" /></div>
                                <h2 className="dashboard-running-title">
                                    {generationStatus === "finalizing" ? "Almost There..." : "Constructing Curriculum..."}
                                </h2>
                                <p className="dashboard-running-text">
                                    {generationStatus === "finalizing" ? "Giving final touches to your course..." : `Agents are researching ${form.topic || "content"}...`}
                                </p>
                                <div className="dashboard-progress-wrapper">
                                    <div className="dashboard-progress-track">
                                        <div
                                            className={`dashboard-progress-fill ${generationStatus === "finalizing" ? "dashboard-progress-indeterminate" : ""}`}
                                            style={{ width: generationStatus === "finalizing" ? "100%" : `${progress}%` }}
                                        ></div>
                                    </div>
                                    <span className="dashboard-progress-label">
                                        {generationStatus === "finalizing" ? "" : `${Math.round(progress)}%`}
                                    </span>
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
                                    <button className="btn btn-secondary" onClick={() => setTimeout(() => resetGenerator(), 0)}>Create Another</button>
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