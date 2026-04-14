import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

interface RadialLinesCanvasProps {
  lineColor: string;
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
        const x2 = centerX + Math.cos(p.angle) * p.currentLength;
        const y2 = centerY + Math.sin(p.angle) * p.currentLength;

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, lineColor);
        gradient.addColorStop(1, gradientColor);

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        // Subtle fade towards the end, but keep it connected
        const alpha = p.opacity * globalOpacity;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = lineWidth;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Particle at the end - ensure it's perfectly aligned and connected
        if (particleSize > 0) {
          ctx.beginPath();
          ctx.fillStyle = gradientColor;
          ctx.globalAlpha = Math.min(1, alpha * 1.5);
          ctx.arc(x2, y2, particleSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Optional: Small dot at the origin to anchor the line visually
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
  }, [lineColor, gradientColor, bgColor, density, particleSize, lineLength, lineWidth, speed, originX, originY, angleSpread, angleRotation, isTransparent, globalOpacity, isPaused]);

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
