import { Rect, makeScene2D } from '@motion-canvas/2d';
import { Node, Ray } from '@motion-canvas/2d/lib/components';
import {
  createRef,
  easeInBack,
  easeOutBack,
  sequence,
  waitUntil,
} from '@motion-canvas/core';

import theme from '@theme';

import { Coordinates, RectObject, SceneContainer, Vector } from '../components';

export default makeScene2D(function* (view) {
  const scene = createRef<SceneContainer>();
  const rect = createRef<Rect>();
  const relativeCoordinates = createRef<Coordinates>();
  const relativeVector = createRef<Ray>();
  const absoluteVector = createRef<Ray>();
  const absoluteCoordinates = createRef<Coordinates>();
  const arrowWrapper = createRef<Node>();

  view.add(
    <SceneContainer ref={scene} showAxis>
      <RectObject ref={rect} position={[-150, 200]} scale={0} />

      <Node ref={arrowWrapper}>
        <Vector ref={relativeVector} to={[300, -200]} end={0} />
      </Node>

      <Vector
        ref={absoluteVector}
        to={() => rect().position().add([300, -200])}
        end={0}
        stroke={theme.colors.Green1}
      />

      <Coordinates
        ref={relativeCoordinates}
        coordinates={[300, -200]}
        xColor={theme.colors.Gray2}
        yColor={theme.colors.Gray2}
        left={() =>
          relativeVector()
            .to()
            .transformAsPoint(arrowWrapper().localToParent())
            .add([15, 0])
        }
        scale={0}
      />

      <Coordinates
        ref={absoluteCoordinates}
        coordinates={() => rect().position().add([300, -200])}
        bottom={() => absoluteVector().to().add([0, -25])}
        scale={0}
      />
    </SceneContainer>,
  );

  yield* waitUntil('show pos');
  yield* sequence(
    0.2,
    relativeVector().end(1, 0.6),
    relativeCoordinates().show(),
  );

  yield* waitUntil('show rect');
  yield* rect().scale(1, 0.7, easeOutBack);

  yield* waitUntil('move coordinates');
  yield* arrowWrapper().position(rect().position(), 1);

  yield* waitUntil('show absolute');
  yield* sequence(
    0.2,
    absoluteVector().end(1, 0.6),
    absoluteCoordinates().show(),
  );

  yield* waitUntil('hide objects');
  yield* sequence(
    0.08,
    absoluteCoordinates().hide(),
    absoluteVector().end(0, 0.6),
    relativeCoordinates().hide(),
    relativeVector().end(0, 0.6),
    rect().scale(0, 0.6, easeInBack),
    scene().gridStroke(theme.colors.Gray5, 0.5),
    scene().axisStroke(theme.colors.Gray5, 0.5),
    scene().size([2000, 1200], 0.7),
  );

  yield* waitUntil('scene end');
});
