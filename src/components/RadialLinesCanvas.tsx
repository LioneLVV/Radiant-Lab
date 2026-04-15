import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface RadialLinesCanvasProps {
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

const RadialLinesCanvas = forwardRef<CanvasHandle, RadialLinesCanvasProps>((props, ref) => {
  // 1. Store all props in a ref so the animation loop can read them without re-triggering useEffect
  const propsRef = useRef(props);
  propsRef.current = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number>(null);
  const particlesRef = useRef<any[]>([]);
  
  // Use ref instead of state for recording to avoid re-renders
  const isRecordingRef = useRef(false);
  
  // Offscreen canvas for the core glow (huge performance boost)
  const coreGlowCanvasRef = useRef<HTMLCanvasElement | null>(null);
  if (!coreGlowCanvasRef.current) {
    coreGlowCanvasRef.current = document.createElement('canvas');
    coreGlowCanvasRef.current.width = 200;
    coreGlowCanvasRef.current.height = 200;
  }
  
  const gradientCacheRef = useRef<{gradient: CanvasGradient | null, key: string}>({gradient: null, key: ''});
  const flowColorCacheRef = useRef<{color: string, transparent: string, solid: string}>({color: '', transparent: '', solid: ''});

  useImperativeHandle(ref, () => ({
    exportImage: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const maxDim = 2560; // 2K resolution limit
      let width = canvas.width;
      let height = canvas.height;

      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tCtx = tempCanvas.getContext('2d');
      if (tCtx) {
        tCtx.drawImage(canvas, 0, 0, width, height);
        const link = document.createElement('a');
        link.download = 'radial-lines.png';
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
      }
    },
    exportVideo: async (durationMs: number = 5000) => {
      const canvas = canvasRef.current;
      if (!canvas || isRecordingRef.current) return;

      const maxDim = 2560; // 2K resolution limit
      let width = canvas.width;
      let height = canvas.height;

      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = width;
      exportCanvas.height = height;
      exportCanvasRef.current = exportCanvas;

      isRecordingRef.current = true;
      
      const stream = exportCanvas.captureStream(60);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 8000000 // 8 Mbps for good 2K quality
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
        isRecordingRef.current = false;
        exportCanvasRef.current = null;
      };

      recorder.start();
      setTimeout(() => {
        recorder.stop();
      }, durationMs);
    }
  }));

  const initParticles = () => {
    const p = propsRef.current;
    const count = Math.floor(p.density * 200);
    const particles = [];
    const spreadRad = (p.angleSpread * Math.PI) / 180;
    const rotationRad = (p.angleRotation * Math.PI) / 180;

    for (let i = 0; i < count; i++) {
      const angle = rotationRad + (Math.random() - 0.5) * spreadRad;
      const maxLength = (Math.random() * 0.5 + 0.5) * p.lineLength;
      particles.push({
        angle,
        cosAngle: Math.cos(angle), // Precalculate trig
        sinAngle: Math.sin(angle), // Precalculate trig
        phaseOffset: Math.random() * 10000, // Precalculate random phase
        currentLength: Math.random() * maxLength,
        maxLength,
        speed: (Math.random() * 0.5 + 0.5) * p.speed,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    particlesRef.current = particles;
  };

  // 2. Re-init particles ONLY when structural props change
  useEffect(() => {
    initParticles();
  }, [props.density, props.lineLength, props.angleSpread, props.angleRotation, props.speed]);

  // 3. Update offscreen core glow canvas ONLY when its colors change
  useEffect(() => {
    const canvas = coreGlowCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, 200, 200);
    if (props.isTransparent) return;

    const coreGlow = ctx.createRadialGradient(100, 100, 0, 100, 100, 100);
    coreGlow.addColorStop(0, props.gradientColor + '99'); // 60% opacity
    coreGlow.addColorStop(0.5, props.gradientColor + '33'); // 20% opacity
    coreGlow.addColorStop(1, 'transparent');
    
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(100, 100, 100, 0, Math.PI * 2);
    ctx.fill();
  }, [props.gradientColor, props.isTransparent]);

  // 4. Main animation loop - runs exactly once, never tears down
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
      // We intentionally do NOT re-init particles here so the animation continues smoothly during resize
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const animate = () => {
      const p = propsRef.current; // Read fresh props directly from ref
      
      if (p.isTransparent) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = p.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const centerX = (canvas.width * p.originX) / 100 / (window.devicePixelRatio || 1);
      const centerY = (canvas.height * p.originY) / 100 / (window.devicePixelRatio || 1);

      if (!p.isTransparent && coreGlowCanvasRef.current) {
        ctx.drawImage(coreGlowCanvasRef.current, centerX - 100, centerY - 100, 200, 200);
      }

      // Update flow color cache if needed
      if (p.enableFlow && flowColorCacheRef.current.color !== p.flowColor) {
        let flowR = 255, flowG = 255, flowB = 255;
        if (p.flowColor.startsWith('#')) {
          const hex = p.flowColor.replace('#', '');
          if (hex.length === 6) {
            flowR = parseInt(hex.substring(0, 2), 16);
            flowG = parseInt(hex.substring(2, 4), 16);
            flowB = parseInt(hex.substring(4, 6), 16);
          }
        }
        flowColorCacheRef.current = {
          color: p.flowColor,
          transparent: `rgba(${flowR}, ${flowG}, ${flowB}, 0)`,
          solid: `rgba(${flowR}, ${flowG}, ${flowB}, 1)`
        };
      }
      const { transparent: flowColorTransparent, solid: flowColorSolid } = flowColorCacheRef.current;

      // Update base gradient cache if needed
      const gradKey = `${p.lineColor}-${p.midColor}-${p.gradientColor}-${p.lineLength}-${centerX}-${centerY}`;
      if (gradientCacheRef.current.key !== gradKey) {
        const baseGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, p.lineLength);
        baseGradient.addColorStop(0, p.lineColor);
        baseGradient.addColorStop(0.5, p.midColor);
        baseGradient.addColorStop(1, p.gradientColor);
        gradientCacheRef.current = { gradient: baseGradient, key: gradKey };
      }
      const baseGradient = gradientCacheRef.current.gradient!;

      const time = performance.now() / 1000;

      // Pass 1: Base lines
      ctx.strokeStyle = baseGradient;
      ctx.lineWidth = p.lineWidth;
      ctx.lineCap = 'round';
      
      particlesRef.current.forEach((particle) => {
        if (!p.isPaused) {
          particle.currentLength += particle.speed;
          if (particle.currentLength > particle.maxLength) {
            particle.currentLength = 0;
          }
        }

        // 5. Early skip for meaningless drawing
        if (particle.currentLength < 1) return;

        const droop = p.gravity * Math.pow(particle.currentLength / 100, 2);
        particle.x2 = centerX + particle.cosAngle * particle.currentLength;
        particle.y2 = centerY + particle.sinAngle * particle.currentLength + droop;
        particle.cx = centerX + particle.cosAngle * particle.currentLength * 0.5;
        particle.cy = centerY + particle.sinAngle * particle.currentLength * 0.5;

        ctx.beginPath();
        ctx.globalAlpha = particle.opacity * p.globalOpacity;
        ctx.moveTo(centerX, centerY);
        ctx.quadraticCurveTo(particle.cx, particle.cy, particle.x2, particle.y2);
        ctx.stroke();
      });

      // Pass 2: Flow
      if (p.enableFlow) {
        ctx.lineWidth = Math.max(1, p.lineWidth * 0.8);
        ctx.lineCap = 'round';
        
        particlesRef.current.forEach((particle) => {
          if (particle.currentLength < 1) return;

          const flowSpeed = 200 * particle.speed;
          const pulseLength = 120;
          const totalCycleDistance = particle.currentLength + pulseLength * 2 + 200; 
          const distanceTraveled = (time * flowSpeed + particle.phaseOffset) % totalCycleDistance;
          
          const dCenter = distanceTraveled - pulseLength; 
          const dStart = dCenter - pulseLength / 2;
          const dEnd = dCenter + pulseLength / 2;
          
          // 6. Early skip: only calculate and draw if pulse is currently visible on the line
          if (dEnd > 0 && dStart < particle.currentLength) {
            const clampedStart = Math.max(0, dStart);
            const clampedEnd = Math.min(particle.currentLength, dEnd);

            const droopStart = p.gravity * Math.pow(clampedStart / 100, 2);
            const gx1 = centerX + particle.cosAngle * clampedStart;
            const gy1 = centerY + particle.sinAngle * clampedStart + droopStart;
            
            const droopEnd = p.gravity * Math.pow(clampedEnd / 100, 2);
            const gx2 = centerX + particle.cosAngle * clampedEnd;
            const gy2 = centerY + particle.sinAngle * clampedEnd + droopEnd;
            
            if (Math.abs(gx1 - gx2) > 0.1 || Math.abs(gy1 - gy2) > 0.1) {
              const flowGradient = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
              flowGradient.addColorStop(0, flowColorTransparent);
              flowGradient.addColorStop(0.5, flowColorSolid);
              flowGradient.addColorStop(1, flowColorTransparent);
              
              ctx.beginPath();
              ctx.strokeStyle = flowGradient;
              ctx.globalAlpha = Math.min(1, particle.opacity * p.globalOpacity * 1.5);
              ctx.moveTo(centerX, centerY);
              ctx.quadraticCurveTo(particle.cx, particle.cy, particle.x2, particle.y2);
              ctx.stroke();
            }
          }
        });
      }

      // Pass 3: Particles & Origin dots
      particlesRef.current.forEach((particle) => {
        if (particle.currentLength < 1) return;
        const alpha = particle.opacity * p.globalOpacity;
        
        if (p.particleSize > 0) {
          ctx.beginPath();
          ctx.fillStyle = p.gradientColor;
          ctx.globalAlpha = Math.min(1, alpha * 1.5);
          ctx.arc(particle.x2, particle.y2, p.particleSize, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.fillStyle = p.lineColor;
        ctx.globalAlpha = alpha * 0.5;
        ctx.arc(centerX, centerY, p.lineWidth, 0, Math.PI * 2);
        ctx.fill();
      });

      // Export Canvas
      if (isRecordingRef.current && exportCanvasRef.current) {
        const eCtx = exportCanvasRef.current.getContext('2d');
        if (eCtx) {
          eCtx.drawImage(canvas, 0, 0, exportCanvasRef.current.width, exportCanvasRef.current.height);
        }
      }

      // Recording indicator
      if (isRecordingRef.current) {
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
  }, []); // Empty deps! The loop never tears down.

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ background: props.isTransparent ? 'transparent' : props.bgColor }}
    />
  );
});

RadialLinesCanvas.displayName = 'RadialLinesCanvas';

export default RadialLinesCanvas;
