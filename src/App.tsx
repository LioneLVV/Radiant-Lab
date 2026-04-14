/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Dribbble } from 'lucide-react';
import RadialLinesCanvas, { CanvasHandle } from './components/RadialLinesCanvas';
import ControlPanel from './components/ControlPanel';

export default function App() {
  const [lineColor, setLineColor] = useState('#00f2ff');
  const [midColor, setMidColor] = useState('#8b5cf6');
  const [gradientColor, setGradientColor] = useState('#3b82f6');
  const [flowColor, setFlowColor] = useState('#ffffff');
  const [enableFlow, setEnableFlow] = useState(true);
  const [bgColor, setBgColor] = useState('#000000');
  const [density, setDensity] = useState(2.0);
  const [particleSize, setParticleSize] = useState(1.5);
  const [lineLength, setLineLength] = useState(500);
  const [lineWidth, setLineWidth] = useState(0.8);
  const [speed, setSpeed] = useState(0.2);
  const [originX, setOriginX] = useState(50);
  const [originY, setOriginY] = useState(100);
  const [angleSpread, setAngleSpread] = useState(160);
  const [angleRotation, setAngleRotation] = useState(270);
  const [gravity, setGravity] = useState(0.5);
  const [isTransparent, setIsTransparent] = useState(false);
  const [globalOpacity, setGlobalOpacity] = useState(0.9);
  const [isPaused, setIsPaused] = useState(false);

  const canvasRef = useRef<CanvasHandle>(null);

  const handleExport = () => {
    canvasRef.current?.exportImage();
  };

  const handleExportVideo = () => {
    canvasRef.current?.exportVideo(5000);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <RadialLinesCanvas
        ref={canvasRef}
        lineColor={lineColor}
        midColor={midColor}
        gradientColor={gradientColor}
        bgColor={bgColor}
        density={density}
        particleSize={particleSize}
        lineLength={lineLength}
        lineWidth={lineWidth}
        speed={speed}
        originX={originX}
        originY={originY}
        angleSpread={angleSpread}
        angleRotation={angleRotation}
        gravity={gravity}
        enableFlow={enableFlow}
        flowColor={flowColor}
        isTransparent={isTransparent}
        globalOpacity={globalOpacity}
        isPaused={isPaused}
      />
      
      <ControlPanel
        lineColor={lineColor}
        setLineColor={setLineColor}
        midColor={midColor}
        setMidColor={setMidColor}
        gradientColor={gradientColor}
        setGradientColor={setGradientColor}
        flowColor={flowColor}
        setFlowColor={setFlowColor}
        enableFlow={enableFlow}
        setEnableFlow={setEnableFlow}
        bgColor={bgColor}
        setBgColor={setBgColor}
        density={density}
        setDensity={setDensity}
        particleSize={particleSize}
        setParticleSize={setParticleSize}
        lineLength={lineLength}
        setLineLength={setLineLength}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
        speed={speed}
        setSpeed={setSpeed}
        originX={originX}
        setOriginX={setOriginX}
        originY={originY}
        setOriginY={setOriginY}
        angleSpread={angleSpread}
        setAngleSpread={setAngleSpread}
        angleRotation={angleRotation}
        setAngleRotation={setAngleRotation}
        gravity={gravity}
        setGravity={setGravity}
        isTransparent={isTransparent}
        setIsTransparent={setIsTransparent}
        globalOpacity={globalOpacity}
        setGlobalOpacity={setGlobalOpacity}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        onExport={handleExport}
        onExportVideo={handleExportVideo}
      />

      {/* Subtle overlay for depth */}
      <div className="fixed inset-0 pointer-events-none bg-radial-gradient from-transparent to-black/20" />

      {/* Designer Credit */}
      <a
        href="https://dribbble.com/Lionel"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
      >
        <span className="text-xs font-medium tracking-widest uppercase">By Lionel</span>
        <Dribbble size={14} className="group-hover:text-[#ea4c89] transition-colors duration-300" />
      </a>
    </div>
  );
}

