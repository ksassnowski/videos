import {
  Circle,
  Latex,
  Layout,
  Line,
  Ray,
  Rect,
  Txt,
  makeScene2D,
} from '@motion-canvas/2d';
import {
  Vector2,
  all,
  createRef,
  easeInBack,
  easeOutBack,
  sequence,
  waitUntil,
} from '@motion-canvas/core';

import { texColor, translate } from '@common/utils';

import theme from '@theme';

import {
  SceneContainer,
  SceneContainerProps,
  SimpleFormula,
  TranslationMatrixFormula,
} from '../components';
import { swapNodes } from '../utils';

const matrix2x3aTex = `
\\begin{bmatrix}
a & b & c \\\\ 
d & e & f
\\end{bmatrix}
`;

const matrix2x3bTex = `
\\begin{bmatrix}
g & h & i \\\\ 
j & k & l
\\end{bmatrix}
`;

const resultMatrixTex = `
\\begin{bmatrix}
R_x + P_x \\\\
R_y + P_y \\\\
1
\\end{bmatrix}
`;

export default makeScene2D(function* (view) {
  const simpleFormula = createRef<Latex>();
  const matrixFormula = createRef<Latex>();
  const operatorTex = createRef<Latex>();
  const sceneLabelTex = createRef<Latex>();
  const sceneContainers = createRef<Layout>();
  const relativePosScene = createRef<SceneContainer>();
  const relativePosLine = createRef<Line>();
  const highlightRect = createRef<Rect>();
  const matrixLabel = createRef<Txt>();
  const matrix2x3a = createRef<Latex>();
  const matrix2x3b = createRef<Latex>();
  const resultMatrix = createRef<Latex>();
  const line = createRef<Ray>();
  const notDefinedText = createRef<Txt>();

  const position = Vector2.createSignal(0);
  const relativePosition = Vector2.createSignal([100, -50]);

  const sceneContainerStyles: SceneContainerProps = {
    gridSpacing: 25,
    lineWidth: 0,
    padding: 0,
    showAxis: true,
  };

  const showScenes = () =>
    sequence(
      0.08,
      ...sceneContainers()
        .children()
        .map((node) => node.scale(1, 1, easeOutBack)),
    );

  const hideScenes = () =>
    sequence(
      0.05,
      ...sceneContainers()
        .children()
        .map((node) => node.scale(0, 0.8, easeInBack)),
    );

  function* moveInput() {
    yield* position([50, 50], 1).to([-200, 0], 1).to([125, -40], 1);
    yield* relativePosition([-25, -125], 1).to([0, 125], 1).to([-150, -35], 1);
  }

  yield view.add(
    <>
      <SimpleFormula ref={simpleFormula} height={180} />

      <Txt
        ref={matrixLabel}
        text={'2D Transformation Matrix'}
        fontFamily={theme.fonts.mono}
        fill={theme.colors.Green1}
        position={[260, -230]}
        scale={0}
      />

      <Txt
        ref={notDefinedText}
        text={'Not defined'}
        fontFamily={theme.fonts.mono}
        fill={theme.colors.Red}
        fontSize={64}
        y={-230}
        scale={0}
      />

      <Rect
        ref={highlightRect}
        stroke={theme.colors.Green1}
        fill={`${theme.colors.Green1}31`}
        lineWidth={4}
        radius={8}
        zIndex={-1}
        x={257}
        size={[390, 320]}
        smoothCorners
        scale={0}
      />

      <Layout alignItems={'center'} layout>
        <Latex
          ref={matrix2x3a}
          tex={texColor(matrix2x3aTex, theme.colors.White)}
          height={0}
        />
        <Latex
          ref={matrix2x3b}
          tex={texColor(matrix2x3bTex, theme.colors.White)}
          height={0}
        />
      </Layout>

      <Latex
        ref={resultMatrix}
        tex={texColor(`= ${resultMatrixTex}`, theme.colors.White)}
        height={280}
        position={200}
        opacity={0}
      />

      <Ray
        ref={line}
        from={() => matrix2x3a().bottomLeft()}
        to={() => matrix2x3b().topRight()}
        lineWidth={16}
        stroke={theme.colors.Red}
        end={0}
      />

      <TranslationMatrixFormula
        ref={matrixFormula}
        height={280}
        position={() => simpleFormula().position().add([58, 0])}
        scale={0}
      />

      <Layout ref={sceneContainers} y={180} gap={60} layout>
        <Layout direction={'column'} gap={32} alignItems={'center'} scale={0}>
          <Latex tex={texColor('P', theme.colors.White)} height={40} />

          <SceneContainer width={500} height={375} {...sceneContainerStyles}>
            <Circle position={position} size={20} fill={theme.colors.Blue1} />
          </SceneContainer>
        </Layout>

        <Layout scale={0}>
          <Latex
            ref={operatorTex}
            tex={texColor('+', theme.colors.White)}
            width={40}
            y={35}
            layout={false}
          />
        </Layout>

        <Layout direction={'column'} gap={32} alignItems={'center'} scale={0}>
          <Latex
            ref={sceneLabelTex}
            tex={texColor('R', theme.colors.White)}
            height={40}
          />

          <SceneContainer
            ref={relativePosScene}
            width={500}
            height={375}
            {...sceneContainerStyles}
          >
            <Line
              ref={relativePosLine}
              points={() => [[0, 0], relativePosition()]}
              lineWidth={3}
              stroke={theme.colors.White}
              arrowSize={12}
              endArrow
            />
          </SceneContainer>
        </Layout>

        <Layout scale={0}>
          <Latex
            tex={texColor('=', theme.colors.White)}
            width={40}
            y={35}
            layout={false}
          />
        </Layout>

        <Layout direction={'column'} gap={32} alignItems={'center'} scale={0}>
          <Latex tex={texColor('P + R', theme.colors.White)} height={40} />

          <SceneContainer width={500} height={375} {...sceneContainerStyles}>
            <Circle
              size={20}
              fill={theme.colors.Red}
              position={() => position().add(relativePosition())}
            />
          </SceneContainer>
        </Layout>
      </Layout>
    </>,
  );

  yield* waitUntil('show scenes');
  yield* sequence(0.3, simpleFormula().position.y(-300, 0.8), showScenes());

  yield* waitUntil('move input');
  yield* moveInput();

  yield* waitUntil('hide scenes');
  yield* sequence(0.55, hideScenes(), simpleFormula().position.y(0, 1));

  yield* waitUntil('show matrix');
  yield* sequence(
    0.75,
    swapNodes(simpleFormula, matrixFormula),
    sequence(
      0.2,
      highlightRect().scale(1, 0.7, easeOutBack),
      matrixLabel().scale(1, 0.7, easeOutBack),
    ),
  );

  yield* waitUntil('show 2x3');
  yield* sequence(
    0.5,
    all(
      ...[matrixLabel(), matrixFormula(), highlightRect()].map((node) =>
        translate(node, [0, 800], 0.6),
      ),
    ),
    matrix2x3a().height(220, 0.7, easeOutBack),
  );
  matrixLabel().scale(0);

  yield* waitUntil('show 2x3 b');
  yield* matrix2x3b().height(220, 0.7, easeOutBack);

  yield* waitUntil('not defined');
  yield* all(
    line().end(1, 0.6),
    notDefinedText().scale(1, 0.7, easeOutBack),
    matrix2x3a().opacity(0.3, 0.7),
    matrix2x3b().opacity(0.3, 0.7),
  );

  yield* waitUntil('reset');
  highlightRect().scale(0);
  yield* sequence(
    0.3,
    all(
      line().end(0, 0.5),
      notDefinedText().scale(0, 0.5),
      matrix2x3a().height(0, 0.5),
      matrix2x3b().height(0, 0.5),
    ),
    all(
      ...[matrixLabel(), matrixFormula(), highlightRect()].map((node) =>
        translate(node, [0, -800], 0.6),
      ),
    ),
  );

  yield* waitUntil('highlight vector');
  highlightRect().width(180);
  highlightRect().position.x(565);
  yield* highlightRect().scale(1, 0.7, easeOutBack);

  yield* waitUntil('highlight z');
  yield* all(
    highlightRect().size([74, 100], 0.7),
    highlightRect().position.y(100, 0.7),
  );

  yield* waitUntil('hide highlight');
  yield* highlightRect().scale(0, 0.6, easeInBack);

  yield* waitUntil('show result');
  yield* all(
    matrixFormula().position.y(-170, 0.7),
    resultMatrix().position.y(100, 0).to(170, 0.7),
    resultMatrix().opacity(1, 0.7),
  );

  yield* waitUntil('hide formula');
  yield* all(
    matrixFormula().scale(0, 0.7, easeInBack),
    resultMatrix().scale(0, 0.7, easeInBack),
  );
});
