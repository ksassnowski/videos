import { makeScene2D } from '@motion-canvas/2d';
import { Circle, Latex, Line, Rect } from '@motion-canvas/2d/lib/components';
import {
  all,
  sequence,
  waitFor,
  waitUntil,
} from '@motion-canvas/core/lib/flow';
import { createComputed } from '@motion-canvas/core/lib/signals';
import {
  clamp,
  easeInBack,
  easeInOutBack,
  easeOutBack,
} from '@motion-canvas/core/lib/tweening';
import { createRef } from '@motion-canvas/core/lib/utils';

import { texColor } from '@common/utils';

import theme from '@theme';

import {
  ArcVector,
  CircleObject,
  Coordinates,
  RectObject,
  RotationMatrix,
  SceneContainer,
  Vector,
  rotationMatrixCombinedTex,
  rotationMatrixSeparateTex,
} from '../components';
import { swapMatrices } from '../utils';

export default makeScene2D(function* (view) {
  const scene = createRef<SceneContainer>();
  const rect = createRef<Rect>();
  const circle = createRef<Circle>();
  const circleCoords = createRef<Coordinates>();
  const arc = createRef<ArcVector>();
  const absoluteVector1 = createRef<Line>();
  const absoluteVector2 = createRef<Line>();
  const rotationMatrix = createRef<Latex>();
  const rotationMatrixSeparate = createRef<Latex>();
  const originDot = createRef<Circle>();
  const theta = createRef<Latex>();
  const pTex = createRef<Latex>();
  const highlightRect = createRef<Rect>();
  const translationVector = createRef<Line>();
  const translationBackVector = createRef<Line>();
  const circleGhost1 = createRef<Circle>();
  const circleGhost2 = createRef<Circle>();
  const circleGhost3 = createRef<Circle>();

  const rectToCircle = createComputed(() =>
    rect().position().add([300, -200]).sub(rect().position()),
  );
  const rectToCircleAngle = createComputed(
    () => (rectToCircle().radians * 180) / Math.PI,
  );
  const circleScenePosition = createComputed(() =>
    circle().absolutePosition().transformAsPoint(scene().worldToLocal()),
  );

  yield view.add(
    <>
      <Rect
        ref={highlightRect}
        fill={`${theme.colors.Green1}44`}
        lineWidth={4}
        stroke={theme.colors.Green1}
        radius={14}
        size={[450, 320]}
        position={[527, -300]}
        scale={0}
        smoothCorners
      />

      <RotationMatrix ref={rotationMatrix} height={280} />

      <Latex
        ref={rotationMatrixSeparate}
        tex={texColor(rotationMatrixSeparateTex, theme.colors.White)}
        height={280}
        y={-300}
        scale={0}
      />

      <SceneContainer ref={scene} showAxis>
        <Circle
          ref={circleGhost1}
          size={56}
          lineWidth={4}
          stroke={theme.colors.Red}
          lineDash={[10, 12]}
          position={[100, -250]}
          scale={0}
        />

        <Circle
          ref={circleGhost2}
          size={56}
          lineWidth={4}
          stroke={theme.colors.Red}
          lineDash={[10, 12]}
          position={[300, -200]}
          scale={0}
        />

        <Circle
          ref={circleGhost3}
          size={56}
          lineWidth={4}
          stroke={theme.colors.Red}
          lineDash={[10, 12]}
          position={[323, 160]}
          scale={0}
        />

        <Vector
          ref={translationVector}
          from={[100, -250]}
          to={[300, -200]}
          startOffset={40}
          endOffset={40}
          end={0}
        />

        <Vector
          ref={translationBackVector}
          from={[323, 160]}
          to={[123, 110]}
          startOffset={40}
          endOffset={40}
          end={0}
        />

        <CircleObject
          ref={originDot}
          size={60}
          fill={theme.colors.White}
          position={() => rect().position()}
        />

        <RectObject ref={rect} />
        <CircleObject ref={circle} position={[300, -200]} />

        <Coordinates
          ref={circleCoords}
          coordinates={circleScenePosition}
          position={() => circleScenePosition().add([0, 60])}
          scale={0}
        />

        <ArcVector
          ref={arc}
          opacity={0}
          position={() => rect().position()}
          size={() => rectToCircle().magnitude * 2}
          startAngle={rectToCircleAngle}
          endAngle={() =>
            clamp(
              rectToCircleAngle(),
              360,
              rectToCircleAngle() + rect().rotation() - 1,
            )
          }
          lineWidth={4}
          lineDash={[12, 12]}
          stroke={theme.colors.Brown2}
        />

        <Vector
          ref={absoluteVector1}
          from={() => rect().position()}
          to={() => rect().position().add([300, -200])}
          stroke={theme.colors.Green1}
          lineDash={[12, 12]}
          end={0}
        />

        <Latex
          ref={theta}
          tex={texColor('\\theta', theme.colors.White)}
          height={30}
          position={() => rect().position().add([90, 0])}
          scale={0}
        />

        <Latex
          ref={pTex}
          tex={texColor('P', theme.colors.White)}
          height={20}
          position={() => rect().position().add(18)}
          scale={0}
        />

        <Vector
          ref={absoluteVector2}
          from={() => rect().position()}
          to={() =>
            circle().absolutePosition().transformAsPoint(scene().worldToLocal())
          }
          stroke={theme.colors.Green1}
          end={0}
        />
      </SceneContainer>
    </>,
  );

  yield* waitUntil('rotate rect');
  yield* rect().rotation(360, 1.2, easeInOutBack);
  rect().rotation(0);

  yield* waitUntil('show circle pos');
  yield* circleCoords().show();

  yield* waitUntil('rotate rect 2');
  yield* rect().rotation(60, 0.8);

  yield* waitUntil('reset rect');
  yield* rect().rotation(0, 1);

  yield* waitUntil('show vectors');
  yield* all(
    absoluteVector2().end(1, 0.7),
    circleCoords().position(() => circleScenePosition().add([20, 60]), 0.7),
  );
  arc().opacity(1);

  yield* waitUntil('rotate rect 3');
  absoluteVector1().end(1);
  circle().reparent(rect());
  yield* rect().rotation(60, 2);

  yield* waitUntil('show formula');
  yield* sequence(
    0.4,
    all(
      scene().height(600, 0.7),
      scene().width(900, 0.7),
      scene().position.y(200, 0.7),
      scene().lineWidth(0, 0.5),
    ),
    rotationMatrix().position.y(-300, 0.7, easeOutBack),
  );

  yield* waitUntil('show theta');
  yield* theta().scale(1, 0.7, easeOutBack);

  yield* waitUntil('highlight origin');
  yield* originDot().ripple(1);

  yield* waitUntil('move rect');
  yield* rect().position([-200, -50], 1);

  yield* waitUntil('highlight rect origin');
  yield* originDot().ripple(1);

  yield* waitUntil('reset scene');
  yield* sequence(
    0.1,
    theta().scale(0, 0.7, easeInBack),
    absoluteVector1().end(0, 0.7),
    absoluteVector2().end(0, 0.7),
    circleCoords().position(() => circleScenePosition().add([0, 60]), 0.5),
    rect().rotation(0, 0.7),
  );

  yield* waitUntil('show separate matrices');
  yield* swapMatrices(rotationMatrix, rotationMatrixSeparate);

  yield* waitUntil('highlight P');
  originDot().size(12).scale(0).zIndex(1);
  yield* all(
    rect().ripple(1),
    originDot().scale(1, 0.7, easeOutBack),
    pTex().scale(1, 0.7, easeOutBack),
  );

  yield* waitUntil('highlight translation');
  yield* highlightRect().scale(1, 0.7, easeOutBack);

  yield* waitUntil('show translation');
  circleGhost1().scale(1);
  yield* sequence(0.25, rect().position(0, 1), translationVector().end(1, 0.5));

  yield* waitUntil('highlight origin 2');
  yield* originDot().ripple(1);

  yield* waitUntil('highlight rotation matrix');
  yield* all(
    highlightRect().width(630, 0.8),
    highlightRect().position.x(-30, 0.8),
  );

  yield* waitUntil('show rotation');
  circleGhost2().scale(1);
  arc()
    .moveBelow(rect())
    .position(0)
    .startAngle(rectToCircleAngle() + 7)
    .endAngle(rectToCircleAngle() + 7);
  yield* sequence(
    0.35,
    rect().rotation(60, 1.5),
    arc().endAngle(rectToCircleAngle() + 52.5, 0.8),
  );

  yield* waitUntil('highlight translation 2');
  yield all(
    highlightRect().width(400, 0.8),
    highlightRect().position.x(-557, 0.8),
  );

  yield* waitUntil('show translation 2');
  circleGhost3().scale(1);
  yield* sequence(
    0.25,
    rect().position([-200, -50], 1),
    translationBackVector().end(1, 0.5),
  );

  yield* waitUntil('hide highlight');
  yield* highlightRect().scale(0, 0.7, easeInBack);

  yield* waitUntil('show full rotation');
  yield* rect().rotation(0, 1);
  yield* waitFor(0.6);
  yield* rect().rotation(60, 1.2);

  yield* waitUntil('show combined matrix');
  rotationMatrix().tex(texColor(rotationMatrixCombinedTex, theme.colors.White));
  yield* sequence(
    0.5,
    rotationMatrixSeparate().scale(0, 0.6, easeInBack),
    rotationMatrix().scale(1, 0.6, easeOutBack),
  );

  yield* waitUntil('center formula');
  yield* all(scene().position.y(900, 1), rotationMatrix().position.y(0, 1));

  yield* waitUntil('scene end');
});
