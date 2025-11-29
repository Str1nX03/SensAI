import * as THREE from "three";

export function initBackground() {
    const isLanding = document.querySelector('.hero-section');        // landing.html
    const isLogin   = document.querySelector('.auth-container');      // login/register
    const isDash    = document.querySelector('.dashboard-layout');    // dashboard

    // remove old canvas
    let canvas = document.querySelector('#bg-canvas');
    if (canvas) canvas.remove();

    // dashboard → NO CANVAS
    if (isDash) return;

    // create canvas
    canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    document.body.prepend(canvas);

    if (isLanding) initLandingShader(canvas);
    else if (isLogin) initLoginParticles(canvas);
}



// -----------------------------------------------------------
// 1. LANDING PAGE SHADER (YOUR EXACT CODE)
// -----------------------------------------------------------
function initLandingShader(canvas) {

    // 1. Check if canvas exists, if not create it
    // (Already handled above — so we skip recreating)

    // 2. Setup Renderer
    const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        alpha: false, // We want the shader's black background
        antialias: true 
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1); // Start with black

    // 3. Setup Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1);

    // 4. SHADERS (YOUR SHADER EXACTLY)
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

    // 5. Setup Geometry
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

    // 6. Setup Uniforms & Material
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

    // 7. Handle Resize
    function handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        uniforms.resolution.value.set(width, height);
    }
    window.addEventListener('resize', handleResize);
    handleResize();

    // 8. Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        uniforms.time.value += 0.01;
        renderer.render(scene, camera);
    }
    animate();
}


// -----------------------------------------------------------
// 2. LOGIN SHADER (particles) — unchanged
// -----------------------------------------------------------
function initLoginParticles(canvas) {
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 30;

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

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) - 0.5;
        mouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    function animate() {
        requestAnimationFrame(animate);

        mesh.rotation.y += 0.0009;
        mesh.rotation.x += 0.0004;

        camera.position.x += (mouseX * 8 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 8 - camera.position.y) * 0.05;

        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
}