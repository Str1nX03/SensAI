import React, { useState, useEffect } from "react";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GlobalProgressToast() {
  const navigate = useNavigate();
  
  // 1. Initialize State
  const [status, setStatus] = useState(() => localStorage.getItem("dash_genStatus") || "idle");
  const [progress, setProgress] = useState(() => parseInt(localStorage.getItem("dash_progress") || "0", 10));
  const [courseId, setCourseId] = useState(() => localStorage.getItem("dash_genId"));
  
  const [isDismissed, setIsDismissed] = useState(false);

  // 2. The Polling Loop
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const currentStatus = localStorage.getItem("dash_genStatus") || "idle";
      const currentProgress = parseInt(localStorage.getItem("dash_progress") || "0", 10);
      const currentId = localStorage.getItem("dash_genId");

      if (currentStatus !== status) {
          setStatus(currentStatus);
          if (currentStatus === "running" || currentStatus === "finalizing") setIsDismissed(false);
      }
      
      if (currentId !== courseId) setCourseId(currentId);
      
      if (currentStatus === "running" || currentStatus === "finalizing") {
         if (currentProgress !== progress) setProgress(currentProgress);
      } else if (currentStatus === "completed") {
         if (progress !== 100) setProgress(100);
      }
      
    }, 500);

    return () => clearInterval(checkInterval);
  }, [status, progress, courseId]);

  // 3. Auto-Dismiss Logic
  useEffect(() => {
    if (status === "completed") {
      const timer = setTimeout(() => {
        setIsDismissed(true);
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (status === "idle" || isDismissed) return null;

  const handleClick = () => {
    if (status === "completed" && courseId) {
      navigate(`/product/${courseId}`);
    } else {
      navigate("/dashboard", { state: { activeTab: "generate" } });
    }
  };

  // 4. Render
  return (
    <div
      onClick={handleClick}
      className={`floating-status ${status === "completed" ? "floating-status--completed" : "floating-status--running"}`}
      style={{ 
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        background: '#0a0a0a',
        borderRadius: '12px',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        opacity: 0.95,
        transition: 'all 0.3s ease',
        zIndex: 20000,
        cursor: 'pointer',
        border: status === "completed" ? "1px solid #03ae00" : "1px solid #333"
      }}
    >
      {/* RUNNING OR FINALIZING */}
      {(status === "running" || status === "finalizing") ? (
        <>
          <div className="status-dot" style={{ width:'10px', height:'10px', background:'#fff', borderRadius:'50%', boxShadow:'0 0 8px rgba(255,255,255,0.6)' }}></div>
          <div>
            <span style={{ display:'block', fontSize:'0.85rem', fontWeight:'600', color:'#fff' }}>
                {status === "finalizing" ? "Almost Ready" : "Agents Active"}
            </span>
            <span style={{ display:'block', fontSize:'0.75rem', color:'#888' }}>
                {status === "finalizing" ? "Giving final touches..." : `Building Course... (${progress}%)`}
            </span>
          </div>
        </>
      ) : (
        /* COMPLETED */
        <>
          <div style={{ color:'#03ae00', display:'flex', alignItems:'center' }}><CheckCircle size={18} /></div>
          <div>
            <span style={{ display:'block', fontSize:'0.85rem', fontWeight:'600', color:'#fff' }}>Course Ready!</span>
            <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', fontSize:'0.75rem', color:'#03ae00', fontWeight:'bold' }}>
                Click to Open <ArrowRight size={10} />
            </span>
          </div>
        </>
      )}
    </div>
  );
}