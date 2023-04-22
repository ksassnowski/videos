import { makeScene2D } from '@motion-canvas/2d';
import {
  Circle,
  Latex,
  Line,
  LineProps,
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
import {
  easeInBack,
  easeInOutBack,
  easeOutBack,
} from '@motion-canvas/core/lib/tweening';
import { Vector2 } from '@motion-canvas/core/lib/types';
import { createRef } from '@motion-canvas/core/lib/utils';

import theme from '@theme';

import { Coordinates, Cursor, SceneContainer } from '../components';

const simpleFormulaTex = `
circlePos(R, T) = \\begin{bmatrix}R_x + T_x \\\\ R_y + T_y\\end{bmatrix}
`;

const simpleFormulaTHighlighted = `
\\color{${theme.colors.White}}{circlePos(R, T) = \\begin{bmatrix}R_x + \\color{${theme.colors.Red}}{T_x} \\\\ R_y + \\color{${theme.colors.Green1}}{T_y}\\end{bmatrix}}
`;

const relativePos = `
\\color{${theme.colors.White}}relativePosition = \\begin{bmatrix}\\color{${theme.colors.Red}}{T_x} \\\\ \\color{${theme.colors.Green1}}{T_y}\\end{bmatrix}
`;

const translationMatrixTex = `
relativePos(R, T) = \\begin{bmatrix}1 & 0 & T_x \\\\ 0 & 1 & T_y \\\\ 0 & 0 & 1\\end{bmatrix}R
`;

const rotationMatrixTex = `
\\begin{bmatrix}
\\cos \\theta & -\\sin \\theta & 0 \\\\ 
\\sin \\theta & \\cos \\theta & 0 \\\\ 
0 & 0 & 1
\\end{bmatrix}
`;

const rotationAroundPointTex = `
\\begin{bmatrix}
1 & 0 & P_x \\\\ 
0 & 1 & P_y \\\\ 
0 & 0 & 1
\\end{bmatrix}
\\begin{bmatrix}
\\cos \\theta & -\\sin \\theta & 0 \\\\ 
\\sin \\theta & \\cos \\theta & 0 \\\\ 
0 & 0 & 1
\\end{bmatrix}
\\begin{bmatrix}
1 & 0 & -P_x \\\\ 
0 & 1 & -P_y \\\\ 
0 & 0 & 1
\\end{bmatrix}
`;

export default makeScene2D(function* (view) {
  const sceneContainer = createRef<Rect>();
  const rect = createRef<Rect>();
  const circle = createRef<Circle>();
  const circleGhost = createRef<Circle>();
  const lineX = createRef<Line>();
  const lineY = createRef<Line>();
  const lineDiagonal = createRef<Line>();
  const cursor = createRef<Cursor>();
  const tex = createRef<Latex>();
  const relativePosTex = createRef<Latex>();
  const rectPosContainer = createRef<Node>();
  const circlePosContainer = createRef<Node>();
  const formulaHighlight = createRef<Rect>();
  const tVectorText = createRef<Latex>();
  const txVectorText = createRef<Latex>();
  const tyVectorText = createRef<Latex>();
  const circleTx = createRef<Txt>();
  const circleTy = createRef<Txt>();
  const circleRelativeCoords = createRef<Coordinates>();
  const circleCoords = createRef<Coordinates>();
  const rectCoords = createRef<Coordinates>();

  const lineStyle: LineProps = {
    arrowSize: 13,
    lineWidth: 4,
  };

  yield view.add(
    <>
      <SceneContainer ref={sceneContainer} scale={0}>
        <Rect
          ref={rect}
          size={80}
          scale={0}
          radius={18}
          smoothCorners
          fill={theme.colors.Blue1}
          zIndex={2}
        />

        <Coordinates
          ref={rectCoords}
          xColor={theme.colors.Gray2}
          yColor={theme.colors.Gray2}
          coordinates={() => rect().position()}
          position={() => rect().position().add([0, 70])}
          scale={0}
        />

        <Circle
          ref={circle}
          size={60}
          fill={theme.colors.Red}
          scale={0}
          position={[300, -200]}
          zIndex={3}
        >
          <Coordinates
            ref={circleCoords}
            coordinates={() => circle().position()}
            position={[0, -55]}
            scale={0}
          />
        </Circle>

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
          stroke={theme.colors.Gray2}
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
          stroke={theme.colors.Gray2}
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
          ref={lineDiagonal}
          stroke={theme.colors.Brown2}
          points={() => [
            rect().position(),
            rect().position().add(new Vector2(300, -200)),
          ]}
          endArrow
          start={0.17}
          end={0.17}
          {...lineStyle}
        />

        <Latex
          ref={tVectorText}
          tex={`\\color{${theme.colors.White}}{T}`}
          height={25}
          position={() =>
            lineDiagonal().getPointAtPercentage(0.5).position.add([-30, -20])
          }
          scale={0}
        />

        <Latex
          ref={tyVectorText}
          tex={`\\color{${theme.colors.Green1}}{T_y}`}
          height={33}
          position={() =>
            lineY().getPointAtPercentage(0.5).position.add([35, 0])
          }
          scale={0}
        />

        <Latex
          ref={txVectorText}
          tex={`\\color{${theme.colors.Red}}{T_x}`}
          height={30}
          position={() =>
            lineX().getPointAtPercentage(0.5).position.add([0, 35])
          }
          scale={0}
        />

        <Txt
          ref={circleTx}
          text={'300'}
          fontFamily={theme.fonts.mono}
          fill={theme.colors.Red}
          fontSize={28}
          position={() =>
            lineX().getPointAtPercentage(0.5).position.add([0, 30])
          }
          scale={0}
        />

        <Txt
          ref={circleTy}
          text={'-200'}
          fontFamily={theme.fonts.mono}
          fill={theme.colors.Green1}
          fontSize={28}
          position={() =>
            lineY().getPointAtPercentage(0.5).position.add([40, 0])
          }
          scale={0}
        />

        <Coordinates
          ref={circleRelativeCoords}
          coordinates={new Vector2(300, -200)}
          position={() =>
            lineDiagonal()
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
            tex={`\\color{${theme.colors.White}}{R}`}
            width={25}
            position={[18, 20]}
            scale={0}
          />
        </Node>

        <Node
          ref={circlePosContainer}
          zIndex={3}
          position={() => circle().position()}
        >
          <Circle size={12} fill={theme.colors.White} scale={0} />

          <Latex
            tex={`\\color{${theme.colors.White}}{circlePos(R, T)}`}
            height={30}
            position={[-0, -55]}
            scale={0}
          />
        </Node>

        <Cursor ref={cursor} size={80} position={100} scale={0} zIndex={20} />
      </SceneContainer>

      <Latex
        ref={tex}
        width={680}
        tex={`\\color{${theme.colors.White}}{${simpleFormulaTex}}`}
        position={[560, 0]}
        opacity={0}
      />

      <Latex
        ref={relativePosTex}
        height={() => tex().height()}
        tex={relativePos}
        position={[-77, -100]}
        opacity={0}
      />

      <Rect
        ref={formulaHighlight}
        height={80}
        width={140}
        fill={`${theme.colors.Green1}44`}
        lineWidth={4}
        stroke={theme.colors.Green1}
        radius={14}
        position={[510, 0]}
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

  yield* waitUntil('show diagonal line');
  yield* lineDiagonal().end(0.88, 0.8);

  yield* waitUntil('show cursor');
  yield* cursor().show();
  yield* cursor().moveToNode(rect(), 0.7);

  yield* waitUntil('move rectangle');
  circle().position(() => rect().position().add(new Vector2(300, -200)));
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

  yield* waitUntil('shift scene');
  yield* sceneContainer().position.x(-400, 0.7);

  yield* waitUntil('show formula');
  yield* tex().opacity(1, 0.8);

  yield* waitUntil('show formula highlight');
  yield* formulaHighlight().scale(1, 0.5, easeOutBack);

  yield* waitUntil('highlight R formula');
  yield* all(
    formulaHighlight().width(80, 0.7),
    formulaHighlight().position.x(480, 0.7),
  );

  yield* waitUntil('highlight R scene');
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

  yield* waitUntil('highlight T formula');
  yield* formulaHighlight().position.x(
    formulaHighlight().position.x() + 60,
    0.6,
  );

  yield* waitUntil('highlight T scene');
  yield* all(
    formulaHighlight().ripple(1),
    tVectorText().scale(1, 0.5),
    lineDiagonal().ripple(1),
  );

  yield* waitUntil('highlight Tx');
  yield* txVectorText().scale(1, 0.5);

  yield* waitUntil('highlight Ty');
  yield* tyVectorText().scale(1, 0.5);

  yield* waitUntil('highlight output formula');
  yield* all(
    formulaHighlight().position.x(formulaHighlight().position.x() + 237, 0.6),
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

  yield* waitUntil('hide formula highlight');
  yield* formulaHighlight().scale(0, 0.6, easeInBack);

  yield* waitUntil('center formula');
  yield* all(sceneContainer().position.x(-1500, 1), tex().position.x(0, 1));

  yield* waitUntil('highlight txty');
  tex().tex(simpleFormulaTHighlighted);

  yield* waitUntil('show relative pos');
  yield* all(
    tex().position.y(tex().position.y() + 100, 0.6),
    relativePosTex().opacity(1, 0.6),
  );

  yield* waitUntil('reset formula scene');
  yield* all(
    sceneContainer().position.x(-400, 1),
    tex().position.x(560, 1),
    relativePosTex().position.x(483, 1),
  );

  yield* waitUntil('show circle tx');
  yield* sequence(
    0.3,
    txVectorText().scale(0, 0.4, easeInBack),
    circleTx().scale(1, 0.5, easeOutBack),
  );

  yield* waitUntil('show circle ty');
  yield* sequence(
    0.3,
    tyVectorText().scale(0, 0.4, easeInBack),
    circleTy().scale(1, 0.5, easeOutBack),
  );

  yield* waitUntil('show circle t');
  yield* sequence(
    0.3,
    tVectorText().scale(0, 0.4, easeInBack),
    circleRelativeCoords().scale(1, 0.5, easeOutBack),
  );

  yield* waitUntil('hide lines');
  yield* all(
    circleTx().scale(0, 0.5, easeInBack),
    circleTy().scale(0, 0.5, easeInBack),
    circleGhost().scale(0, 0.5, easeInBack),
    lineX().end(lineX().start(), 0.6),
    lineY().end(lineY().start(), 0.6),
  );

  yield* waitUntil('show absolute pos');
  yield* sequence(
    0.2,
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

  yield* waitUntil('show cursor 2');
  cursor().position(100);
  yield* cursor().show();

  yield* waitUntil('cursor to rect');
  yield* all(
    cursor().moveToNode(rect(), 0.7),
    rectCoords().position(() => rect().position().add([0, 80]), 0.7),
  );

  yield* waitUntil('drag rectangle');
  yield* cursor().clickAndDrag(
    rect(),
    [
      [-700, 0],
      [-400, 200],
      [-350, -100],
      [-300, 0],
      [-400, 0],
    ],
    1.2,
  );

  yield* waitUntil('hide cursor 2');
  yield* cursor().hide();

  yield* waitFor(20);
});
