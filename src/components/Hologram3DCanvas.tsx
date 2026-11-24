import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Hologram3DCanvasProps {
  isSimulated: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
  mode: 'ambient' | 'full';
  onCloseFull?: () => void;
}

export const Hologram3DCanvas: React.FC<Hologram3DCanvasProps> = ({
  isSimulated,
  severity,
  mode,
  onCloseFull
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = mode === 'full' ? 22 : 32;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 1. Central Geodesic Core (Icosahedron Wireframe)
    const coreGeo = new THREE.IcosahedronGeometry(mode === 'full' ? 6 : 8, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: isSimulated ? (severity === 'CRITICAL' ? 0xef4444 : 0xf59e0b) : 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: mode === 'full' ? 0.6 : 0.25
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // 2. Inner Glowing Core
    const innerGeo = new THREE.OctahedronGeometry(mode === 'full' ? 3.5 : 4.5, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: isSimulated ? 0xff0055 : 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: mode === 'full' ? 0.75 : 0.35
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    // 3. Orbiting Data Rings (Torus)
    const ringGeo1 = new THREE.TorusGeometry(mode === 'full' ? 8.5 : 12, 0.06, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4
    });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.rotation.x = Math.PI / 3;
    scene.add(ringMesh1);

    const ringGeo2 = new THREE.TorusGeometry(mode === 'full' ? 10 : 14, 0.05, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: isSimulated ? 0xf43f5e : 0xa855f7,
      transparent: true,
      opacity: 0.35
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.y = Math.PI / 4;
    scene.add(ringMesh2);

    // 4. Particle Field Matrix (1,200 Holographic Star Nodes)
    const particleCount = mode === 'full' ? 1800 : 1000;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(isSimulated ? 0xef4444 : 0x06b6d4);
    const color2 = new THREE.Color(isSimulated ? 0xf59e0b : 0x6366f1);
    const color3 = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount; i++) {
      const radius = 10 + Math.random() * (mode === 'full' ? 25 : 35);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const mixedColor = i % 3 === 0 ? color1 : i % 3 === 1 ? color2 : color3;
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: mode === 'full' ? 0.22 : 0.18,
      vertexColors: true,
      transparent: true,
      opacity: mode === 'full' ? 0.85 : 0.4
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const speedMultiplier = isSimulated ? 1.8 : 1.0;

      coreMesh.rotation.x += 0.25 * delta * speedMultiplier;
      coreMesh.rotation.y += 0.35 * delta * speedMultiplier;

      innerMesh.rotation.x -= 0.4 * delta * speedMultiplier;
      innerMesh.rotation.z += 0.3 * delta * speedMultiplier;

      ringMesh1.rotation.z += 0.2 * delta * speedMultiplier;
      ringMesh2.rotation.x += 0.15 * delta * speedMultiplier;

      particleSystem.rotation.y += 0.05 * delta;

      // Gentle camera parallax following mouse
      camera.position.x += (mouseX * 4 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 4 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      coreGeo.dispose();
      innerGeo.dispose();
      ringGeo1.dispose();
      ringGeo2.dispose();
      particleGeo.dispose();
    };
  }, [isSimulated, severity, mode]);

  if (mode === 'ambient') {
    return (
      <div
        ref={containerRef}
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-60"
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
      
      {/* 3D Hologram Overlay HUD */}
      <div className="relative z-10 max-w-xl w-full mx-4 p-6 rounded-2xl bg-slate-900/80 border border-cyan-500/40 shadow-2xl backdrop-blur-md pointer-events-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/60 text-xs font-mono text-cyan-300 uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          3D Holographic Topology Core
        </div>
        
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
          Codebenders ACE 3D Architecture Matrix
        </h2>
        
        <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto font-mono">
          Interactive real-time 3D visualization representing ambient microservice clusters, dependency nodes, and ripple-effect force fields.
        </p>

        <div className="grid grid-cols-3 gap-2.5 pt-2 text-[11px] font-mono">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-cyan-300">
            <span className="text-[10px] text-slate-500 block">Render Engine</span>
            Three.js WebGL
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-indigo-300">
            <span className="text-[10px] text-slate-500 block">Matrix Particles</span>
            1,800 Nodes
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-purple-300">
            <span className="text-[10px] text-slate-500 block">Status</span>
            {isSimulated ? 'Simulating Blast' : 'Stable Core'}
          </div>
        </div>

        <button
          onClick={onCloseFull}
          className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition transform active:scale-95"
        >
          Return to 2D Graph Canvas
        </button>
      </div>
    </div>
  );
};
