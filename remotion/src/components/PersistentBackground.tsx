import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const PersistentBackground = () => {
  const frame = useCurrentFrame();
  
  const rotation = interpolate(frame, [0, 300], [0, 45]);
  const glowOpacity = interpolate(Math.sin(frame / 20), [-1, 1], [0.3, 0.6]);

  return (
    <AbsoluteFill className="overflow-hidden pointer-events-none">
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0f172a,0%,#020617_100%)]" 
      />
      
      {/* Animated Aurora blobs */}
      <div 
        style={{ 
          transform: `rotate(${rotation}deg) scale(1.5)`,
          opacity: glowOpacity 
        }}
        className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/20 blur-[150px] rounded-full"
      />
      
      <div 
        style={{ 
          transform: `rotate(${-rotation}deg) scale(1.2)`,
          opacity: glowOpacity * 0.8
        }}
        className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-600/10 blur-[120px] rounded-full"
      />

      {/* Grid line effect */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px]" />
    </AbsoluteFill>
  );
};