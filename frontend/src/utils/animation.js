import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 1. Keep your utility
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

gsap.registerPlugin(ScrollTrigger);

// 2. Modified function that returns a cleanup function
export function initAnimations() {
  
  // Create a GSAP Context scope
  let ctx = gsap.context(() => {

    // --- 1. HERO ANIMATIONS ---
    gsap.from(".hero-title", {
      opacity: 0,
      y: 30,
      duration: 1.2,
      ease: "power3.out",
      delay: 0.2
    });

    gsap.from(".hero-subtitle", {
      opacity: 0,
      y: 20,
      duration: 1.2,
      ease: "power3.out",
      delay: 0.4
    });

    gsap.from(".hero-cta", {
      opacity: 0,
      y: 15,
      scale: 0.95,
      duration: 1,
      ease: "back.out(1.7)",
      delay: 0.6
    });

    // Shader Animation
    const shader = document.querySelector(".hero-left-shader");
    if (shader) {
      gsap.from(shader, {
        opacity: 0,
        x: -50,
        duration: 1.5,
        ease: "power3.out",
        delay: 0.2
      });
    }

    // --- 2. LANDING 1 CARDS ---
    // Batch is great, but ensure elements exist first
    if (document.querySelector(".feature-card-new")) {
      ScrollTrigger.batch(".feature-card-new", {
        start: "top 85%",
        onEnter: (batch) => gsap.to(batch, {
          opacity: 1,
          y: 0,
          stagger: 0.2,
          duration: 0.8,
          ease: "power3.out",
          overwrite: true // Prevents conflict if scrolled fast
        })
      });
      // Set initial state via CSS or set immediately to avoid FOUC
      gsap.set(".feature-card-new", { opacity: 0, y: 50 });
    }

    // --- 3. LANDING 2 CARDS ---
    if (document.querySelector(".dc-card")) {
      gsap.from(".dc-card", {
        scrollTrigger: {
          trigger: ".features-section",
          start: "top 75%",
        },
        opacity: 0,
        y: 60,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)"
      });
    }

    // --- 4. ABOUT PAGE ---
    if (document.querySelector(".about-title")) {
        gsap.from(".about-title", {
            opacity: 0,
            y: -30,
            duration: 1,
            ease: "power4.out",
            delay: 0.1
        });

        gsap.from(".about-subtitle", {
            opacity: 0,
            y: -10,
            duration: 1,
            ease: "power3.out",
            delay: 0.3
        });

        gsap.from(".about-carousel", {
            opacity: 0,
            scale: 0.9,
            y: 40,
            duration: 1.2,
            ease: "elastic.out(1, 0.75)",
            delay: 0.5
        });
    }

  }); // End of Context

  // Return the cleanup function
  return () => ctx.revert();
}