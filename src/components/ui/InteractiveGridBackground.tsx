import React, { useState, useEffect } from 'react';

interface InteractiveGridBackgroundProps {
  theme?: 'light' | 'dark';
}

export default function InteractiveGridBackground({ theme = 'light' }: InteractiveGridBackgroundProps) {
  const [gridCount, setGridCount] = useState(0);

  useEffect(() => {
    // Calculate how many 60x60 cells are needed to cover the screen
    const calculateGrid = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      // Since container is 110vw and 110vh, we need more cells
      const cols = Math.ceil((screenWidth * 1.2) / 60);
      const rows = Math.ceil((screenHeight * 1.2) / 60);
      
      setGridCount(cols * rows);
    };

    calculateGrid();
    window.addEventListener('resize', calculateGrid);
    return () => window.removeEventListener('resize', calculateGrid);
  }, []);

  const isDark = theme === 'dark';
  
  // Subtle border colors matching TrippeChalo theme
  const borderColor = isDark ? 'border-[#2563eb]/[0.05]' : 'border-blue-600/[0.03]';
  
  // Hover fill color (instant hover, slow fade out)
  const hoverColor = isDark ? 'hover:bg-[#2563eb]/10' : 'hover:bg-blue-600/[0.04]';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      
      {/* Background Orbs */}
      {isDark ? (
        <>
          <div className="absolute inset-0 bg-[#f1f5f9]"></div>
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-bl from-blue-400/20 via-blue-600/5 to-transparent rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-gradient-to-tr from-indigo-500/15 via-[#0b1031]/5 to-transparent rounded-full blur-[100px]"></div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]"></div>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-blue-300/30 via-indigo-200/20 to-transparent rounded-full opacity-60 blur-[100px] -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#e0e7ff]/60 via-blue-200/30 to-transparent rounded-full opacity-50 blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
        </>
      )}

      {/* Interactive Grid overlay - Needs pointer-events-auto to detect hover, but must sit behind everything else */}
      <div 
        className="absolute flex flex-wrap content-start pointer-events-auto"
        style={{ width: '110vw', height: '110vh', left: '-5vw', top: '-5vh' }}
      >
        {Array.from({ length: gridCount }).map((_, i) => (
          <div 
            key={i} 
            className={`w-[60px] h-[60px] border-r border-b ${borderColor} transition-colors duration-700 hover:duration-0 ${hoverColor}`}
          />
        ))}
      </div>
    </div>
  );
}
