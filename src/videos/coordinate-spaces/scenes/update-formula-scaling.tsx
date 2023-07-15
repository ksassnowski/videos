import { makeScene2D } from '@motion-canvas/2d';
import {
  Circle,
  Latex,
  Layout,
  Line,
  Rect,
  Txt,
} from '@motion-canvas/2d/lib/components';
import {
  all,
  sequence,
  waitFor,
  waitUntil,
} from '@motion-canvas/core/lib/flow';
import { createComputed } from '@motion-canvas/core/lib/signals';
import { slideTransition } from '@motion-canvas/core/lib/transitions';
import { easeInBack, easeOutBack } from '@motion-canvas/core/lib/tweening';
import { Direction } from '@motion-canvas/core/lib/types';
import { createRef, finishScene } from '@motion-canvas/core/lib/utils';

import { texColor, translate } from '@common/utils';

import theme from '@theme';

import {
  CircleObject,
  Coordinates,
  Cursor,
  RectObject,
  SceneContainer,
  SceneContainerProps,
  Vector,
  scalingTranslationFormulaCombinedTex,
  scalingTranslationFormulaTex,
} from '../components';

const vectorTex = `
\\begin{bmatrix}
P_x + R_xS_x \\\\
P_y + R_yS_y \\\\
\\end{bmatrix}
`;

