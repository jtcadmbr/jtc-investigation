import { registerRoot, Composition } from "remotion";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily } = loadFont();

const Scene1 = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{backgroundColor: '#020617', color: 'white'}} className="flex items-center justify-center">
      <div style={{ fontFamily, opacity: titleOpacity }} className="text-8xl font-black tracking-tighter">
        JTC <span style={{color: '#3b82f6'}}>INVESTIGAÇÃO</span>
      </div>
    </AbsoluteFill>
  );
};

const Root = () => (
  <Composition
    id="main"
    component={Scene1}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
  />
);

registerRoot(Root);