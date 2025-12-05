import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  
  let ctx = gsap.context(() => {

    // --- HERO ANIMATIONS ---
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

    // --- LANDING CARDS ---
    if (document.querySelector(".dc-card")) {
      gsap.from(".dc-card", {
        scrollTrigger: {
          trigger: ".dc-grid",
          start: "top 85%",
        },
        opacity: 0,
        y: 100,
        duration: 1,
        stagger: 0.2,
        ease: "back.out(1.2)",
        clearProps: "all" 
      });
    }

    // --- ABOUT PAGE ---
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

  });

  return () => ctx.revert();
}