export default makeScene2D(function* (view) {
  const texSeparate = createRef<Latex>();
  const texCombined = createRef<Latex>();
  const highlightRect = createRef<Rect>();
  const compositeScene = createRef<SceneContainer>();
  const demonstrationScene = createRef<SceneContainer>();
  const cursor = createRef<Cursor>();
  const circle1 = createRef<Circle>();
  const circle2 = createRef<Circle>();
  const rect = createRef<Rect>();
  const vectorFormula = createRef<Latex>();
  const positionFormula = createRef<Latex>();
  const scaledVector = createRef<Line>();
  const circlePositionDot = createRef<Circle>();
  const rectCoordinates = createRef<Coordinates>();
  const rGroup = createRef<Layout>();
  const pGroup = createRef<Layout>();
  const sGroup = createRef<Layout>();

  const animatedTex = createComputed(() => {
    const p = rect().position();
    const s = rect().scale();
    const r = circle2().position();
    const circlePos = circle2()
      .absolutePosition()
      .transformAsPoint(demonstrationScene().worldToLocal());

    return texColor(
      `
\\begin{bmatrix*}[r]
${texColor(p.x.toFixed(0), theme.colors.Blue1)} + ${r.x} \\cdot ${texColor(
        s.x.toFixed(2),
        theme.colors.Green2,
      )} \\\\
${texColor(p.y.toFixed(0), theme.colors.Blue1)} ${r.y} \\cdot ${texColor(
        s.y.toFixed(2),
        theme.colors.Green2,
      )} 
\\end{bmatrix*} =
\\begin{bmatrix*}[r]
${texColor(circlePos.x.toFixed(0), theme.colors.Red)} \\\\
${texColor(circlePos.y.toFixed(0), theme.colors.Green1)} \\\\
\\end{bmatrix*}
    `,
      theme.colors.White,
    );
  });

  const sceneStyle: SceneContainerProps = {
    lineWidth: 0,
    width: 900,
    height: 600,
    y: 150,
    showAxis: true,
    gridSpacing: 50,
    scale: 0,
  };

  yield view.add(
    <>
      <Rect
        ref={highlightRect}
        fill={`${theme.colors.Green1}44`}
        position={[-298, -4]}
        size={[80, 100]}
        lineWidth={4}
        stroke={theme.colors.Green1}
        radius={14}
        scale={0}
        smoothCorners
      />

      <Latex
        ref={texSeparate}
        tex={texColor(scalingTranslationFormulaTex, theme.colors.White)}
        height={250}
      />

      <Latex
        ref={texCombined}
        tex={texColor(scalingTranslationFormulaCombinedTex, theme.colors.White)}
        position={[-164, 100]}
        height={250}
        opacity={0}
      />

      <SceneContainer ref={compositeScene} {...sceneStyle}>
        <CircleObject ref={circle1} position={[-100, -100]} />
      </SceneContainer>

      <SceneContainer ref={demonstrationScene} {...sceneStyle}>
        <RectObject ref={rect}>
          <CircleObject ref={circle2} position={[300, -200]}>
            <Circle
              ref={circlePositionDot}
              size={12}
              fill={theme.colors.White}
              scale={0}
            />
          </CircleObject>
        </RectObject>

        <Vector
          ref={scaledVector}
          from={() => rect().position()}
          to={() =>
            circle2()
              .absolutePosition()
              .transformAsPoint(demonstrationScene().worldToLocal())
          }
        />

        <Layout
          ref={rGroup}
          scale={0}
          alignItems={'center'}
          fontSize={28}
          fontFamily={theme.fonts.mono}
          fontWeight={400}
          gap={12}
          offset={-1}
          position={() =>
            scaledVector()
              .getPointAtPercentage(0.5)
              .position.transformAsPoint(scaledVector().localToWorld())
              .transformAsPoint(demonstrationScene().worldToLocal())
              .add([20, 0])
          }
          layout
        >
          <Txt text={'R'} fill={theme.colors.Gray1} />
          <Coordinates
            coordinates={[300, -200]}
            xColor={theme.colors.White}
            yColor={theme.colors.White}
          />
        </Layout>

        <Layout
          direction={'column'}
          gap={12}
          position={() => rect().position().add([30, 90])}
          fontSize={28}
          fontFamily={theme.fonts.mono}
          fontWeight={400}
          layout
        >
          <Layout ref={pGroup} gap={12} scale={0}>
            <Txt text={'P'} fill={theme.colors.Gray1} />
            <Coordinates
              ref={rectCoordinates}
              xColor={theme.colors.Blue1}
              yColor={theme.colors.Blue1}
              coordinates={() => rect().position()}
            />
          </Layout>

          <Layout ref={sGroup} gap={12} scale={0}>
            <Txt text={'S'} fill={theme.colors.Gray1} />
            <Coordinates
              xColor={theme.colors.Green2}
              yColor={theme.colors.Green2}
              coordinates={() => rect().scale()}
              decimals={2}
            />
          </Layout>
        </Layout>

        <Latex
          ref={vectorFormula}
          tex={texColor(vectorTex, theme.colors.White)}
          offset={[1, 0]}
          height={86}
          position={() =>
            circle2()
              .absolutePosition()
              .transformAsPoint(demonstrationScene().worldToLocal())
              .add([-35, -30])
          }
          opacity={0}
        />

        <Latex
          ref={positionFormula}
          tex={animatedTex}
          offset={[1, 0]}
          height={75}
          position={() =>
            circle2()
              .absolutePosition()
              .transformAsPoint(demonstrationScene().worldToLocal())
              .add([-35, -30])
          }
          opacity={0}
        />
      </SceneContainer>

      <Cursor ref={cursor} position={[150, 100]} scale={0} />
    </>,
  );

  yield* slideTransition(Direction.Right, 1);

  yield* waitUntil('highlight S');
  yield* highlightRect().scale(1, 0.7, easeOutBack);

  yield* waitUntil('highlight scaling matrix');
  yield* all(
    highlightRect().size([380, 300], 1),
    highlightRect().position.x(397, 1),
  );

  yield* waitUntil('move matrix');
  yield* all(
    texSeparate().position.y(-350, 0.7),
    highlightRect().position.y(-350, 0.7),
  );

  yield* waitUntil('highlight multiplication');
  yield* all(highlightRect().width(760, 1), highlightRect().position.x(213, 1));

  yield* waitUntil('show example scene');
  yield* compositeScene().scale(1, 0.7, easeOutBack);

  yield* waitUntil('show scale');
  yield* sequence(
    0.1,
    all(highlightRect().width(390, 0.7), highlightRect().position.x(398, 0.7)),
    circle1().position(circle1().position().scale(1.5), 0.8),
  );

  yield* waitUntil('show translation');
  yield* sequence(
    0.1,
    all(highlightRect().width(360, 0.7), highlightRect().position.x(12, 0.7)),
    translate(circle1(), [100, -100], 0.7),
  );

  yield* waitUntil('hide scene');
  yield* sequence(
    0.3,
    compositeScene().scale(0, 0.6, easeInBack),
    highlightRect().scale(0, 0.6, easeInBack),
    texSeparate().position.y(0, 0.7),
  );

  yield* waitUntil('show combined');
  yield* all(
    texSeparate().position.y(-200, 0.7),
    texCombined().opacity(1, 0.8),
    texCombined().position.y(200, 0.8),
  );

  yield* waitUntil('hide matrix');
  yield* all(
    texCombined().position(0, 0.8),
    texSeparate().opacity(0, 0.7),
    texSeparate().position.y(-300, 0.7),
  );

  yield* waitUntil('show scene 2');
  yield* sequence(
    0.4,
    texCombined().position.y(-350, 0.7),
    demonstrationScene().scale(1, 0.7, easeOutBack),
  );

  yield* waitUntil('show vector formula');
  yield* all(
    circle2().ripple(1),
    circlePositionDot().scale(1, 0.6, easeOutBack),
    vectorFormula().scale(0).opacity(1).scale(1, 0.6, easeOutBack),
  );

  yield* waitUntil('show coordinates');
  yield* sequence(
    0.1,
    ...[pGroup(), sGroup(), rGroup()].map((node) =>
      node.scale(1, 0.6, easeOutBack),
    ),
  );

  yield* waitUntil('show pos calculation');
  yield* sequence(
    0.45,
    vectorFormula().scale(0, 0.6, easeInBack),
    positionFormula().opacity(1).scale(0).scale(1, 0.6, easeOutBack),
  );

  yield* waitUntil('more examples');
  yield* rect().position([-170, 150], 1);
  yield* waitFor(0.3);
  yield* rect().scale(1.3, 1);
  yield* waitFor(0.3);
  yield* all(rect().position(0, 1), rect().scale(1, 1));

  yield* waitUntil('center scene');
  yield* sequence(
    0.1,
    texCombined().position.y(-700, 0.8),
    demonstrationScene().position.y(0, 0.8),
  );

  yield* waitUntil('hide scene 2');
  yield* sequence(
    0.1,
    positionFormula().scale(0, 0.6, easeInBack),
    circlePositionDot().scale(0, 0.6, easeInBack),
    pGroup().scale(0, 0.6, easeInBack),
    sGroup().scale(0, 0.6, easeInBack),
    rGroup().scale(0, 0.6, easeInBack),
    scaledVector().end(0, 0.6),
    demonstrationScene().size([1000, 800], 1.3),
  );

  yield* waitUntil('scene end');
});
