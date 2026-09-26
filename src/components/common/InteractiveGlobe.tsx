import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import api from "../../services/api";

interface GlobeMarker { city: string; lat: number; lng: number; count: number; }
interface Tooltip { city: string; count: number; x: number; y: number; }

function latLngToVector3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

/** Sharp crisp dot — NO blur/gradient */
function makeDotTex(): THREE.CanvasTexture {
  const sz = 64;
  const c  = document.createElement("canvas");
  c.width  = c.height = sz;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, sz, sz);
  ctx.beginPath();
  ctx.arc(sz / 2, sz / 2, sz * 0.38, 0, Math.PI * 2);
  ctx.fillStyle = "#ff4400";
  ctx.fill();
  return new THREE.CanvasTexture(c);
}

/** Thin ring — crisp circle outline */
function makeRingTex(): THREE.CanvasTexture {
  const sz  = 64;
  const c   = document.createElement("canvas");
  c.width   = c.height = sz;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, sz, sz);
  ctx.beginPath();
  ctx.arc(sz / 2, sz / 2, sz * 0.42, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,140,0,0.9)";
  ctx.lineWidth   = 4;
  ctx.stroke();
  return new THREE.CanvasTexture(c);
}

const FALLBACK: GlobeMarker[] = [
  { city: "New Delhi",  lat: 28.6139, lng: 77.2090,  count: 1 },
  { city: "Dubai",      lat: 25.2048, lng: 55.2708,  count: 1 },
  { city: "Goa",        lat: 15.2993, lng: 74.1240,  count: 1 },
  { city: "Maldives",   lat: 3.2028,  lng: 73.2207,  count: 1 },
  { city: "London",     lat: 51.5074, lng: -0.1278,  count: 1 },
  { city: "Bangkok",    lat: 13.7563, lng: 100.5018, count: 1 },
  { city: "Singapore",  lat: 1.3521,  lng: 103.8198, count: 1 },
  { city: "Mumbai",     lat: 19.0760, lng: 72.8777,  count: 1 },
];

