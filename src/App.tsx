/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import RadialLinesCanvas, { CanvasHandle } from './components/RadialLinesCanvas';
import ControlPanel from './components/ControlPanel';

export default function App() {
  const [lineColor, setLineColor] = useState('#00f2ff');
  const [gradientColor, setGradientColor] = useState('#3b82f6');
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
        isTransparent={isTransparent}
        globalOpacity={globalOpacity}
        isPaused={isPaused}
      />
      
      <ControlPanel
        lineColor={lineColor}
        setLineColor={setLineColor}
        gradientColor={gradientColor}
        setGradientColor={setGradientColor}
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
    </div>
  );
}

