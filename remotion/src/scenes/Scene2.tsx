import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { Shield, Target, Cpu } from "lucide-react";

const { fontFamily } = loadFont();

export const Scene2 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1]);
  
  const stagger = (i: number) => spring({
    frame: frame - (10 + i * 15),
    fps,
    config: { damping: 12, stiffness: 150 }
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center p-20">
      <h2 
        style={{ fontFamily, opacity: titleOpacity }} 
        className="text-5xl font-bold mb-20 text-white/90"
      >
        Tecnologia de <span className="text-primary">Próxima Geração</span>
      </h2>
      
      <div className="flex gap-20">
        {[
          { label: "Biometria", icon: <Cpu className="w-12 h-12" /> },
          { label: "Rastreio", icon: <Target className="w-12 h-12" /> },
          { label: "Segurança", icon: <Shield className="w-12 h-12" /> }
        ].map((item, i) => (
          <div 
            key={i}
            style={{ 
              transform: `scale(${stagger(i)}) translateY(${interpolate(stagger(i), [0, 1], [50, 0])}px)`,
              opacity: stagger(i)
            }}
            className="flex flex-col items-center gap-4 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl"
          >
            <div className="text-primary">{item.icon}</div>
            <div className="text-xl font-semibold">{item.label}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};