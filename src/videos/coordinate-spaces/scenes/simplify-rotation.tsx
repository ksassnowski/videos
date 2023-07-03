import { SurroundingRectangle } from '@ksassnowski/motion-canvas-components';

import {
  Circle,
  Latex,
  Layout,
  Node,
  RectProps,
  Txt,
  makeScene2D,
} from '@motion-canvas/2d';
import {
  Color,
  Vector2,
  createRef,
  createSignal,
  easeInBack,
  easeOutBack,
  sequence,
  waitUntil,
} from '@motion-canvas/core';
import { all } from '@motion-canvas/core/lib/flow';
import { ThreadGenerator, cancel } from '@motion-canvas/core/lib/threading';
import { linear } from '@motion-canvas/core/lib/tweening';
import { Matrix2D } from '@motion-canvas/core/lib/types';
import { range } from '@motion-canvas/core/lib/utils';

import { rotatePosition, texColor } from '@common/utils';

import theme from '@theme';

import {
  AnimatedSprite,
  CircleObject,
  Hero,
  SceneContainer,
  localToParentTex,
  rotationMatrixCombinedTex,
  rotationMatrixTex,
  scalingMatrixTex,
  scalingTranslationMatrixTex,
  translationMatrixTex,
} from '../components';

const inverseTranslationMatrixTex = `
\\begin{bmatrix}
1 & 0 & -P_x \\\\
0 & 1 & -P_y \\\\
0 & 0 & 1
\\end{bmatrix}`;

const formulaTex = `
circlePos(P, R, S, \\theta) = 
`;

