import React, { useEffect, useState, useRef } from 'react';
import { Plane } from 'lucide-react';

export default function ScrollAirplane() {
  const [docHeight, setDocHeight] = useState(0);
  const [docWidth, setDocWidth] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [runwayY, setRunwayY] = useState(0);
  
  const pathRef = useRef<SVGPathElement>(null);
  const maskPathRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const planeRotatorRef = useRef<HTMLDivElement>(null);
  
  // Smoothing refs
  const targetLengthRef = useRef(0);
  const currentLengthRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);
  const lastScrollY = useRef(0);
  const isInitialized = useRef(false);
  const resizeTimerRef = useRef<any>(null);
  
  const generatePath = (width: number, height: number, targetRunwayY: number) => {
    if (width === 0 || height === 0 || targetRunwayY === 0) return '';
    
    const navbarPlane = document.getElementById('navbar-plane-icon');
    const footerPlane = document.getElementById('footer-plane-icon');
    
    let startX = width * 0.15;
    let startY = 80;
    
    if (navbarPlane) {
      const rect = navbarPlane.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (rect.width > 0 && rect.height > 0) {
        startX = rect.left + rect.width / 2;
        startY = rect.top + scrollTop + rect.height / 2;
      }
    }
    
    let endX = width * 0.5;
    let endY = targetRunwayY;
    
    if (footerPlane) {
      const rect = footerPlane.getBoundingClientRect();
      const scrollTop = window.scrollY;
      endX = rect.left + rect.width / 2;
      endY = rect.top + scrollTop + rect.height / 2;
    }

    let d = `M ${startX} ${startY}`;
    d += ` C ${startX - 50} ${startY + 150}, ${width * 0.3} ${200}, ${width * 0.5} ${300}`;
    
    let currentX = width * 0.5;
    let currentY = 300; 
    
    const isMobile = width < 768;
    const zigZagInterval = isMobile ? 400 : 600;
    const points = Math.max(4, Math.floor((endY - 300) / zigZagInterval)); 
    const segmentHeight = (endY - 300) / points; 
    
    for (let i = 0; i < points; i++) {
      const direction = i % 2 === 0 ? 1 : -1;
      let targetX = (width / 2) + direction * (width * 0.25);
      
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
        setRunwayY(document.documentElement.scrollHeight - 350);
      }
    };

    updateDimensions();
    
    // Delayed re-calculations so navbarPlane coordinates settle after TopNavbar and festive banner mount
    const t1 = setTimeout(updateDimensions, 50);
    const t2 = setTimeout(updateDimensions, 200);
    const t3 = setTimeout(updateDimensions, 600);
    
    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(updateDimensions, 100);
    });
    resizeObserver.observe(document.body);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      resizeObserver.disconnect();
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    };
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
      lastScrollY.current = scrollY;
      
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      let progress = maxScroll > 0 ? scrollY / maxScroll : 0;
      progress = Math.min(Math.max(progress, 0), 1);
      
      targetLengthRef.current = progress * pathLength;
    };

    const animate = () => {
      if (pathRef.current && pathLength > 0) {
        currentLengthRef.current += (targetLengthRef.current - currentLengthRef.current) * 0.08;
        
        if (Math.abs(targetLengthRef.current - currentLengthRef.current) > 0.3 || !isInitialized.current) {
          isInitialized.current = true;
          
          if (maskPathRef.current) {
            maskPathRef.current.style.strokeDashoffset = `${pathLength - currentLengthRef.current}`;
          }
          
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
          if (currentLengthRef.current < 5) {
            angle = 0;
          }
          
          if (planeRef.current) {
            planeRef.current.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
            // Only show the scroll airplane when user actually begins scrolling (scrollY > 20)
            planeRef.current.style.opacity = window.scrollY > 20 ? '1' : '0';
          }
          if (planeRotatorRef.current) {
            planeRotatorRef.current.style.transform = `rotate(${angle}deg)`;
          }
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    rafRef.current = requestAnimationFrame(animate);
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
            <path
              ref={maskPathRef}
              d={pathData}
              fill="none"
              stroke="white"
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={pathLength}
              style={{ strokeDashoffset: pathLength }}
            />
          </mask>
        </defs>

        <path
          ref={pathRef}
          d={pathData}
          fill="none"
          stroke="#bfdbfe"
          strokeWidth="4"
          strokeDasharray="8 8"
          strokeLinecap="round"
          mask="url(#airplane-mask)"
          className="opacity-20 transition-opacity duration-300"
        />
      </svg>
      
      {/* Plane Element */}
      <div 
        ref={planeRef}
        className="absolute w-10 h-10 -ml-5 -mt-5 flex items-center justify-center text-blue-400 z-10 will-change-transform transition-opacity duration-300"
        style={{
          transform: 'translate3d(0px, 0px, 0)',
          opacity: 0
        }}
      >
        <div ref={planeRotatorRef} className="will-change-transform">
          <Plane size={24} className="fill-blue-200 drop-shadow-md" />
        </div>
      </div>
    </div>
  );
}
