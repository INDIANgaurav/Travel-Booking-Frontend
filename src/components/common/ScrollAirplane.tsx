import React, { useEffect, useState, useRef } from 'react';
import { Plane } from 'lucide-react';

export default function ScrollAirplane() {
  const [docHeight, setDocHeight] = useState(0);
  const [docWidth, setDocWidth] = useState(0);
  const [drawLength, setDrawLength] = useState(0);
  const [planePos, setPlanePos] = useState({ x: 0, y: 0, angle: 0 });
  const [pathLength, setPathLength] = useState(0);
  const [runwayY, setRunwayY] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);
  
  // Smoothing refs
  const targetLengthRef = useRef(0);
  const currentLengthRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);
  const lastScrollY = useRef(0);
  const scrollingUpRef = useRef(false);
  
  const generatePath = (width: number, height: number, targetRunwayY: number) => {
    if (width === 0 || height === 0 || targetRunwayY === 0) return '';
    
    const navbarPlane = document.getElementById('navbar-plane-icon');
    const footerPlane = document.getElementById('footer-plane-icon');
    
    let startX = width * 0.15;
    let startY = 80;
    
    if (navbarPlane) {
      const rect = navbarPlane.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      // The navbar is fixed, so rect.top gives the exact document Y coordinate 
      // without needing scrollY.
      startY = rect.top + rect.height / 2;
    }
    
    let endX = width * 0.5;
    let endY = targetRunwayY;
    
    if (footerPlane) {
      const rect = footerPlane.getBoundingClientRect();
      const scrollTop = window.scrollY;
      endX = rect.left + rect.width / 2;
      endY = rect.top + scrollTop + rect.height / 2;
    }

    // Start exactly at the navbar logo
    let d = `M ${startX} ${startY}`;
    
    // First segment: gracefully exit the navbar logo moving bottom-left (coming from below)
    // We drop down rapidly to Y=300 so the plane quickly emerges from behind the sticky navbar.
    d += ` C ${startX - 50} ${startY + 150}, ${width * 0.3} ${200}, ${width * 0.5} ${300}`;
    
    let currentX = width * 0.5;
    let currentY = 300; 
    
    // Dynamically calculate number of zig-zags based on screen height
    // On mobile screens (width < 768), we want tighter zig-zags (every 400px)
    const isMobile = width < 768;
    const zigZagInterval = isMobile ? 400 : 600;
    const points = Math.max(4, Math.floor((endY - 300) / zigZagInterval)); 
    
    const segmentHeight = (endY - 300) / points; 
    
    for (let i = 0; i < points; i++) {
      const direction = i % 2 === 0 ? 1 : -1;
      let targetX = (width / 2) + direction * (width * 0.25); // Zig zag 25% of width left/right
      
      // Force the very last zig-zag to end on the far RIGHT edge of the screen.
      // This creates a massive, dramatic swoop from the right margin, under the text, 
      // and up into the left-aligned footer logo!
      if (i === points - 1) {
        targetX = width - 20; 
      }
      
      const targetY = currentY + segmentHeight;
      
      const cp1X = currentX;
      const cp1Y = currentY + segmentHeight / 2;
      const cp2X = targetX;
      const cp2Y = currentY + segmentHeight / 2;
      
      d += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${targetX} ${targetY}`;
      
      currentX = targetX;
      currentY = targetY;
    }
    // Final segment: swoop down and park exactly in the footer logo
    // To match the logo's 45-degree upward orientation, we pull UP into the logo from the bottom-left.
    // We use a large hookOffset (90) to ensure the curve sweeps DEEP underneath the paragraph text
    // before coming up to the logo, so the dashed line never crosses the words.
    const hookOffset = 90;
    d += ` C ${currentX} ${currentY + segmentHeight / 2}, ${endX - 20} ${endY + hookOffset}, ${endX} ${endY}`;
    
    return d;
  };
  
  const pathData = generatePath(docWidth, docHeight, runwayY);

  useEffect(() => {
    const updateDimensions = () => {
      setDocWidth(document.documentElement.scrollWidth);
      setDocHeight(document.documentElement.scrollHeight);
      
      const runwayEl = document.getElementById('runway-strip');
      if (runwayEl) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const rect = runwayEl.getBoundingClientRect();
        setRunwayY(rect.top + scrollTop + (rect.height / 2));
      } else {
        // Fallback
        setRunwayY(document.documentElement.scrollHeight - 350);
      }
    };

    updateDimensions();
    
    // Observe DOM changes (like images loading or content expanding)
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(document.body);
    
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [pathData]);

  useEffect(() => {
    const handleScroll = () => {
      if (!pathRef.current || pathLength === 0) return;
      
      const scrollY = window.scrollY;
      scrollingUpRef.current = scrollY < lastScrollY.current;
      lastScrollY.current = scrollY;
      
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      // Calculate progress (0 to 1)
      let progress = maxScroll > 0 ? scrollY / maxScroll : 0;
      progress = Math.min(Math.max(progress, 0), 1);
      
      // Set target length for smooth interpolation
      targetLengthRef.current = progress * pathLength;
    };

    const animate = () => {
      if (pathRef.current && pathLength > 0) {
        // Lerp current length towards target length (0.05 is the smoothing factor - lower is smoother/slower)
        currentLengthRef.current += (targetLengthRef.current - currentLengthRef.current) * 0.08;
        
        // Prevent unnecessary updates if we're very close
        if (Math.abs(targetLengthRef.current - currentLengthRef.current) > 0.5) {
          setDrawLength(currentLengthRef.current);
          
          const point = pathRef.current.getPointAtLength(currentLengthRef.current);
          
          const lookAhead = Math.min(currentLengthRef.current + 5, pathLength);
          const nextPoint = pathRef.current.getPointAtLength(lookAhead);
          
          const dx = nextPoint.x - point.x;
          const dy = nextPoint.y - point.y;
          
          let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 45;
          
          let isMovingBackwards = currentLengthRef.current > targetLengthRef.current;
          if (isMovingBackwards) {
            angle += 180;
          }
          
          // Force TOP-RIGHT orientation when parked at the very top logo so it matches the brand seamlessly
          if (currentLengthRef.current < 5) {
            angle = 0;
          }
          
          setPlanePos({ x: point.x, y: point.y, angle });
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Start animation loop
    rafRef.current = requestAnimationFrame(animate);
    
    // Initialize target position
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pathLength]);

  if (docWidth === 0 || docHeight === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      <svg 
        className="w-full h-full absolute top-0 left-0" 
        viewBox={`0 0 ${docWidth} ${docHeight}`}
        preserveAspectRatio="none"
      >
        <defs>
          <mask id="airplane-mask">
            {/* 
              This solid path draws itself based on scroll.
              White reveals the masked content, transparent hides it.
            */}
            <path
              d={pathData}
              fill="none"
              stroke="white"
              strokeWidth="20" // Thick enough to fully cover the dotted line
              strokeLinecap="round"
              strokeDasharray={pathLength}
              strokeDashoffset={pathLength - drawLength}
            />
          </mask>
        </defs>

        {/* Faint background full track removed as per user request */}

        {/* The active dotted track that fills up as you scroll */}
        <path
          ref={pathRef}
          d={pathData}
          fill="none"
          stroke="#bfdbfe" // blue-200 (lighter blue)
          strokeWidth="4"
          strokeDasharray="8 8"
          strokeLinecap="round"
          mask="url(#airplane-mask)"
          className="opacity-20 transition-opacity duration-300"
        />
      </svg>
      
      {/* Airplane Element */}
      <div 
        className="absolute w-10 h-10 -ml-5 -mt-5 flex items-center justify-center text-blue-400 z-10"
        style={{
          transform: `translate3d(${planePos.x}px, ${planePos.y}px, 0)`,
        }}
      >
        <div style={{ transform: `rotate(${planePos.angle}deg)` }}>
          <Plane size={24} className="fill-blue-200 drop-shadow-md" />
        </div>
      </div>
    </div>
  );
}
