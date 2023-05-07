import {
  CacheRectCollider,
  KinematicBody,
  PolygonCollider,
  StaticBody,
  World,
} from '@ksassnowski/motion-canvas-components';

import { makeScene2D } from '@motion-canvas/2d';
import { Img, Latex, Rect } from '@motion-canvas/2d/lib/components';
import { waitUntil } from '@motion-canvas/core/lib/flow';
import { Origin, Vector2 } from '@motion-canvas/core/lib/types';
import { createRef, useRandom } from '@motion-canvas/core/lib/utils';

import justGoboSprite from '../assets/just_gobo.png';
import { AnimatedSprite, Blood, SimpleFormula } from '../components';

export default makeScene2D(function* (view) {
  const world = createRef<World>();
  const tex = createRef<Latex>();
  const blood = createRef<AnimatedSprite>();
  const random = useRandom();

  yield view.add(
    <>
      <World ref={world}>
        <StaticBody restitution={1}>
          <PolygonCollider
            vertices={() => {
              const first = tex()
                .getOriginDelta(Origin.Left)
                .add(Vector2.left.scale(10));
              const second = first.add(Vector2.down.scale(15));
              const third = second.add(Vector2.right.scale(300));
              return [first, second, third];
            }}
          >
            <SimpleFormula ref={tex} height={180} />
          </PolygonCollider>
        </StaticBody>

        <StaticBody x={-960} restitution={0.85}>
          <CacheRectCollider>
            <Rect width={4} height={1080} />
          </CacheRectCollider>
        </StaticBody>

        <StaticBody position={[-560, 540]} restitution={0.6}>
          <CacheRectCollider>
            <Rect height={4} width={600} />
          </CacheRectCollider>
        </StaticBody>

        <KinematicBody
          mass={3}
          restitution={0.9}
          position={[-500, -700]}
          angularVelocity={-4}
        >
          <CacheRectCollider expand={32}>
            <Img src={justGoboSprite} scale={8} smoothing={false} />
          </CacheRectCollider>
        </KinematicBody>
      </World>

      <Blood ref={blood} scale={3} position={[500, -120]} opacity={0} />
    </>,
  );

  yield world().simulate(Infinity);

  yield* waitUntil('blood');
  blood().opacity(1);
  yield* blood().playOnce('default');

  yield* waitUntil('blood 2');
  blood().position([random.nextInt(-600, 600), random.nextInt(-400, 400)]);
  yield* blood().playOnce('default');

  yield* waitUntil('blood 3');
  blood().position([random.nextInt(-600, 600), random.nextInt(-400, 400)]);
  yield* blood().playOnce('default');

  yield* waitUntil('scene end');
});
