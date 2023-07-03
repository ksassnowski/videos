import { Circle, Rect, makeScene2D } from '@motion-canvas/2d';
import { Ray } from '@motion-canvas/2d/lib/components';
import {
  DEFAULT,
  Vector2,
  createRef,
  easeOutBack,
  sequence,
  waitUntil,
} from '@motion-canvas/core';
import { all } from '@motion-canvas/core/lib/flow';

import theme from '@theme';

import {
  CircleObject,
  Coordinates,
  Grid,
  RectCircleSceneTree,
  RectObject,
  SceneContainer,
  SceneTree,
  Transform,
  Vector,
} from '../components';

export default makeScene2D(function* (view) {
  const transform = createRef<Transform>();
  const scene = createRef<SceneContainer>();
  const rect = createRef<Rect>();
  const circle = createRef<Circle>();
  const rectGrid = createRef<Grid>();
  const circleGrid = createRef<Grid>();
  const relativePosVector = createRef<Ray>();
  const absolutePosVector = createRef<Ray>();
  const circleLocalCoordinates = createRef<Coordinates>();
  const circleGlobalCoordinates = createRef<Coordinates>();

  const sceneTree = (<RectCircleSceneTree scale={0} />) as SceneTree;

  view.add(
    <>
      <SceneContainer
        ref={scene}
        width={3000}
        height={2200}
        gridSpacing={120}
        showAxis
        position={[-300, 200]}
        gridEnd={0}
        axisLineWidth={6}
        sceneTree={sceneTree}
      >
        <Grid
          ref={rectGrid}
          spacing={50}
          axisStroke={'#63878f'}
          stroke={'#393f48'}
          position={() => rect().position()}
          width={'120%'}
          height={'120%'}
          end={0}
        />
        <Grid
          ref={circleGrid}
          position={() => circle().position()}
          spacing={50}
          axisStroke={'#6b4343'}
          stroke={'#574242'}
          width={'120%'}
          height={'120%'}
          end={0}
        />

        <RectObject ref={rect} scale={0} position={[-50, 150]} />
        <CircleObject ref={circle} position={[250, -100]} scale={0} />

        <Vector
          ref={relativePosVector}
          to={() => circle().position()}
          end={0}
        />

        <Vector
          ref={absolutePosVector}
          stroke={theme.colors.Green1}
          to={() => circle().position()}
          end={0}
        />

        <Coordinates
          ref={circleLocalCoordinates}
          coordinates={[250, -100]}
          xColor={theme.colors.Gray2}
          yColor={theme.colors.Gray2}
          left={() =>
            relativePosVector().getPointAtPercentage(0.3).position.add([60, 0])
          }
          scale={0}
        />

        <Coordinates
          ref={circleGlobalCoordinates}
          coordinates={() => circle().position()}
          bottom={() => circle().top().add([0, -10])}
          scale={0}
        />
      </SceneContainer>

      <Transform ref={transform} node={scene} end={0} />
    </>,
  );

  yield* waitUntil('show transform');
  yield* transform().end(1, 0.5);

  yield* waitUntil('scale transform');
  yield* transform().axisLength(120, 0.6);

  yield* waitUntil('rotate transform');
  yield* scene().rotation(-40, 0.6);

  yield* waitUntil('show grid');
  yield* scene().gridEnd(1, 2);

  yield* waitUntil('reset scene');
  yield* all(
    transform().end(0, 0.5),
    scene().gridSpacing(DEFAULT, 0.9),
    scene().axisLineWidth(DEFAULT, 0.9),
    scene().rotation(0, 0.9),
    scene().position(0, 0.9),
    scene().size([1000, 800], 0.8),
  );
  yield* sequence(
    0.1,
    rect().scale(1, 0.7, easeOutBack),
    circle().scale(1, 0.7, easeOutBack),
  );

  yield* waitUntil('show grids');
  yield* sequence(
    0.1,
    rectGrid().end(1, 1),
    circleGrid().end(1, 1),
    scene().gridEnd(0, 0.6),
  );

  yield* waitUntil('hide grids');
  yield* sequence(
    0.1,
    rectGrid().end(0, 1),
    circleGrid().end(0, 1),
    scene().gridEnd(1, 0.6),
  );

  yield* waitUntil('show tree');
  yield* sceneTree.scale(1.5, 0.6, easeOutBack);

  yield* waitUntil('show pos');
  yield* sequence(
    0.2,
    relativePosVector().end(1, 0.7),
    circleLocalCoordinates().show(),
  );

  yield* waitUntil('move circle');
  yield* all(
    relativePosVector().from(rect().position, 1),
    circle().position(() => rect().position().add([250, -100]), 1),
  );

  yield* waitUntil('change grids');
  yield* sequence(0.1, scene().gridEnd(0, 2), rectGrid().end(1, 2));

  yield* waitUntil('show world space');
  yield* sequence(0.1, rectGrid().end(0, 1), scene().gridEnd(1, 1.4));

  yield* waitUntil('show world pos');
  yield* sequence(
    0.2,
    absolutePosVector().end(1, 0.7),
    circleGlobalCoordinates().show(),
  );

  yield* waitUntil('scene end');
});
