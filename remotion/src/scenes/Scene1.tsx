import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily } = loadFont();

export const Scene1 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 30], [50, 0], { extrapolateRight: "clamp" });

  const lineScale = spring({
    frame: frame - 15,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center">
      <div 
        style={{ 
          fontFamily, 
          opacity: titleOpacity, 
          transform: `translateY(${titleY}px)`,
          textShadow: '0 0 40px rgba(59, 130, 246, 0.5)'
        }}
        className="text-8xl font-black tracking-tighter text-white"
      >
        JTC <span className="text-primary">INVESTIGAÇÃO</span>
      </div>
      <div 
        style={{ transform: `scaleX(${lineScale})` }}
        className="h-1 w-64 bg-primary mt-4 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.8)]" 
      />
      <div 
        style={{ opacity: interpolate(frame, [40, 60], [0, 0.6], { extrapolateRight: "clamp" }) }}
        className="mt-8 text-xl font-mono tracking-widest text-primary/80 uppercase"
      >
        Intelligence & Biometrics
      </div>
    </AbsoluteFill>
  );
};