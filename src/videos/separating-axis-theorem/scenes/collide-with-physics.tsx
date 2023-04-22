import {
  CacheRectCollider,
  KinematicBody,
  World,
} from '@ksassnowski/motion-canvas-components';

import { makeScene2D } from '@motion-canvas/2d';
import { Rect, Txt } from '@motion-canvas/2d/lib/components';
import { waitUntil } from '@motion-canvas/core/lib/flow';
import { Vector2 } from '@motion-canvas/core/lib/types';
import { createRef } from '@motion-canvas/core/lib/utils';

import theme from '@theme';

export default makeScene2D(function* (view) {
  view.fontFamily('Operator Mono');

  const world = createRef<World>();
  const rectA = createRef<KinematicBody>();
  const rectB = createRef<KinematicBody>();

  view.add(
    <World ref={world} gravity={0}>
      <KinematicBody ref={rectA} mass={0.3} friction={280} x={-200}>
        <CacheRectCollider>
          <Rect
            width={400}
            height={290}
            fill={theme.colors.Red}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <Txt text={'A'} fill={theme.colors.White} fontSize={72} />
          </Rect>
        </CacheRectCollider>
      </KinematicBody>

      <KinematicBody ref={rectB} x={400} friction={280} mass={0.3}>
        <CacheRectCollider>
          <Rect
            ref={rectB}
            width={500}
            height={320}
            fill={theme.colors.Blue1}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <Txt text={'B'} fill={theme.colors.White} fontSize={72} />
          </Rect>
        </CacheRectCollider>
      </KinematicBody>
    </World>,
  );

  rectA().applyForce(Vector2.right.scale(300));
  rectB().applyForce(Vector2.left.scale(300));
  yield* world().simulate(1.5);

  rectA().applyForce(Vector2.right.scale(1500));
  yield* world().simulate(1.5);

  yield* waitUntil('comedic-pause');
  rectB().position.x(1220);
  rectB().applyForce(Vector2.left.scale(4500));
  yield* world().simulate(1.5);
});
