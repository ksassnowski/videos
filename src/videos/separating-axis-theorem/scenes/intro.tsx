import { makeScene2D } from '@motion-canvas/2d';
import { Layout, Node, Rect, Txt } from '@motion-canvas/2d/lib/components';
import { all, waitFor, waitUntil } from '@motion-canvas/core/lib/flow';
import { createSignal } from '@motion-canvas/core/lib/signals';
import { ThreadGenerator } from '@motion-canvas/core/lib/threading';
import { BBox, Vector2 } from '@motion-canvas/core/lib/types';
import { createRef, debug } from '@motion-canvas/core/lib/utils';

import { translate } from '@common/utils/translate';

import theme from '@theme';

function intersect(a: BBox, b: BBox): boolean {
  return (
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
  );
}

function polygonsIntersect(
  verticesA: Vector2[],
  verticesB: Vector2[],
): boolean {
  for (const vertices of [verticesA, verticesB]) {
    for (let i = 0; i < vertices.length; i++) {
      const a = vertices[i];
      const b = vertices[(i + 1) % vertices.length];
      const edge = b.sub(a);
      const axis = edge.perpendicular.normalized;
      const [minA, maxA] = projectVertices(axis, verticesA);
      const [minB, maxB] = projectVertices(axis, verticesB);

      if (minA >= maxB || minB >= maxA) {
        return false;
      }
    }
  }

  return true;
}

function projectVertices(axis: Vector2, vertices: Vector2[]): [number, number] {
  let min = Infinity;
  let max = -Infinity;

  for (const vertex of vertices) {
    const projection = axis.dot(vertex);
    min = Math.min(min, projection);
    max = Math.max(max, projection);
  }

  return [min, max];
}

export default makeScene2D(function* (view) {
  view.fontFamily('Operator Mono');

  const text = createRef<Layout>();
  const rectA = createRef<Rect>();
  const rectB = createRef<Rect>();
  const rectsIntersect = createSignal(() =>
    polygonsIntersect(
      rectA().cacheBBox().transformCorners(rectA().localToParent()),
      rectB().cacheBBox().transformCorners(rectB().localToParent()),
    ),
  );

  view.add(
    <>
      <Layout ref={text} y={-400} gap={32} alignItems={'center'} layout>
        <Txt
          text={'Polygons intersect'}
          fontFamily={'Helvetica'}
          fill={theme.colors.Gray2}
        />
        <Txt
          text={() => (rectsIntersect() ? '✔' : 'Ⅹ')}
          fontFamily={'Monospace'}
          fill={() =>
            rectsIntersect() ? theme.colors.Green1 : theme.colors.Red
          }
        />
      </Layout>

      <Rect
        ref={rectA}
        x={-200}
        width={400}
        height={290}
        fill={theme.colors.Red}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <Txt text={'A'} fill={theme.colors.White} fontSize={72} />
      </Rect>

      <Rect
        ref={rectB}
        x={400}
        width={500}
        height={320}
        fill={theme.colors.Blue1}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <Txt text={'B'} fill={theme.colors.White} fontSize={72} />
      </Rect>
    </>,
  );

  yield* waitUntil('transparent-rects');
  rectA().save();
  rectB().save();
  yield* all(
    rectA().fill(`${theme.colors.Red}00`, 1),
    rectA().lineWidth(6, 0),
    rectA().stroke(`${theme.colors.Red}00`, 0).to(theme.colors.Red, 1),
    rectB().fill(`${theme.colors.Blue1}00`, 1),
    rectB().lineWidth(6, 0),
    rectB().stroke(`${theme.colors.Blue1}00`, 0).to(theme.colors.Blue1, 1),
  );

  yield* waitUntil('move-rect-b');
  yield* translate(rectB(), Vector2.left.scale(200), 1);

  yield* waitUntil('reset-rect-b');
  yield* all(rectA().restore(1), rectB().restore(1), text().opacity(0, 1));

  yield* waitUntil('end-intro');
});
