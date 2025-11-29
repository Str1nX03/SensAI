import { useEffect } from "react";
import "../styles/login.css";
import { initBackground } from "../utils/scene";
import { initAnimations } from "../utils/animation";
import Navbar from "../components/Navbar";
import "../styles/navbar.css";
import { Home, User, FileText, Briefcase } from "lucide-react";

const NAV_ITEMS = [
  { name:"Home", url:"/", icon:Home },
  { name:"Login", url:"/login", icon:User },
  { name:"Register", url:"/register", icon:FileText },
  { name:"About", url:"/about", icon:Briefcase }
];

export default function Login(){
    useEffect(()=>{
        setTimeout(()=>initBackground(),60);
        initAnimations();
    },[]);

    return(
    <>
    <Navbar items={NAV_ITEMS} />
        <main id="main-content" className="auth-container">

            <div className="auth-card auth-animate">

                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-sub">Enter your credentials to continue.</p>

                <form>

                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" className="form-input" placeholder="username" />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" className="form-input" placeholder="••••••••" />
                    </div>

                    <button className="btn btn-primary login-btn">Sign In</button>
                </form>

                {/* 🔥 THIS sends user to register page */}
                <p className="auth-switch">
                    Don't have an account?  
                    <a href="/register"> Create one</a>
                </p>

                <a href="/" className="back-home">← Back to Home</a>

            </div>
        </main>
    </>
    );
}
