import { makeScene2D } from '@motion-canvas/2d';
import {
  Circle,
  Grid,
  Latex,
  Line,
  Node,
  Rect,
} from '@motion-canvas/2d/lib/components';
import { all, delay, waitFor } from '@motion-canvas/core/lib/flow';
import { Matrix2D, Vector2 } from '@motion-canvas/core/lib/types';
import { createRef } from '@motion-canvas/core/lib/utils';

import theme from '@theme';

import { ArcVector } from '../components';

function getRotatedPosition(
  pos: Vector2,
  center: Vector2,
  angle: number,
): Vector2 {
  const radians = (-angle * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const matrix = new Matrix2D(
    cos,
    sin,
    -sin,
    cos,
    -center.x * cos + center.y * sin + center.x,
    -center.x * sin - center.y * cos + center.y,
  );

  return pos.transformAsPoint(matrix.domMatrix);
}

export default makeScene2D(function* (view) {
  const circle = createRef<Circle>();
  const innerCircle = createRef<Circle>();
  const highlight = createRef<Rect>();
  const formula = createRef<Node>();
  const translateInLine = createRef<Line>();
  const translateOutLine = createRef<Line>();
  const rotationLine = createRef<ArcVector>();
  const ghostCircle1 = createRef<Circle>();
  const ghostCircle2 = createRef<Circle>();
  const ghostCircle3 = createRef<Circle>();
  const tex1 = createRef<Latex>();
  const tex2 = createRef<Latex>();

  yield view.add(
    <>
      <Node y={-400} ref={formula}>
        <Rect
          ref={highlight}
          offset={[1, 0]}
          width={260}
          height={190}
          fill={`${theme.colors.Green1}66`}
          radius={14}
          lineWidth={4}
          stroke={theme.colors.Green1}
          x={409}
          smoothCorners
        />
        <Latex
          ref={tex1}
          tex={`\\color{${theme.colors.White}}{
\\begin{bmatrix}1 & 0 & P_x \\\\ 0 & 1 & P_y \\\\ 0 & 0 & 1 \\end{bmatrix}
\\begin{bmatrix}cos\\theta & -sin\\theta & 0 \\\\ sin\\theta & cos\\theta & 0 \\\\ 0 & 0 & 1 \\end{bmatrix}
\\begin{bmatrix}1 & 0 & -P_x \\\\ 0 & 1 & -P_y \\\\ 0 & 0 & 1 \\end{bmatrix}
}`}
          height={150}
        />

        <Latex
          ref={tex2}
          tex={`\\color{${theme.colors.White}}{
\\begin{bmatrix}
cos\\theta & -sin\\theta & -P_x cos\\theta + P_y sin\\theta + P_x\\\\
sin\\theta & cos\\theta & -P_x sin\\theta - P_y cos\\theta + P_y\\\\
0 & 0 & 1\\end{bmatrix}
}`}
          height={150}
          opacity={0}
        />
      </Node>

      <Node y={90}>
        <Grid
          spacing={50}
          width={900}
          height={700}
          lineWidth={1}
          stroke={`${theme.colors.Gray3}77`}
        />

        <Line
          points={[
            [0, -350],
            [0, 350],
          ]}
          lineWidth={3}
          stroke={`${theme.colors.Gray3}77`}
        />

        <Line
          points={[
            [-450, 0],
            [450, 0],
          ]}
          lineWidth={3}
          stroke={`${theme.colors.Gray3}77`}
        />

        <Line
          ref={translateInLine}
          lineWidth={4}
          stroke={theme.colors.Brown2}
          points={[
            [100, -250],
            [-150, -100],
          ]}
          lineDash={[12, 12]}
          arrowSize={14}
          start={0.12}
          end={0.12}
          endArrow
        />
        <Line
          ref={translateOutLine}
          lineWidth={4}
          stroke={theme.colors.Brown2}
          points={[
            [0, 0],
            [0, 0],
          ]}
          lineDash={[12, 12]}
          arrowSize={14}
          start={0.12}
          end={0.12}
          endArrow
        />

        <ArcVector
          ref={rotationLine}
          stroke={theme.colors.Brown2}
          lineWidth={4}
          arrowSize={14}
          size={new Vector2(-150, -100).magnitude * 2}
          lineDash={[12, 12]}
          startAngle={157}
          endAngle={157}
          counter
        />

        <Circle
          ref={ghostCircle1}
          size={36}
          lineWidth={3}
          stroke={theme.colors.Blue1}
          lineDash={[8, 8]}
          position={[100, -250]}
        />

        <Circle
          ref={ghostCircle2}
          size={36}
          lineWidth={3}
          stroke={theme.colors.Blue1}
          lineDash={[8, 8]}
          position={[-150, -100]}
          scale={0}
        />

        <Circle
          ref={ghostCircle3}
          size={36}
          lineWidth={3}
          stroke={theme.colors.Blue1}
          lineDash={[8, 8]}
          scale={0}
        />

        <Circle
          ref={circle}
          position={[250, -150]}
          size={40}
          fill={theme.colors.Red}
        >
          <Circle
            ref={innerCircle}
            position={[-150, -100]}
            size={40}
            fill={theme.colors.Blue1}
          />
        </Circle>
      </Node>
    </>,
  );

  console.log(
    getRotatedPosition(new Vector2(100, -250), new Vector2(250, -150), 75),
  );
  circle().save();
  yield* all(
    circle().position(0, 1.5),
    delay(0.29, translateInLine().end(0.89, 0.88)),
  );
  yield* all(highlight().position.x(155, 0.8), highlight().width(340, 0.8));

  ghostCircle2().scale(1);
  yield* all(
    circle().rotation(-75, 1.5),
    delay(0.4, rotationLine().endAngle(208, 0.67)),
  );

  translateOutLine().points([
    innerCircle().absolutePosition().transformAsPoint(circle().worldToParent()),
    innerCircle()
      .absolutePosition()
      .transformAsPoint(circle().worldToParent())
      .add(new Vector2([250, -150])),
  ]);
  ghostCircle3().absolutePosition(innerCircle().absolutePosition());
  ghostCircle3().scale(1);
  yield* all(highlight().position.x(-185, 0.8), highlight().width(220, 0.8));
  yield* all(
    circle().position([250, -150], 1.5),
    delay(0.29, translateOutLine().end(0.89, 0.88)),
  );

  yield* all(tex1().opacity(0, 1), highlight().opacity(0, 1));
  yield* tex2().opacity(1, 1);
  yield* waitFor(5);
});