export default function InteractiveGlobe() {
  const wrapRef  = useRef<HTMLDivElement>(null); // outer — measures available size
  const mountRef = useRef<HTMLDivElement>(null); // three.js canvas goes here
  const [markers,  setMarkers]  = useState<GlobeMarker[]>([]);
  const [loaded,   setLoaded]   = useState(false);
  const [tooltip,  setTooltip]  = useState<Tooltip | null>(null);
  const [size,     setSize]     = useState(0);

  useEffect(() => {
    api.get("/api/cms/globe-stats")
      .then(r  => setMarkers(r.data))
      .catch(() => setMarkers(FALLBACK));
  }, []);

  // Measure real available width
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      if (w > 0) setSize(Math.min(w, 520));
    });
    ro.observe(el);
    // Initial measure
    const w = el.clientWidth;
    if (w > 0) setSize(Math.min(w, 520));
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || markers.length === 0 || size === 0) return;

    const SIZE = size;
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    camera.position.z = 3.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(SIZE, SIZE);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    // Explicit CSS size
    renderer.domElement.style.width  = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    // Globe
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 128, 128),
      new THREE.MeshPhongMaterial({
        color: 0x1a3a5c,         // visible while texture loads
        specular: new THREE.Color(0x111111),
        shininess: 5,
      })
    );
    scene.add(globe);

    new THREE.TextureLoader().load(
      "https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg",
      (tex) => {
        (globe.material as THREE.MeshPhongMaterial).map = tex;
        (globe.material as THREE.MeshPhongMaterial).color.set(0xffffff);
        (globe.material as THREE.MeshPhongMaterial).needsUpdate = true;
        setLoaded(true);
      }
    );

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    // Textures
    const dotTex  = makeDotTex();
    const ringTex = makeRingTex();

    type ME = { dot: THREE.Sprite; ring: THREE.Sprite; localPos: THREE.Vector3; data: GlobeMarker };
    const markerMeshes: ME[] = [];

    markers.forEach(m => {
      const localPos = latLngToVector3(m.lat, m.lng, 1.012);

      const dot = new THREE.Sprite(new THREE.SpriteMaterial({
        map: dotTex, transparent: true, depthWrite: false, sizeAttenuation: true,
      }));
      dot.scale.setScalar(0.045);
      dot.position.copy(localPos);
      globe.add(dot);

      const ring = new THREE.Sprite(new THREE.SpriteMaterial({
        map: ringTex, transparent: true, opacity: 0.8, depthWrite: false, sizeAttenuation: true,
      }));
      ring.scale.setScalar(0.09);
      ring.position.copy(localPos);
      globe.add(ring);

      markerMeshes.push({ dot, ring, localPos, data: m });
    });

    // Stars
    const sp: number[] = [];
    for (let i = 0; i < 1000; i++) {
      sp.push((Math.random()-.5)*200, (Math.random()-.5)*200, (Math.random()-.5)*200);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.25 })));

    // Controls
    let isDragging = false, dragStarted = false;
    let prevX = 0, prevY = 0;
    let rotY = 0, rotX = 0;
    let autoRotate = true;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;
    let targetZ = 3.5, currentZ = 3.5;

    const onMouseDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true; dragStarted = false;
      autoRotate = false;
      if (resumeTimer) clearTimeout(resumeTimer);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevX = clientX; prevY = clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
      resumeTimer = setTimeout(() => { autoRotate = true; }, 5000);
    };
    const onMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const dx = clientX - prevX, dy = clientY - prevY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragStarted = true;
      // Scale rotation speed by zoom level (currentZ)
      const speed = 0.0012 * currentZ;
      rotY += dx * speed; rotX += dy * speed;
      prevX = clientX; prevY = clientY;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZ = Math.max(1.6, Math.min(5.0, targetZ + e.deltaY * 0.003));
    };

    const raycaster = new THREE.Raycaster();
    const onClick = (e: MouseEvent | TouchEvent) => {
      if (dragStarted) return;
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = ((clientX - rect.left) / rect.width)  * 2 - 1;
      const ny = -((clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
      const hits = raycaster.intersectObjects(markerMeshes.map(m => m.dot));
      if (hits.length) {
        const entry = markerMeshes.find(m => m.dot === hits[0].object)!;
        const wp    = new THREE.Vector3();
        entry.dot.getWorldPosition(wp);
        const proj  = wp.clone().project(camera);
        setTooltip({
          city: entry.data.city, count: entry.data.count,
          x: (proj.x * .5 + .5) * SIZE,
          y: (-proj.y * .5 + .5) * SIZE,
        });
      } else {
        setTooltip(null);
      }
    };

    mount.addEventListener("mousedown", onMouseDown);
    mount.addEventListener("touchstart", onMouseDown, { passive: false });
    mount.addEventListener("click",     onClick);
    mount.addEventListener("touchend",  onClick);
    mount.addEventListener("wheel",     onWheel, { passive: false });
    window.addEventListener("mouseup",  onMouseUp);
    window.addEventListener("touchend", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onMouseMove, { passive: false });

    let frame = 0, t = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      t += 0.03;
      if (autoRotate) rotY += 0.0015;
      globe.rotation.y = rotY;
      globe.rotation.x = Math.max(-1.0, Math.min(1.0, rotX));
      
      currentZ += (targetZ - currentZ) * 0.08;
      camera.position.z = currentZ;

      markerMeshes.forEach(({ dot, ring, localPos }, i) => {
        const wp = localPos.clone();
        globe.localToWorld(wp);
        const toCam   = camera.position.clone().sub(wp).normalize();
        const normal  = wp.clone().normalize();
        const visible = normal.dot(toCam) > 0.15;
        dot.visible  = visible;
        ring.visible = visible;
        if (visible) {
          // pulse opacity only — clean blink
          const p = 0.3 + 0.5 * Math.abs(Math.sin(t + i * 1.2));
          (ring.material as THREE.SpriteMaterial).opacity = p;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      if (resumeTimer) clearTimeout(resumeTimer);
      mount.removeEventListener("mousedown", onMouseDown);
      mount.removeEventListener("touchstart", onMouseDown);
      mount.removeEventListener("click",     onClick);
      mount.removeEventListener("touchend",  onClick);
      mount.removeEventListener("wheel",     onWheel);
      window.removeEventListener("mouseup",  onMouseUp);
      window.removeEventListener("touchend", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onMouseMove);
      renderer.dispose(); dotTex.dispose(); ringTex.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [markers, size]);

  return (
    <div ref={wrapRef} className="relative w-full" style={{ aspectRatio: "1" }}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing rounded-full overflow-hidden"
        style={{ position: "relative", zIndex: 20 }}
      />
      {tooltip && (
        <div
          className="absolute pointer-events-none z-30 bg-[#0f172a] text-white text-xs px-3 py-2 rounded-xl shadow-xl border border-orange-500/40 whitespace-nowrap"
          style={{ left: tooltip.x + 14, top: tooltip.y, transform: "translateY(-50%)" }}
        >
          <div className="text-orange-400 font-bold text-sm">{tooltip.city}</div>
          <div className="text-gray-400">{tooltip.count} booking{tooltip.count !== 1 ? "s" : ""}</div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-orange-500 rotate-45" />
        </div>
      )}
      <div className="absolute bottom-1 right-2 text-gray-600 text-[10px] select-none pointer-events-none">
        Scroll · Drag · Click pins
      </div>
    </div>
  );
}
