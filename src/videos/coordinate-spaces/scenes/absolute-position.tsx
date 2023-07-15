import { Circle, Line, Rect, Txt, makeScene2D } from '@motion-canvas/2d';
import {
  Vector2,
  createRef,
  createSignal,
  easeInBack,
  easeOutBack,
  sequence,
  waitUntil,
} from '@motion-canvas/core';
import { all } from '@motion-canvas/core/lib/flow';
import { easeOutCubic } from '@motion-canvas/core/lib/tweening';

import theme from '@theme';

import {
  CircleObject,
  Control,
  Coordinates,
  Cursor,
  RectCircleSceneTree,
  RectObject,
  SceneContainer,
  SceneTree,
  TransformationRig,
} from '../components';

export default makeScene2D(function* (view) {
  const scene = createRef<SceneContainer>();
  const circle = createRef<Circle>();
  const rect = createRef<Rect>();
  const rectCoords = createRef<Coordinates>();
  const circleGlobalCoords = createRef<Coordinates>();
  const circleLocalCoords = createRef<Coordinates>();
  const cursor = createRef<Cursor>();
  const rig = createRef<TransformationRig>();
  const positionLine = createRef<Line>();
  const circleX = createRef<Circle>();
  const circleY = createRef<Circle>();
  const labelX = createRef<Txt>();
  const labelY = createRef<Txt>();

  const sceneTree = (<RectCircleSceneTree />) as SceneTree;

  view.add(
    <>
      <SceneContainer ref={scene} scale={0} sceneTree={sceneTree} showAxis>
        <RectObject ref={rect} />

        <CircleObject
          ref={circle}
          position={() => rect().position().add([300, -200])}
        />

        <Coordinates
          ref={rectCoords}
          coordinates={() => rect().position()}
          xColor={theme.colors.Gray1}
          yColor={theme.colors.Gray1}
          top={() => rect().position().add(Vector2.up.scale(90))}
        />

        <Coordinates
          ref={circleGlobalCoords}
          coordinates={() => circle().position()}
          top={() => circle().bottom().add(Vector2.up.scale(10))}
        />

        <Coordinates
          ref={circleLocalCoords}
          xColor={theme.colors.Gray1}
          yColor={theme.colors.Gray1}
          coordinates={[300, -200]}
          bottom={() => circle().top().add(Vector2.down.scale(10))}
          scale={0}
        />

        <Line
          ref={positionLine}
          lineWidth={2.5}
          points={() => [
            [0, circle().position.y()],
            circle().position(),
            [circle().position.x(), 0],
          ]}
          stroke={theme.colors.Gray1}
          lineDash={[8, 9.5]}
          start={0.5}
          end={0.5}
        />

        <Circle
          ref={circleX}
          size={10}
          fill={theme.colors.White}
          x={() => circle().position.x()}
          scale={0}
        />

        <Circle
          ref={circleY}
          size={10}
          fill={theme.colors.White}
          y={() => circle().position.y()}
          scale={0}
        />

        <Txt
          ref={labelX}
          fontFamily={theme.fonts.mono}
          fill={theme.colors.Red}
          text={() => circle().position.x().toFixed(0).toString()}
          position={() => [circle().position.x(), 30]}
          fontSize={28}
          scale={0}
        />

        <Txt
          ref={labelY}
          fontFamily={theme.fonts.mono}
          fill={theme.colors.Green1}
          text={() => circle().position.y().toFixed(0).toString()}
          right={() => [-20, circle().position.y()]}
          fontSize={28}
          scale={0}
        />
      </SceneContainer>

      <TransformationRig
        ref={rig}
        node={rect()}
        stroke={theme.colors.White}
        spacing={20}
        scale={0}
      />

      <Cursor ref={cursor} scale={0} position={[150, 100]} />
    </>,
  );

  yield* waitUntil('show scene');
  yield* scene().scale(1, 0.7, easeOutBack);

  yield* waitUntil('show rig');
  yield* sequence(0.3, rig().scale(1, 0.6, easeOutBack), cursor().show());

  yield* waitUntil('move cursor');
  yield* cursor().moveToPosition(rect(), 0.7);
  yield* cursor().clickAndDrag(
    rect(),
    [
      [-200, -100],
      [-150, 50],
    ],
    0.8,
  );

  yield* waitUntil('rotate rect');
  let cursorPos = createSignal(() =>
    rig().control(Control.Rotation).transformAsPoint(rig().localToWorld()),
  );
  yield* cursor().moveToPosition(cursorPos, 0.7);
  circle().position(() =>
    new Vector2(300, -200).transformAsPoint(rect().localToParent()),
  );
  yield* rect().rotation(40, 0.9).wait(0.1).to(-10, 0.8);

  yield* waitUntil('scale rect');
  yield* cursorPos(
    () =>
      rig().control(Control.TopRight).transformAsPoint(rig().localToWorld()),
    0.7,
  );
  circle().scale(rect().scale);
  yield* rect().scale(1.4, 0.9).wait(0.1).to(0.6, 1).wait(0.1).to(1, 1);

  yield* waitUntil('reset rotation');
  yield* cursorPos(
    () =>
      rig().control(Control.Rotation).transformAsPoint(rig().localToWorld()),
    0.5,
  );
  yield* rect().rotation(0, 0.6);

  yield* waitUntil('hide rig');
  circle().scale(1);
  circle().position(() => rect().position().add([300, -200]));
  cursor().unstick();
  yield* sequence(
    0.1,
    cursor().hide(),
    rig().scale(0, 0.7, easeInBack),
    rectCoords().hide(),
    circleGlobalCoords().hide(),
  );

  yield* waitUntil('move camera');
  scene().camera.save();
  yield* scene().camera.centerOn(circleLocalCoords(), 1.5);

  yield* waitUntil('show local coords');
  yield* circleLocalCoords().show();

  yield* waitUntil('show lines');
  yield* sequence(
    0.06,
    ...[circleX(), circleY()].map((node) => node.scale(1, 0.7, easeOutBack)),
    ...[labelX(), labelY()].map((node) => node.scale(1, 0.7, easeOutBack)),
    all(positionLine().start(0, 0.7), positionLine().end(1, 0.7)),
  );

  yield* waitUntil('show global coords');
  circleGlobalCoords()
    .bottom(circleLocalCoords().top().add(Vector2.down.scale(12)))
    .scale(1)
    .zIndex(-1)
    .opacity(0);
  circleGlobalCoords().save();
  circleLocalCoords().save();
  yield* sequence(
    0.3,
    all(
      circleLocalCoords().bottom(circle().top().add(Vector2.up.scale(12)), 0.8),
      circleLocalCoords().opacity(0, 0.8),
    ),
    all(
      circleGlobalCoords().bottom(
        () => circle().top().add(Vector2.down.scale(10)),
        0.7,
        easeOutCubic,
      ),
      circleGlobalCoords().opacity(1, 0.7),
    ),
  );

  yield* waitUntil('show local coords 2');
  yield* sequence(
    0.3,
    circleGlobalCoords().restore(0.7),
    circleLocalCoords().restore(0.7, easeOutCubic),
  );

  yield* waitUntil('hide lines');
  yield* sequence(
    0.15,
    ...[circleX(), circleY()].map((node) => node.scale(0, 0.6, easeInBack)),
    ...[labelX(), labelY()].map((node) => node.scale(0, 0.6, easeInBack)),
    all(positionLine().start(0.6, 0.6), positionLine().end(0.6, 0.6)),
    circleLocalCoords().hide(),
  );

  yield* waitUntil('hide objects');
  yield* sequence(
    0.1,
    sceneTree.scale(0, 0.6, easeInBack),
    circle().scale(0, 0.6, easeInBack),
    rect().scale(0, 0.6, easeInBack),
    scene().camera.restore(1),
    scene().size([2000, 1100], 1),
  );

  yield* waitUntil('scene end');
});