export default makeScene2D(function* (view) {
  const complicatedRotationMatrix = createRef<Latex>();
  const rotationMatrix = createRef<Latex>();
  const highlightRect = createRef<SurroundingRectangle>();
  const previousTransformationMatrix = createRef<Latex>();
  const relativePosition = createRef<Latex>();
  const scalingMatrix = createRef<Latex>();
  const translationMatrix = createRef<Latex>();
  const matrixContainer = createRef<Layout>();
  const rotationMatrixContainer = createRef<Layout>();
  const rotationTranslationMatrix = createRef<Latex>();
  const inverseTranslationMatrix = createRef<Latex>();
  const rotationMatrix2 = createRef<Latex>();
  const scene = createRef<SceneContainer>();
  const circle = createRef<Circle>();
  const combinedMatrix = createRef<Latex>();
  const formulaPart = createRef<Latex>();
  const hero = createRef<AnimatedSprite>();
  const questionMarks = createRef<Node>();

  const highlightRectStyles: RectProps = {
    stroke: theme.colors.Green1,
    fill: `${theme.colors.Green1}31`,
    lineWidth: 4,
    radius: 8,
    scale: 0,
    smoothCorners: true,
  };

  function transformCirclePosition(
    matrix: Matrix2D,
    duration = 0.8,
  ): ThreadGenerator {
    return circle().position(
      circle().position().transformAsPoint(matrix.domMatrix),
      duration,
    );
  }

  function* showScene() {
    yield* sequence(
      0.4,
      matrixContainer().position.y(-370, 0.8),
      scene().scale(1, 0.7, easeOutBack),
    );
  }

  function* hideScene() {
    yield* sequence(
      0.4,
      scene().scale(0, 0.7, easeInBack),
      matrixContainer().position.y(0, 0.8),
    );
  }

  function highlightRectAnimations(...nodes: Layout[]): ThreadGenerator[] {
    if (highlightRect().scale().exactlyEquals(Vector2.zero)) {
      return [highlightRect().nodes(nodes, 0), highlightRect().scale(1, 0.8)];
    }

    return [highlightRect().nodes(nodes, 0.8)];
  }

  function* scaleCirclePosition() {
    yield* sequence(
      0.15,
      all(...highlightRectAnimations(scalingMatrix(), relativePosition())),
      transformCirclePosition(Matrix2D.fromScaling(2)),
    );
  }

  function* translateCircle(matrix: Latex = translationMatrix()) {
    yield* sequence(
      0.15,
      all(...highlightRectAnimations(matrix)),
      transformCirclePosition(Matrix2D.fromTranslation(-100)),
    );
  }

  function* translateCircleBack() {
    yield* sequence(
      0.15,
      all(...highlightRectAnimations(inverseTranslationMatrix())),
      transformCirclePosition(Matrix2D.fromTranslation(100)),
    );
  }

  function* rotateCircle() {
    yield* sequence(
      0.15,
      all(...highlightRectAnimations(rotationMatrix2())),
      rotatePosition(circle(), 60, 0.8),
    );
  }

  const matrixHeight = createSignal(200);
  const matrixColor = Color.createSignal(theme.colors.White);

  yield view.add(
    <>
      <Latex
        ref={complicatedRotationMatrix}
        tex={texColor(rotationMatrixCombinedTex, theme.colors.White)}
        height={280}
      />

      <Latex
        ref={rotationMatrix}
        tex={texColor(rotationMatrixTex, theme.colors.White)}
        height={280}
        y={100}
        opacity={0}
      />

      <Layout ref={matrixContainer} alignItems={'center'} layout>
        <Latex
          ref={formulaPart}
          tex={texColor(formulaTex, theme.colors.White)}
          height={0}
          marginRight={7}
        />

        <Layout scale={0} ref={rotationMatrixContainer}>
          <Latex
            ref={rotationTranslationMatrix}
            tex={texColor(translationMatrixTex, theme.colors.White)}
            height={280}
          />
          <Latex
            ref={rotationMatrix2}
            tex={texColor(rotationMatrixTex, theme.colors.White)}
            height={280}
          />
          <Latex
            ref={inverseTranslationMatrix}
            tex={() =>
              texColor(inverseTranslationMatrixTex, matrixColor().css())
            }
            height={280}
          />
        </Layout>

        <Latex
          ref={previousTransformationMatrix}
          tex={texColor(scalingTranslationMatrixTex, theme.colors.White)}
          height={0}
        />

        <Latex
          ref={translationMatrix}
          tex={() => texColor(translationMatrixTex, matrixColor().css())}
          height={0}
        />

        <Latex
          ref={scalingMatrix}
          tex={texColor(scalingMatrixTex, theme.colors.White)}
          height={0}
        />

        <Latex
          ref={combinedMatrix}
          tex={texColor(localToParentTex, theme.colors.White)}
          height={0}
        />

        <Latex
          ref={relativePosition}
          tex={texColor(
            `\\begin{bmatrix}R_x \\\\ R_y \\\\ 1\\end{bmatrix}`,
            theme.colors.White,
          )}
          height={0}
        />
      </Layout>

      <SurroundingRectangle
        ref={highlightRect}
        zIndex={-1}
        nodes={[scalingMatrix(), relativePosition()]}
        bufferX={-5}
        bufferY={25}
        {...highlightRectStyles}
      />

      <SceneContainer
        ref={scene}
        height={675}
        y={150}
        lineWidth={0}
        showAxis
        scale={0}
      >
        <CircleObject ref={circle} position={() => [150, -100]} />
      </SceneContainer>

      <Node>
        <Node
          ref={questionMarks}
          position={() => hero().position().add([0, -130])}
        >
          {range(3).map((i) => (
            <Txt
              fontFamily={theme.fonts.pixel}
              fill={theme.colors.White}
              fontSize={110}
              text={'?'}
              rotation={-40 + 40 * i}
              x={-90 + 90 * i}
              y={i !== 1 ? 40 : 0}
              scale={0}
            />
          ))}
        </Node>
        <Hero ref={hero} scale={8} position={[-1100, 470]} />
      </Node>
    </>,
  );

  yield* waitUntil('show simple matrix');
  complicatedRotationMatrix().save();
  rotationMatrix().save();
  yield* sequence(
    0.1,
    complicatedRotationMatrix().position.y(-200, 0.6),
    all(
      rotationMatrix().position.y(200, 0.7),
      rotationMatrix().opacity(1, 0.7),
    ),
  );

  yield* waitUntil('hide simple matrix');
  yield* sequence(
    0.1,
    rotationMatrix().restore(0.6),
    complicatedRotationMatrix().restore(0.6),
  );

  yield* waitUntil('decompose rotation');
  yield* sequence(
    0.5,
    complicatedRotationMatrix().scale(0, 0.6, easeInBack),
    rotationMatrixContainer().scale(1, 0.6, easeOutBack),
  );

  yield* waitUntil('show formula');
  yield* all(
    ...rotationMatrixContainer()
      .children()
      .map((node) => (node as Latex).height(matrixHeight, 0.8)),
    previousTransformationMatrix().height(matrixHeight, 0.8),
    relativePosition().height(matrixHeight, 0.8),
  );

  yield* waitUntil('decompose matrix');
  yield* all(
    previousTransformationMatrix().height(0, 0.8),
    scalingMatrix().height(matrixHeight, 0.8),
    translationMatrix().height(matrixHeight, 0.8),
  );

  yield* waitUntil('show scene');
  yield* showScene();

  circle().save();
  yield* waitUntil('scale position');
  yield* scaleCirclePosition();

  yield* waitUntil('translate position');
  yield* translateCircle();

  yield* waitUntil('translate back');
  yield* translateCircleBack();

  yield* waitUntil('rotate position');
  yield* rotateCircle();

  yield* waitUntil('translate again');
  yield* translateCircle(rotationTranslationMatrix());

  yield* waitUntil('hide rect');
  yield* highlightRect().scale(0, 0.8);

  yield* waitUntil('hide scene');
  yield* hideScene();

  yield* waitUntil('highlight matrices');
  highlightRect().nodes([inverseTranslationMatrix(), translationMatrix()]);
  yield* highlightRect().scale(1, 0.6, easeOutBack);

  yield* waitUntil('fade matrices');
  yield* all(matrixColor(theme.colors.Gray4, 1), highlightRect().scale(0, 0.7));

  yield* waitUntil('hide translation');
  yield* all(
    inverseTranslationMatrix().height(0, 0.8),
    translationMatrix().height(0, 0.8),
  );

  yield* waitUntil('show scene 2');
  yield* circle().restore(0);
  yield* showScene();

  yield* waitUntil('scale position 2');
  yield* scaleCirclePosition();

  yield* waitUntil('rotate position 2');
  circle().save();
  yield* rotateCircle();

  yield* waitUntil('translate position 2');
  yield* translateCircle(rotationTranslationMatrix());

  yield* waitUntil('hide rect 2');
  yield* highlightRect().scale(0, 0.6, easeInBack);

  yield* waitUntil('show full matrix');
  matrixColor(theme.colors.White);
  yield* all(
    circle().restore(0.8),
    inverseTranslationMatrix().height(matrixHeight, 0.8),
    translationMatrix().height(matrixHeight, 0.8),
  );

  yield* waitUntil('translate position 3');
  circle().save();
  yield* translateCircle();

  yield* waitUntil('undo translate');
  yield* translateCircleBack();

  yield* waitUntil('rotate position 3');
  yield* rotateCircle();
  yield* translateCircle(rotationTranslationMatrix());

  yield* waitUntil('highlight rotation matrix');
  yield* highlightRect().nodes(
    [
      rotationTranslationMatrix(),
      rotationMatrix2(),
      inverseTranslationMatrix(),
    ],
    0.8,
  );

  yield* waitUntil('show simplified formula');
  yield* all(
    circle().restore(0.8),
    highlightRect().scale(0, 0.6),
    translationMatrix().height(0, 0.8),
    inverseTranslationMatrix().height(0, 0.8),
  );

  yield* waitUntil('rotate position 4');
  yield* rotateCircle();

  yield* waitUntil('translate position 4');
  yield* translateCircle(rotationTranslationMatrix());

  yield* waitUntil('hide rect 3');
  yield* highlightRect().scale(0, 0.6);

  yield* waitUntil('hide scene 2');
  yield* sequence(0.4, hideScene(), matrixHeight(250, 0.7));

  yield* waitUntil('show final matrix');
  yield* all(
    ...[rotationTranslationMatrix(), rotationMatrix2(), scalingMatrix()].map(
      (matrix) => matrix.height(0, 0.7),
    ),
    combinedMatrix().height(matrixHeight, 0.7),
  );

  yield* waitUntil('show formula part');
  yield* formulaPart().height(64, 0.7);

  yield* waitUntil('highlight theta');
  yield* all(
    highlightRect().position([-318, -2], 0),
    highlightRect().size([70, 86], 0),
    highlightRect().scale(1, 0.7),
  );

  yield* waitUntil('hide highlight');
  yield* highlightRect().scale(0, 0.6);

  yield* waitUntil('enter hero');
  let heroAnimation = yield hero().loop('walk');
  yield* hero().position.x(-700, 1.5, linear);
  cancel(heroAnimation);
  heroAnimation = yield hero().loop('idle');

  yield* waitUntil('show question marks');
  yield* sequence(
    0.1,
    ...questionMarks()
      .children()
      .map((node) => node.scale(1, 0.6, easeOutBack)),
  );

  yield* waitUntil('hide question marks');
  yield* sequence(
    0.1,
    ...questionMarks()
      .children()
      .map((node) => node.scale(0, 0.6, easeInBack)),
  );

  yield* waitUntil('exit hero');
  cancel(heroAnimation);
  hero().scale([-8, 8]);
  heroAnimation = yield hero().loop('walk');
  yield* hero().position.x(-1100, 1.5, linear);
  cancel(heroAnimation);

  yield* waitUntil('scene end');
});
