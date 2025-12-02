import { useEffect } from "react";
import "../styles/login.css";
import { initAnimations } from "../utils/animation";
import Navbar from "../components/Navbar";
import "../styles/navbar.css";
import { Home, User, FileText, Briefcase } from "lucide-react";
import ShootingStar from "../components/ShootingStar";
// 1. IMPORT NAVIGATE HERE
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { name:"Home", url:"/", icon:Home },
  { name:"Login", url:"/login", icon:User },
  { name:"Register", url:"/register", icon:FileText },
  { name:"About", url:"/about", icon:Briefcase }
];

export default function Login(){
    
    // 2. INITIALIZE NAVIGATE HERE
    const navigate = useNavigate();

    useEffect(()=>{
        initAnimations();
    },[]);

    // 3. REPLACE YOUR OLD handleLogin WITH THIS ONE
    const handleLogin = async (e) => {
        e.preventDefault(); 
        
        // Get values directly from the form inputs
        const username = e.target.username.value;
        const password = e.target.password.value;

        try {
            const res = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                // Save token to browser
                localStorage.setItem("token", data.token);
                // Redirect to Dashboard
                navigate("/dashboard");
            } else {
                alert(data.message || "Login failed");
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Something went wrong. Is the server running?");
        }
    };

    return(
    <>
        <Navbar items={NAV_ITEMS} />
        
        <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
            
            {/* Background Shader */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 0 
            }}>
                <ShootingStar />
            </div>

            <main id="main-content" className="auth-container" style={{ position: "relative", zIndex: 1 }}>

                <div className="auth-left auth-animate">
                    <p className="hero-subtitle" style={{ marginTop: "1rem", textAlign: "left" }}>“Artificial intelligence would be the ultimate version of Google. The ultimate search engine that would understand everything on the web. It would understand exactly what you wanted, and it would give you the right thing. We’re nowhere near doing that now. However, we can get incrementally closer to that, and that is basically what we work on.”</p>
                    <p className="hero-subtitle" style={{ marginTop: "1rem", textAlign: "right" }}>- Larry Page, Co-founder of Google</p>
                </div>

                <div className="auth-right">
                    <div className="auth-card auth-animate-delay">

                        <h2 className="auth-title">Sign In</h2>
                        <p className="auth-sub">Enter your credentials to continue.</p>

                        <form onSubmit={handleLogin}>

                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input 
                                    id="username"
                                    name="username" 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="username" 
                                    required 
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input 
                                    id="password"
                                    name="password"
                                    type="password" 
                                    className="form-input" 
                                    placeholder="••••••••" 
                                    required 
                                />
                            </div>

                            <button type="submit" className="btn btn-primary login-btn">Sign In</button>
                        </form>

                        <p className="auth-switch">
                            Don't have an account?  
                            <a href="/register"> Create one</a>
                        </p>

                        <a href="/" className="back-home">← Back to Home</a>

                    </div>
                </div>
            </main>
        </div>
    </>
    );
}