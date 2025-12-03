import React, { useState } from "react";

export default function GenerateCourseForm({ onGenerate, initialForm = { subject: "", topic: "", standard: "" }, generating }) {
    const [form, setForm] = useState(initialForm);

    const updateForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = (e) => {
        e.preventDefault();
        if (!form.subject || !form.topic || !form.standard) {
            alert("Please fill all fields");
            return;
        }
        onGenerate(form, () => setForm({ subject: "", topic: "", standard: "" }));
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
            <header className="dashboard-header" style={{ justifyContent: "center", textAlign: "center", border: "none" }}>
                <div>
                    <div style={{ display: "inline-flex", padding: "12px", background: "#1a1a1a", borderRadius: "12px", marginBottom: "1rem", color: "#fff" }}>{/* icon placeholder */}</div>
                    <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Orchestrate New Course</h1>
                    <p style={{ fontSize: "1.1rem", color: "#888" }}>Define parameters for your personal AI swarm.</p>
                </div>
            </header>
            <div className="glass-card" style={{ padding: "3rem", background: "#0a0a0a", border: "1px solid #333" }}>
                <form onSubmit={submit}>
                    <div className="form-group"><label className="form-label">Subject</label><input name="subject" className="form-input" placeholder="e.g. Computer Science" onChange={updateForm} value={form.subject} autoFocus required /></div>
                    <div className="form-group"><label className="form-label">Specific Topic</label><input name="topic" className="form-input" placeholder="e.g. Neural Networks" onChange={updateForm} value={form.topic} required /></div>
                    <div className="form-group"><label className="form-label">Grade / Proficiency</label><input name="standard" type="number" className="form-input" placeholder="1 - 12" onChange={updateForm} value={form.standard} required /></div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "2rem", height: "55px", background: "#fff", color: "#000", fontWeight: "bold" }} disabled={generating}>
                        {generating ? "Building..." : "Initialize Agents & Build Course"}
                    </button>
                </form>
            </div>
        </div>
    );
}
