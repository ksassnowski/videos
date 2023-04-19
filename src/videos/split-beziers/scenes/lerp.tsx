import { CameraView } from '@ksassnowski/motion-canvas-camera';
import { SurroundingRectangle } from '@ksassnowski/motion-canvas-components';

import { makeScene2D } from '@motion-canvas/2d';
import { Circle, Line, Txt } from '@motion-canvas/2d/lib/components';
import {
  all,
  chain,
  delay,
  sequence,
  waitFor,
  waitUntil,
} from '@motion-canvas/core/lib/flow';
import { createSignal } from '@motion-canvas/core/lib/signals';
import { ThreadGenerator } from '@motion-canvas/core/lib/threading';
import { easeInBack, linear, spring } from '@motion-canvas/core/lib/tweening';
import { Direction, Vector2 } from '@motion-canvas/core/lib/types';
import { createRef, makeRef } from '@motion-canvas/core/lib/utils';

import { Knot } from '@common/components/Knot';
import { Spline } from '@common/components/Spline';
import { group } from '@common/utils/group';
import { nextTo } from '@common/utils/nextTo';

import theme from '@theme';

import { Brace, BraceDirection } from '../components/Brace';
import { LerpFormula } from '../components/LerpFormula';
import { Bezier, ControlPoint, makeBezierRefs } from '../utils/drawBezier';

const PointSpring = {
  mass: 0.3,
  stiffness: 18.0,
  damping: 2.2,
  initialVelocity: 15.0,
};

