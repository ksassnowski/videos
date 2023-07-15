import { Circle, Polygon, Rect, Txt, makeScene2D } from '@motion-canvas/2d';
import { Ray, ShapeProps } from '@motion-canvas/2d/lib/components';
import {
  DEFAULT,
  Vector2,
  createRef,
  createSignal,
  easeInBack,
  easeOutBack,
  loopUntil,
  sequence,
  waitUntil,
} from '@motion-canvas/core';
import { all, loop } from '@motion-canvas/core/lib/flow';
import { createComputed } from '@motion-canvas/core/lib/signals';
import { easeInOutCubic, tween } from '@motion-canvas/core/lib/tweening';
import { debug } from '@motion-canvas/core/lib/utils';

import { createPolarLerp, rotatePoint } from '@common/utils';

import theme from '@theme';

import {
  CircleObject,
  Coordinates,
  Grid,
  RectCircleSceneTree,
  RectObject,
  SceneContainer,
  SceneTree,
  Vector,
} from '../components';

export default makeScene2D(function* (view) {
  const worldScene = createRef<SceneContainer>();
  const rect = createRef<Rect>();
  const circle = createRef<Circle>();
  const localScene = createRef<SceneContainer>();
  const rectGrid = createRef<Grid>();
  const origin = createRef<Circle>();
  const originCoordinates = createRef<Coordinates>();
  const xArrowLocal = createRef<Ray>();
  const xCoordinateLocal = createRef<Txt>();
  const xArrowWorld = createRef<Ray>();
  const xCoordinateWorld = createRef<Txt>();

  const rectPosition = Vector2.createSignal();
  const rectScale = Vector2.createSignal(1);
  const rectRotation = createSignal(0);

  const polygonPosition = new Vector2(-250, -150);
  const circlePosition = new Vector2(250, 250);
  const trianglePosition = new Vector2(-150, 200);

  const sceneTree = () => (<RectCircleSceneTree />) as SceneTree;

  function createPositionSignal(pos: Vector2) {
    return createComputed(() =>
      pos.transformAsPoint(rect().localToParent().inverse()),
    );
  }

  function moveRectangle() {
    return rectPosition([100, 100], 1)
      .wait(0.5)
      .to([-200, 75], 1)
      .wait(0.5)
      .to(0, 1)
      .wait(0.5);
  }

  function scaleRectangle() {
    return rectScale(0.8, 1).wait(0.5).to(1.3, 1).wait(0.5).to(1, 1).wait(0.5);
  }

  function* showRectGrid() {
    yield* all(
      rectGrid().start(0.5, 0).to(0, 1),
      rectGrid().end(0.5, 0).to(1, 1),
    );
  }

  function* hideRectGrid() {
    yield* all(rectGrid().start(0.5, 1), rectGrid().end(0.5, 1));
  }

  const props: ShapeProps = {
    fill: theme.colors.Brown3,
    scale: () => Vector2.one.div(rectScale()),
    rotation: () => -rectRotation(),
  };

  view.add(
    <>
      <SceneContainer
        ref={worldScene}
        width={850}
        height={700}
        scale={0}
        x={-475}
        sceneTree={sceneTree()}
        showAxis
      >
        <Grid
          ref={rectGrid}
          width={'100%'}
          height={'100%'}
          position={rectPosition}
          spacing={() => new Vector2(50).mul(rectScale())}
          rotation={rectRotation}
          axisStroke={'#63878f'}
          stroke={'#51666c'}
          end={0}
        />

        <RectObject
          ref={rect}
          position={rectPosition}
          rotation={rectRotation}
          scale={rectScale}
        >
          <CircleObject ref={circle} position={[300, -200]} />
        </RectObject>

        <Polygon
          sides={5}
          size={70}
          fill={theme.colors.Brown3}
          position={polygonPosition}
        />

        <Circle
          size={60}
          fill={theme.colors.Brown3}
          position={circlePosition}
        />

        <Polygon
          sides={3}
          size={90}
          fill={theme.colors.Brown3}
          position={trianglePosition}
        />

        <Vector
          ref={xArrowWorld}
          to={() =>
            new Vector2([300, 0]).transformAsPoint(rect().localToParent())
          }
          end={0}
        />

        <Txt
          ref={xCoordinateWorld}
          text={() =>
            new Vector2([300, 0])
              .transformAsPoint(rect().localToParent())
              .x.toFixed(0)
          }
          fontFamily={theme.fonts.mono}
          fontSize={28}
          position={() =>
            new Vector2([300, 0])
              .transformAsPoint(rect().localToParent())
              .add([0, -30])
          }
          fill={theme.colors.Red}
          scale={0}
        />
      </SceneContainer>

      <SceneContainer
        ref={localScene}
        width={850}
        height={700}
        x={475}
        labelText={'Local Space'}
        labelColor={theme.colors.Blue1}
        sceneTree={sceneTree()}
        scale={0}
        showAxis
      >
        <RectObject>
          <CircleObject position={[300, -200]} />
        </RectObject>

        <Polygon
          sides={5}
          size={70}
          position={createPositionSignal(polygonPosition)}
          {...props}
        />

        <Circle
          size={60}
          position={createPositionSignal(circlePosition)}
          {...props}
        />

        <Polygon
          sides={3}
          size={90}
          position={createPositionSignal(trianglePosition)}
          {...props}
        />

        <Vector ref={xArrowLocal} to={[300, 0]} end={0} />

        <Txt
          ref={xCoordinateLocal}
          text={'300'}
          fontFamily={theme.fonts.mono}
          fontSize={28}
          position={[300, 40]}
          fill={theme.colors.Red}
          scale={0}
        />

        <Circle ref={origin} fill={theme.colors.White} size={14} scale={0} />

        <Coordinates
          ref={originCoordinates}
          coordinates={0}
          y={-70}
          scale={0}
        />
      </SceneContainer>
    </>,
  );

  yield* waitUntil('show scenes');
  yield* sequence(
    0.1,
    worldScene().scale(1, 0.8, easeOutBack),
    localScene().scale(1, 0.8, easeOutBack),
  );

  yield* waitUntil('show world label');
  yield* worldScene().labelScale(1, 0.6, easeOutBack);

  yield* waitUntil('show local label');
  yield* localScene().labelScale(1, 0.6, easeOutBack);

  yield* waitUntil('move rect');
  yield* loopUntil('stop moving', moveRectangle);

  yield* waitUntil('show rect grid');
  yield* showRectGrid();

  yield* waitUntil('move rect 2');
  yield loopUntil('stop move 2', moveRectangle);

  yield* waitUntil('show origin');
  yield* sequence(
    0.1,
    origin().scale(1, 0.7, easeOutBack),
    origin().ripple(1),
    originCoordinates().show(),
  );

  yield* waitUntil('show local pos');
  yield* sequence(
    0.3,
    xArrowLocal().end(1, 0.7),
    xCoordinateLocal().scale(1, 0.7, easeOutBack),
  );

  yield* waitUntil('hide rect grid');
  yield* all(
    hideRectGrid(),
    xArrowLocal().end(0, 0.6),
    xCoordinateLocal().scale(0, 0.6, easeOutBack),
    originCoordinates().hide(),
    origin().scale(0, 0.6, easeOutBack),
  );

  yield* waitUntil('scale rect');
  yield loop(2, scaleRectangle);

  yield* waitUntil('show rect grid 2');
  yield* showRectGrid();

  yield* waitUntil('scale rect 2');
  yield* rectScale(0.7, 1);

  yield* waitUntil('show local pos 2');
  yield* sequence(
    0.3,
    xArrowLocal().end(1, 0.7),
    xCoordinateLocal().scale(1, 0.7, easeOutBack),
  );

  yield* waitUntil('show world arrow');
  yield* xArrowWorld().end(1, 0.7);

  yield* waitUntil('hide rect grid 2');
  yield* hideRectGrid();
  yield* xCoordinateWorld().scale(1, 0.7, easeOutBack);

  yield* waitUntil('hide arrows');
  yield* all(
    xArrowLocal().end(0, 0.7),
    xArrowWorld().end(0, 0.7),
    xCoordinateWorld().scale(0, 0.6, easeInBack),
    xCoordinateLocal().scale(0, 0.6, easeInBack),
  );

  yield* waitUntil('reset scale');
  yield* rectScale(1, 1);

  yield* waitUntil('rotate rect');
  yield* rectRotation(45, 1);

  yield* waitUntil('show rect grid 3');
  yield* showRectGrid();

  yield* waitUntil('rotate rect 2');
  yield* rectRotation(-15, 1.2).wait(0.5).to(-120, 1.2).wait(0.5);

  yield* waitUntil('show local arrow');
  yield* sequence(
    0.3,
    xArrowLocal().end(1, 0.7),
    xCoordinateLocal().scale(1, 0.7, easeOutBack),
  );

  yield* waitUntil('show world arrow 2');
  yield* xArrowWorld().end(1, 0.7);

  yield* waitUntil('show world coord');
  yield* hideRectGrid();

  /*
  yield* waitUntil('center scene');
  yield* all(
    localScene().x(1400, 0.7),
    worldScene().x(0, 0.7),
    worldScene().width(1000, 0.7),
    worldScene().height(800, 0.7),
    rectRotation(0, 0.8),
    rectScale(1, 0.7),
    xArrowWorld().end(0, 0.5),
    worldScene().labelScale(0, 0.7),
  );
  localScene().remove();

  yield* waitUntil('transform rect');
  yield* rectRotation(-50, 0.7);
  yield* rectPosition([150, 150], 0.7);
  yield* rectScale(0.7, 0.7);

  yield* waitUntil('show arrow');
  xArrowWorld()
    .from(rect().position())
    .to(circle().position().transformAsPoint(rect().localToParent()));
  yield* xArrowWorld().end(1, 0.8);

  yield* waitUntil('move vector');
  yield* all(
    xArrowWorld().from(0, 0.7),
    xArrowWorld().to(circle().position(), 0.7),
  );

  yield* waitUntil('scale vector');
  yield* xArrowWorld().to(circle().position().mul(rectScale()), 0.7);

  yield* waitUntil('rotate vector');
  yield* xArrowWorld().to(
    rotatePoint(xArrowWorld().to(), rectRotation()),
    0.7,
    easeInOutCubic,
    createPolarLerp(),
  );

  yield* waitUntil('translate vector');
  yield* xArrowWorld().to(xArrowWorld().to().add(rect().position()), 0.7);
   */

  yield* waitUntil('scene end');
});
