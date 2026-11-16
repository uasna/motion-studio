import { Sequence } from "remotion";
import { Ignition } from "./scenes/Ignition";
import { Forge } from "./scenes/Forge";
import { Title } from "./scenes/Title";
import { System } from "./scenes/System";
import { Close } from "./scenes/Close";

export const Identity001: React.FC = () => {
  return (
    <>
      <Sequence durationInFrames={45}>
        <Ignition />
      </Sequence>

      <Sequence from={45} durationInFrames={75}>
        <Forge />
      </Sequence>

      <Sequence from={112} durationInFrames={98}>
        <Title />
      </Sequence>

      <Sequence from={210} durationInFrames={45}>
        <System />
      </Sequence>

      <Sequence from={255} durationInFrames={45}>
        <Close />
      </Sequence>
    </>
  );
};
