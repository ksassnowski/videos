import { makeScene2D } from '@motion-canvas/2d';
import {
  Latex,
  LatexProps,
  Layout,
  LayoutProps,
  Node,
} from '@motion-canvas/2d/lib/components';
import { all, delay, sequence, waitUntil } from '@motion-canvas/core/lib/flow';
import {
  Computed,
  SignalValue,
  createComputed,
  createSignal,
  isReactive,
} from '@motion-canvas/core/lib/signals';
import { slideTransition } from '@motion-canvas/core/lib/transitions';
import { easeInBack } from '@motion-canvas/core/lib/tweening';
import { Direction, Matrix2D, Vector2 } from '@motion-canvas/core/lib/types';
import { createRef } from '@motion-canvas/core/lib/utils';

import { texColor } from '@common/utils';

import theme from '@theme';

import {
  CircleObject,
  SceneContainer,
  SceneContainerProps,
  localToParentFormula,
  rotationMatrixTex,
  scalingMatrixTex,
  translationMatrixTex,
} from '../components';

function createPositionSignal(
  translation: SignalValue<Vector2> = Vector2.zero,
  rotation: SignalValue<number> = 0,
  scale: SignalValue<Vector2> = Vector2.one,
): Computed<Vector2> {
  return createComputed(() => {
    const parsedTranslation = isReactive(translation)
      ? translation()
      : translation;
    const parsedRotation = isReactive(rotation) ? rotation() : rotation;
    const parsedScale = isReactive(scale) ? scale() : scale;

    const cos = Math.cos((parsedRotation * Math.PI) / 180);
    const sin = Math.sin((parsedRotation * Math.PI) / 180);
    const matrix = new Matrix2D(
      parsedScale.x * cos,
      parsedScale.y * sin,
      -parsedScale.x * sin,
      parsedScale.y * cos,
      0,
      0,
    );
    return parsedTranslation.transformAsPoint(matrix.domMatrix);
  });
}

export default makeScene2D(function* (view) {
  const formula = createRef<Latex>();
  const translationMatrix = createRef<Latex>();
  const scalingMatrix = createRef<Latex>();
  const rotationMatrix = createRef<Latex>();
  const layoutGroup = createRef<Node>();
  const translationScene = createRef<SceneContainer>();
  const scalingScene = createRef<SceneContainer>();
  const rotationScene = createRef<SceneContainer>();

  const sceneStyles: SceneContainerProps = {
    showAxis: true,
    lineWidth: 0,
    width: 580,
    height: 400,
    gridSpacing: 25,
  };

  const layoutStyles: LayoutProps = {
    direction: 'column',
    alignItems: 'center',
    gap: 40,
    layout: true,
    x: -630,
    scale: 0,
  };

  const latexStyles: LatexProps = {
    height: 115,
    scale: 0,
  };

  const translation = Vector2.createSignal();
  const scaling = Vector2.createSignal(1);
  const rotation = createSignal(0);

  yield view.add(
    <>
      <Latex
        ref={formula}
        tex={texColor(localToParentFormula, theme.colors.White)}
        y={-700}
        scale={0}
        height={250}
      />

      <Node ref={layoutGroup} y={-50}>
        <Layout ref={translationScene} {...layoutStyles}>
          <Latex
            ref={translationMatrix}
            tex={texColor(translationMatrixTex, theme.colors.White)}
            {...latexStyles}
          />

          <SceneContainer {...sceneStyles}>
            <CircleObject
              position={() => {
                const position = createPositionSignal(
                  new Vector2(50, -50),
                  rotation,
                  scaling,
                );
                return position().add(translation());
              }}
              scale={() => scaling().scale(0.5)}
            />
          </SceneContainer>
        </Layout>

        <Layout ref={rotationScene} {...layoutStyles}>
          <Latex
            ref={rotationMatrix}
            tex={texColor(rotationMatrixTex, theme.colors.White)}
            {...latexStyles}
          />

          <SceneContainer {...sceneStyles}>
            <CircleObject
              position={createPositionSignal(
                new Vector2(50, -50),
                rotation,
                scaling,
              )}
              scale={() => scaling().scale(0.5)}
            />
          </SceneContainer>
        </Layout>

        <Layout ref={scalingScene} {...layoutStyles}>
          <Latex
            ref={scalingMatrix}
            tex={texColor(scalingMatrixTex, theme.colors.White)}
            {...latexStyles}
            scale={1}
          />

          <SceneContainer {...sceneStyles}>
            <CircleObject
              position={createPositionSignal(new Vector2(50, -50), 0, scaling)}
              scale={() => scaling().scale(0.5)}
            />
          </SceneContainer>
        </Layout>
      </Node>
    </>,
  );

  yield* slideTransition(Direction.Bottom, 0.9);

  yield* waitUntil('show scaling scene');
  yield* scalingScene().scale(1, 0.6);

  yield* waitUntil('show scaling');
  yield* scaling(1.5, 0.8);

  yield* waitUntil('show rotation');
  rotationScene().scale(1);
  rotationScene().position(scalingScene().position());
  yield* sequence(
    0.2,
    rotationScene().position.x(scalingScene().position.x() + 630, 0.7),
    rotationMatrix().scale(1, 0.6),
    delay(0.1, rotation(60, 0.7)),
  );

  yield* waitUntil('show translation');
  translationScene().scale(1);
  translationScene().position(rotationScene().position());
  yield* sequence(
    0.2,
    translationScene().position.x(rotationScene().position.x() + 630, 0.7),
    translationMatrix().scale(1, 0.6),
    delay(0.1, translation([50, 100], 0.8)),
  );

  yield* waitUntil('show formula');
  formula().scale(1);
  yield* all(formula().position.y(-350, 1), layoutGroup().position.y(150, 1));

  yield* waitUntil('hide scene');
  yield* sequence(
    0.1,
    formula().scale(0, 0.6, easeInBack),
    ...layoutGroup()
      .children()
      .map((node) => node.scale(0, 0.6, easeInBack)),
  );

  yield* waitUntil('scene end');
});
