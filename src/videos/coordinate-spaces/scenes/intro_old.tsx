import { makeScene2D } from '@motion-canvas/2d';
import {
  Circle,
  Grid,
  Latex,
  Layout,
  Line,
  Node,
  Rect,
  Txt,
} from '@motion-canvas/2d/lib/components';
import {
  all,
  delay,
  sequence,
  waitFor,
  waitUntil,
} from '@motion-canvas/core/lib/flow';
import { createComputed } from '@motion-canvas/core/lib/signals';
import {
  easeInBack,
  easeInOutBack,
  easeOutBack,
  easeOutCubic,
} from '@motion-canvas/core/lib/tweening';
import { Origin, Vector2 } from '@motion-canvas/core/lib/types';
import {
  createRef,
  debug,
  usePlayback,
  useScene,
} from '@motion-canvas/core/lib/utils';

import theme from '@theme';

import { ArcVector, Coordinates, SceneContainer } from '../components';

export default makeScene2D(function* (view) {
  const scene = createRef<Rect>();
  const line = createRef<Line>();
  const rectangle = createRef<Rect>();
  const rectCoordinates = createRef<Coordinates>();
  const circleCoordinates = createRef<Coordinates>();
  const circle = createRef<Circle>();
  const circleContainer = createRef<Node>();
  const targetCircle = createRef<Circle>();
  const circlePathHorizontal = createRef<Line>();
  const circlePathArc = createRef<ArcVector>();
  const angleText = createRef<Txt>();
  const tex = createRef<Latex>();

  const rectPosOffsetHorizontal = createComputed(() =>
    rectangle().position().add(Vector2.right.scale(300)),
  );

  const rectSize = 80;
  const circleSize = 60;

  yield view.add(
    <>
      <SceneContainer ref={scene}>
        <Rect radius={18} smoothCorners clip width={1000} height={800}>
          <Grid
            lineWidth={1}
            stroke={theme.colors.Gray4}
            width={1000}
            height={800}
            spacing={50}
            opacity={0.5}
          />
        </Rect>

        <Rect
          ref={rectangle}
          size={0}
          fill={theme.colors.Blue1}
          radius={9}
          smoothCorners
        />

        <Coordinates
          ref={rectCoordinates}
          scale={0}
          coordinates={() => rectangle().position()}
          position={() =>
            rectangle()
              .position()
              .add(
                rectangle()
                  .getOriginDelta(Origin.Bottom)
                  .add(Vector2.up.scale(36)),
              )
          }
        />

        <Circle
          ref={targetCircle}
          size={circleSize}
          stroke={theme.colors.Red}
          lineWidth={5}
          lineDash={[12, 9]}
          x={300}
          endAngle={0}
        />

        <Line
          ref={line}
          stroke={theme.colors.Gray2}
          lineWidth={5}
          points={() => [
            rectangle()
              .position()
              .add(
                rectangle()
                  .getOriginDelta(Origin.Right)
                  .add(Vector2.right.scale(20)),
              ),
            targetCircle()
              .position()
              .add(
                targetCircle()
                  .getOriginDelta(Origin.Left)
                  .add(Vector2.left.scale(24)),
              ),
          ]}
          endArrow
          arrowSize={16}
          end={0}
        />

        <Line
          ref={circlePathHorizontal}
          stroke={theme.colors.Gray2}
          points={[]}
          lineWidth={4}
          endArrow
          arrowSize={13}
          end={0}
        />

        <ArcVector
          ref={circlePathArc}
          size={600}
          stroke={theme.colors.Brown2}
          lineWidth={4}
          arrowSize={13}
          endAngle={0}
          lineDash={[8, 8]}
        />

        <Txt
          ref={angleText}
          fontSize={28}
          fontFamily={theme.fonts.mono}
          fill={theme.colors.Brown2}
          text={() => `${rectangle().rotation().toString()}°`}
          position={() =>
            circlePathArc()
              .position()
              .add(
                Vector2.fromRadians(
                  (circlePathArc().endAngle() * Math.PI) / 270,
                ).scale(300),
              )
              .add(Vector2.right.scale(45))
          }
          scale={0}
        />

        <Node ref={circleContainer}>
          <Circle
            ref={circle}
            size={0}
            fill={theme.colors.Red}
            position={[800, -300]}
          />
        </Node>

        <Coordinates
          ref={circleCoordinates}
          coordinates={Vector2.zero}
          position={() =>
            rectangle()
              .position()
              .add(
                rectangle()
                  .getOriginDelta(Origin.Bottom)
                  .add(Vector2.up.scale(36)),
              )
          }
          scale={0}
        />
      </SceneContainer>

      <Latex
        ref={tex}
        tex={`
\\color{${theme.colors.White}}{
\\begin{align}
circle.x = rect.x + cos(\\theta)(circle.x - rect.x)
\\\\[3pt]
- \\sin(\\theta)(circle.y - rect.y)
\\\\[10pt]
circle.y = rect.y + \\sin(\\theta)(circle.x - rect.x)
\\\\[3pt]
+ \\cos(\\theta)(circle.y - rect.y)
\\end{align}}
`}
        width={780}
        opacity={0}
        x={145}
        offset={[-1, 0]}
      />
    </>,
  );
  scene().scale(0);

  yield* waitUntil('show-scene');
  yield* scene().scale(1, 0.65, easeOutBack);

  yield* waitUntil('show-rect');
  yield* rectangle().size(rectSize, 0.5, easeOutBack);

  yield* waitUntil('show-circle');
  yield* circle().size(circleSize, 0.5, easeOutBack);

  yield* waitUntil('show-target-pos');
  yield* sequence(0.2, line().end(1, 0.75), targetCircle().endAngle(360, 0.6));

  yield* waitUntil('hide-target-pos');
  yield* all(line().end(0, 0.4, easeInBack), targetCircle().endAngle(0, 0.5));

  yield* waitUntil('show-rect-coords');
  yield* rectCoordinates().scale(1, 0.5, easeOutBack);

  yield* waitUntil('move-rect');
  yield* rectangle().position([-100, 75], 1).to([-120, -30], 1).to(0, 1);

  yield* waitUntil('show-circle-coords');
  circleCoordinates().scale(1);
  yield* circleCoordinates().absolutePosition(
    () =>
      circle()
        .absolutePosition()
        .add(circle().getOriginDelta(Origin.Bottom).add(Vector2.up.scale(72))),
    1,
  );

  yield* waitUntil('add-300');
  yield* circleCoordinates().coordinates([300, 0], 0.75);

  yield* waitUntil('position-circle');
  yield* circle().position([300, 0], 1);
  circleCoordinates().coordinates(() => circle().position());

  yield* waitUntil('hide-coordinates');
  yield* all(
    rectCoordinates().scale(0, 0.5, easeInBack),
    circleCoordinates().scale(0, 0.5, easeInBack),
  );

  yield* waitUntil('move-rect-1');
  yield* rectangle().position([-125, 175], 1);

  yield* waitUntil('show-coordinates');
  yield* sequence(
    0.15,
    rectCoordinates().scale(1, 0.5, easeOutBack),
    circleCoordinates().scale(1, 0.5, easeOutBack),
  );

  yield* waitUntil('position-circle-2');
  yield* circle().position(rectPosOffsetHorizontal, 1);

  yield* waitUntil('move-rect-2');
  yield* rectangle().position([-125, -175], 1).to([-73, 42], 1);

  yield* waitUntil('hide-coordinates-2');
  yield* sequence(
    0.15,
    rectCoordinates().scale(0, 0.5, easeInBack),
    circleCoordinates().scale(0, 0.5, easeInBack),
  );

  yield* waitUntil('rotate-rect');
  yield* rectangle().rotation(50, 1);

  yield* waitUntil('show-rect-coordinates-2');
  yield* rectCoordinates().scale(1, 0.5, easeOutBack);

  yield* waitUntil('rotate-rect-2');
  yield* rectangle().rotation(-30, 1);
  yield* waitFor(0.25);
  yield* rectangle().rotation(69, 1);
  yield* waitFor(0.25);
  yield* rectangle().rotation(-420, 1.3, easeInOutBack);
  rectangle().rotation(-60);
  yield* waitFor(1);
  yield* rectangle().rotation(50, 1);

  yield* waitUntil('pulse-circle');
  yield* circle().scale(0.2, 0.7, easeInBack);
  yield* waitFor(0.4);
  yield* circle().ripple(1.2);
  yield* circle().scale(1, 0.7, easeOutBack);

  yield* waitUntil('pos-circle-horizontal');
  yield* circle().position(rectangle().position(), 0.8);

  yield* waitUntil('pos-circle-horizontal-2');
  circlePathHorizontal()
    .points([
      rectangle()
        .position()
        .add(
          rectangle().getOriginDelta(Origin.Right).add(Vector2.right.scale(20)),
        ),
      rectPosOffsetHorizontal().add(
        circle().getOriginDelta(Origin.Left).add(Vector2.left.scale(20)),
      ),
    ])
    .end(0);
  yield* all(
    delay(0.22, circlePathHorizontal().end(1, 0.55)),
    circle().position(rectPosOffsetHorizontal(), 1),
  );
  yield* circleCoordinates().scale(1, 0.5, easeOutBack);

  yield* waitUntil('pos-circle-arc');
  circlePathArc().position(rectangle().position());
  circleContainer().position(rectangle().position());
  circleCoordinates()
    .coordinates(() =>
      circle().position().transformAsPoint(circleContainer().localToParent()),
    )
    .position();
  circle().position([300, 0]);
  targetCircle().position(rectPosOffsetHorizontal()).endAngle(360);
  circlePathArc().startAngle(10).endAngle(10);
  yield* all(
    targetCircle().scale(0.8).scale(1, 0.18),
    delay(0.35, circlePathArc().endAngle(40, 0.65, easeOutCubic)),
    delay(0.6, angleText().scale(1, 0.5, easeOutBack)),
    circleContainer().rotation(50, 1),
  );

  yield* waitUntil('show-formula');
  yield* scene().position.x(-400, 0.6);
  yield* tex().opacity(1, 0.7);

  yield* waitUntil('hide-formular');
  yield* all(tex().opacity(0, 0.4));
  yield* scene().position.x(0, 0.5, easeOutBack);

  yield* waitUntil('reset-scene');
  yield* all(
    circlePathHorizontal().end(0, 0.6),
    circlePathArc().endAngle(10, 0.6),
    circlePathArc().arrowSize(0, 0.4),
    angleText().scale(0, 0.4, easeInBack),
    targetCircle().endAngle(0, 0.6),
  );
  circle().reparent(rectangle());
  circle().position.x(300);
  circleCoordinates().coordinates(() =>
    circle().absolutePosition().transformAsPoint(view.worldToLocal()),
  );
  yield* all(rectangle().position(0, 0.6), rectangle().rotation(0, 0.6));

  yield* waitUntil('move-relative');
  yield* rectangle()
    .position([-120, 210], 1)
    .to([80, -100], 1)
    .to([-40, -100], 1);
  yield* rectangle().rotation(200, 1.5).to(20, 1.5);

  yield* waitUntil('scale');
  yield* rectangle().scale(0.5, 1).to(1.3, 1).to(1, 1);

  yield* waitUntil('hide-screen');
  yield* all(
    rectangle().scale(0, 1, easeInBack),
    circleCoordinates().scale(0, 0.5),
    rectCoordinates().scale(0, 0.5),
    delay(0.7, scene().scale(0, 0.7, easeInBack)),
  );

  yield* waitUntil('end-scene');
});
