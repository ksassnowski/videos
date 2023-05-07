import { makeScene2D } from '@motion-canvas/2d';
import { Circle, Latex, Layout, Line } from '@motion-canvas/2d/lib/components';
import { all, sequence, waitUntil } from '@motion-canvas/core/lib/flow';
import { easeInBack, easeOutBack } from '@motion-canvas/core/lib/tweening';
import { Direction, Vector2 } from '@motion-canvas/core/lib/types';
import { createRef, finishScene } from '@motion-canvas/core/lib/utils';

import { texColor } from '@common/utils';

import theme from '@theme';

import {
  SceneContainer,
  SceneContainerProps,
  SimpleFormula,
  TranslationMatrixFormula,
  translationMatrixTex,
} from '../components';

export default makeScene2D(function* (view) {
  const simpleFormula = createRef<Latex>();
  const matrixFormula = createRef<Latex>();
  const operatorTex = createRef<Latex>();
  const sceneLabelTex = createRef<Latex>();
  const sceneContainers = createRef<Layout>();
  const relativePosScene = createRef<SceneContainer>();
  const relativePosLine = createRef<Line>();

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

      <TranslationMatrixFormula
        ref={matrixFormula}
        height={280}
        position={() => simpleFormula().position().add([58, 0])}
        opacity={0}
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
  yield* all(matrixFormula().opacity(1, 0.7), simpleFormula().opacity(0, 1));

  yield* waitUntil('show scenes 2');
  operatorTex().tex(texColor('\\times', theme.colors.White));
  sceneLabelTex()
    .height(100)
    .margin([-60, 0, 0, 0])
    .tex(texColor(translationMatrixTex, theme.colors.White));
  relativePosLine().end(0);
  relativePosScene().origin(relativePosition);
  sceneContainers().position([0, 200]);
  relativePosition([100, -50]);
  position(0);
  yield* sequence(0.3, matrixFormula().position.y(-300, 0.8), showScenes());

  yield* waitUntil('move input 2');
  yield* moveInput();

  yield* waitUntil('hide scenes 2');
  yield* sequence(0.55, hideScenes(), matrixFormula().position.y(0, 1));

  yield* waitUntil('hide formula');
  yield* matrixFormula().scale(0, 0.8, easeInBack);
});
