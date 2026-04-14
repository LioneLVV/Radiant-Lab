import React from 'react';
import { motion } from 'motion/react';
import { Download, Play, Pause, Settings2, X } from 'lucide-react';

interface ControlPanelProps {
  lineColor: string;
  setLineColor: (val: string) => void;
  midColor: string;
  setMidColor: (val: string) => void;
  gradientColor: string;
  setGradientColor: (val: string) => void;
  flowColor: string;
  setFlowColor: (val: string) => void;
  enableFlow: boolean;
  setEnableFlow: (val: boolean) => void;
  bgColor: string;
  setBgColor: (val: string) => void;
  density: number;
  setDensity: (val: number) => void;
  particleSize: number;
  setParticleSize: (val: number) => void;
  lineLength: number;
  setLineLength: (val: number) => void;
  lineWidth: number;
  setLineWidth: (val: number) => void;
  speed: number;
  setSpeed: (val: number) => void;
  originX: number;
  setOriginX: (val: number) => void;
  originY: number;
  setOriginY: (val: number) => void;
  angleSpread: number;
  setAngleSpread: (val: number) => void;
  angleRotation: number;
  setAngleRotation: (val: number) => void;
  gravity: number;
  setGravity: (val: number) => void;
  isTransparent: boolean;
  setIsTransparent: (val: boolean) => void;
  globalOpacity: number;
  setGlobalOpacity: (val: number) => void;
  isPaused: boolean;
  setIsPaused: (val: boolean) => void;
  onExport: () => void;
  onExportVideo: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  lineColor, setLineColor,
  midColor, setMidColor,
  gradientColor, setGradientColor,
  flowColor, setFlowColor,
  enableFlow, setEnableFlow,
  bgColor, setBgColor,
  density, setDensity,
  particleSize, setParticleSize,
  lineLength, setLineLength,
  lineWidth, setLineWidth,
  speed, setSpeed,
  originX, setOriginX,
  originY, setOriginY,
  angleSpread, setAngleSpread,
  angleRotation, setAngleRotation,
  gravity, setGravity,
  isTransparent, setIsTransparent,
  globalOpacity, setGlobalOpacity,
  isPaused, setIsPaused,
  onExport,
  onExportVideo
}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-6 left-6 z-50 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <Settings2 size={24} />
      </button>

      <motion.div
        initial={{ x: -400 }}
        animate={{ x: isOpen ? 0 : -400 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 h-full w-80 z-50 bg-black/40 backdrop-blur-xl border-r border-white/10 p-8 text-white flex flex-col gap-8 overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tighter">RADIANT LAB</h1>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <section className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-widest opacity-50">Colors</label>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Line Start</span>
                <input 
                  type="color" 
                  value={lineColor} 
                  onChange={(e) => setLineColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Line Mid</span>
                <input 
                  type="color" 
                  value={midColor} 
                  onChange={(e) => setMidColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Line End</span>
                <input 
                  type="color" 
                  value={gradientColor} 
                  onChange={(e) => setGradientColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Flow Light</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={enableFlow} 
                      onChange={(e) => setEnableFlow(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/10"
                    />
                    <span className="text-xs opacity-70">Enable</span>
                  </label>
                  <input 
                    type="color" 
                    value={flowColor} 
                    disabled={!enableFlow}
                    onChange={(e) => setFlowColor(e.target.value)}
                    className={`w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none ${!enableFlow ? 'opacity-30 grayscale' : ''}`}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Background</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isTransparent} 
                      onChange={(e) => setIsTransparent(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/10"
                    />
                    <span className="text-xs opacity-70">Transparent</span>
                  </label>
                  <input 
                    type="color" 
                    value={bgColor} 
                    disabled={isTransparent}
                    onChange={(e) => setBgColor(e.target.value)}
                    className={`w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none ${isTransparent ? 'opacity-30 grayscale' : ''}`}
                  />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span>Opacity</span>
                  <span className="opacity-50">{Math.round(globalOpacity * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01"
                  value={globalOpacity} onChange={(e) => setGlobalOpacity(parseFloat(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-widest opacity-50">Position</label>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Origin X</span>
                  <span className="opacity-50">{originX}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="1"
                  value={originX} onChange={(e) => setOriginX(parseInt(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Origin Y</span>
                  <span className="opacity-50">{originY}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="1"
                  value={originY} onChange={(e) => setOriginY(parseInt(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Angle Spread</span>
                  <span className="opacity-50">{angleSpread}°</span>
                </div>
                <input 
                  type="range" min="1" max="360" step="1"
                  value={angleSpread} onChange={(e) => setAngleSpread(parseInt(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Rotation</span>
                  <span className="opacity-50">{angleRotation}°</span>
                </div>
                <input 
                  type="range" min="0" max="360" step="1"
                  value={angleRotation} onChange={(e) => setAngleRotation(parseInt(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-widest opacity-50">Dynamics</label>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Density</span>
                  <span className="opacity-50">{Math.round(density * 100)}%</span>
                </div>
                <input 
                  type="range" min="0.1" max="2" step="0.1"
                  value={density} onChange={(e) => setDensity(parseFloat(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Dot Size</span>
                  <span className="opacity-50">{particleSize}px</span>
                </div>
                <input 
                  type="range" min="0" max="20" step="0.5"
                  value={particleSize} onChange={(e) => setParticleSize(parseFloat(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Line Length</span>
                  <span className="opacity-50">{lineLength}px</span>
                </div>
                <input 
                  type="range" min="10" max="3000" step="10"
                  value={lineLength} onChange={(e) => setLineLength(parseInt(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Line Width</span>
                  <span className="opacity-50">{lineWidth}px</span>
                </div>
                <input 
                  type="range" min="0.1" max="5" step="0.1"
                  value={lineWidth} onChange={(e) => setLineWidth(parseFloat(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Speed</span>
                  <span className="opacity-50">{speed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.1" max="5" step="0.1"
                  value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Gravity (Droop)</span>
                  <span className="opacity-50">{gravity.toFixed(1)}</span>
                </div>
                <input 
                  type="range" min="0" max="5" step="0.1"
                  value={gravity} onChange={(e) => setGravity(parseFloat(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="mt-auto pt-8 flex flex-col gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition-all active:scale-95"
          >
            {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={onExport}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all active:scale-95"
          >
            <Download size={18} />
            Export Image
          </button>
          <button
            onClick={onExportVideo}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all active:scale-95"
          >
            <Download size={18} />
            Export Video (5s)
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default ControlPanel;
