import { makeScene2D } from '@motion-canvas/2d';
import {
  Circle,
  Latex,
  Line,
  LineProps,
  Node,
  Rect,
} from '@motion-canvas/2d/lib/components';
import { all, delay, sequence, waitUntil } from '@motion-canvas/core/lib/flow';
import { createComputed } from '@motion-canvas/core/lib/signals';
import {
  easeInBack,
  easeInOutBack,
  easeOutBack,
} from '@motion-canvas/core/lib/tweening';
import { Vector2 } from '@motion-canvas/core/lib/types';
import { createRef } from '@motion-canvas/core/lib/utils';

import { texColor } from '@common/utils';

import theme from '@theme';

import {
  CircleObject,
  Control,
  Coordinates,
  Cursor,
  RectCircleSceneTree,
  RectObject,
  RelativePositionVector,
  SceneContainer,
  SceneTree,
  SimpleFormula,
  TransformationRig,
} from '../components';

export default makeScene2D(function* (view) {
  const sceneContainer = createRef<SceneContainer>();
  const rect = createRef<Rect>();
  const circle = createRef<Circle>();
  const circleGhost = createRef<Circle>();
  const lineX = createRef<Line>();
  const lineY = createRef<Line>();
  const vectorLocal = createRef<Line>();
  const vectorGlobal = createRef<Line>();
  const cursor = createRef<Cursor>();
  const tex = createRef<Latex>();
  const formulaTex = createRef<Latex>();
  const rig = createRef<TransformationRig>();
  const rectPosContainer = createRef<Node>();
  const circlePosContainer = createRef<Node>();
  const formulaHighlight = createRef<Rect>();
  const rVectorTex = createRef<Latex>();
  const circleRelativeCoords = createRef<Coordinates>();
  const circleCoords = createRef<Coordinates>();
  const rectCoords = createRef<Coordinates>();

  const sceneTree = (<RectCircleSceneTree opacity={0} />) as SceneTree;

  const lineStyle: LineProps = {
    arrowSize: 13,
    lineWidth: 4,
  };

  yield view.add(
    <>
      <SceneContainer
        ref={sceneContainer}
        sceneTree={sceneTree}
        scale={0}
        showAxis
      >
        <RectObject ref={rect} scale={0} zIndex={2} />

        <Coordinates
          ref={rectCoords}
          xColor={theme.colors.Gray2}
          yColor={theme.colors.Gray2}
          coordinates={() => rect().position()}
          position={() => rect().position().add([0, 70])}
          scale={0}
        />

        <CircleObject ref={circle} scale={0} position={[150, -100]} zIndex={3}>
          <Coordinates
            ref={circleCoords}
            coordinates={() => circle().position()}
            position={[0, -55]}
            scale={0}
          />
        </CircleObject>

        <Circle
          ref={circleGhost}
          size={56}
          stroke={theme.colors.Red}
          lineDash={[8, 9]}
          lineWidth={4}
          position={() => rect().position().add(Vector2.right.scale(300))}
          opacity={0}
          zIndex={3}
        />

        <Line
          ref={lineX}
          stroke={theme.colors.Gray1}
          points={() => [
            rect().position(),
            rect().position().add(Vector2.right.scale(300)),
          ]}
          lineDash={[12, 12]}
          start={0.16}
          end={0.16}
          endArrow
          {...lineStyle}
        />

        <Line
          ref={lineY}
          stroke={theme.colors.Gray1}
          points={() => [
            rect().position().add(Vector2.right.scale(300)),
            rect().position().add(new Vector2(300, -200)),
          ]}
          lineDash={[12, 12]}
          end={0.2}
          start={0.2}
          endArrow
          {...lineStyle}
        />

        <Line
          ref={vectorLocal}
          stroke={theme.colors.White}
          points={() => [
            rect().position(),
            rect().position().add(new Vector2(300, -200)),
          ]}
          endArrow
          end={0}
          zIndex={4}
          {...lineStyle}
        />

        <Line
          ref={vectorGlobal}
          stroke={theme.colors.Green1}
          points={() => [0, circle().position()]}
          endArrow
          start={0}
          end={0}
          zIndex={4}
          {...lineStyle}
        />

        <Latex
          ref={rVectorTex}
          tex={texColor('R', theme.colors.White)}
          height={24}
          position={() =>
            vectorLocal().getPointAtPercentage(0.65).position.add([-70, 0])
          }
          scale={0}
        />

        <Coordinates
          ref={circleRelativeCoords}
          coordinates={new Vector2(300, -200)}
          position={() =>
            vectorLocal()
              .getPointAtPercentage(0.62)
              .position.add(new Vector2(-120, 0))
          }
          scale={0}
        />

        <Node
          ref={rectPosContainer}
          zIndex={3}
          position={() => rect().position()}
        >
          <Circle size={12} fill={theme.colors.White} scale={0} />

          <Latex
            tex={`\\color{${theme.colors.White}}{P}`}
            width={25}
            position={[18, 20]}
            scale={0}
          />
        </Node>

        <Node
          ref={circlePosContainer}
          zIndex={4}
          position={() => circle().position()}
        >
          <Circle size={12} fill={theme.colors.White} scale={0} />

          <Latex
            tex={`\\color{${theme.colors.White}}{circlePos(P, R)}`}
            height={30}
            position={[-0, -55]}
            scale={0}
          />
        </Node>

        <TransformationRig
          scale={0}
          ref={rig}
          node={rect()}
          lineWidth={1}
          stroke={theme.colors.White}
          fill={theme.colors.Gray5}
          spacing={20}
        />

        <Cursor ref={cursor} position={100} scale={0} zIndex={20} />
      </SceneContainer>

      <RelativePositionVector
        ref={tex}
        height={65}
        position={[400, -200]}
        scale={0}
      />

      <SimpleFormula
        ref={formulaTex}
        height={120}
        position={[585, 0]}
        scale={0}
      />

      <Rect
        ref={formulaHighlight}
        height={80}
        width={80}
        fill={`${theme.colors.Green1}44`}
        lineWidth={4}
        stroke={theme.colors.Green1}
        radius={14}
        position={[513, 0]}
        scale={0}
        smoothCorners
        zIndex={-1}
      />
    </>,
  );

  yield* waitUntil('show scene');
  yield* sceneContainer().scale(1, 1, easeOutBack);
  yield* rect().scale(1, 0.6, easeOutBack);

  yield* waitUntil('show circle');
  yield* circle().scale(1, 0.6, easeOutBack);

  yield* waitUntil('show scene tree');
  yield* sceneTree.create(0.6);

  yield* waitUntil('show cursor 1');
  yield* cursor().show();

  yield* waitUntil('move group 1');
  circle().save();
  circle().position(() => rect().position().add([150, -100]));
  yield* cursor().moveToPosition(rect(), 0.6);
  yield* cursor().clickAndDrag(
    rect(),
    [
      [-100, 200],
      [-150, -50],
      [50, -100],
      [0, 0],
    ],
    0.8,
  );

  const resizeControl = createComputed(() =>
    rig().control(Control.TopRight).transformAsPoint(rig().localToWorld()),
  );
  const rotationControl = createComputed(() =>
    rig().control(Control.Rotation).transformAsPoint(rig().localToWorld()),
  );

  yield* waitUntil('show transformation rig');
  // Parent the circle to the rectangle temporarily to make the transformations
  // work as expected.
  circle().reparent(rect());
  yield* rig().scale(1, 0.6, easeOutBack);

  yield* waitUntil('scale group');
  yield* cursor().moveToPosition(resizeControl(), 0.6);
  cursor().stickTo(resizeControl);
  yield* rect().scale(1.4, 1);

  yield* waitUntil('rotate group');
  yield* cursor().moveToPosition(rotationControl(), 0.6);
  cursor().stickTo(rotationControl);
  yield* rect().rotation(30, 1).to(0, 0.7);
  yield* cursor().moveToPosition(resizeControl(), 0.6);
  cursor().stickTo(resizeControl);
  yield* rect().scale(1, 0.7);

  yield* waitUntil('hide cursor 1');
  cursor().unstick();
  yield* sequence(0.5, cursor().hide(), rig().scale(0, 0.6));

  yield* waitUntil('show circle target');
  yield* circle().position([300, -200], 1, easeInOutBack);

  yield* waitUntil('reset circle');
  yield* circle().position(0, 0.8);

  yield* waitUntil('position circle x');
  yield* all(
    circle().position.x(300, 1, easeInOutBack),
    delay(0.32, lineX().end(0.86, 0.35)),
  );

  yield* waitUntil('position circle y');
  circleGhost().opacity(1);
  yield* all(
    circle().position.y(-200, 1, easeInOutBack),
    delay(0.32, lineY().end(0.8, 0.35)),
  );

  yield* waitUntil('show cursor');
  circle().reparent(rect().parent());
  circle().position(() => rect().position().add([300, -200]));
  yield* cursor().show();
  yield* cursor().moveToPosition(rect(), 0.7);

  yield* waitUntil('move rectangle');
  yield* cursor().clickAndDrag(
    rect(),
    [
      [-200, -100],
      [-100, 300],
      [0, 0],
    ],
    1,
  );
  yield* cursor().hide();

  yield* waitUntil('hide helper lines');
  yield* sequence(
    0.1,
    lineY().end(lineY().start(), 0.6),
    lineX().end(lineX().start(), 0.6),
    circleGhost().endAngle(0, 0.6),
  );

  yield* waitUntil('show vector formula');
  tex().position(() =>
    vectorLocal()
      .getPointAtPercentage(0.31)
      .position.add(Vector2.right.scale(110)),
  );
  yield* all(tex().scale(1, 0.6, easeOutBack));

  yield* waitUntil('show local vector');
  vectorLocal().start(0).end(0).stroke(theme.colors.White);
  yield* vectorLocal().end(1, 0.7);

  yield* waitUntil('show cursor 3');
  cursor().position(120);
  yield* cursor().show();

  yield* waitUntil('move rect');
  yield* cursor().moveToPosition(rect(), 0.7);
  yield* cursor().clickAndDrag(
    rect(),
    [
      [100, 100],
      [-50, 250],
    ],
    0.8,
  );

  yield* waitUntil('hide cursor 3');
  yield* cursor().hide();

  yield* waitUntil('show helper lines');
  yield* all(
    lineX().end(0.86, 0.6),
    lineY().end(0.8, 0.6),
    circleGhost().endAngle(360, 0.6),
  );

  yield* waitUntil('hide helper lines 2');
  yield* sequence(
    0.1,
    lineY().end(lineY().start(), 0.6),
    lineX().end(lineX().start(), 0.6),
    circleGhost().endAngle(0, 0.6),
  );

  yield* waitUntil('show absolute vector');
  yield* vectorGlobal().end(1, 0.7);

  yield* waitUntil('show cursor 4');
  cursor().position([-100, 100]);
  yield* cursor().show();

  yield* waitUntil('move rect 2');
  yield* cursor().moveToPosition(rect(), 0.6);
  cursor().stickTo(rect().absolutePosition);
  yield* cursor().clickAndDrag(
    rect(),
    [
      [-200, 200],
      [-280, -50],
      [150, 100],
      [50, 250],
    ],
    1,
  );

  yield* waitUntil('hide cursor 4');
  cursor().unstick();
  yield* cursor().hide();

  yield* waitUntil('reset scene');
  yield* sequence(
    0.1,
    tex().scale(0, 0.6, easeInBack),
    vectorLocal().end(0, 0.6),
    vectorGlobal().end(0, 0.6),
    rect().position(0, 1),
  );

  yield* waitUntil('shift scene');
  yield* sceneContainer().position.x(-300, 0.8);

  yield* waitUntil('show formula');
  yield* formulaTex().scale(1, 0.8, easeOutBack);

  yield* waitUntil('highlight P scene');
  yield* formulaHighlight().scale(1, 0.5, easeOutBack);
  yield* all(
    formulaHighlight().ripple(1),
    rect().ripple(1),
    sequence(
      0.1,
      ...rectPosContainer()
        .children()
        .map((child) => child.scale(1, 0.5, easeOutBack)),
    ),
  );

  yield* waitUntil('highlight R formula');
  yield* formulaHighlight().position.x(
    formulaHighlight().position.x() + 60,
    0.6,
  );

  yield* waitUntil('highlight R scene');
  yield* all(
    formulaHighlight().ripple(1),
    rVectorTex().scale(1, 0.5),
    vectorLocal().end(1, 0.6),
  );

  yield* waitUntil('highlight output formula');
  yield* all(
    formulaHighlight().position.x(formulaHighlight().position.x() + 211, 0.6),
    formulaHighlight().width(240, 0.6),
    formulaHighlight().height(160, 0.6),
  );

  yield* waitUntil('highlight output scene');
  yield* all(
    formulaHighlight().ripple(1),
    circle().ripple(1),
    sequence(
      0.1,
      ...circlePosContainer()
        .children()
        .map((child) => child.scale(1, 0.5, easeOutBack)),
    ),
  );

  yield* waitUntil('show absolute pos');
  yield* sequence(
    0.2,
    formulaHighlight().scale(0, 0.6, easeInBack),
    sequence(
      0.3,
      rectPosContainer().scale(0, 0.4, easeInBack),
      rectCoords().scale(1, 0.5, easeOutBack),
    ),
    sequence(
      0.3,
      circlePosContainer().scale(0, 0.4, easeInBack),
      circleCoords().scale(1, 0.5, easeOutBack),
    ),
  );

  yield* waitUntil('show cursor 5');
  cursor().position(100);
  yield* cursor().show();

  yield* waitUntil('cursor to rect');
  yield* cursor().moveToPosition(rect(), 0.7);

  yield* waitUntil('drag rectangle');
  yield* cursor().clickAndDrag(
    rect(),
    [
      [-700, 0],
      [-400, 200],
      [-350, -100],
    ],
    1.2,
  );

  yield* waitUntil('center formula');
  yield* all(
    sequence(
      0.1,
      rVectorTex().scale(0, 0.6, easeInBack),
      cursor().hide(),
      vectorLocal().end(0, 0.6),
    ),
    delay(
      0.4,
      all(
        sceneContainer().position.x(-1500, 1),
        formulaTex().position(0, 1),
        formulaTex().scale(1.5, 1),
      ),
    ),
  );

  yield* waitUntil('end scene');
});
