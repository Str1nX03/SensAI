import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initAnimations(){

    /* 1) HERO TEXT FADE-IN WHEN PAGE LOADS */
    gsap.from(".hero-title", {
        opacity: 0,
        y: 25,
        duration: 1.2,
        ease: "power3.out",
        delay: .3
    });

    gsap.from(".hero-subtitle", {
        opacity: 0,
        y: 20,
        duration: 1.2,
        ease: "power3.out",
        delay: .6
    });

    gsap.from(".cta-buttons", {
        opacity: 0,
        scale: .92,
        duration: 1,
        ease: "back.out(1.6)",
        delay: 1
    });

    /* 2) FEATURE CARDS — SCROLL REVEAL */
    const features = document.querySelectorAll(".feature-card-new");

    if(features.length > 0){
        gsap.set(features,{ opacity:0, y:35 });

        ScrollTrigger.batch(features,{
            start:"top 90%",
            onEnter:(cards)=> gsap.to(cards,{
                opacity:1,
                y:0,
                stagger:.15,
                duration:.65,
                ease:"power3.out"
            })
        });
    }

    /* 3) Glass Cards (Dashboard, Lessons, Auth) */
    const cards = document.querySelectorAll(".glass-card, .lesson-card, .auth-card");

    if(cards.length > 0){
        gsap.set(cards,{ opacity:0, y:25 });

        ScrollTrigger.batch(cards,{
            start:"top 93%",
            onEnter:(el)=> gsap.to(el,{
                opacity:1,
                y:0,
                stagger:.08,
                duration:.5,
                ease:"power2.out"
            })
        });
    }

    /* 4) Floating + button entrance= */
    gsap.from(".fab",{
        scale:.1,
        rotation:180,
        duration:.7,
        ease:"back.out(1.8)",
        delay:1.2
    });
}
