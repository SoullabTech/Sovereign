'use client';

import React, { useEffect, useRef } from 'react';

interface GeometryProps {
  size?: number;
  color?: string;
  animate?: boolean;
  glow?: boolean;
}

export const VectorEquilibrium: React.FC<GeometryProps> = ({ 
  size = 200, 
  color = '#FFD700', 
  animate = true,
  glow = true 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;

    let rotation = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      
      // Add glow effect
      if (glow) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      // Draw Vector Equilibrium (Cuboctahedron)
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.8;

      // Draw 12 vertices
      const vertices = [];
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        vertices.push({ x, y });
      }

      // Connect vertices
      ctx.beginPath();
      vertices.forEach((v, i) => {
        vertices.forEach((v2, j) => {
          if (i < j) {
            const distance = Math.sqrt(Math.pow(v.x - v2.x, 2) + Math.pow(v.y - v2.y, 2));
            if (distance < radius * 1.2) {
              ctx.moveTo(v.x, v.y);
              ctx.lineTo(v2.x, v2.y);
            }
          }
        });
      });
      ctx.stroke();

      ctx.restore();

      if (animate) {
        rotation += 0.005;
        requestAnimationFrame(draw);
      }
    };

    draw();
  }, [size, color, animate, glow]);

  return <canvas ref={canvasRef} className="sacred-geometry" />;
};

export const MetatronsCube: React.FC<GeometryProps> = ({ 
  size = 200, 
  color = '#FFD700', 
  animate = true,
  glow = true 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;

    let rotation = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      
      if (glow) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;

      // Draw outer circle
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.2, 0, Math.PI * 2);
      ctx.stroke();

      // Draw 13 circles (Fruit of Life pattern)
      const circles = [{ x: 0, y: 0 }]; // Center circle
      
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        circles.push({
          x: Math.cos(angle) * radius * 0.6,
          y: Math.sin(angle) * radius * 0.6
        });
      }

      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6 + Math.PI / 6;
        circles.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        });
      }

      // Draw circles
      circles.forEach(circle => {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, radius * 0.2, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Connect all circles
      ctx.globalAlpha = 0.3;
      circles.forEach((c1, i) => {
        circles.forEach((c2, j) => {
          if (i < j) {
            ctx.beginPath();
            ctx.moveTo(c1.x, c1.y);
            ctx.lineTo(c2.x, c2.y);
            ctx.stroke();
          }
        });
      });

      ctx.restore();

      if (animate) {
        rotation += 0.003;
        requestAnimationFrame(draw);
      }
    };

    draw();
  }, [size, color, animate, glow]);

  return <canvas ref={canvasRef} className="sacred-geometry" />;
};

export const SeedOfLife: React.FC<GeometryProps> = ({ 
  size = 200, 
  color = '#FFD700', 
  animate = true,
  glow = true 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.15;

    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      
      if (glow) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      
      // Center circle
      ctx.globalAlpha = 0.8 + Math.sin(phase) * 0.2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Six surrounding circles
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        ctx.globalAlpha = 0.8 + Math.sin(phase + i * 0.5) * 0.2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (animate) {
        phase += 0.03;
        requestAnimationFrame(draw);
      }
    };

    draw();
  }, [size, color, animate, glow]);

  return <canvas ref={canvasRef} className="sacred-geometry" />;
};

export const FlowerOfLife: React.FC<GeometryProps> = ({ 
  size = 200, 
  color = '#FFD700', 
  animate = true,
  glow = true 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.08;

    let rotation = 0;

    const drawCircle = (x: number, y: number, r: number) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      
      if (glow) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.7;

      // Draw flower pattern
      drawCircle(0, 0, radius); // Center

      // First ring
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        drawCircle(x, y, radius);
      }

      // Second ring
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        const x = Math.cos(angle) * radius * 2;
        const y = Math.sin(angle) * radius * 2;
        drawCircle(x, y, radius);
      }

      // Intermediate circles
      for (let i = 0; i < 6; i++) {
        const angle1 = (i * Math.PI * 2) / 6;
        const angle2 = ((i + 1) * Math.PI * 2) / 6;
        
        const x = (Math.cos(angle1) + Math.cos(angle2)) * radius;
        const y = (Math.sin(angle1) + Math.sin(angle2)) * radius;
        drawCircle(x, y, radius);
      }

      ctx.restore();

      if (animate) {
        rotation += 0.002;
        requestAnimationFrame(draw);
      }
    };

    draw();
  }, [size, color, animate, glow]);

  return <canvas ref={canvasRef} className="sacred-geometry" />;
};

export const GoldenSpiral: React.FC<GeometryProps> = ({ 
  size = 200, 
  color = '#FFD700', 
  animate = true,
  glow = true 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const phi = 1.618033988749;

    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      
      if (glow) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
      }

      ctx.save();
      ctx.translate(centerX, centerY);

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;

      // Draw golden spiral
      ctx.beginPath();
      
      for (let t = 0; t < 4 * Math.PI; t += 0.01) {
        const r = Math.pow(phi, t / (Math.PI / 2)) * 2;
        const x = r * Math.cos(t + phase);
        const y = r * Math.sin(t + phase);
        
        if (t === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();

      // Draw golden rectangles
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;

      let rectSize = size * 0.3;
      let rectX = -rectSize / 2;
      let rectY = -rectSize / 2;

      for (let i = 0; i < 6; i++) {
        ctx.strokeRect(rectX, rectY, rectSize, rectSize);
        
        const nextSize = rectSize / phi;
        
        if (i % 4 === 0) {
          rectX += rectSize - nextSize;
        } else if (i % 4 === 1) {
          rectY += rectSize - nextSize;
        } else if (i % 4 === 2) {
          rectX -= rectSize - nextSize;
          rectX += nextSize;
        } else {
          rectY -= rectSize - nextSize;
          rectY += nextSize;
        }
        
        rectSize = nextSize;
      }

      ctx.restore();

      if (animate) {
        phase += 0.01;
        requestAnimationFrame(draw);
      }
    };

    draw();
  }, [size, color, animate, glow]);

  return <canvas ref={canvasRef} className="sacred-geometry" />;
};

// Sacred Geometry Container Component
interface SacredGeometryProps {
  type: 'vector-equilibrium' | 'metatrons-cube' | 'seed-of-life' | 'flower-of-life' | 'golden-spiral';
  size?: number;
  color?: string;
  animate?: boolean;
  glow?: boolean;
  className?: string;
}

export const SacredGeometry: React.FC<SacredGeometryProps> = ({ 
  type, 
  size = 200, 
  color = '#FFD700',
  animate = true,
  glow = true,
  className = ''
}) => {
  const geometryComponents = {
    'vector-equilibrium': VectorEquilibrium,
    'metatrons-cube': MetatronsCube,
    'seed-of-life': SeedOfLife,
    'flower-of-life': FlowerOfLife,
    'golden-spiral': GoldenSpiral
  };

  const GeometryComponent = geometryComponents[type];

  return (
    <div className={`sacred-geometry-container ${className}`}>
      <GeometryComponent size={size} color={color} animate={animate} glow={glow} />
    </div>
  );
};