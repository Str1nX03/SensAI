import React, { useRef, useEffect } from "react";
import * as THREE from "three";

export default function RetroWaveShader() {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // 1. SETUP
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1);
    
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: false
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    currentMount.appendChild(renderer.domElement);

    // 2. SHADER CODE
    const vertexShader = `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        
        float d = length(p) * distortion;
        
        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
        float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
        float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);
        
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `;

    // 3. GEOMETRY
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0,
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    const uniforms = {
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        time: { value: 0.0 },
        xScale: { value: 1.0 },
        yScale: { value: 0.5 },
        distortion: { value: 0.05 },
    };

    const material = new THREE.RawShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 4. ANIMATION LOOP
    let animationId;
    const animate = () => {
        animationId = requestAnimationFrame(animate);
        uniforms.time.value += 0.01;
        renderer.render(scene, camera);
    };
    animate();

    // 5. RESIZE HANDLER
    const handleResize = () => {
        if (!currentMount) return;
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        uniforms.resolution.value.set(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 6. CLEANUP
    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        if (currentMount && renderer.domElement) {
            currentMount.removeChild(renderer.domElement);
        }
        geometry.dispose();
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
        background: '#000'
      }} 
    />
  );
}