import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

interface RadialLinesCanvasProps {
  lineColor: string;
  midColor: string;
  gradientColor: string;
  bgColor: string;
  density: number;
  particleSize: number;
  lineLength: number;
  lineWidth: number;
  speed: number;
  originX: number;
  originY: number;
  angleSpread: number;
  angleRotation: number;
  gravity: number;
  enableFlow: boolean;
  flowColor: string;
  isTransparent: boolean;
  globalOpacity: number;
  isPaused: boolean;
}

export interface CanvasHandle {
  exportImage: () => void;
  exportVideo: (durationMs?: number) => Promise<void>;
}

const RadialLinesCanvas = forwardRef<CanvasHandle, RadialLinesCanvasProps>(({
  lineColor,
  midColor,
  gradientColor,
  bgColor,
  density,
  particleSize,
  lineLength,
  lineWidth,
  speed,
  originX,
  originY,
  angleSpread,
  angleRotation,
  gravity,
  enableFlow,
  flowColor,
  isTransparent,
  globalOpacity,
  isPaused
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  const particlesRef = useRef<any[]>([]);
  const [isRecording, setIsRecording] = React.useState(false);

  useImperativeHandle(ref, () => ({
    exportImage: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const link = document.createElement('a');
      link.download = 'radial-lines.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    },
    exportVideo: async (durationMs: number = 5000) => {
      const canvas = canvasRef.current;
      if (!canvas || isRecording) return;

      setIsRecording(true);
      const stream = canvas.captureStream(60);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'radial-lines.webm';
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
      };

      recorder.start();
      setTimeout(() => {
        recorder.stop();
      }, durationMs);
    }
  }));

  const initParticles = (width: number, height: number) => {
    const count = Math.floor(density * 200);
    const particles = [];
    const spreadRad = (angleSpread * Math.PI) / 180;
    const rotationRad = (angleRotation * Math.PI) / 180;

    for (let i = 0; i < count; i++) {
      const angle = rotationRad + (Math.random() - 0.5) * spreadRad;
      const maxLength = (Math.random() * 0.5 + 0.5) * lineLength;
      particles.push({
        angle,
        currentLength: Math.random() * maxLength,
        maxLength,
        speed: (Math.random() * 0.5 + 0.5) * speed,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    particlesRef.current = particles;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      initParticles(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    initParticles(window.innerWidth, window.innerHeight); // Initial call

    const animate = () => {
      if (isTransparent) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const centerX = (canvas.width * originX) / 100 / (window.devicePixelRatio || 1);
      const centerY = (canvas.height * originY) / 100 / (window.devicePixelRatio || 1);

      // Add a core glow at the origin to match the reference image
      if (!isTransparent) {
        const coreGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100);
        coreGlow.addColorStop(0, gradientColor + '99'); // 60% opacity
        coreGlow.addColorStop(0.5, gradientColor + '33'); // 20% opacity
        coreGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
        ctx.fill();
      }

      // Parse flowColor to RGB for transparent gradient stops
      let flowR = 255, flowG = 255, flowB = 255;
      if (flowColor.startsWith('#')) {
        const hex = flowColor.replace('#', '');
        if (hex.length === 6) {
          flowR = parseInt(hex.substring(0, 2), 16);
          flowG = parseInt(hex.substring(2, 4), 16);
          flowB = parseInt(hex.substring(4, 6), 16);
        }
      }
      const flowColorTransparent = `rgba(${flowR}, ${flowG}, ${flowB}, 0)`;
      const flowColorSolid = `rgba(${flowR}, ${flowG}, ${flowB}, 1)`;

      particlesRef.current.forEach((p) => {
        if (!isPaused) {
          p.currentLength += p.speed;
          if (p.currentLength > p.maxLength) {
            p.currentLength = 0;
          }
        }

        // All lines strictly start from the center point
        const x1 = centerX;
        const y1 = centerY;
        
        // Current path calculations
        const droop = gravity * Math.pow(p.currentLength / 100, 2);
        const x2 = centerX + Math.cos(p.angle) * p.currentLength;
        const y2 = centerY + Math.sin(p.angle) * p.currentLength + droop;

        // Control point for the quadratic bezier curve
        const cx = centerX + Math.cos(p.angle) * p.currentLength * 0.5;
        const cy = centerY + Math.sin(p.angle) * p.currentLength * 0.5;

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, lineColor);
        gradient.addColorStop(0.5, midColor);
        gradient.addColorStop(1, gradientColor);

        const alpha = p.opacity * globalOpacity;

        // 1. Draw original growing line (The Wire)
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cx, cy, x2, y2);
        ctx.stroke();

        // 2. Draw flow inside the line (The Electricity)
        if (enableFlow) {
          const time = performance.now() / 1000;
          const flowSpeed = 200 * p.speed; // Speed of the electricity
          const pulseLength = 120; // Length of the flow pulse
          
          // Total cycle includes the line length, the pulse length (to fully exit), and a pause
          const totalCycleDistance = p.currentLength + pulseLength * 2 + 200; 
          
          // distanceTraveled loops from 0 to totalCycleDistance
          // Math.abs(p.angle * 10000) provides a random phase offset per line
          const distanceTraveled = (time * flowSpeed + Math.abs(p.angle * 10000)) % totalCycleDistance;
          
          // Shift so the pulse starts completely behind the origin
          const dCenter = distanceTraveled - pulseLength; 
          const dStart = dCenter - pulseLength / 2;
          const dEnd = dCenter + pulseLength / 2;
          
          // Calculate gradient coordinates along the curve's trajectory
          const droopStart = gravity * Math.pow(Math.max(0, dStart) / 100, 2);
          const gx1 = centerX + Math.cos(p.angle) * dStart;
          const gy1 = centerY + Math.sin(p.angle) * dStart + droopStart;
          
          const droopEnd = gravity * Math.pow(Math.max(0, dEnd) / 100, 2);
          const gx2 = centerX + Math.cos(p.angle) * dEnd;
          const gy2 = centerY + Math.sin(p.angle) * dEnd + droopEnd;
          
          // Only draw if gradient points are distinct
          if (Math.abs(gx1 - gx2) > 0.1 || Math.abs(gy1 - gy2) > 0.1) {
            const flowGradient = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
            flowGradient.addColorStop(0, flowColorTransparent);
            flowGradient.addColorStop(0.5, flowColorSolid);
            flowGradient.addColorStop(1, flowColorTransparent);
            
            ctx.beginPath();
            ctx.strokeStyle = flowGradient;
            ctx.globalAlpha = Math.min(1, alpha * 1.5);
            ctx.lineWidth = Math.max(1, lineWidth * 0.8);
            ctx.lineCap = 'round';
            
            ctx.shadowBlur = 12;
            ctx.shadowColor = flowColor;
            
            // Draw the exact same curve, but the gradient will mask it to only show the pulse
            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo(cx, cy, x2, y2);
            ctx.stroke();
            
            ctx.shadowBlur = 0;
          }
        }

        // 3. Particle at the end
        if (particleSize > 0) {
          ctx.beginPath();
          ctx.fillStyle = gradientColor;
          ctx.globalAlpha = Math.min(1, alpha * 1.5);
          ctx.arc(x2, y2, particleSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // 4. Origin dot
        ctx.beginPath();
        ctx.fillStyle = lineColor;
        ctx.globalAlpha = alpha * 0.5;
        ctx.arc(x1, y1, lineWidth, 0, Math.PI * 2);
        ctx.fill();
      });

      // Recording indicator
      if (isRecording) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(30, 30, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Inter';
        ctx.fillText('REC', 45, 34);
      }

      requestRef.current = requestAnimationFrame(animate);
    };



    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [lineColor, midColor, gradientColor, bgColor, density, particleSize, lineLength, lineWidth, speed, originX, originY, angleSpread, angleRotation, gravity, enableFlow, flowColor, isTransparent, globalOpacity, isPaused]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ background: isTransparent ? 'transparent' : bgColor }}
    />
  );
});

RadialLinesCanvas.displayName = 'RadialLinesCanvas';

export default RadialLinesCanvas;
