import { makeScene2D } from '@motion-canvas/2d';
import {
  Circle,
  Knot,
  Line,
  Node,
  Rect,
  Spline,
  Txt,
} from '@motion-canvas/2d/lib/components';
import { all, delay, sequence, waitUntil } from '@motion-canvas/core/lib/flow';
import { easeInBack, easeOutBack } from '@motion-canvas/core/lib/tweening';
import { createRef } from '@motion-canvas/core/lib/utils';

import { typewrite } from '@common/utils';

import theme from '@theme';

import { Cursor, Pill } from '../components';

export default makeScene2D(function* (view) {
  const title = createRef<Txt>();
  const pillGroup = createRef<Node>();
  const rectPill = createRef<Rect>();
  const circlePill = createRef<Rect>();
  const dragHighlight = createRef<Rect>();
  const cursor = createRef<Cursor>();
  const childLine = createRef<Line>();
  const dragPath = createRef<Spline>();

  const rectIcon = (
    <Rect
      size={18}
      radius={5}
      lineWidth={6}
      stroke={`${theme.colors.Blue1}88`}
      fill={theme.colors.Blue1}
      smoothCorners
    />
  );
  const circleIcon = (
    <Circle
      size={16}
      fill={theme.colors.Red}
      stroke={`${theme.colors.Red}88`}
      lineWidth={6}
    />
  );

  view.add(
    <>
      <Txt
        ref={title}
        text={'Relative Positioning'}
        fontFamily={theme.fonts.serif}
        fontWeight={600}
        fontSize={84}
        letterSpacing={2}
        fill={theme.colors.White}
        opacity={0}
      />

      <Node ref={pillGroup}>
        <Rect
          ref={dragHighlight}
          width={320}
          height={190}
          fill={theme.colors.Blue2}
          position={[35, 5]}
          radius={18}
          opacity={0}
          strokeFirst
          smoothCorners
        />

        <Pill
          ref={rectPill}
          text={'Rectangle'}
          icon={rectIcon}
          y={-45}
          scale={0}
        />
        <Pill
          ref={circlePill}
          text={'Circle'}
          icon={circleIcon}
          y={45}
          scale={0}
        />

        <Line
          ref={childLine}
          lineWidth={4}
          radius={6}
          stroke={theme.colors.Gray1}
          points={[
            [-85, 0],
            [-85, 45],
            [-40, 45],
          ]}
          end={0}
        />
      </Node>

      <Spline ref={dragPath} smoothness={0.55} position={[0, -45]} closed>
        <Knot position={[0, 0]} />
        <Knot position={[-60, -60]} />
        <Knot position={[0, -120]} />
        <Knot position={[60, -60]} />
      </Spline>

      <Cursor ref={cursor} scale={0} size={80} position={160} />
    </>,
  );

  yield* waitUntil('show title');
  title().opacity(1);
  yield* typewrite(title(), 1);

  yield* waitUntil('hide title');
  yield* title().scale(0, 0.5, easeInBack);

  yield* waitUntil('show pills');
  yield* sequence(
    0.1,
    rectPill().scale(1, 0.5, easeOutBack),
    circlePill().scale(1, 0.5, easeOutBack),
  );

  yield* waitUntil('show cursor');
  yield* cursor().show();

  yield* waitUntil('move cursor');
  yield* cursor().moveToNode(circlePill(), 0.8);
  yield* all(
    delay(0.7, childLine().end(1, 0.5)),
    delay(0.38, dragHighlight().opacity(0.2, 0.45)),
    delay(1.4, dragHighlight().opacity(0, 0.7)),
    cursor().clickAndDrag(circlePill(), [[80, 45]], 0.7, {
      ghostOpacity: 0,
    }),
  );

  yield* waitUntil('move pills');
  yield* cursor().moveToNode(rectPill(), 0.5);
  yield* cursor().clickAndDragPath(pillGroup(), dragPath(), 1.3, {
    ghostOpacity: 0,
    nodeScale: 0.95,
    dragPivot: rectPill(),
  });

  yield* waitUntil('hide cursor');
  yield* cursor().hide();

  yield* waitUntil('end scene');
  yield* sequence(
    0.08,
    childLine().end(0, 0.5),
    circlePill().scale(0, 0.6, easeInBack),
    rectPill().scale(0, 0.6, easeInBack),
  );
});
