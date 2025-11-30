import React, { useRef, useEffect } from "react";
import * as THREE from "three";

export default function ParticleNetwork() {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // 1. SETUP
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    currentMount.appendChild(renderer.domElement);

    // 2. PARTICLES
    const particles = new THREE.BufferGeometry();
    const count = 600;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
        pos[i] = (Math.random() - 0.5) * 100;
    }
    particles.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const material = new THREE.PointsMaterial({
        size: 0.25,
        color: 0x9a8cff,
        transparent: true,
        opacity: 0.45
    });

    const mesh = new THREE.Points(particles, material);
    scene.add(mesh);

    // 3. INTERACTION
    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e) => {
        mouseX = (e.clientX / window.innerWidth) - 0.5;
        mouseY = (e.clientY / window.innerHeight) - 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 4. ANIMATION
    let animationId;
    const animate = () => {
        animationId = requestAnimationFrame(animate);
        
        mesh.rotation.y += 0.0009;
        mesh.rotation.x += 0.0004;
        
        // Gentle camera float
        camera.position.x += (mouseX * 8 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 8 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    };
    animate();

    // 5. RESIZE
    const handleResize = () => {
        if (!currentMount) return;
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // 6. CLEANUP
    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        if (currentMount && renderer.domElement) {
            currentMount.removeChild(renderer.domElement);
        }
        particles.dispose();
        material.dispose();
        renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: -1,
        pointerEvents: 'none'
      }} 
    />
  );
}