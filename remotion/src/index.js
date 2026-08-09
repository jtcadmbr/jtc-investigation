import { registerRoot, Composition } from "remotion";
import React from "react";

const Scene1 = () => {
  return (
    <div style={{
      flex: 1,
      backgroundColor: '#020617',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 100,
      fontWeight: 'black'
    }}>
      JTC <span style={{color: '#3b82f6', marginLeft: 20}}>INVESTIGAÇÃO</span>
    </div>
  );
};

const Root = () => (
  <Composition
    id="main"
    component={Scene1}
    durationInFrames={30}
    fps={30}
    width={1920}
    height={1080}
  />
);

registerRoot(Root);