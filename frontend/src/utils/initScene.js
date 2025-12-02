import * as THREE from "three";

export function initScene() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 3;

    const geo = new THREE.TorusKnotGeometry(1, 0.4, 120, 16);
    const mat = new THREE.MeshStandardMaterial({ 
        color: "#03ffea", 
        metalness: 1, 
        roughness: 0.2 
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const light = new THREE.PointLight("#ffffff", 2);
    light.position.set(3, 3, 3);
    scene.add(light);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        mesh.rotation.x += 0.004;
        mesh.rotation.y += 0.006;
        renderer.render(scene, camera);
    }
    animate();

    // Resize reaction
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
