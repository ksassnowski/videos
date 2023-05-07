import { SurroundingRectangle } from '@ksassnowski/motion-canvas-components';

import { makeScene2D } from '@motion-canvas/2d';
import {
  Circle,
  Latex,
  Line,
  Rect,
  RectProps,
} from '@motion-canvas/2d/lib/components';
import { all, sequence, waitUntil } from '@motion-canvas/core/lib/flow';
import { easeInBack, easeOutBack } from '@motion-canvas/core/lib/tweening';
import { createRef } from '@motion-canvas/core/lib/utils';

import theme from '@theme';

import {
  CircleObject,
  Coordinates,
  Cursor,
  RectCircleSceneTree,
  RectObject,
  SceneContainer,
  TranslationMatrixFormula,
  Vector,
} from '../components';

export default makeScene2D(function* (view) {
  const scene = createRef<SceneContainer>();
  const rect = createRef<Rect>();
  const rectPos = createRef<Coordinates>();
  const posHighlight = createRef<SurroundingRectangle>();
  const circle = createRef<Circle>();
  const circleRelativePos = createRef<Coordinates>();
  const circleAbsolutePos = createRef<Coordinates>();
  const formula = createRef<Latex>();
  const formulaHighlight = createRef<Rect>();
  const cursor = createRef<Cursor>();
  const localVector = createRef<Line>();

  const highlightRectStyles: RectProps = {
    lineWidth: 3,
    fill: `${theme.colors.Green1}33`,
    stroke: theme.colors.Green1,
    radius: 14,
    smoothCorners: true,
  };

  yield view.add(
    <>
      <SceneContainer ref={scene} showAxis>
        <RectCircleSceneTree position={[-370, -305]} />

        <RectObject ref={rect} zIndex={1} scale={0} />

        <Coordinates
          ref={rectPos}
          coordinates={() => rect().position()}
          position={() => rect().position().add([0, 70])}
          scale={0}
          zIndex={1}
        />

        <CircleObject
          ref={circle}
          position={() => rect().position().add([300, -200])}
          zIndex={1}
          scale={0}
        />

        <Coordinates
          ref={circleAbsolutePos}
          scale={0}
          coordinates={() =>
            circle().absolutePosition().transformAsPoint(scene().worldToLocal())
          }
          position={() => circle().position().add([0, -60])}
        />

        <Coordinates
          ref={circleRelativePos}
          coordinates={() => circle().position().sub(rect().position())}
          position={() => circle().position().add([0, 60])}
          xColor={theme.colors.Gray1}
          yColor={theme.colors.Gray1}
          scale={0}
        />

        <Vector
          ref={localVector}
          from={() => rect().position()}
          to={() => circle().position()}
          zIndex={2}
          end={0}
        />

        <SurroundingRectangle
          ref={posHighlight}
          nodes={circleRelativePos()}
          scale={0}
          bufferY={10}
          {...highlightRectStyles}
        />
      </SceneContainer>

      <Rect
        ref={formulaHighlight}
        size={[45, 70]}
        position={[410, 0]}
        scale={0}
        {...highlightRectStyles}
      />
      <TranslationMatrixFormula ref={formula} scale={0} x={550} width={700} />

      <Cursor ref={cursor} position={[150, 100]} scale={0} />
    </>,
  );

  yield* scene().scale(0).scale(1, 0.6, easeOutBack);

  yield* waitUntil('show objects');
  yield* sequence(
    0.1,
    rect().scale(1, 0.7, easeOutBack),
    rectPos().show(),
    circle().scale(1, 0.7, easeOutBack),
    circleAbsolutePos().show(),
  );

  yield* waitUntil('show relative pos');
  yield* sequence(
    0.1,
    circleRelativePos().show(),
    posHighlight().scale(1, 0.6),
  );

  yield* waitUntil('show cursor');
  yield* cursor().show();

  yield* waitUntil('cursor to rect');
  yield* cursor().moveToPosition(rect(), 0.7);

  yield* waitUntil('move rect');
  yield* cursor().clickAndDrag(
    rect(),
    [
      [-200, 200],
      [-250, -50],
      [50, 50],
    ],
    1,
  );
  yield* cursor().hide();

  yield* waitUntil('show formula');
  yield* sequence(
    0.45,
    scene().position.x(-350, 0.8),
    formula().scale(1, 0.6, easeOutBack),
  );

  yield* waitUntil('highlight P');
  cursor().position([-100, 120]);
  yield* all(
    formulaHighlight().scale(1, 0.7, easeOutBack),
    posHighlight().nodes(rectPos(), 0.7),
    cursor().show(),
  );

  yield* waitUntil('move rect 2');
  yield* cursor().moveToPosition(rect(), 0.6);
  yield* cursor().clickAndDrag(
    rect(),
    [
      [-300, -100],
      [-500, 0],
    ],
    0.8,
  );
  yield* cursor().hide();

  yield* waitUntil('hide highlights');
  yield* all(formulaHighlight().scale(0, 0.7), posHighlight().scale(0, 0.7));

  yield* waitUntil('show local vector');
  yield* sequence(
    0.15,
    circleRelativePos().position(
      () => localVector().getPointAtPercentage(0.65).position.add([-120, 0]),
      0.8,
    ),
    localVector().end(1, 0.8),
  );

  yield* waitUntil('move rect 3');
  yield* cursor().show();
  yield* cursor().clickAndDrag(
    rect(),
    [
      [-300, -100],
      [-250, 200],
      [-450, 250],
      [-400, -100],
      [-350, 0],
    ],
    0.8,
  );
  yield* cursor().hide();

  yield* waitUntil('hide absolute pos');
  yield* sequence(0.1, rectPos().hide(), circleAbsolutePos().hide());

  yield* waitUntil('cursor to circle');
  yield* cursor().show();
  yield* cursor().moveToPosition(circle(), 0.7);

  yield* waitUntil('move circle');
  yield* cursor().clickAndDrag(
    circle(),
    [
      [-500, -200],
      [-250, 100],
      [-50, -200],
    ],
    0.85,
  );
  yield* cursor().hide();

  yield* waitUntil('reset');
  yield* sequence(
    0.2,
    all(circleRelativePos().hide(), localVector().end(0, 0.7)),
    formula().scale(0, 0.6, easeInBack),
    scene().position.x(0, 0.8),
  );

  yield* waitUntil('hide scene');
  yield* scene().scale(0, 0.7, easeInBack);

  yield* waitUntil('scene end');
});
