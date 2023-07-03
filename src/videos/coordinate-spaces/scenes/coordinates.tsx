import { Circle, Rect, makeScene2D } from '@motion-canvas/2d';
import { Ray } from '@motion-canvas/2d/lib/components';
import {
  DEFAULT,
  Vector2,
  createRef,
  easeInBack,
  easeOutBack,
  sequence,
  waitUntil,
} from '@motion-canvas/core';
import { all } from '@motion-canvas/core/lib/flow';

import { translate } from '@common/utils';

import theme from '@theme';

import {
  CircleObject,
  Coordinates,
  RectObject,
  SceneContainer,
  Transform,
  Vector,
} from '../components';

export default makeScene2D(function* (view) {
  const scene = createRef<SceneContainer>();
  const rect = createRef<Rect>();
  const rectCoords = createRef<Coordinates>();
  const rectCoords2 = createRef<Coordinates>();
  const circle = createRef<Circle>();
  const circleCoords = createRef<Coordinates>();
  const localPosVector = createRef<Ray>();
  const localPosCoordinates = createRef<Coordinates>();
  const originDot = createRef<Circle>();
  const originCoordinates = createRef<Coordinates>();
  const transform = createRef<Transform>();

  view.add(
    <>
      <SceneContainer ref={scene} width={2000} height={1200} showAxis>
        <RectObject ref={rect} position={[-400, 200]} scale={0}>
          <Coordinates
            ref={rectCoords}
            coordinates={() => rect().position()}
            scale={0}
            y={80}
          />
        </RectObject>

        <CircleObject ref={circle} scale={0} position={() => rect().position()}>
          <Coordinates
            ref={circleCoords}
            coordinates={() => circle().position()}
            scale={0}
            y={80}
          />
        </CircleObject>

        <Vector
          ref={localPosVector}
          from={() => rect().position()}
          to={() => circle().position()}
          end={0}
        />

        <Circle ref={originDot} size={20} fill={theme.colors.White} scale={0} />
        <Coordinates
          ref={originCoordinates}
          coordinates={0}
          position={[-60, -40]}
          scale={0}
        />

        <Coordinates
          ref={localPosCoordinates}
          coordinates={[300, -200]}
          scale={0}
          opacity={0}
          right={() => {
            return localPosVector()
              .getPointAtPercentage(0.6)
              .position.add(Vector2.left.scale(50));
          }}
          xColor={theme.colors.Gray1}
          yColor={theme.colors.Gray1}
        />
      </SceneContainer>

      <Coordinates
        ref={rectCoords2}
        coordinates={200}
        scale={0}
        position={[750, -450]}
      />

      <Transform ref={transform} node={scene} end={0} />
    </>,
  );

  yield* waitUntil('show rect');
  yield* rect().scale(1, 0.6, easeOutBack);

  yield* waitUntil('show rect coords');
  yield* rectCoords().show();

  yield* waitUntil('show circle');
  yield* circle().scale(1, 0.5, easeOutBack);
  circleCoords().scale(1);

  yield* waitUntil('move circle x');
  yield* translate(circle(), [300, 0], 0.8);
  // Hack around a weird bug where the coordinates would be visible while the
  // vector's length is 0, even if its scale is set to 0. This is a bug caused
  // by Jacob's lack of skill.
  localPosCoordinates().opacity(1);

  yield* waitUntil('move circle y');
  yield* translate(circle(), [0, -200], 0.8);

  yield* waitUntil('show vector');
  yield* localPosVector().end(1, 0.8);

  yield* waitUntil('show local pos');
  yield* localPosCoordinates().show();

  yield* waitUntil('hide objects');
  yield* sequence(
    0.1,
    localPosCoordinates().hide(),
    localPosVector().end(0, 0.6),
    circle().scale(0, 0.6, easeInBack),
    rect().scale(0, 0.6, easeInBack),
  );

  yield* waitUntil('show circle 2');
  circle().fill(theme.colors.White).size(20).position([100, 200]);
  circleCoords().position.y(40);
  yield* circle().scale(1, 0.6, easeOutBack);

  yield* waitUntil('show origin');
  yield* sequence(
    0.1,
    originDot().scale(1, 0.6, easeOutBack),
    originCoordinates().show(),
  );

  yield* waitUntil('clear scene');
  yield* sequence(
    0.1,
    circle().scale(0, 0.6, easeInBack),
    circleCoords().hide(),
    originDot().scale(0, 0.6, easeInBack),
    originCoordinates().hide(),
    scene().gridStroke(theme.colors.Gray5, 0.7),
    scene().axisStroke(theme.colors.Gray5, 0.7),
  );

  yield* waitUntil('show rect 2');
  scene().size([3000, 3000]).position([-200, -200]).rotation(20).scale(1.5);
  rectCoords().scale(0);
  rect()
    .size(60)
    .position(Vector2.zero.transformAsPoint(scene().localToParent().inverse()))
    .rotation(-20);
  yield* rect().scale(1, 0.6, easeOutBack);

  yield* waitUntil('show rect coords 2');
  yield* rectCoords2().show();

  yield* waitUntil('show origin 2');
  yield* originDot().scale(0.5, 0.6, easeOutBack);

  yield* waitUntil('move rect to origin');
  yield* rect().position(0, 1);

  yield* waitUntil('show transform');
  yield* all(originDot().scale(0, 0.6), transform().end(1, 0.6));

  yield* waitUntil('show axis');
  yield* scene().axisStroke(DEFAULT, 0.7);

  yield* waitUntil('rotate rect');
  yield* all(rect().rotation(0, 1));

  yield* waitUntil('show grid');
  yield* scene().gridStroke(DEFAULT, 0.7);

  yield* waitUntil('position rect');
  yield* rect().position.x(200, 0.7);
  yield* sequence(
    0.1,
    rect().position.y(200, 0.7),
    all(
      rectCoords2().fontSize(28, 1),
      rectCoords2().position(
        () =>
          new Vector2(200, 200)
            .transformAsPoint(scene().localToParent())
            .add(Vector2.up.scale(70)),
        1,
      ),
    ),
  );

  yield* waitUntil('position scene');
  yield* scene().position(0, 0.8);

  yield* waitUntil('rotate scene');
  yield* scene().rotation(0, 0.8);

  yield* waitUntil('scale scene');
  yield* scene().scale(1, 0.8);

  yield* waitUntil('hide scene');
  yield* sequence(
    0.15,
    transform().scale(0, 0.7, easeInBack),
    rectCoords2().hide(),
    rect().scale(0, 0.8, easeInBack),
    scene().scale(0, 0.8),
  );

  yield* waitUntil('scene end');
});
