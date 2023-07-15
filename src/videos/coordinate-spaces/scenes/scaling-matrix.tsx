import { makeScene2D } from '@motion-canvas/2d';
import { Latex, LatexProps, Rect } from '@motion-canvas/2d/lib/components';
import { all, sequence, waitUntil } from '@motion-canvas/core/lib/flow';
import { SignalValue, isReactive } from '@motion-canvas/core/lib/signals';
import { slideTransition } from '@motion-canvas/core/lib/transitions';
import { easeInBack, easeOutBack } from '@motion-canvas/core/lib/tweening';
import {
  Color,
  Direction,
  PossibleColor,
  PossibleVector2,
  Vector2,
} from '@motion-canvas/core/lib/types';
import { createRef } from '@motion-canvas/core/lib/utils';

import { texColor } from '@common/utils';

import theme from '@theme';

import { RectObject, ScalingMatrix } from '../components';
import { swapNodes } from '../utils';

const createScalingMatrixTex = (
  scale: Vector2,
  highlightX: Color,
  highlightY: Color,
) => `
\\begin{bmatrix}
${texColor(scale.x.toFixed(2).toString(), highlightX.css())} & 0 & 0 \\\\
0 & ${texColor(scale.y.toFixed(2).toString(), highlightY.css())} & 0 \\\\
0 & 0 & 1
\\end{bmatrix}
`;

interface ScalingMatrixProps extends LatexProps {
  matrixScale?: SignalValue<PossibleVector2>;
  highlightX?: SignalValue<PossibleColor>;
  highlightY?: SignalValue<PossibleColor>;
}

const AnimatedScalingMatrix = ({
  matrixScale = new Vector2(1),
  highlightX = new Color(theme.colors.White),
  highlightY = new Color(theme.colors.White),
  ...rest
}: ScalingMatrixProps) => (
  <Latex
    tex={() =>
      texColor(
        createScalingMatrixTex(
          new Vector2(isReactive(matrixScale) ? matrixScale() : matrixScale),
          new Color(isReactive(highlightX) ? highlightX() : highlightX),
          new Color(isReactive(highlightY) ? highlightY() : highlightY),
        ),
        theme.colors.White,
      )
    }
    {...rest}
  />
);

export default makeScene2D(function* (view) {
  const animatedMatrix = createRef<Latex>();
  const scalingMatrix = createRef<Latex>();
  const rect = createRef<Rect>();
  const highlightRect = createRef<Rect>();

  const scale = Vector2.createSignal(1);
  const highlightX = Color.createSignal(theme.colors.White);
  const highlightY = Color.createSignal(theme.colors.White);

  yield view.add(
    <>
      <AnimatedScalingMatrix
        ref={animatedMatrix}
        height={300}
        matrixScale={scale}
        x={-300}
        highlightX={highlightX}
        highlightY={highlightY}
      />

      <Rect
        ref={highlightRect}
        position={[-140, -110]}
        size={100}
        fill={`${theme.colors.Green1}44`}
        lineWidth={4}
        stroke={theme.colors.Green1}
        radius={14}
        scale={0}
        smoothCorners
      />

      <ScalingMatrix ref={scalingMatrix} height={300} scale={0} />

      <RectObject ref={rect} x={300} size={150} scale={scale} />
    </>,
  );

  yield* slideTransition(Direction.Right, 1);

  yield* waitUntil('highlight matrix');
  yield* all(
    highlightX(theme.colors.Red, 0.5),
    highlightY(theme.colors.Green1, 0.5),
  );

  yield* waitUntil('scale x');
  yield* scale([1.75, 1], 0.8);

  yield* waitUntil('scale y');
  yield* scale([1.75, 2], 0.8);

  yield* waitUntil('reset scale');
  yield* all(
    scale(1, 1),
    highlightX(theme.colors.White, 0.7),
    highlightY(theme.colors.White, 0.7),
  );
  yield* sequence(
    0.3,
    rect().scale(0, 0.6, easeInBack),
    animatedMatrix().position.x(0, 0.7),
  );

  yield* waitUntil('use rect scale');
  yield* swapNodes(animatedMatrix(), scalingMatrix());

  yield* waitUntil('highlight Sx');
  yield* highlightRect().scale(1, 0.7, easeOutBack);

  yield* waitUntil('highlight Sy');
  yield* highlightRect().position([25, 0], 0.7);

  yield* waitUntil('hide highlight');
  yield* highlightRect().scale(0, 0.6, easeInBack);

  yield* waitUntil('scene end');
});
