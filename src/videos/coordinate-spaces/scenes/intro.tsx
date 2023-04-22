import { makeScene2D } from '@motion-canvas/2d';
import { Circle, Grid, Layout, Rect } from '@motion-canvas/2d/lib/components';
import { sequence, waitUntil } from '@motion-canvas/core/lib/flow';
import { easeInBack, easeOutBack } from '@motion-canvas/core/lib/tweening';
import { createRef } from '@motion-canvas/core/lib/utils';
import "@motion-canvas/core/lib/types/Color"

import theme from '@theme';

import { Cursor, SceneContainer } from '../components';

export default makeScene2D(function* (view) {
  const sceneContainer = createRef<Rect>();
  const worldGrid = createRef<Grid>();
  const rect = createRef<Rect>();
  const circle = createRef<Circle>();
  const cursor = createRef<Cursor>();

  yield view.add(
    <>
      <SceneContainer ref={sceneContainer} scale={0}>
        <Layout width={990} height={790} clip>
          <Grid
            ref={worldGrid}
            stroke={`${theme.colors.Gray1}26`}
            spacing={50}
            width={'100%'}
            height={'100%'}
            scale={0}
          />
        </Layout>

        <Rect
          ref={rect}
          size={80}
          scale={0}
          radius={18}
          smoothCorners
          fill={theme.colors.Blue1}
        />

        <Circle
          ref={circle}
          position={() => rect().position().add([200, -100])}
          size={60}
          fill={theme.colors.Red}
          scale={0}
        />

        <Cursor
          ref={cursor}
          color={theme.colors.Gray2}
          scale={0}
          size={80}
          position={100}
        />
      </SceneContainer>
    </>,
  );

  yield* waitUntil('show scene');
  yield* sceneContainer().scale(1, 0.8, easeOutBack);

  yield* waitUntil('show rect');
  yield* rect().scale(1, 0.5, easeOutBack);

  yield* waitUntil('show circle');
  yield* circle().scale(1, 0.5, easeOutBack);

  yield* waitUntil('show cursor');
  yield* cursor().scale(1, 0.5, easeOutBack);

  yield* waitUntil('move rectangle');
  yield* cursor().moveToNode(rect(), 1);
  yield* cursor().clickAndDrag(
    rect(),
    [
      [-200, 0],
      [120, -120],
      [80, 300],
      [-180, -100],
      [0, 0],
    ],
    1,
  );

  yield* waitUntil('hide cursor');
  yield* cursor().scale(0, 0.5, easeInBack);

  yield* waitUntil('hide scene');
  yield* sequence(
    0.1,
    circle().scale(0, 0.6, easeInBack),
    rect().scale(0, 0.6, easeInBack),
  );
  yield* sceneContainer().scale(0, 0.8, easeInBack);
});
