import React, { useMemo } from 'react';
import { COLORS } from '../constants';

interface TreeProps {
  isVisible: boolean;
}

const Tree: React.FC<TreeProps> = ({ isVisible }) => {
  // Generate spiral coordinates
  const lights = useMemo(() => {
    const items = [];
    const count = 150;
    const turns = 12;
    const baseRadius = 180;
    const height = 450;

    for (let i = 0; i < count; i++) {
      const p = i / count; // 0 to 1
      const y = height * p - height / 2 + 50; // Center vertically somewhat
      const r = baseRadius * (1 - p); // Cone shape
      const angle = p * turns * Math.PI * 2;
      
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const delay = Math.random() * 2;

      items.push({
        id: i,
        y,
        r,
        angle, // in radians
        color,
        delay
      });
    }
    return items;
  }, []);

  if (!isVisible) return null;

  return (
    <div className="absolute top-1/2 left-1/2 w-0 h-0" style={{ perspective: '1000px' }}>
      <div 
        className="relative w-0 h-0"
        style={{ 
          transformStyle: 'preserve-3d', 
          animation: 'spin 15s linear infinite' 
        }}
      >
        {/* Lights */}
        {lights.map((light) => {
           // Convert polar to cartesian for CSS transform
           // x = r * sin(angle)
           // z = r * cos(angle)
           // But for rotateY, we can just use rotateY and translateZ
           
           return (
            <div
              key={light.id}
              className="absolute rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.6)]"
              style={{
                width: '10px',
                height: '10px',
                background: `radial-gradient(circle at 30% 30%, #fff, ${light.color})`,
                boxShadow: `0 0 10px ${light.color}, 0 0 20px ${light.color}`,
                transform: `
                  rotateY(${light.angle}rad) 
                  translateZ(${light.r}px) 
                  translateY(${-light.y}px)
                `,
                // Make the light billboarded (face the camera) by counter-rotating? 
                // Actually simple spheres don't need billboarding if they are CSS spheres (border-radius 50%)
                // But to make them look like 3D spheres, we usually just leave them flat in 3D space.
                // However, 'spin' animation rotates the parent.
                
                animation: `twinkle ${1 + light.delay}s infinite alternate`
              }}
            />
           );
        })}
        
        {/* Top Star */}
        <div 
            className="absolute text-yellow-300 text-6xl drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]"
            style={{
                top: '-250px',
                left: '-30px',
                transform: 'translateY(0) translateZ(0)',
                animation: 'float 2s ease-in-out infinite'
            }}
        >
            ★
        </div>
      </div>
    </div>
  );
};

export default Tree;