export default makeScene2D(function* (view) {
  const camera = createRef<CameraView>();
  const refs = makeBezierRefs();
  const controlPoints: Circle[] = [];
  const lines: Line[] = [];
  const pointOnCurve = createRef<Circle>();
  const tText = createRef<Txt>();

  const bezierControlPoints = [
    Vector2.createSignal([-500, 200]),
    Vector2.createSignal([500, -120]),
    Vector2.createSignal([100, -200]),
    Vector2.createSignal([300, 300]),
  ];

  const t = createSignal(0);

  function makeControlPoint(
    from: Circle,
    to: Circle,
    refIndex: number,
    color: string = theme.colors.White,
  ) {
    return (
      <ControlPoint
        ref={makeRef(controlPoints, refIndex)}
        position={() => from.position().lerp(to.position(), t())}
        stroke={color}
      />
    );
  }

  function* hideSkeleton(duration: number = 1): ThreadGenerator {
    yield* all(
      ...controlPoints.map((point) => point.opacity(0, duration)),
      ...lines.map((line) => line.opacity(0, duration)),
      tText().opacity(0, duration),
    );
  }

  function* showSkeleton(duration: number = 1): ThreadGenerator {
    yield* all(
      ...controlPoints.map((point) => point.opacity(1, duration)),
      ...lines.map((line) => line.opacity(1, duration)),
      tText().opacity(1, duration),
    );
  }

  view.add(
    <CameraView ref={camera} width={'100%'} height={'100%'}>
      <Bezier refs={refs} points={bezierControlPoints} showCurve={false} />,
    </CameraView>,
  );

  yield* waitUntil('draw-curve');
  yield* refs.curve.end(1, 1.5);

  yield* waitUntil('show-points');
  yield* sequence(
    0.1,
    ...refs.controlPoints.map((point) =>
      spring(PointSpring, 0, 1, 0.1, (value) => {
        point.scale(value);
      }),
    ),
  );

  yield* waitUntil('simpler-curve');
  yield* all(
    bezierControlPoints[1].y(200, 1),
    bezierControlPoints[2].x(-350, 1),
    bezierControlPoints[2].y(-200, 1),
    bezierControlPoints[3].x(350, 1),
    bezierControlPoints[3].y(-200, 1),
  );

  yield* waitUntil('hide-curve');
  yield* refs.curve.end(0, 1.5);

  yield* waitUntil('highlight-points');
  yield* sequence(
    0.06,
    ...refs.controlPoints.map((point) =>
      chain(point.fill(theme.colors.Blue3, 0), point.ripple(1)),
    ),
  );
  yield* all(
    ...refs.controlPoints.map((point) => point.fill(theme.colors.Gray5, 0.7)),
  );

  yield* waitUntil('ghost-curve');
  refs.curve.lineWidth(3);
  refs.curve.lineDash([16, 16]);
  refs.curve.stroke(theme.colors.Gray2);
  yield* refs.curve.end(1, 1);
  // prettier-ignore
  let positions = [
    [[200, 200], [200, 200], [200, 200], [-500, 200]],
    [[-200, 200], [-200, 200], [-200, 200], [500, 200]],
    [[-350, -200], [-200, 0], [200, 0], [-350, -200]],
    [[350, -200], [200, 0], [-200, 0], [350, -200]],
  ];
  yield* all(
    ...positions.flatMap((coordinates, i) =>
      chain(
        ...coordinates.flatMap(([x, y]) =>
          all(
            bezierControlPoints[i].x(x, 0.7),
            bezierControlPoints[i].y(y, 0.7),
          ),
        ),
      ),
    ),
  );
  yield* refs.curve.end(0, 0.7);

  // Position point labels a little better
  refs.pointLabels[0].buffer([-60, 20]);
  refs.pointLabels[1].buffer([60, 20]);
  refs.pointLabels[2].buffer([-60, -40]);
  refs.pointLabels[3].buffer([60, -40]);

  yield* waitUntil('draw-control-polygon-1');
  yield* sequence(
    0.5,
    refs.lines[0].end(1, 1),
    all(refs.pointLabels[0].scale(1, 0.5), refs.pointLabels[2].scale(1, 0.5)),
  );

  yield* waitUntil('draw-control-polygon-2');
  yield* sequence(
    0.8,
    refs.lines[2].end(1, 1),
    refs.pointLabels[3].scale(1, 0.5),
  );

  yield* waitUntil('draw-control-polygon-3');
  refs.lines[1].start(1);
  refs.lines[1].end(1);
  yield* sequence(
    0.8,
    refs.lines[1].end(0, 1),
    refs.pointLabels[1].scale(1, 0.5),
  );

  yield* waitUntil('hide-line-segment-p1p2');
  yield* refs.lines[2].end(0, 0.7);

  yield* waitUntil('show-line-segment-p1p2');
  yield* refs.lines[2].end(1, 0.7);

  yield* waitUntil('draw-curve-2');
  refs.curve.lineDash([0, 0]);
  refs.curve.lineWidth(8);
  refs.curve.stroke(theme.colors.White);
  yield* refs.curve.end(1, 1);

  yield* waitUntil('show-target-t');
  t(0.5);
  refs.container.add(
    <>
      <Txt
        ref={tText}
        fontFamily={'Operator Mono'}
        fontSize={48}
        fill={theme.colors.Green1}
        text={() => `t = ${t().toFixed(2)}`}
        position={[0, -40]}
        opacity={0}
      />
      <Circle
        ref={pointOnCurve}
        position={() => refs.curve.getPointAtPercentage(t()).position}
        width={28}
        height={28}
        fill={theme.colors.Gray5}
        lineWidth={5}
        stroke={theme.colors.White}
      />
    </>,
  );
  yield* spring(PointSpring, 0, 1, 0.05, (value) =>
    pointOnCurve().scale(value),
  );

  yield* waitUntil('show-t');
  yield* tText().opacity(1, 0.7);

  yield* waitUntil('hide-target-t');
  yield* pointOnCurve().scale(0, 0.75, easeInBack);

  yield* waitUntil('show-line-segment-ts');
  refs.container.add(
    <>
      {makeControlPoint(
        refs.controlPoints.at(0),
        refs.controlPoints.at(2),
        0,
        theme.colors.Blue1,
      )}
      {makeControlPoint(
        refs.controlPoints.at(2),
        refs.controlPoints.at(3),
        1,
        theme.colors.Blue1,
      )}
      {makeControlPoint(
        refs.controlPoints.at(3),
        refs.controlPoints.at(1),
        2,
        theme.colors.Blue1,
      )}
      {makeControlPoint(
        controlPoints[0],
        controlPoints[1],
        3,
        theme.colors.Red,
      )}
      {makeControlPoint(
        controlPoints[1],
        controlPoints[2],
        4,
        theme.colors.Red,
      )}
    </>,
  );
  controlPoints.map((point) => point.scale(0));
  yield* sequence(
    0.1,
    ...controlPoints
      .slice(0, 3)
      .map((point) =>
        spring(PointSpring, 0, 1, 0.03, (value) => point.scale(value)),
      ),
  );

  yield* waitUntil('zoom-to-p0-p1');
  const curveGroup = group(
    refs.curve,
    ...refs.lines,
    ...refs.pointLabels,
    ...refs.controlPoints,
  );
  curveGroup.save();
  camera().save();
  yield* all(
    refs.lines[2].end(0, 1),
    refs.lines[1].start(0, 1),
    refs.curve.end(0, 1),
    refs.pointLabels[1].opacity(0, 1),
    refs.pointLabels[3].opacity(0, 1),
    refs.controlPoints[1].scale(0, 0.75, easeInBack),
    refs.controlPoints[3].scale(0, 0.75, easeInBack),
    ...controlPoints.slice(1).map((point) => point.scale(0, 0.75, easeInBack)),
    delay(
      0.3,
      all(
        refs.pointLabels[0].fontSize(26, 1.3),
        refs.pointLabels[2].fontSize(26, 1.3),
        refs.pointLabels[0].buffer([-40, 20], 1.3),
        refs.pointLabels[2].buffer([-40, -20], 1.3),
        refs.lines[0].lineWidth(3, 1.2),
      ),
    ),
    tText().opacity(0, 1),
    camera().zoomOnto([-430, -5, 500, 500], 1.7, 40),
  );

  yield* waitUntil('wiggle-point');
  yield* t(0.6, 0.5).to(0.3, 0.5).to(0.85, 0.5);
  yield* waitFor(0.5);
  yield* t(0.5, 1);

  yield* waitUntil('show-t-2');
  nextTo(tText(), controlPoints[0], Direction.Right, 120);
  tText().opacity(1);
  tText().fontSize(0);
  yield* tText().fontSize(38, 0.5);

  yield* waitUntil('show-percentage-t');
  const percentageText = createRef<Txt>();
  camera().add(
    <Txt
      ref={percentageText}
      text={() => ` = ${(t() * 100).toFixed(0)}%`}
      fill={theme.colors.Blue1}
      fontFamily={'Operator Mono'}
      fontSize={38}
    />,
  );
  nextTo(percentageText(), tText(), Direction.Right, 30);
  yield* percentageText().fontSize(0, 0).to(38, 0.5);

  yield* waitUntil('t to 0');
  yield* t(0, 1.5);

  yield* waitUntil('t to 0.5');
  yield* t(0.5, 1.5);

  yield* waitUntil('shift-camera');
  yield* all(
    tText().fontSize(0, 0.5),
    percentageText().fontSize(0, 0.5),
    camera().shift(Vector2.right.scale(230), 1.25),
  );

  yield* waitUntil('show-linear-interpolation-text');
  const lerpTitle = createRef<Txt>();
  const lerpFunctionText = createRef<Txt>();
  const highlightLines: Line[] = [];
  camera().add(
    <>
      <Line
        ref={makeRef(highlightLines, 0)}
        points={[
          [-295, 22],
          [-265, 22],
        ]}
        lineWidth={8}
        end={0}
        stroke={theme.colors.Red}
      />
      <Line
        ref={makeRef(highlightLines, 1)}
        points={[
          [-65, 22],
          [10, 22],
        ]}
        lineWidth={8}
        end={0}
        stroke={theme.colors.Red}
      />
      <Txt
        ref={lerpTitle}
        text={'Linear Interpolation'}
        fontFamily={'PT Serif'}
        fill={theme.colors.Blue1}
        fontSize={0}
        position={[-60, 0]}
      />
      <Txt
        ref={lerpFunctionText}
        text={'lerp'}
        fontFamily={'Operator Mono'}
        fill={theme.colors.Red}
        fontSize={0}
      />
    </>,
  );
  nextTo(lerpFunctionText(), lerpTitle(), Direction.Bottom, 90);
  yield* lerpTitle().fontSize(52, 1);

  yield* waitUntil('show-lerp-function');
  yield* lerpFunctionText().fontSize(0, 0).to(32, 0.7);

  yield* waitUntil('show-highlight-lines');
  yield* all(...highlightLines.map((line) => line.end(1, 1)));

  yield* waitUntil('hilarious-zoom');
  camera().save();
  yield* all(camera().zoomOnto(lerpTitle(), 0, 100), camera().rotate(5, 0));

  yield* waitUntil('reset-camera');
  yield* camera().restore(0);

  camera().save();
  yield* waitUntil('center-lerp');
  yield* all(
    ...highlightLines.map((line) => line.end(0, 0.3)),
    lerpTitle().fontSize(0, 0.5),
    delay(0.2, lerpFunctionText().position.y(-0, 1)),
  );

  yield* waitUntil('position-lerp');
  yield* lerpFunctionText().position.x(-280, 1);

  yield* waitUntil('lerp-formula');
  const formula = createRef<LerpFormula>();
  const highlightRect = createRef<SurroundingRectangle>();
  const lerpStart = createRef<Circle>();
  const lerpEnd = createRef<Circle>();
  const lerpLine = createRef<Line>();
  const lerpStartText = createRef<Txt>();
  const lerpEndText = createRef<Txt>();
  lerpFunctionText().opacity(0);
  camera().add(
    <>
      <LerpFormula ref={formula} a={'a'} b={'b'} t={'t'} x={-55} />
      <SurroundingRectangle
        stroke={theme.colors.Blue2}
        fill={`${theme.colors.Blue2}18`}
        lineWidth={2}
        ref={highlightRect}
        nodes={[formula().refs[13], formula().refs[17]]}
        end={0}
        radius={14}
        zIndex={-1}
        smoothCorners
      />
      <ControlPoint ref={lerpStart} position={[-300, -100]} scale={0} />
      <ControlPoint ref={lerpEnd} position={[190, -100]} scale={0} />
      <Line
        ref={lerpLine}
        zIndex={-1}
        points={() => [lerpStart().position, lerpEnd().position()]}
        lineWidth={3}
        end={0}
        stroke={theme.colors.White}
      />
      <Txt
        ref={lerpStartText}
        text={'0'}
        fontFamily={'Operator Mono'}
        fontSize={0}
        fill={theme.colors.Blue1}
        position={() => lerpStart().position().add(Vector2.down.scale(40))}
      />
      <Txt
        ref={lerpEndText}
        text={'10'}
        fontFamily={'Operator Mono'}
        fontSize={0}
        fill={theme.colors.Brown2}
        position={() => lerpEnd().position().add(Vector2.down.scale(40))}
      />
    </>,
  );

  /*
  camera().add(
    <Brace
      from={lerpStart()}
      to={lerpEnd()}
      buffer={15}
      lineWidth={4}
      stroke={theme.colors.Red}
    />,
  );
   */

  const spline = createRef<Spline>();
  const brace = createRef<Brace>();
  camera().add(
    <>
      <Brace
        ref={brace}
        nodes={[refs.controlPoints[2], controlPoints[0]]}
        buffer={10}
        inset={5}
        start={0.49}
        end={0.51}
        edge={BraceDirection.Left}
      />
    </>,
  );
  yield* all(brace().start(0, 1), brace().end(1, 1));
  yield* brace().nodes([refs.controlPoints[2], refs.controlPoints[0]], 1);
  yield* brace().curvature(2, 1).to(0.6, 1).to(1, 1);

  /*
  camera().add(
    <Spline
      ref={spline}
      zIndex={-1}
      lineWidth={4}
      stroke={theme.colors.Red}
      arrowSize={12}
    >
      <Knot
        position={() => lerpStart().position().add(Vector2.up.scale(15))}
        endHandle={[0, 40]}
      />
      <Knot
        position={() =>
          lerpStart()
            .position()
            .lerp(lerpEnd().position(), 0.5)
            .add(Vector2.up.scale(40))
        }
        startHandle={[-18, -40]}
        endHandle={[18, -40]}
        broken
      />
      <Knot
        position={() => lerpEnd().position().add(Vector2.up.scale(15))}
        startHandle={[0, 40]}
      />
    </Spline>,
  );
   */
  // yield* spline().end(0, 0).to(1, 3, linear);

  // yield* camera().zoomOnto(formula(), 1, 48);
  yield* all(
    lerpStart().scale(1, 0.5),
    lerpEnd().scale(1, 0.5),
    delay(
      0.3,
      all(
        lerpLine().end(1, 0.4),
        lerpStartText().fontSize(32, 0.4),
        lerpEndText().fontSize(32, 0.4),
      ),
    ),
  );

  yield* waitUntil('b-a');
  yield* highlightRect().end(1, 1);

  yield* waitUntil('multiply-by-t');
  yield* highlightRect().nodes([formula().refs[11], formula().refs[17]], 1);

  yield* waitUntil('add-to-a');
  yield* highlightRect().nodes([formula().refs[9], formula().refs[17]], 1);

  yield* waitUntil('fade-rect');
  yield* highlightRect().end(0, 0.4);

  yield* waitUntil('reset-camera-2');
  yield* camera().restore(1);

  yield* waitUntil('zoom-out');
  yield* camera().zoom(1.6, 1);

  yield* waitUntil('show-curve-again');
  yield* all(
    formula().opacity(0, 1),
    camera().restore(1),
    curveGroup.restore(1),
  );

  yield* waitUntil('??');

  /*
  refs.container.add(
    <>
      <Node
        spawner={() => [
          <Line
            ref={makeRef(lines, 0)}
            points={() => [
              controlPoints[0].position(),
              controlPoints[1].position(),
            ]}
            lineWidth={1.5}
            stroke={theme.colors.Blue1}
          />,
          <Line
            ref={makeRef(lines, 1)}
            points={() => [
              controlPoints[1].position(),
              controlPoints[2].position(),
            ]}
            lineWidth={1.5}
            stroke={theme.colors.Blue1}
          />,
          <Line
            ref={makeRef(lines, 2)}
            points={() => [
              controlPoints[3].position(),
              controlPoints[4].position(),
            ]}
            lineWidth={1.5}
            stroke={theme.colors.Red}
          />,
        ]}
      />

      <Circle
        ref={makeRef(controlPoints, 5)}
        position={() =>
          controlPoints[3].position().lerp(controlPoints[4].position(), t())
        }
        width={22}
        height={22}
        fill={theme.colors.Gray5}
        lineWidth={4}
        stroke={theme.colors.White}
      />

    </>,
  );

  reorderEverything(refs, controlPoints);

  refs.curve.end(t);

  yield* hideSkeleton(0);

  yield* waitUntil("show-skeleton");
  yield* showSkeleton();

  yield* waitUntil("draw-curve-1");
  yield* t(0, 0).to(1, 3, linear);
  yield* hideSkeleton(0.5);

  yield* waitUntil("change-line");
  yield* all(
    bezierControlPoints[1].y(-120, 1),
    bezierControlPoints[2].x(100, 1),
    bezierControlPoints[2].y(-200, 1),
    bezierControlPoints[3].x(300, 1),
    bezierControlPoints[3].y(300, 1),
  );

  yield* waitUntil("hide-curve-2");
  yield* t(0, 1);

  yield* waitUntil("show-skeleton-2");
  yield* showSkeleton();

  yield* waitUntil("draw-curve-2");
  yield* t(1, 3, linear);
  yield* hideSkeleton(0.5);

  yield* waitFor(1);
   */
});
